import { 
  DbUser, 
  DbOrganization, 
  DbTrade, 
  DbComplianceCheck, 
  DbShipment, 
  DbFinanceRequest, 
  DbMarketIntelligence,
  DbAuditLog,
  DbKYCRequest,
  DbAMLAlert,
  UserPersona 
} from '../types';

// --- MOCK DATA ---

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
    id: 'org_3',
    name: 'SwiftTrans Logistics',
    type: 'logistics',
    location: 'Lagos, Nigeria',
    verification_status: false,
    rating: 4.2,
    reviews_count: 45,
    tags: ['Road Freight', 'Warehousing', 'Last Mile'],
    description: 'Cross-border trucking specialist covering the Lagos-Abidjan corridor.',
    logo_initial: 'S'
  },
  {
    id: 'org_4',
    name: 'AfriLaw Partners',
    type: 'legal',
    location: 'Johannesburg, SA',
    verification_status: true,
    rating: 5.0,
    reviews_count: 210,
    tags: ['Trade Law', 'Contracts', 'Dispute Resolution'],
    description: 'Specialized legal firm for AfCFTA compliance and cross-border trade agreements.',
    logo_initial: 'A'
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
  },
  {
    id: 'org_bank_2',
    name: 'Afreximbank',
    type: 'finance',
    location: 'Cairo, Egypt',
    verification_status: true,
    rating: 5.0,
    reviews_count: 320,
    tags: ['Export Factoring', 'Trade Guarantees'],
    description: 'African Export-Import Bank.',
    logo_initial: 'A'
  }
];

const MOCK_TRADES: DbTrade[] = [
  {
    id: 'TRD-882',
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
  },
  { 
    id: 'FIN-2024-003', 
    trade_id: 'TRD-901', 
    financier_id: 'org_bank_2', 
    status: 'under_review', 
    product_type: 'Export Factoring', 
    amount: 120000, 
    risk_score: 45, 
    date_requested: '2024-11-02',
    provider_name: 'Afreximbank'
  }
];

const MOCK_MARKET_INTELLIGENCE: DbMarketIntelligence[] = [
  { id: 'mi_1', product_code: 'SHEA', country: 'Nigeria', demand_index: 'High', price_trend: '+15%', sentiment: 'Positive', region: 'West Africa' },
  { id: 'mi_2', product_code: 'AVO', country: 'Kenya', demand_index: 'Medium', price_trend: '+5%', sentiment: 'Neutral', region: 'East Africa' },
  { id: 'mi_3', product_code: 'COCOA', country: 'Ghana', demand_index: 'High', price_trend: '+12%', sentiment: 'Positive', region: 'West Africa' },
];

const MOCK_AUDIT_LOGS: DbAuditLog[] = [
  { id: 'log_1', action: 'Login Success', user: 'Kofi Mensah', timestamp: '2024-11-04 09:15:22', ip: '102.12.33.1', status: 'Success' },
  { id: 'log_2', action: 'Trade Created #TRD-882', user: 'Kofi Mensah', timestamp: '2024-11-04 10:30:00', ip: '102.12.33.1', status: 'Success' },
  { id: 'log_3', action: 'Password Change Attempt', user: 'Kofi Mensah', timestamp: '2024-11-03 14:22:10', ip: '102.12.33.1', status: 'Failed' },
  { id: 'log_4', action: 'API Key Generated', user: 'Admin', timestamp: '2024-11-01 16:45:00', ip: '197.23.11.5', status: 'Warning' },
  { id: 'log_5', action: 'User Profile Updated', user: 'Sarah Osei', timestamp: '2024-11-05 08:00:00', ip: '154.11.22.9', status: 'Success' },
  { id: 'log_6', action: 'AML Alert Review', user: 'System Admin', timestamp: '2024-11-05 09:10:00', ip: '197.0.0.1', status: 'Success' },
];

const MOCK_KYC_REQUESTS: DbKYCRequest[] = [
  { id: 'KYC-001', entity_name: 'Kwame Trading Ent.', entity_type: 'Organization', country: 'Ghana', document_type: 'Cert. of Incorporation', status: 'Pending', submitted_at: '2024-11-05', risk_level: 'Low' },
  { id: 'KYC-002', entity_name: 'John Doe Logistics', entity_type: 'Individual', country: 'Nigeria', document_type: 'National ID', status: 'Pending', submitted_at: '2024-11-04', risk_level: 'Medium' },
  { id: 'KYC-003', entity_name: 'Sankofa Imports', entity_type: 'Organization', country: 'Ghana', document_type: 'Business License', status: 'Approved', submitted_at: '2024-11-01', risk_level: 'Low' },
];

const MOCK_AML_ALERTS: DbAMLAlert[] = [
  { id: 'AML-992', trade_id: 'TRD-882', severity: 'High', flag_reason: 'Unusual Volume Spike', detected_at: '2024-11-05 10:00', status: 'Open' },
  { id: 'AML-993', trade_id: 'TRD-771', severity: 'Critical', flag_reason: 'Sanctioned Entity Match', detected_at: '2024-11-04 14:30', status: 'Investigating' },
  { id: 'AML-994', trade_id: 'TRD-665', severity: 'Medium', flag_reason: 'Mismatched HS Code Value', detected_at: '2024-11-03 09:15', status: 'Resolved' },
];

// --- MOCK DATABASE CLIENT ---

export const mockDatabase = {
  // Organizations
  getOrganizations: async (typeFilter?: string): Promise<DbOrganization[]> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    if (typeFilter && typeFilter !== 'all') {
      return MOCK_ORGANIZATIONS.filter(org => org.type === typeFilter);
    }
    return MOCK_ORGANIZATIONS;
  },

  // Trades
  getTrades: async (userId: string): Promise<DbTrade[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_TRADES.filter(t => t.exporter_id === userId);
  },

  // Finance Requests
  getFinanceRequests: async (userId: string): Promise<DbFinanceRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // In a real DB, we'd join with trades to filter by user. 
    // Here we assume these requests belong to the current user context.
    return MOCK_FINANCE_REQUESTS;
  },

  // Market Intel
  getMarketIntelligence: async (): Promise<DbMarketIntelligence[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_MARKET_INTELLIGENCE;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<DbAuditLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_AUDIT_LOGS;
  },

  // KYC
  getKYCRequests: async (): Promise<DbKYCRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_KYC_REQUESTS;
  },

  // AML
  getAMLAlerts: async (): Promise<DbAMLAlert[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_AML_ALERTS;
  }
};