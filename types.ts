
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRADE_LIFECYCLE = 'TRADE_LIFECYCLE', // New Workspace
  MARKET_INTEL = 'MARKET_INTEL', // Search Grounding
  COMPLIANCE = 'COMPLIANCE', // Thinking Mode
  LOGISTICS = 'LOGISTICS', // Maps Grounding
  TRADE_FINANCE = 'TRADE_FINANCE', // New Finance
  MARKETPLACE = 'MARKETPLACE', // New Network
  LIVE_ASSISTANT = 'LIVE_ASSISTANT', // Live API
  MARKETING = 'MARKETING', // Image Gen
  READINESS = 'READINESS', // Fast responses
  PROFILE = 'PROFILE', // New User Settings
  ADMIN = 'ADMIN', // New Platform Admin
  REGULATOR = 'REGULATOR', // New Regulator Oversight
  DIAGNOSTIC = 'DIAGNOSTIC', // New System Health Assessment
}

export interface ChartData {
  name: string;
  value: number;
  secondary?: number;
}

export interface TradeRoute {
  origin: string;
  destination: string;
  commodity: string;
  status: 'active' | 'pending' | 'blocked';
}

export enum UserPersona {
  EXPORTER_SME = 'SME Exporter',
  EXPORTER_ENTERPRISE = 'Enterprise Exporter',
  IMPORTER = 'Importer',
  CUSTOMS = 'Customs Authority',
  LOGISTICS = 'Logistics Provider',
  BANK = 'Bank / Insurer',
  GOVERNMENT = 'Government Agency',
  ANALYST = 'Trade Analyst',
  ADMIN = 'Platform Admin'
}

// --- SUPABASE DATA MODEL MAPPING ---

export interface DbUser {
  id: string;
  role: UserPersona;
  country: string;
  organization_id?: string;
  full_name: string;
  email: string;
}

export interface DbOrganization {
  id: string;
  name: string;
  type: 'buyer' | 'seller' | 'logistics' | 'legal' | 'finance';
  verification_status: boolean;
  location: string;
  rating: number; // 0-5
  reviews_count: number;
  tags: string[];
  description: string;
  logo_initial: string;
}

export interface DbTrade {
  id: string;
  exporter_id: string; // Foreign Key -> users.id or organizations.id
  importer_id?: string; // Foreign Key -> organizations.id
  origin_country: string;
  destination_country: string;
  product: string;
  hs_code: string;
  value: number;
  currency: string;
  status: 'draft' | 'compliance_check' | 'active' | 'completed' | 'paused';
  incoterm?: string;
  created_at: string;
}

export interface DbComplianceCheck {
  id: string;
  trade_id: string; // Foreign Key -> trades.id
  afcfta_status: 'compliant' | 'non_compliant' | 'pending';
  score: number; // 0-100
  explanation: string;
  recommendations: string[];
  created_at: string;
}

export interface DbShipment {
  id: string;
  trade_id: string; // Foreign Key -> trades.id
  logistics_provider_id?: string; // Foreign Key -> organizations.id
  status: 'pending' | 'in_transit' | 'customs_hold' | 'delivered' | 'at_risk';
  origin: string;
  destination: string;
  eta: string;
  carrier: string;
  progress: number; // 0-100
  timeline: {
    location: string;
    date: string;
    status: 'completed' | 'active' | 'pending' | 'delayed';
    description?: string;
  }[];
}

export interface DbFinanceRequest {
  id: string;
  trade_id: string; // Foreign Key -> trades.id
  financier_id: string; // Foreign Key -> organizations.id
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  product_type: string;
  amount: number;
  risk_score?: number; // 0-100
  date_requested: string;
  provider_name?: string; // For UI convenience
}

export interface DbMarketIntelligence {
  id: string;
  product_code: string;
  country: string;
  demand_index: 'High' | 'Medium' | 'Low';
  price_trend: string; // e.g., "+15%"
  sentiment: 'Positive' | 'Neutral' | 'Caution' | 'Improving';
  region: string;
}

export interface DbAuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ip: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export interface DbKYCRequest {
  id: string;
  entity_name: string;
  entity_type: 'Individual' | 'Organization';
  country: string;
  document_type: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submitted_at: string;
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface DbAMLAlert {
  id: string;
  trade_id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  flag_reason: string;
  detected_at: string;
  status: 'Open' | 'Investigating' | 'Resolved';
}
