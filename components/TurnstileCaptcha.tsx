import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
}

export interface TurnstileCaptchaRef {
  reset: () => void;
  execute: () => void;
}

// Use the site key from environment - configured in Supabase dashboard
// Make sure to add 'localhost' to Allowed Hostnames in Cloudflare Turnstile widget settings
const TURNSTILE_SITE_KEY = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '';

export const TurnstileCaptcha = forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(
  ({ onVerify, onError, onExpire }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [hasStarted, setHasStarted] = useState(false);

    // Expose reset method to parent
    useImperativeHandle(ref, () => ({
      reset: () => {
        setHasStarted(false);
        turnstileRef.current?.reset();
      },
      execute: () => {
        setHasStarted(true);
        turnstileRef.current?.execute();
      },
    }));

    if (!TURNSTILE_SITE_KEY) {
      console.warn('Turnstile site key not configured');
      return null;
    }

    return (
      <div className="flex flex-col items-center gap-3 my-4" data-testid="turnstile-container">
        {!hasStarted && (
          <button
            type="button"
            onClick={() => {
              setHasStarted(true);
              // Execution is intentionally initiated by a user gesture rather
              // than automatically when the form mounts.
              turnstileRef.current?.execute();
            }}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#1D4FFF]"
          >
            Verify you&apos;re human
          </button>
        )}
        <Turnstile
          ref={turnstileRef}
          siteKey={TURNSTILE_SITE_KEY}
          options={{ appearance: 'execute', execution: 'execute', theme: 'dark' }}
          onSuccess={token => onVerify(token)}
          onError={() => {
            setHasStarted(false);
            onError?.('Turnstile verification failed');
          }}
          onExpire={() => {
            setHasStarted(false);
            onExpire?.();
          }}
        />
      </div>
    );
  }
);

TurnstileCaptcha.displayName = 'TurnstileCaptcha';

export default TurnstileCaptcha;
