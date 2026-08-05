import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { TurnstileCaptcha } from '../TurnstileCaptcha';
import { supabase } from '../../services/supabase';
import { usePasswordStrength } from './hooks/usePasswordStrength';
import { AuthView, ProfileData } from './types';

interface SignupFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setView: (view: AuthView) => void;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  signupEmail: string;
  setSignupEmail: (email: string) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  loading,
  setLoading,
  setErrorMsg,
  setView,
  setProfile,
  signupEmail,
  setSignupEmail,
}) => {
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const { strength: passwordStrength, color: strengthColor, label: strengthLabel } = usePasswordStrength(signupPassword);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signupName || !signupEmail || !signupPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (passwordStrength < 2) {
      setErrorMsg('Password is too weak. Please use a stronger password.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('You must accept the Terms of Service to continue.');
      return;
    }
    if (!captchaToken) {
      setErrorMsg('Please complete the CAPTCHA verification.');
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
          emailRedirectTo: `${window.location.origin}/?confirmed=true`,
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
      setErrorMsg(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignupSubmit} className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-white/50">Start your AfCFTA journey with AfriTradeOS</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Full name</label>
          <input
            type="text"
            required
            className="w-full h-12 px-4 rounded-xl
                     bg-white/5 border border-white/10
                     text-white placeholder-white/30 text-sm
                     focus:outline-none focus:border-[#1D4FFF] focus:ring-2 focus:ring-[#1D4FFF]/20
                     transition-all duration-200"
            placeholder="Kofi Mensah"
            value={signupName}
            onChange={e => setSignupName(e.target.value)}
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
          <input
            type="email"
            required
            className="w-full h-12 px-4 rounded-xl
                     bg-white/5 border border-white/10
                     text-white placeholder-white/30 text-sm
                     focus:outline-none focus:border-[#1D4FFF] focus:ring-2 focus:ring-[#1D4FFF]/20
                     transition-all duration-200"
            placeholder="name@company.com"
            value={signupEmail}
            onChange={e => setSignupEmail(e.target.value)}
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full h-12 px-4 pr-12 rounded-xl
                       bg-white/5 border border-white/10
                       text-white placeholder-white/30 text-sm
                       focus:outline-none focus:border-[#1D4FFF] focus:ring-2 focus:ring-[#1D4FFF]/20
                       transition-all duration-200"
              placeholder="Create a strong password"
              value={signupPassword}
              onChange={e => setSignupPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {signupPassword && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strengthColor}`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-white/50">{strengthLabel}</span>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Confirm password</label>
          <input
            type="password"
            required
            className="w-full h-12 px-4 rounded-xl
                     bg-white/5 border border-white/10
                     text-white placeholder-white/30 text-sm
                     focus:outline-none focus:border-[#1D4FFF] focus:ring-2 focus:ring-[#1D4FFF]/20
                     transition-all duration-200"
            placeholder="Repeat your password"
            value={signupConfirmPassword}
            onChange={e => setSignupConfirmPassword(e.target.value)}
          />
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#1D4FFF]
                     focus:ring-[#1D4FFF]/20 focus:ring-offset-0"
          />
          <span className="text-sm text-white/60">
            I agree to the{' '}
            <a href="/terms" className="text-[#1D4FFF] hover:text-[#3D6FFF] font-medium transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#1D4FFF] hover:text-[#3D6FFF] font-medium transition-colors">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      {/* Turnstile CAPTCHA */}
      <div>
        <TurnstileCaptcha
          onVerify={token => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
        />
      </div>

      {/* Create Account Button */}
      <button
        type="submit"
        disabled={
          loading || !termsAccepted || !signupName || !signupEmail || !signupPassword || !captchaToken
        }
        className="w-full h-12 rounded-xl
                 bg-[#1D4FFF] hover:bg-[#1640D6]
                 text-white font-semibold text-sm
                 flex items-center justify-center gap-2
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
      </button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-white/50 pt-4">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => setView('LOGIN')}
          className="text-[#1D4FFF] hover:text-[#3D6FFF] font-semibold transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};
