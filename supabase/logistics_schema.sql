-- =============================================================================
-- AFRITRADE OS - LOGISTICS MODULE SCHEMA
-- Tables for Logistics Provider Panel and Shipment Tracking
-- =============================================================================

-- =============================================================================
-- 1. SHIPMENT TRACKING TABLE (Used by Logistics.tsx)
-- =============================================================================
DROP TABLE IF EXISTS public.shipment_tracking CASCADE;

CREATE TABLE public.shipment_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Shipment Details
    cargo_description TEXT,
    cargo_type TEXT, -- 'general', 'perishable', 'hazardous', 'fragile', 'bulk'
    weight_kg NUMERIC,
    volume_cbm NUMERIC,
    package_count INTEGER DEFAULT 1,
    declared_value NUMERIC,
    currency TEXT DEFAULT 'USD',

    -- Route Information
    origin_port TEXT NOT NULL,
    destination_port TEXT NOT NULL,
    origin_country TEXT,
    destination_country TEXT,
    current_location TEXT,
    coordinates JSONB, -- {lat, lng}

    -- Transport Details
    transport_mode TEXT DEFAULT 'road', -- 'road', 'sea', 'air', 'rail', 'multimodal'
    carrier_id UUID,
    carrier_name TEXT,
    vessel_name TEXT,
    voyage_number TEXT,
    container_number TEXT,

    -- Status & Dates
    status TEXT DEFAULT 'booked', -- 'booked', 'picked_up', 'at_origin_port', 'departed', 'in_transit', 'at_destination_port', 'customs_hold', 'cleared', 'out_for_delivery', 'delivered'
    booking_date TIMESTAMPTZ DEFAULT NOW(),
    pickup_date TIMESTAMPTZ,
    departure_date TIMESTAMPTZ,
    eta TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    delivery_date TIMESTAMPTZ,

    -- Timeline Events (JSONB array)
    timeline JSONB DEFAULT '[]', -- [{date, event, location, status}]

    -- Documents
    documents JSONB DEFAULT '[]', -- [{name, type, url, status}]

    -- Customs & Compliance
    customs_status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'under_review', 'cleared', 'held'
    customs_reference TEXT,
    hs_codes JSONB DEFAULT '[]',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipment_tracking_user ON public.shipment_tracking(user_id);
CREATE INDEX idx_shipment_tracking_status ON public.shipment_tracking(status);
CREATE INDEX idx_shipment_tracking_tracking_number ON public.shipment_tracking(tracking_number);

-- =============================================================================
-- 2. LOGISTICS FLEET VEHICLES TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_fleet_vehicles CASCADE;

CREATE TABLE public.logistics_fleet_vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Vehicle Details
    registration TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'truck', 'trailer', 'tanker', 'refrigerated', 'flatbed'
    make TEXT,
    model TEXT,
    year INTEGER,
    capacity TEXT, -- '20T', '40T', etc.

    -- Status
    status TEXT DEFAULT 'available', -- 'available', 'in_transit', 'maintenance', 'idle'
    current_location TEXT,
    coordinates JSONB, -- {lat, lng}

    -- Assignment
    driver_id UUID,
    driver_name TEXT,
    current_shipment_id UUID,

    -- Vehicle Health
    fuel_level INTEGER DEFAULT 100, -- percentage
    mileage INTEGER DEFAULT 0,
    health_score INTEGER DEFAULT 100, -- 0-100

    -- Maintenance & Compliance
    last_maintenance TIMESTAMPTZ,
    next_maintenance TIMESTAMPTZ,
    insurance_expiry DATE,
    permit_expiry DATE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fleet_vehicles_org ON public.logistics_fleet_vehicles(organization_id);
CREATE INDEX idx_fleet_vehicles_status ON public.logistics_fleet_vehicles(status);

-- =============================================================================
-- 3. LOGISTICS FLEET DRIVERS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_fleet_drivers CASCADE;

CREATE TABLE public.logistics_fleet_drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Driver Details
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    photo TEXT, -- URL

    -- License
    license_number TEXT UNIQUE,
    license_expiry DATE,
    license_class TEXT, -- 'A', 'B', 'C', 'D', 'E'

    -- Status
    status TEXT DEFAULT 'available', -- 'available', 'on_duty', 'off_duty', 'on_leave'
    assigned_vehicle_id UUID REFERENCES public.logistics_fleet_vehicles(id) ON DELETE SET NULL,

    -- Performance
    behavior_score INTEGER DEFAULT 100, -- 0-100
    total_trips INTEGER DEFAULT 0,
    total_distance_km INTEGER DEFAULT 0,

    -- Certifications & Skills
    certifications JSONB DEFAULT '[]', -- ['ADR', 'FMCG', 'Cold Chain']
    languages JSONB DEFAULT '[]', -- ['English', 'French', 'Swahili']

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fleet_drivers_org ON public.logistics_fleet_drivers(organization_id);
CREATE INDEX idx_fleet_drivers_status ON public.logistics_fleet_drivers(status);

-- =============================================================================
-- 4. LOGISTICS SHIPMENTS TABLE (For Logistics Provider)
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_shipments CASCADE;

CREATE TABLE public.logistics_shipments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Client Info
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT,
    client_contact TEXT,

    -- Shipment Details
    cargo TEXT NOT NULL,
    cargo_type TEXT,
    weight TEXT,
    value NUMERIC,
    currency TEXT DEFAULT 'USD',

    -- Route
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    current_location TEXT,
    coordinates JSONB,

    -- Transport
    transport_mode TEXT DEFAULT 'road', -- 'road', 'rail', 'sea', 'air', 'multimodal'
    vehicle_id UUID REFERENCES public.logistics_fleet_vehicles(id) ON DELETE SET NULL,
    vehicle_registration TEXT,
    driver_id UUID REFERENCES public.logistics_fleet_drivers(id) ON DELETE SET NULL,
    driver_name TEXT,

    -- Status & Progress
    status TEXT DEFAULT 'booked', -- 'booked', 'picked_up', 'in_transit', 'at_border', 'customs_hold', 'cleared', 'delivered'
    progress INTEGER DEFAULT 0, -- 0-100
    risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
    eta TIMESTAMPTZ,

    -- Timeline & Documents
    timeline JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',

    -- Financials
    profitability JSONB DEFAULT '{"revenue": 0, "costs": 0, "margin": 0}',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_shipments_org ON public.logistics_shipments(organization_id);
CREATE INDEX idx_logistics_shipments_status ON public.logistics_shipments(status);

-- =============================================================================
-- 5. LOGISTICS INVOICES TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_invoices CASCADE;

CREATE TABLE public.logistics_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Client
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,

    -- Shipment Reference
    shipment_id UUID REFERENCES public.logistics_shipments(id) ON DELETE SET NULL,

    -- Invoice Details
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC GENERATED ALWAYS AS (amount + tax_amount) STORED,

    -- Status & Dates
    status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'paid', 'overdue', 'disputed'
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_date DATE,

    -- Line Items
    line_items JSONB DEFAULT '[]',

    -- Payment
    payment_method TEXT,
    payment_reference TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_invoices_org ON public.logistics_invoices(organization_id);
CREATE INDEX idx_logistics_invoices_status ON public.logistics_invoices(status);

-- =============================================================================
-- 6. LOGISTICS TENDERS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_tenders CASCADE;

CREATE TABLE public.logistics_tenders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,

    -- Tender Details
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issuer_type TEXT DEFAULT 'private', -- 'government', 'afcfta', 'private'

    -- Route & Cargo
    corridor TEXT, -- 'Lagos-Accra', 'Mombasa-Kampala', etc.
    cargo_type TEXT,
    volume TEXT,

    -- Value
    value NUMERIC,
    currency TEXT DEFAULT 'USD',

    -- Dates & Status
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'new', -- 'new', 'preparing', 'submitted', 'awarded', 'lost'

    -- Scoring
    match_score INTEGER DEFAULT 0, -- 0-100
    win_probability INTEGER DEFAULT 0, -- 0-100

    -- Requirements
    requirements JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_tenders_status ON public.logistics_tenders(status);

-- =============================================================================
-- 7. LOGISTICS BORDER ALERTS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_border_alerts CASCADE;

CREATE TABLE public.logistics_border_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Alert Details
    border_name TEXT NOT NULL,
    country_from TEXT,
    country_to TEXT,

    -- Alert Type & Severity
    alert_type TEXT NOT NULL, -- 'congestion', 'closure', 'inspection', 'documentation', 'weather'
    severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

    -- Message
    message TEXT NOT NULL,
    recommendation TEXT,

    -- Impact
    affected_corridors JSONB DEFAULT '[]',
    estimated_delay_hours INTEGER DEFAULT 0,

    -- Status & Dates
    status TEXT DEFAULT 'active', -- 'active', 'resolved', 'expired'
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_border_alerts_status ON public.logistics_border_alerts(status);
CREATE INDEX idx_border_alerts_severity ON public.logistics_border_alerts(severity);

-- =============================================================================
-- 8. LOGISTICS CLIENTS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_clients CASCADE;

CREATE TABLE public.logistics_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Client Details
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    country TEXT,

    -- Relationship
    client_type TEXT DEFAULT 'regular', -- 'regular', 'vip', 'new'
    contract_status TEXT DEFAULT 'active', -- 'active', 'pending', 'expired'
    credit_limit NUMERIC DEFAULT 0,

    -- Statistics
    total_shipments INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    last_shipment_date TIMESTAMPTZ,

    -- Rating
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_clients_org ON public.logistics_clients(organization_id);

-- =============================================================================
-- 9. LOGISTICS COMPLIANCE DOCUMENTS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_compliance_docs CASCADE;

CREATE TABLE public.logistics_compliance_docs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Document Details
    name TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'license', 'insurance', 'permit', 'certification'
    issuing_authority TEXT,

    -- Reference
    reference_number TEXT,

    -- Dates & Status
    issue_date DATE,
    expiry_date DATE,
    status TEXT DEFAULT 'valid', -- 'valid', 'expiring', 'expired', 'pending_renewal'

    -- File
    file_url TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_docs_org ON public.logistics_compliance_docs(organization_id);
CREATE INDEX idx_compliance_docs_status ON public.logistics_compliance_docs(status);

-- =============================================================================
-- 10. LOGISTICS BACKHAUL OPPORTUNITIES TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_backhaul CASCADE;

CREATE TABLE public.logistics_backhaul (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Route
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    corridor TEXT,

    -- Details
    cargo_type TEXT,
    weight TEXT,
    pickup_date TIMESTAMPTZ,

    -- Pricing
    rate NUMERIC,
    currency TEXT DEFAULT 'USD',

    -- Status
    status TEXT DEFAULT 'available', -- 'available', 'matched', 'accepted', 'completed'
    matched_vehicle_id UUID REFERENCES public.logistics_fleet_vehicles(id) ON DELETE SET NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backhaul_status ON public.logistics_backhaul(status);

-- =============================================================================
-- 11. QUOTE REQUESTS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.logistics_quote_requests CASCADE;

CREATE TABLE public.logistics_quote_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Provider
    provider_name TEXT NOT NULL,
    provider_type TEXT, -- 'Ocean', 'Air', 'Road', 'Rail'

    -- Route
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,

    -- Cargo
    cargo_description TEXT,
    weight_kg NUMERIC,

    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'received', 'expired'

    -- Quote Response
    quoted_price NUMERIC,
    quoted_currency TEXT,
    quoted_eta TEXT,
    quote_valid_until TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_requests_user ON public.logistics_quote_requests(user_id);
CREATE INDEX idx_quote_requests_status ON public.logistics_quote_requests(status);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.shipment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_fleet_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_border_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_compliance_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_backhaul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_quote_requests ENABLE ROW LEVEL SECURITY;

-- Shipment Tracking: Users can see their own shipments
CREATE POLICY "Users can view own shipments" ON public.shipment_tracking
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shipments" ON public.shipment_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shipments" ON public.shipment_tracking
    FOR UPDATE USING (auth.uid() = user_id);

-- Fleet Vehicles: Organization-based access (allow all for now, restrict by org later)
CREATE POLICY "Allow all fleet vehicle access" ON public.logistics_fleet_vehicles
    FOR ALL USING (true);

-- Fleet Drivers: Organization-based access
CREATE POLICY "Allow all fleet driver access" ON public.logistics_fleet_drivers
    FOR ALL USING (true);

-- Logistics Shipments: Allow all for now
CREATE POLICY "Allow all logistics shipments access" ON public.logistics_shipments
    FOR ALL USING (true);

-- Invoices: Allow all for now
CREATE POLICY "Allow all invoices access" ON public.logistics_invoices
    FOR ALL USING (true);

-- Tenders: Public read, org-based write
CREATE POLICY "Allow all tender access" ON public.logistics_tenders
    FOR ALL USING (true);

-- Border Alerts: Public read
CREATE POLICY "Public border alerts read" ON public.logistics_border_alerts
    FOR SELECT USING (true);

-- Clients: Organization-based
CREATE POLICY "Allow all client access" ON public.logistics_clients
    FOR ALL USING (true);

-- Compliance Docs: Organization-based
CREATE POLICY "Allow all compliance docs access" ON public.logistics_compliance_docs
    FOR ALL USING (true);

-- Backhaul: Public access
CREATE POLICY "Allow all backhaul access" ON public.logistics_backhaul
    FOR ALL USING (true);

-- Quote Requests: User-based
CREATE POLICY "Users can manage own quote requests" ON public.logistics_quote_requests
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- =============================================================================
-- TRIGGER FOR UPDATED_AT
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all logistics tables
CREATE TRIGGER update_shipment_tracking_updated_at BEFORE UPDATE ON public.shipment_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fleet_vehicles_updated_at BEFORE UPDATE ON public.logistics_fleet_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fleet_drivers_updated_at BEFORE UPDATE ON public.logistics_fleet_drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logistics_shipments_updated_at BEFORE UPDATE ON public.logistics_shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logistics_invoices_updated_at BEFORE UPDATE ON public.logistics_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logistics_tenders_updated_at BEFORE UPDATE ON public.logistics_tenders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logistics_clients_updated_at BEFORE UPDATE ON public.logistics_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_docs_updated_at BEFORE UPDATE ON public.logistics_compliance_docs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backhaul_updated_at BEFORE UPDATE ON public.logistics_backhaul
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON public.logistics_quote_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
