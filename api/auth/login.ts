import { createClient } from '@supabase/supabase-js';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 20;
const MAX_PER_EMAIL = 5;

// Inline rate limiter (avoid module resolution issues on Vercel)
type Bucket = { count: number; windowStart: number };
const rateLimitStore = new Map<string, Bucket>();

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSec: number };

function checkRateLimit(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  if (existing.count > maxAttempts) {
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - existing.windowStart)) / 1000));
    return { allowed: false, retryAfterSec };
  }

  return { allowed: true };
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}

function getSupabaseUrl(): string | undefined {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
}

function getSupabaseAnonKey(): string | undefined {
  return process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed. Use POST.' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit(`login:ip:${ip}`, MAX_PER_IP, WINDOW_MS);
  if (ipLimit.allowed === false) {
    return Response.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(ipLimit.retryAfterSec),
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  let body: { email?: string; password?: string; captchaToken?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : '';

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (!captchaToken) {
    return Response.json({ error: 'CAPTCHA verification required' }, { status: 400 });
  }

  const emailLimit = checkRateLimit(`login:email:${email}`, MAX_PER_EMAIL, WINDOW_MS);
  if (emailLimit.allowed === false) {
    return Response.json(
      { error: 'Too many login attempts for this account. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(emailLimit.retryAfterSec),
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json({ error: 'Auth service not configured' }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });

  if (error) {
    const status =
      error.status === 429 ? 429 : error.message.includes('Invalid login') ? 401 : 400;

    return Response.json(
      { error: 'Incorrect email or password. Please try again.' },
      { status, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!data.session) {
    return Response.json(
      { error: 'Email confirmation may be required before login.' },
      { status: 403 }
    );
  }

  return Response.json(
    {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
