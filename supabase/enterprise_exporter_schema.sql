-- =============================================================================
-- AFRITRADE OS - ENTERPRISE EXPORTER MODULE SCHEMA
-- Based on CEO Simao's Enterprise Exporter Panel Requirements #10
-- =============================================================================

-- =============================================================================
-- 1. EXPORT PROJECTS TABLE (Trade Workspace - Kanban)
-- =============================================================================
DROP TABLE IF EXISTS public.export_projects CASCADE;
DROP TYPE IF EXISTS public.project_status CASCADE;
DROP TYPE IF EXISTS public.project_priority CASCADE;

CREATE TYPE public.project_status AS ENUM (
    'planning', 'documentation', 'compliance_review', 'finance_pending',
    'production', 'quality_check', 'ready_to_ship', 'in_transit',
    'customs_clearance', 'delivered', 'completed', 'on_hold', 'cancelled'
);

CREATE TYPE public.project_priority AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TABLE public.export_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_number TEXT UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Project Details
    title TEXT NOT NULL,
    description TEXT,
    template_type TEXT, -- 'produce', 'textiles', 'goods', 'minerals'
    status public.project_status DEFAULT 'planning',
    priority public.project_priority DEFAULT 'medium',
    
    -- Trade Details
    product TEXT NOT NULL,
    hs_code TEXT,
    quantity NUMERIC,
    unit TEXT DEFAULT 'KG',
    value NUMERIC,
    currency TEXT DEFAULT 'USD',
    
    -- Origin & Destination
    origin_country TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    origin_port TEXT,
    destination_port TEXT,
    incoterm TEXT DEFAULT 'FOB',
    
    -- Dates
    target_ship_date DATE,
    actual_ship_date DATE,
    estimated_arrival DATE,
    actual_arrival DATE,
    
    -- Compliance
    afcfta_eligible BOOLEAN DEFAULT false,
    compliance_score NUMERIC DEFAULT 0,
    compliance_status TEXT DEFAULT 'pending',
    required_documents JSONB DEFAULT '[]',
    completed_documents JSONB DEFAULT '[]',
    
    -- Finance
    finance_status TEXT DEFAULT 'none', -- 'none', 'applied', 'approved', 'disbursed'
    finance_type TEXT, -- 'lc', 'guarantee', 'factoring', 'insurance'
    finance_amount NUMERIC,
    finance_provider TEXT,
    
    -- Team
    project_manager_id UUID REFERENCES public.profiles(id),
    team_members JSONB DEFAULT '[]',
    
    -- AI Insights
    ai_risk_score NUMERIC DEFAULT 0,
    ai_recommendations JSONB DEFAULT '[]',
    ai_route_optimization JSONB,
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. PROJECT DOCUMENTS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.project_documents CASCADE;
DROP TYPE IF EXISTS public.document_status CASCADE;

CREATE TYPE public.document_status AS ENUM ('draft', 'pending', 'verified', 'rejected', 'expired');

CREATE TABLE public.project_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.export_projects(id) ON DELETE CASCADE,
    
    -- Document Info
    name TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'certificate_of_origin', 'invoice', 'bill_of_lading', etc.
    file_url TEXT,
    file_size INTEGER,
    mime_type TEXT,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES public.project_documents(id),
    
    -- Status
    status public.document_status DEFAULT 'draft',
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    expiry_date DATE,
    
    -- Compliance
    compliance_checked BOOLEAN DEFAULT false,
    compliance_issues JSONB DEFAULT '[]',
    
    -- Metadata
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. PROJECT ACTIVITIES TABLE (Timeline)
-- =============================================================================
DROP TABLE IF EXISTS public.project_activities CASCADE;

CREATE TABLE public.project_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.export_projects(id) ON DELETE CASCADE,
    
    -- Activity Details
    user_id UUID REFERENCES public.profiles(id),
    user_name TEXT,
    action TEXT NOT NULL,
    detail TEXT,
    activity_type TEXT NOT NULL, -- 'trade', 'compliance', 'document', 'finance', 'system', 'ai'
    
    -- Related Entities
    related_document_id UUID REFERENCES public.project_documents(id),
    related_entity_type TEXT,
    related_entity_id UUID,
    
    -- AI Generated
    is_ai_generated BOOLEAN DEFAULT false,
    ai_confidence NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. TRADE PARTNERS TABLE (Partner Network)
-- =============================================================================
DROP TABLE IF EXISTS public.trade_partners CASCADE;
DROP TYPE IF EXISTS public.partner_type CASCADE;
DROP TYPE IF EXISTS public.verification_tier CASCADE;

CREATE TYPE public.partner_type AS ENUM (
    'supplier', 'buyer', 'distributor', 'freight_forwarder', 
    'customs_broker', 'bank', 'insurer', 'agent'
);

CREATE TYPE public.verification_tier AS ENUM ('basic', 'verified', 'trusted', 'premium');

CREATE TABLE public.trade_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id),
    
    -- Partner Info
    company_name TEXT NOT NULL,
    partner_type public.partner_type NOT NULL,
    country TEXT NOT NULL,
    city TEXT,
    address TEXT,
    
    -- Contact
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    
    -- Verification
    verification_tier public.verification_tier DEFAULT 'basic',
    kyc_verified BOOLEAN DEFAULT false,
    kyc_verified_at TIMESTAMPTZ,
    afcfta_registered BOOLEAN DEFAULT false,
    international_compliance BOOLEAN DEFAULT false,
    
    -- Ratings & Reviews
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    compliance_score NUMERIC DEFAULT 0,
    
    -- Trade History
    total_trades INTEGER DEFAULT 0,
    total_trade_value NUMERIC DEFAULT 0,
    successful_trades INTEGER DEFAULT 0,
    
    -- Sectors & Products
    sectors JSONB DEFAULT '[]',
    products JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    
    -- AI Matching
    ai_match_score NUMERIC,
    ai_recommended_for JSONB DEFAULT '[]',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. MARKET INTELLIGENCE TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.market_intelligence CASCADE;

CREATE TABLE public.market_intelligence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Market Data
    country TEXT NOT NULL,
    sector TEXT NOT NULL,
    hs_code TEXT,
    product_category TEXT,
    
    -- Trade Flows
    import_volume NUMERIC DEFAULT 0,
    export_volume NUMERIC DEFAULT 0,
    import_value NUMERIC DEFAULT 0,
    export_value NUMERIC DEFAULT 0,
    
    -- Trends
    demand_index NUMERIC DEFAULT 50, -- 0-100
    supply_index NUMERIC DEFAULT 50,
    price_trend TEXT DEFAULT 'stable', -- 'rising', 'falling', 'stable'
    price_change_percent NUMERIC DEFAULT 0,
    
    -- Tariffs & Regulations
    mfn_tariff_rate NUMERIC DEFAULT 0,
    afcfta_tariff_rate NUMERIC DEFAULT 0,
    non_tariff_barriers JSONB DEFAULT '[]',
    regulatory_requirements JSONB DEFAULT '[]',
    
    -- AI Predictions
    ai_demand_forecast JSONB, -- { '3m': 55, '6m': 60, '12m': 65 }
    ai_price_forecast JSONB,
    ai_opportunity_score NUMERIC DEFAULT 0,
    ai_risk_factors JSONB DEFAULT '[]',
    
    -- Competitors
    top_exporters JSONB DEFAULT '[]',
    top_importers JSONB DEFAULT '[]',
    market_share_data JSONB,
    
    -- Period
    period_start DATE,
    period_end DATE,
    data_source TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. FX RATES TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.fx_rates CASCADE;

CREATE TABLE public.fx_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    base_currency TEXT NOT NULL,
    quote_currency TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    
    -- Changes
    change_1d NUMERIC DEFAULT 0,
    change_1w NUMERIC DEFAULT 0,
    change_1m NUMERIC DEFAULT 0,
    
    -- Volatility
    volatility_30d NUMERIC DEFAULT 0,
    
    -- AI Hedging
    ai_hedge_recommendation TEXT,
    ai_forecast_1m NUMERIC,
    ai_forecast_3m NUMERIC,
    
    source TEXT DEFAULT 'market',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. TRADE FINANCE APPLICATIONS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.trade_finance_applications CASCADE;
DROP TYPE IF EXISTS public.finance_product_type CASCADE;
DROP TYPE IF EXISTS public.finance_app_status CASCADE;

CREATE TYPE public.finance_product_type AS ENUM (
    'letter_of_credit', 'bank_guarantee', 'export_factoring',
    'invoice_discounting', 'trade_insurance', 'working_capital'
);

CREATE TYPE public.finance_app_status AS ENUM (
    'draft', 'submitted', 'under_review', 'additional_docs_required',
    'approved', 'rejected', 'disbursed', 'repaid', 'defaulted'
);

CREATE TABLE public.trade_finance_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_number TEXT UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.export_projects(id),
    
    -- Product Details
    product_type public.finance_product_type NOT NULL,
    amount_requested NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    term_days INTEGER,
    
    -- Status
    status public.finance_app_status DEFAULT 'draft',
    
    -- Provider
    provider_id UUID,
    provider_name TEXT,
    
    -- Terms (if approved)
    approved_amount NUMERIC,
    interest_rate NUMERIC,
    fees NUMERIC,
    collateral_required JSONB,
    
    -- Risk Assessment
    ai_risk_score NUMERIC,
    ai_fraud_flags JSONB DEFAULT '[]',
    compliance_score NUMERIC,
    
    -- Timeline
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    disbursed_at TIMESTAMPTZ,
    due_date DATE,
    
    -- Documents
    required_documents JSONB DEFAULT '[]',
    submitted_documents JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. SHIPMENT TRACKING TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.shipment_tracking CASCADE;
DROP TYPE IF EXISTS public.transport_mode CASCADE;
DROP TYPE IF EXISTS public.shipment_status CASCADE;

CREATE TYPE public.transport_mode AS ENUM ('sea', 'air', 'road', 'rail', 'multimodal');
CREATE TYPE public.shipment_status AS ENUM (
    'booked', 'picked_up', 'at_origin_port', 'departed', 'in_transit',
    'at_destination_port', 'customs_hold', 'cleared', 'out_for_delivery', 'delivered'
);

CREATE TABLE public.shipment_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.export_projects(id) ON DELETE CASCADE,
    
    -- Tracking Info
    tracking_number TEXT UNIQUE,
    carrier_name TEXT,
    transport_mode public.transport_mode,
    
    -- Container/Cargo
    container_number TEXT,
    container_type TEXT,
    cargo_weight NUMERIC,
    cargo_volume NUMERIC,
    
    -- Route
    origin_port TEXT,
    destination_port TEXT,
    current_location TEXT,
    current_country TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    
    -- Status
    status public.shipment_status DEFAULT 'booked',
    status_detail TEXT,
    
    -- Dates
    booking_date DATE,
    pickup_date DATE,
    departure_date DATE,
    eta DATE,
    ata DATE,
    
    -- Risk
    risk_level TEXT DEFAULT 'low',
    risk_factors JSONB DEFAULT '[]',
    delay_probability NUMERIC DEFAULT 0,
    
    -- IoT/Sensors
    temperature NUMERIC,
    humidity NUMERIC,
    last_sensor_update TIMESTAMPTZ,
    sensor_alerts JSONB DEFAULT '[]',
    
    -- Timeline Events
    timeline JSONB DEFAULT '[]',
    
    -- AI Optimization
    ai_route_score NUMERIC,
    ai_alternative_routes JSONB,
    ai_carbon_footprint NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. TENDERS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.trade_tenders CASCADE;
DROP TYPE IF EXISTS public.tender_status CASCADE;

CREATE TYPE public.tender_status AS ENUM (
    'open', 'closing_soon', 'closed', 'awarded', 'cancelled'
);

CREATE TABLE public.trade_tenders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Tender Info
    tender_number TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Issuer
    issuer_name TEXT NOT NULL,
    issuer_country TEXT NOT NULL,
    issuer_type TEXT, -- 'government', 'corporate', 'ngo'
    
    -- Product Requirements
    product_category TEXT,
    hs_codes JSONB DEFAULT '[]',
    quantity NUMERIC,
    unit TEXT,
    specifications JSONB,
    
    -- Value
    estimated_value NUMERIC,
    currency TEXT DEFAULT 'USD',
    
    -- Dates
    published_date DATE,
    deadline DATE,
    delivery_date DATE,
    
    -- Status
    status public.tender_status DEFAULT 'open',
    
    -- Requirements
    eligibility_criteria JSONB DEFAULT '[]',
    required_documents JSONB DEFAULT '[]',
    required_certifications JSONB DEFAULT '[]',
    
    -- AI Analysis
    ai_match_score NUMERIC,
    ai_win_probability NUMERIC,
    ai_pricing_suggestion JSONB,
    ai_compliance_check JSONB,
    
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. TENDER BIDS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.tender_bids CASCADE;
DROP TYPE IF EXISTS public.bid_status CASCADE;

CREATE TYPE public.bid_status AS ENUM (
    'draft', 'submitted', 'under_evaluation', 'shortlisted', 
    'awarded', 'rejected', 'withdrawn'
);

CREATE TABLE public.tender_bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tender_id UUID REFERENCES public.trade_tenders(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Bid Details
    bid_amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    delivery_days INTEGER,
    
    -- Status
    status public.bid_status DEFAULT 'draft',
    
    -- Documents
    submitted_documents JSONB DEFAULT '[]',
    
    -- AI Assistance
    ai_generated_content JSONB,
    ai_competitive_analysis JSONB,
    
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 11. CONTRACTS TABLE (Enhanced)
-- =============================================================================
DROP TABLE IF EXISTS public.trade_contracts CASCADE;
DROP TYPE IF EXISTS public.contract_status CASCADE;

CREATE TYPE public.contract_status AS ENUM (
    'draft', 'pending_signature', 'active', 'expiring_soon',
    'expired', 'terminated', 'breached', 'completed'
);

CREATE TABLE public.trade_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_number TEXT UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Contract Info
    title TEXT NOT NULL,
    contract_type TEXT, -- 'sales', 'purchase', 'distribution', 'agency'
    template_id TEXT,
    
    -- Parties
    counterparty_id UUID REFERENCES public.trade_partners(id),
    counterparty_name TEXT NOT NULL,
    counterparty_country TEXT,
    
    -- Terms
    value NUMERIC,
    currency TEXT DEFAULT 'USD',
    payment_terms TEXT,
    delivery_terms TEXT,
    incoterm TEXT,
    
    -- Dates
    effective_date DATE,
    expiry_date DATE,
    renewal_date DATE,
    
    -- Status
    status public.contract_status DEFAULT 'draft',
    
    -- Signatures
    our_signature_date TIMESTAMPTZ,
    counterparty_signature_date TIMESTAMPTZ,
    digital_signature_hash TEXT,
    
    -- Performance
    performance_score NUMERIC DEFAULT 0,
    milestones_completed INTEGER DEFAULT 0,
    milestones_total INTEGER DEFAULT 0,
    
    -- AI Alerts
    ai_risk_flags JSONB DEFAULT '[]',
    ai_renewal_recommendation TEXT,
    ai_performance_insights JSONB,
    
    -- Documents
    contract_document_url TEXT,
    amendments JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 12. COMPLIANCE CHECKS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.compliance_checks CASCADE;
DROP TYPE IF EXISTS public.compliance_check_status CASCADE;

CREATE TYPE public.compliance_check_status AS ENUM (
    'pending', 'in_progress', 'passed', 'failed', 'requires_action'
);

CREATE TABLE public.compliance_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.export_projects(id) ON DELETE CASCADE,
    
    -- Check Info
    check_type TEXT NOT NULL, -- 'afcfta_origin', 'sanctions', 'export_license', 'customs', 'quality'
    check_name TEXT NOT NULL,
    description TEXT,
    
    -- Status
    status public.compliance_check_status DEFAULT 'pending',
    
    -- Results
    passed BOOLEAN,
    score NUMERIC,
    issues JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    
    -- Regulatory Reference
    regulation_reference TEXT,
    regulation_country TEXT,
    
    -- AI Analysis
    ai_verified BOOLEAN DEFAULT false,
    ai_confidence NUMERIC,
    ai_suggestions JSONB DEFAULT '[]',
    
    checked_by UUID REFERENCES public.profiles(id),
    checked_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 13. KYC VERIFICATIONS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.kyc_verifications CASCADE;
DROP TYPE IF EXISTS public.kyc_status CASCADE;

CREATE TYPE public.kyc_status AS ENUM (
    'not_started', 'documents_pending', 'under_review', 
    'additional_info_required', 'verified', 'rejected', 'expired'
);

CREATE TABLE public.kyc_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Status
    status public.kyc_status DEFAULT 'not_started',
    
    -- Documents
    documents_submitted JSONB DEFAULT '[]',
    documents_verified JSONB DEFAULT '[]',
    documents_rejected JSONB DEFAULT '[]',
    
    -- Verification Details
    business_registration_verified BOOLEAN DEFAULT false,
    tax_registration_verified BOOLEAN DEFAULT false,
    bank_account_verified BOOLEAN DEFAULT false,
    address_verified BOOLEAN DEFAULT false,
    directors_verified BOOLEAN DEFAULT false,
    
    -- Sanctions & Blacklist
    sanctions_checked BOOLEAN DEFAULT false,
    sanctions_clear BOOLEAN,
    sanctions_check_date TIMESTAMPTZ,
    blacklist_checked BOOLEAN DEFAULT false,
    blacklist_clear BOOLEAN,
    
    -- AI Risk Score
    ai_risk_score NUMERIC DEFAULT 0,
    ai_risk_factors JSONB DEFAULT '[]',
    
    -- Expiry
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    renewal_reminder_sent BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 14. MARKETING CAMPAIGNS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.marketing_campaigns CASCADE;
DROP TYPE IF EXISTS public.campaign_status CASCADE;

CREATE TYPE public.campaign_status AS ENUM (
    'draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'
);

CREATE TABLE public.marketing_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Campaign Info
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT, -- 'product_showcase', 'brand_awareness', 'lead_generation'
    
    -- Target
    target_countries JSONB DEFAULT '[]',
    target_sectors JSONB DEFAULT '[]',
    target_buyer_types JSONB DEFAULT '[]',
    
    -- Content
    products JSONB DEFAULT '[]',
    content_assets JSONB DEFAULT '[]', -- images, videos, copy
    ai_generated_content JSONB,
    
    -- Channels
    channels JSONB DEFAULT '[]', -- 'platform', 'email', 'social', 'web'
    
    -- Schedule
    start_date DATE,
    end_date DATE,
    
    -- Status
    status public.campaign_status DEFAULT 'draft',
    
    -- Budget
    budget NUMERIC,
    spent NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    -- Performance
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    roi NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 15. DASHBOARD KPIS TABLE (Command Center)
-- =============================================================================
DROP TABLE IF EXISTS public.exporter_dashboard_kpis CASCADE;

CREATE TABLE public.exporter_dashboard_kpis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Period
    period_date DATE NOT NULL,
    
    -- Trade KPIs
    total_exports NUMERIC DEFAULT 0,
    total_export_value NUMERIC DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    
    -- By Country
    exports_by_country JSONB DEFAULT '{}',
    exports_by_sector JSONB DEFAULT '{}',
    exports_by_partner JSONB DEFAULT '{}',
    
    -- Finance KPIs
    pending_payments NUMERIC DEFAULT 0,
    received_payments NUMERIC DEFAULT 0,
    outstanding_credit NUMERIC DEFAULT 0,
    finance_utilization NUMERIC DEFAULT 0,
    
    -- Compliance KPIs
    compliance_score NUMERIC DEFAULT 0,
    pending_compliance_checks INTEGER DEFAULT 0,
    afcfta_savings NUMERIC DEFAULT 0,
    
    -- Logistics KPIs
    shipments_in_transit INTEGER DEFAULT 0,
    on_time_delivery_rate NUMERIC DEFAULT 0,
    avg_transit_days NUMERIC DEFAULT 0,
    
    -- AI Insights
    ai_market_opportunities JSONB DEFAULT '[]',
    ai_risk_alerts JSONB DEFAULT '[]',
    ai_recommendations JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

ALTER TABLE public.export_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_finance_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exporter_dashboard_kpis ENABLE ROW LEVEL SECURITY;

-- Public read for market intelligence and tenders
CREATE POLICY "Public read market_intelligence" ON public.market_intelligence FOR SELECT USING (true);
CREATE POLICY "Public read fx_rates" ON public.fx_rates FOR SELECT USING (true);
CREATE POLICY "Public read trade_tenders" ON public.trade_tenders FOR SELECT USING (true);

-- Organization-based access for other tables
CREATE POLICY "Org access export_projects" ON public.export_projects FOR ALL 
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org access project_documents" ON public.project_documents FOR ALL 
    USING (project_id IN (SELECT id FROM public.export_projects WHERE organization_id IN 
        (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Org access trade_partners" ON public.trade_partners FOR ALL 
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org access trade_finance_applications" ON public.trade_finance_applications FOR ALL 
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org access shipment_tracking" ON public.shipment_tracking FOR ALL 
    USING (project_id IN (SELECT id FROM public.export_projects WHERE organization_id IN 
        (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Org access tender_bids" ON public.tender_bids FOR ALL 
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org access trade_contracts" ON public.trade_contracts FOR ALL 
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org access compliance_checks" ON public.compliance_checks FOR ALL 
    USING (project_id IN (SELECT id FROM public.export_projects WHERE organization_id IN 
        (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Org access kyc_verifications" ON public.kyc_verifications FOR ALL 
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org access marketing_campaigns" ON public.marketing_campaigns FOR ALL 
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org access exporter_dashboard_kpis" ON public.exporter_dashboard_kpis FOR ALL 
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Sample Export Projects
INSERT INTO public.export_projects (project_number, title, description, template_type, status, priority, product, hs_code, quantity, unit, value, currency, origin_country, destination_country, incoterm, target_ship_date, afcfta_eligible, compliance_score, ai_risk_score) VALUES
('EXP-2024-001', 'Fresh Avocados to Egypt', 'Premium Hass avocados export shipment', 'produce', 'in_transit', 'high', 'Fresh Avocados', '0804.40', 25000, 'KG', 75000, 'USD', 'Kenya', 'Egypt', 'CIF', '2024-02-15', true, 92, 15),
('EXP-2024-002', 'Cotton Textiles to Nigeria', 'Woven cotton fabrics for Lagos market', 'textiles', 'compliance_review', 'medium', 'Cotton Fabrics', '5208.12', 15000, 'M', 120000, 'USD', 'Ghana', 'Nigeria', 'FOB', '2024-02-28', true, 78, 25),
('EXP-2024-003', 'Electronics to South Africa', 'Consumer electronics batch shipment', 'goods', 'documentation', 'high', 'Consumer Electronics', '8471.30', 500, 'UNITS', 250000, 'USD', 'Kenya', 'South Africa', 'DDP', '2024-03-10', false, 65, 35),
('EXP-2024-004', 'Coffee Beans to Morocco', 'Specialty Arabica coffee beans', 'produce', 'ready_to_ship', 'critical', 'Coffee Beans', '0901.11', 40000, 'KG', 180000, 'USD', 'Ethiopia', 'Morocco', 'CIF', '2024-02-20', true, 95, 10),
('EXP-2024-005', 'Leather Goods to Tanzania', 'Finished leather products', 'goods', 'planning', 'low', 'Leather Products', '4202.21', 2000, 'UNITS', 45000, 'USD', 'Nigeria', 'Tanzania', 'FOB', '2024-04-01', true, 0, 20);

-- Sample Trade Partners
INSERT INTO public.trade_partners (company_name, partner_type, country, city, contact_name, contact_email, verification_tier, kyc_verified, rating, compliance_score, total_trades, total_trade_value, sectors, products) VALUES
('Cairo Fresh Imports Ltd', 'buyer', 'Egypt', 'Cairo', 'Ahmed Hassan', 'ahmed@cairofresh.eg', 'trusted', true, 4.8, 95, 45, 2500000, '["agriculture", "food"]', '["fruits", "vegetables"]'),
('Lagos Textile House', 'buyer', 'Nigeria', 'Lagos', 'Chioma Okonkwo', 'chioma@lagostextile.ng', 'verified', true, 4.5, 88, 32, 1800000, '["textiles", "fashion"]', '["fabrics", "garments"]'),
('Johannesburg Electronics', 'distributor', 'South Africa', 'Johannesburg', 'David van der Berg', 'david@jhbelectronics.za', 'premium', true, 4.9, 98, 78, 5200000, '["electronics", "technology"]', '["consumer electronics", "components"]'),
('Casablanca Coffee Co', 'buyer', 'Morocco', 'Casablanca', 'Fatima Benali', 'fatima@casacoffee.ma', 'trusted', true, 4.7, 92, 28, 1200000, '["food", "beverages"]', '["coffee", "tea"]'),
('Dar Leather Works', 'buyer', 'Tanzania', 'Dar es Salaam', 'Joseph Mwangi', 'joseph@darleather.tz', 'basic', false, 4.2, 75, 12, 350000, '["fashion", "accessories"]', '["leather goods"]'),
('Mombasa Freight Services', 'freight_forwarder', 'Kenya', 'Mombasa', 'Sarah Kimani', 'sarah@mombasafreight.ke', 'verified', true, 4.6, 90, 156, 0, '["logistics"]', '["sea freight", "customs"]'),
('Ecobank Trade Finance', 'bank', 'Ghana', 'Accra', 'Kwame Asante', 'kwame@ecobank.gh', 'premium', true, 4.8, 99, 234, 45000000, '["finance"]', '["trade finance", "letters of credit"]');

-- Sample Market Intelligence
INSERT INTO public.market_intelligence (country, sector, hs_code, product_category, import_volume, export_volume, import_value, export_value, demand_index, price_trend, mfn_tariff_rate, afcfta_tariff_rate, ai_opportunity_score) VALUES
('Egypt', 'Agriculture', '0804', 'Fresh Fruits', 150000, 25000, 450000000, 75000000, 78, 'rising', 15, 0, 85),
('Nigeria', 'Textiles', '5208', 'Cotton Fabrics', 200000, 50000, 800000000, 200000000, 72, 'stable', 20, 5, 75),
('South Africa', 'Electronics', '8471', 'Computers', 500000, 100000, 2500000000, 500000000, 85, 'rising', 10, 0, 90),
('Morocco', 'Food & Beverage', '0901', 'Coffee', 80000, 5000, 320000000, 20000000, 65, 'rising', 12, 0, 70),
('Kenya', 'Agriculture', '0603', 'Cut Flowers', 5000, 250000, 15000000, 750000000, 92, 'stable', 0, 0, 95),
('Ghana', 'Mining', '7108', 'Gold', 0, 150000, 0, 8500000000, 88, 'rising', 0, 0, 80),
('Tanzania', 'Agriculture', '0902', 'Tea', 10000, 45000, 25000000, 120000000, 70, 'stable', 15, 0, 72);

-- Sample FX Rates
INSERT INTO public.fx_rates (base_currency, quote_currency, rate, change_1d, change_1w, change_1m, volatility_30d, ai_hedge_recommendation) VALUES
('USD', 'KES', 153.50, 0.25, 1.2, 2.5, 3.2, 'Consider forward contract for 3-month exposure'),
('USD', 'NGN', 1550.00, 15.00, 45.00, 120.00, 8.5, 'High volatility - hedge immediately'),
('USD', 'ZAR', 18.75, -0.15, 0.45, 1.2, 4.1, 'Stable - spot transactions acceptable'),
('USD', 'EGP', 30.90, 0.05, 0.20, 0.8, 2.8, 'Low volatility - minimal hedging needed'),
('USD', 'GHS', 12.45, 0.10, 0.35, 1.5, 5.2, 'Moderate volatility - consider options'),
('USD', 'MAD', 10.05, -0.02, 0.08, 0.3, 1.5, 'Very stable - no hedging required'),
('EUR', 'USD', 1.085, 0.002, 0.01, 0.02, 2.0, 'Stable pair - standard hedging');

-- Sample Trade Tenders
INSERT INTO public.trade_tenders (tender_number, title, description, issuer_name, issuer_country, issuer_type, product_category, estimated_value, currency, published_date, deadline, status, ai_match_score, ai_win_probability) VALUES
('TND-2024-EG-001', 'Fresh Produce Supply for Cairo Hotels', 'Annual supply contract for premium fruits and vegetables', 'Egyptian Hotel Association', 'Egypt', 'corporate', 'Fresh Produce', 500000, 'USD', '2024-01-15', '2024-02-28', 'open', 92, 75),
('TND-2024-NG-002', 'Textile Materials for Lagos Fashion Week', 'High-quality fabrics for fashion industry', 'Lagos Fashion Council', 'Nigeria', 'corporate', 'Textiles', 250000, 'USD', '2024-01-20', '2024-03-15', 'open', 78, 60),
('TND-2024-ZA-003', 'IT Equipment for Government Offices', 'Computers and peripherals for public sector', 'South African Government', 'South Africa', 'government', 'Electronics', 1500000, 'USD', '2024-01-10', '2024-02-20', 'closing_soon', 85, 45),
('TND-2024-KE-004', 'Coffee Supply for International Airlines', 'Premium coffee beans for in-flight service', 'Kenya Airways', 'Kenya', 'corporate', 'Coffee', 300000, 'USD', '2024-02-01', '2024-03-30', 'open', 95, 80),
('TND-2024-GH-005', 'Cocoa Beans Export Partnership', 'Long-term cocoa supply agreement', 'Ghana Cocoa Board', 'Ghana', 'government', 'Cocoa', 2000000, 'USD', '2024-01-25', '2024-04-15', 'open', 70, 55);

-- Sample Shipment Tracking
INSERT INTO public.shipment_tracking (tracking_number, carrier_name, transport_mode, container_number, origin_port, destination_port, current_location, current_country, status, eta, risk_level, delay_probability, ai_carbon_footprint) VALUES
('SHIP-2024-001', 'Maersk Line', 'sea', 'MSKU1234567', 'Mombasa', 'Port Said', 'Red Sea', 'International Waters', 'in_transit', '2024-02-18', 'low', 5, 2.5),
('SHIP-2024-002', 'MSC', 'sea', 'MSCU7654321', 'Tema', 'Lagos', 'Gulf of Guinea', 'International Waters', 'in_transit', '2024-02-22', 'medium', 15, 1.8),
('SHIP-2024-003', 'Ethiopian Airlines Cargo', 'air', NULL, 'Addis Ababa', 'Casablanca', 'Casablanca Airport', 'Morocco', 'at_destination_port', '2024-02-16', 'low', 0, 4.2),
('SHIP-2024-004', 'Safmarine', 'sea', 'SAFM9876543', 'Durban', 'Dar es Salaam', 'Durban Port', 'South Africa', 'at_origin_port', '2024-03-05', 'low', 8, 1.5);

-- Sample Trade Contracts
INSERT INTO public.trade_contracts (contract_number, title, contract_type, counterparty_name, counterparty_country, value, currency, effective_date, expiry_date, status, performance_score, milestones_completed, milestones_total) VALUES
('CTR-2024-001', 'Annual Avocado Supply Agreement', 'sales', 'Cairo Fresh Imports Ltd', 'Egypt', 500000, 'USD', '2024-01-01', '2024-12-31', 'active', 88, 2, 12),
('CTR-2024-002', 'Cotton Fabric Distribution', 'sales', 'Lagos Textile House', 'Nigeria', 350000, 'USD', '2024-02-01', '2025-01-31', 'active', 75, 1, 6),
('CTR-2024-003', 'Electronics Partnership', 'distribution', 'Johannesburg Electronics', 'South Africa', 1200000, 'USD', '2023-06-01', '2024-05-31', 'expiring_soon', 92, 10, 12),
('CTR-2024-004', 'Coffee Export Agreement', 'sales', 'Casablanca Coffee Co', 'Morocco', 400000, 'USD', '2024-01-15', '2024-12-31', 'active', 95, 1, 4),
('CTR-2024-005', 'Freight Services Agreement', 'agency', 'Mombasa Freight Services', 'Kenya', 150000, 'USD', '2024-01-01', '2024-12-31', 'active', 90, 0, 0);

-- Sample Dashboard KPIs
INSERT INTO public.exporter_dashboard_kpis (period_date, total_exports, total_export_value, active_projects, completed_projects, exports_by_country, pending_payments, received_payments, compliance_score, shipments_in_transit, on_time_delivery_rate, ai_market_opportunities, ai_risk_alerts) VALUES
('2024-02-14', 45, 2500000, 5, 12, '{"Egypt": 800000, "Nigeria": 450000, "South Africa": 750000, "Morocco": 350000, "Tanzania": 150000}', 320000, 1850000, 87, 3, 94.5, '[{"market": "Egypt", "product": "Fresh Fruits", "opportunity_score": 92}, {"market": "Morocco", "product": "Coffee", "opportunity_score": 88}]', '[{"type": "currency", "message": "NGN volatility increasing", "severity": "medium"}, {"type": "compliance", "message": "New AfCFTA rules effective March 1", "severity": "low"}]');

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_export_projects_org ON public.export_projects(organization_id);
CREATE INDEX idx_export_projects_status ON public.export_projects(status);
CREATE INDEX idx_project_documents_project ON public.project_documents(project_id);
CREATE INDEX idx_project_activities_project ON public.project_activities(project_id);
CREATE INDEX idx_trade_partners_org ON public.trade_partners(organization_id);
CREATE INDEX idx_trade_partners_country ON public.trade_partners(country);
CREATE INDEX idx_market_intelligence_country ON public.market_intelligence(country);
CREATE INDEX idx_market_intelligence_sector ON public.market_intelligence(sector);
CREATE INDEX idx_fx_rates_pair ON public.fx_rates(base_currency, quote_currency);
CREATE INDEX idx_trade_finance_org ON public.trade_finance_applications(organization_id);
CREATE INDEX idx_shipment_tracking_project ON public.shipment_tracking(project_id);
CREATE INDEX idx_trade_tenders_status ON public.trade_tenders(status);
CREATE INDEX idx_trade_tenders_deadline ON public.trade_tenders(deadline);
CREATE INDEX idx_trade_contracts_org ON public.trade_contracts(organization_id);
CREATE INDEX idx_trade_contracts_status ON public.trade_contracts(status);
CREATE INDEX idx_compliance_checks_project ON public.compliance_checks(project_id);
CREATE INDEX idx_kyc_verifications_org ON public.kyc_verifications(organization_id);
CREATE INDEX idx_marketing_campaigns_org ON public.marketing_campaigns(organization_id);
CREATE INDEX idx_dashboard_kpis_org_date ON public.exporter_dashboard_kpis(organization_id, period_date);

COMMIT;
