import React, { useState, useEffect } from 'react';
import { UserPersona } from '../types';
import { supabase } from '../services/supabase';
import {
  ONBOARDING_STEP_COMPLETE,
  ONBOARDING_STEP_PROFILE,
  determineOnboardingStep,
} from '../services/onboardingService';
import { AlertCircle } from 'lucide-react';
import {
  AuthContainer,
  OnboardingContainer,
  LoginForm,
  SignupForm,
  ForgotPasswordForm,
  EmailVerification,
  RoleSelect,
  ProfileSetup,
  AuthView,
  ProfileData,
} from './onboarding-components';

interface OnboardingProps {
  onComplete: (role: UserPersona, profile: any) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserPersona | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState('');

  const [profile, setProfile] = useState<ProfileData>({
    country: 'Ghana',
    companyName: '',
    userName: '',
    email: '',
    phone: '',
    products: 'Cocoa, Shea Butter',
    size: 'SME',
  });

  const syncOnboardingProgress = async (
    updates: Record<string, any>,
    fallbackView?: AuthView
  ) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      if (fallbackView) setView(fallbackView);
      return;
    }

    const { error } = await supabase.from('profiles').upsert(
      {
        id: userData.user.id,
        email: userData.user.email,
        updated_at: new Date().toISOString(),
        ...updates,
      },
      { onConflict: 'id' }
    );

    if (error) {
      throw error;
    }

    if (fallbackView) setView(fallbackView);
  };

  // Check if session already exists
  useEffect(() => {
    const checkExistingSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && (view === 'LOGIN' || view === 'SIGNUP')) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const resolvedStep = determineOnboardingStep(existingProfile);
        setSelectedRole(existingProfile?.role || null);
        setProfile(prev => ({
          ...prev,
          email: existingProfile?.email || session.user.email || '',
          userName:
            existingProfile?.full_name || session.user.user_metadata?.full_name || '',
          companyName: existingProfile?.company_name || '',
          country: existingProfile?.country || prev.country,
          phone: existingProfile?.phone || '',
        }));
        setView(resolvedStep >= ONBOARDING_STEP_PROFILE ? 'PROFILE_SETUP' : 'ROLE_SELECT');
      }
    };
    checkExistingSession();
  }, []);

  const handleRoleNext = () => {
    if (!selectedRole) return;

    setLoading(true);
    setErrorMsg(null);
    syncOnboardingProgress(
      {
        role: selectedRole,
        full_name: profile.userName,
        country: profile.country || 'Ghana',
        onboarding_completed: false,
        onboarding_step: ONBOARDING_STEP_PROFILE,
      },
      'PROFILE_SETUP'
    )
      .catch((err: any) => {
        console.error(err);
        setErrorMsg(err.message || 'Failed to save onboarding progress');
      })
      .finally(() => setLoading(false));
  };

  const handleFinalize = async () => {
    if (!selectedRole) return;
    if (!profile.userName.trim() || !profile.companyName.trim() || !profile.country.trim()) {
      setErrorMsg('Please complete your profile details before continuing.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        await new Promise(resolve => setTimeout(resolve, 800));
        onComplete(selectedRole, {
          ...profile,
          id: `mock_user_${Date.now()}`,
          role: selectedRole,
          email: profile.email || 'simulation@afritrade.os',
          isSimulated: true,
          onboardingCompleted: true,
          onboardingStep: ONBOARDING_STEP_COMPLETE,
        });
        return;
      }

      const { error: dbError } = await supabase.from('profiles').upsert(
        {
          id: userData.user.id,
          email: userData.user.email,
          full_name: profile.userName.trim(),
          role: selectedRole,
          company_name: profile.companyName.trim(),
          country: profile.country.trim(),
          phone: profile.phone.trim(),
          onboarding_completed: true,
          onboarding_step: ONBOARDING_STEP_COMPLETE,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (dbError) {
        console.error('DB Profile Sync Failed:', dbError);
      }

      onComplete(selectedRole, {
        ...profile,
        id: userData.user.id,
        role: selectedRole,
        onboardingCompleted: true,
        onboardingStep: ONBOARDING_STEP_COMPLETE,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Render Role Selection and Profile Setup
  if (view === 'ROLE_SELECT' || view === 'PROFILE_SETUP') {
    return (
      <OnboardingContainer errorMsg={errorMsg} loading={loading}>
        {view === 'ROLE_SELECT' && (
          <RoleSelect
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            onNext={handleRoleNext}
            loading={loading}
          />
        )}
        {view === 'PROFILE_SETUP' && (
          <ProfileSetup
            profile={profile}
            setProfile={setProfile}
            onFinalize={handleFinalize}
            loading={loading}
          />
        )}
      </OnboardingContainer>
    );
  }

  // Render Auth Views (Login, Signup, Forgot Password, Email Verification)
  return (
    <AuthContainer>
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}

      {view === 'LOGIN' && (
        <LoginForm
          loading={loading}
          setLoading={setLoading}
          setErrorMsg={setErrorMsg}
          setView={setView}
        />
      )}

      {view === 'SIGNUP' && (
        <SignupForm
          loading={loading}
          setLoading={setLoading}
          setErrorMsg={setErrorMsg}
          setView={setView}
          setProfile={setProfile}
          signupEmail={signupEmail}
          setSignupEmail={setSignupEmail}
        />
      )}

      {view === 'FORGOT_PASSWORD' && (
        <ForgotPasswordForm
          loading={loading}
          setLoading={setLoading}
          setErrorMsg={setErrorMsg}
          setView={setView}
        />
      )}

      {view === 'EMAIL_VERIFICATION' && (
        <EmailVerification
          signupEmail={signupEmail}
          setErrorMsg={setErrorMsg}
          setView={setView}
        />
      )}
    </AuthContainer>
  );
};
