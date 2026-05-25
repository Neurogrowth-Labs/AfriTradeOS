
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { UserPersona } from '../types';
import { supabase } from '../services/supabase';
import {
  clearLoginFailures,
  getLoginLockoutMessage,
  recordLoginFailure,
} from '../lib/loginRateLimitClient';
import {
  ONBOARDING_STEP_COMPLETE,
  ONBOARDING_STEP_PROFILE,
  ONBOARDING_STEP_ROLE,
  determineOnboardingStep,
} from '../services/onboardingService';
import { TurnstileCaptcha, TurnstileCaptchaRef } from './TurnstileCaptcha';
import {
  ArrowRight,
  Briefcase,
  Truck,
  ShieldCheck,
  TrendingUp,
  CheckCircle,
  Loader2,
  Lock,
  Landmark,
  User,
  Mail,
  Key,
  AlertCircle,
  ArrowLeft,
  Inbox,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  Shield
} from 'lucide-react';

// Lazy load the 3D globe for better performance
const Globe3D = lazy(() => import('./Globe3D'));

// Loading fallback for the globe
const GlobeLoader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#1D4FFF]/20 to-[#E8B547]/10 animate-pulse" />
  </div>
);

interface OnboardingProps {
  onComplete: (role: UserPersona, profile: any) => void;
}

const AFRICAN_COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cameroon", "Central African Republic", "Chad", "Comoros", "DR Congo", "Republic of Congo",
  "Cote d'Ivoire", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia",
  "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia",
  "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique",
  "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles",
  "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo",
  "Tunisia", "Uganda", "Zambia", "Zimbabwe"
];

type AuthView = 'LOGIN' | 'SIGNUP' | 'ROLE_SELECT' | 'PROFILE_SETUP' | 'FORGOT_PASSWORD' | 'EMAIL_VERIFICATION';

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserPersona | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Captcha State
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileCaptchaRef>(null);

  // Profile State
  const [profile, setProfile] = useState({
    country: 'Ghana',
    companyName: '',
    userName: '',
    email: '',
    phone: '',
    products: 'Cocoa, Shea Butter',
    size: 'SME'
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

    const { error } = await supabase
      .from('profiles')
      .upsert(
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
        const { data: { session } } = await supabase.auth.getSession();
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
                userName: existingProfile?.full_name || session.user.user_metadata?.full_name || '',
                companyName: existingProfile?.company_name || '',
                country: existingProfile?.country || prev.country,
                phone: existingProfile?.phone || '',
            }));
            setView(resolvedStep >= ONBOARDING_STEP_PROFILE ? 'PROFILE_SETUP' : 'ROLE_SELECT');
        }
    };
    checkExistingSession();
  }, []);

  // Password Strength Calculator
  useEffect(() => {
    if (!signupPassword) {
      setPasswordStrength(0);
      return;
    }
    let score = 0;
    if (signupPassword.length > 5) score += 1;
    if (signupPassword.length > 8) score += 1;
    if (/[0-9]/.test(signupPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(signupPassword)) score += 1;
    setPasswordStrength(score);
  }, [signupPassword]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to login with Google");
      setLoading(false);
    }
  };


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const lockoutMsg = getLoginLockoutMessage();
    if (lockoutMsg) {
      setErrorMsg(lockoutMsg);
      return;
    }

    // Check captcha token
    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA verification.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          captchaToken,
        }),
      });

      // Local Vite dev has no /api routes — fall back to Supabase client
      if (response.status === 404 && import.meta.env.DEV) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
          options: { captchaToken },
        });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            recordLoginFailure();
            throw new Error('Incorrect email or password. Please try again.');
          }
          if (error.status === 429) {
            throw new Error('Too many login attempts. Please try again later.');
          }
          throw error;
        }
        if (!data.session) {
          throw new Error('Login succeeded but session was not created.');
        }
        clearLoginFailures();
        return;
      }

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
          recordLoginFailure();
        }
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new Error(
            payload.error ||
              `Too many login attempts. Try again${retryAfter ? ` in ${retryAfter}s` : ' later'}.`
          );
        }
        throw new Error(payload.error || 'Failed to login');
      }

      if (!payload.session?.access_token || !payload.session?.refresh_token) {
        throw new Error('Login succeeded but session was not created.');
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: payload.session.access_token,
        refresh_token: payload.session.refresh_token,
      });

      if (sessionError) throw sessionError;

      clearLoginFailures();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to login");
      setCaptchaToken(null);
      captchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signupName || !signupEmail || !signupPassword) {
        setErrorMsg("Please fill in all fields.");
        return;
    }
    if (signupPassword !== signupConfirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
    }
    if (passwordStrength < 2) {
        setErrorMsg("Password is too weak. Please use a stronger password.");
        return;
    }
    if (!termsAccepted) {
        setErrorMsg("You must accept the Terms of Service to continue.");
        return;
    }
    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA verification.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
          },
          captchaToken: captchaToken,
        },
      });

      if (error) {
        if (error.message.includes('already registered') || error.status === 422) {
          setErrorMsg('This email is already registered. Please sign in instead.');
          setLoading(false);
          setCaptchaToken(null);
          return;
        }

        setErrorMsg(error.message || 'Failed to create account. Please try again.');
        setLoading(false);
        setCaptchaToken(null);
        return;
      }

      setProfile(prev => ({ ...prev, userName: signupName, email: signupEmail }));

      if (data.user && !data.session) {
        setView('EMAIL_VERIFICATION');
      } else if (data.session) {
        setView('ROLE_SELECT');
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA verification.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setForgotSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin,
        captchaToken: captchaToken,
      });

      if (error) {
        console.error("Reset Password Error:", error);
        if (error.status === 429) {
             setErrorMsg("Too many requests. Please try again in a few minutes.");
             setLoading(false);
             return;
        }
        throw error;
      }

      setForgotSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setCaptchaToken(null);
      captchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: UserPersona) => {
      setSelectedRole(role);
  };

  const handleRoleNext = () => {
      if (!selectedRole) return;

      setLoading(true);
      setErrorMsg(null);
      syncOnboardingProgress(
        {
          role: selectedRole,
          full_name: profile.userName || signupName,
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

        const { error: dbError } = await supabase
            .from('profiles')
            .upsert({
                id: userData.user.id,
                email: userData.user.email,
                full_name: profile.userName.trim(),
                role: selectedRole,
                company_name: profile.companyName.trim(),
                country: profile.country.trim(),
                phone: profile.phone.trim(),
                onboarding_completed: true,
                onboarding_step: ONBOARDING_STEP_COMPLETE,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (dbError) {
            console.error("DB Profile Sync Failed:", dbError);
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
        setErrorMsg(err.message || "Failed to update profile");
      } finally {
        setLoading(false);
      }
  };

  const roles = [
      { id: UserPersona.EXPORTER_SME, icon: Briefcase, label: 'Exporter / Importer', desc: 'Trade goods across borders' },
      { id: UserPersona.LOGISTICS, icon: Truck, label: 'Logistics Provider', desc: 'Move cargo & manage fleets' },
      { id: UserPersona.BANK, icon: Landmark, label: 'Bank / Insurer', desc: 'Finance & risk management' },
      { id: UserPersona.CUSTOMS, icon: ShieldCheck, label: 'Customs / Gov', desc: 'Regulatory oversight' },
      { id: UserPersona.ANALYST, icon: TrendingUp, label: 'Trade Analyst', desc: 'Market data & insights' },
  ];

  const getStrengthColor = (score: number) => {
      if (score === 0) return 'bg-gray-700';
      if (score < 2) return 'bg-red-500';
      if (score < 4) return 'bg-yellow-500';
      return 'bg-green-500';
  };

  const getStrengthLabel = (score: number) => {
      if (score === 0) return '';
      if (score < 2) return 'Weak';
      if (score < 4) return 'Medium';
      return 'Strong';
  };

  // Premium Auth Container for Login/Signup views
  const renderAuthContainer = () => (
    <div className="min-h-screen w-full z-[100] flex items-center justify-center p-6 md:p-10 lg:p-16 overflow-auto">
      {/* Deep Navy Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#071126] to-[#0a1628]" />

      {/* Ambient Light Effects */}
      <div className="fixed top-1/4 left-1/4 w-[600px] h-[600px] bg-[#1D4FFF]/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#E8B547]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1D4FFF]/4 rounded-full blur-[200px] pointer-events-none" />

      {/* Floating Light Streaks */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-[1px] bg-gradient-to-r from-transparent via-[#1D4FFF]/30 to-transparent rotate-12 animate-pulse" />
        <div className="absolute bottom-32 right-20 w-48 h-[1px] bg-gradient-to-r from-transparent via-[#E8B547]/20 to-transparent -rotate-12 animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/3 right-1/4 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#1D4FFF]/20 to-transparent rotate-45 animate-pulse" style={{animationDelay: '0.5s'}} />
      </div>

      {/* Main Container - Centered Card */}
      <div className="relative w-full max-w-[1200px] h-auto min-h-[650px] md:h-[750px] rounded-[32px] overflow-hidden flex flex-col md:flex-row
                      bg-gradient-to-br from-[#071B34]/95 to-[#0D2A4D]/90
                      border border-white/[0.08]
                      shadow-[0_0_80px_rgba(29,79,255,0.15),0_0_120px_rgba(232,181,71,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]
                      backdrop-blur-xl">

        {/* Glowing Border Effect */}
        <div className="absolute inset-0 rounded-[32px] pointer-events-none"
             style={{
               background: 'linear-gradient(135deg, rgba(29,79,255,0.1) 0%, transparent 50%, rgba(232,181,71,0.1) 100%)',
               padding: '1px',
               mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
               maskComposite: 'xor',
               WebkitMaskComposite: 'xor'
             }} />

        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-1/2 relative flex-col p-10 lg:p-12 overflow-hidden">
          {/* Panel Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#071B34] to-[#0D2A4D]" />

          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

          {/* Separator line */}
          <div className="absolute right-0 top-8 bottom-8 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8B547] to-[#D4A43A] flex items-center justify-center shadow-lg shadow-[#E8B547]/20">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#071126]" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">AfriTradeOS</span>
            </div>

            {/* Hero Text */}
            <h1 className="text-[4rem] lg:text-[5rem] font-extrabold text-white leading-[1.05] tracking-[-0.03em] mb-8">
              Welcome<br />
              Back<span className="text-[#E8B547]">.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base text-white/55 leading-[1.8] max-w-[360px] mb-10">
              Securely access your trade dashboard,
              monitor live shipments, and manage
              compliance from one unified operating system.
            </p>

            {/* Feature List */}
            <div className="space-y-4">
              {[
                'Instant Rules of Origin Compliance',
                'Verified Partner Network',
                'Access to Trade Finance'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 rounded-full border border-[#E8B547]/40 flex items-center justify-center
                                bg-gradient-to-br from-[#E8B547]/20 to-[#E8B547]/5
                                shadow-[0_0_12px_rgba(232,181,71,0.2)]
                                group-hover:shadow-[0_0_20px_rgba(232,181,71,0.4)] transition-shadow">
                    <CheckCircle className="w-3.5 h-3.5 text-[#E8B547]" />
                  </div>
                  <span className="text-sm text-white/70 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Globe Visual - Bottom Right Corner */}
          <div className="absolute bottom-0 right-0 w-[420px] h-[350px] z-10 pointer-events-auto"
               style={{ transform: 'translate(60px, 40px)' }}>
            <Suspense fallback={<GlobeLoader />}>
              <Globe3D width={420} height={350} />
            </Suspense>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 relative flex flex-col p-8 md:p-10 lg:p-12 bg-[#050B19]/80 backdrop-blur-xl">
          {/* Subtle gradient lighting */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1D4FFF]/5 to-transparent pointer-events-none" />

          {/* Security Badge - Top Right */}
          <div className="absolute top-8 right-8 flex items-center gap-2.5 text-right">
            <div className="w-9 h-9 rounded-xl bg-[#1D4FFF]/10 border border-[#1D4FFF]/20 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-[#1D4FFF]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/90">Your data is protected</p>
              <p className="text-[10px] text-white/50">Enterprise-grade security</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10 mt-12 md:mt-0">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* LOGIN VIEW */}
            {view === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Sign In</h2>
                  <p className="text-white/50 text-base">Access your AfriTradeOS account.</p>
                </div>

                <div className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-3">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[#1D4FFF] transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        className="w-full h-[68px] pl-12 pr-4 rounded-[18px]
                                 bg-white/[0.03] border border-white/[0.08]
                                 text-white placeholder-white/30 text-base
                                 focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                                 focus:shadow-[0_0_0_4px_rgba(29,79,255,0.1),inset_0_2px_4px_rgba(0,0,0,0.1)]
                                 transition-all duration-200"
                        placeholder="name@company.com"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="flex justify-between items-center text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-3">
                      <span>Password</span>
                      <button
                        type="button"
                        onClick={() => setView('FORGOT_PASSWORD')}
                        className="normal-case text-[#1D4FFF] hover:text-[#3D6FFF] font-medium tracking-normal transition-colors"
                      >
                        Forgot?
                      </button>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[#1D4FFF] transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full h-[68px] pl-12 pr-12 rounded-[18px]
                                 bg-white/[0.03] border border-white/[0.08]
                                 text-white placeholder-white/30 text-base
                                 focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                                 focus:shadow-[0_0_0_4px_rgba(29,79,255,0.1),inset_0_2px_4px_rgba(0,0,0,0.1)]
                                 transition-all duration-200"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember Me & Passkey */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded-md border border-white/20 bg-white/5
                                    peer-checked:bg-[#1D4FFF] peer-checked:border-[#1D4FFF]
                                    transition-all flex items-center justify-center">
                        {rememberMe && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Remember me</span>
                  </label>

                  <button type="button" className="flex items-center gap-2 text-sm text-[#1D4FFF] hover:text-[#3D6FFF] transition-colors">
                    <span>Use passkey</span>
                    <KeyRound className="w-4 h-4" />
                  </button>
                </div>

                {/* Turnstile CAPTCHA */}
                <div className="pt-2">
                  <TurnstileCaptcha
                    ref={captchaRef}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => setCaptchaToken(null)}
                  />
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading || !captchaToken}
                  className="w-full h-[72px] rounded-[20px]
                           bg-gradient-to-r from-[#0F4CFF] to-[#1A6BFF]
                           text-white font-semibold text-base
                           flex items-center justify-center gap-2
                           shadow-[0_14px_40px_rgba(29,79,255,0.35),0_4px_12px_rgba(29,79,255,0.2)]
                           hover:shadow-[0_18px_50px_rgba(29,79,255,0.45),0_6px_16px_rgba(29,79,255,0.25)]
                           hover:scale-[1.02] active:scale-[0.98]
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                           transition-all duration-200"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-white/50 pt-4">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setView('SIGNUP')}
                    className="text-[#1D4FFF] hover:text-[#3D6FFF] font-semibold transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === 'FORGOT_PASSWORD' && (
              <div className="space-y-6 animate-fade-in">
                <button
                  onClick={() => setView('LOGIN')}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <span>Back to Login</span>
                </button>

                <div className="pt-4">
                  <div className="w-14 h-14 bg-[#1D4FFF]/10 border border-[#1D4FFF]/20 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-7 h-7 text-[#1D4FFF]" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                  <p className="text-white/50 text-base leading-relaxed">
                    Enter the email address associated with your account and we&apos;ll send you a secure link to reset your password.
                  </p>
                </div>

                {forgotSuccess ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center animate-fade-in">
                    <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-7 h-7 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-400 mb-2">Check your email</h3>
                    <p className="text-green-400/70 mb-6">
                      If an account exists for <span className="font-semibold block mt-1">{forgotEmail}</span>, you will receive a reset link shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setView('LOGIN')}
                      className="w-full h-14 rounded-xl bg-white/5 border border-white/10 text-white font-medium
                               hover:bg-white/10 transition-all"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-3">Work Email</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[#1D4FFF] transition-colors">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          required
                          className="w-full h-[68px] pl-12 pr-4 rounded-[18px]
                                   bg-white/[0.03] border border-white/[0.08]
                                   text-white placeholder-white/30 text-base
                                   focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                                   focus:shadow-[0_0_0_4px_rgba(29,79,255,0.1)]
                                   transition-all duration-200"
                          placeholder="name@company.com"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <TurnstileCaptcha
                      ref={captchaRef}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      onError={() => setCaptchaToken(null)}
                    />

                    <button
                      type="submit"
                      disabled={loading || !forgotEmail || !captchaToken}
                      className="w-full h-[68px] rounded-[20px]
                               bg-gradient-to-r from-[#0F4CFF] to-[#1A6BFF]
                               text-white font-semibold text-base
                               flex items-center justify-center gap-2
                               shadow-[0_14px_40px_rgba(29,79,255,0.35)]
                               hover:shadow-[0_18px_50px_rgba(29,79,255,0.45)]
                               hover:scale-[1.02]
                               disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                               transition-all duration-200 group"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          Send Reset Link
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* EMAIL VERIFICATION VIEW */}
            {view === 'EMAIL_VERIFICATION' && (
              <div className="space-y-6 animate-fade-in text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-[#1D4FFF]/10 border border-[#1D4FFF]/20 rounded-full flex items-center justify-center mx-auto">
                    <Inbox className="w-10 h-10 text-[#1D4FFF]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#E8B547] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Mail className="w-4 h-4 text-[#071126]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Check your inbox</h2>
                  <p className="text-white/50 text-base leading-relaxed">
                    We&apos;ve sent a welcome email to <span className="font-semibold text-white">{signupEmail}</span> with a verification link.
                  </p>
                  <p className="text-white/50 text-base mt-2">
                    Please click the link in the email to activate your account.
                  </p>
                </div>
                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => setView('LOGIN')}
                    className="w-full h-[68px] rounded-[20px]
                             bg-gradient-to-r from-[#0F4CFF] to-[#1A6BFF]
                             text-white font-semibold text-base
                             flex items-center justify-center gap-2
                             shadow-[0_14px_40px_rgba(29,79,255,0.35)]
                             hover:scale-[1.02] transition-all"
                  >
                    Go to Sign In
                  </button>
                  <p className="text-xs text-white/40">
                    Didn&apos;t receive it? Check spam or{' '}
                    <button className="text-[#1D4FFF] hover:underline" onClick={() => setView('SIGNUP')}>
                      try another email
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* SIGNUP VIEW */}
            {view === 'SIGNUP' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4 animate-fade-in">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-white mb-1.5">Create Account</h2>
                  <p className="text-white/50 text-sm">Start your AfCFTA journey securely.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#1D4FFF] transition-colors" />
                      <input
                        type="text"
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-[14px]
                                 bg-white/[0.03] border border-white/[0.08]
                                 text-white placeholder-white/30 text-sm
                                 focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                                 focus:shadow-[0_0_0_3px_rgba(29,79,255,0.1)]
                                 transition-all duration-200"
                        placeholder="Kofi Mensah"
                        value={signupName}
                        onChange={e => setSignupName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">Work Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#1D4FFF] transition-colors" />
                      <input
                        type="email"
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-[14px]
                                 bg-white/[0.03] border border-white/[0.08]
                                 text-white placeholder-white/30 text-sm
                                 focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                                 focus:shadow-[0_0_0_3px_rgba(29,79,255,0.1)]
                                 transition-all duration-200"
                        placeholder="name@company.com"
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">Password</label>
                    <div className="relative group">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#1D4FFF] transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full h-12 pl-10 pr-10 rounded-[14px]
                                 bg-white/[0.03] border border-white/[0.08]
                                 text-white placeholder-white/30 text-sm
                                 focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                                 focus:shadow-[0_0_0_3px_rgba(29,79,255,0.1)]
                                 transition-all duration-200"
                        placeholder="Create a strong password"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-white/50">{getStrengthLabel(passwordStrength)}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#1D4FFF] transition-colors" />
                      <input
                        type="password"
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-[14px]
                                 bg-white/[0.03] border border-white/[0.08]
                                 text-white placeholder-white/30 text-sm
                                 focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                                 focus:shadow-[0_0_0_3px_rgba(29,79,255,0.1)]
                                 transition-all duration-200"
                        placeholder="Repeat your password"
                        value={signupConfirmPassword}
                        onChange={e => setSignupConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 pt-1 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded border border-white/20 bg-white/5
                                    peer-checked:bg-[#1D4FFF] peer-checked:border-[#1D4FFF]
                                    transition-all flex items-center justify-center">
                        {termsAccepted && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>
                    <span className="text-[11px] text-white/50 leading-snug">
                      I agree to the{' '}
                      <a href="#" className="text-[#1D4FFF] hover:underline font-medium">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-[#1D4FFF] hover:underline font-medium">Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                <TurnstileCaptcha
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />

                <button
                  type="submit"
                  disabled={loading || !termsAccepted || !signupName || !signupEmail || !signupPassword || !captchaToken}
                  className="w-full h-14 rounded-[16px]
                           bg-gradient-to-r from-[#0F4CFF] to-[#1A6BFF]
                           text-white font-semibold text-sm
                           flex items-center justify-center gap-2
                           shadow-[0_12px_32px_rgba(29,79,255,0.35)]
                           hover:shadow-[0_16px_40px_rgba(29,79,255,0.45)]
                           hover:scale-[1.02]
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                           transition-all duration-200"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start with AfriTradeOS'}
                </button>

                <p className="text-center text-xs text-white/50 pt-1">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setView('LOGIN')} className="text-[#1D4FFF] hover:text-[#3D6FFF] font-semibold transition-colors">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );

  // Render Role Selection and Profile Setup with original styling
  const renderOnboardingSteps = () => (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#020617] via-[#071126] to-[#0a1628] flex items-center justify-center p-4 md:p-6">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1D4FFF]/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E8B547]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-xl rounded-[28px] overflow-hidden
                    bg-gradient-to-br from-[#071B34]/95 to-[#0D2A4D]/90
                    border border-white/[0.08]
                    shadow-[0_0_60px_rgba(29,79,255,0.12)]
                    backdrop-blur-xl p-8 md:p-10">

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* ROLE SELECTION */}
        {view === 'ROLE_SELECT' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Select Account Type</h2>
              <p className="text-white/50 text-base">Your role determines tools, permissions, and insights.</p>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                    selectedRole === r.id
                    ? 'border-[#E8B547]/50 bg-[#E8B547]/10 shadow-[0_0_30px_rgba(232,181,71,0.15)]'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${selectedRole === r.id ? 'bg-[#E8B547] text-[#071126]' : 'bg-white/10 text-white/60'}`}>
                    <r.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${selectedRole === r.id ? 'text-[#E8B547]' : 'text-white'}`}>{r.label}</h3>
                    <p className="text-sm text-white/50">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleRoleNext}
              disabled={!selectedRole || loading}
              className="w-full h-16 rounded-[18px]
                       bg-gradient-to-r from-[#0F4CFF] to-[#1A6BFF]
                       text-white font-semibold text-base
                       flex items-center justify-center gap-2
                       shadow-[0_14px_40px_rgba(29,79,255,0.35)]
                       hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Continue <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        )}

        {/* PROFILE SETUP */}
        {view === 'PROFILE_SETUP' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Organization Profile</h2>
              <p className="text-white/50 text-base">Tell us about your business to optimize the OS.</p>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">Your Name</label>
                  <input
                    type="text"
                    className="w-full h-14 px-4 rounded-[14px]
                             bg-white/[0.03] border border-white/[0.08]
                             text-white placeholder-white/30 text-sm
                             focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                             transition-all duration-200"
                    value={profile.userName}
                    onChange={(e) => setProfile({...profile, userName: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">Company</label>
                  <input
                    type="text"
                    className="w-full h-14 px-4 rounded-[14px]
                             bg-white/[0.03] border border-white/[0.08]
                             text-white placeholder-white/30 text-sm
                             focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                             transition-all duration-200"
                    value={profile.companyName}
                    onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                    placeholder="Trading Co. Ltd"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">Country of Operation</label>
                <select
                  className="w-full h-14 px-4 rounded-[14px]
                           bg-white/[0.03] border border-white/[0.08]
                           text-white text-sm
                           focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                           transition-all duration-200 appearance-none cursor-pointer"
                  value={profile.country}
                  onChange={(e) => setProfile({...profile, country: e.target.value})}
                >
                  {AFRICAN_COUNTRIES.map(c => <option key={c} value={c} className="bg-[#0D2A4D] text-white">{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full h-14 px-4 rounded-[14px]
                             bg-white/[0.03] border border-white/[0.08]
                             text-white placeholder-white/30 text-sm
                             focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                             transition-all duration-200"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="+233..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">Size</label>
                  <select
                    className="w-full h-14 px-4 rounded-[14px]
                             bg-white/[0.03] border border-white/[0.08]
                             text-white text-sm
                             focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                             transition-all duration-200 appearance-none cursor-pointer"
                    value={profile.size}
                    onChange={(e) => setProfile({...profile, size: e.target.value})}
                  >
                    <option className="bg-[#0D2A4D] text-white">Sole Proprietor</option>
                    <option className="bg-[#0D2A4D] text-white">SME</option>
                    <option className="bg-[#0D2A4D] text-white">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinalize}
              disabled={loading}
              className="w-full h-16 rounded-[18px]
                       bg-gradient-to-r from-[#0F4CFF] to-[#1A6BFF]
                       text-white font-semibold text-base
                       flex items-center justify-center gap-2
                       shadow-[0_14px_40px_rgba(29,79,255,0.35)]
                       hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Dashboard'}
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[#071126]/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-[28px]">
            <Loader2 className="w-10 h-10 text-[#1D4FFF] animate-spin" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );

  // Determine which view to render
  if (view === 'ROLE_SELECT' || view === 'PROFILE_SETUP') {
    return renderOnboardingSteps();
  }

  return renderAuthContainer();
};
