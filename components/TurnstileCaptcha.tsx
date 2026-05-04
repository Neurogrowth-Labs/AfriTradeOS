import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
}

export interface TurnstileCaptchaRef {
  reset: () => void;
}

// Use the site key from environment - configured in Supabase dashboard
// Make sure to add 'localhost' to Allowed Hostnames in Cloudflare Turnstile widget settings
const TURNSTILE_SITE_KEY = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '';

export const TurnstileCaptcha = forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(({
  onVerify,
  onError,
  onExpire,
}, ref) => {
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      turnstileRef.current?.reset();
    }
  }));

  if (!TURNSTILE_SITE_KEY) {
    console.warn('Turnstile site key not configured');
    return null;
  }

  return (
    <div className="flex justify-center my-4" data-testid="turnstile-container">
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={(token) => onVerify(token)}
        onError={() => onError?.('Turnstile verification failed')}
        onExpire={() => onExpire?.()}
      />
    </div>
  );
});

TurnstileCaptcha.displayName = 'TurnstileCaptcha';

export default TurnstileCaptcha;
