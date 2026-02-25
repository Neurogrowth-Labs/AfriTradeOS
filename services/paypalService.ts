// PayPal Payment Service for AfriTradeOS
// Uses PayPal JS SDK for client-side payment processing

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AfZeh_0yL_i2rNiGWbrQzltPlZlQmxOXbNdMmODlcukBdWII3Fimtcsf6xPozEK08aWfh28sX71Hvirv';

export interface UpgradePlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  description: string;
}

// Available upgrade plans
export const UPGRADE_PLANS: UpgradePlan[] = [
  {
    id: 'pro_monthly',
    name: 'Pro Plan',
    price: 19.00,
    currency: 'USD',
    description: 'Unlock advanced features for serious traders',
    features: [
      'Unlimited trades per month',
      'Advanced AI analytics',
      'Priority customer support',
      'Real-time market alerts',
      'Custom compliance reports',
      'API access (10,000 calls/month)',
      'Team collaboration (up to 5 members)',
      'Export data in all formats'
    ]
  },
  {
    id: 'enterprise_monthly',
    name: 'Enterprise Plan',
    price: 49.00,
    currency: 'USD',
    description: 'Complete solution for large organizations',
    features: [
      'Everything in Pro Plan',
      'Unlimited API access',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee (99.9% uptime)',
      'Unlimited team members',
      'Advanced security features'
    ]
  }
];

// Declare PayPal types
declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonsConfig) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

interface PayPalButtonsConfig {
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
    height?: number;
  };
  createOrder: (data: unknown, actions: PayPalActions) => Promise<string>;
  onApprove: (data: PayPalApproveData, actions: PayPalActions) => Promise<void>;
  onError?: (err: Error) => void;
  onCancel?: () => void;
}

interface PayPalActions {
  order: {
    create: (orderData: PayPalOrderData) => Promise<string>;
    capture: () => Promise<PayPalCaptureResult>;
  };
}

interface PayPalOrderData {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: Array<{
    reference_id?: string;
    description?: string;
    custom_id?: string;
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
  application_context?: {
    brand_name?: string;
    shipping_preference?: 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS' | 'GET_FROM_FILE';
  };
}

interface PayPalApproveData {
  orderID: string;
  payerID?: string;
  facilitatorAccessToken?: string;
}

interface PayPalCaptureResult {
  id: string;
  status: string;
  payer?: {
    payer_id?: string;
    email_address?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  purchase_units?: Array<{
    reference_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

// Load PayPal SDK script
export function loadPayPalScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if PayPal is already available
    if (window.paypal) {
      resolve();
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load PayPal SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => {
      // Small delay to ensure PayPal is fully initialized
      setTimeout(() => resolve(), 100);
    };
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.body.appendChild(script);
  });
}

// Initialize PayPal buttons using client-side order creation
export function initPayPalButtons(
  containerId: string,
  planId: string,
  userId: string,
  onSuccess: (details: { id: string; payer?: { payer_id?: string } }) => void,
  onError: (error: Error) => void
): void {
  const plan = UPGRADE_PLANS.find(p => p.id === planId);
  if (!plan) {
    onError(new Error('Invalid plan selected'));
    return;
  }

  if (!window.paypal) {
    onError(new Error('PayPal SDK not loaded'));
    return;
  }

  try {
    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay',
        height: 45
      },

      // Client-side order creation - no server needed!
      createOrder: async (_data: unknown, actions: PayPalActions) => {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: `${userId}_${planId}_${Date.now()}`,
            description: `AfriTradeOS ${plan.name} - Monthly Subscription`,
            custom_id: JSON.stringify({ userId, planId, timestamp: Date.now() }),
            amount: {
              currency_code: plan.currency,
              value: plan.price.toFixed(2)
            }
          }],
          application_context: {
            brand_name: 'AfriTradeOS',
            shipping_preference: 'NO_SHIPPING'
          }
        });
      },

      // Client-side order capture
      onApprove: async (data: PayPalApproveData, actions: PayPalActions) => {
        try {
          const captureResult = await actions.order.capture();

          // Pass order details to success callback
          onSuccess({
            id: captureResult.id || data.orderID,
            payer: {
              payer_id: captureResult.payer?.payer_id || data.payerID
            }
          });
        } catch (captureError) {
          onError(captureError instanceof Error ? captureError : new Error('Payment capture failed'));
        }
      },

      onError: (err: Error) => {
        onError(err);
      },

      onCancel: () => {
        // User closed PayPal popup - not an error, just cancelled
        onError(new Error('Payment was cancelled'));
      }
    }).render(`#${containerId}`).catch((renderError: Error) => {
      onError(renderError);
    });
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Failed to initialize PayPal buttons'));
  }
}
