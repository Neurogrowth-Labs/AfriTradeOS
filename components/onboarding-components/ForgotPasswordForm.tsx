import React, { useRef, useState } from 'react';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { TurnstileCaptcha, TurnstileCaptchaRef } from '../TurnstileCaptcha';
import { supabase } from '../../services/supabase';
import { AuthView } from './types';

interface ForgotPasswordFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setView: (view: AuthView) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  loading,
  setLoading,
  setErrorMsg,
  setView,
}) => {
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileCaptchaRef>(null);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    if (!captchaToken) {
      setErrorMsg('Please complete the CAPTCHA verification.');
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
        console.error('Reset Password Error:', error);
        if (error.status === 429) {
          setErrorMsg('Too many requests. Please try again in a few minutes.');
          setLoading(false);
          return;
        }
        throw error;
      }

      setForgotSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
      setCaptchaToken(null);
      captchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => setView('LOGIN')}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to login</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reset your password</h1>
        <p className="text-white/50">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {forgotSuccess ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center animate-fade-in">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">Check your email</h3>
          <p className="text-green-400/70 text-sm mb-6">
            If an account exists for <span className="font-semibold">{forgotEmail}</span>, you will
            receive a reset link shortly.
          </p>
          <button
            type="button"
            onClick={() => setView('LOGIN')}
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white font-medium
                     hover:bg-white/10 transition-all duration-200"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
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
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
            />
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !forgotEmail || !captchaToken}
            className="w-full h-12 rounded-xl
                     bg-[#1D4FFF] hover:bg-[#1640D6]
                     text-white font-semibold text-sm
                     flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
          </button>
        </form>
      )}
    </div>
  );
};
