const WHOP_PAYMENT_API_KEY = import.meta.env.VITE_WHOP_PAYMENT_API_KEY || '';
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
  return WHOP_PAYMENT_API_KEY.length > 0;
}

export function getMaskedWhopPaymentKey(): string {
  if (!WHOP_PAYMENT_API_KEY) return 'Not configured';
  return `${WHOP_PAYMENT_API_KEY.slice(0, 8)}••••${WHOP_PAYMENT_API_KEY.slice(-4)}`;
}

export async function createWhopPayment(request: WhopPaymentRequest): Promise<WhopPaymentResponse> {
  if (!WHOP_PAYMENT_API_KEY) {
    throw new Error(
      'Whop payment API key is not configured. Set VITE_WHOP_PAYMENT_API_KEY in the deployment environment.'
    );
  }

  const response = await fetch(WHOP_PAYMENT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHOP_PAYMENT_API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Whop payment request failed with status ${response.status}`);
  }

  return response.json();
}
