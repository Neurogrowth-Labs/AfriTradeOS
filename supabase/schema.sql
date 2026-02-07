
-- =============================================================================
-- AFRITRADE OS - FIX SIGNUP ERROR (SAFE MODE)
-- =============================================================================

-- 1. DROP EVERYTHING RELATED TO THE TRIGGER TO ENSURE A CLEAN SLATE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. ENSURE TABLES AND TYPES EXIST
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE public.user_persona AS ENUM (
        'SME Exporter', 'Enterprise Exporter', 'Importer', 'Customs Authority',
        'Logistics Provider', 'Bank / Insurer', 'Government Agency', 
        'Trade Analyst', 'Platform Admin'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    country TEXT DEFAULT 'Ghana',
    role public.user_persona DEFAULT 'SME Exporter'::public.user_persona,
    organization_id UUID,
    company_name TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. CREATE THE "SAFE MODE" TRIGGER FUNCTION
-- This function is designed to NEVER fail the transaction.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  BEGIN
    -- Attempt to create the profile
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      country,
      company_name,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      -- Default to SME Exporter to avoid Enum casting errors during raw signup
      'SME Exporter'::public.user_persona,
      'Ghana',
      '',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = NOW();
      
  EXCEPTION WHEN OTHERS THEN
    -- CRITICAL: Catch ALL errors. Do NOT let the signup fail.
    -- Log the error to Postgres logs so we can see it, but return NEW to allow Auth.
    RAISE WARNING 'Profile creation failed for User ID %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 4. RE-BIND THE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. RESET POLICIES (Fixes "Permission denied" errors during onboarding)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile (Critical for fallback if trigger fails)
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (Critical for Onboarding flow)
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 6. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- =============================================================================
-- PHASE 1.2: AUDIT LOGGING TABLES
-- =============================================================================

-- Drop and recreate audit_logs to ensure correct schema
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    status TEXT DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- =============================================================================
-- PHASE 1.2: DOCUMENT STORAGE SCHEMA
-- =============================================================================

-- Drop existing types if they exist (must drop dependent tables first)
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.document_status CASCADE;

CREATE TYPE public.document_type AS ENUM (
    'identity_document', 'business_registration', 'tax_certificate',
    'trade_license', 'certificate_of_origin', 'bill_of_lading',
    'commercial_invoice', 'packing_list', 'customs_declaration',
    'insurance_certificate', 'bank_statement', 'other'
);

CREATE TYPE public.document_status AS ENUM (
    'pending', 'under_review', 'approved', 'rejected', 'expired'
);

CREATE TABLE public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,
    document_type public.document_type NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    status public.document_status DEFAULT 'pending',
    verification_notes TEXT,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);

-- =============================================================================
-- PHASE 2: ORGANIZATIONS TABLE
-- =============================================================================

-- Drop existing types if they exist (must drop dependent tables first)
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TYPE IF EXISTS public.organization_type CASCADE;
DROP TYPE IF EXISTS public.verification_status CASCADE;

CREATE TYPE public.organization_type AS ENUM (
    'buyer', 'seller', 'logistics', 'legal', 'finance', 'government', 'institution'
);

CREATE TYPE public.verification_status AS ENUM (
    'unverified', 'pending', 'verified', 'suspended', 'rejected'
);

CREATE TABLE public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type public.organization_type NOT NULL,
    registration_number TEXT,
    tax_id TEXT,
    country TEXT NOT NULL,
    city TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    logo_initial TEXT,
    description TEXT,
    verification_status public.verification_status DEFAULT 'unverified',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    rating NUMERIC(2,1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_country ON organizations(country);
CREATE INDEX idx_organizations_verification ON organizations(verification_status);

-- Add foreign key to profiles for organization (drop first if exists)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS fk_profiles_organization;
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- =============================================================================
-- PHASE 2.2: KYC/KYB VERIFICATION TABLES
-- =============================================================================

-- Drop existing enum if exists (must drop dependent tables first)
DROP TABLE IF EXISTS public.kyc_requests CASCADE;
DROP TYPE IF EXISTS public.kyc_status CASCADE;

CREATE TYPE public.kyc_status AS ENUM (
    'not_started', 'documents_pending', 'under_review', 
    'approved', 'rejected', 'expired'
);

CREATE TABLE public.kyc_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('kyc', 'kyb')),
    status public.kyc_status DEFAULT 'not_started',
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    rejection_reason TEXT,
    risk_score INTEGER,
    documents_required TEXT[],
    documents_submitted UUID[],
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kyc_user ON kyc_requests(user_id);
CREATE INDEX idx_kyc_org ON kyc_requests(organization_id);
CREATE INDEX idx_kyc_status ON kyc_requests(status);

-- =============================================================================
-- PHASE 2.2: VERIFICATION NOTIFICATIONS
-- =============================================================================

-- Drop existing type if exists
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;

CREATE TYPE public.notification_type AS ENUM (
    'kyc_submitted', 'kyc_approved', 'kyc_rejected', 'kyc_expired',
    'document_uploaded', 'document_approved', 'document_rejected',
    'trade_created', 'trade_updated', 'trade_completed',
    'payment_received', 'payment_sent', 'system_alert'
);

CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- =============================================================================
-- PHASE 2.3: LICENSES AND CERTIFICATIONS
-- =============================================================================

DROP TABLE IF EXISTS public.licenses CASCADE;

CREATE TABLE public.licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    license_type TEXT NOT NULL,
    license_number TEXT NOT NULL,
    issuing_authority TEXT NOT NULL,
    issuing_country TEXT NOT NULL,
    issued_at DATE NOT NULL,
    expires_at DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'suspended')),
    document_id UUID REFERENCES public.documents(id),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_licenses_org ON licenses(organization_id);
CREATE INDEX idx_licenses_user ON licenses(user_id);
CREATE INDEX idx_licenses_status ON licenses(status);

-- =============================================================================
-- RLS POLICIES FOR NEW TABLES
-- =============================================================================

-- Audit Logs: Only admins can view all, users can view their own
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
    );

-- Documents: Users can manage their own documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;

CREATE POLICY "Users can view their own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

-- Organizations: Public read, authenticated write
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Creators can update their organizations" ON public.organizations;

CREATE POLICY "Anyone can view organizations" ON public.organizations
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create organizations" ON public.organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their organizations" ON public.organizations
    FOR UPDATE USING (auth.uid() = created_by);

-- KYC Requests: Users can view their own
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own KYC requests" ON public.kyc_requests;
DROP POLICY IF EXISTS "Users can create their own KYC requests" ON public.kyc_requests;

CREATE POLICY "Users can view their own KYC requests" ON public.kyc_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KYC requests" ON public.kyc_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: Users can only see their own
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Licenses: Users can view their own, public for verified
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own licenses" ON public.licenses;
DROP POLICY IF EXISTS "Anyone can view verified licenses" ON public.licenses;
DROP POLICY IF EXISTS "Users can create their own licenses" ON public.licenses;

CREATE POLICY "Users can view their own licenses" ON public.licenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified licenses" ON public.licenses
    FOR SELECT USING (verified = TRUE);

CREATE POLICY "Users can create their own licenses" ON public.licenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- PHASE 2.4: FINANCIERS TABLE (Trade Finance Providers)
-- =============================================================================

DROP TABLE IF EXISTS public.financiers CASCADE;

CREATE TABLE public.financiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Bank', 'DFI', 'Insurer', 'Fintech')),
    product TEXT NOT NULL,
    interest_rate NUMERIC(5,2),
    term TEXT,
    min_score INTEGER DEFAULT 60,
    logo_initial TEXT,
    country TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default financiers
INSERT INTO public.financiers (name, type, product, interest_rate, term, min_score, logo_initial) VALUES
('Ecobank', 'Bank', 'Letter of Credit', 2.5, '90 Days', 70, 'E'),
('Afreximbank', 'DFI', 'Trade Guarantee', 1.8, '180 Days', 80, 'A'),
('Allianz', 'Insurer', 'Credit Insurance', 0.9, 'Annual', 60, 'AL'),
('Standard Bank', 'Bank', 'Export Finance', 3.2, '120 Days', 75, 'SB'),
('TDB', 'DFI', 'Trade Loan', 2.0, '90 Days', 70, 'TDB');

ALTER TABLE public.financiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view financiers" ON public.financiers;
CREATE POLICY "Anyone can view financiers" ON public.financiers FOR SELECT USING (is_active = TRUE);

-- =============================================================================
-- PHASE 3: MARKETPLACE & PROCUREMENT MODULE
-- =============================================================================

-- 3.1 Products Table
DROP TABLE IF EXISTS public.products CASCADE;

CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    hs_code TEXT,
    category TEXT,
    origin_country TEXT,
    price NUMERIC,
    currency TEXT DEFAULT 'USD',
    unit TEXT DEFAULT 'ton',
    min_order_quantity NUMERIC,
    max_order_quantity NUMERIC,
    lead_time_days INTEGER,
    images TEXT[],
    specifications JSONB DEFAULT '{}',
    certifications TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_hs_code ON products(hs_code);
CREATE INDEX idx_products_active ON products(is_active);

-- 3.2 Wishlist/Saved Items
DROP TABLE IF EXISTS public.wishlist CASCADE;

CREATE TABLE public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE UNIQUE INDEX idx_wishlist_unique ON wishlist(user_id, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'), COALESCE(product_id, '00000000-0000-0000-0000-000000000000'));

-- 3.3 Tenders/RFQ Schema
DROP TYPE IF EXISTS public.tender_status CASCADE;

CREATE TYPE public.tender_status AS ENUM (
    'draft', 'published', 'closed', 'awarded', 'cancelled'
);

DROP TABLE IF EXISTS public.tenders CASCADE;

CREATE TABLE public.tenders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    hs_codes TEXT[],
    quantity NUMERIC,
    unit TEXT,
    budget_min NUMERIC,
    budget_max NUMERIC,
    currency TEXT DEFAULT 'USD',
    delivery_location TEXT,
    delivery_deadline DATE,
    submission_deadline TIMESTAMP WITH TIME ZONE,
    requirements TEXT[],
    documents UUID[],
    status public.tender_status DEFAULT 'draft',
    is_public BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    bids_count INTEGER DEFAULT 0,
    awarded_to UUID REFERENCES public.organizations(id),
    awarded_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tenders_org ON tenders(organization_id);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_deadline ON tenders(submission_deadline);

-- 3.3 Bids Table
DROP TABLE IF EXISTS public.bids CASCADE;

CREATE TABLE public.bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    delivery_days INTEGER,
    proposal TEXT,
    documents UUID[],
    status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
    score NUMERIC,
    evaluation_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bids_tender ON bids(tender_id);
CREATE INDEX idx_bids_org ON bids(organization_id);
CREATE INDEX idx_bids_status ON bids(status);

-- 3.4 Supplier Performance Tracking
DROP TABLE IF EXISTS public.supplier_ratings CASCADE;

CREATE TABLE public.supplier_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    rated_by_org UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    rated_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    trade_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    delivery_score INTEGER CHECK (delivery_score >= 1 AND delivery_score <= 5),
    communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ratings_org ON supplier_ratings(organization_id);
CREATE INDEX idx_ratings_trade ON supplier_ratings(trade_id);

-- RLS for Phase 3 Tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Org members can manage products" ON public.products;

CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Org members can manage products" ON public.products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = products.organization_id)
    );

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their wishlist" ON public.wishlist;

CREATE POLICY "Users can manage their wishlist" ON public.wishlist
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view public tenders" ON public.tenders;
DROP POLICY IF EXISTS "Org members can manage tenders" ON public.tenders;

CREATE POLICY "Anyone can view public tenders" ON public.tenders
    FOR SELECT USING (is_public = TRUE AND status = 'published');

CREATE POLICY "Org members can manage tenders" ON public.tenders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = tenders.organization_id)
    );

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tender owners can view bids" ON public.bids;
DROP POLICY IF EXISTS "Org members can manage their bids" ON public.bids;

CREATE POLICY "Tender owners can view bids" ON public.bids
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tenders t
            JOIN public.profiles p ON p.organization_id = t.organization_id
            WHERE t.id = bids.tender_id AND p.id = auth.uid()
        )
    );

CREATE POLICY "Org members can manage their bids" ON public.bids
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = bids.organization_id)
    );

ALTER TABLE public.supplier_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.supplier_ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON public.supplier_ratings;

CREATE POLICY "Anyone can view ratings" ON public.supplier_ratings
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can create ratings" ON public.supplier_ratings
    FOR INSERT WITH CHECK (auth.uid() = rated_by_user);
