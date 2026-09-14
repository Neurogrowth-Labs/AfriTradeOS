import { supabase } from './supabase';

const WHOP_PAYMENT_API_URL = import.meta.env.VITE_WHOP_PAYMENT_API_URL || '/api/payments/whop';

export interface WhopPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface WhopPaymentResponse {
  id: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  checkoutUrl?: string;
  receiptUrl?: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export function isWhopPaymentConfigured(): boolean {
  // The credential is intentionally only available to the server-side proxy.
  return Boolean(WHOP_PAYMENT_API_URL);
}

export function getMaskedWhopPaymentKey(): string {
  return 'Managed server-side';
}

export async function createWhopPayment(request: WhopPaymentRequest): Promise<WhopPaymentResponse> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error('You must be signed in to create a payment.');

  const response = await fetch(WHOP_PAYMENT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Whop payment request failed with status ${response.status}`);
  }

  return response.json();
}
