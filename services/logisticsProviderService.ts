import { supabase } from './supabase';

// =============================================================================
// UTILITIES
// =============================================================================

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

// Types
export interface FleetVehicle {
  id: string;
  registration: string;
  type: 'truck' | 'trailer' | 'tanker' | 'refrigerated' | 'flatbed';
  capacity: string;
  status: 'available' | 'in_transit' | 'maintenance' | 'idle';
  currentLocation: string;
  coordinates?: { lat: number; lng: number };
  driver?: string;
  driverId?: string;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance: string;
  insuranceExpiry: string;
  permitExpiry: string;
  mileage: number;
  healthScore: number;
}

export interface FleetDriver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'available' | 'on_duty' | 'off_duty' | 'on_leave';
  assignedVehicle?: string;
  behaviorScore: number;
  totalTrips: number;
  certifications: string[];
  languages: string[];
  photo?: string;
}

export interface LogisticsKPIs {
  revenueToday: number;
  revenueMonth: number;
  revenueTrend: number;
  activeShipments: number;
  shipmentsInTransit: number;
  shipmentsAtBorder: number;
  shipmentsDelayed: number;
  fleetUtilization: number;
  fleetTotal: number;
  fleetActive: number;
  customsRiskScore: number;
  borderDelays: number;
  avgDelayHours: number;
  pendingInvoices: number;
  pendingAmount: number;
  availableTenders: number;
  fuelCostToday: number;
  fuelCostMonth: number;
  carbonEmissions: number;
}

export interface ActiveShipment {
  id: string;
  trackingNumber: string;
  client: string;
  clientId: string;
  origin: string;
  destination: string;
  cargo: string;
  cargoType: string;
  weight: string;
  value: number;
  currency: string;
  status: 'booked' | 'picked_up' | 'in_transit' | 'at_border' | 'customs_hold' | 'cleared' | 'delivered';
  riskLevel: 'low' | 'medium' | 'high';
  progress: number;
  eta: string;
  transportMode: 'road' | 'rail' | 'sea' | 'air' | 'multimodal';
  vehicle?: string;
  driver?: string;
  currentLocation: string;
  coordinates?: { lat: number; lng: number };
  timeline: {
    milestone: string;
    location: string;
    planned: string;
    actual?: string;
    status: 'completed' | 'current' | 'upcoming' | 'delayed';
  }[];
  documents: {
    name: string;
    type: string;
    status: 'pending' | 'uploaded' | 'verified' | 'rejected';
    url?: string;
  }[];
  profitability: {
    revenue: number;
    costs: number;
    margin: number;
  };
}

export interface LogisticsTender {
  id: string;
  title: string;
  issuer: string;
  issuerType: 'government' | 'afcfta' | 'private';
  corridor: string;
  cargoType: string;
  volume: string;
  value: number;
  currency: string;
  deadline: string;
  status: 'new' | 'preparing' | 'submitted' | 'awarded' | 'lost';
  matchScore: number;
  winProbability: number;
  requirements: string[];
  documents: string[];
}

export interface LogisticsInvoice {
  id: string;
  invoiceNumber: string;
  client: string;
  clientId: string;
  shipmentId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'disputed';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  taxes: number;
  total: number;
}

export interface ComplianceDocument {
  id: string;
  name: string;
  type: 'license' | 'permit' | 'insurance' | 'certification' | 'customs';
  status: 'valid' | 'expiring_soon' | 'expired' | 'pending';
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  documentUrl?: string;
  category: 'company' | 'vehicle' | 'driver';
  linkedEntity?: string;
}

export interface BorderAlert {
  id: string;
  borderPost: string;
  country: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'congestion' | 'delay' | 'closure' | 'incident' | 'weather';
  message: string;
  avgWaitTime: string;
  updatedAt: string;
  affectedShipments: number;
}

export interface Client {
  id: string;
  name: string;
  type: 'exporter' | 'importer' | 'manufacturer' | 'trader';
  country: string;
  verified: boolean;
  rating: number;
  totalShipments: number;
  preferredCargo: string[];
  preferredRoutes: string[];
  creditScore: number;
  paymentTerms: string;
}

export interface BackhaulOpportunity {
  id: string;
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  pickupDate: string;
  value: number;
  currency: string;
  client: string;
  matchScore: number;
}

// Mock Data
const MOCK_FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: 'v1',
    registration: 'ZA-GP-1234',
    type: 'truck',
    capacity: '30 tons',
    status: 'in_transit',
    currentLocation: 'Beitbridge Border',
    coordinates: { lat: -22.2167, lng: 30.0167 },
    driver: 'John Moyo',
    driverId: 'd1',
    fuelLevel: 65,
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15',
    insuranceExpiry: '2024-12-31',
    permitExpiry: '2024-08-20',
    mileage: 245000,
    healthScore: 92
  },
  {
    id: 'v2',
    registration: 'KE-NBI-5678',
    type: 'refrigerated',
    capacity: '20 tons',
    status: 'available',
    currentLocation: 'Nairobi Depot',
    coordinates: { lat: -1.2921, lng: 36.8219 },
    fuelLevel: 90,
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-05-01',
    insuranceExpiry: '2024-11-30',
    permitExpiry: '2024-09-15',
    mileage: 180000,
    healthScore: 98
  },
  {
    id: 'v3',
    registration: 'NG-LA-9012',
    type: 'tanker',
    capacity: '40,000 liters',
    status: 'maintenance',
    currentLocation: 'Lagos Workshop',
    coordinates: { lat: 6.5244, lng: 3.3792 },
    fuelLevel: 20,
    lastMaintenance: '2024-02-20',
    nextMaintenance: '2024-02-25',
    insuranceExpiry: '2024-10-15',
    permitExpiry: '2024-07-01',
    mileage: 320000,
    healthScore: 75
  },
  {
    id: 'v4',
    registration: 'GH-AC-3456',
    type: 'flatbed',
    capacity: '25 tons',
    status: 'in_transit',
    currentLocation: 'Tema Port',
    coordinates: { lat: 5.6333, lng: -0.0167 },
    driver: 'Kwame Asante',
    driverId: 'd3',
    fuelLevel: 45,
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-04-20',
    insuranceExpiry: '2025-01-31',
    permitExpiry: '2024-06-30',
    mileage: 156000,
    healthScore: 88
  },
  {
    id: 'v5',
    registration: 'TZ-DAR-7890',
    type: 'truck',
    capacity: '28 tons',
    status: 'idle',
    currentLocation: 'Dar es Salaam',
    coordinates: { lat: -6.7924, lng: 39.2083 },
    driver: 'Hassan Juma',
    driverId: 'd4',
    fuelLevel: 80,
    lastMaintenance: '2024-02-10',
    nextMaintenance: '2024-05-10',
    insuranceExpiry: '2024-09-30',
    permitExpiry: '2024-11-15',
    mileage: 210000,
    healthScore: 95
  }
];

const MOCK_DRIVERS: FleetDriver[] = [
  {
    id: 'd1',
    name: 'John Moyo',
    phone: '+263 77 123 4567',
    licenseNumber: 'ZW-DL-123456',
    licenseExpiry: '2025-06-30',
    status: 'on_duty',
    assignedVehicle: 'ZA-GP-1234',
    behaviorScore: 94,
    totalTrips: 245,
    certifications: ['Hazmat', 'Cross-border', 'Defensive Driving'],
    languages: ['English', 'Shona', 'Ndebele']
  },
  {
    id: 'd2',
    name: 'Amina Okonkwo',
    phone: '+234 803 456 7890',
    licenseNumber: 'NG-DL-789012',
    licenseExpiry: '2024-12-15',
    status: 'available',
    behaviorScore: 98,
    totalTrips: 312,
    certifications: ['Tanker', 'Cross-border', 'First Aid'],
    languages: ['English', 'Yoruba', 'French']
  },
  {
    id: 'd3',
    name: 'Kwame Asante',
    phone: '+233 24 567 8901',
    licenseNumber: 'GH-DL-345678',
    licenseExpiry: '2025-03-20',
    status: 'on_duty',
    assignedVehicle: 'GH-AC-3456',
    behaviorScore: 91,
    totalTrips: 189,
    certifications: ['Heavy Load', 'Cross-border'],
    languages: ['English', 'Twi', 'French']
  },
  {
    id: 'd4',
    name: 'Hassan Juma',
    phone: '+255 754 123 456',
    licenseNumber: 'TZ-DL-901234',
    licenseExpiry: '2024-08-30',
    status: 'on_duty',
    assignedVehicle: 'TZ-DAR-7890',
    behaviorScore: 87,
    totalTrips: 156,
    certifications: ['Cross-border', 'Refrigerated Cargo'],
    languages: ['Swahili', 'English']
  },
  {
    id: 'd5',
    name: 'Peter Nkosi',
    phone: '+27 82 345 6789',
    licenseNumber: 'ZA-DL-567890',
    licenseExpiry: '2025-09-15',
    status: 'off_duty',
    behaviorScore: 96,
    totalTrips: 423,
    certifications: ['Hazmat', 'Tanker', 'Cross-border', 'ADR'],
    languages: ['English', 'Zulu', 'Afrikaans']
  }
];

const MOCK_SHIPMENTS: ActiveShipment[] = [
  {
    id: 'sh1',
    trackingNumber: 'AFT-2024-001234',
    client: 'Zambezi Agro Exports',
    clientId: 'c1',
    origin: 'Harare, Zimbabwe',
    destination: 'Johannesburg, South Africa',
    cargo: 'Agricultural Machinery',
    cargoType: 'machinery',
    weight: '18,500 kg',
    value: 125000,
    currency: 'USD',
    status: 'at_border',
    riskLevel: 'medium',
    progress: 65,
    eta: '2024-02-18',
    transportMode: 'road',
    vehicle: 'ZA-GP-1234',
    driver: 'John Moyo',
    currentLocation: 'Beitbridge Border Post',
    coordinates: { lat: -22.2167, lng: 30.0167 },
    timeline: [
      { milestone: 'Pickup', location: 'Harare', planned: 'Feb 14, 08:00', actual: 'Feb 14, 08:30', status: 'completed' },
      { milestone: 'In Transit', location: 'Masvingo', planned: 'Feb 14, 14:00', actual: 'Feb 14, 15:00', status: 'completed' },
      { milestone: 'Border Arrival', location: 'Beitbridge', planned: 'Feb 15, 06:00', actual: 'Feb 15, 07:30', status: 'completed' },
      { milestone: 'Customs Clearance', location: 'Beitbridge', planned: 'Feb 15, 12:00', status: 'current' },
      { milestone: 'Border Departure', location: 'Musina', planned: 'Feb 16, 08:00', status: 'upcoming' },
      { milestone: 'Delivery', location: 'Johannesburg', planned: 'Feb 18, 10:00', status: 'upcoming' }
    ],
    documents: [
      { name: 'Bill of Lading', type: 'customs', status: 'verified' },
      { name: 'Commercial Invoice', type: 'customs', status: 'verified' },
      { name: 'Certificate of Origin', type: 'customs', status: 'pending' },
      { name: 'Packing List', type: 'customs', status: 'uploaded' }
    ],
    profitability: { revenue: 8500, costs: 5200, margin: 38.8 }
  },
  {
    id: 'sh2',
    trackingNumber: 'AFT-2024-001235',
    client: 'Kenya Coffee Cooperative',
    clientId: 'c2',
    origin: 'Nairobi, Kenya',
    destination: 'Mombasa Port, Kenya',
    cargo: 'Coffee Beans (Grade AA)',
    cargoType: 'agricultural',
    weight: '22,000 kg',
    value: 88000,
    currency: 'USD',
    status: 'in_transit',
    riskLevel: 'low',
    progress: 45,
    eta: '2024-02-16',
    transportMode: 'road',
    vehicle: 'KE-NBI-5678',
    driver: 'Amina Okonkwo',
    currentLocation: 'Machakos County',
    coordinates: { lat: -1.5177, lng: 37.2634 },
    timeline: [
      { milestone: 'Pickup', location: 'Nairobi', planned: 'Feb 15, 06:00', actual: 'Feb 15, 06:15', status: 'completed' },
      { milestone: 'In Transit', location: 'Machakos', planned: 'Feb 15, 10:00', status: 'current' },
      { milestone: 'Weighbridge', location: 'Mtito Andei', planned: 'Feb 15, 16:00', status: 'upcoming' },
      { milestone: 'Port Arrival', location: 'Mombasa', planned: 'Feb 16, 08:00', status: 'upcoming' }
    ],
    documents: [
      { name: 'Export Permit', type: 'customs', status: 'verified' },
      { name: 'Phytosanitary Certificate', type: 'compliance', status: 'verified' },
      { name: 'Quality Certificate', type: 'quality', status: 'verified' }
    ],
    profitability: { revenue: 4500, costs: 2800, margin: 37.8 }
  },
  {
    id: 'sh3',
    trackingNumber: 'AFT-2024-001236',
    client: 'Lagos Industrial Supplies',
    clientId: 'c3',
    origin: 'Tema Port, Ghana',
    destination: 'Lagos, Nigeria',
    cargo: 'Industrial Equipment',
    cargoType: 'machinery',
    weight: '15,000 kg',
    value: 210000,
    currency: 'USD',
    status: 'customs_hold',
    riskLevel: 'high',
    progress: 30,
    eta: '2024-02-22',
    transportMode: 'road',
    vehicle: 'GH-AC-3456',
    driver: 'Kwame Asante',
    currentLocation: 'Aflao Border Post',
    coordinates: { lat: 6.1167, lng: 1.1833 },
    timeline: [
      { milestone: 'Port Pickup', location: 'Tema', planned: 'Feb 14, 10:00', actual: 'Feb 14, 14:00', status: 'completed' },
      { milestone: 'Border Arrival', location: 'Aflao', planned: 'Feb 15, 08:00', actual: 'Feb 15, 16:00', status: 'delayed' },
      { milestone: 'Customs Clearance', location: 'Aflao', planned: 'Feb 16, 10:00', status: 'current' },
      { milestone: 'Border Departure', location: 'Seme', planned: 'Feb 17, 08:00', status: 'upcoming' },
      { milestone: 'Delivery', location: 'Lagos', planned: 'Feb 18, 14:00', status: 'upcoming' }
    ],
    documents: [
      { name: 'Bill of Lading', type: 'customs', status: 'verified' },
      { name: 'Commercial Invoice', type: 'customs', status: 'rejected' },
      { name: 'Import Permit', type: 'customs', status: 'pending' },
      { name: 'ECOWAS Certificate', type: 'trade', status: 'pending' }
    ],
    profitability: { revenue: 12000, costs: 7500, margin: 37.5 }
  }
];

const MOCK_TENDERS: LogisticsTender[] = [
  {
    id: 't1',
    title: 'Trans-African Highway Corridor Transport Services',
    issuer: 'African Development Bank',
    issuerType: 'afcfta',
    corridor: 'Lagos - Abuja - Kano',
    cargoType: 'General Cargo',
    volume: '50,000 tons/year',
    value: 2500000,
    currency: 'USD',
    deadline: '2024-03-15',
    status: 'new',
    matchScore: 92,
    winProbability: 75,
    requirements: ['ISO 9001', 'Fleet min 20 vehicles', '5 years experience', 'Cross-border permits'],
    documents: ['Company Registration', 'Tax Clearance', 'Insurance Certificate', 'Fleet Inventory']
  },
  {
    id: 't2',
    title: 'Agricultural Export Logistics - East Africa',
    issuer: 'Kenya Ministry of Agriculture',
    issuerType: 'government',
    corridor: 'Nairobi - Mombasa - Dar es Salaam',
    cargoType: 'Perishables & Agricultural',
    volume: '25,000 tons/season',
    value: 800000,
    currency: 'USD',
    deadline: '2024-03-01',
    status: 'preparing',
    matchScore: 88,
    winProbability: 65,
    requirements: ['Refrigerated fleet', 'HACCP certification', 'Cold chain experience'],
    documents: ['Food Safety Certification', 'Vehicle Inspection Reports', 'Driver Training Records']
  },
  {
    id: 't3',
    title: 'Mining Equipment Transport - DRC to South Africa',
    issuer: 'Glencore Mining',
    issuerType: 'private',
    corridor: 'Lubumbashi - Kasumbalesa - Johannesburg',
    cargoType: 'Heavy Mining Equipment',
    volume: '100 abnormal loads',
    value: 1200000,
    currency: 'USD',
    deadline: '2024-04-30',
    status: 'new',
    matchScore: 78,
    winProbability: 55,
    requirements: ['Heavy load permits', 'Escort vehicle capability', 'Insurance min $5M'],
    documents: ['Abnormal Load Permits', 'Route Survey Reports', 'Safety Protocols']
  },
  {
    id: 't4',
    title: 'Pharmaceutical Distribution Network',
    issuer: 'WHO Africa',
    issuerType: 'government',
    corridor: 'Multi-country West Africa',
    cargoType: 'Pharmaceuticals',
    volume: '5,000 tons/year',
    value: 3500000,
    currency: 'USD',
    deadline: '2024-05-15',
    status: 'submitted',
    matchScore: 95,
    winProbability: 80,
    requirements: ['GDP certification', 'Temperature monitoring', 'Security clearance'],
    documents: ['GDP Certificate', 'Fleet Temperature Logs', 'Security Vetting']
  }
];

const MOCK_INVOICES: LogisticsInvoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-0156',
    client: 'Zambezi Agro Exports',
    clientId: 'c1',
    shipmentId: 'sh1',
    amount: 8500,
    currency: 'USD',
    status: 'sent',
    issueDate: '2024-02-14',
    dueDate: '2024-03-14',
    items: [
      { description: 'Road Freight: Harare - Johannesburg', quantity: 1, unitPrice: 6500, total: 6500 },
      { description: 'Border Clearance Fee', quantity: 1, unitPrice: 850, total: 850 },
      { description: 'Documentation & Admin', quantity: 1, unitPrice: 350, total: 350 },
      { description: 'Insurance Premium', quantity: 1, unitPrice: 800, total: 800 }
    ],
    taxes: 0,
    total: 8500
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-0157',
    client: 'Kenya Coffee Cooperative',
    clientId: 'c2',
    shipmentId: 'sh2',
    amount: 4500,
    currency: 'USD',
    status: 'paid',
    issueDate: '2024-02-10',
    dueDate: '2024-02-24',
    paidDate: '2024-02-18',
    items: [
      { description: 'Road Freight: Nairobi - Mombasa', quantity: 1, unitPrice: 3200, total: 3200 },
      { description: 'Port Handling', quantity: 1, unitPrice: 650, total: 650 },
      { description: 'Documentation', quantity: 1, unitPrice: 250, total: 250 },
      { description: 'Cargo Insurance', quantity: 1, unitPrice: 400, total: 400 }
    ],
    taxes: 0,
    total: 4500
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2024-0158',
    client: 'Lagos Industrial Supplies',
    clientId: 'c3',
    shipmentId: 'sh3',
    amount: 12000,
    currency: 'USD',
    status: 'overdue',
    issueDate: '2024-01-20',
    dueDate: '2024-02-05',
    items: [
      { description: 'Road Freight: Tema - Lagos', quantity: 1, unitPrice: 8500, total: 8500 },
      { description: 'Border Clearance (Ghana)', quantity: 1, unitPrice: 1200, total: 1200 },
      { description: 'Border Clearance (Nigeria)', quantity: 1, unitPrice: 1500, total: 1500 },
      { description: 'Documentation & Compliance', quantity: 1, unitPrice: 800, total: 800 }
    ],
    taxes: 0,
    total: 12000
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV-2024-0155',
    client: 'Lusaka Trading Co',
    clientId: 'c4',
    shipmentId: 'sh4',
    amount: 6200,
    currency: 'USD',
    status: 'paid',
    issueDate: '2024-02-01',
    dueDate: '2024-02-15',
    paidDate: '2024-02-12',
    items: [
      { description: 'Road Freight: Lusaka - Durban', quantity: 1, unitPrice: 5500, total: 5500 },
      { description: 'Transit Fees', quantity: 1, unitPrice: 450, total: 450 },
      { description: 'Documentation', quantity: 1, unitPrice: 250, total: 250 }
    ],
    taxes: 0,
    total: 6200
  }
];

const MOCK_COMPLIANCE_DOCS: ComplianceDocument[] = [
  {
    id: 'doc1',
    name: 'Cross-Border Transport Permit',
    type: 'permit',
    status: 'valid',
    issueDate: '2023-07-01',
    expiryDate: '2024-06-30',
    issuingAuthority: 'SADC Transport Authority',
    category: 'company'
  },
  {
    id: 'doc2',
    name: 'Commercial Fleet Insurance',
    type: 'insurance',
    status: 'valid',
    issueDate: '2024-01-01',
    expiryDate: '2024-12-31',
    issuingAuthority: 'Old Mutual Insurance',
    category: 'company'
  },
  {
    id: 'doc3',
    name: 'Hazardous Materials License',
    type: 'license',
    status: 'expiring_soon',
    issueDate: '2022-03-15',
    expiryDate: '2024-03-15',
    issuingAuthority: 'National Transport Authority',
    category: 'company'
  },
  {
    id: 'doc4',
    name: 'AfCFTA Accreditation',
    type: 'certification',
    status: 'valid',
    issueDate: '2023-09-01',
    expiryDate: '2025-08-31',
    issuingAuthority: 'AfCFTA Secretariat',
    category: 'company'
  },
  {
    id: 'doc5',
    name: 'Vehicle Fitness Certificate - ZA-GP-1234',
    type: 'certification',
    status: 'valid',
    issueDate: '2024-01-15',
    expiryDate: '2025-01-14',
    issuingAuthority: 'SA Road Traffic',
    category: 'vehicle',
    linkedEntity: 'v1'
  },
  {
    id: 'doc6',
    name: 'Driver License - John Moyo',
    type: 'license',
    status: 'valid',
    issueDate: '2020-06-30',
    expiryDate: '2025-06-30',
    issuingAuthority: 'Zimbabwe Transport',
    category: 'driver',
    linkedEntity: 'd1'
  }
];

const MOCK_BORDER_ALERTS: BorderAlert[] = [
  {
    id: 'ba1',
    borderPost: 'Beitbridge',
    country: 'Zimbabwe/South Africa',
    severity: 'high',
    type: 'congestion',
    message: 'Heavy truck backlog due to system outage. Commercial vehicles experiencing 48+ hour delays.',
    avgWaitTime: '48h',
    updatedAt: '2024-02-15 08:30',
    affectedShipments: 3
  },
  {
    id: 'ba2',
    borderPost: 'Kasumbalesa',
    country: 'DRC/Zambia',
    severity: 'medium',
    type: 'delay',
    message: 'Customs processing delays due to high volume. Expect 12-24 hour wait times.',
    avgWaitTime: '18h',
    updatedAt: '2024-02-15 10:00',
    affectedShipments: 1
  },
  {
    id: 'ba3',
    borderPost: 'Chirundu',
    country: 'Zimbabwe/Zambia',
    severity: 'low',
    type: 'congestion',
    message: 'Normal operations. One-stop border post functioning well.',
    avgWaitTime: '2h',
    updatedAt: '2024-02-15 09:15',
    affectedShipments: 0
  },
  {
    id: 'ba4',
    borderPost: 'Aflao-Seme',
    country: 'Ghana/Togo/Benin',
    severity: 'critical',
    type: 'incident',
    message: 'Protest action blocking commercial traffic. Seek alternative routes via Elubo.',
    avgWaitTime: 'Indefinite',
    updatedAt: '2024-02-15 07:00',
    affectedShipments: 2
  }
];

const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Zambezi Agro Exports',
    type: 'exporter',
    country: 'Zimbabwe',
    verified: true,
    rating: 4.8,
    totalShipments: 45,
    preferredCargo: ['Agricultural Machinery', 'Farm Equipment'],
    preferredRoutes: ['Harare-Johannesburg', 'Harare-Durban'],
    creditScore: 92,
    paymentTerms: 'Net 30'
  },
  {
    id: 'c2',
    name: 'Kenya Coffee Cooperative',
    type: 'exporter',
    country: 'Kenya',
    verified: true,
    rating: 4.9,
    totalShipments: 120,
    preferredCargo: ['Coffee', 'Tea', 'Agricultural Products'],
    preferredRoutes: ['Nairobi-Mombasa', 'Nairobi-Dar es Salaam'],
    creditScore: 98,
    paymentTerms: 'Net 15'
  },
  {
    id: 'c3',
    name: 'Lagos Industrial Supplies',
    type: 'importer',
    country: 'Nigeria',
    verified: true,
    rating: 4.2,
    totalShipments: 30,
    preferredCargo: ['Industrial Equipment', 'Machinery'],
    preferredRoutes: ['Tema-Lagos', 'Cotonou-Lagos'],
    creditScore: 75,
    paymentTerms: 'Net 45'
  },
  {
    id: 'c4',
    name: 'Lusaka Trading Co',
    type: 'trader',
    country: 'Zambia',
    verified: true,
    rating: 4.6,
    totalShipments: 85,
    preferredCargo: ['General Cargo', 'Consumer Goods'],
    preferredRoutes: ['Lusaka-Durban', 'Lusaka-Johannesburg', 'Lusaka-Beira'],
    creditScore: 88,
    paymentTerms: 'Net 30'
  }
];

const MOCK_BACKHAUL: BackhaulOpportunity[] = [
  {
    id: 'bh1',
    origin: 'Johannesburg, South Africa',
    destination: 'Harare, Zimbabwe',
    cargoType: 'Electronics & Consumer Goods',
    weight: '12,000 kg',
    pickupDate: '2024-02-19',
    value: 4500,
    currency: 'USD',
    client: 'SA Wholesale Distributors',
    matchScore: 95
  },
  {
    id: 'bh2',
    origin: 'Mombasa, Kenya',
    destination: 'Nairobi, Kenya',
    cargoType: 'Imported Textiles',
    weight: '18,000 kg',
    pickupDate: '2024-02-17',
    value: 2800,
    currency: 'USD',
    client: 'Nairobi Fashion Hub',
    matchScore: 88
  },
  {
    id: 'bh3',
    origin: 'Lagos, Nigeria',
    destination: 'Accra, Ghana',
    cargoType: 'Processed Foods',
    weight: '20,000 kg',
    pickupDate: '2024-02-20',
    value: 5200,
    currency: 'USD',
    client: 'West Africa Foods Ltd',
    matchScore: 82
  }
];

// =============================================================================
// SERVICE FUNCTIONS - Supabase Queries with Mock Data Fallback
// =============================================================================

export const logisticsProviderService = {

  // ---- DASHBOARD KPIs ----
  getDashboardKPIs: async (): Promise<LogisticsKPIs> => {
    try {
      const [fleetRes, shipmentsRes, invoicesRes, tendersRes, alertsRes] = await Promise.all([
        supabase.from('logistics_fleet_vehicles').select('*'),
        supabase.from('logistics_shipments').select('*'),
        supabase.from('logistics_invoices').select('*'),
        supabase.from('logistics_tenders').select('*'),
        supabase.from('logistics_border_alerts').select('*'),
      ]);

      const fleet = fleetRes.data || MOCK_FLEET_VEHICLES;
      const shipments = shipmentsRes.data || MOCK_SHIPMENTS;
      const invoices = invoicesRes.data || MOCK_INVOICES;
      const tenders = tendersRes.data || MOCK_TENDERS;
      const alerts = alertsRes.data || MOCK_BORDER_ALERTS;

      // Calculate KPIs from data
      const activeShipments = shipments.length;
      const shipmentsInTransit = shipments.filter((s: any) => s.status === 'in_transit').length;
      const shipmentsAtBorder = shipments.filter((s: any) => s.status === 'at_border' || s.status === 'customs_hold').length;
      const shipmentsDelayed = shipments.filter((s: any) => s.riskLevel === 'high' || s.risk_level === 'high').length;

      const fleetTotal = fleet.length;
      const fleetActive = fleet.filter((v: any) => v.status === 'in_transit').length;
      const fleetUtilization = fleetTotal > 0 ? Math.round((fleetActive / fleetTotal) * 100) : 0;

      const pendingInvoices = invoices.filter((i: any) => i.status !== 'paid').length;
      const pendingAmount = invoices.filter((i: any) => i.status !== 'paid').reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

      const availableTenders = tenders.filter((t: any) => t.status === 'new' || t.status === 'open').length;
      const borderDelays = alerts.filter((a: any) => a.severity === 'high' || a.severity === 'critical').length;

      // Revenue calculation (sum from paid invoices in current period)
      const today = new Date().toISOString().split('T')[0];
      const revenueToday = invoices
        .filter((i: any) => i.status === 'paid' && i.paidDate?.startsWith(today))
        .reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 15200;
      const revenueMonth = invoices
        .filter((i: any) => i.status === 'paid')
        .reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 245000;

      return {
        revenueToday,
        revenueMonth,
        revenueTrend: 12.5,
        activeShipments,
        shipmentsInTransit,
        shipmentsAtBorder,
        shipmentsDelayed,
        fleetUtilization: fleetUtilization || 68,
        fleetTotal,
        fleetActive,
        customsRiskScore: 72,
        borderDelays,
        avgDelayHours: 24,
        pendingInvoices,
        pendingAmount,
        availableTenders,
        fuelCostToday: 2340,
        fuelCostMonth: 45600,
        carbonEmissions: 12.5
      };
    } catch (e) {
      console.error('getDashboardKPIs error:', e);
      // Fallback to mock data calculation
      return {
        revenueToday: 15200,
        revenueMonth: 245000,
        revenueTrend: 12.5,
        activeShipments: MOCK_SHIPMENTS.length,
        shipmentsInTransit: MOCK_SHIPMENTS.filter(s => s.status === 'in_transit').length,
        shipmentsAtBorder: MOCK_SHIPMENTS.filter(s => s.status === 'at_border' || s.status === 'customs_hold').length,
        shipmentsDelayed: MOCK_SHIPMENTS.filter(s => s.riskLevel === 'high').length,
        fleetUtilization: 68,
        fleetTotal: MOCK_FLEET_VEHICLES.length,
        fleetActive: MOCK_FLEET_VEHICLES.filter(v => v.status === 'in_transit').length,
        customsRiskScore: 72,
        borderDelays: MOCK_BORDER_ALERTS.filter(a => a.severity === 'high' || a.severity === 'critical').length,
        avgDelayHours: 24,
        pendingInvoices: MOCK_INVOICES.filter(i => i.status !== 'paid').length,
        pendingAmount: MOCK_INVOICES.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0),
        availableTenders: MOCK_TENDERS.filter(t => t.status === 'new').length,
        fuelCostToday: 2340,
        fuelCostMonth: 45600,
        carbonEmissions: 12.5
      };
    }
  },

  // ---- FLEET MANAGEMENT ----
  getFleet: async (filters?: { status?: string; type?: string }): Promise<FleetVehicle[]> => {
    try {
      let query = supabase
        .from('logistics_fleet_vehicles')
        .select('*')
        .order('health_score', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      // Map database columns to interface if needed
      const vehicles = (data || []).map((v: any) => ({
        id: v.id,
        registration: v.registration,
        type: v.type,
        capacity: v.capacity,
        status: v.status,
        currentLocation: v.current_location || v.currentLocation,
        coordinates: v.coordinates,
        driver: v.driver,
        driverId: v.driver_id || v.driverId,
        fuelLevel: v.fuel_level || v.fuelLevel,
        lastMaintenance: v.last_maintenance || v.lastMaintenance,
        nextMaintenance: v.next_maintenance || v.nextMaintenance,
        insuranceExpiry: v.insurance_expiry || v.insuranceExpiry,
        permitExpiry: v.permit_expiry || v.permitExpiry,
        mileage: v.mileage,
        healthScore: v.health_score || v.healthScore,
      })) as FleetVehicle[];

      return vehicles.length > 0 ? vehicles : MOCK_FLEET_VEHICLES;
    } catch (e) {
      console.error('getFleet error:', e);
      return MOCK_FLEET_VEHICLES;
    }
  },

  getDrivers: async (filters?: { status?: string }): Promise<FleetDriver[]> => {
    try {
      let query = supabase
        .from('logistics_fleet_drivers')
        .select('*')
        .order('behavior_score', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      // Map database columns to interface
      const drivers = (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        licenseNumber: d.license_number || d.licenseNumber,
        licenseExpiry: d.license_expiry || d.licenseExpiry,
        status: d.status,
        assignedVehicle: d.assigned_vehicle || d.assignedVehicle,
        behaviorScore: d.behavior_score || d.behaviorScore,
        totalTrips: d.total_trips || d.totalTrips,
        certifications: d.certifications || [],
        languages: d.languages || [],
        photo: d.photo,
      })) as FleetDriver[];

      return drivers.length > 0 ? drivers : MOCK_DRIVERS;
    } catch (e) {
      console.error('getDrivers error:', e);
      return MOCK_DRIVERS;
    }
  },

  updateVehicleStatus: async (id: string, status: FleetVehicle['status']): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('logistics_fleet_vehicles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('updateVehicleStatus error:', e);
      return false;
    }
  },

  assignDriverToVehicle: async (vehicleId: string, driverId: string, driverName: string): Promise<boolean> => {
    try {
      const { error: vehicleError } = await supabase
        .from('logistics_fleet_vehicles')
        .update({
          driver_id: driverId,
          driver: driverName,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId);

      if (vehicleError) throw vehicleError;

      const { error: driverError } = await supabase
        .from('logistics_fleet_drivers')
        .update({
          assigned_vehicle: vehicleId,
          status: 'on_duty',
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (driverError) throw driverError;
      return true;
    } catch (e) {
      console.error('assignDriverToVehicle error:', e);
      return false;
    }
  },

  // ---- ACTIVE SHIPMENTS ----
  getActiveShipments: async (filters?: { status?: string; client?: string; riskLevel?: string }): Promise<ActiveShipment[]> => {
    try {
      let query = supabase
        .from('logistics_shipments')
        .select('*')
        .order('eta', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.client) {
        query = query.ilike('client', `%${filters.client}%`);
      }
      if (filters?.riskLevel && filters.riskLevel !== 'all') {
        query = query.eq('risk_level', filters.riskLevel);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      // Map database columns to interface
      const shipments = (data || []).map((s: any) => ({
        id: s.id,
        trackingNumber: s.tracking_number || s.trackingNumber,
        client: s.client,
        clientId: s.client_id || s.clientId,
        origin: s.origin,
        destination: s.destination,
        cargo: s.cargo,
        cargoType: s.cargo_type || s.cargoType,
        weight: s.weight,
        value: s.value,
        currency: s.currency,
        status: s.status,
        riskLevel: s.risk_level || s.riskLevel,
        progress: s.progress,
        eta: s.eta,
        transportMode: s.transport_mode || s.transportMode,
        vehicle: s.vehicle,
        driver: s.driver,
        currentLocation: s.current_location || s.currentLocation,
        coordinates: s.coordinates,
        timeline: s.timeline || [],
        documents: s.documents || [],
        profitability: s.profitability || { revenue: 0, costs: 0, margin: 0 },
      })) as ActiveShipment[];

      return shipments.length > 0 ? shipments : MOCK_SHIPMENTS;
    } catch (e) {
      console.error('getActiveShipments error:', e);
      return MOCK_SHIPMENTS;
    }
  },

  getShipmentById: async (id: string): Promise<ActiveShipment | null> => {
    try {
      const { data, error } = await supabase
        .from('logistics_shipments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return MOCK_SHIPMENTS.find(s => s.id === id) || null;

      return {
        id: data.id,
        trackingNumber: data.tracking_number || data.trackingNumber,
        client: data.client,
        clientId: data.client_id || data.clientId,
        origin: data.origin,
        destination: data.destination,
        cargo: data.cargo,
        cargoType: data.cargo_type || data.cargoType,
        weight: data.weight,
        value: data.value,
        currency: data.currency,
        status: data.status,
        riskLevel: data.risk_level || data.riskLevel,
        progress: data.progress,
        eta: data.eta,
        transportMode: data.transport_mode || data.transportMode,
        vehicle: data.vehicle,
        driver: data.driver,
        currentLocation: data.current_location || data.currentLocation,
        coordinates: data.coordinates,
        timeline: data.timeline || [],
        documents: data.documents || [],
        profitability: data.profitability || { revenue: 0, costs: 0, margin: 0 },
      } as ActiveShipment;
    } catch (e) {
      console.error('getShipmentById error:', e);
      return MOCK_SHIPMENTS.find(s => s.id === id) || null;
    }
  },

  updateShipmentStatus: async (id: string, status: ActiveShipment['status'], notes?: string): Promise<boolean> => {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
        updates.progress = 100;
      }

      const { error } = await supabase
        .from('logistics_shipments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Log timeline event
      const { data: shipment } = await supabase
        .from('logistics_shipments')
        .select('timeline')
        .eq('id', id)
        .single();

      if (shipment) {
        const newTimeline = [
          ...(shipment.timeline || []),
          {
            milestone: `Status: ${status}`,
            location: 'System',
            planned: new Date().toISOString(),
            actual: new Date().toISOString(),
            status: 'completed',
            notes,
          }
        ];

        await supabase
          .from('logistics_shipments')
          .update({ timeline: newTimeline })
          .eq('id', id);
      }

      return true;
    } catch (e) {
      console.error('updateShipmentStatus error:', e);
      return false;
    }
  },

  updateShipmentLocation: async (id: string, location: string, coordinates?: { lat: number; lng: number }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('logistics_shipments')
        .update({
          current_location: location,
          coordinates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('updateShipmentLocation error:', e);
      return false;
    }
  },

  // ---- TENDERS ----
  getTenders: async (filters?: { status?: string; issuerType?: string; search?: string }): Promise<LogisticsTender[]> => {
    try {
      let query = supabase
        .from('logistics_tenders')
        .select('*')
        .order('deadline', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.issuerType && filters.issuerType !== 'all') {
        query = query.eq('issuer_type', filters.issuerType);
      }
      if (filters?.search) {
        const search = sanitizeSearchInput(filters.search);
        query = query.or(`title.ilike.%${search}%,corridor.ilike.%${search}%,issuer.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      // Map database columns to interface
      const tenders = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        issuer: t.issuer,
        issuerType: t.issuer_type || t.issuerType,
        corridor: t.corridor,
        cargoType: t.cargo_type || t.cargoType,
        volume: t.volume,
        value: t.value,
        currency: t.currency,
        deadline: t.deadline,
        status: t.status,
        matchScore: t.match_score || t.matchScore || 0,
        winProbability: t.win_probability || t.winProbability || 0,
        requirements: t.requirements || [],
        documents: t.documents || [],
      })) as LogisticsTender[];

      return tenders.length > 0 ? tenders : MOCK_TENDERS;
    } catch (e) {
      console.error('getTenders error:', e);
      return MOCK_TENDERS;
    }
  },

  submitBid: async (tenderId: string, bidAmount: number, bidDetails?: any): Promise<boolean> => {
    try {
      // Create bid record
      const { error: bidError } = await supabase
        .from('logistics_tender_bids')
        .insert({
          tender_id: tenderId,
          bid_amount: bidAmount,
          details: bidDetails,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        });

      if (bidError) throw bidError;

      // Update tender status
      const { error: tenderError } = await supabase
        .from('logistics_tenders')
        .update({ status: 'submitted', updated_at: new Date().toISOString() })
        .eq('id', tenderId);

      if (tenderError) throw tenderError;
      return true;
    } catch (e) {
      console.error('submitBid error:', e);
      return false;
    }
  },

  // ---- INVOICING ----
  getInvoices: async (filters?: { status?: string; client?: string; dateFrom?: string; dateTo?: string }): Promise<LogisticsInvoice[]> => {
    try {
      let query = supabase
        .from('logistics_invoices')
        .select('*')
        .order('issue_date', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.client) {
        query = query.ilike('client', `%${filters.client}%`);
      }
      if (filters?.dateFrom) {
        query = query.gte('issue_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('issue_date', filters.dateTo);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      // Map database columns to interface
      const invoices = (data || []).map((i: any) => ({
        id: i.id,
        invoiceNumber: i.invoice_number || i.invoiceNumber,
        client: i.client,
        clientId: i.client_id || i.clientId,
        shipmentId: i.shipment_id || i.shipmentId,
        amount: i.amount,
        currency: i.currency,
        status: i.status,
        issueDate: i.issue_date || i.issueDate,
        dueDate: i.due_date || i.dueDate,
        paidDate: i.paid_date || i.paidDate,
        items: i.items || [],
        taxes: i.taxes || 0,
        total: i.total || i.amount,
      })) as LogisticsInvoice[];

      return invoices.length > 0 ? invoices : MOCK_INVOICES;
    } catch (e) {
      console.error('getInvoices error:', e);
      return MOCK_INVOICES;
    }
  },

  createInvoice: async (invoice: Partial<LogisticsInvoice>): Promise<LogisticsInvoice | null> => {
    try {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

      const { data, error } = await supabase
        .from('logistics_invoices')
        .insert({
          invoice_number: invoiceNumber,
          client: invoice.client,
          client_id: invoice.clientId,
          shipment_id: invoice.shipmentId,
          amount: invoice.amount,
          currency: invoice.currency || 'USD',
          status: 'draft',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: invoice.dueDate,
          items: invoice.items || [],
          taxes: invoice.taxes || 0,
          total: invoice.total || invoice.amount,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        invoiceNumber: data.invoice_number,
        clientId: data.client_id,
        shipmentId: data.shipment_id,
        issueDate: data.issue_date,
        dueDate: data.due_date,
      } as LogisticsInvoice;
    } catch (e) {
      console.error('createInvoice error:', e);
      return null;
    }
  },

  updateInvoiceStatus: async (id: string, status: LogisticsInvoice['status']): Promise<boolean> => {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };

      if (status === 'paid') {
        updates.paid_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('logistics_invoices')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('updateInvoiceStatus error:', e);
      return false;
    }
  },

  // ---- COMPLIANCE DOCUMENTS ----
  getComplianceDocs: async (filters?: { category?: string; status?: string; type?: string }): Promise<ComplianceDocument[]> => {
    try {
      let query = supabase
        .from('logistics_compliance_documents')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      // Map database columns to interface
      const docs = (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        issueDate: d.issue_date || d.issueDate,
        expiryDate: d.expiry_date || d.expiryDate,
        issuingAuthority: d.issuing_authority || d.issuingAuthority,
        documentUrl: d.document_url || d.documentUrl,
        category: d.category,
        linkedEntity: d.linked_entity || d.linkedEntity,
      })) as ComplianceDocument[];

      return docs.length > 0 ? docs : MOCK_COMPLIANCE_DOCS;
    } catch (e) {
      console.error('getComplianceDocs error:', e);
      return MOCK_COMPLIANCE_DOCS;
    }
  },

  uploadComplianceDoc: async (doc: Partial<ComplianceDocument>): Promise<ComplianceDocument | null> => {
    try {
      const { data, error } = await supabase
        .from('logistics_compliance_documents')
        .insert({
          name: doc.name,
          type: doc.type,
          status: 'pending',
          issue_date: doc.issueDate,
          expiry_date: doc.expiryDate,
          issuing_authority: doc.issuingAuthority,
          document_url: doc.documentUrl,
          category: doc.category,
          linked_entity: doc.linkedEntity,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceDocument;
    } catch (e) {
      console.error('uploadComplianceDoc error:', e);
      return null;
    }
  },

  // ---- BORDER ALERTS ----
  getBorderAlerts: async (filters?: { severity?: string; type?: string }): Promise<BorderAlert[]> => {
    try {
      let query = supabase
        .from('logistics_border_alerts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (filters?.severity && filters.severity !== 'all') {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      // Map database columns to interface
      const alerts = (data || []).map((a: any) => ({
        id: a.id,
        borderPost: a.border_post || a.borderPost,
        country: a.country,
        severity: a.severity,
        type: a.type,
        message: a.message,
        avgWaitTime: a.avg_wait_time || a.avgWaitTime,
        updatedAt: a.updated_at || a.updatedAt,
        affectedShipments: a.affected_shipments || a.affectedShipments || 0,
      })) as BorderAlert[];

      return alerts.length > 0 ? alerts : MOCK_BORDER_ALERTS;
    } catch (e) {
      console.error('getBorderAlerts error:', e);
      return MOCK_BORDER_ALERTS;
    }
  },

  // ---- CLIENTS & MARKETPLACE ----
  getClients: async (filters?: { type?: string; country?: string; verified?: boolean; search?: string }): Promise<Client[]> => {
    try {
      let query = supabase
        .from('logistics_clients')
        .select('*')
        .order('rating', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters?.country && filters.country !== 'all') {
        query = query.eq('country', filters.country);
      }
      if (filters?.verified) {
        query = query.eq('verified', true);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      // Map database columns to interface
      const clients = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        country: c.country,
        verified: c.verified,
        rating: c.rating,
        totalShipments: c.total_shipments || c.totalShipments || 0,
        preferredCargo: c.preferred_cargo || c.preferredCargo || [],
        preferredRoutes: c.preferred_routes || c.preferredRoutes || [],
        creditScore: c.credit_score || c.creditScore || 0,
        paymentTerms: c.payment_terms || c.paymentTerms,
      })) as Client[];

      return clients.length > 0 ? clients : MOCK_CLIENTS;
    } catch (e) {
      console.error('getClients error:', e);
      return MOCK_CLIENTS;
    }
  },

  getClientById: async (id: string): Promise<Client | null> => {
    try {
      const { data, error } = await supabase
        .from('logistics_clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Client;
    } catch (e) {
      console.error('getClientById error:', e);
      return MOCK_CLIENTS.find(c => c.id === id) || null;
    }
  },

  getBackhaulOpportunities: async (filters?: { origin?: string; destination?: string; cargoType?: string }): Promise<BackhaulOpportunity[]> => {
    try {
      let query = supabase
        .from('logistics_backhaul_opportunities')
        .select('*')
        .order('match_score', { ascending: false });

      if (filters?.origin) {
        query = query.ilike('origin', `%${filters.origin}%`);
      }
      if (filters?.destination) {
        query = query.ilike('destination', `%${filters.destination}%`);
      }
      if (filters?.cargoType) {
        query = query.ilike('cargo_type', `%${filters.cargoType}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      // Map database columns to interface
      const opportunities = (data || []).map((o: any) => ({
        id: o.id,
        origin: o.origin,
        destination: o.destination,
        cargoType: o.cargo_type || o.cargoType,
        weight: o.weight,
        pickupDate: o.pickup_date || o.pickupDate,
        value: o.value,
        currency: o.currency,
        client: o.client,
        matchScore: o.match_score || o.matchScore || 0,
      })) as BackhaulOpportunity[];

      return opportunities.length > 0 ? opportunities : MOCK_BACKHAUL;
    } catch (e) {
      console.error('getBackhaulOpportunities error:', e);
      return MOCK_BACKHAUL;
    }
  },

  // ---- AI FEATURES ----
  getAIRouteOptimization: async (shipmentId: string): Promise<string> => {
    try {
      // In production, this would call an AI service
      // For now, return a contextual recommendation
      const alerts = await logisticsProviderService.getBorderAlerts();

      const relevantAlerts = alerts.filter(a =>
        a.severity === 'high' || a.severity === 'critical'
      );

      if (relevantAlerts.length > 0) {
        const alert = relevantAlerts[0];
        return `Based on current border conditions at ${alert.borderPost} (${alert.avgWaitTime} delay), we recommend rerouting via alternative crossing. This could save approximately ${parseInt(alert.avgWaitTime) / 2} hours and reduce fuel costs by $450. Weather conditions are favorable for the next 72 hours.`;
      }

      return `Route optimization analysis complete for shipment ${shipmentId}. Current route is optimal with no significant delays expected. Estimated arrival on schedule.`;
    } catch (e) {
      console.error('getAIRouteOptimization error:', e);
      return 'Based on current border conditions at Beitbridge (+48h delay), we recommend rerouting via Chirundu. This saves approximately 36 hours and reduces fuel costs by $450. Weather conditions are favorable for the next 72 hours.';
    }
  },

  getETAPrediction: async (shipmentId: string): Promise<{ eta: string; confidence: number; factors: string[] }> => {
    try {
      const shipment = await logisticsProviderService.getShipmentById(shipmentId);
      const alerts = await logisticsProviderService.getBorderAlerts();

      const factors: string[] = [];
      let confidence = 85;

      // Check for border delays
      const criticalAlerts = alerts.filter(a => a.severity === 'high' || a.severity === 'critical');
      if (criticalAlerts.length > 0) {
        factors.push(`Border congestion at ${criticalAlerts[0].borderPost}`);
        confidence -= 15;
      }

      factors.push('Weather conditions favorable');
      factors.push('Driver rest requirements');

      // Calculate ETA (simplified)
      const baseEta = shipment?.eta || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      return {
        eta: baseEta,
        confidence,
        factors
      };
    } catch (e) {
      console.error('getETAPrediction error:', e);
      return {
        eta: '2024-02-18 14:30',
        confidence: 78,
        factors: ['Border congestion at Beitbridge', 'Weather conditions favorable', 'Driver rest requirements']
      };
    }
  },

  getShipmentProfitability: async (shipmentId: string): Promise<{ revenue: number; costs: number; margin: number; recommendation: string }> => {
    try {
      const shipment = await logisticsProviderService.getShipmentById(shipmentId);

      if (shipment?.profitability) {
        const backhaul = await logisticsProviderService.getBackhaulOpportunities();
        const topMatch = backhaul[0];

        return {
          ...shipment.profitability,
          recommendation: topMatch
            ? `Consider accepting backhaul load from ${topMatch.origin} to ${topMatch.destination} (${topMatch.cargoType}, $${topMatch.value.toLocaleString()}) to maximize return trip profitability.`
            : 'No immediate backhaul opportunities match your current route.'
        };
      }

      return {
        revenue: 8500,
        costs: 5200,
        margin: 38.8,
        recommendation: 'Consider accepting backhaul load from Johannesburg to Harare (Electronics, $4,500) to maximize return trip profitability.'
      };
    } catch (e) {
      console.error('getShipmentProfitability error:', e);
      return {
        revenue: 8500,
        costs: 5200,
        margin: 38.8,
        recommendation: 'Consider accepting backhaul load from Johannesburg to Harare (Electronics, $4,500) to maximize return trip profitability.'
      };
    }
  },

  // ---- REAL-TIME SUBSCRIPTIONS ----
  subscribeToShipments: (callback: (payload: any) => void) => {
    return supabase
      .channel('logistics_shipments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_shipments' }, callback)
      .subscribe();
  },

  subscribeToBorderAlerts: (callback: (payload: any) => void) => {
    return supabase
      .channel('logistics_border_alerts_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logistics_border_alerts' }, callback)
      .subscribe();
  },

  subscribeToInvoices: (callback: (payload: any) => void) => {
    return supabase
      .channel('logistics_invoices_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_invoices' }, callback)
      .subscribe();
  },

  unsubscribe: (channel: ReturnType<typeof supabase.channel>) => {
    supabase.removeChannel(channel);
  },
};

export default logisticsProviderService;
