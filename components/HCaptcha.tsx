import React, { useEffect, useRef, useCallback } from 'react';

interface HCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    hcaptcha: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: (error: string) => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark';
        size?: 'normal' | 'compact' | 'invisible';
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      execute: (widgetId: string) => void;
    };
    onHCaptchaLoad?: () => void;
  }
}

// hCaptcha test key for localhost development
// In production, use the real site key from Supabase dashboard
const isDev = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// hCaptcha test keys:
// Site key: 10000000-ffff-ffff-ffff-000000000001 (always passes)
// Secret key: 0x0000000000000000000000000000000000000000 (for testing)
const HCAPTCHA_SITE_KEY = isDev
  ? '10000000-ffff-ffff-ffff-000000000001'  // Test key that always passes
  : ((import.meta as any).env?.VITE_HCAPTCHA_SITE_KEY || '');

export const HCaptcha: React.FC<HCaptchaProps> = ({
  onVerify,
  onError,
  onExpire,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.hcaptcha || widgetIdRef.current) return;

    try {
      widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
        sitekey: HCAPTCHA_SITE_KEY,
        callback: (token: string) => {
          onVerify(token);
        },
        'error-callback': (error: string) => {
          console.error('hCaptcha error:', error);
          onError?.(error);
        },
        'expired-callback': () => {
          onExpire?.();
        },
        theme: 'light',
        size: 'normal',
      });
    } catch (err) {
      console.error('Failed to render hCaptcha:', err);
    }
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    // Check if script is already loaded
    if (window.hcaptcha) {
      renderWidget();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="hcaptcha"]');
    if (existingScript) {
      window.onHCaptchaLoad = renderWidget;
      return;
    }

    // Load hCaptcha script
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js?onload=onHCaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;

    window.onHCaptchaLoad = () => {
      renderWidget();
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [renderWidget]);

  if (!HCAPTCHA_SITE_KEY) {
    console.warn('hCaptcha site key not configured');
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="flex justify-center my-4"
      data-testid="hcaptcha-container"
    />
  );
};

export default HCaptcha;
