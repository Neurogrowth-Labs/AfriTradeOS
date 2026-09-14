import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const MAX_AMOUNT = 1_000_000;

type PaymentRequest = {
  amount?: unknown;
  currency?: unknown;
  description?: unknown;
  customerEmail?: unknown;
  metadata?: unknown;
};

function getEnvironment(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

type ValidPaymentRequest = {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  metadata?: Record<string, string | number | boolean>;
};

function isValidPaymentRequest(body: PaymentRequest): body is ValidPaymentRequest {
  return (
    typeof body.amount === 'number' &&
    Number.isFinite(body.amount) &&
    body.amount > 0 &&
    body.amount <= MAX_AMOUNT &&
    typeof body.currency === 'string' &&
    /^[A-Z]{3}$/.test(body.currency) &&
    typeof body.description === 'string' &&
    body.description.trim().length > 0 &&
    body.description.length <= 500 &&
    typeof body.customerEmail === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail) &&
    (!body.metadata ||
      (typeof body.metadata === 'object' &&
        !Array.isArray(body.metadata) &&
        Object.values(body.metadata).every(value =>
          ['string', 'number', 'boolean'].includes(typeof value)
        )))
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({ error: 'Method not allowed. Use POST.' });
  }

  const supabaseUrl = getEnvironment('SUPABASE_URL') || getEnvironment('VITE_SUPABASE_URL');
  const supabaseAnonKey =
    getEnvironment('SUPABASE_ANON_KEY') || getEnvironment('VITE_SUPABASE_ANON_KEY');
  const whopApiKey = getEnvironment('WHOP_PAYMENT_API_KEY');
  const whopApiUrl = getEnvironment('WHOP_PAYMENT_API_URL');
  if (!supabaseUrl || !supabaseAnonKey || !whopApiKey || !whopApiUrl) {
    return res.status(503).json({ error: 'Payment service not configured' });
  }

  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return res.status(401).json({ error: 'Invalid authentication token' });

  const body = (req.body || {}) as PaymentRequest;
  if (!isValidPaymentRequest(body)) {
    return res.status(400).json({ error: 'Invalid payment request' });
  }
  if (body.customerEmail.toLowerCase() !== userData.user.email?.toLowerCase()) {
    return res.status(403).json({ error: 'Customer email must match the signed-in account' });
  }

  try {
    const upstream = await fetch(whopApiUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${whopApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502).json({
        error: 'Unable to create payment. Please try again later.',
      });
    }
    return res.status(200).setHeader('Cache-Control', 'no-store').json(payload);
  } catch {
    return res.status(502).json({ error: 'Payment provider is unavailable' });
  }
}
