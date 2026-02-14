-- =============================================================================
-- AFRITRADE OS - FINANCE MODULE: FX Rates & Hedging Tables
-- =============================================================================

-- 1. FX Rates Table
DROP TABLE IF EXISTS public.fx_rates CASCADE;

CREATE TABLE public.fx_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pair TEXT NOT NULL UNIQUE,          -- e.g. 'USD/NGN'
    rate NUMERIC(18,4) NOT NULL,
    change NUMERIC(18,4) DEFAULT 0,
    change_percent NUMERIC(8,4) DEFAULT 0,
    high_24h NUMERIC(18,4),
    low_24h NUMERIC(18,4),
    source TEXT DEFAULT 'system',       -- 'system', 'api', 'manual'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fx_rates_pair ON fx_rates(pair);

-- Seed FX rates
INSERT INTO public.fx_rates (pair, rate, change, change_percent, high_24h, low_24h) VALUES
('USD/NGN', 1550.25, -12.50, -0.80, 1565.00, 1540.00),
('USD/KES', 129.45, 0.85, 0.66, 130.20, 128.50),
('USD/ZAR', 18.72, -0.15, -0.80, 19.10, 18.55),
('USD/GHS', 15.80, 0.22, 1.41, 16.05, 15.50),
('USD/EGP', 50.85, -0.35, -0.68, 51.50, 50.20);

-- 2. FX Rate History Table (for charts)
DROP TABLE IF EXISTS public.fx_rate_history CASCADE;

CREATE TABLE public.fx_rate_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pair TEXT NOT NULL,
    rate NUMERIC(18,4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fx_history_pair ON fx_rate_history(pair);
CREATE INDEX idx_fx_history_time ON fx_rate_history(recorded_at DESC);

-- Seed 30 days of history for each pair
DO $$
DECLARE
    p TEXT;
    base_rate NUMERIC;
    amplitude NUMERIC;
    i INTEGER;
BEGIN
    FOR p, base_rate, amplitude IN VALUES 
        ('USD/NGN', 1530, 40),
        ('USD/KES', 127, 3),
        ('USD/ZAR', 18.2, 0.8),
        ('USD/GHS', 15.3, 0.6),
        ('USD/EGP', 49.5, 1.5)
    LOOP
        FOR i IN 1..30 LOOP
            INSERT INTO public.fx_rate_history (pair, rate, recorded_at)
            VALUES (
                p,
                base_rate + SIN(i * 0.3) * amplitude + RANDOM() * (amplitude / 2),
                NOW() - ((30 - i) || ' days')::INTERVAL
            );
        END LOOP;
    END LOOP;
END $$;

-- 3. Hedging Suggestions Table
DROP TABLE IF EXISTS public.hedging_suggestions CASCADE;

CREATE TABLE public.hedging_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('forward', 'option', 'swap')),
    pair TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_savings NUMERIC(12,2),
    savings_display TEXT,              -- e.g. '$4,200'
    risk TEXT DEFAULT 'medium' CHECK (risk IN ('low', 'medium', 'high')),
    term TEXT,                         -- e.g. '90 days'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed hedging suggestions
INSERT INTO public.hedging_suggestions (type, pair, description, estimated_savings, savings_display, risk, term) VALUES
('forward', 'USD/NGN', 'Lock in current rate of 1,550.25 for 90 days to protect against Naira depreciation', 4200, '$4,200', 'low', '90 days'),
('option', 'USD/KES', 'Buy a put option at 130 KES strike for downside protection with upside flexibility', 1800, '$1,800', 'medium', '60 days'),
('swap', 'USD/ZAR', 'Currency swap arrangement for recurring ZAR payments, reducing transaction costs', 3500, '$3,500', 'low', '180 days'),
('forward', 'USD/GHS', 'Forward contract to hedge Cedi exposure on pending cocoa export payments', 2100, '$2,100', 'medium', '120 days');

-- 4. Finance Summary Cache (computed periodically or on-demand)
DROP TABLE IF EXISTS public.finance_summary CASCADE;

CREATE TABLE public.finance_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    approved_credit NUMERIC(14,2) DEFAULT 0,
    total_disbursed NUMERIC(14,2) DEFAULT 0,
    total_repaid NUMERIC(14,2) DEFAULT 0,
    avg_interest_rate NUMERIC(5,2) DEFAULT 0,
    next_repayment_date DATE,
    next_repayment_amount NUMERIC(14,2) DEFAULT 0,
    fx_exposure NUMERIC(14,2) DEFAULT 0,
    hedged_amount NUMERIC(14,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_finance_summary_user ON finance_summary(user_id);

-- RLS Policies
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view fx rates" ON public.fx_rates;
CREATE POLICY "Anyone can view fx rates" ON public.fx_rates FOR SELECT USING (TRUE);

ALTER TABLE public.fx_rate_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view fx history" ON public.fx_rate_history;
CREATE POLICY "Anyone can view fx history" ON public.fx_rate_history FOR SELECT USING (TRUE);

ALTER TABLE public.hedging_suggestions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view hedging suggestions" ON public.hedging_suggestions;
CREATE POLICY "Anyone can view hedging suggestions" ON public.hedging_suggestions FOR SELECT USING (is_active = TRUE);

ALTER TABLE public.finance_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own finance summary" ON public.finance_summary;
DROP POLICY IF EXISTS "Users can upsert own finance summary" ON public.finance_summary;
CREATE POLICY "Users can view own finance summary" ON public.finance_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own finance summary" ON public.finance_summary FOR ALL USING (auth.uid() = user_id);
