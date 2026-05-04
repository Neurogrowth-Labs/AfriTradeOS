import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
}

export interface TurnstileCaptchaRef {
  reset: () => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: (error: string) => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

// Use the site key from environment - configured in Supabase dashboard
// Make sure to add 'localhost' to Allowed Hostnames in Cloudflare Turnstile widget settings
const TURNSTILE_SITE_KEY = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '';

export const TurnstileCaptcha = forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(({
  onVerify,
  onError,
  onExpire,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.error('Failed to reset Turnstile:', e);
        }
      }
    }
  }));

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          onVerify(token);
        },
        'error-callback': (error: string) => {
          console.error('Turnstile error:', error);
          onError?.(error);
        },
        'expired-callback': () => {
          onExpire?.();
        },
        theme: 'auto',
        size: 'normal',
      });
    } catch (err) {
      console.error('Failed to render Turnstile:', err);
    }
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="turnstile"]');
    if (existingScript) {
      window.onTurnstileLoad = renderWidget;
      return;
    }

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
    script.async = true;
    script.defer = true;

    window.onTurnstileLoad = () => {
      renderWidget();
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [renderWidget]);

  if (!TURNSTILE_SITE_KEY) {
    console.warn('Turnstile site key not configured');
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="flex justify-center my-4"
      data-testid="turnstile-container"
    />
  );
});

TurnstileCaptcha.displayName = 'TurnstileCaptcha';

export default TurnstileCaptcha;
