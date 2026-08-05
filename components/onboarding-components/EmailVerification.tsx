import React, { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { AuthView } from './types';

interface EmailVerificationProps {
  signupEmail: string;
  setErrorMsg: (msg: string | null) => void;
  setView: (view: AuthView) => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  signupEmail,
  setErrorMsg,
  setView,
}) => {
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerificationEmail = async () => {
    if (!signupEmail || resendingEmail) return;

    setResendingEmail(true);
    setResendSuccess(false);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signupEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/?confirmed=true`,
        },
      });

      if (error) {
        if (error.status === 429) {
          setErrorMsg('Too many requests. Please wait a few minutes before trying again.');
        } else {
          throw error;
        }
      } else {
        setResendSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification email.');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-[#1D4FFF]/10 border border-[#1D4FFF]/20 rounded-full flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8 text-[#1D4FFF]" />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Check your inbox</h1>
        <p className="text-white/50">
          We&apos;ve sent a verification email to{' '}
          <span className="font-semibold text-white block mt-1">{signupEmail}</span>
        </p>
        <p className="text-white/50 text-sm mt-3">
          Click the link in the email to activate your account.
        </p>
      </div>

      {/* Resend success message */}
      {resendSuccess && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Verification email sent! Check your inbox.</span>
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 space-y-4">
        <button
          onClick={() => setView('LOGIN')}
          className="w-full h-12 rounded-xl
                   bg-[#1D4FFF] hover:bg-[#1640D6]
                   text-white font-semibold text-sm
                   flex items-center justify-center gap-2
                   transition-all duration-200"
        >
          Go to sign in
        </button>

        {/* Resend verification email button */}
        <button
          onClick={handleResendVerificationEmail}
          disabled={resendingEmail}
          className="w-full h-12 rounded-xl
                   bg-white/5 border border-white/10
                   text-white/80 font-medium text-sm
                   flex items-center justify-center gap-2
                   hover:bg-white/10 hover:text-white
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
        >
          {resendingEmail ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              <span>Resend verification email</span>
            </>
          )}
        </button>

        <p className="text-sm text-white/40 pt-2">
          Didn&apos;t receive it? Check spam or{' '}
          <button
            className="text-[#1D4FFF] hover:text-[#3D6FFF] font-medium transition-colors"
            onClick={() => setView('SIGNUP')}
          >
            try another email
          </button>
        </p>
      </div>
    </div>
  );
};
