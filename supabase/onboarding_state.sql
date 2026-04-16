ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

UPDATE public.profiles
SET
  onboarding_completed = COALESCE(onboarding_completed, FALSE),
  onboarding_step = COALESCE(onboarding_step, 1)
WHERE onboarding_completed IS NULL OR onboarding_step IS NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_onboarding_step_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_onboarding_step_check
  CHECK (onboarding_step BETWEEN 1 AND 4);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS onboarding_completion_requires_profile_data;

ALTER TABLE public.profiles
  ADD CONSTRAINT onboarding_completion_requires_profile_data
  CHECK (
    onboarding_completed = FALSE OR (
      NULLIF(TRIM(COALESCE(full_name, '')), '') IS NOT NULL AND
      NULLIF(TRIM(COALESCE(email, '')), '') IS NOT NULL AND
      NULLIF(TRIM(COALESCE(country, '')), '') IS NOT NULL AND
      NULLIF(TRIM(COALESCE(company_name, '')), '') IS NOT NULL
    )
  );
