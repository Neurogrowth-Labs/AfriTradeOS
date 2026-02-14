import { supabase } from './supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface CustomsDeclaration {
  id: string;
  declaration_number: string;
  declaration_type: 'import' | 'export' | 'transit' | 're_export' | 'temporary_import';
  status: 'draft' | 'submitted' | 'under_review' | 'queried' | 'approved' | 'rejected' | 'cleared' | 'cancelled';
  trader_id: string | null;
  trader_name: string;
  trader_tin: string | null;
  origin_country: string;
  destination_country: string;
  port_of_entry: string | null;
  port_of_exit: string | null;
  hs_code: string;
  hs_code_description: string | null;
  product_description: string;
  quantity: number;
  unit: string;
  gross_weight: number | null;
  net_weight: number | null;
  declared_value: number;
  currency: string;
  cif_value: number | null;
  fob_value: number | null;
  duty_rate: number;
  duty_amount: number;
  vat_rate: number;
  vat_amount: number;
  total_taxes: number;
  afcfta_eligible: boolean;
  preferential_rate_applied: boolean;
  tariff_preference_savings: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: any[];
  ai_risk_flags: any[];
  documents: any[];
  assigned_officer_id: string | null;
  assigned_officer_name: string | null;
  review_notes: string | null;
  query_reason: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  cleared_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomsReview {
  id: string;
  declaration_id: string;
  officer_id: string | null;
  officer_name: string | null;
  action: 'assign' | 'review' | 'query' | 'approve' | 'reject' | 'escalate' | 'clear';
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  internal_notes: string | null;
  risk_score_before: number | null;
  risk_score_after: number | null;
  sla_deadline: string | null;
  sla_met: boolean | null;
  processing_time_seconds: number | null;
  created_at: string;
}

export interface CustomsCertificate {
  id: string;
  certificate_number: string;
  certificate_type: 'origin' | 'phytosanitary' | 'health' | 'quality' | 'conformity' | 'fumigation';
  issuing_country: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string | null;
  hs_code: string | null;
  product_description: string | null;
  exporter_name: string;
  exporter_country: string;
  importer_name: string | null;
  importer_country: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'expired' | 'revoked';
  verified_at: string | null;
  afcfta_compliant: boolean;
  origin_criteria: string | null;
  blockchain_hash: string | null;
  qr_code_data: string | null;
  created_at: string;
}

export interface CustomsTrader {
  id: string;
  organization_id: string | null;
  tin: string | null;
  customs_code: string | null;
  registration_date: string | null;
  license_expiry: string | null;
  trader_type: 'importer' | 'exporter' | 'broker' | 'freight_forwarder' | 'warehouse_operator' | null;
  risk_classification: 'trusted' | 'standard' | 'elevated' | 'high_risk' | 'blacklisted';
  compliance_score: number;
  total_declarations: number;
  approved_declarations: number;
  rejected_declarations: number;
  total_trade_value: number;
  violations_count: number;
  active_alerts: number;
  sanctions_status: 'clear' | 'flagged' | 'blocked';
  aeo_status: 'none' | 'applied' | 'certified' | 'suspended' | 'revoked';
  aeo_tier: 'gold' | 'silver' | 'bronze' | null;
  aeo_benefits: string[];
  last_audit_date: string | null;
  next_audit_date: string | null;
  created_at: string;
}

export interface CustomsShipment {
  id: string;
  declaration_id: string | null;
  tracking_number: string | null;
  container_number: string | null;
  bill_of_lading: string | null;
  transport_mode: 'sea' | 'air' | 'road' | 'rail' | 'multimodal' | null;
  vessel_name: string | null;
  carrier_name: string | null;
  origin_port: string | null;
  destination_port: string | null;
  current_location: string | null;
  current_country: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'pre_arrival' | 'arrived' | 'under_inspection' | 'customs_hold' | 'cleared' | 'released' | 'in_transit' | 'delivered' | 'seized';
  eta: string | null;
  ata: string | null;
  inspection_required: boolean;
  inspection_result: string | null;
  risk_score: number;
  risk_flags: any[];
  timeline: any[];
  created_at: string;
}

export interface CustomsAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  declaration_id: string | null;
  trader_id: string | null;
  shipment_id: string | null;
  title: string;
  description: string | null;
  ai_confidence: number | null;
  pattern_details: any;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'escalated';
  assigned_to: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface CustomsOfficer {
  id: string;
  user_id: string;
  badge_number: string | null;
  rank: string | null;
  station: string | null;
  department: string | null;
  declarations_reviewed: number;
  declarations_approved: number;
  declarations_rejected: number;
  avg_review_time_minutes: number;
  accuracy_rate: number;
  current_queue_size: number;
  daily_target: number;
  is_active: boolean;
  last_active_at: string | null;
}

export interface CustomsHSCode {
  id: string;
  hs_code: string;
  description: string;
  chapter: string | null;
  mfn_rate: number;
  afcfta_rate: number;
  ecowas_rate: number;
  eac_rate: number;
  sadc_rate: number;
  unit: string;
  requires_license: boolean;
  restricted: boolean;
  prohibited: boolean;
  high_risk: boolean;
}

export interface CustomsDashboardKPIs {
  totalDeclarations: number;
  pendingReview: number;
  clearedToday: number;
  revenueToday: number;
  avgClearanceHours: number;
  highRiskCount: number;
  afcftaUtilization: number;
  topCommodities: { hs_code: string; description: string; count: number; value: number }[];
  declarationsByStatus: { status: string; count: number }[];
  declarationsByCountry: { country: string; imports: number; exports: number }[];
  riskDistribution: { level: string; count: number }[];
  revenueByType: { type: string; amount: number }[];
  officerPerformance: { name: string; reviewed: number; approved: number; avgTime: number }[];
}

// =============================================================================
// CUSTOMS SERVICE
// =============================================================================

export const customsService = {

  // ---- DASHBOARD KPIs ----
  getDashboardKPIs: async (): Promise<CustomsDashboardKPIs> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [declarationsRes, revenueRes, alertsRes, officersRes] = await Promise.all([
        supabase.from('customs_declarations').select('*').order('created_at', { ascending: false }),
        supabase.from('customs_revenue').select('*').eq('payment_date', today),
        supabase.from('customs_alerts').select('*').in('status', ['open', 'investigating']),
        supabase.from('customs_officers').select('*').eq('is_active', true),
      ]);

      const declarations = declarationsRes.data || [];
      const revenue = revenueRes.data || [];
      const alerts = alertsRes.data || [];
      const officers = officersRes.data || [];

      // Calculate KPIs
      const totalDeclarations = declarations.length;
      const pendingReview = declarations.filter((d: any) => d.status === 'submitted' || d.status === 'under_review').length;
      const clearedToday = declarations.filter((d: any) => 
        d.status === 'cleared' && d.cleared_at && d.cleared_at.startsWith(today)
      ).length;
      const revenueToday = revenue.reduce((sum: number, r: any) => sum + (r.total_collected || 0), 0);
      const highRiskCount = declarations.filter((d: any) => d.risk_level === 'high' || d.risk_level === 'critical').length;
      
      // AfCFTA utilization
      const eligibleCount = declarations.filter((d: any) => d.afcfta_eligible).length;
      const afcftaUtilization = totalDeclarations > 0 ? Math.round((eligibleCount / totalDeclarations) * 100) : 0;

      // Avg clearance time (mock calculation)
      const avgClearanceHours = 24; // Would calculate from actual timestamps

      // Declarations by status
      const statusMap: Record<string, number> = {};
      declarations.forEach((d: any) => {
        statusMap[d.status] = (statusMap[d.status] || 0) + 1;
      });
      const declarationsByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

      // Declarations by country
      const countryMap: Record<string, { imports: number; exports: number }> = {};
      declarations.forEach((d: any) => {
        const country = d.declaration_type === 'import' ? d.origin_country : d.destination_country;
        if (!countryMap[country]) countryMap[country] = { imports: 0, exports: 0 };
        if (d.declaration_type === 'import') countryMap[country].imports++;
        else countryMap[country].exports++;
      });
      const declarationsByCountry = Object.entries(countryMap)
        .map(([country, data]) => ({ country, ...data }))
        .sort((a, b) => (b.imports + b.exports) - (a.imports + a.exports))
        .slice(0, 10);

      // Risk distribution
      const riskMap: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
      declarations.forEach((d: any) => {
        if (riskMap[d.risk_level] !== undefined) riskMap[d.risk_level]++;
      });
      const riskDistribution = Object.entries(riskMap).map(([level, count]) => ({ level, count }));

      // Top commodities
      const hsMap: Record<string, { description: string; count: number; value: number }> = {};
      declarations.forEach((d: any) => {
        const hs = d.hs_code?.substring(0, 4) || 'Unknown';
        if (!hsMap[hs]) hsMap[hs] = { description: d.hs_code_description || d.product_description || '', count: 0, value: 0 };
        hsMap[hs].count++;
        hsMap[hs].value += d.declared_value || 0;
      });
      const topCommodities = Object.entries(hsMap)
        .map(([hs_code, data]) => ({ hs_code, ...data }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Revenue by type
      const revenueByType = [
        { type: 'Import Duty', amount: revenue.reduce((sum: number, r: any) => sum + (r.duty_collected || 0), 0) },
        { type: 'VAT', amount: revenue.reduce((sum: number, r: any) => sum + (r.vat_collected || 0), 0) },
        { type: 'Excise', amount: revenue.reduce((sum: number, r: any) => sum + (r.excise_collected || 0), 0) },
        { type: 'Penalties', amount: revenue.reduce((sum: number, r: any) => sum + (r.penalties_collected || 0), 0) },
      ];

      // Officer performance
      const officerPerformance = officers.map((o: any) => ({
        name: o.badge_number || 'Officer',
        reviewed: o.declarations_reviewed || 0,
        approved: o.declarations_approved || 0,
        avgTime: o.avg_review_time_minutes || 0,
      }));

      return {
        totalDeclarations,
        pendingReview,
        clearedToday,
        revenueToday,
        avgClearanceHours,
        highRiskCount,
        afcftaUtilization,
        topCommodities,
        declarationsByStatus,
        declarationsByCountry,
        riskDistribution,
        revenueByType,
        officerPerformance,
      };
    } catch (e) {
      console.error('getDashboardKPIs error:', e);
      return {
        totalDeclarations: 0, pendingReview: 0, clearedToday: 0, revenueToday: 0,
        avgClearanceHours: 0, highRiskCount: 0, afcftaUtilization: 0,
        topCommodities: [], declarationsByStatus: [], declarationsByCountry: [],
        riskDistribution: [], revenueByType: [], officerPerformance: [],
      };
    }
  },

  // ---- DECLARATIONS ----
  getDeclarations: async (filters?: {
    status?: string;
    riskLevel?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<CustomsDeclaration[]> => {
    try {
      let query = supabase
        .from('customs_declarations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.riskLevel && filters.riskLevel !== 'all') {
        query = query.eq('risk_level', filters.riskLevel);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters?.search) {
        query = query.or(`declaration_number.ilike.%${filters.search}%,trader_name.ilike.%${filters.search}%,hs_code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as CustomsDeclaration[];
    } catch (e) {
      console.error('getDeclarations error:', e);
      return [];
    }
  },

  getDeclarationById: async (id: string): Promise<CustomsDeclaration | null> => {
    try {
      const { data, error } = await supabase
        .from('customs_declarations')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as CustomsDeclaration;
    } catch (e) {
      console.error('getDeclarationById error:', e);
      return null;
    }
  },

  getDeclarationReviewQueue: async (): Promise<CustomsDeclaration[]> => {
    try {
      const { data, error } = await supabase
        .from('customs_declarations')
        .select('*')
        .in('status', ['submitted', 'under_review', 'queried'])
        .order('risk_score', { ascending: false })
        .order('submitted_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      return (data || []) as CustomsDeclaration[];
    } catch (e) {
      console.error('getDeclarationReviewQueue error:', e);
      return [];
    }
  },

  updateDeclarationStatus: async (
    id: string, 
    status: string, 
    notes?: string,
    officerId?: string,
    officerName?: string
  ): Promise<boolean> => {
    try {
      const { data: current } = await supabase
        .from('customs_declarations')
        .select('status')
        .eq('id', id)
        .single();

      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'cleared') {
        updates.cleared_at = new Date().toISOString();
      }
      if (notes) {
        updates.review_notes = notes;
      }
      if (officerId) {
        updates.assigned_officer_id = officerId;
        updates.assigned_officer_name = officerName;
        updates.reviewed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('customs_declarations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Create review record
      await supabase.from('customs_reviews').insert({
        declaration_id: id,
        officer_id: officerId,
        officer_name: officerName,
        action: status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : status === 'queried' ? 'query' : 'review',
        previous_status: current?.status,
        new_status: status,
        notes,
      });

      return true;
    } catch (e) {
      console.error('updateDeclarationStatus error:', e);
      return false;
    }
  },

  // ---- CERTIFICATES ----
  getCertificates: async (filters?: { status?: string; type?: string }): Promise<CustomsCertificate[]> => {
    try {
      let query = supabase
        .from('customs_certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('certificate_type', filters.type);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as CustomsCertificate[];
    } catch (e) {
      console.error('getCertificates error:', e);
      return [];
    }
  },

  verifyCertificate: async (id: string, status: 'verified' | 'rejected', verifiedBy: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('customs_certificates')
        .update({
          status,
          verified_at: new Date().toISOString(),
          verified_by: verifiedBy,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('verifyCertificate error:', e);
      return false;
    }
  },

  // ---- TRADERS ----
  getTraders: async (filters?: { riskClass?: string; aeoStatus?: string; search?: string }): Promise<CustomsTrader[]> => {
    try {
      let query = supabase
        .from('customs_traders')
        .select('*')
        .order('compliance_score', { ascending: false });

      if (filters?.riskClass && filters.riskClass !== 'all') {
        query = query.eq('risk_classification', filters.riskClass);
      }
      if (filters?.aeoStatus && filters.aeoStatus !== 'all') {
        query = query.eq('aeo_status', filters.aeoStatus);
      }
      if (filters?.search) {
        query = query.or(`tin.ilike.%${filters.search}%,customs_code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as CustomsTrader[];
    } catch (e) {
      console.error('getTraders error:', e);
      return [];
    }
  },

  getTraderById: async (id: string): Promise<CustomsTrader | null> => {
    try {
      const { data, error } = await supabase
        .from('customs_traders')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as CustomsTrader;
    } catch (e) {
      console.error('getTraderById error:', e);
      return null;
    }
  },

  updateTraderRiskClass: async (id: string, riskClass: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('customs_traders')
        .update({ risk_classification: riskClass, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('updateTraderRiskClass error:', e);
      return false;
    }
  },

  // ---- SHIPMENTS ----
  getShipments: async (filters?: { status?: string }): Promise<CustomsShipment[]> => {
    try {
      let query = supabase
        .from('customs_shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as CustomsShipment[];
    } catch (e) {
      console.error('getShipments error:', e);
      return [];
    }
  },

  getShipmentById: async (id: string): Promise<CustomsShipment | null> => {
    try {
      const { data, error } = await supabase
        .from('customs_shipments')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as CustomsShipment;
    } catch (e) {
      console.error('getShipmentById error:', e);
      return null;
    }
  },

  // ---- ALERTS ----
  getAlerts: async (filters?: { severity?: string; status?: string; type?: string }): Promise<CustomsAlert[]> => {
    try {
      let query = supabase
        .from('customs_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.severity && filters.severity !== 'all') {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('alert_type', filters.type);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as CustomsAlert[];
    } catch (e) {
      console.error('getAlerts error:', e);
      return [];
    }
  },

  updateAlertStatus: async (id: string, status: string, notes?: string): Promise<boolean> => {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'resolved' || status === 'false_positive') {
        updates.resolved_at = new Date().toISOString();
      }
      if (notes) {
        updates.resolution_notes = notes;
      }

      const { error } = await supabase
        .from('customs_alerts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('updateAlertStatus error:', e);
      return false;
    }
  },

  // ---- HS CODES ----
  searchHSCodes: async (query: string): Promise<CustomsHSCode[]> => {
    try {
      const { data, error } = await supabase
        .from('customs_hs_codes')
        .select('*')
        .or(`hs_code.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return (data || []) as CustomsHSCode[];
    } catch (e) {
      console.error('searchHSCodes error:', e);
      return [];
    }
  },

  getHSCodeByCode: async (hsCode: string): Promise<CustomsHSCode | null> => {
    try {
      const { data, error } = await supabase
        .from('customs_hs_codes')
        .select('*')
        .eq('hs_code', hsCode)
        .single();

      if (error) throw error;
      return data as CustomsHSCode;
    } catch (e) {
      console.error('getHSCodeByCode error:', e);
      return null;
    }
  },

  // ---- OFFICERS ----
  getOfficers: async (): Promise<CustomsOfficer[]> => {
    try {
      const { data, error } = await supabase
        .from('customs_officers')
        .select('*')
        .order('declarations_reviewed', { ascending: false });

      if (error) throw error;
      return (data || []) as CustomsOfficer[];
    } catch (e) {
      console.error('getOfficers error:', e);
      return [];
    }
  },

  // ---- ANALYTICS ----
  getTradeAnalytics: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    volumeByCountry: { country: string; imports: number; exports: number }[];
    volumeByHS: { hs_code: string; description: string; value: number }[];
    revenueTimeline: { date: string; duty: number; vat: number; total: number }[];
    afcftaStats: { eligible: number; utilized: number; savings: number };
    riskTrends: { date: string; low: number; medium: number; high: number; critical: number }[];
  }> => {
    try {
      const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const { data: declarations } = await supabase
        .from('customs_declarations')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const { data: revenue } = await supabase
        .from('customs_revenue')
        .select('*')
        .gte('payment_date', startDate.toISOString().split('T')[0]);

      const decls = declarations || [];
      const revs = revenue || [];

      // Volume by country
      const countryMap: Record<string, { imports: number; exports: number }> = {};
      decls.forEach((d: any) => {
        const country = d.declaration_type === 'import' ? d.origin_country : d.destination_country;
        if (!countryMap[country]) countryMap[country] = { imports: 0, exports: 0 };
        if (d.declaration_type === 'import') countryMap[country].imports += d.declared_value || 0;
        else countryMap[country].exports += d.declared_value || 0;
      });
      const volumeByCountry = Object.entries(countryMap)
        .map(([country, data]) => ({ country, ...data }))
        .sort((a, b) => (b.imports + b.exports) - (a.imports + a.exports))
        .slice(0, 10);

      // Volume by HS code
      const hsMap: Record<string, { description: string; value: number }> = {};
      decls.forEach((d: any) => {
        const hs = d.hs_code?.substring(0, 4) || 'Unknown';
        if (!hsMap[hs]) hsMap[hs] = { description: d.product_description || '', value: 0 };
        hsMap[hs].value += d.declared_value || 0;
      });
      const volumeByHS = Object.entries(hsMap)
        .map(([hs_code, data]) => ({ hs_code, ...data }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Revenue timeline
      const revMap: Record<string, { duty: number; vat: number; total: number }> = {};
      revs.forEach((r: any) => {
        const date = r.payment_date;
        if (!revMap[date]) revMap[date] = { duty: 0, vat: 0, total: 0 };
        revMap[date].duty += r.duty_collected || 0;
        revMap[date].vat += r.vat_collected || 0;
        revMap[date].total += r.total_collected || 0;
      });
      const revenueTimeline = Object.entries(revMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // AfCFTA stats
      const eligible = decls.filter((d: any) => d.afcfta_eligible).length;
      const utilized = decls.filter((d: any) => d.preferential_rate_applied).length;
      const savings = decls.reduce((sum: number, d: any) => sum + (d.tariff_preference_savings || 0), 0);
      const afcftaStats = { eligible, utilized, savings };

      // Risk trends (simplified)
      const riskTrends = [{ date: 'Today', low: 0, medium: 0, high: 0, critical: 0 }];
      decls.forEach((d: any) => {
        if (d.risk_level) riskTrends[0][d.risk_level as keyof typeof riskTrends[0]]++;
      });

      return { volumeByCountry, volumeByHS, revenueTimeline, afcftaStats, riskTrends };
    } catch (e) {
      console.error('getTradeAnalytics error:', e);
      return {
        volumeByCountry: [], volumeByHS: [], revenueTimeline: [],
        afcftaStats: { eligible: 0, utilized: 0, savings: 0 }, riskTrends: [],
      };
    }
  },

  // ---- BORDER POSTS (from gov_schema) ----
  getBorderPosts: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('gov_border_posts')
        .select('*')
        .order('daily_volume', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('getBorderPosts error:', e);
      return [];
    }
  },

  // ---- REAL-TIME SUBSCRIPTIONS ----
  subscribeToDeclarations: (callback: (payload: any) => void) => {
    return supabase
      .channel('customs_declarations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customs_declarations' }, callback)
      .subscribe();
  },

  subscribeToAlerts: (callback: (payload: any) => void) => {
    return supabase
      .channel('customs_alerts_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'customs_alerts' }, callback)
      .subscribe();
  },
};
