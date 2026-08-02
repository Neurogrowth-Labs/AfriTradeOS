import { supabase } from './supabase';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Sanitizes user input for use in PostgreSQL ILIKE patterns.
 * Escapes special characters: %, _, \, and characters that could break .or() syntax
 */
function sanitizeSearchInput(input: string): string {
  return input
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/%/g, '\\%') // Escape % wildcard
    .replace(/_/g, '\\_') // Escape _ wildcard
    .replace(/,/g, '') // Remove commas (breaks .or() syntax)
    .replace(/\(/g, '') // Remove parentheses
    .replace(/\)/g, '')
    .trim()
    .slice(0, 100); // Limit length to prevent DoS
}

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type JourneyStatus =
  | 'RECEIVED'
  | 'IN_TRANSIT'
  | 'AT_PORT'
  | 'CUSTOMS_CLEARANCE'
  | 'DELIVERED'
  | 'EXCEPTION';

export type TransportMode = 'SEA' | 'AIR' | 'LAND' | 'MULTI_MODAL';

export type Incoterm = 'CIF' | 'FOB' | 'DAP' | 'DDP' | 'EXW' | 'FCA' | 'CPT' | 'CIP';

export type ComplianceStatus = 'COMPLIANT' | 'PENDING' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';

export type CustomsDeclarationStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CLEARED'
  | 'HELD'
  | 'REJECTED';

export interface ImportOrder {
  id: string;
  orderNo: string;
  supplier: string;
  supplierId?: string;
  sourceCountry: string;
  destinationCountry: string;
  incoterm: Incoterm;
  poDate: string;
  shipmentDate?: string;
  transportMode: TransportMode;
  journeyStatus: JourneyStatus;
  totalValue: number;
  currency: string;
  eta?: string;
  atd?: string;
  customsDeclarationStatus: CustomsDeclarationStatus;
  complianceStatus: ComplianceStatus;
  assignedLogisticsPartner?: string;
  hsCode?: string;
  productDescription?: string;
  quantity?: number;
  weight?: number;
  volume?: number;
  containerNumbers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentMilestone {
  stage: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'DELAYED';
  timestamp?: string;
  location?: string;
  notes?: string;
}

export interface ImportShipmentTracking {
  orderId: string;
  orderNo: string;
  currentStatus: JourneyStatus;
  milestones: ShipmentMilestone[];
  currentLocation?: string;
  nextMilestone?: string;
  estimatedDelay?: number; // in hours
  carrier?: string;
  vesselName?: string;
  flightNumber?: string;
  trackingNumber?: string;
}

export interface DocumentRecord {
  id: string;
  orderId: string;
  documentType: string;
  fileName: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'UPLOADED' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  version: number;
  uploadedBy?: string;
  url?: string;
  requiresSignature?: boolean;
  signedBy?: string[];
}

export interface CustomsRequirement {
  hsCode: string;
  description: string;
  dutyRate: number;
  taxRate: number;
  restrictionLevel: 'NONE' | 'RESTRICTED' | 'PROHIBITED';
  requiredDocuments: string[];
  quotaApplicable?: boolean;
  quotaUsed?: number;
  quotaLimit?: number;
}

export interface CostBreakdown {
  orderId: string;
  purchaseValue: number;
  dutiesAndTaxes: number;
  portCharges: number;
  inlandTransport: number;
  insurance: number;
  otherFees: number;
  totalLandedCost: number;
  currency: string;
  costVariance?: number; // % difference from estimated
}

export interface SupplierProfile {
  id: string;
  name: string;
  country: string;
  rating: number;
  totalOrders: number;
  onTimeDeliveryRate: number;
  qualityScore: number;
  communicationScore: number;
  certifications: string[];
  paymentTerms: string[];
  minimumOrderValue?: number;
  leadTime?: number; // in days
  productCategories: string[];
}

export interface ImporterKPIs {
  activeOrders: number;
  ordersInTransit: number;
  ordersPendingClearance: number;
  ordersDelivered: number;
  totalImportSpend: number;
  dutySavings: number; // e.g., from AfCFTA
  averageLeadTime: number;
  customsClearanceTime: number;
  complianceScore: number;
  onTimeDeliveryRate: number;
  supplierPerformance: number;
}

export interface ComplianceAlert {
  id: string;
  orderId: string;
  type:
    | 'MISSING_DOCUMENT'
    | 'EXPIRED_LICENSE'
    | 'QUOTA_EXCEEDED'
    | 'RESTRICTED_GOODS'
    | 'TARIFF_CHANGE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  createdAt: string;
  resolvedAt?: string;
  actionRequired?: string;
}

export interface SupplierPerformanceMetric {
  supplierId: string;
  supplierName: string;
  country: string;
  totalOrders: number;
  onTimeDeliveryRate: number;
  averageLeadTime: number;
  qualityIssues: number;
  totalValue: number;
  lastOrderDate: string;
  rating: number;
}

export interface CarrierPerformanceMetric {
  carrierId: string;
  carrierName: string;
  transportMode: TransportMode;
  totalShipments: number;
  onTimeRate: number;
  averageDelay: number; // in hours
  damageRate: number;
  lostShipments: number;
  totalCost: number;
}

export interface CustomsClearanceMetric {
  month: string;
  totalDeclarations: number;
  averageClearanceTime: number; // in hours
  holdRate: number; // %
  rejectionRate: number; // %
  dutiesPaid: number;
  complianceScore: number;
}

export interface WorkflowNotification {
  id: string;
  orderId?: string;
  type:
    | 'DOCUMENT_MISSING'
    | 'CUSTOMS_HOLD'
    | 'SHIPMENT_DELAY'
    | 'LICENSE_EXPIRY'
    | 'PAYMENT_DUE'
    | 'DELIVERY_UPDATE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
  read: boolean;
}

export interface HSCodeLookup {
  code: string;
  description: string;
  dutyRate: number;
  taxRate: number;
  chapter: string;
  chapterDescription: string;
}

export interface TradeAgreementRule {
  agreementName: string;
  countries: string[];
  hsCode: string;
  preferentialDutyRate: number;
  standardDutyRate: number;
  requiredOriginPercentage: number;
  requiredDocuments: string[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const _MOCK_IMPORT_ORDERS: ImportOrder[] = [
  {
    id: 'IMP-001',
    orderNo: 'PO-2026-0234',
    supplier: 'Shanghai Electronics Co.',
    supplierId: 'SUP-CN-001',
    sourceCountry: 'China',
    destinationCountry: 'Kenya',
    incoterm: 'CIF',
    poDate: '2026-01-15',
    shipmentDate: '2026-01-22',
    transportMode: 'SEA',
    journeyStatus: 'IN_TRANSIT',
    totalValue: 125000,
    currency: 'USD',
    eta: '2026-02-28',
    atd: '2026-01-22',
    customsDeclarationStatus: 'DRAFT',
    complianceStatus: 'COMPLIANT',
    assignedLogisticsPartner: 'Maersk Line',
    hsCode: '8517.12.00',
    productDescription: 'Smartphones and accessories',
    quantity: 500,
    weight: 2500,
    volume: 45,
    containerNumbers: ['MSCU3456789'],
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-02-18T14:20:00Z',
  },
  {
    id: 'IMP-002',
    orderNo: 'PO-2026-0198',
    supplier: 'Mumbai Textiles Ltd.',
    supplierId: 'SUP-IN-012',
    sourceCountry: 'India',
    destinationCountry: 'Kenya',
    incoterm: 'FOB',
    poDate: '2026-02-01',
    shipmentDate: '2026-02-10',
    transportMode: 'SEA',
    journeyStatus: 'AT_PORT',
    totalValue: 68500,
    currency: 'USD',
    eta: '2026-02-25',
    atd: '2026-02-10',
    customsDeclarationStatus: 'SUBMITTED',
    complianceStatus: 'PENDING',
    assignedLogisticsPartner: 'CMA CGM',
    hsCode: '6204.42.00',
    productDescription: 'Cotton dresses',
    quantity: 2000,
    weight: 1800,
    volume: 38,
    containerNumbers: ['CMAU8765432'],
    createdAt: '2026-02-01T10:15:00Z',
    updatedAt: '2026-02-19T09:45:00Z',
  },
  {
    id: 'IMP-003',
    orderNo: 'PO-2026-0256',
    supplier: 'Berlin Machinery GmbH',
    supplierId: 'SUP-DE-005',
    sourceCountry: 'Germany',
    destinationCountry: 'Kenya',
    incoterm: 'DAP',
    poDate: '2026-02-12',
    transportMode: 'AIR',
    journeyStatus: 'CUSTOMS_CLEARANCE',
    totalValue: 320000,
    currency: 'EUR',
    eta: '2026-02-20',
    atd: '2026-02-15',
    customsDeclarationStatus: 'UNDER_REVIEW',
    complianceStatus: 'NEEDS_REVIEW',
    assignedLogisticsPartner: 'DHL Global Forwarding',
    hsCode: '8479.89.90',
    productDescription: 'Industrial packaging machinery',
    quantity: 3,
    weight: 5400,
    createdAt: '2026-02-12T11:00:00Z',
    updatedAt: '2026-02-19T16:30:00Z',
  },
  {
    id: 'IMP-004',
    orderNo: 'PO-2026-0102',
    supplier: 'Cape Town Wines',
    supplierId: 'SUP-ZA-008',
    sourceCountry: 'South Africa',
    destinationCountry: 'Kenya',
    incoterm: 'CIF',
    poDate: '2025-12-20',
    shipmentDate: '2026-01-05',
    transportMode: 'SEA',
    journeyStatus: 'DELIVERED',
    totalValue: 42000,
    currency: 'USD',
    eta: '2026-01-28',
    atd: '2026-01-05',
    customsDeclarationStatus: 'CLEARED',
    complianceStatus: 'COMPLIANT',
    assignedLogisticsPartner: 'MSC',
    hsCode: '2204.21.00',
    productDescription: 'Premium red wine',
    quantity: 1200,
    weight: 1800,
    volume: 12,
    containerNumbers: ['MSCU1122334'],
    createdAt: '2025-12-20T09:00:00Z',
    updatedAt: '2026-01-30T10:00:00Z',
  },
  {
    id: 'IMP-005',
    orderNo: 'PO-2026-0289',
    supplier: 'Dubai Pharmaceuticals',
    supplierId: 'SUP-AE-003',
    sourceCountry: 'UAE',
    destinationCountry: 'Kenya',
    incoterm: 'DDP',
    poDate: '2026-02-18',
    transportMode: 'AIR',
    journeyStatus: 'RECEIVED',
    totalValue: 185000,
    currency: 'USD',
    customsDeclarationStatus: 'NOT_STARTED',
    complianceStatus: 'COMPLIANT',
    hsCode: '3004.90.00',
    productDescription: 'Generic medicines',
    quantity: 5000,
    weight: 850,
    createdAt: '2026-02-18T14:30:00Z',
    updatedAt: '2026-02-19T08:15:00Z',
  },
];

const _MOCK_SUPPLIERS: SupplierProfile[] = [
  {
    id: 'SUP-CN-001',
    name: 'Shanghai Electronics Co.',
    country: 'China',
    rating: 4.7,
    totalOrders: 24,
    onTimeDeliveryRate: 92,
    qualityScore: 4.6,
    communicationScore: 4.5,
    certifications: ['ISO 9001', 'CE', 'RoHS'],
    paymentTerms: ['LC at sight', 'T/T 30 days'],
    minimumOrderValue: 50000,
    leadTime: 35,
    productCategories: ['Electronics', 'Mobile devices', 'Accessories'],
  },
  {
    id: 'SUP-IN-012',
    name: 'Mumbai Textiles Ltd.',
    country: 'India',
    rating: 4.4,
    totalOrders: 18,
    onTimeDeliveryRate: 88,
    qualityScore: 4.3,
    communicationScore: 4.6,
    certifications: ['GOTS', 'OEKO-TEX', 'ISO 14001'],
    paymentTerms: ['LC 90 days', 'T/T 60 days'],
    minimumOrderValue: 25000,
    leadTime: 28,
    productCategories: ['Textiles', 'Apparel', 'Fabrics'],
  },
  {
    id: 'SUP-DE-005',
    name: 'Berlin Machinery GmbH',
    country: 'Germany',
    rating: 4.9,
    totalOrders: 8,
    onTimeDeliveryRate: 100,
    qualityScore: 4.9,
    communicationScore: 4.8,
    certifications: ['ISO 9001', 'CE', 'TÜV'],
    paymentTerms: ['LC at sight', 'Bank guarantee'],
    minimumOrderValue: 100000,
    leadTime: 45,
    productCategories: ['Industrial machinery', 'Equipment'],
  },
  {
    id: 'SUP-ZA-008',
    name: 'Cape Town Wines',
    country: 'South Africa',
    rating: 4.6,
    totalOrders: 12,
    onTimeDeliveryRate: 90,
    qualityScore: 4.7,
    communicationScore: 4.4,
    certifications: ['WIETA', 'Fairtrade', 'Organic'],
    paymentTerms: ['T/T 30 days', 'LC 60 days'],
    minimumOrderValue: 15000,
    leadTime: 21,
    productCategories: ['Wine', 'Beverages'],
  },
  {
    id: 'SUP-AE-003',
    name: 'Dubai Pharmaceuticals',
    country: 'UAE',
    rating: 4.8,
    totalOrders: 15,
    onTimeDeliveryRate: 96,
    qualityScore: 4.9,
    communicationScore: 4.7,
    certifications: ['GMP', 'WHO-PQ', 'ISO 13485'],
    paymentTerms: ['LC at sight', 'T/T advance'],
    minimumOrderValue: 75000,
    leadTime: 14,
    productCategories: ['Pharmaceuticals', 'Medical supplies'],
  },
];

const _MOCK_NOTIFICATIONS: WorkflowNotification[] = [
  {
    id: 'NOT-001',
    orderId: 'IMP-003',
    type: 'CUSTOMS_HOLD',
    priority: 'HIGH',
    title: 'Customs Hold Alert',
    message: 'PO-2026-0256: Additional documentation required for machinery import clearance',
    actionUrl: '/importer?tab=compliance',
    createdAt: '2026-02-19T16:30:00Z',
    read: false,
  },
  {
    id: 'NOT-002',
    orderId: 'IMP-001',
    type: 'SHIPMENT_DELAY',
    priority: 'MEDIUM',
    title: 'Shipment Delay',
    message: 'PO-2026-0234: ETA delayed by 3 days due to port congestion',
    actionUrl: '/importer?tab=shipments',
    createdAt: '2026-02-18T11:20:00Z',
    read: false,
  },
  {
    id: 'NOT-003',
    type: 'LICENSE_EXPIRY',
    priority: 'HIGH',
    title: 'Import License Expiring',
    message: 'Your pharmaceutical import license expires in 15 days',
    actionUrl: '/importer?tab=compliance',
    createdAt: '2026-02-17T09:00:00Z',
    read: true,
  },
  {
    id: 'NOT-004',
    orderId: 'IMP-005',
    type: 'DOCUMENT_MISSING',
    priority: 'MEDIUM',
    title: 'Missing Documents',
    message: 'PO-2026-0289: Certificate of Origin required for customs clearance',
    actionUrl: '/importer?tab=documents',
    createdAt: '2026-02-19T08:15:00Z',
    read: false,
  },
];

// ============================================================================
// SERVICE METHODS
// ============================================================================

export async function getDashboardKPIs(): Promise<ImporterKPIs> {
  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase.from('importer_kpis').select('*').limit(1).single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.warn('Failed to fetch importer KPIs from database:', error);
    return {
      activeOrders: 0,
      ordersInTransit: 0,
      ordersPendingClearance: 0,
      ordersDelivered: 0,
      totalImportSpend: 0,
      dutySavings: 0,
      averageLeadTime: 0,
      customsClearanceTime: 0,
      complianceScore: 0,
      onTimeDeliveryRate: 0,
      supplierPerformance: 0,
    };
  }
}

export async function getImportOrders(filters?: {
  status?: JourneyStatus;
  supplier?: string;
  country?: string;
  fromDate?: string;
  toDate?: string;
  transportMode?: TransportMode;
  complianceStatus?: ComplianceStatus;
}): Promise<ImportOrder[]> {
  try {
    let query = supabase.from('import_orders').select('*');

    if (filters) {
      if (filters.status) query = query.eq('journey_status', filters.status);
      if (filters.supplier) query = query.ilike('supplier', `%${filters.supplier}%`);
      if (filters.country) query = query.eq('source_country', filters.country);
      if (filters.fromDate) query = query.gte('po_date', filters.fromDate);
      if (filters.toDate) query = query.lte('po_date', filters.toDate);
      if (filters.transportMode) query = query.eq('transport_mode', filters.transportMode);
      if (filters.complianceStatus) query = query.eq('compliance_status', filters.complianceStatus);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');

    return data;
  } catch (error) {
    console.warn('Failed to fetch import orders from database:', error);
    return [];
  }
}

export async function getSuppliers(): Promise<SupplierProfile[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');

    return data;
  } catch (error) {
    console.warn('Failed to fetch suppliers from database:', error);
    return [];
  }
}

export async function getShipmentTracking(orderId: string): Promise<ImportShipmentTracking | null> {
  try {
    const { data, error } = await supabase
      .from('shipment_tracking')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.warn('Failed to fetch shipment tracking from database:', error);

    return null;
  }
}

export async function getDocuments(orderId?: string): Promise<DocumentRecord[]> {
  try {
    let query = supabase.from('import_documents').select('*');
    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error } = await query.order('upload_date', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');

    return data;
  } catch (error) {
    console.warn('Failed to fetch documents from database:', error);
    return [];
  }
}

export async function getCustomsRequirements(
  hsCode: string,
  country: string
): Promise<CustomsRequirement | null> {
  try {
    const { data, error } = await supabase
      .from('customs_requirements')
      .select('*')
      .eq('hs_code', hsCode)
      .eq('country', country)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.warn('Failed to fetch customs requirements from database:', error);
    return null;
  }
}

export async function getCostBreakdown(orderId: string): Promise<CostBreakdown | null> {
  try {
    const { data, error } = await supabase
      .from('import_costs')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.warn('Failed to fetch cost breakdown from database:', error);
    return null;
  }
}

export async function getNotifications(
  unreadOnly: boolean = false
): Promise<WorkflowNotification[]> {
  try {
    let query = supabase.from('importer_notifications').select('*');
    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');

    return data;
  } catch (error) {
    console.warn('Failed to fetch notifications from database:', error);
    return [];
  }
}

export async function getSupplierPerformanceMetrics(): Promise<SupplierPerformanceMetric[]> {
  try {
    const { data, error } = await supabase
      .from('supplier_performance')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');

    return data;
  } catch (error) {
    console.warn('Failed to fetch supplier metrics from database:', error);
    return [];
  }
}

export async function getCarrierPerformanceMetrics(): Promise<CarrierPerformanceMetric[]> {
  try {
    const { data, error } = await supabase
      .from('carrier_performance')
      .select('*')
      .order('on_time_rate', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');

    return data;
  } catch (error) {
    console.warn('Failed to fetch carrier metrics from database:', error);
    return [];
  }
}

export async function getCustomsClearanceMetrics(
  months: number = 6
): Promise<CustomsClearanceMetric[]> {
  try {
    const { data, error } = await supabase
      .from('customs_clearance_metrics')
      .select('*')
      .order('month', { ascending: false })
      .limit(months);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');

    return data;
  } catch (error) {
    console.warn('Failed to fetch customs metrics from database:', error);
    return [];
  }
}

export async function searchHSCode(query: string): Promise<HSCodeLookup[]> {
  try {
    const search = sanitizeSearchInput(query);
    const { data, error } = await supabase
      .from('hs_codes')
      .select('*')
      .or(`code.ilike.%${search}%,description.ilike.%${search}%`)
      .limit(20);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');

    return data;
  } catch (error) {
    console.warn('Failed to search HS codes from database:', error);
    return [];
  }
}

export async function getTradeAgreementRules(hsCode: string): Promise<TradeAgreementRule[]> {
  try {
    const { data, error } = await supabase
      .from('trade_agreement_rules')
      .select('*')
      .eq('hs_code', hsCode);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');

    return data;
  } catch (error) {
    console.warn('Failed to fetch trade agreement rules from database:', error);
    return [];
  }
}
