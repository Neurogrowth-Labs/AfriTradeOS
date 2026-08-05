import { UserPersona } from '../../types';

export type AuthView =
  | 'LOGIN'
  | 'SIGNUP'
  | 'ROLE_SELECT'
  | 'PROFILE_SETUP'
  | 'FORGOT_PASSWORD'
  | 'EMAIL_VERIFICATION';

export interface OnboardingProps {
  onComplete: (role: UserPersona, profile: ProfileData) => void;
}

export interface ProfileData {
  country: string;
  companyName: string;
  userName: string;
  email: string;
  phone: string;
  products: string;
  size: string;
}

export interface AuthFormProps {
  loading: boolean;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
  setView: (view: AuthView) => void;
}
