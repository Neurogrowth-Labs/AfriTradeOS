import { DbUser } from '../types';

export const ONBOARDING_STEP_ROLE = 1;
export const ONBOARDING_STEP_PROFILE = 2;
export const ONBOARDING_STEP_COMPLETE = 3;

export function determineOnboardingStep(profile: Partial<DbUser> | null | undefined): number {
  if (!profile) return ONBOARDING_STEP_ROLE;
  if (profile.onboarding_completed) return ONBOARDING_STEP_COMPLETE;
  if (profile.onboarding_step && profile.onboarding_step > 0) {
    return profile.onboarding_step;
  }
  if (profile.role && profile.company_name) {
    return ONBOARDING_STEP_PROFILE;
  }
  return ONBOARDING_STEP_ROLE;
}

export function isOnboardingComplete(profile: Partial<DbUser> | null | undefined): boolean {
  if (!profile) return false;

  return Boolean(
    profile.onboarding_completed &&
      profile.full_name?.trim() &&
      profile.email?.trim() &&
      profile.country?.trim() &&
      profile.company_name?.trim() &&
      profile.role
  );
}

export function buildOnboardingProfileState(profile: Partial<DbUser> | null | undefined) {
  const onboardingCompleted = isOnboardingComplete(profile);
  return {
    onboardingCompleted,
    onboardingStep: onboardingCompleted
      ? ONBOARDING_STEP_COMPLETE
      : determineOnboardingStep(profile),
  };
}
