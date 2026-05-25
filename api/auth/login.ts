import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 20;
const MAX_PER_EMAIL = 5;

// Inline rate limiter
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

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0]?.split(',')[0]?.trim() || 'unknown';
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.trim();
  }
  return 'unknown';
}

function getSupabaseUrl(): string | undefined {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
}

function getSupabaseAnonKey(): string | undefined {
  return process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({ error: 'Method not allowed. Use POST.' });
  }

  const ip = getClientIp(req);
  const ipLimit = checkRateLimit(`login:ip:${ip}`, MAX_PER_IP, WINDOW_MS);
  if (ipLimit.allowed === false) {
    return res
      .status(429)
      .setHeader('Retry-After', String(ipLimit.retryAfterSec))
      .setHeader('Cache-Control', 'no-store')
      .json({ error: 'Too many login attempts. Please try again later.' });
  }

  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!captchaToken) {
    return res.status(400).json({ error: 'CAPTCHA verification required' });
  }

  const emailLimit = checkRateLimit(`login:email:${email}`, MAX_PER_EMAIL, WINDOW_MS);
  if (emailLimit.allowed === false) {
    return res
      .status(429)
      .setHeader('Retry-After', String(emailLimit.retryAfterSec))
      .setHeader('Cache-Control', 'no-store')
      .json({ error: 'Too many login attempts for this account. Please try again later.' });
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(503).json({ error: 'Auth service not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });

  if (error) {
    const status = error.status === 429 ? 429 : error.message.includes('Invalid login') ? 401 : 400;
    return res
      .status(status)
      .setHeader('Cache-Control', 'no-store')
      .json({ error: 'Incorrect email or password. Please try again.' });
  }

  if (!data.session) {
    return res.status(403).json({ error: 'Email confirmation may be required before login.' });
  }

  return res
    .status(200)
    .setHeader('Cache-Control', 'no-store')
    .json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
}
