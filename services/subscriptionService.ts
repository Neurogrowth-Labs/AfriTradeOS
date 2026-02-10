import { supabase } from './supabase';

// Subscription Plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  recommended?: boolean;
  stripePriceId?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'trial' | 'past_due' | 'suspended' | 'cancelled';
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  created_at: string;
  invoice_url?: string;
}

// Available subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Basic trade tracking',
      'Up to 5 trades/month',
      'Email support',
      'Basic compliance checks',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Exporter',
    price: 49,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited trades',
      'AI-powered market intelligence',
      'Trade finance applications',
      'Priority support',
      'Advanced compliance tools',
      'Logistics tracking',
    ],
    recommended: true,
    stripePriceId: 'price_pro_monthly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Multi-user accounts',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'White-label options',
    ],
    stripePriceId: 'price_enterprise_monthly',
  },
];

export const subscriptionService = {
  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      // Return default free subscription if none exists
      return {
        id: 'default',
        user_id: userId,
        plan_id: 'free',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };
    }
  },

  // Get user's payment methods
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  },

  // Get billing history
  async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  },

  // Create Stripe checkout session for subscription
  async createCheckoutSession(planId: string, userId: string): Promise<{ url: string } | null> {
    try {
      // In production, this would call a backend API that creates a Stripe checkout session
      // For now, we'll simulate the flow
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan || !plan.stripePriceId) {
        throw new Error('Invalid plan');
      }

      // This would be an API call to your backend
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId: plan.stripePriceId, userId }),
      // });
      // return await response.json();

      // Placeholder - show alert for now
      return { url: `https://checkout.stripe.com/placeholder?plan=${planId}` };
    } catch (e) {
      console.error('Failed to create checkout session:', e);
      return null;
    }
  },

  // Create Stripe portal session for managing subscription
  async createPortalSession(userId: string): Promise<{ url: string } | null> {
    try {
      // In production, this would call a backend API that creates a Stripe customer portal session
      // const response = await fetch('/api/create-portal-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId }),
      // });
      // return await response.json();

      return { url: 'https://billing.stripe.com/placeholder' };
    } catch (e) {
      console.error('Failed to create portal session:', e);
      return null;
    }
  },

  // Get plan by ID
  getPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(p => p.id === planId);
  },

  // Format price for display
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  },

  // Get subscription status display
  getStatusDisplay(status: UserSubscription['status']): { label: string; color: string } {
    const statusMap: Record<UserSubscription['status'], { label: string; color: string }> = {
      active: { label: 'Active', color: 'green' },
      trial: { label: 'Trial', color: 'blue' },
      past_due: { label: 'Past Due', color: 'yellow' },
      suspended: { label: 'Suspended', color: 'red' },
      cancelled: { label: 'Cancelled', color: 'gray' },
    };
    return statusMap[status] || { label: status, color: 'gray' };
  },
};
