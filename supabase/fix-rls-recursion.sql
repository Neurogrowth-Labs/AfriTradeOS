-- =============================================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- Run this in Supabase SQL Editor
-- =============================================================================

-- The issue: Policies that reference the `profiles` table cause infinite recursion
-- because reading profiles triggers its own RLS check, which triggers another read, etc.

-- Solution: Use SECURITY DEFINER functions to bypass RLS when checking admin status

-- Step 1: Create helper functions that bypass RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Step 2: Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Org members can manage products" ON public.products;
DROP POLICY IF EXISTS "Org members can manage tenders" ON public.tenders;
DROP POLICY IF EXISTS "Tender owners can view bids" ON public.bids;
DROP POLICY IF EXISTS "Org members can manage their bids" ON public.bids;

-- Step 3: Recreate policies using helper functions (no recursion)

-- Audit Logs: Admins can view all
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin() = TRUE);

-- Products: Org members can manage
CREATE POLICY "Org members can manage products" ON public.products
    FOR ALL USING (organization_id = public.get_user_org_id());

-- Tenders: Org members can manage
CREATE POLICY "Org members can manage tenders" ON public.tenders
    FOR ALL USING (organization_id = public.get_user_org_id());

-- Bids: Tender owners can view (simplified - just check if user is authenticated)
CREATE POLICY "Authenticated users can view bids" ON public.bids
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Bids: Org members can manage their bids
CREATE POLICY "Org members can manage their bids" ON public.bids
    FOR ALL USING (organization_id = public.get_user_org_id());

-- Step 4: Grant execute on functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_org_id() TO authenticated;

-- =============================================================================
-- ALTERNATIVE: Disable RLS temporarily for testing (NOT for production)
-- =============================================================================
-- If you just want to test quickly, uncomment these lines:

-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tenders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bids DISABLE ROW LEVEL SECURITY;
