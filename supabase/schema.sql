
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
