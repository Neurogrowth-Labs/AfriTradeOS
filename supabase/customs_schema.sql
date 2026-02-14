-- =============================================================================
-- AFRITRADE OS - CUSTOMS AUTHORITY MODULE SCHEMA
-- Based on CEO Simao's Customs Authority Panel Requirements
-- =============================================================================

-- =============================================================================
-- 1. CUSTOMS DECLARATIONS TABLE (Digital Single Window)
-- =============================================================================
DROP TABLE IF EXISTS public.customs_declarations CASCADE;
DROP TYPE IF EXISTS public.declaration_status CASCADE;
DROP TYPE IF EXISTS public.declaration_type CASCADE;

CREATE TYPE public.declaration_status AS ENUM (
    'draft', 'submitted', 'under_review', 'queried', 
    'approved', 'rejected', 'cleared', 'cancelled'
);

CREATE TYPE public.declaration_type AS ENUM (
    'import', 'export', 'transit', 're_export', 'temporary_import'
);

CREATE TABLE public.customs_declarations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    declaration_number TEXT UNIQUE,
    declaration_type public.declaration_type NOT NULL,
    status public.declaration_status DEFAULT 'draft',
    
    -- Trader Information
    trader_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    trader_name TEXT NOT NULL,
    trader_tin TEXT,
    importer_exporter_code TEXT,
    
    -- Shipment Details
    origin_country TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    port_of_entry TEXT,
    port_of_exit TEXT,
    
    -- Goods Information
    hs_code TEXT NOT NULL,
    hs_code_description TEXT,
    product_description TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT DEFAULT 'KG',
    gross_weight NUMERIC,
    net_weight NUMERIC,
    
    -- Valuation
    declared_value NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    exchange_rate NUMERIC DEFAULT 1,
    cif_value NUMERIC,
    fob_value NUMERIC,
    freight_cost NUMERIC,
    insurance_cost NUMERIC,
    
    -- Duties & Taxes
    duty_rate NUMERIC DEFAULT 0,
    duty_amount NUMERIC DEFAULT 0,
    vat_rate NUMERIC DEFAULT 0,
    vat_amount NUMERIC DEFAULT 0,
    excise_duty NUMERIC DEFAULT 0,
    other_charges NUMERIC DEFAULT 0,
    total_taxes NUMERIC DEFAULT 0,
    
    -- AfCFTA Compliance
    afcfta_eligible BOOLEAN DEFAULT FALSE,
    certificate_of_origin_id UUID,
    rules_of_origin_criteria TEXT,
    preferential_rate_applied BOOLEAN DEFAULT FALSE,
    tariff_preference_savings NUMERIC DEFAULT 0,
    
    -- Risk Assessment
    risk_score INTEGER DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_factors JSONB DEFAULT '[]',
    ai_risk_flags JSONB DEFAULT '[]',
    
    -- Documents
    documents JSONB DEFAULT '[]',
    bill_of_lading_number TEXT,
    invoice_number TEXT,
    
    -- Processing
    assigned_officer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_officer_name TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    query_reason TEXT,
    rejection_reason TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE,
    cleared_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_declarations_status ON customs_declarations(status);
CREATE INDEX idx_declarations_trader ON customs_declarations(trader_id);
CREATE INDEX idx_declarations_hs_code ON customs_declarations(hs_code);
CREATE INDEX idx_declarations_risk ON customs_declarations(risk_level);
CREATE INDEX idx_declarations_date ON customs_declarations(created_at DESC);
CREATE INDEX idx_declarations_officer ON customs_declarations(assigned_officer_id);

-- Auto-generate declaration number
CREATE OR REPLACE FUNCTION generate_declaration_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.declaration_number := 'DEC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_declaration_number ON public.customs_declarations;
CREATE TRIGGER set_declaration_number
    BEFORE INSERT ON public.customs_declarations
    FOR EACH ROW
    WHEN (NEW.declaration_number IS NULL)
    EXECUTE FUNCTION generate_declaration_number();

-- =============================================================================
-- 2. DECLARATION REVIEW QUEUE & AUDIT TRAIL
-- =============================================================================
DROP TABLE IF EXISTS public.customs_reviews CASCADE;

CREATE TABLE public.customs_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    declaration_id UUID REFERENCES public.customs_declarations(id) ON DELETE CASCADE,
    officer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    officer_name TEXT,
    
    -- Review Details
    action TEXT NOT NULL CHECK (action IN ('assign', 'review', 'query', 'approve', 'reject', 'escalate', 'clear')),
    previous_status TEXT,
    new_status TEXT,
    
    -- Notes & Reasoning
    notes TEXT,
    internal_notes TEXT,
    
    -- Risk Assessment Updates
    risk_score_before INTEGER,
    risk_score_after INTEGER,
    risk_flags_added JSONB DEFAULT '[]',
    
    -- SLA Tracking
    sla_deadline TIMESTAMP WITH TIME ZONE,
    sla_met BOOLEAN,
    processing_time_seconds INTEGER,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_declaration ON customs_reviews(declaration_id);
CREATE INDEX idx_reviews_officer ON customs_reviews(officer_id);
CREATE INDEX idx_reviews_action ON customs_reviews(action);
CREATE INDEX idx_reviews_date ON customs_reviews(created_at DESC);

-- =============================================================================
-- 3. CERTIFICATES OF ORIGIN (Blockchain-ready)
-- =============================================================================
DROP TABLE IF EXISTS public.customs_certificates CASCADE;
DROP TYPE IF EXISTS public.certificate_status CASCADE;

CREATE TYPE public.certificate_status AS ENUM (
    'pending', 'verified', 'rejected', 'expired', 'revoked'
);

CREATE TABLE public.customs_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_number TEXT UNIQUE NOT NULL,
    certificate_type TEXT NOT NULL CHECK (certificate_type IN ('origin', 'phytosanitary', 'health', 'quality', 'conformity', 'fumigation')),
    
    -- Issuing Details
    issuing_country TEXT NOT NULL,
    issuing_authority TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    
    -- Goods Information
    hs_code TEXT,
    product_description TEXT,
    quantity NUMERIC,
    
    -- Parties
    exporter_name TEXT NOT NULL,
    exporter_country TEXT NOT NULL,
    importer_name TEXT,
    importer_country TEXT,
    
    -- Verification
    status public.certificate_status DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    verification_method TEXT,
    blockchain_hash TEXT,
    qr_code_data TEXT,
    
    -- AfCFTA Specific
    afcfta_compliant BOOLEAN DEFAULT FALSE,
    origin_criteria TEXT,
    cumulation_applied BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    document_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certificates_number ON customs_certificates(certificate_number);
CREATE INDEX idx_certificates_status ON customs_certificates(status);
CREATE INDEX idx_certificates_type ON customs_certificates(certificate_type);
CREATE INDEX idx_certificates_hs ON customs_certificates(hs_code);

-- =============================================================================
-- 4. CUSTOMS TRADER REGISTRY (Enhanced KYC/KYB)
-- =============================================================================
DROP TABLE IF EXISTS public.customs_traders CASCADE;
DROP TYPE IF EXISTS public.trader_risk_class CASCADE;

CREATE TYPE public.trader_risk_class AS ENUM (
    'trusted', 'standard', 'elevated', 'high_risk', 'blacklisted'
);

CREATE TABLE public.customs_traders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Registration
    tin TEXT UNIQUE,
    customs_code TEXT UNIQUE,
    registration_date DATE,
    license_expiry DATE,
    
    -- Classification
    trader_type TEXT CHECK (trader_type IN ('importer', 'exporter', 'broker', 'freight_forwarder', 'warehouse_operator')),
    risk_classification public.trader_risk_class DEFAULT 'standard',
    compliance_score INTEGER DEFAULT 50 CHECK (compliance_score >= 0 AND compliance_score <= 100),
    
    -- Trade History
    total_declarations INTEGER DEFAULT 0,
    approved_declarations INTEGER DEFAULT 0,
    rejected_declarations INTEGER DEFAULT 0,
    total_trade_value NUMERIC DEFAULT 0,
    avg_clearance_time_hours NUMERIC DEFAULT 0,
    
    -- Violations & Alerts
    violations_count INTEGER DEFAULT 0,
    active_alerts INTEGER DEFAULT 0,
    last_violation_date DATE,
    sanctions_check_date DATE,
    sanctions_status TEXT DEFAULT 'clear' CHECK (sanctions_status IN ('clear', 'flagged', 'blocked')),
    
    -- Beneficial Ownership
    beneficial_owners JSONB DEFAULT '[]',
    linked_entities JSONB DEFAULT '[]',
    
    -- Trusted Trader Program
    aeo_status TEXT DEFAULT 'none' CHECK (aeo_status IN ('none', 'applied', 'certified', 'suspended', 'revoked')),
    aeo_tier TEXT CHECK (aeo_tier IN ('gold', 'silver', 'bronze')),
    aeo_benefits TEXT[],
    last_audit_date DATE,
    next_audit_date DATE,
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_traders_org ON customs_traders(organization_id);
CREATE INDEX idx_traders_tin ON customs_traders(tin);
CREATE INDEX idx_traders_risk ON customs_traders(risk_classification);
CREATE INDEX idx_traders_compliance ON customs_traders(compliance_score);

-- =============================================================================
-- 5. SHIPMENT TRACKING & MONITORING
-- =============================================================================
DROP TABLE IF EXISTS public.customs_shipments CASCADE;
DROP TYPE IF EXISTS public.shipment_status CASCADE;

CREATE TYPE public.shipment_status AS ENUM (
    'pre_arrival', 'arrived', 'under_inspection', 'customs_hold',
    'cleared', 'released', 'in_transit', 'delivered', 'seized'
);

CREATE TABLE public.customs_shipments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    declaration_id UUID REFERENCES public.customs_declarations(id) ON DELETE SET NULL,
    
    -- Shipment Identifiers
    tracking_number TEXT,
    container_number TEXT,
    bill_of_lading TEXT,
    airway_bill TEXT,
    
    -- Transport Details
    transport_mode TEXT CHECK (transport_mode IN ('sea', 'air', 'road', 'rail', 'multimodal')),
    vessel_name TEXT,
    voyage_number TEXT,
    carrier_name TEXT,
    
    -- Route
    origin_port TEXT,
    destination_port TEXT,
    current_location TEXT,
    current_country TEXT,
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    
    -- Status & Timeline
    status public.shipment_status DEFAULT 'pre_arrival',
    eta TIMESTAMP WITH TIME ZONE,
    ata TIMESTAMP WITH TIME ZONE,
    cleared_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    
    -- Inspection
    inspection_required BOOLEAN DEFAULT FALSE,
    inspection_type TEXT,
    inspection_result TEXT,
    inspection_notes TEXT,
    scanned BOOLEAN DEFAULT FALSE,
    scan_result TEXT,
    
    -- IoT & Sensors
    temperature_monitored BOOLEAN DEFAULT FALSE,
    current_temperature NUMERIC,
    tamper_alert BOOLEAN DEFAULT FALSE,
    gps_enabled BOOLEAN DEFAULT FALSE,
    last_gps_update TIMESTAMP WITH TIME ZONE,
    
    -- Risk
    risk_score INTEGER DEFAULT 50,
    risk_flags JSONB DEFAULT '[]',
    
    -- Timeline Events
    timeline JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipments_declaration ON customs_shipments(declaration_id);
CREATE INDEX idx_shipments_status ON customs_shipments(status);
CREATE INDEX idx_shipments_tracking ON customs_shipments(tracking_number);
CREATE INDEX idx_shipments_container ON customs_shipments(container_number);

-- =============================================================================
-- 6. CUSTOMS REVENUE COLLECTION
-- =============================================================================
DROP TABLE IF EXISTS public.customs_revenue CASCADE;

CREATE TABLE public.customs_revenue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    declaration_id UUID REFERENCES public.customs_declarations(id) ON DELETE SET NULL,
    
    -- Payment Details
    payment_reference TEXT UNIQUE,
    payment_date DATE NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'mobile_money', 'card', 'cash', 'bond')),
    
    -- Amounts
    duty_collected NUMERIC DEFAULT 0,
    vat_collected NUMERIC DEFAULT 0,
    excise_collected NUMERIC DEFAULT 0,
    penalties_collected NUMERIC DEFAULT 0,
    other_fees NUMERIC DEFAULT 0,
    total_collected NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    -- Bank Details
    bank_name TEXT,
    bank_reference TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_revenue_declaration ON customs_revenue(declaration_id);
CREATE INDEX idx_revenue_date ON customs_revenue(payment_date);
CREATE INDEX idx_revenue_status ON customs_revenue(status);

-- =============================================================================
-- 7. CUSTOMS OFFICER PERFORMANCE
-- =============================================================================
DROP TABLE IF EXISTS public.customs_officers CASCADE;

CREATE TABLE public.customs_officers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Officer Details
    badge_number TEXT UNIQUE,
    rank TEXT,
    station TEXT,
    department TEXT,
    
    -- Performance Metrics
    declarations_reviewed INTEGER DEFAULT 0,
    declarations_approved INTEGER DEFAULT 0,
    declarations_rejected INTEGER DEFAULT 0,
    avg_review_time_minutes NUMERIC DEFAULT 0,
    
    -- Quality Metrics
    accuracy_rate NUMERIC DEFAULT 100,
    appeals_overturned INTEGER DEFAULT 0,
    compliance_rate NUMERIC DEFAULT 100,
    
    -- Workload
    current_queue_size INTEGER DEFAULT 0,
    daily_target INTEGER DEFAULT 50,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_officers_user ON customs_officers(user_id);
CREATE INDEX idx_officers_station ON customs_officers(station);

-- =============================================================================
-- 8. CUSTOMS ALERTS & RISK ENGINE
-- =============================================================================
DROP TABLE IF EXISTS public.customs_alerts CASCADE;

CREATE TABLE public.customs_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Alert Type
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'risk_flag', 'smuggling_pattern', 'price_anomaly', 'document_fraud',
        'sanctions_match', 'origin_fraud', 'undervaluation', 'hs_misclassification',
        'repeat_offender', 'congestion', 'system'
    )),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- References
    declaration_id UUID REFERENCES public.customs_declarations(id) ON DELETE SET NULL,
    trader_id UUID REFERENCES public.customs_traders(id) ON DELETE SET NULL,
    shipment_id UUID REFERENCES public.customs_shipments(id) ON DELETE SET NULL,
    
    -- Alert Details
    title TEXT NOT NULL,
    description TEXT,
    ai_confidence NUMERIC,
    pattern_details JSONB DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive', 'escalated')),
    assigned_to UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_type ON customs_alerts(alert_type);
CREATE INDEX idx_alerts_severity ON customs_alerts(severity);
CREATE INDEX idx_alerts_status ON customs_alerts(status);
CREATE INDEX idx_alerts_declaration ON customs_alerts(declaration_id);
CREATE INDEX idx_alerts_trader ON customs_alerts(trader_id);

-- =============================================================================
-- 9. HS CODE REFERENCE TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.customs_hs_codes CASCADE;

CREATE TABLE public.customs_hs_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hs_code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    chapter TEXT,
    section TEXT,
    
    -- Tariff Rates
    mfn_rate NUMERIC DEFAULT 0,
    afcfta_rate NUMERIC DEFAULT 0,
    ecowas_rate NUMERIC DEFAULT 0,
    eac_rate NUMERIC DEFAULT 0,
    sadc_rate NUMERIC DEFAULT 0,
    
    -- Classification
    unit TEXT DEFAULT 'KG',
    requires_license BOOLEAN DEFAULT FALSE,
    restricted BOOLEAN DEFAULT FALSE,
    prohibited BOOLEAN DEFAULT FALSE,
    
    -- Risk Indicators
    high_risk BOOLEAN DEFAULT FALSE,
    common_fraud_item BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hs_codes_code ON customs_hs_codes(hs_code);
CREATE INDEX idx_hs_codes_chapter ON customs_hs_codes(chapter);

-- =============================================================================
-- 10. CUSTOMS DASHBOARD STATISTICS (Materialized View)
-- =============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.customs_daily_stats;

CREATE MATERIALIZED VIEW public.customs_daily_stats AS
SELECT 
    DATE(created_at) as stat_date,
    COUNT(*) as total_declarations,
    COUNT(*) FILTER (WHERE status = 'approved') as approved,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
    COUNT(*) FILTER (WHERE status = 'under_review') as pending_review,
    COUNT(*) FILTER (WHERE status = 'cleared') as cleared,
    SUM(declared_value) as total_declared_value,
    SUM(total_taxes) as total_revenue,
    AVG(risk_score) as avg_risk_score,
    COUNT(*) FILTER (WHERE risk_level = 'high' OR risk_level = 'critical') as high_risk_count,
    COUNT(*) FILTER (WHERE afcfta_eligible = TRUE) as afcfta_eligible_count,
    SUM(tariff_preference_savings) as total_afcfta_savings
FROM public.customs_declarations
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY stat_date DESC;

CREATE UNIQUE INDEX idx_customs_daily_stats_date ON customs_daily_stats(stat_date);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Customs Declarations
ALTER TABLE public.customs_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customs officers can view all declarations" ON public.customs_declarations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

CREATE POLICY "Customs officers can manage declarations" ON public.customs_declarations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

CREATE POLICY "Traders can view own declarations" ON public.customs_declarations
    FOR SELECT USING (
        trader_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    );

-- Customs Reviews
ALTER TABLE public.customs_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customs officers can view all reviews" ON public.customs_reviews
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

CREATE POLICY "Customs officers can create reviews" ON public.customs_reviews
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

-- Certificates
ALTER TABLE public.customs_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified certificates" ON public.customs_certificates
    FOR SELECT USING (status = 'verified');

CREATE POLICY "Customs can manage certificates" ON public.customs_certificates
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

-- Traders Registry
ALTER TABLE public.customs_traders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customs can view all traders" ON public.customs_traders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

CREATE POLICY "Customs can manage traders" ON public.customs_traders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

-- Shipments
ALTER TABLE public.customs_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customs can view all shipments" ON public.customs_shipments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

CREATE POLICY "Customs can manage shipments" ON public.customs_shipments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

-- Revenue
ALTER TABLE public.customs_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customs can view revenue" ON public.customs_revenue
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

-- Officers
ALTER TABLE public.customs_officers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customs can view officers" ON public.customs_officers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

-- Alerts
ALTER TABLE public.customs_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customs can view alerts" ON public.customs_alerts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

CREATE POLICY "Customs can manage alerts" ON public.customs_alerts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Customs Authority')
    );

-- HS Codes (public read)
ALTER TABLE public.customs_hs_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view HS codes" ON public.customs_hs_codes
    FOR SELECT USING (TRUE);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Seed: HS Codes (Common African Trade Items)
INSERT INTO public.customs_hs_codes (hs_code, description, chapter, mfn_rate, afcfta_rate, high_risk) VALUES
('0901.11', 'Coffee, not roasted, not decaffeinated', '09', 20.0, 0.0, FALSE),
('0901.21', 'Coffee, roasted, not decaffeinated', '09', 25.0, 5.0, FALSE),
('1801.00', 'Cocoa beans, whole or broken, raw or roasted', '18', 10.0, 0.0, FALSE),
('1804.00', 'Cocoa butter, fat and oil', '18', 15.0, 0.0, FALSE),
('2523.29', 'Portland cement', '25', 35.0, 5.0, FALSE),
('2709.00', 'Petroleum oils, crude', '27', 5.0, 0.0, TRUE),
('2710.12', 'Light petroleum oils', '27', 15.0, 5.0, TRUE),
('7108.12', 'Gold, unwrought, non-monetary', '71', 0.0, 0.0, TRUE),
('7210.49', 'Flat-rolled steel, zinc-coated', '72', 20.0, 10.0, FALSE),
('8703.23', 'Motor vehicles, 1500-3000cc', '87', 25.0, 15.0, TRUE),
('6109.10', 'T-shirts and singlets, cotton', '61', 25.0, 0.0, FALSE),
('1006.30', 'Semi-milled or wholly milled rice', '10', 75.0, 35.0, FALSE),
('1701.14', 'Raw cane sugar', '17', 100.0, 50.0, FALSE),
('8471.30', 'Portable digital computers', '84', 0.0, 0.0, TRUE),
('8517.12', 'Mobile phones', '85', 0.0, 0.0, TRUE);

-- Seed: Sample Declarations
INSERT INTO public.customs_declarations (
    declaration_type, status, trader_name, trader_tin, origin_country, destination_country,
    port_of_entry, hs_code, hs_code_description, product_description, quantity, unit,
    declared_value, currency, duty_rate, duty_amount, vat_rate, vat_amount, total_taxes,
    risk_score, risk_level, afcfta_eligible, submitted_at
) VALUES
('import', 'under_review', 'Lagos Trading Co', 'NG-12345678', 'Ghana', 'Nigeria', 'Lagos/Apapa Port', '1801.00', 'Cocoa beans', 'Raw cocoa beans for processing', 50000, 'KG', 125000, 'USD', 10.0, 12500, 7.5, 10312.50, 22812.50, 35, 'low', TRUE, NOW() - INTERVAL '2 hours'),
('import', 'submitted', 'Nairobi Imports Ltd', 'KE-87654321', 'Tanzania', 'Kenya', 'Mombasa Port', '0901.11', 'Coffee beans', 'Arabica coffee beans', 25000, 'KG', 87500, 'USD', 20.0, 17500, 16.0, 16800, 34300, 42, 'medium', TRUE, NOW() - INTERVAL '4 hours'),
('export', 'approved', 'Accra Exports GH', 'GH-11223344', 'Ghana', 'Germany', 'Tema Port', '1801.00', 'Cocoa beans', 'Premium cocoa beans for export', 100000, 'KG', 350000, 'USD', 0.0, 0, 0.0, 0, 0, 15, 'low', FALSE, NOW() - INTERVAL '1 day'),
('import', 'under_review', 'Johannesburg Motors', 'ZA-99887766', 'Japan', 'South Africa', 'Durban Port', '8703.23', 'Motor vehicles', 'Toyota Hilux pickup trucks', 50, 'UNIT', 1250000, 'USD', 25.0, 312500, 15.0, 234375, 546875, 78, 'high', FALSE, NOW() - INTERVAL '6 hours'),
('import', 'queried', 'Cairo Electronics', 'EG-55443322', 'China', 'Egypt', 'Alexandria Port', '8517.12', 'Mobile phones', 'Smartphones various brands', 5000, 'UNIT', 450000, 'USD', 0.0, 0, 14.0, 63000, 63000, 85, 'critical', FALSE, NOW() - INTERVAL '3 hours'),
('transit', 'cleared', 'DRC Mining Corp', 'CD-11112222', 'DRC', 'South Africa', 'Kasumbalesa', '7108.12', 'Gold', 'Gold bars for refining', 100, 'KG', 5500000, 'USD', 0.0, 0, 0.0, 0, 0, 92, 'critical', FALSE, NOW() - INTERVAL '12 hours');

-- Seed: Sample Certificates
INSERT INTO public.customs_certificates (
    certificate_number, certificate_type, issuing_country, issuing_authority,
    issue_date, expiry_date, hs_code, product_description, exporter_name,
    exporter_country, status, afcfta_compliant, origin_criteria
) VALUES
('COO-GH-2024-001234', 'origin', 'Ghana', 'Ghana Export Promotion Authority', '2024-01-15', '2025-01-15', '1801.00', 'Cocoa beans', 'Accra Exports GH', 'Ghana', 'verified', TRUE, 'Wholly obtained'),
('COO-KE-2024-005678', 'origin', 'Kenya', 'Kenya Bureau of Standards', '2024-02-01', '2025-02-01', '0901.11', 'Coffee beans', 'Nairobi Coffee Exports', 'Kenya', 'verified', TRUE, 'Wholly obtained'),
('PHY-TZ-2024-000123', 'phytosanitary', 'Tanzania', 'Tanzania Plant Health Services', '2024-02-10', '2024-05-10', '0901.11', 'Coffee beans', 'Dar Coffee Ltd', 'Tanzania', 'verified', FALSE, NULL),
('COO-NG-2024-009999', 'origin', 'Nigeria', 'Nigerian Export Promotion Council', '2024-01-20', '2025-01-20', '2709.00', 'Crude oil', 'NNPC Trading', 'Nigeria', 'pending', FALSE, 'Wholly obtained');

-- Seed: Sample Traders
INSERT INTO public.customs_traders (
    organization_id, tin, customs_code, registration_date, trader_type,
    risk_classification, compliance_score, total_declarations, approved_declarations,
    total_trade_value, aeo_status, aeo_tier
) 
SELECT 
    o.id,
    'TIN-' || SUBSTRING(o.id::TEXT, 1, 8),
    'CUS-' || SUBSTRING(o.id::TEXT, 1, 6),
    CURRENT_DATE - (floor(random() * 1000) || ' days')::interval,
    CASE WHEN o.type = 'buyer' THEN 'importer' ELSE 'exporter' END,
    CASE 
        WHEN o.rating >= 4.5 THEN 'trusted'::public.trader_risk_class
        WHEN o.rating >= 3.5 THEN 'standard'::public.trader_risk_class
        WHEN o.rating >= 2.5 THEN 'elevated'::public.trader_risk_class
        ELSE 'high_risk'::public.trader_risk_class
    END,
    CASE 
        WHEN o.rating >= 4.5 THEN 85 + floor(random() * 15)
        WHEN o.rating >= 3.5 THEN 65 + floor(random() * 20)
        ELSE 40 + floor(random() * 25)
    END,
    floor(random() * 500),
    floor(random() * 450),
    floor(random() * 10000000),
    CASE WHEN o.rating >= 4.0 THEN 'certified' ELSE 'none' END,
    CASE WHEN o.rating >= 4.5 THEN 'gold' WHEN o.rating >= 4.0 THEN 'silver' ELSE NULL END
FROM public.organizations o
WHERE o.verification_status = 'verified'
LIMIT 20;

-- Seed: Sample Alerts
INSERT INTO public.customs_alerts (
    alert_type, severity, title, description, status, ai_confidence
) VALUES
('price_anomaly', 'high', 'Undervaluation detected - Electronics shipment', 'Declared value 60% below market average for similar goods', 'open', 0.89),
('smuggling_pattern', 'critical', 'Circular routing pattern detected', 'Goods re-routed through 3 countries to avoid tariffs', 'investigating', 0.94),
('origin_fraud', 'high', 'Suspicious certificate of origin', 'Certificate details do not match shipping records', 'open', 0.78),
('hs_misclassification', 'medium', 'Potential HS code misclassification', 'Electronics declared as household goods', 'open', 0.72),
('sanctions_match', 'critical', 'Sanctions list match - Entity name', 'Trader name matches OFAC sanctions list entry', 'escalated', 0.96);

-- =============================================================================
-- GRANTS
-- =============================================================================
GRANT ALL ON public.customs_declarations TO anon, authenticated, service_role;
GRANT ALL ON public.customs_reviews TO anon, authenticated, service_role;
GRANT ALL ON public.customs_certificates TO anon, authenticated, service_role;
GRANT ALL ON public.customs_traders TO anon, authenticated, service_role;
GRANT ALL ON public.customs_shipments TO anon, authenticated, service_role;
GRANT ALL ON public.customs_revenue TO anon, authenticated, service_role;
GRANT ALL ON public.customs_officers TO anon, authenticated, service_role;
GRANT ALL ON public.customs_alerts TO anon, authenticated, service_role;
GRANT ALL ON public.customs_hs_codes TO anon, authenticated, service_role;
GRANT SELECT ON public.customs_daily_stats TO anon, authenticated, service_role;

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_customs_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.customs_daily_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
