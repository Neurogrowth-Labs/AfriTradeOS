-- ============================================================================
-- AfriTradeOS - Complete RLS (Row Level Security) Policies
-- Based on actual schema files in /supabase folder
-- Run this script in Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING POLICIES (Clean Slate)
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: ENABLE RLS ON ALL EXISTING TABLES
-- ============================================================================

DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        -- Core tables from schema.sql
        'profiles', 'organizations', 'documents', 'kyc_requests', 'notifications',
        'licenses', 'financiers', 'products', 'wishlist', 'tenders', 'bids',
        'supplier_ratings', 'contract_templates', 'contracts', 'contract_milestones',
        'contract_amendments', 'contract_disputes', 'contract_activities', 'audit_logs',
        -- Enterprise exporter tables
        'export_projects', 'project_documents', 'project_activities', 'trade_partners',
        'market_intelligence', 'fx_rates', 'trade_finance_applications', 'shipment_tracking',
        'trade_tenders', 'tender_bids', 'trade_contracts', 'compliance_checks',
        'kyc_verifications', 'marketing_campaigns', 'exporter_dashboard_kpis',
        -- Finance tables
        'fx_rate_history', 'hedging_suggestions', 'finance_summary'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
            RAISE NOTICE 'Enabled RLS on: %', tbl;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- PROFILES - Core user profile table
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
END IF;
END $$;

-- ============================================================================
-- ORGANIZATIONS - Company/business entities
-- Columns: id, name, type, created_by, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    CREATE POLICY "organizations_select" ON organizations FOR SELECT USING (true);
    CREATE POLICY "organizations_insert" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    CREATE POLICY "organizations_update" ON organizations FOR UPDATE USING (created_by = auth.uid());
END IF;
END $$;

-- ============================================================================
-- DOCUMENTS - User uploaded documents
-- Columns: id, user_id, organization_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    CREATE POLICY "documents_select" ON documents FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY "documents_update" ON documents FOR UPDATE USING (user_id = auth.uid());
END IF;
END $$;

-- ============================================================================
-- AUDIT_LOGS - Activity logging
-- Columns: id, user_id, action, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    CREATE POLICY "audit_logs_select_own" ON audit_logs FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
    );
END IF;
END $$;

-- ============================================================================
-- KYC_REQUESTS - KYC verification requests
-- Columns: id, user_id, organization_id, reviewed_by, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kyc_requests') THEN
    CREATE POLICY "kyc_requests_select" ON kyc_requests FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "kyc_requests_insert" ON kyc_requests FOR INSERT WITH CHECK (user_id = auth.uid());
END IF;
END $$;

-- ============================================================================
-- NOTIFICATIONS - User notifications
-- Columns: id, user_id, type, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());
END IF;
END $$;

-- ============================================================================
-- LICENSES - Business licenses
-- Columns: id, organization_id, user_id, verified, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'licenses') THEN
    CREATE POLICY "licenses_select_own" ON licenses FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "licenses_select_verified" ON licenses FOR SELECT USING (verified = TRUE);
    CREATE POLICY "licenses_insert" ON licenses FOR INSERT WITH CHECK (user_id = auth.uid());
END IF;
END $$;

-- ============================================================================
-- FINANCIERS - Trade finance providers (public read)
-- Columns: id, name, type, is_active, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financiers') THEN
    CREATE POLICY "financiers_select" ON financiers FOR SELECT USING (is_active = TRUE);
END IF;
END $$;

-- ============================================================================
-- PRODUCTS - Marketplace products
-- Columns: id, organization_id, is_active, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
    CREATE POLICY "products_select_active" ON products FOR SELECT USING (is_active = TRUE);
    CREATE POLICY "products_manage" ON products FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = products.organization_id)
    );
END IF;
END $$;

-- ============================================================================
-- WISHLIST - User saved items
-- Columns: id, user_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wishlist') THEN
    CREATE POLICY "wishlist_all" ON wishlist FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
END IF;
END $$;

-- ============================================================================
-- TENDERS (from schema.sql) - RFQ/Procurement tenders
-- Columns: id, organization_id, created_by, status, is_public, ...
-- Note: status uses ENUM type, need to cast for comparison
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenders') THEN
    -- Check if status column exists before creating policy with it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tenders' AND column_name = 'status') THEN
        CREATE POLICY "tenders_select_public" ON tenders FOR SELECT USING (is_public = TRUE AND status::text = 'published');
    ELSE
        CREATE POLICY "tenders_select_public" ON tenders FOR SELECT USING (is_public = TRUE);
    END IF;
    CREATE POLICY "tenders_manage" ON tenders FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = tenders.organization_id)
    );
END IF;
END $$;

-- ============================================================================
-- BIDS - Tender bids (from schema.sql)
-- Columns: id, tender_id, organization_id, submitted_by, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bids') THEN
    CREATE POLICY "bids_select_tender_owner" ON bids FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenders t
            JOIN profiles p ON p.organization_id = t.organization_id
            WHERE t.id = bids.tender_id AND p.id = auth.uid()
        )
    );
    CREATE POLICY "bids_manage_own" ON bids FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = bids.organization_id)
    );
END IF;
END $$;

-- ============================================================================
-- SUPPLIER_RATINGS - Reviews/ratings
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'supplier_ratings') THEN
    CREATE POLICY "supplier_ratings_select" ON supplier_ratings FOR SELECT USING (TRUE);
    CREATE POLICY "supplier_ratings_insert" ON supplier_ratings FOR INSERT WITH CHECK (rated_by_user = auth.uid());
END IF;
END $$;

-- ============================================================================
-- CONTRACT_TEMPLATES - Reusable contract templates
-- Columns: id, organization_id, is_public, created_by, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contract_templates') THEN
    CREATE POLICY "contract_templates_select_public" ON contract_templates FOR SELECT USING (is_public = TRUE);
    CREATE POLICY "contract_templates_manage" ON contract_templates FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = contract_templates.organization_id)
    );
END IF;
END $$;

-- ============================================================================
-- CONTRACTS - Smart contracts
-- Columns: id, buyer_org_id, seller_org_id, buyer_user_id, seller_user_id, created_by, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contracts') THEN
    CREATE POLICY "contracts_select" ON contracts FOR SELECT USING (
        buyer_user_id = auth.uid() OR seller_user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (organization_id = contracts.buyer_org_id OR organization_id = contracts.seller_org_id))
    );
    CREATE POLICY "contracts_update" ON contracts FOR UPDATE USING (
        buyer_user_id = auth.uid() OR seller_user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (organization_id = contracts.buyer_org_id OR organization_id = contracts.seller_org_id))
    );
    CREATE POLICY "contracts_insert" ON contracts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
END IF;
END $$;

-- ============================================================================
-- CONTRACT_MILESTONES, CONTRACT_AMENDMENTS, CONTRACT_DISPUTES, CONTRACT_ACTIVITIES
-- Linked to contracts via contract_id
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contract_milestones') THEN
    CREATE POLICY "contract_milestones_access" ON contract_milestones FOR ALL USING (
        EXISTS (
            SELECT 1 FROM contracts c
            WHERE c.id = contract_milestones.contract_id
            AND (c.buyer_user_id = auth.uid() OR c.seller_user_id = auth.uid())
        )
    );
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contract_amendments') THEN
    CREATE POLICY "contract_amendments_access" ON contract_amendments FOR ALL USING (
        EXISTS (
            SELECT 1 FROM contracts c
            WHERE c.id = contract_amendments.contract_id
            AND (c.buyer_user_id = auth.uid() OR c.seller_user_id = auth.uid())
        )
    );
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contract_disputes') THEN
    CREATE POLICY "contract_disputes_access" ON contract_disputes FOR ALL USING (
        EXISTS (
            SELECT 1 FROM contracts c
            WHERE c.id = contract_disputes.contract_id
            AND (c.buyer_user_id = auth.uid() OR c.seller_user_id = auth.uid())
        )
    );
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contract_activities') THEN
    CREATE POLICY "contract_activities_select" ON contract_activities FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contracts c
            WHERE c.id = contract_activities.contract_id
            AND (c.buyer_user_id = auth.uid() OR c.seller_user_id = auth.uid())
        )
    );
END IF;
END $$;

-- ============================================================================
-- EXPORT_PROJECTS - Enterprise exporter main table
-- Columns: id, organization_id, project_manager_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'export_projects') THEN
    CREATE POLICY "export_projects_access" ON export_projects FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
END IF;
END $$;

-- ============================================================================
-- PROJECT_DOCUMENTS - Documents linked to export projects
-- Columns: id, project_id, uploaded_by, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_documents') THEN
    CREATE POLICY "project_documents_access" ON project_documents FOR ALL USING (
        project_id IN (SELECT id FROM export_projects WHERE organization_id IN
            (SELECT organization_id FROM profiles WHERE id = auth.uid()))
    );
END IF;
END $$;

-- ============================================================================
-- PROJECT_ACTIVITIES - Activity timeline for projects
-- Columns: id, project_id, user_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_activities') THEN
    CREATE POLICY "project_activities_access" ON project_activities FOR ALL USING (
        project_id IN (SELECT id FROM export_projects WHERE organization_id IN
            (SELECT organization_id FROM profiles WHERE id = auth.uid()))
    );
END IF;
END $$;

-- ============================================================================
-- TRADE_PARTNERS - Partner network
-- Columns: id, organization_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trade_partners') THEN
    CREATE POLICY "trade_partners_access" ON trade_partners FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
END IF;
END $$;

-- ============================================================================
-- MARKET_INTELLIGENCE - Public market data
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_intelligence') THEN
    CREATE POLICY "market_intelligence_select" ON market_intelligence FOR SELECT USING (true);
END IF;
END $$;

-- ============================================================================
-- FX_RATES - Foreign exchange rates (public)
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fx_rates') THEN
    CREATE POLICY "fx_rates_select" ON fx_rates FOR SELECT USING (true);
END IF;
END $$;

-- ============================================================================
-- FX_RATE_HISTORY - Historical FX data (public)
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fx_rate_history') THEN
    CREATE POLICY "fx_rate_history_select" ON fx_rate_history FOR SELECT USING (true);
END IF;
END $$;

-- ============================================================================
-- HEDGING_SUGGESTIONS - AI hedging recommendations (public active)
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hedging_suggestions') THEN
    CREATE POLICY "hedging_suggestions_select" ON hedging_suggestions FOR SELECT USING (is_active = TRUE);
END IF;
END $$;

-- ============================================================================
-- FINANCE_SUMMARY - User finance summary
-- Columns: id, user_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'finance_summary') THEN
    CREATE POLICY "finance_summary_access" ON finance_summary FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
END IF;
END $$;

-- ============================================================================
-- TRADE_FINANCE_APPLICATIONS - Finance applications
-- Columns: id, organization_id, project_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trade_finance_applications') THEN
    CREATE POLICY "trade_finance_applications_access" ON trade_finance_applications FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
END IF;
END $$;

-- ============================================================================
-- SHIPMENT_TRACKING - Shipment tracking
-- Columns: id, project_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shipment_tracking') THEN
    CREATE POLICY "shipment_tracking_access" ON shipment_tracking FOR ALL USING (
        project_id IN (SELECT id FROM export_projects WHERE organization_id IN
            (SELECT organization_id FROM profiles WHERE id = auth.uid()))
    );
END IF;
END $$;

-- ============================================================================
-- TRADE_TENDERS - Enterprise tenders (public read)
-- Columns: id, issuer_name, status, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trade_tenders') THEN
    CREATE POLICY "trade_tenders_select" ON trade_tenders FOR SELECT USING (true);
END IF;
END $$;

-- ============================================================================
-- TENDER_BIDS - Bids on trade tenders
-- Columns: id, tender_id, organization_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tender_bids') THEN
    CREATE POLICY "tender_bids_access" ON tender_bids FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
END IF;
END $$;

-- ============================================================================
-- TRADE_CONTRACTS - Enterprise contracts
-- Columns: id, organization_id, counterparty_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trade_contracts') THEN
    CREATE POLICY "trade_contracts_access" ON trade_contracts FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
END IF;
END $$;

-- ============================================================================
-- COMPLIANCE_CHECKS - Compliance verification
-- Columns: id, project_id, checked_by, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'compliance_checks') THEN
    CREATE POLICY "compliance_checks_access" ON compliance_checks FOR ALL USING (
        project_id IN (SELECT id FROM export_projects WHERE organization_id IN
            (SELECT organization_id FROM profiles WHERE id = auth.uid()))
    );
END IF;
END $$;

-- ============================================================================
-- KYC_VERIFICATIONS - Enterprise KYC
-- Columns: id, organization_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kyc_verifications') THEN
    CREATE POLICY "kyc_verifications_access" ON kyc_verifications FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
END IF;
END $$;

-- ============================================================================
-- MARKETING_CAMPAIGNS - Marketing campaigns
-- Columns: id, organization_id, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketing_campaigns') THEN
    CREATE POLICY "marketing_campaigns_access" ON marketing_campaigns FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
END IF;
END $$;

-- ============================================================================
-- EXPORTER_DASHBOARD_KPIS - Dashboard metrics
-- Columns: id, organization_id, period_date, ...
-- ============================================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exporter_dashboard_kpis') THEN
    CREATE POLICY "exporter_dashboard_kpis_access" ON exporter_dashboard_kpis FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
END IF;
END $$;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Script completed. Check the Messages tab for which tables were processed.
-- Test signup/login again after running this script.
