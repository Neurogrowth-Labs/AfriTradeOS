
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

// --- MOCK DATA FALLBACKS ---

const MOCK_ORGANIZATIONS: DbOrganization[] = [
  {
    id: 'org_1',
    name: 'Cocoa Processing Co.',
    type: 'buyer',
    location: 'Accra, Ghana',
    verification_status: true,
    rating: 4.8,
    reviews_count: 124,
    tags: ['Agro-Processing', 'Bulk Buyer', 'Fair Trade'],
    description: 'Leading processor of high-quality cocoa beans seeking reliable regional suppliers.',
    logo_initial: 'C'
  },
  {
    id: 'org_2',
    name: 'Nairobi Fresh Exports',
    type: 'seller',
    location: 'Nairobi, Kenya',
    verification_status: true,
    rating: 4.5,
    reviews_count: 89,
    tags: ['Horticulture', 'Avocados', 'Global GAP'],
    description: 'Exporter of premium fresh produce with established cold chain logistics.',
    logo_initial: 'N'
  },
  {
    id: 'org_bank_1',
    name: 'Ecobank',
    type: 'finance',
    location: 'Lome, Togo',
    verification_status: true,
    rating: 4.9,
    reviews_count: 500,
    tags: ['Trade Finance', 'Letters of Credit'],
    description: 'Pan-African banking conglomerate.',
    logo_initial: 'E'
  }
];

const MOCK_TRADES: DbTrade[] = [
  {
    id: 'TRD-MOCK-1',
    exporter_id: 'user_current',
    importer_id: 'org_1',
    origin_country: 'Nigeria',
    destination_country: 'Ghana',
    product: 'Shea Butter',
    hs_code: '1515.90',
    value: 50000,
    currency: 'USD',
    status: 'pending_execution',
    incoterm: 'DDP',
    created_at: '2024-10-24T09:00:00Z'
  }
];

const MOCK_FINANCE_REQUESTS: DbFinanceRequest[] = [
  { 
    id: 'FIN-2024-001', 
    trade_id: 'TRD-882', 
    financier_id: 'org_bank_1', 
    status: 'approved', 
    product_type: 'Working Capital', 
    amount: 50000, 
    risk_score: 25, 
    date_requested: '2024-10-20',
    provider_name: 'Ecobank'
  }
];

const MOCK_MARKET_INTELLIGENCE: DbMarketIntelligence[] = [
  { id: 'mi_1', product_code: 'SHEA', country: 'Nigeria', demand_index: 'High', price_trend: '+15%', sentiment: 'Positive', region: 'West Africa' },
  { id: 'mi_2', product_code: 'AVO', country: 'Kenya', demand_index: 'Medium', price_trend: '+5%', sentiment: 'Neutral', region: 'East Africa' },
  { id: 'mi_3', product_code: 'COCOA', country: 'Ghana', demand_index: 'High', price_trend: '+12%', sentiment: 'Positive', region: 'West Africa' },
];

const MOCK_AUDIT_LOGS: DbAuditLog[] = [
  { id: 'log_1', action: 'Login Success', user: 'System', timestamp: 'Just now', ip: '102.12.33.1', status: 'Success' },
];

const MOCK_KYC_REQUESTS: DbKYCRequest[] = [];
const MOCK_AML_ALERTS: DbAMLAlert[] = [];

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
      return (data && data.length > 0) ? data as DbOrganization[] : MOCK_ORGANIZATIONS.filter(o => typeFilter === 'all' || !typeFilter || o.type === typeFilter);
    } catch (e) {
      return MOCK_ORGANIZATIONS.filter(o => typeFilter === 'all' || !typeFilter || o.type === typeFilter);
    }
  },

  getTrades: async (): Promise<DbTrade[]> => {
    try {
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
      return (data && data.length > 0) ? data as DbTrade[] : MOCK_TRADES;
    } catch (e: unknown) {
      // Ignore AbortError from React StrictMode double-invoke
      if (e instanceof Error && (e.name === 'AbortError' || e.message?.includes('aborted'))) {
        return MOCK_TRADES;
      }
      console.error("getTrades error:", e);
      return MOCK_TRADES; 
    }
  },

  getFinanceRequests: async (userId: string): Promise<DbFinanceRequest[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        let query = supabase.from('finance_requests').select('*').order('created_at', { ascending: false });
        
        if (user) {
          query = query.eq('applicant_id', user.id);
        }
        
        const { data, error } = await query;
        if(error) throw error;
        return (data && data.length > 0) ? data as DbFinanceRequest[] : MOCK_FINANCE_REQUESTS;
    } catch(e) {
        return MOCK_FINANCE_REQUESTS;
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
        return (data && data.length > 0) ? data as DbMarketIntelligence[] : MOCK_MARKET_INTELLIGENCE;
    } catch (e) {
        return MOCK_MARKET_INTELLIGENCE;
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
      return MOCK_AUDIT_LOGS;
    }
  },

  getKYCRequests: async (): Promise<DbKYCRequest[]> => {
    try {
      const { data, error } = await supabase.from('kyc_requests').select('*');
      if (error) throw error;
      return (data || []) as DbKYCRequest[];
    } catch(e) {
      return MOCK_KYC_REQUESTS;
    }
  },

  getAMLAlerts: async (): Promise<DbAMLAlert[]> => {
    try {
      const { data, error } = await supabase.from('aml_alerts').select('*');
      if (error) throw error;
      return (data || []) as DbAMLAlert[];
    } catch(e) {
      return MOCK_AML_ALERTS;
    }
  },

  // --- WRITE METHODS ---

  createTrade: async (tradeData: Partial<DbTrade>): Promise<DbTrade | null> => {
    try {
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
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (error) throw error;
      return data as DbTrade;
    } catch (e) {
      console.error("Get Trade Error:", e);
      return MOCK_TRADES.find(t => t.id === tradeId) || null;
    }
  },

  deleteTrade: async (tradeId: string): Promise<boolean> => {
    try {
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
  }
};
