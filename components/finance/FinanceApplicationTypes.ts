// Finance Application Types and Interfaces

export interface FinanceApplication {
  id: string;
  applicantName: string;
  companyName: string;
  applicationType: 'letter_of_credit' | 'trade_finance' | 'export_credit' | 'working_capital' | 'invoice_financing';
  amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed';
  submittedDate: string;
  lastUpdated: string;
  assignedOfficer?: string;
  creditScore?: number;
  riskRating?: 'low' | 'medium' | 'high' | 'critical';
  documents: ApplicationDocument[];
  workflowStage: WorkflowStage;
  tradeDetails?: TradeDetails;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: 'invoice' | 'bill_of_lading' | 'certificate_of_origin' | 'insurance' | 'customs_declaration' | 'contract' | 'financial_statement' | 'other';
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadedDate?: string;
  extractedData?: ExtractedDocumentData;
  verificationNotes?: string;
}

export interface ExtractedDocumentData {
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  amount?: number;
  currency?: string;
  parties?: string[];
  hsCode?: string;
  origin?: string;
  destination?: string;
  confidence: number;
  rawText?: string;
}

export interface TradeDetails {
  exporterCountry: string;
  importerCountry: string;
  goodsDescription: string;
  hsCode: string;
  incoterms: string;
  shippingMethod: 'sea' | 'air' | 'road' | 'rail' | 'multimodal';
  estimatedShipmentDate: string;
  portOfLoading?: string;
  portOfDischarge?: string;
}

export interface WorkflowStage {
  currentStage: 'application' | 'document_collection' | 'verification' | 'credit_assessment' | 'approval' | 'disbursement';
  completedStages: string[];
  pendingActions: WorkflowAction[];
  timeline: WorkflowEvent[];
}

export interface WorkflowAction {
  id: string;
  type: 'upload_document' | 'verify_document' | 'credit_check' | 'manager_approval' | 'compliance_review' | 'disbursement';
  description: string;
  assignedTo?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

export interface WorkflowEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

export interface CreditAssessment {
  applicationId: string;
  creditScore: number;
  scoreBreakdown: ScoreComponent[];
  financialRatios: FinancialRatio[];
  riskFactors: RiskFactor[];
  recommendation: 'approve' | 'approve_with_conditions' | 'refer' | 'decline';
  conditions?: string[];
  assessmentDate: string;
  assessedBy: string;
}

export interface ScoreComponent {
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  factors: string[];
}

export interface FinancialRatio {
  name: string;
  value: number;
  benchmark: number;
  status: 'good' | 'acceptable' | 'poor';
}

export interface RiskFactor {
  category: 'country' | 'industry' | 'financial' | 'operational' | 'compliance';
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigants?: string[];
}

export interface ApplicationFormData {
  // Applicant Information
  applicantName: string;
  companyName: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  
  // Application Details
  applicationType: FinanceApplication['applicationType'];
  amount: number;
  currency: string;
  tenor: number;
  purpose: string;
  
  // Trade Details (for trade finance)
  tradeDetails?: Partial<TradeDetails>;
  
  // Supporting Information
  annualRevenue?: number;
  yearsInBusiness?: number;
  existingRelationship?: boolean;
  previousFinancing?: boolean;
}

export type ApplicationTab = 'builder' | 'documents' | 'credit' | 'workflow';

export interface DocumentExtractionResult {
  success: boolean;
  documentType: ApplicationDocument['type'];
  extractedFields: ExtractedDocumentData;
  confidence: number;
  warnings?: string[];
  errors?: string[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  applicationType: FinanceApplication['applicationType'];
  stages: WorkflowTemplateStage[];
}

export interface WorkflowTemplateStage {
  id: string;
  name: string;
  order: number;
  requiredDocuments: ApplicationDocument['type'][];
  requiredApprovals: string[];
  autoActions: string[];
  slaHours: number;
}
