import React, { useRef, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { TurnstileCaptcha, TurnstileCaptchaRef } from '../TurnstileCaptcha';
import { supabase } from '../../services/supabase';
import {
  clearLoginFailures,
  getLoginLockoutMessage,
  recordLoginFailure,
} from '../../lib/loginRateLimitClient';
import { AuthView } from './types';

interface LoginFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setView: (view: AuthView) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  loading,
  setLoading,
  setErrorMsg,
  setView,
}) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileCaptchaRef>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const lockoutMsg = getLoginLockoutMessage();
    if (lockoutMsg) {
      setErrorMsg(lockoutMsg);
      return;
    }

    if (!captchaToken) {
      setErrorMsg('Please complete the CAPTCHA verification.');
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
      setErrorMsg(err.message || 'Failed to login');
      setCaptchaToken(null);
      captchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-white/50">Enter your credentials to access your account</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
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
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
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
              placeholder="Enter your password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Remember Me & Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#1D4FFF]
                     focus:ring-[#1D4FFF]/20 focus:ring-offset-0"
          />
          <span className="text-sm text-white/60">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => setView('FORGOT_PASSWORD')}
          className="text-sm text-[#1D4FFF] hover:text-[#3D6FFF] font-medium transition-colors"
        >
          Forgot password?
        </button>
      </div>

      {/* Turnstile CAPTCHA */}
      <div>
        <TurnstileCaptcha
          ref={captchaRef}
          onVerify={token => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
        />
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loading || !captchaToken}
        className="w-full h-12 rounded-xl
                 bg-[#1D4FFF] hover:bg-[#1640D6]
                 text-white font-semibold text-sm
                 flex items-center justify-center gap-2
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-white/50 pt-4">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => setView('SIGNUP')}
          className="text-[#1D4FFF] hover:text-[#3D6FFF] font-semibold transition-colors"
        >
          Create an account
        </button>
      </p>
    </form>
  );
};
