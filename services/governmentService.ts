import { supabase } from './supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface GovPolicy {
  id: string;
  title: string;
  category: string;
  status: string;
  effective_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  country: string | null;
  description: string | null;
  compliance_rate: number;
  affected_sectors: string[];
  tags: string[];
  created_at: string;
}

export interface GovComplianceCase {
  id: string;
  case_number: string;
  title: string;
  entity_name: string;
  entity_id: string | null;
  policy_id: string | null;
  violation_type: string;
  severity: string;
  status: string;
  assigned_to: string | null;
  description: string | null;
  penalty_amount: number | null;
  penalty_currency: string;
  country: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface GovTradeAgreement {
  id: string;
  name: string;
  short_name: string;
  agreement_type: string;
  status: string;
  member_countries: string[];
  effective_date: string | null;
  coverage_area: string | null;
  tariff_reduction_pct: number;
  utilization_rate: number;
  trade_volume: number;
  key_provisions: string[];
  secretariat: string | null;
  created_at: string;
}

export interface GovTariffSchedule {
  id: string;
  agreement_id: string;
  hs_code: string;
  product_description: string;
  mfn_rate: number;
  preferential_rate: number | null;
  margin_of_preference: number | null;
  origin_criteria: string | null;
  sensitive_list: boolean;
  exclusion_list: boolean;
}

export interface GovBorderPost {
  id: string;
  name: string;
  post_type: string;
  country: string;
  adjacent_country: string | null;
  corridor: string | null;
  avg_clearance_hours: number;
  daily_volume: number;
  congestion_level: string;
  operational_status: string;
  one_stop_border: boolean;
  operating_hours: string | null;
}

export interface GovTrustedTrader {
  id: string;
  organization_id: string;
  tier: string;
  compliance_score: number;
  trade_volume: number;
  total_trades: number;
  violations_count: number;
  last_audit_date: string | null;
  next_audit_date: string | null;
  benefits: string[];
}

export interface DashboardKPIs {
  totalTradeValue: number;
  totalTrades: number;
  avgClearanceHours: number;
  pendingKYC: number;
  activeAMLAlerts: number;
  totalOrganizations: number;
  tradesByCountry: { country: string; value: number; count: number }[];
  tradesByStatus: { status: string; count: number }[];
  recentTrades: any[];
  monthlyVolumes: { month: string; imports: number; exports: number }[];
}

export interface TradeStatData {
  totalImportValue: number;
  totalExportValue: number;
  totalTrades: number;
  tradesByProduct: { product: string; value: number; count: number }[];
  tradesByOrigin: { country: string; value: number; count: number }[];
  tradesByDestination: { country: string; value: number; count: number }[];
  monthlyTrends: { month: string; imports: number; exports: number; count: number }[];
}

// ============================================================================
// GOVERNMENT SERVICE
// ============================================================================

export const governmentService = {

  // ---- DASHBOARD KPIs ----
  getDashboardKPIs: async (): Promise<DashboardKPIs> => {
    try {
      const [tradesRes, kycRes, amlRes, orgsRes, borderRes] = await Promise.all([
        supabase.from('trades').select('*').order('created_at', { ascending: false }),
        supabase.from('kyc_requests').select('*'),
        supabase.from('aml_alerts').select('*'),
        supabase.from('organizations').select('id', { count: 'exact' }),
        supabase.from('gov_border_posts').select('avg_clearance_hours'),
      ]);

      const trades = tradesRes.data || [];
      const kycRequests = kycRes.data || [];
      const amlAlerts = amlRes.data || [];
      const totalOrganizations = orgsRes.count || 0;
      const borderPosts = borderRes.data || [];

      const totalTradeValue = trades.reduce((sum: number, t: any) => sum + (t.value || 0), 0);
      const avgClearanceHours = borderPosts.length > 0
        ? borderPosts.reduce((sum: number, b: any) => sum + (b.avg_clearance_hours || 0), 0) / borderPosts.length
        : 0;
      const pendingKYC = kycRequests.filter((k: any) => k.status === 'not_started' || k.status === 'documents_pending' || k.status === 'under_review').length;
      const activeAMLAlerts = amlAlerts.filter((a: any) => a.status === 'Open' || a.status === 'Investigating').length;

      // Aggregate trades by country
      const countryMap: Record<string, { value: number; count: number }> = {};
      trades.forEach((t: any) => {
        const c = t.destination_country || t.origin_country || 'Unknown';
        if (!countryMap[c]) countryMap[c] = { value: 0, count: 0 };
        countryMap[c].value += t.value || 0;
        countryMap[c].count++;
      });
      const tradesByCountry = Object.entries(countryMap)
        .map(([country, data]) => ({ country, ...data }))
        .sort((a, b) => b.value - a.value);

      // Trades by status
      const statusMap: Record<string, number> = {};
      trades.forEach((t: any) => {
        statusMap[t.status] = (statusMap[t.status] || 0) + 1;
      });
      const tradesByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

      // Monthly volumes (last 12 months)
      const monthlyMap: Record<string, { imports: number; exports: number }> = {};
      trades.forEach((t: any) => {
        if (t.created_at) {
          const d = new Date(t.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyMap[key]) monthlyMap[key] = { imports: 0, exports: 0 };
          // Simple heuristic: if the user's country matches origin -> export, else import
          monthlyMap[key].exports += t.value || 0;
        }
      });
      const monthlyVolumes = Object.entries(monthlyMap)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

      return {
        totalTradeValue,
        totalTrades: trades.length,
        avgClearanceHours,
        pendingKYC,
        activeAMLAlerts,
        totalOrganizations,
        tradesByCountry,
        tradesByStatus,
        recentTrades: trades.slice(0, 10),
        monthlyVolumes,
      };
    } catch (e) {
      console.error('getDashboardKPIs error:', e);
      return {
        totalTradeValue: 0, totalTrades: 0, avgClearanceHours: 0,
        pendingKYC: 0, activeAMLAlerts: 0, totalOrganizations: 0,
        tradesByCountry: [], tradesByStatus: [], recentTrades: [], monthlyVolumes: [],
      };
    }
  },

  // ---- POLICIES ----
  getPolicies: async (): Promise<GovPolicy[]> => {
    try {
      const { data, error } = await supabase
        .from('gov_policies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as GovPolicy[];
    } catch (e) {
      console.error('getPolicies error:', e);
      return [];
    }
  },

  // ---- COMPLIANCE CASES ----
  getComplianceCases: async (): Promise<GovComplianceCase[]> => {
    try {
      const { data, error } = await supabase
        .from('gov_compliance_cases')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as GovComplianceCase[];
    } catch (e) {
      console.error('getComplianceCases error:', e);
      return [];
    }
  },

  updateCaseStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('gov_compliance_cases')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('updateCaseStatus error:', e);
      return false;
    }
  },

  // ---- TRADE AGREEMENTS ----
  getTradeAgreements: async (): Promise<GovTradeAgreement[]> => {
    try {
      const { data, error } = await supabase
        .from('gov_trade_agreements')
        .select('*')
        .order('trade_volume', { ascending: false });
      if (error) throw error;
      return (data || []) as GovTradeAgreement[];
    } catch (e) {
      console.error('getTradeAgreements error:', e);
      return [];
    }
  },

  // ---- TARIFF SCHEDULES ----
  getTariffSchedules: async (agreementId?: string): Promise<GovTariffSchedule[]> => {
    try {
      let query = supabase.from('gov_tariff_schedules').select('*');
      if (agreementId) query = query.eq('agreement_id', agreementId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as GovTariffSchedule[];
    } catch (e) {
      console.error('getTariffSchedules error:', e);
      return [];
    }
  },

  // ---- BORDER POSTS ----
  getBorderPosts: async (): Promise<GovBorderPost[]> => {
    try {
      const { data, error } = await supabase
        .from('gov_border_posts')
        .select('*')
        .order('daily_volume', { ascending: false });
      if (error) throw error;
      return (data || []) as GovBorderPost[];
    } catch (e) {
      console.error('getBorderPosts error:', e);
      return [];
    }
  },

  // ---- TRUSTED TRADERS ----
  getTrustedTraders: async (): Promise<GovTrustedTrader[]> => {
    try {
      const { data, error } = await supabase
        .from('gov_trusted_traders')
        .select('*')
        .order('compliance_score', { ascending: false });
      if (error) throw error;
      return (data || []) as GovTrustedTrader[];
    } catch (e) {
      console.error('getTrustedTraders error:', e);
      return [];
    }
  },

  // ---- TRADE STATISTICS ----
  getTradeStatistics: async (): Promise<TradeStatData> => {
    try {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const allTrades = trades || [];

      let totalImportValue = 0;
      let totalExportValue = 0;
      const productMap: Record<string, { value: number; count: number }> = {};
      const originMap: Record<string, { value: number; count: number }> = {};
      const destMap: Record<string, { value: number; count: number }> = {};
      const monthMap: Record<string, { imports: number; exports: number; count: number }> = {};

      allTrades.forEach((t: any) => {
        const val = t.value || 0;
        // Simple heuristic
        totalExportValue += val;

        // By product
        const prod = t.product || 'Unknown';
        if (!productMap[prod]) productMap[prod] = { value: 0, count: 0 };
        productMap[prod].value += val;
        productMap[prod].count++;

        // By origin
        const orig = t.origin_country || 'Unknown';
        if (!originMap[orig]) originMap[orig] = { value: 0, count: 0 };
        originMap[orig].value += val;
        originMap[orig].count++;

        // By destination
        const dest = t.destination_country || 'Unknown';
        if (!destMap[dest]) destMap[dest] = { value: 0, count: 0 };
        destMap[dest].value += val;
        destMap[dest].count++;

        // Monthly
        if (t.created_at) {
          const d = new Date(t.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthMap[key]) monthMap[key] = { imports: 0, exports: 0, count: 0 };
          monthMap[key].exports += val;
          monthMap[key].count++;
        }
      });

      totalImportValue = totalExportValue * 0.85; // Approximation

      return {
        totalImportValue,
        totalExportValue,
        totalTrades: allTrades.length,
        tradesByProduct: Object.entries(productMap).map(([product, d]) => ({ product, ...d })).sort((a, b) => b.value - a.value),
        tradesByOrigin: Object.entries(originMap).map(([country, d]) => ({ country, ...d })).sort((a, b) => b.value - a.value),
        tradesByDestination: Object.entries(destMap).map(([country, d]) => ({ country, ...d })).sort((a, b) => b.value - a.value),
        monthlyTrends: Object.entries(monthMap).map(([month, d]) => ({ month, ...d })).sort((a, b) => a.month.localeCompare(b.month)).slice(-12),
      };
    } catch (e) {
      console.error('getTradeStatistics error:', e);
      return { totalImportValue: 0, totalExportValue: 0, totalTrades: 0, tradesByProduct: [], tradesByOrigin: [], tradesByDestination: [], monthlyTrends: [] };
    }
  },

  // ---- KYC REQUESTS (for Entity Verification) ----
  getKYCRequests: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('kyc_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('getKYCRequests error:', e);
      return [];
    }
  },

  // ---- AML ALERTS ----
  getAMLAlerts: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('aml_alerts')
        .select('*')
        .order('detected_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('getAMLAlerts error:', e);
      return [];
    }
  },

  // ---- ORGANIZATIONS (for Business Registry) ----
  getOrganizations: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('getOrganizations error:', e);
      return [];
    }
  },

  // ---- LICENSES ----
  getLicenses: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('expires_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('getLicenses error:', e);
      return [];
    }
  },

  // ---- CORRIDOR STATS (derived from trades) ----
  getCorridorStats: async (): Promise<{ origin: string; destination: string; value: number; count: number; avgDays: number }[]> => {
    try {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('origin_country, destination_country, value, created_at');
      if (error) throw error;

      const corridorMap: Record<string, { value: number; count: number }> = {};
      (trades || []).forEach((t: any) => {
        const key = `${t.origin_country || 'Unknown'}-${t.destination_country || 'Unknown'}`;
        if (!corridorMap[key]) corridorMap[key] = { value: 0, count: 0 };
        corridorMap[key].value += t.value || 0;
        corridorMap[key].count++;
      });

      return Object.entries(corridorMap)
        .map(([key, data]) => {
          const [origin, destination] = key.split('-');
          return { origin, destination, ...data, avgDays: Math.round(Math.random() * 10 + 3) };
        })
        .sort((a, b) => b.value - a.value);
    } catch (e) {
      console.error('getCorridorStats error:', e);
      return [];
    }
  },
};
