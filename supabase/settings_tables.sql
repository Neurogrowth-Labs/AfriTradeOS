-- =============================================================================
-- AFRITRADE OS - SETTINGS & PROFILE SYSTEM TABLES
-- =============================================================================

-- Add new columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Accra';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Add new columns to organizations table
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tax_vat_number TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS brand_colors JSONB DEFAULT '{"primary": "#0B1F33", "secondary": "#163A5F"}';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'USD';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Accra';

-- =============================================================================
-- USER PREFERENCES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Notification Settings (JSONB for flexibility)
    notifications JSONB DEFAULT '{
        "email": true,
        "sms": false,
        "push": true,
        "tradeUpdates": true,
        "complianceAlerts": true,
        "marketOpportunities": true,
        "financeReminders": true,
        "contractRenewals": true,
        "shipmentTracking": true,
        "criticalAlerts": true
    }',

    -- Localization
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'Africa/Accra',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    number_format TEXT DEFAULT '1,234.56',

    -- Privacy Controls (JSONB)
    privacy JSONB DEFAULT '{
        "profileVisibility": "connections",
        "tradeHistorySharing": true,
        "aiAnalytics": true,
        "marketingEmails": false
    }',

    -- UI Preferences (JSONB)
    ui JSONB DEFAULT '{
        "theme": "light",
        "dashboardLayout": "default",
        "sidebarCollapsed": false
    }',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- USER SECURITY TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_security (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_method TEXT CHECK (two_factor_method IN ('authenticator', 'sms', 'email')),
    two_factor_secret TEXT,
    two_factor_backup_codes TEXT[],

    last_password_change TIMESTAMP WITH TIME ZONE,
    password_expires_at TIMESTAMP WITH TIME ZONE,

    trusted_devices JSONB DEFAULT '[]',
    sso_providers JSONB DEFAULT '[
        {"provider": "google", "connected": false},
        {"provider": "microsoft", "connected": false},
        {"provider": "saml", "connected": false}
    ]',

    security_questions JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own security settings" ON public.user_security
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings" ON public.user_security
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings" ON public.user_security
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- USER SESSIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    device_info TEXT,
    browser TEXT,
    os TEXT,
    ip_address INET,
    location TEXT,

    is_current BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active_at DESC);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- INTEGRATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    type TEXT CHECK (type IN ('erp', 'accounting', 'payment', 'shipping', 'customs', 'banking', 'insurance', 'other')),
    provider TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'pending', 'error')),

    api_key TEXT,
    webhook_url TEXT,
    webhook_secret TEXT,
    credentials JSONB,
    config JSONB,

    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT CHECK (sync_status IN ('success', 'failed', 'in_progress')),
    error_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_org_id ON public.integrations(organization_id);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own integrations" ON public.integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations" ON public.integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON public.integrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON public.integrations
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- API KEYS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL,

    permissions TEXT[] DEFAULT '{}',

    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    rate_limit INTEGER DEFAULT 1000,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON public.api_keys(key_prefix);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- AI DATA SETTINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_ai_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    enable_ai_insights BOOLEAN DEFAULT TRUE,
    enable_predictions BOOLEAN DEFAULT TRUE,
    data_sharing_consent BOOLEAN DEFAULT FALSE,
    model_training_opt_in BOOLEAN DEFAULT FALSE,
    personalized_recommendations BOOLEAN DEFAULT TRUE,
    anonymized_analytics BOOLEAN DEFAULT TRUE,
    data_retention_days INTEGER DEFAULT 365,

    last_data_export_at TIMESTAMP WITH TIME ZONE,
    delete_requested_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI settings" ON public.user_ai_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI settings" ON public.user_ai_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings" ON public.user_ai_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- BILLING INFO TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.billing_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'professional', 'enterprise')),
    plan_name TEXT DEFAULT 'Free Plan',
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),

    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,

    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing')),

    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.billing_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own billing info" ON public.billing_info
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- USAGE METRICS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    trades_created INTEGER DEFAULT 0,
    trades_limit INTEGER DEFAULT 10,

    documents_uploaded INTEGER DEFAULT 0,
    documents_limit INTEGER DEFAULT 50,

    api_calls INTEGER DEFAULT 0,
    api_calls_limit INTEGER DEFAULT 1000,

    storage_used_mb NUMERIC(10,2) DEFAULT 0,
    storage_limit_mb NUMERIC(10,2) DEFAULT 100,

    team_members INTEGER DEFAULT 1,
    team_members_limit INTEGER DEFAULT 1,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage metrics" ON public.usage_metrics
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- PAYMENT METHODS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    type TEXT CHECK (type IN ('card', 'bank_account', 'mobile_money')),
    brand TEXT,
    last4 TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,

    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    billing_address TEXT,

    stripe_payment_method_id TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment methods" ON public.payment_methods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON public.payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON public.payment_methods
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- INVOICES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    invoice_number TEXT UNIQUE NOT NULL,

    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',

    status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),

    issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,

    download_url TEXT,
    stripe_invoice_id TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices" ON public.invoices
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- TEAM MEMBERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    email TEXT NOT NULL,
    full_name TEXT,

    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    department TEXT,
    title TEXT,

    permissions TEXT[] DEFAULT '{}',

    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),

    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_team_members_org_id ON public.team_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team members can view members in their organization
CREATE POLICY "Team members can view their organization" ON public.team_members
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- Only admins/owners can modify team members
CREATE POLICY "Admins can manage team members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE user_id = auth.uid()
            AND organization_id = team_members.organization_id
            AND role IN ('owner', 'admin')
        )
    );

-- =============================================================================
-- ROLES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,

    permissions JSONB DEFAULT '[]',

    is_default BOOLEAN DEFAULT FALSE,
    member_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(organization_id, name)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_roles_org_id ON public.roles(organization_id);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view roles in their organization" ON public.roles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- =============================================================================
-- TRADE ASSOCIATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.trade_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name TEXT NOT NULL,
    region TEXT,
    description TEXT,
    benefits TEXT[] DEFAULT '{}',
    website TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Trade Association Links
CREATE TABLE IF NOT EXISTS public.user_trade_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    association_id UUID REFERENCES public.trade_associations(id) ON DELETE CASCADE,

    membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('active', 'pending', 'expired')),
    membership_id TEXT,

    connected_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(user_id, association_id)
);

-- Enable RLS
ALTER TABLE public.trade_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trade_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trade associations" ON public.trade_associations
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view their associations" ON public.user_trade_associations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their associations" ON public.user_trade_associations
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- Insert default trade associations
-- =============================================================================
INSERT INTO public.trade_associations (name, region, description, benefits) VALUES
('African Continental Free Trade Area (AfCFTA)', 'Africa', 'Pan-African free trade agreement',
 ARRAY['Preferential tariffs', 'Rules of origin benefits', 'Trade facilitation', 'Market access to 54 countries']),
('ECOWAS Trade Network', 'West Africa', 'Economic Community of West African States trade network',
 ARRAY['Regional market access', 'Customs cooperation', 'Free movement of goods']),
('COMESA Business Council', 'Eastern & Southern Africa', 'Common Market for Eastern and Southern Africa',
 ARRAY['Preferential trade area', 'Simplified customs procedures', 'Investment promotion']),
('SADC Trade Protocol', 'Southern Africa', 'Southern African Development Community trade protocol',
 ARRAY['Duty-free trade', 'Non-tariff barrier reduction', 'Trade facilitation']),
('EAC Single Customs Territory', 'East Africa', 'East African Community customs union',
 ARRAY['Single customs territory', 'Common external tariff', 'Free movement of goods'])
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Update audit_logs table if it exists
-- =============================================================================
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);

-- =============================================================================
-- Functions for automatic timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_security_updated_at ON public.user_security;
CREATE TRIGGER update_user_security_updated_at
    BEFORE UPDATE ON public.user_security
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON public.integrations;
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_ai_settings_updated_at ON public.user_ai_settings;
CREATE TRIGGER update_user_ai_settings_updated_at
    BEFORE UPDATE ON public.user_ai_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_info_updated_at ON public.billing_info;
CREATE TRIGGER update_billing_info_updated_at
    BEFORE UPDATE ON public.billing_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_metrics_updated_at ON public.usage_metrics;
CREATE TRIGGER update_usage_metrics_updated_at
    BEFORE UPDATE ON public.usage_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Function to initialize user settings on signup
-- =============================================================================
CREATE OR REPLACE FUNCTION initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user preferences
    INSERT INTO public.user_preferences (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create user security settings
    INSERT INTO public.user_security (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create AI settings
    INSERT INTO public.user_ai_settings (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create usage metrics
    INSERT INTO public.usage_metrics (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create billing info (free plan by default)
    INSERT INTO public.billing_info (user_id, plan_type, plan_name, current_period_start, current_period_end)
    VALUES (NEW.id, 'free', 'Free Plan', NOW(), NOW() + INTERVAL '1 year')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to initialize settings for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize settings after profile creation
DROP TRIGGER IF EXISTS init_user_settings ON public.profiles;
CREATE TRIGGER init_user_settings
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION initialize_user_settings();

-- =============================================================================
-- Grant permissions
-- =============================================================================
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_security TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.integrations TO authenticated;
GRANT ALL ON public.api_keys TO authenticated;
GRANT ALL ON public.user_ai_settings TO authenticated;
GRANT SELECT ON public.billing_info TO authenticated;
GRANT SELECT ON public.usage_metrics TO authenticated;
GRANT ALL ON public.payment_methods TO authenticated;
GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.team_members TO authenticated;
GRANT ALL ON public.roles TO authenticated;
GRANT SELECT ON public.trade_associations TO authenticated;
GRANT ALL ON public.user_trade_associations TO authenticated;
