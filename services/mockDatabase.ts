
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
    status: 'active',
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as DbUser;
    } catch (e) {
      console.warn("Using fallback profile (DB unreachable or record missing)");
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
      if (!user) return MOCK_TRADES;

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('exporter_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return (data && data.length > 0) ? data as DbTrade[] : MOCK_TRADES;
    } catch (e) {
      return MOCK_TRADES; 
    }
  },

  getFinanceRequests: async (userId: string): Promise<DbFinanceRequest[]> => {
    try {
        const { data, error } = await supabase.from('finance_requests').select('*');
        if(error) throw error;
        return (data && data.length > 0) ? data as DbFinanceRequest[] : MOCK_FINANCE_REQUESTS;
    } catch(e) {
        return MOCK_FINANCE_REQUESTS;
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
      if (!user) throw new Error("Not authenticated");

      const payload = {
        ...tradeData,
        exporter_id: user.id,
        status: tradeData.status || 'draft'
      };

      const { data, error } = await supabase
        .from('trades')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data as DbTrade;
    } catch (e) {
      console.error("Create Trade Error (Falling back to local mock):", e);
      // Fallback for demo purposes if table doesn't exist yet
      return { 
        id: `TRD-${Math.floor(Math.random() * 1000)}`, 
        exporter_id: 'mock_user', 
        created_at: new Date().toISOString(),
        ...tradeData 
      } as DbTrade;
    }
  }
};
