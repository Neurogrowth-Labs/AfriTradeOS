
import { 
  DbUser, 
  DbOrganization, 
  DbTrade, 
  DbFinanceRequest, 
  DbMarketIntelligence,
  DbAuditLog,
  DbKYCRequest,
  DbAMLAlert
} from '../types';
import { supabase } from './supabase';
import { isOnboardingComplete } from './onboardingService';

const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, country, company_name, role, onboarding_completed, onboarding_step')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return isOnboardingComplete(data as DbUser | null);
  } catch (e) {
    console.error('Failed to verify onboarding state:', e);
    return false;
  }
};


// --- DATABASE CLIENT WRAPPER ---

export const mockDatabase = {
  
  // --- USER PROFILE ---
  getUserProfile: async (userId: string): Promise<DbUser | null> => {
    try {
      console.log("getUserProfile - Fetching profile for userId:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("getUserProfile - Supabase error:", error.code, error.message);
        
        // If RLS recursion error, try to get basic profile without RLS
        if (error.code === '42P17') {
          console.warn("RLS recursion detected - please run fix-rls-recursion.sql in Supabase");
        }
        throw error;
      }
      
      console.log("getUserProfile - Success:", data);
      return data as DbUser;
    } catch (e: any) {
      console.warn("Using fallback profile (DB unreachable or record missing)", e?.message || e);
      return null;
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<DbUser>): Promise<boolean> => {
    try {
      // Use UPDATE instead of UPSERT to strictly adhere to RLS 'UPDATE' policy
      // and ensure we are modifying an existing profile created by the Auth trigger.
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Failed to update profile", e);
      return false;
    }
  },

  // --- READ METHODS ---

  getOrganizations: async (typeFilter?: string): Promise<DbOrganization[]> => {
    try {
      let query = supabase.from('organizations').select('*');
      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DbOrganization[];
    } catch (e) {
      return [];
    }
  },

  getTrades: async (): Promise<DbTrade[]> => {
    try {
      if (!(await hasCompletedOnboarding())) {
        return [];
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (user) {
        query = query.eq('exporter_id', user.id);
      }

      const { data, error } = await query;
        
      if (error) throw error;
      return (data || []) as DbTrade[];
    } catch (e: unknown) {
      // Ignore AbortError from React StrictMode double-invoke
      if (e instanceof Error && (e.name === 'AbortError' || e.message?.includes('aborted'))) {
        return [];
      }
      console.error("getTrades error:", e);
      return []; 
    }
  },

  getFinanceRequests: async (userId: string): Promise<DbFinanceRequest[]> => {
    try {
        if (!(await hasCompletedOnboarding())) {
          return [];
        }

        const { data: { user } } = await supabase.auth.getUser();
        let query = supabase.from('finance_requests').select('*').order('created_at', { ascending: false });
        
        if (user) {
          query = query.eq('applicant_id', user.id);
        }
        
        const { data, error } = await query;
        if(error) throw error;
        return (data || []) as DbFinanceRequest[];
    } catch(e) {
        return [];
    }
  },

  // Calculate Finance Readiness Score based on user's profile and activity
  calculateFinanceReadiness: async (): Promise<{ score: number; breakdown: { label: string; score: number; max: number }[] }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { score: 50, breakdown: [] };

      // Fetch user data
      const [profileRes, kycRes, docsRes, tradesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('kyc_requests').select('status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('documents').select('status').eq('user_id', user.id),
        supabase.from('trades').select('status, value').eq('exporter_id', user.id)
      ]);

      const profile = profileRes.data;
      const kycStatus = kycRes.data?.[0]?.status || 'not_started';
      const documents = docsRes.data || [];
      const trades = tradesRes.data || [];

      // Calculate individual scores
      const breakdown = [];

      // 1. KYC Status (20 points max)
      let kycScore = 0;
      if (kycStatus === 'approved') kycScore = 20;
      else if (kycStatus === 'under_review') kycScore = 15;
      else if (kycStatus === 'documents_pending') kycScore = 10;
      else kycScore = 5;
      breakdown.push({ label: 'KYC Verification', score: kycScore, max: 20 });

      // 2. Documents (25 points max)
      const approvedDocs = documents.filter(d => d.status === 'approved').length;
      const totalDocs = Math.max(documents.length, 1);
      const docScore = Math.round((approvedDocs / totalDocs) * 25);
      breakdown.push({ label: 'Document Verification', score: docScore, max: 25 });

      // 3. Trade History (25 points max)
      const completedTrades = trades.filter(t => t.status === 'completed').length;
      const tradeScore = Math.min(completedTrades * 5, 25);
      breakdown.push({ label: 'Trade History', score: tradeScore, max: 25 });

      // 4. Profile Completeness (15 points max)
      let profileScore = 0;
      if (profile) {
        if (profile.full_name) profileScore += 3;
        if (profile.email) profileScore += 3;
        if (profile.phone) profileScore += 3;
        if (profile.company_name) profileScore += 3;
        if (profile.country) profileScore += 3;
      }
      breakdown.push({ label: 'Profile Completeness', score: profileScore, max: 15 });

      // 5. Trade Volume (15 points max)
      const totalVolume = trades.reduce((sum, t) => sum + (t.value || 0), 0);
      let volumeScore = 0;
      if (totalVolume >= 1000000) volumeScore = 15;
      else if (totalVolume >= 500000) volumeScore = 12;
      else if (totalVolume >= 100000) volumeScore = 9;
      else if (totalVolume >= 50000) volumeScore = 6;
      else if (totalVolume > 0) volumeScore = 3;
      breakdown.push({ label: 'Trade Volume', score: volumeScore, max: 15 });

      const totalScore = breakdown.reduce((sum, b) => sum + b.score, 0);

      return { score: totalScore, breakdown };
    } catch (e) {
      console.error('Failed to calculate finance readiness:', e);
      return { score: 50, breakdown: [] };
    }
  },

  // Calculate Country Risk Exposure based on user's trades
  calculateCountryRiskExposure: async (): Promise<{ country: string; risk: number; value: number; percentage: number }[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: trades, error } = await supabase
        .from('trades')
        .select('destination_country, value')
        .eq('exporter_id', user.id);

      if (error || !trades || trades.length === 0) {
        // Return default risk data if no trades
        return [
          { country: 'Nigeria', risk: 65, value: 0, percentage: 0 },
          { country: 'Kenya', risk: 40, value: 0, percentage: 0 },
          { country: 'Ghana', risk: 30, value: 0, percentage: 0 },
          { country: 'South Africa', risk: 25, value: 0, percentage: 0 },
        ];
      }

      // Country risk ratings (simplified - in production, use external API)
      const countryRiskRatings: Record<string, number> = {
        'Nigeria': 65, 'Kenya': 45, 'Ghana': 35, 'South Africa': 30,
        'Egypt': 55, 'Morocco': 40, 'Tanzania': 50, 'Ethiopia': 60,
        'Ivory Coast': 45, 'Senegal': 40, 'Rwanda': 35, 'Uganda': 50,
        'Cameroon': 55, 'DRC': 70, 'Zambia': 45, 'Zimbabwe': 65,
        'Mozambique': 55, 'Angola': 60, 'Botswana': 25, 'Namibia': 30,
      };

      // Aggregate by country
      const countryTotals: Record<string, number> = {};
      let totalValue = 0;

      trades.forEach(trade => {
        const country = trade.destination_country || 'Unknown';
        const value = trade.value || 0;
        countryTotals[country] = (countryTotals[country] || 0) + value;
        totalValue += value;
      });

      // Calculate exposure
      const exposure = Object.entries(countryTotals)
        .map(([country, value]) => ({
          country,
          risk: countryRiskRatings[country] || 50,
          value,
          percentage: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      return exposure;
    } catch (e) {
      console.error('Failed to calculate country risk:', e);
      return [];
    }
  },

  getFinanciers: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('financiers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to fetch financiers:', e);
      return [];
    }
  },

  createFinanceRequest: async (request: {
    trade_id?: string;
    financier_id?: string;
    product_type: string;
    amount: number;
    documents_url?: string[];
  }): Promise<DbFinanceRequest | null> => {
    try {
      if (!(await hasCompletedOnboarding())) {
        throw new Error('ONBOARDING_REQUIRED');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('finance_requests')
        .insert({
          ...request,
          applicant_id: user.id,
          status: 'pending',
          risk_score: Math.floor(Math.random() * 30) + 50, // Mock risk score 50-80
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as DbFinanceRequest;
    } catch (e) {
      console.error('Failed to create finance request:', e);
      return null;
    }
  },

  getMarketIntelligence: async (): Promise<DbMarketIntelligence[]> => {
    try {
        const { data, error } = await supabase.from('market_intelligence').select('*');
        if (error) throw error;
        return (data || []) as DbMarketIntelligence[];
    } catch (e) {
        return [];
    }
  },

  getAuditLogs: async (): Promise<DbAuditLog[]> => {
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      
      // Map DB fields to UI expected fields if necessary (DB uses created_at, UI uses timestamp)
      return (data || []).map((log: any) => ({
        ...log,
        timestamp: new Date(log.created_at).toLocaleString(),
        user: log.user_id ? 'User' : 'System' // In real app, join with profiles
      }));
    } catch (e) {
      return [];
    }
  },

  getKYCRequests: async (): Promise<DbKYCRequest[]> => {
    try {
      const { data, error } = await supabase.from('kyc_requests').select('*');
      if (error) throw error;
      return (data || []) as DbKYCRequest[];
    } catch(e) {
      return [];
    }
  },

  getAMLAlerts: async (): Promise<DbAMLAlert[]> => {
    try {
      const { data, error } = await supabase.from('aml_alerts').select('*');
      if (error) throw error;
      return (data || []) as DbAMLAlert[];
    } catch(e) {
      return [];
    }
  },

  // --- WRITE METHODS ---

  createTrade: async (tradeData: Partial<DbTrade>): Promise<DbTrade | null> => {
    try {
      if (!(await hasCompletedOnboarding())) {
        throw new Error('ONBOARDING_REQUIRED');
      }

      const { data: { user } } = await supabase.auth.getUser();
      console.log("createTrade - Current user:", user?.id || "NOT AUTHENTICATED (will use placeholder)");

      const payload = {
        ...tradeData,
        exporter_id: user?.id || null, // Allow null for testing without auth
        status: tradeData.status || 'draft'
      };
      console.log("createTrade - Payload:", payload);

      const { data, error } = await supabase
        .from('trades')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("createTrade - Supabase error:", error);
        throw error;
      }
      
      console.log("createTrade - Success:", data);
      return data as DbTrade;
    } catch (e: any) {
      console.error("Create Trade Error (Falling back to local mock):", e.message || e);
      // Fallback for demo purposes if table doesn't exist yet
      return { 
        id: `TRD-${Math.floor(Math.random() * 1000)}`, 
        exporter_id: 'mock_user', 
        created_at: new Date().toISOString(),
        ...tradeData 
      } as DbTrade;
    }
  },

  updateTrade: async (tradeId: string, updates: Partial<DbTrade>): Promise<DbTrade | null> => {
    try {
      if (!(await hasCompletedOnboarding())) {
        throw new Error('ONBOARDING_REQUIRED');
      }

      const { data, error } = await supabase
        .from('trades')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', tradeId)
        .select()
        .single();

      if (error) throw error;
      return data as DbTrade;
    } catch (e) {
      console.error("Update Trade Error:", e);
      // Return mock update for demo
      return { id: tradeId, ...updates } as DbTrade;
    }
  },

  getTradeById: async (tradeId: string): Promise<DbTrade | null> => {
    try {
      if (!(await hasCompletedOnboarding())) {
        return null;
      }

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (error) throw error;
      return data as DbTrade;
    } catch (e) {
      console.error("Get Trade Error:", e);
      return null;
    }
  },

  deleteTrade: async (tradeId: string): Promise<boolean> => {
    try {
      if (!(await hasCompletedOnboarding())) {
        throw new Error('ONBOARDING_REQUIRED');
      }

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Delete Trade Error:", e);
      return false;
    }
  },

  // --- ADMIN METHODS ---

  getAdminStats: async (): Promise<{
    totalUsers: number;
    totalTrades: number;
    totalOrganizations: number;
    usersByCountry: { country: string; count: number; trades: number }[];
  }> => {
    try {
      const [usersRes, tradesRes, orgsRes] = await Promise.all([
        supabase.from('profiles').select('id, country, role', { count: 'exact' }),
        supabase.from('trades').select('id, origin_country, destination_country', { count: 'exact' }),
        supabase.from('organizations').select('id', { count: 'exact' }),
      ]);

      const users = usersRes.data || [];
      const trades = tradesRes.data || [];
      const totalUsers = usersRes.count || users.length;
      const totalTrades = tradesRes.count || trades.length;
      const totalOrganizations = orgsRes.count || 0;

      // Aggregate users by country
      const countryMap: Record<string, { count: number; trades: number }> = {};
      users.forEach((u: any) => {
        const c = u.country || 'Unknown';
        if (!countryMap[c]) countryMap[c] = { count: 0, trades: 0 };
        countryMap[c].count++;
      });
      trades.forEach((t: any) => {
        const c = t.origin_country || t.destination_country || 'Unknown';
        if (!countryMap[c]) countryMap[c] = { count: 0, trades: 0 };
        countryMap[c].trades++;
      });

      const usersByCountry = Object.entries(countryMap)
        .map(([country, data]) => ({ country, ...data }))
        .sort((a, b) => b.count - a.count);

      return { totalUsers, totalTrades, totalOrganizations, usersByCountry };
    } catch (e) {
      console.error('getAdminStats error:', e);
      return { totalUsers: 0, totalTrades: 0, totalOrganizations: 0, usersByCountry: [] };
    }
  },

  getAllUsers: async (): Promise<DbUser[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as DbUser[];
    } catch (e) {
      console.error('getAllUsers error:', e);
      return [];
    }
  },

  updateKYCStatus: async (id: string, status: 'Approved' | 'Rejected'): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('kyc_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('updateKYCStatus error:', e);
      return false;
    }
  },

  updateAMLStatus: async (id: string, status: 'Investigating' | 'Resolved'): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('aml_alerts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('updateAMLStatus error:', e);
      return false;
    }
  },

  // --- FINANCE MODULE: FX Rates, Hedging, Summary ---

  getFXRates: async (): Promise<{ pair: string; rate: number; change: number; changePercent: number }[]> => {
    try {
      const { data, error } = await supabase
        .from('fx_rates')
        .select('pair, rate, change, change_percent')
        .order('pair');
      if (error) throw error;
      return (data || []).map((r: any) => ({
        pair: r.pair,
        rate: Number(r.rate),
        change: Number(r.change),
        changePercent: Number(r.change_percent),
      }));
    } catch (e) {
      console.error('getFXRates error:', e);
      return [];
    }
  },

  getFXRateHistory: async (pair: string): Promise<{ time: string; rate: number }[]> => {
    try {
      const { data, error } = await supabase
        .from('fx_rate_history')
        .select('rate, recorded_at')
        .eq('pair', pair)
        .order('recorded_at', { ascending: true })
        .limit(30);
      if (error) throw error;
      return (data || []).map((r: any, i: number) => ({
        time: `Day ${i + 1}`,
        rate: Number(r.rate),
      }));
    } catch (e) {
      console.error('getFXRateHistory error:', e);
      return [];
    }
  },

  getHedgingSuggestions: async (): Promise<{ id: string; type: 'forward' | 'option' | 'swap'; pair: string; description: string; savings: string; risk: 'low' | 'medium' | 'high'; term: string }[]> => {
    try {
      const { data, error } = await supabase
        .from('hedging_suggestions')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return (data || []).map((h: any) => ({
        id: h.id,
        type: h.type,
        pair: h.pair,
        description: h.description,
        savings: h.savings_display || `$${Number(h.estimated_savings).toLocaleString()}`,
        risk: h.risk,
        term: h.term,
      }));
    } catch (e) {
      console.error('getHedgingSuggestions error:', e);
      return [];
    }
  },

  getFinanceSummary: async (): Promise<{
    approvedCredit: number;
    avgInterestRate: number;
    nextRepaymentDate: string | null;
    nextRepaymentAmount: number;
    fxExposure: number;
    hedgedAmount: number;
  }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { approvedCredit: 0, avgInterestRate: 0, nextRepaymentDate: null, nextRepaymentAmount: 0, fxExposure: 0, hedgedAmount: 0 };

      // Try finance_summary table first
      const { data: summary } = await supabase
        .from('finance_summary')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (summary) {
        return {
          approvedCredit: Number(summary.approved_credit) || 0,
          avgInterestRate: Number(summary.avg_interest_rate) || 0,
          nextRepaymentDate: summary.next_repayment_date || null,
          nextRepaymentAmount: Number(summary.next_repayment_amount) || 0,
          fxExposure: Number(summary.fx_exposure) || 0,
          hedgedAmount: Number(summary.hedged_amount) || 0,
        };
      }

      // Fallback: compute from finance_requests and trades
      const [finReqRes, tradesRes] = await Promise.all([
        supabase.from('finance_requests').select('status, amount, product_type').eq('applicant_id', user.id),
        supabase.from('trades').select('value, currency, status').eq('exporter_id', user.id),
      ]);

      const finReqs = finReqRes.data || [];
      const trades = tradesRes.data || [];

      const approved = finReqs.filter((f: any) => f.status === 'approved');
      const approvedCredit = approved.reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);

      // Avg interest from financiers that user has approved apps with
      const { data: financiers } = await supabase.from('financiers').select('interest_rate').eq('is_active', true);
      const rates = (financiers || []).map((f: any) => Number(f.interest_rate)).filter((r: number) => r > 0);
      const avgInterestRate = rates.length > 0 ? rates.reduce((a: number, b: number) => a + b, 0) / rates.length : 0;

      // FX exposure from active trades with non-USD currencies
      const activeTrades = trades.filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled');
      const fxExposure = activeTrades.reduce((sum: number, t: any) => sum + (Number(t.value) || 0), 0);

      return {
        approvedCredit,
        avgInterestRate: Math.round(avgInterestRate * 100) / 100,
        nextRepaymentDate: null,
        nextRepaymentAmount: 0,
        fxExposure,
        hedgedAmount: 0,
      };
    } catch (e) {
      console.error('getFinanceSummary error:', e);
      return { approvedCredit: 0, avgInterestRate: 0, nextRepaymentDate: null, nextRepaymentAmount: 0, fxExposure: 0, hedgedAmount: 0 };
    }
  },

  createAuditLog: async (log: { action: string; user_id?: string; details?: string; ip?: string; status: string }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          ...log,
          created_at: new Date().toISOString(),
        });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('createAuditLog error:', e);
      return false;
    }
  },
};
