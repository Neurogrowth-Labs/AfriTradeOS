-- =============================================================================
-- AFRITRADE OS - GOVERNMENT AGENCY MODULE SCHEMA
-- =============================================================================

-- =============================================================================
-- 1. POLICIES TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.gov_policies CASCADE;

CREATE TABLE public.gov_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('tariff', 'customs', 'sanitary', 'trade_facilitation', 'digital_trade', 'investment', 'environment', 'labor')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'under_review', 'archived', 'expired')),
    effective_date DATE,
    expiry_date DATE,
    issuing_authority TEXT,
    country TEXT,
    description TEXT,
    document_url TEXT,
    compliance_rate NUMERIC(5,2) DEFAULT 0,
    affected_sectors TEXT[],
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gov_policies_category ON gov_policies(category);
CREATE INDEX idx_gov_policies_status ON gov_policies(status);
CREATE INDEX idx_gov_policies_country ON gov_policies(country);

-- =============================================================================
-- 2. COMPLIANCE CASES TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.gov_compliance_cases CASCADE;

CREATE TABLE public.gov_compliance_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_number TEXT UNIQUE,
    title TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    policy_id UUID REFERENCES public.gov_policies(id) ON DELETE SET NULL,
    violation_type TEXT CHECK (violation_type IN ('tariff_evasion', 'origin_fraud', 'undervaluation', 'smuggling', 'documentation', 'sanctions', 'sps_violation', 'ip_infringement', 'other')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'hearing', 'resolved', 'escalated', 'closed')),
    assigned_to TEXT,
    description TEXT,
    penalty_amount NUMERIC,
    penalty_currency TEXT DEFAULT 'USD',
    resolution TEXT,
    evidence_documents UUID[],
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_gov_cases_status ON gov_compliance_cases(status);
CREATE INDEX idx_gov_cases_severity ON gov_compliance_cases(severity);
CREATE INDEX idx_gov_cases_entity ON gov_compliance_cases(entity_id);

-- =============================================================================
-- 3. TRADE AGREEMENTS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.gov_trade_agreements CASCADE;

CREATE TABLE public.gov_trade_agreements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    agreement_type TEXT CHECK (agreement_type IN ('FTA', 'CU', 'PTA', 'BIT', 'EPA', 'CEPA')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'negotiation', 'signed', 'ratification', 'suspended', 'expired')),
    member_countries TEXT[] NOT NULL,
    effective_date DATE,
    expiry_date DATE,
    coverage_area TEXT,
    tariff_reduction_pct NUMERIC(5,2),
    utilization_rate NUMERIC(5,2) DEFAULT 0,
    trade_volume NUMERIC DEFAULT 0,
    key_provisions TEXT[],
    secretariat TEXT,
    website TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gov_agreements_status ON gov_trade_agreements(status);
CREATE INDEX idx_gov_agreements_type ON gov_trade_agreements(agreement_type);

-- =============================================================================
-- 4. TARIFF SCHEDULES TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.gov_tariff_schedules CASCADE;

CREATE TABLE public.gov_tariff_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agreement_id UUID REFERENCES public.gov_trade_agreements(id) ON DELETE CASCADE,
    hs_code TEXT NOT NULL,
    product_description TEXT NOT NULL,
    mfn_rate NUMERIC(5,2) NOT NULL,
    preferential_rate NUMERIC(5,2),
    margin_of_preference NUMERIC(5,2),
    origin_criteria TEXT,
    sensitive_list BOOLEAN DEFAULT FALSE,
    exclusion_list BOOLEAN DEFAULT FALSE,
    effective_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gov_tariffs_hs ON gov_tariff_schedules(hs_code);
CREATE INDEX idx_gov_tariffs_agreement ON gov_tariff_schedules(agreement_id);

-- =============================================================================
-- 5. BORDER CROSSINGS / TRADE FLOW POINTS TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.gov_border_posts CASCADE;

CREATE TABLE public.gov_border_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    post_type TEXT CHECK (post_type IN ('land', 'sea', 'air', 'rail')),
    country TEXT NOT NULL,
    adjacent_country TEXT,
    corridor TEXT,
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    avg_clearance_hours NUMERIC(6,2) DEFAULT 0,
    daily_volume INTEGER DEFAULT 0,
    congestion_level TEXT DEFAULT 'low' CHECK (congestion_level IN ('low', 'moderate', 'high', 'severe')),
    operational_status TEXT DEFAULT 'operational' CHECK (operational_status IN ('operational', 'limited', 'closed', 'maintenance')),
    one_stop_border BOOLEAN DEFAULT FALSE,
    operating_hours TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gov_border_country ON gov_border_posts(country);
CREATE INDEX idx_gov_border_corridor ON gov_border_posts(corridor);

-- =============================================================================
-- 6. TRUSTED TRADER PROGRAM TABLE
-- =============================================================================
DROP TABLE IF EXISTS public.gov_trusted_traders CASCADE;

CREATE TABLE public.gov_trusted_traders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('gold', 'silver', 'bronze', 'standard')),
    compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
    trade_volume NUMERIC DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    violations_count INTEGER DEFAULT 0,
    last_audit_date DATE,
    next_audit_date DATE,
    certified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    benefits TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gov_trusted_org ON gov_trusted_traders(organization_id);
CREATE INDEX idx_gov_trusted_tier ON gov_trusted_traders(tier);

-- =============================================================================
-- RLS POLICIES (Government role can read all)
-- =============================================================================

ALTER TABLE public.gov_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_compliance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_trade_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_tariff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_border_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_trusted_traders ENABLE ROW LEVEL SECURITY;

-- Government users can read everything
CREATE POLICY "Gov users can view all policies" ON public.gov_policies FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can view all cases" ON public.gov_compliance_cases FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can view all agreements" ON public.gov_trade_agreements FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can view all tariffs" ON public.gov_tariff_schedules FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can view all border posts" ON public.gov_border_posts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can view all trusted traders" ON public.gov_trusted_traders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);

-- Gov users can manage data
CREATE POLICY "Gov users can manage policies" ON public.gov_policies FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can manage cases" ON public.gov_compliance_cases FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can manage agreements" ON public.gov_trade_agreements FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can manage tariffs" ON public.gov_tariff_schedules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can manage border posts" ON public.gov_border_posts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);
CREATE POLICY "Gov users can manage trusted traders" ON public.gov_trusted_traders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Government Agency')
);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Seed: Policies
INSERT INTO public.gov_policies (title, category, status, effective_date, issuing_authority, country, description, compliance_rate, affected_sectors, tags) VALUES
('AfCFTA Tariff Concession Schedule', 'tariff', 'active', '2021-01-01', 'African Union', NULL, 'Continental tariff reduction program under AfCFTA Phase I', 72.5, ARRAY['manufacturing', 'agriculture', 'mining'], ARRAY['AfCFTA', 'tariff']),
('ECOWAS Common External Tariff', 'tariff', 'active', '2015-01-01', 'ECOWAS Commission', NULL, 'Harmonized external tariff for ECOWAS member states', 89.3, ARRAY['all'], ARRAY['ECOWAS', 'CET']),
('Sanitary & Phytosanitary Protocol', 'sanitary', 'active', '2022-06-15', 'AU-IBAR', NULL, 'Standards for plant and animal health in cross-border trade', 65.8, ARRAY['agriculture', 'livestock', 'fisheries'], ARRAY['SPS', 'food_safety']),
('Digital Trade Facilitation Act', 'digital_trade', 'active', '2023-03-01', 'Ministry of Trade', 'Ghana', 'Paperless trade and electronic documentation requirements', 58.2, ARRAY['all'], ARRAY['digital', 'paperless']),
('Rules of Origin Protocol', 'customs', 'active', '2021-01-01', 'AfCFTA Secretariat', NULL, 'Product-specific and general rules for origin determination', 68.4, ARRAY['manufacturing', 'agriculture'], ARRAY['AfCFTA', 'RoO']),
('Anti-Dumping Regulations 2024', 'trade_facilitation', 'active', '2024-01-15', 'Trade Commission', 'Nigeria', 'Protection against dumped imports from non-member states', 81.0, ARRAY['steel', 'textiles', 'chemicals'], ARRAY['anti-dumping', 'safeguard']),
('Transit Goods Regulation', 'customs', 'draft', NULL, 'EAC Secretariat', NULL, 'Harmonized procedures for transit goods within EAC corridor', 0, ARRAY['logistics', 'transport'], ARRAY['transit', 'EAC']),
('Investment Promotion Act', 'investment', 'active', '2023-09-01', 'Ministry of Finance', 'Kenya', 'Incentives for foreign direct investment in manufacturing', 74.6, ARRAY['manufacturing', 'technology'], ARRAY['FDI', 'incentives']),
('Environmental Standards for Export', 'environment', 'under_review', NULL, 'EPA', 'Ghana', 'Environmental compliance requirements for export-oriented industries', 45.0, ARRAY['mining', 'manufacturing', 'agriculture'], ARRAY['environment', 'ESG']),
('SADC Trade in Services Protocol', 'trade_facilitation', 'active', '2022-01-01', 'SADC Secretariat', NULL, 'Framework for liberalization of trade in services', 52.3, ARRAY['services', 'finance', 'telecom'], ARRAY['SADC', 'services']);

-- Seed: Compliance Cases
INSERT INTO public.gov_compliance_cases (case_number, title, entity_name, violation_type, severity, status, assigned_to, description, penalty_amount, country) VALUES
('CC-2024-001', 'Origin certificate fraud - textile shipment', 'Atlas Trading Co', 'origin_fraud', 'high', 'investigating', 'Officer Diallo', 'Fraudulent certificate of origin for textile goods claiming ECOWAS preference', 125000, 'Nigeria'),
('CC-2024-002', 'Customs undervaluation - electronics', 'Quick Import Ltd', 'undervaluation', 'critical', 'open', 'Officer Kwame', 'Systematic undervaluation of electronics imports by 40-60%', 450000, 'Ghana'),
('CC-2024-003', 'SPS violation - expired phytosanitary cert', 'Green Valley Farms', 'sps_violation', 'medium', 'hearing', 'Officer Mwangi', 'Agricultural exports with expired phytosanitary documentation', 35000, 'Kenya'),
('CC-2024-004', 'Sanctions evasion via transit route', 'Nile Valley Imports', 'sanctions', 'critical', 'escalated', 'Officer Farouk', 'Goods re-routed through multiple countries to evade sanctions', 800000, 'Egypt'),
('CC-2024-005', 'HS Code misclassification - reduced duty', 'MadaTrade SARL', 'tariff_evasion', 'low', 'resolved', 'Officer Rina', 'Minor misclassification of vanilla extract HS code', 8500, 'Madagascar'),
('CC-2024-006', 'Counterfeit goods at port inspection', 'Unknown Entity', 'ip_infringement', 'high', 'investigating', 'Officer Mandla', 'Container of counterfeit branded goods seized at Durban port', 200000, 'South Africa'),
('CC-2024-007', 'Documentation fraud - bill of lading', 'Trans-Sahel Logistics', 'documentation', 'medium', 'open', 'Officer Diop', 'Altered bill of lading showing different origin port', 75000, 'Senegal'),
('CC-2024-008', 'Prohibited substance in food export', 'Sahel Trading Corp', 'sps_violation', 'high', 'investigating', 'Officer Fatima', 'Aflatoxin levels exceeding EU MRL in groundnut exports', 150000, 'Niger');

-- Seed: Trade Agreements
INSERT INTO public.gov_trade_agreements (name, short_name, agreement_type, status, member_countries, effective_date, coverage_area, tariff_reduction_pct, utilization_rate, trade_volume, key_provisions, secretariat) VALUES
('African Continental Free Trade Area', 'AfCFTA', 'FTA', 'active', ARRAY['Ghana','Nigeria','Kenya','South Africa','Egypt','Ethiopia','Tanzania','Rwanda','Senegal','Morocco','Ivory Coast','Cameroon','DRC','Uganda','Zambia','Zimbabwe','Mozambique','Angola','Botswana','Namibia','Madagascar','Mali','Niger','Burkina Faso','Benin','Togo','Guinea','Sierra Leone','Liberia','Gambia','Mauritania','Tunisia','Algeria','Libya','Sudan','South Sudan','Somalia','Djibouti','Eritrea','Malawi','Lesotho','Eswatini','Mauritius','Seychelles','Comoros','Sao Tome','Cape Verde','Equatorial Guinea','Gabon','Congo','Central African Republic','Chad'], '2021-01-01', 'Continental', 90.0, 28.4, 42500000000, ARRAY['Tariff liberalization 90% of goods','Rules of Origin protocol','Trade in Services','Investment protocol','IP rights','Competition policy','Digital trade'], 'Accra, Ghana'),
('Southern African Development Community', 'SADC', 'FTA', 'active', ARRAY['South Africa','Botswana','Namibia','Lesotho','Eswatini','Mozambique','Zimbabwe','Zambia','Malawi','Tanzania','DRC','Madagascar','Mauritius','Seychelles','Comoros','Angola'], '2008-08-17', 'Southern Africa', 85.0, 52.1, 18900000000, ARRAY['Free trade area','Customs cooperation','SPS harmonization','Trade facilitation'], 'Gaborone, Botswana'),
('East African Community', 'EAC', 'CU', 'active', ARRAY['Kenya','Tanzania','Uganda','Rwanda','Burundi','South Sudan','DRC'], '2005-01-01', 'East Africa', 100.0, 67.3, 8200000000, ARRAY['Customs Union','Common Market','Monetary Union roadmap','Infrastructure development'], 'Arusha, Tanzania'),
('Economic Community of West African States', 'ECOWAS', 'CU', 'active', ARRAY['Nigeria','Ghana','Senegal','Ivory Coast','Mali','Burkina Faso','Niger','Guinea','Sierra Leone','Liberia','Gambia','Togo','Benin','Cape Verde','Guinea-Bissau'], '1975-05-28', 'West Africa', 100.0, 45.8, 12400000000, ARRAY['Common External Tariff','Free movement of persons','ETLS scheme','Trade liberalization'], 'Abuja, Nigeria'),
('Common Market for Eastern and Southern Africa', 'COMESA', 'FTA', 'active', ARRAY['Egypt','Kenya','Ethiopia','Zambia','Zimbabwe','DRC','Uganda','Rwanda','Burundi','Malawi','Mauritius','Madagascar','Seychelles','Comoros','Djibouti','Eritrea','Sudan','Libya','Tunisia','Eswatini','Somalia'], '2000-10-31', 'Eastern & Southern Africa', 80.0, 38.7, 14300000000, ARRAY['Free Trade Area','Customs Union roadmap','Regional payment system','Trade facilitation'], 'Lusaka, Zambia'),
('EU-Africa Economic Partnership', 'EPA', 'EPA', 'active', ARRAY['Ghana','Ivory Coast','Kenya','South Africa','Mozambique','Cameroon','Madagascar','Mauritius','Seychelles','Zimbabwe'], '2016-09-01', 'EU-Africa', 75.0, 42.5, 28100000000, ARRAY['Market access to EU','Developmental provisions','Rules of Origin','SPS measures','TBT cooperation'], 'Brussels, Belgium');

-- Seed: Tariff Schedules
INSERT INTO public.gov_tariff_schedules (agreement_id, hs_code, product_description, mfn_rate, preferential_rate, margin_of_preference, origin_criteria, sensitive_list) VALUES
((SELECT id FROM gov_trade_agreements WHERE short_name = 'AfCFTA' LIMIT 1), '0901.11', 'Coffee, not roasted, not decaffeinated', 20.0, 0.0, 20.0, 'Wholly obtained', false),
((SELECT id FROM gov_trade_agreements WHERE short_name = 'AfCFTA' LIMIT 1), '1801.00', 'Cocoa beans, whole or broken, raw or roasted', 10.0, 0.0, 10.0, 'Wholly obtained', false),
((SELECT id FROM gov_trade_agreements WHERE short_name = 'AfCFTA' LIMIT 1), '2523.29', 'Portland cement', 35.0, 5.0, 30.0, 'CTH + 30% DVA', false),
((SELECT id FROM gov_trade_agreements WHERE short_name = 'AfCFTA' LIMIT 1), '7210.49', 'Flat-rolled steel, zinc-coated', 20.0, 10.0, 10.0, 'CTSH + 40% DVA', true),
((SELECT id FROM gov_trade_agreements WHERE short_name = 'AfCFTA' LIMIT 1), '6109.10', 'T-shirts and singlets, cotton', 25.0, 0.0, 25.0, 'CC + 35% DVA', false),
((SELECT id FROM gov_trade_agreements WHERE short_name = 'SADC' LIMIT 1), '0901.11', 'Coffee, not roasted, not decaffeinated', 20.0, 0.0, 20.0, 'Wholly obtained', false),
((SELECT id FROM gov_trade_agreements WHERE short_name = 'SADC' LIMIT 1), '8703.23', 'Motor vehicles, 1500-3000cc', 25.0, 0.0, 25.0, '45% RVC', true),
((SELECT id FROM gov_trade_agreements WHERE short_name = 'EAC' LIMIT 1), '1006.30', 'Semi-milled or wholly milled rice', 75.0, 0.0, 75.0, 'Wholly obtained', true),
((SELECT id FROM gov_trade_agreements WHERE short_name = 'EAC' LIMIT 1), '1701.14', 'Raw cane sugar', 100.0, 0.0, 100.0, 'Wholly obtained', true),
((SELECT id FROM gov_trade_agreements WHERE short_name = 'ECOWAS' LIMIT 1), '2710.12', 'Light petroleum oils', 15.0, 0.0, 15.0, 'CC', false);

-- Seed: Border Posts
INSERT INTO public.gov_border_posts (name, post_type, country, adjacent_country, corridor, avg_clearance_hours, daily_volume, congestion_level, one_stop_border, operating_hours) VALUES
('Beitbridge', 'land', 'South Africa', 'Zimbabwe', 'North-South Corridor', 48.0, 850, 'severe', false, '06:00-22:00'),
('Chirundu', 'land', 'Zambia', 'Zimbabwe', 'North-South Corridor', 12.0, 420, 'moderate', true, '24/7'),
('Malaba', 'land', 'Kenya', 'Uganda', 'Northern Corridor', 24.0, 380, 'high', true, '24/7'),
('Busia', 'land', 'Kenya', 'Uganda', 'Northern Corridor', 18.0, 290, 'moderate', true, '24/7'),
('Dar es Salaam Port', 'sea', 'Tanzania', NULL, 'Central Corridor', 72.0, 1200, 'high', false, '24/7'),
('Mombasa Port', 'sea', 'Kenya', NULL, 'Northern Corridor', 96.0, 1500, 'severe', false, '24/7'),
('Tema Port', 'sea', 'Ghana', NULL, 'Abidjan-Lagos Corridor', 48.0, 980, 'moderate', false, '24/7'),
('Lagos/Apapa Port', 'sea', 'Nigeria', NULL, 'Abidjan-Lagos Corridor', 120.0, 2200, 'severe', false, '24/7'),
('Durban Port', 'sea', 'South Africa', NULL, 'North-South Corridor', 36.0, 3100, 'moderate', false, '24/7'),
('Kasumbalesa', 'land', 'DRC', 'Zambia', 'North-South Corridor', 36.0, 310, 'high', false, '06:00-18:00'),
('Seme/Krake', 'land', 'Nigeria', 'Benin', 'Abidjan-Lagos Corridor', 8.0, 450, 'moderate', true, '24/7'),
('Aflao/Lome', 'land', 'Ghana', 'Togo', 'Abidjan-Lagos Corridor', 6.0, 380, 'low', true, '24/7'),
('Namanga', 'land', 'Kenya', 'Tanzania', 'Arusha Corridor', 4.0, 220, 'low', true, '24/7'),
('Rusumo', 'land', 'Rwanda', 'Tanzania', 'Central Corridor', 8.0, 180, 'low', true, '06:00-22:00'),
('Jomo Kenyatta Intl Airport', 'air', 'Kenya', NULL, 'Air Freight', 6.0, 650, 'low', false, '24/7');

-- Seed: Trusted Traders (link to organizations if they exist)
INSERT INTO public.gov_trusted_traders (organization_id, tier, compliance_score, trade_volume, total_trades, violations_count, last_audit_date, next_audit_date, benefits) 
SELECT o.id, 
    CASE 
        WHEN o.rating >= 4.5 THEN 'gold'
        WHEN o.rating >= 3.5 THEN 'silver'
        WHEN o.rating >= 2.5 THEN 'bronze'
        ELSE 'standard'
    END,
    CASE 
        WHEN o.rating >= 4.5 THEN 92 + floor(random() * 8)
        WHEN o.rating >= 3.5 THEN 75 + floor(random() * 15)
        WHEN o.rating >= 2.5 THEN 55 + floor(random() * 20)
        ELSE 30 + floor(random() * 25)
    END,
    floor(random() * 50000000),
    floor(random() * 5000),
    CASE WHEN o.rating >= 4.0 THEN 0 ELSE floor(random() * 5) END,
    CURRENT_DATE - (floor(random() * 180) || ' days')::interval,
    CURRENT_DATE + (floor(random() * 365) || ' days')::interval,
    CASE 
        WHEN o.rating >= 4.5 THEN ARRAY['Fast-track clearance','Reduced inspections','Priority processing','Self-assessment']
        WHEN o.rating >= 3.5 THEN ARRAY['Simplified procedures','Reduced bond','Periodic review']
        WHEN o.rating >= 2.5 THEN ARRAY['Standard processing','Online submissions']
        ELSE ARRAY['Basic access','Manual processing']
    END
FROM public.organizations o
WHERE o.verification_status = 'verified'
LIMIT 50;

-- =============================================================================
-- GRANTS
-- =============================================================================
GRANT ALL ON public.gov_policies TO anon, authenticated, service_role;
GRANT ALL ON public.gov_compliance_cases TO anon, authenticated, service_role;
GRANT ALL ON public.gov_trade_agreements TO anon, authenticated, service_role;
GRANT ALL ON public.gov_tariff_schedules TO anon, authenticated, service_role;
GRANT ALL ON public.gov_border_posts TO anon, authenticated, service_role;
GRANT ALL ON public.gov_trusted_traders TO anon, authenticated, service_role;
