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
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/%/g, '\\%')    // Escape % wildcard
    .replace(/_/g, '\\_')    // Escape _ wildcard
    .replace(/,/g, '')       // Remove commas (breaks .or() syntax)
    .replace(/\(/g, '')      // Remove parentheses
    .replace(/\)/g, '')
    .trim()
    .slice(0, 100);          // Limit length to prevent DoS
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

export type CustomsDeclarationStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CLEARED' | 'HELD' | 'REJECTED';

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
  type: 'MISSING_DOCUMENT' | 'EXPIRED_LICENSE' | 'QUOTA_EXCEEDED' | 'RESTRICTED_GOODS' | 'TARIFF_CHANGE';
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
  type: 'DOCUMENT_MISSING' | 'CUSTOMS_HOLD' | 'SHIPMENT_DELAY' | 'LICENSE_EXPIRY' | 'PAYMENT_DUE' | 'DELIVERY_UPDATE';
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

const MOCK_IMPORT_ORDERS: ImportOrder[] = [
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
    updatedAt: '2026-02-18T14:20:00Z'
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
    updatedAt: '2026-02-19T09:45:00Z'
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
    updatedAt: '2026-02-19T16:30:00Z'
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
    updatedAt: '2026-01-30T10:00:00Z'
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
    updatedAt: '2026-02-19T08:15:00Z'
  }
];

const MOCK_SUPPLIERS: SupplierProfile[] = [
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
    productCategories: ['Electronics', 'Mobile devices', 'Accessories']
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
    productCategories: ['Textiles', 'Apparel', 'Fabrics']
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
    productCategories: ['Industrial machinery', 'Equipment']
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
    productCategories: ['Wine', 'Beverages']
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
    productCategories: ['Pharmaceuticals', 'Medical supplies']
  }
];

const MOCK_NOTIFICATIONS: WorkflowNotification[] = [
  {
    id: 'NOT-001',
    orderId: 'IMP-003',
    type: 'CUSTOMS_HOLD',
    priority: 'HIGH',
    title: 'Customs Hold Alert',
    message: 'PO-2026-0256: Additional documentation required for machinery import clearance',
    actionUrl: '/importer?tab=compliance',
    createdAt: '2026-02-19T16:30:00Z',
    read: false
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
    read: false
  },
  {
    id: 'NOT-003',
    type: 'LICENSE_EXPIRY',
    priority: 'HIGH',
    title: 'Import License Expiring',
    message: 'Your pharmaceutical import license expires in 15 days',
    actionUrl: '/importer?tab=compliance',
    createdAt: '2026-02-17T09:00:00Z',
    read: true
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
    read: false
  }
];

// ============================================================================
// SERVICE METHODS
// ============================================================================

export async function getDashboardKPIs(): Promise<ImporterKPIs> {
  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('importer_kpis')
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.warn('Failed to fetch KPIs from database, using mock data:', error);

    // Fallback to calculated mock data
    const activeOrders = MOCK_IMPORT_ORDERS.filter(o =>
      o.journeyStatus !== 'DELIVERED'
    ).length;

    const ordersInTransit = MOCK_IMPORT_ORDERS.filter(o =>
      o.journeyStatus === 'IN_TRANSIT'
    ).length;

    const ordersPendingClearance = MOCK_IMPORT_ORDERS.filter(o =>
      o.journeyStatus === 'CUSTOMS_CLEARANCE' || o.journeyStatus === 'AT_PORT'
    ).length;

    const ordersDelivered = MOCK_IMPORT_ORDERS.filter(o =>
      o.journeyStatus === 'DELIVERED'
    ).length;

    const totalImportSpend = MOCK_IMPORT_ORDERS.reduce((sum, o) => sum + o.totalValue, 0);

    return {
      activeOrders,
      ordersInTransit,
      ordersPendingClearance,
      ordersDelivered,
      totalImportSpend,
      dutySavings: 12500, // Mock AfCFTA savings
      averageLeadTime: 32,
      customsClearanceTime: 48,
      complianceScore: 94,
      onTimeDeliveryRate: 89,
      supplierPerformance: 4.6
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
    console.warn('Failed to fetch import orders from database, using mock data:', error);

    let filteredOrders = [...MOCK_IMPORT_ORDERS];

    if (filters) {
      if (filters.status) {
        filteredOrders = filteredOrders.filter(o => o.journeyStatus === filters.status);
      }
      if (filters.supplier) {
        filteredOrders = filteredOrders.filter(o =>
          o.supplier.toLowerCase().includes(filters.supplier!.toLowerCase())
        );
      }
      if (filters.country) {
        filteredOrders = filteredOrders.filter(o => o.sourceCountry === filters.country);
      }
      if (filters.transportMode) {
        filteredOrders = filteredOrders.filter(o => o.transportMode === filters.transportMode);
      }
      if (filters.complianceStatus) {
        filteredOrders = filteredOrders.filter(o => o.complianceStatus === filters.complianceStatus);
      }
    }

    return filteredOrders;
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
    console.warn('Failed to fetch suppliers from database, using mock data:', error);
    return MOCK_SUPPLIERS;
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
    console.warn('Failed to fetch shipment tracking from database, using mock data:', error);

    // Mock shipment tracking data
    const order = MOCK_IMPORT_ORDERS.find(o => o.id === orderId);
    if (!order) return null;

    const mockMilestones: ShipmentMilestone[] = [
      {
        stage: 'PO Created',
        status: 'COMPLETED',
        timestamp: order.poDate,
        location: order.destinationCountry,
        notes: 'Purchase order confirmed'
      },
      {
        stage: 'Shipment Confirmed',
        status: order.shipmentDate ? 'COMPLETED' : 'PENDING',
        timestamp: order.shipmentDate,
        location: order.sourceCountry,
        notes: 'Goods ready for shipment'
      },
      {
        stage: 'Departure',
        status: order.atd ? 'COMPLETED' : 'PENDING',
        timestamp: order.atd,
        location: order.sourceCountry,
        notes: `Departed via ${order.transportMode}`
      },
      {
        stage: 'In Transit',
        status: order.journeyStatus === 'IN_TRANSIT' ? 'IN_PROGRESS' :
                order.journeyStatus === 'AT_PORT' || order.journeyStatus === 'CUSTOMS_CLEARANCE' || order.journeyStatus === 'DELIVERED' ? 'COMPLETED' : 'PENDING',
        location: order.journeyStatus === 'IN_TRANSIT' ? 'International waters' : undefined
      },
      {
        stage: 'Arrival at Port',
        status: order.journeyStatus === 'AT_PORT' ? 'IN_PROGRESS' :
                order.journeyStatus === 'CUSTOMS_CLEARANCE' || order.journeyStatus === 'DELIVERED' ? 'COMPLETED' : 'PENDING',
        location: order.destinationCountry
      },
      {
        stage: 'Customs Clearance',
        status: order.journeyStatus === 'CUSTOMS_CLEARANCE' ? 'IN_PROGRESS' :
                order.journeyStatus === 'DELIVERED' ? 'COMPLETED' : 'PENDING',
        location: order.destinationCountry
      },
      {
        stage: 'Delivery',
        status: order.journeyStatus === 'DELIVERED' ? 'COMPLETED' : 'PENDING',
        location: order.destinationCountry
      }
    ];

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      currentStatus: order.journeyStatus,
      milestones: mockMilestones,
      currentLocation: order.journeyStatus === 'IN_TRANSIT' ? 'Red Sea' : order.destinationCountry,
      nextMilestone: mockMilestones.find(m => m.status === 'PENDING')?.stage,
      carrier: order.assignedLogisticsPartner,
      vesselName: order.transportMode === 'SEA' ? 'MV Oceanic Trader' : undefined,
      flightNumber: order.transportMode === 'AIR' ? 'EK721' : undefined,
      trackingNumber: `TRK-${order.orderNo}`
    };
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
    console.warn('Failed to fetch documents from database, using mock data:', error);

    // Mock documents
    const mockDocs: DocumentRecord[] = [
      {
        id: 'DOC-001',
        orderId: 'IMP-001',
        documentType: 'Commercial Invoice',
        fileName: 'invoice_PO-2026-0234.pdf',
        uploadDate: '2026-01-15T10:00:00Z',
        status: 'VERIFIED',
        version: 1,
        uploadedBy: 'admin@company.com',
        requiresSignature: false
      },
      {
        id: 'DOC-002',
        orderId: 'IMP-001',
        documentType: 'Bill of Lading',
        fileName: 'BOL_MSCU3456789.pdf',
        uploadDate: '2026-01-22T14:30:00Z',
        status: 'VERIFIED',
        version: 1,
        uploadedBy: 'logistics@company.com',
        requiresSignature: true,
        signedBy: ['Maersk Line']
      },
      {
        id: 'DOC-003',
        orderId: 'IMP-003',
        documentType: 'Import License',
        fileName: 'import_license_machinery.pdf',
        uploadDate: '2026-02-12T11:30:00Z',
        expiryDate: '2027-02-12',
        status: 'VERIFIED',
        version: 1,
        uploadedBy: 'compliance@company.com',
        requiresSignature: true
      },
      {
        id: 'DOC-004',
        orderId: 'IMP-005',
        documentType: 'Certificate of Origin',
        fileName: 'COO_PO-2026-0289.pdf',
        uploadDate: '2026-02-18T15:00:00Z',
        status: 'UPLOADED',
        version: 1,
        uploadedBy: 'admin@company.com',
        requiresSignature: false
      }
    ];

    return orderId ? mockDocs.filter(d => d.orderId === orderId) : mockDocs;
  }
}

export async function getCustomsRequirements(hsCode: string, country: string): Promise<CustomsRequirement | null> {
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
    console.warn('Failed to fetch customs requirements from database, using mock data:', error);

    // Mock customs requirements
    const mockRequirements: Record<string, CustomsRequirement> = {
      '8517.12.00': {
        hsCode: '8517.12.00',
        description: 'Telephones for cellular networks or for other wireless networks',
        dutyRate: 10,
        taxRate: 16,
        restrictionLevel: 'NONE',
        requiredDocuments: ['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Certificate of Conformity']
      },
      '6204.42.00': {
        hsCode: '6204.42.00',
        description: 'Women\'s or girls\' dresses of cotton',
        dutyRate: 25,
        taxRate: 16,
        restrictionLevel: 'NONE',
        requiredDocuments: ['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Certificate of Origin'],
        quotaApplicable: true,
        quotaUsed: 125000,
        quotaLimit: 500000
      },
      '8479.89.90': {
        hsCode: '8479.89.90',
        description: 'Machines and mechanical appliances having individual functions',
        dutyRate: 10,
        taxRate: 16,
        restrictionLevel: 'RESTRICTED',
        requiredDocuments: ['Commercial Invoice', 'Packing List', 'Air Waybill', 'Import License', 'Technical Specifications', 'Installation Certificate']
      },
      '2204.21.00': {
        hsCode: '2204.21.00',
        description: 'Wine of fresh grapes, in containers holding 2 liters or less',
        dutyRate: 0, // AfCFTA benefit
        taxRate: 16,
        restrictionLevel: 'NONE',
        requiredDocuments: ['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Certificate of Origin (AfCFTA)', 'Health Certificate']
      },
      '3004.90.00': {
        hsCode: '3004.90.00',
        description: 'Medicaments consisting of mixed or unmixed products',
        dutyRate: 0,
        taxRate: 0, // VAT exempt
        restrictionLevel: 'RESTRICTED',
        requiredDocuments: ['Commercial Invoice', 'Packing List', 'Air Waybill', 'Import License', 'GMP Certificate', 'Product Registration', 'Batch Testing Report']
      }
    };

    return mockRequirements[hsCode] || null;
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
    console.warn('Failed to fetch cost breakdown from database, using mock data:', error);

    const order = MOCK_IMPORT_ORDERS.find(o => o.id === orderId);
    if (!order) return null;

    // Calculate mock costs
    const purchaseValue = order.totalValue;
    const dutiesAndTaxes = purchaseValue * 0.26; // 10% duty + 16% VAT
    const portCharges = 1200;
    const inlandTransport = 800;
    const insurance = purchaseValue * 0.015;
    const otherFees = 450;
    const totalLandedCost = purchaseValue + dutiesAndTaxes + portCharges + inlandTransport + insurance + otherFees;

    return {
      orderId: order.id,
      purchaseValue,
      dutiesAndTaxes,
      portCharges,
      inlandTransport,
      insurance,
      otherFees,
      totalLandedCost,
      currency: order.currency,
      costVariance: -3.2 // Mock variance
    };
  }
}

export async function getNotifications(unreadOnly: boolean = false): Promise<WorkflowNotification[]> {
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
    console.warn('Failed to fetch notifications from database, using mock data:', error);
    return unreadOnly ? MOCK_NOTIFICATIONS.filter(n => !n.read) : MOCK_NOTIFICATIONS;
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
    console.warn('Failed to fetch supplier metrics from database, using mock data:', error);

    return MOCK_SUPPLIERS.map(s => ({
      supplierId: s.id,
      supplierName: s.name,
      country: s.country,
      totalOrders: s.totalOrders,
      onTimeDeliveryRate: s.onTimeDeliveryRate,
      averageLeadTime: s.leadTime || 30,
      qualityIssues: Math.floor(s.totalOrders * (1 - s.qualityScore / 5)),
      totalValue: s.totalOrders * (s.minimumOrderValue || 50000),
      lastOrderDate: '2026-02-15',
      rating: s.rating
    }));
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
    console.warn('Failed to fetch carrier metrics from database, using mock data:', error);

    return [
      {
        carrierId: 'CAR-001',
        carrierName: 'Maersk Line',
        transportMode: 'SEA',
        totalShipments: 45,
        onTimeRate: 92,
        averageDelay: 18,
        damageRate: 0.5,
        lostShipments: 0,
        totalCost: 1250000
      },
      {
        carrierId: 'CAR-002',
        carrierName: 'CMA CGM',
        transportMode: 'SEA',
        totalShipments: 32,
        onTimeRate: 88,
        averageDelay: 24,
        damageRate: 1.2,
        lostShipments: 0,
        totalCost: 890000
      },
      {
        carrierId: 'CAR-003',
        carrierName: 'DHL Global Forwarding',
        transportMode: 'AIR',
        totalShipments: 18,
        onTimeRate: 96,
        averageDelay: 6,
        damageRate: 0.2,
        lostShipments: 0,
        totalCost: 650000
      },
      {
        carrierId: 'CAR-004',
        carrierName: 'MSC',
        transportMode: 'SEA',
        totalShipments: 28,
        onTimeRate: 85,
        averageDelay: 32,
        damageRate: 1.8,
        lostShipments: 1,
        totalCost: 780000
      }
    ];
  }
}

export async function getCustomsClearanceMetrics(months: number = 6): Promise<CustomsClearanceMetric[]> {
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
    console.warn('Failed to fetch customs metrics from database, using mock data:', error);

    return [
      {
        month: '2026-02',
        totalDeclarations: 12,
        averageClearanceTime: 48,
        holdRate: 8.3,
        rejectionRate: 0,
        dutiesPaid: 185000,
        complianceScore: 96
      },
      {
        month: '2026-01',
        totalDeclarations: 18,
        averageClearanceTime: 52,
        holdRate: 11.1,
        rejectionRate: 5.6,
        dutiesPaid: 245000,
        complianceScore: 92
      },
      {
        month: '2025-12',
        totalDeclarations: 15,
        averageClearanceTime: 45,
        holdRate: 6.7,
        rejectionRate: 0,
        dutiesPaid: 198000,
        complianceScore: 98
      },
      {
        month: '2025-11',
        totalDeclarations: 20,
        averageClearanceTime: 56,
        holdRate: 15,
        rejectionRate: 5,
        dutiesPaid: 312000,
        complianceScore: 88
      },
      {
        month: '2025-10',
        totalDeclarations: 16,
        averageClearanceTime: 50,
        holdRate: 12.5,
        rejectionRate: 6.25,
        dutiesPaid: 228000,
        complianceScore: 90
      },
      {
        month: '2025-09',
        totalDeclarations: 14,
        averageClearanceTime: 47,
        holdRate: 7.1,
        rejectionRate: 0,
        dutiesPaid: 175000,
        complianceScore: 95
      }
    ];
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
    console.warn('Failed to search HS codes from database, using mock data:', error);

    const mockHSCodes: HSCodeLookup[] = [
      {
        code: '8517.12.00',
        description: 'Telephones for cellular networks or for other wireless networks',
        dutyRate: 10,
        taxRate: 16,
        chapter: '85',
        chapterDescription: 'Electrical machinery and equipment'
      },
      {
        code: '6204.42.00',
        description: 'Women\'s or girls\' dresses of cotton',
        dutyRate: 25,
        taxRate: 16,
        chapter: '62',
        chapterDescription: 'Articles of apparel and clothing accessories, not knitted or crocheted'
      },
      {
        code: '8479.89.90',
        description: 'Machines and mechanical appliances having individual functions',
        dutyRate: 10,
        taxRate: 16,
        chapter: '84',
        chapterDescription: 'Nuclear reactors, boilers, machinery and mechanical appliances'
      },
      {
        code: '2204.21.00',
        description: 'Wine of fresh grapes, in containers holding 2 liters or less',
        dutyRate: 0,
        taxRate: 16,
        chapter: '22',
        chapterDescription: 'Beverages, spirits and vinegar'
      },
      {
        code: '3004.90.00',
        description: 'Medicaments consisting of mixed or unmixed products',
        dutyRate: 0,
        taxRate: 0,
        chapter: '30',
        chapterDescription: 'Pharmaceutical products'
      }
    ];

    return mockHSCodes.filter(h =>
      h.code.includes(query) ||
      h.description.toLowerCase().includes(query.toLowerCase())
    );
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
    console.warn('Failed to fetch trade agreement rules from database, using mock data:', error);

    const mockRules: Record<string, TradeAgreementRule[]> = {
      '2204.21.00': [
        {
          agreementName: 'AfCFTA',
          countries: ['South Africa', 'Kenya', 'Ghana', 'Nigeria', 'Ethiopia', 'Rwanda'],
          hsCode: '2204.21.00',
          preferentialDutyRate: 0,
          standardDutyRate: 25,
          requiredOriginPercentage: 60,
          requiredDocuments: ['Certificate of Origin (AfCFTA Form)', 'Commercial Invoice', 'Bill of Lading']
        }
      ],
      '6204.42.00': [
        {
          agreementName: 'EAC Common External Tariff',
          countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan'],
          hsCode: '6204.42.00',
          preferentialDutyRate: 10,
          standardDutyRate: 25,
          requiredOriginPercentage: 50,
          requiredDocuments: ['Certificate of Origin (EAC)', 'Commercial Invoice']
        }
      ]
    };

    return mockRules[hsCode] || [];
  }
}
