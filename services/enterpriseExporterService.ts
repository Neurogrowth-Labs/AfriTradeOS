import { supabase } from './supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface ExportProject {
  id: string;
  project_number: string;
  organization_id: string | null;
  title: string;
  description: string | null;
  template_type: string | null;
  status: 'planning' | 'documentation' | 'compliance_review' | 'finance_pending' | 'production' | 'quality_check' | 'ready_to_ship' | 'in_transit' | 'customs_clearance' | 'delivered' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  product: string;
  hs_code: string | null;
  quantity: number | null;
  unit: string;
  value: number | null;
  currency: string;
  origin_country: string;
  destination_country: string;
  origin_port: string | null;
  destination_port: string | null;
  incoterm: string;
  target_ship_date: string | null;
  actual_ship_date: string | null;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  afcfta_eligible: boolean;
  compliance_score: number;
  compliance_status: string;
  required_documents: string[];
  completed_documents: string[];
  finance_status: string;
  finance_type: string | null;
  finance_amount: number | null;
  finance_provider: string | null;
  project_manager_id: string | null;
  team_members: string[];
  ai_risk_score: number;
  ai_recommendations: string[];
  ai_route_optimization: Record<string, unknown> | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  document_type: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  version: number;
  previous_version_id: string | null;
  status: 'draft' | 'pending' | 'verified' | 'rejected' | 'expired';
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  expiry_date: string | null;
  compliance_checked: boolean;
  compliance_issues: string[];
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  detail: string | null;
  activity_type: 'trade' | 'compliance' | 'document' | 'finance' | 'system' | 'ai';
  related_document_id: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_ai_generated: boolean;
  ai_confidence: number | null;
  created_at: string;
}

export interface TradePartner {
  id: string;
  organization_id: string | null;
  company_name: string;
  partner_type: 'supplier' | 'buyer' | 'distributor' | 'freight_forwarder' | 'customs_broker' | 'bank' | 'insurer' | 'agent';
  country: string;
  city: string | null;
  address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  verification_tier: 'basic' | 'verified' | 'trusted' | 'premium';
  kyc_verified: boolean;
  kyc_verified_at: string | null;
  afcfta_registered: boolean;
  international_compliance: boolean;
  rating: number;
  review_count: number;
  compliance_score: number;
  total_trades: number;
  total_trade_value: number;
  successful_trades: number;
  sectors: string[];
  products: string[];
  certifications: string[];
  ai_match_score: number | null;
  ai_recommended_for: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketIntelligence {
  id: string;
  country: string;
  sector: string;
  hs_code: string | null;
  product_category: string | null;
  import_volume: number;
  export_volume: number;
  import_value: number;
  export_value: number;
  demand_index: number;
  supply_index: number;
  price_trend: 'rising' | 'falling' | 'stable';
  price_change_percent: number;
  mfn_tariff_rate: number;
  afcfta_tariff_rate: number;
  non_tariff_barriers: string[];
  regulatory_requirements: string[];
  ai_demand_forecast: Record<string, number> | null;
  ai_price_forecast: Record<string, number> | null;
  ai_opportunity_score: number;
  ai_risk_factors: string[];
  top_exporters: string[];
  top_importers: string[];
  market_share_data: Record<string, unknown> | null;
  period_start: string | null;
  period_end: string | null;
  data_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface FXRate {
  id: string;
  base_currency: string;
  quote_currency: string;
  rate: number;
  change_1d: number;
  change_1w: number;
  change_1m: number;
  volatility_30d: number;
  ai_hedge_recommendation: string | null;
  ai_forecast_1m: number | null;
  ai_forecast_3m: number | null;
  source: string;
  recorded_at: string;
}

export interface TradeFinanceApplication {
  id: string;
  application_number: string;
  organization_id: string;
  project_id: string | null;
  product_type: 'letter_of_credit' | 'bank_guarantee' | 'export_factoring' | 'invoice_discounting' | 'trade_insurance' | 'working_capital';
  amount_requested: number;
  currency: string;
  term_days: number | null;
  status: 'draft' | 'submitted' | 'under_review' | 'additional_docs_required' | 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'defaulted';
  provider_id: string | null;
  provider_name: string | null;
  approved_amount: number | null;
  interest_rate: number | null;
  fees: number | null;
  collateral_required: string[] | null;
  ai_risk_score: number | null;
  ai_fraud_flags: string[];
  compliance_score: number | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  disbursed_at: string | null;
  due_date: string | null;
  required_documents: string[];
  submitted_documents: string[];
  created_at: string;
  updated_at: string;
}

export interface ShipmentTracking {
  id: string;
  project_id: string | null;
  tracking_number: string;
  carrier_name: string | null;
  transport_mode: 'sea' | 'air' | 'road' | 'rail' | 'multimodal' | null;
  container_number: string | null;
  container_type: string | null;
  cargo_weight: number | null;
  cargo_volume: number | null;
  origin_port: string | null;
  destination_port: string | null;
  current_location: string | null;
  current_country: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'booked' | 'picked_up' | 'at_origin_port' | 'departed' | 'in_transit' | 'at_destination_port' | 'customs_hold' | 'cleared' | 'out_for_delivery' | 'delivered';
  status_detail: string | null;
  booking_date: string | null;
  pickup_date: string | null;
  departure_date: string | null;
  eta: string | null;
  ata: string | null;
  risk_level: string;
  risk_factors: string[];
  delay_probability: number;
  temperature: number | null;
  humidity: number | null;
  last_sensor_update: string | null;
  sensor_alerts: string[];
  timeline: Array<{ date: string; event: string; location: string }>;
  ai_route_score: number | null;
  ai_alternative_routes: string[] | null;
  ai_carbon_footprint: number | null;
  created_at: string;
  updated_at: string;
}

export interface TradeTender {
  id: string;
  tender_number: string;
  title: string;
  description: string | null;
  issuer_name: string;
  issuer_country: string;
  issuer_type: string | null;
  product_category: string | null;
  hs_codes: string[];
  quantity: number | null;
  unit: string | null;
  specifications: Record<string, unknown> | null;
  estimated_value: number | null;
  currency: string;
  published_date: string | null;
  deadline: string | null;
  delivery_date: string | null;
  status: 'open' | 'closing_soon' | 'closed' | 'awarded' | 'cancelled';
  eligibility_criteria: string[];
  required_documents: string[];
  required_certifications: string[];
  ai_match_score: number | null;
  ai_win_probability: number | null;
  ai_pricing_suggestion: Record<string, unknown> | null;
  ai_compliance_check: Record<string, unknown> | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeContract {
  id: string;
  contract_number: string;
  organization_id: string;
  title: string;
  contract_type: string | null;
  template_id: string | null;
  counterparty_id: string | null;
  counterparty_name: string;
  counterparty_country: string | null;
  value: number | null;
  currency: string;
  payment_terms: string | null;
  delivery_terms: string | null;
  incoterm: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  status: 'draft' | 'pending_signature' | 'active' | 'expiring_soon' | 'expired' | 'terminated' | 'breached' | 'completed';
  our_signature_date: string | null;
  counterparty_signature_date: string | null;
  digital_signature_hash: string | null;
  performance_score: number;
  milestones_completed: number;
  milestones_total: number;
  ai_risk_flags: string[];
  ai_renewal_recommendation: string | null;
  ai_performance_insights: Record<string, unknown> | null;
  contract_document_url: string | null;
  amendments: string[];
  created_at: string;
  updated_at: string;
}

export interface ExporterDashboardKPIs {
  totalExports: number;
  totalExportValue: number;
  activeProjects: number;
  completedProjects: number;
  exportsByCountry: Record<string, number>;
  exportsBySector: Record<string, number>;
  pendingPayments: number;
  receivedPayments: number;
  outstandingCredit: number;
  complianceScore: number;
  pendingComplianceChecks: number;
  afcftaSavings: number;
  shipmentsInTransit: number;
  onTimeDeliveryRate: number;
  avgTransitDays: number;
  aiMarketOpportunities: Array<{ market: string; product: string; opportunity_score: number }>;
  aiRiskAlerts: Array<{ type: string; message: string; severity: string }>;
  aiRecommendations: string[];
}

// =============================================================================
// ENTERPRISE EXPORTER SERVICE
// =============================================================================

export const enterpriseExporterService = {

  // ---- DASHBOARD KPIs ----
  getDashboardKPIs: async (): Promise<ExporterDashboardKPIs> => {
    try {
      const [projectsRes, shipmentsRes, kpisRes] = await Promise.all([
        supabase.from('export_projects').select('*'),
        supabase.from('shipment_tracking').select('*'),
        supabase.from('exporter_dashboard_kpis').select('*').order('period_date', { ascending: false }).limit(1),
      ]);

      const projects = projectsRes.data || [];
      const shipments = shipmentsRes.data || [];
      const latestKpis = kpisRes.data?.[0];

      // Calculate from projects
      const activeProjects = projects.filter((p: ExportProject) => 
        !['completed', 'cancelled', 'delivered'].includes(p.status)
      ).length;
      const completedProjects = projects.filter((p: ExportProject) => 
        ['completed', 'delivered'].includes(p.status)
      ).length;
      const totalExportValue = projects.reduce((sum: number, p: ExportProject) => sum + (p.value || 0), 0);

      // Exports by country
      const exportsByCountry: Record<string, number> = {};
      projects.forEach((p: ExportProject) => {
        exportsByCountry[p.destination_country] = (exportsByCountry[p.destination_country] || 0) + (p.value || 0);
      });

      // Shipments in transit
      const shipmentsInTransit = shipments.filter((s: ShipmentTracking) => 
        ['in_transit', 'at_origin_port', 'departed'].includes(s.status)
      ).length;

      // Compliance score average
      const complianceScore = projects.length > 0 
        ? projects.reduce((sum: number, p: ExportProject) => sum + (p.compliance_score || 0), 0) / projects.length 
        : 0;

      return {
        totalExports: projects.length,
        totalExportValue,
        activeProjects,
        completedProjects,
        exportsByCountry,
        exportsBySector: latestKpis?.exports_by_sector || {},
        pendingPayments: latestKpis?.pending_payments || 0,
        receivedPayments: latestKpis?.received_payments || 0,
        outstandingCredit: latestKpis?.outstanding_credit || 0,
        complianceScore: Math.round(complianceScore),
        pendingComplianceChecks: latestKpis?.pending_compliance_checks || 0,
        afcftaSavings: latestKpis?.afcfta_savings || 0,
        shipmentsInTransit,
        onTimeDeliveryRate: latestKpis?.on_time_delivery_rate || 0,
        avgTransitDays: latestKpis?.avg_transit_days || 0,
        aiMarketOpportunities: latestKpis?.ai_market_opportunities || [],
        aiRiskAlerts: latestKpis?.ai_risk_alerts || [],
        aiRecommendations: latestKpis?.ai_recommendations || [],
      };
    } catch (e) {
      console.error('getDashboardKPIs error:', e);
      return {
        totalExports: 0, totalExportValue: 0, activeProjects: 0, completedProjects: 0,
        exportsByCountry: {}, exportsBySector: {}, pendingPayments: 0, receivedPayments: 0,
        outstandingCredit: 0, complianceScore: 0, pendingComplianceChecks: 0, afcftaSavings: 0,
        shipmentsInTransit: 0, onTimeDeliveryRate: 0, avgTransitDays: 0,
        aiMarketOpportunities: [], aiRiskAlerts: [], aiRecommendations: [],
      };
    }
  },

  // ---- EXPORT PROJECTS ----
  getProjects: async (filters?: { status?: string; priority?: string; search?: string }): Promise<ExportProject[]> => {
    try {
      let query = supabase.from('export_projects').select('*').order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,product.ilike.%${filters.search}%,project_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as ExportProject[];
    } catch (e) {
      console.error('getProjects error:', e);
      return [];
    }
  },

  getProjectById: async (id: string): Promise<ExportProject | null> => {
    try {
      const { data, error } = await supabase.from('export_projects').select('*').eq('id', id).single();
      if (error) throw error;
      return data as ExportProject;
    } catch (e) {
      console.error('getProjectById error:', e);
      return null;
    }
  },

  createProject: async (project: Partial<ExportProject>): Promise<ExportProject | null> => {
    try {
      const projectNumber = `EXP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const { data, error } = await supabase.from('export_projects').insert({
        ...project,
        project_number: projectNumber,
      }).select().single();
      if (error) throw error;
      return data as ExportProject;
    } catch (e) {
      console.error('createProject error:', e);
      return null;
    }
  },

  updateProject: async (id: string, updates: Partial<ExportProject>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('export_projects').update({
        ...updates,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('updateProject error:', e);
      return false;
    }
  },

  updateProjectStatus: async (id: string, status: ExportProject['status']): Promise<boolean> => {
    try {
      const { error } = await supabase.from('export_projects').update({
        status,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;

      // Log activity
      await supabase.from('project_activities').insert({
        project_id: id,
        action: 'status_change',
        detail: `Status changed to ${status}`,
        activity_type: 'system',
      });

      return true;
    } catch (e) {
      console.error('updateProjectStatus error:', e);
      return false;
    }
  },

  // ---- PROJECT DOCUMENTS ----
  getProjectDocuments: async (projectId: string): Promise<ProjectDocument[]> => {
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ProjectDocument[];
    } catch (e) {
      console.error('getProjectDocuments error:', e);
      return [];
    }
  },

  uploadDocument: async (projectId: string, document: Partial<ProjectDocument>): Promise<ProjectDocument | null> => {
    try {
      const { data, error } = await supabase.from('project_documents').insert({
        ...document,
        project_id: projectId,
      }).select().single();
      if (error) throw error;

      // Log activity
      await supabase.from('project_activities').insert({
        project_id: projectId,
        action: 'document_uploaded',
        detail: `Document "${document.name}" uploaded`,
        activity_type: 'document',
        related_document_id: data.id,
      });

      return data as ProjectDocument;
    } catch (e) {
      console.error('uploadDocument error:', e);
      return null;
    }
  },

  // ---- PROJECT ACTIVITIES ----
  getProjectActivities: async (projectId: string): Promise<ProjectActivity[]> => {
    try {
      const { data, error } = await supabase
        .from('project_activities')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as ProjectActivity[];
    } catch (e) {
      console.error('getProjectActivities error:', e);
      return [];
    }
  },

  // ---- TRADE PARTNERS ----
  getPartners: async (filters?: { type?: string; country?: string; verified?: boolean; search?: string }): Promise<TradePartner[]> => {
    try {
      let query = supabase.from('trade_partners').select('*').eq('is_active', true).order('rating', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('partner_type', filters.type);
      }
      if (filters?.country && filters.country !== 'all') {
        query = query.eq('country', filters.country);
      }
      if (filters?.verified) {
        query = query.eq('kyc_verified', true);
      }
      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as TradePartner[];
    } catch (e) {
      console.error('getPartners error:', e);
      return [];
    }
  },

  getPartnerById: async (id: string): Promise<TradePartner | null> => {
    try {
      const { data, error } = await supabase.from('trade_partners').select('*').eq('id', id).single();
      if (error) throw error;
      return data as TradePartner;
    } catch (e) {
      console.error('getPartnerById error:', e);
      return null;
    }
  },

  // ---- MARKET INTELLIGENCE ----
  getMarketIntelligence: async (filters?: { country?: string; sector?: string }): Promise<MarketIntelligence[]> => {
    try {
      let query = supabase.from('market_intelligence').select('*').order('ai_opportunity_score', { ascending: false });

      if (filters?.country && filters.country !== 'all') {
        query = query.eq('country', filters.country);
      }
      if (filters?.sector && filters.sector !== 'all') {
        query = query.eq('sector', filters.sector);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []) as MarketIntelligence[];
    } catch (e) {
      console.error('getMarketIntelligence error:', e);
      return [];
    }
  },

  // ---- FX RATES ----
  getFXRates: async (baseCurrency?: string): Promise<FXRate[]> => {
    try {
      let query = supabase.from('fx_rates').select('*').order('recorded_at', { ascending: false });

      if (baseCurrency) {
        query = query.eq('base_currency', baseCurrency);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return (data || []) as FXRate[];
    } catch (e) {
      console.error('getFXRates error:', e);
      return [];
    }
  },

  // ---- TRADE FINANCE ----
  getFinanceApplications: async (filters?: { status?: string; type?: string }): Promise<TradeFinanceApplication[]> => {
    try {
      let query = supabase.from('trade_finance_applications').select('*').order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('product_type', filters.type);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []) as TradeFinanceApplication[];
    } catch (e) {
      console.error('getFinanceApplications error:', e);
      return [];
    }
  },

  createFinanceApplication: async (application: Partial<TradeFinanceApplication>): Promise<TradeFinanceApplication | null> => {
    try {
      const appNumber = `TFA-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const { data, error } = await supabase.from('trade_finance_applications').insert({
        ...application,
        application_number: appNumber,
      }).select().single();
      if (error) throw error;
      return data as TradeFinanceApplication;
    } catch (e) {
      console.error('createFinanceApplication error:', e);
      return null;
    }
  },

  // ---- SHIPMENT TRACKING ----
  getShipments: async (filters?: { status?: string; mode?: string }): Promise<ShipmentTracking[]> => {
    try {
      let query = supabase.from('shipment_tracking').select('*').order('eta', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.mode && filters.mode !== 'all') {
        query = query.eq('transport_mode', filters.mode);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []) as ShipmentTracking[];
    } catch (e) {
      console.error('getShipments error:', e);
      return [];
    }
  },

  getShipmentByTracking: async (trackingNumber: string): Promise<ShipmentTracking | null> => {
    try {
      const { data, error } = await supabase.from('shipment_tracking').select('*').eq('tracking_number', trackingNumber).single();
      if (error) throw error;
      return data as ShipmentTracking;
    } catch (e) {
      console.error('getShipmentByTracking error:', e);
      return null;
    }
  },

  // ---- TENDERS ----
  getTenders: async (filters?: { status?: string; country?: string; category?: string; search?: string }): Promise<TradeTender[]> => {
    try {
      let query = supabase.from('trade_tenders').select('*').order('deadline', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.country && filters.country !== 'all') {
        query = query.eq('issuer_country', filters.country);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('product_category', filters.category);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []) as TradeTender[];
    } catch (e) {
      console.error('getTenders error:', e);
      return [];
    }
  },

  getTenderById: async (id: string): Promise<TradeTender | null> => {
    try {
      const { data, error } = await supabase.from('trade_tenders').select('*').eq('id', id).single();
      if (error) throw error;
      return data as TradeTender;
    } catch (e) {
      console.error('getTenderById error:', e);
      return null;
    }
  },

  // ---- CONTRACTS ----
  getContracts: async (filters?: { status?: string; type?: string; search?: string }): Promise<TradeContract[]> => {
    try {
      let query = supabase.from('trade_contracts').select('*').order('expiry_date', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('contract_type', filters.type);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,counterparty_name.ilike.%${filters.search}%,contract_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []) as TradeContract[];
    } catch (e) {
      console.error('getContracts error:', e);
      return [];
    }
  },

  getContractById: async (id: string): Promise<TradeContract | null> => {
    try {
      const { data, error } = await supabase.from('trade_contracts').select('*').eq('id', id).single();
      if (error) throw error;
      return data as TradeContract;
    } catch (e) {
      console.error('getContractById error:', e);
      return null;
    }
  },

  // ---- REAL-TIME SUBSCRIPTIONS ----
  subscribeToProjects: (callback: (payload: { new: ExportProject; old: ExportProject | null; eventType: string }) => void) => {
    return supabase
      .channel('export_projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'export_projects' }, (payload) => {
        callback({
          new: payload.new as ExportProject,
          old: payload.old as ExportProject | null,
          eventType: payload.eventType,
        });
      })
      .subscribe();
  },

  subscribeToShipments: (callback: (payload: { new: ShipmentTracking; old: ShipmentTracking | null; eventType: string }) => void) => {
    return supabase
      .channel('shipment_tracking_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipment_tracking' }, (payload) => {
        callback({
          new: payload.new as ShipmentTracking,
          old: payload.old as ShipmentTracking | null,
          eventType: payload.eventType,
        });
      })
      .subscribe();
  },

  unsubscribe: (channel: ReturnType<typeof supabase.channel>) => {
    supabase.removeChannel(channel);
  },
};
