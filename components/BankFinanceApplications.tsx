import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  BarChart3,
  GitBranch,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  MoreVertical,
  Building2,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { ApplicationBuilder } from './finance/ApplicationBuilder';
import { DocumentExtraction } from './finance/DocumentExtraction';
import { CreditScoring } from './finance/CreditScoring';
import { WorkflowAutomation } from './finance/WorkflowAutomation';
import {
  FinanceApplication,
  ApplicationFormData,
  ApplicationDocument,
  CreditAssessment,
  WorkflowStage,
  WorkflowTemplate,
  WorkflowAction,
  ApplicationTab,
  DocumentExtractionResult
} from './finance/FinanceApplicationTypes';

interface BankFinanceApplicationsProps {
  userRole?: string;
}

const MOCK_APPLICATIONS: FinanceApplication[] = [
  {
    id: 'APP-2024-001',
    applicantName: 'John Mwangi',
    companyName: 'Nairobi Coffee Exports Ltd',
    applicationType: 'letter_of_credit',
    amount: 250000,
    currency: 'USD',
    status: 'under_review',
    submittedDate: '2024-01-15',
    lastUpdated: '2024-01-18',
    assignedOfficer: 'Sarah Okonkwo',
    creditScore: 745,
    riskRating: 'low',
    documents: [
      { id: 'd1', name: 'Commercial Invoice.pdf', type: 'invoice', status: 'verified', uploadedDate: '2024-01-15', extractedData: { confidence: 0.95, documentNumber: 'INV-2024-001', amount: 250000, currency: 'USD' } },
      { id: 'd2', name: 'Bill of Lading.pdf', type: 'bill_of_lading', status: 'uploaded', uploadedDate: '2024-01-16' },
      { id: 'd3', name: 'Certificate of Origin.pdf', type: 'certificate_of_origin', status: 'pending' }
    ],
    workflowStage: {
      currentStage: 'verification',
      completedStages: ['application', 'document_collection'],
      pendingActions: [
        { id: 'a1', type: 'verify_document', description: 'Verify Bill of Lading authenticity', assignedTo: 'Sarah Okonkwo', status: 'in_progress', dueDate: '2024-01-20' },
        { id: 'a2', type: 'credit_check', description: 'Complete credit assessment', status: 'pending' }
      ],
      timeline: [
        { id: 't1', timestamp: '2024-01-15T10:30:00Z', action: 'Application submitted', actor: 'John Mwangi' },
        { id: 't2', timestamp: '2024-01-15T14:00:00Z', action: 'Application assigned', actor: 'System', details: 'Assigned to Sarah Okonkwo' },
        { id: 't3', timestamp: '2024-01-16T09:15:00Z', action: 'Documents uploaded', actor: 'John Mwangi', details: '3 documents uploaded' }
      ]
    },
    tradeDetails: {
      exporterCountry: 'Kenya',
      importerCountry: 'Germany',
      goodsDescription: 'Premium Arabica Coffee Beans',
      hsCode: '0901.11',
      incoterms: 'FOB',
      shippingMethod: 'sea',
      estimatedShipmentDate: '2024-02-15',
      portOfLoading: 'Mombasa',
      portOfDischarge: 'Hamburg'
    }
  },
  {
    id: 'APP-2024-002',
    applicantName: 'Amina Hassan',
    companyName: 'Lagos Textiles International',
    applicationType: 'trade_finance',
    amount: 500000,
    currency: 'USD',
    status: 'approved',
    submittedDate: '2024-01-10',
    lastUpdated: '2024-01-17',
    assignedOfficer: 'Michael Adeyemi',
    creditScore: 820,
    riskRating: 'low',
    documents: [
      { id: 'd4', name: 'Sales Contract.pdf', type: 'contract', status: 'verified', uploadedDate: '2024-01-10', extractedData: { confidence: 0.92 } },
      { id: 'd5', name: 'Financial Statements.pdf', type: 'financial_statement', status: 'verified', uploadedDate: '2024-01-10', extractedData: { confidence: 0.88 } }
    ],
    workflowStage: {
      currentStage: 'disbursement',
      completedStages: ['application', 'document_collection', 'verification', 'credit_assessment', 'approval'],
      pendingActions: [
        { id: 'a3', type: 'disbursement', description: 'Process fund disbursement', assignedTo: 'Treasury Dept', status: 'in_progress' }
      ],
      timeline: []
    }
  },
  {
    id: 'APP-2024-003',
    applicantName: 'Pierre Dubois',
    companyName: 'Casablanca Trading Co',
    applicationType: 'export_credit',
    amount: 175000,
    currency: 'EUR',
    status: 'submitted',
    submittedDate: '2024-01-18',
    lastUpdated: '2024-01-18',
    documents: [],
    workflowStage: {
      currentStage: 'application',
      completedStages: [],
      pendingActions: [
        { id: 'a4', type: 'upload_document', description: 'Upload required documents', status: 'pending' }
      ],
      timeline: [
        { id: 't4', timestamp: '2024-01-18T08:00:00Z', action: 'Application submitted', actor: 'Pierre Dubois' }
      ]
    }
  },
  {
    id: 'APP-2024-004',
    applicantName: 'Grace Obi',
    companyName: 'Accra Gold Exports',
    applicationType: 'invoice_financing',
    amount: 85000,
    currency: 'USD',
    status: 'rejected',
    submittedDate: '2024-01-05',
    lastUpdated: '2024-01-12',
    assignedOfficer: 'Sarah Okonkwo',
    creditScore: 480,
    riskRating: 'high',
    documents: [
      { id: 'd6', name: 'Invoice Bundle.pdf', type: 'invoice', status: 'rejected', uploadedDate: '2024-01-05', verificationNotes: 'Inconsistent amounts detected' }
    ],
    workflowStage: {
      currentStage: 'verification',
      completedStages: ['application', 'document_collection'],
      pendingActions: [],
      timeline: []
    }
  }
];

const MOCK_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Standard LC Workflow',
    applicationType: 'letter_of_credit',
    stages: [
      { id: 's1', name: 'Application Review', order: 1, requiredDocuments: ['invoice', 'contract'], requiredApprovals: ['officer'], autoActions: ['notify_applicant'], slaHours: 24 },
      { id: 's2', name: 'Document Collection', order: 2, requiredDocuments: ['bill_of_lading', 'certificate_of_origin', 'insurance'], requiredApprovals: [], autoActions: ['extract_data'], slaHours: 48 },
      { id: 's3', name: 'Verification', order: 3, requiredDocuments: [], requiredApprovals: ['compliance'], autoActions: ['aml_check'], slaHours: 24 },
      { id: 's4', name: 'Credit Assessment', order: 4, requiredDocuments: ['financial_statement'], requiredApprovals: ['credit_officer'], autoActions: ['credit_score'], slaHours: 48 },
      { id: 's5', name: 'Approval', order: 5, requiredDocuments: [], requiredApprovals: ['manager', 'head_of_trade'], autoActions: [], slaHours: 24 },
      { id: 's6', name: 'Disbursement', order: 6, requiredDocuments: [], requiredApprovals: ['treasury'], autoActions: ['process_payment'], slaHours: 4 }
    ]
  },
  {
    id: 'tpl-2',
    name: 'Fast Track Trade Finance',
    applicationType: 'trade_finance',
    stages: [
      { id: 's7', name: 'Quick Review', order: 1, requiredDocuments: ['contract'], requiredApprovals: ['officer'], autoActions: [], slaHours: 12 },
      { id: 's8', name: 'Auto Assessment', order: 2, requiredDocuments: [], requiredApprovals: [], autoActions: ['credit_score', 'aml_check'], slaHours: 4 },
      { id: 's9', name: 'Approval', order: 3, requiredDocuments: [], requiredApprovals: ['manager'], autoActions: [], slaHours: 12 },
      { id: 's10', name: 'Disbursement', order: 4, requiredDocuments: [], requiredApprovals: ['treasury'], autoActions: ['process_payment'], slaHours: 4 }
    ]
  }
];

const MOCK_ASSESSMENT: CreditAssessment = {
  applicationId: 'APP-2024-001',
  creditScore: 745,
  scoreBreakdown: [
    { category: 'Payment History', score: 180, maxScore: 200, weight: 0.35, factors: ['On-time payments', 'No defaults'] },
    { category: 'Credit Utilization', score: 140, maxScore: 150, weight: 0.30, factors: ['Low utilization ratio'] },
    { category: 'Business Stability', score: 120, maxScore: 150, weight: 0.20, factors: ['5+ years in business', 'Stable revenue'] },
    { category: 'Trade Experience', score: 85, maxScore: 100, weight: 0.15, factors: ['Previous LC experience', 'Good track record'] }
  ],
  financialRatios: [
    { name: 'Current Ratio', value: 2.1, benchmark: 1.5, status: 'good' },
    { name: 'Debt-to-Equity', value: 0.8, benchmark: 1.0, status: 'good' },
    { name: 'Interest Coverage', value: 4.2, benchmark: 3.0, status: 'good' },
    { name: 'Quick Ratio', value: 1.4, benchmark: 1.0, status: 'acceptable' }
  ],
  riskFactors: [
    { category: 'country', description: 'Kenya has stable trade relations with EU', severity: 'low', mitigants: ['AfCFTA member', 'Strong export history'] },
    { category: 'industry', description: 'Coffee commodity price volatility', severity: 'medium', mitigants: ['Hedging strategy in place', 'Long-term contracts'] },
    { category: 'financial', description: 'Currency exposure (KES/EUR)', severity: 'low', mitigants: ['Forward contracts available'] }
  ],
  recommendation: 'approve',
  assessmentDate: '2024-01-17',
  assessedBy: 'AI Credit Engine v2.1'
};

export const BankFinanceApplications: React.FC<BankFinanceApplicationsProps> = ({ userRole = 'bank_officer' }) => {
  const [applications, setApplications] = useState<FinanceApplication[]>(MOCK_APPLICATIONS);
  const [selectedApplication, setSelectedApplication] = useState<FinanceApplication | null>(null);
  const [activeTab, setActiveTab] = useState<ApplicationTab>('builder');
  const [showNewApplication, setShowNewApplication] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.applicationType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => ['draft', 'submitted', 'under_review'].includes(a.status)).length,
    approved: applications.filter(a => a.status === 'approved').length,
    disbursed: applications.filter(a => a.status === 'disbursed').length,
    totalValue: applications.reduce((sum, a) => sum + a.amount, 0)
  };

  const getStatusStyle = (status: FinanceApplication['status']) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
      draft: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Edit2 },
      submitted: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock },
      under_review: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Eye },
      approved: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2 },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
      disbursed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: DollarSign }
    };
    return styles[status] || styles.draft;
  };

  const handleSubmitApplication = async (data: ApplicationFormData) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newApp: FinanceApplication = {
      id: `APP-2024-${String(applications.length + 1).padStart(3, '0')}`,
      applicantName: data.applicantName || data.contactPerson,
      companyName: data.companyName,
      applicationType: data.applicationType,
      amount: data.amount,
      currency: data.currency,
      status: 'submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      documents: [],
      workflowStage: {
        currentStage: 'application',
        completedStages: [],
        pendingActions: [
          { id: `a-${Date.now()}`, type: 'upload_document', description: 'Upload required documents', status: 'pending' }
        ],
        timeline: [
          { id: `t-${Date.now()}`, timestamp: new Date().toISOString(), action: 'Application submitted', actor: data.contactPerson }
        ]
      },
      tradeDetails: data.tradeDetails as FinanceApplication['tradeDetails']
    };

    setApplications(prev => [newApp, ...prev]);
    setShowNewApplication(false);
    setSelectedApplication(newApp);
    setActiveTab('documents');
    setIsLoading(false);
  };

  const handleSaveDraft = async (data: ApplicationFormData) => {
    console.log('Saving draft:', data);
  };

  const handleDocumentUpload = async (files: File[], documentType: ApplicationDocument['type']) => {
    if (!selectedApplication) return;
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDocs: ApplicationDocument[] = files.map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      type: documentType,
      status: 'uploaded',
      uploadedDate: new Date().toISOString().split('T')[0]
    }));

    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id
        ? { ...app, documents: [...app.documents, ...newDocs], lastUpdated: new Date().toISOString().split('T')[0] }
        : app
    ));

    setSelectedApplication(prev => prev ? { ...prev, documents: [...prev.documents, ...newDocs] } : null);
  };

  const handleDocumentVerify = async (documentId: string) => {
    if (!selectedApplication) return;
    
    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id
        ? {
            ...app,
            documents: app.documents.map(doc => 
              doc.id === documentId ? { ...doc, status: 'verified' } : doc
            )
          }
        : app
    ));

    setSelectedApplication(prev => prev ? {
      ...prev,
      documents: prev.documents.map(doc => 
        doc.id === documentId ? { ...doc, status: 'verified' } : doc
      )
    } : null);
  };

  const handleDocumentReject = async (documentId: string, reason: string) => {
    if (!selectedApplication) return;
    
    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id
        ? {
            ...app,
            documents: app.documents.map(doc => 
              doc.id === documentId ? { ...doc, status: 'rejected', verificationNotes: reason } : doc
            )
          }
        : app
    ));

    setSelectedApplication(prev => prev ? {
      ...prev,
      documents: prev.documents.map(doc => 
        doc.id === documentId ? { ...doc, status: 'rejected', verificationNotes: reason } : doc
      )
    } : null);
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!selectedApplication) return;
    
    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id
        ? { ...app, documents: app.documents.filter(doc => doc.id !== documentId) }
        : app
    ));

    setSelectedApplication(prev => prev ? {
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    } : null);
  };

  const handleDocumentExtract = async (documentId: string): Promise<DocumentExtractionResult> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result: DocumentExtractionResult = {
      success: true,
      documentType: 'invoice',
      extractedFields: {
        documentNumber: `INV-${Date.now()}`,
        issueDate: new Date().toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 100000) + 10000,
        currency: 'USD',
        confidence: 0.92
      },
      confidence: 0.92
    };

    if (selectedApplication) {
      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id
          ? {
              ...app,
              documents: app.documents.map(doc => 
                doc.id === documentId ? { ...doc, extractedData: result.extractedFields } : doc
              )
            }
          : app
      ));

      setSelectedApplication(prev => prev ? {
        ...prev,
        documents: prev.documents.map(doc => 
          doc.id === documentId ? { ...doc, extractedData: result.extractedFields } : doc
        )
      } : null);
    }

    return result;
  };

  const handleRunAssessment = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
  };

  const handleUpdateAssessment = async (assessment: Partial<CreditAssessment>) => {
    console.log('Updating assessment:', assessment);
  };

  const handleActionComplete = async (actionId: string) => {
    if (!selectedApplication) return;
    
    await new Promise(resolve => setTimeout(resolve, 500));

    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id
        ? {
            ...app,
            workflowStage: {
              ...app.workflowStage,
              pendingActions: app.workflowStage.pendingActions.map(action =>
                action.id === actionId ? { ...action, status: 'completed' } : action
              ),
              timeline: [
                ...app.workflowStage.timeline,
                { id: `t-${Date.now()}`, timestamp: new Date().toISOString(), action: 'Action completed', actor: 'Current User' }
              ]
            }
          }
        : app
    ));
  };

  const handleActionAssign = async (actionId: string, userId: string) => {
    console.log('Assigning action:', actionId, 'to', userId);
  };

  const handleAddAction = async (action: Omit<WorkflowAction, 'id'>) => {
    if (!selectedApplication) return;

    const newAction: WorkflowAction = {
      ...action,
      id: `action-${Date.now()}`
    };

    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id
        ? {
            ...app,
            workflowStage: {
              ...app.workflowStage,
              pendingActions: [...app.workflowStage.pendingActions, newAction]
            }
          }
        : app
    ));

    setSelectedApplication(prev => prev ? {
      ...prev,
      workflowStage: {
        ...prev.workflowStage,
        pendingActions: [...prev.workflowStage.pendingActions, newAction]
      }
    } : null);
  };

  const handleApplyTemplate = async (templateId: string) => {
    console.log('Applying template:', templateId);
  };

  const renderApplicationList = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Applications</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending Review</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Disbursed</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.disbursed}</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Value</p>
              <p className="text-2xl font-bold text-white mt-1">${(stats.totalValue / 1000000).toFixed(2)}M</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search applications..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="disbursed">Disbursed</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="letter_of_credit">Letter of Credit</option>
            <option value="trade_finance">Trade Finance</option>
            <option value="export_credit">Export Credit</option>
            <option value="working_capital">Working Capital</option>
            <option value="invoice_financing">Invoice Financing</option>
          </select>
        </div>

        <button
          onClick={() => setShowNewApplication(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      {/* Applications Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Application ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Company</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Type</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Credit Score</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Submitted</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => {
                const statusStyle = getStatusStyle(app.status);
                const StatusIcon = statusStyle.icon;
                return (
                  <tr
                    key={app.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedApplication(app);
                      setActiveTab('documents');
                    }}
                  >
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{app.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{app.companyName}</p>
                        <p className="text-sm text-slate-400">{app.applicantName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 capitalize">
                        {app.applicationType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {app.currency} {app.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {app.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {app.creditScore ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            app.creditScore >= 700 ? 'text-green-400' :
                            app.creditScore >= 600 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {app.creditScore}
                          </span>
                          {app.riskRating && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              app.riskRating === 'low' ? 'bg-green-500/20 text-green-400' :
                              app.riskRating === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {app.riskRating}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400">{app.submittedDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedApplication(app);
                            setActiveTab('documents');
                          }}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No applications found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderApplicationDetail = () => {
    if (!selectedApplication) return null;

    const statusStyle = getStatusStyle(selectedApplication.status);
    const StatusIcon = statusStyle.icon;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => setSelectedApplication(null)}
              className="text-sm text-slate-400 hover:text-white mb-2 flex items-center gap-1"
            >
              ← Back to Applications
            </button>
            <h2 className="text-2xl font-bold text-white">{selectedApplication.id}</h2>
            <p className="text-slate-400">{selectedApplication.companyName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              <StatusIcon className="w-4 h-4" />
              {selectedApplication.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Application Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Amount</p>
            <p className="text-xl font-bold text-white mt-1">
              {selectedApplication.currency} {selectedApplication.amount.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Type</p>
            <p className="text-xl font-bold text-white mt-1 capitalize">
              {selectedApplication.applicationType.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Credit Score</p>
            <p className={`text-xl font-bold mt-1 ${
              (selectedApplication.creditScore || 0) >= 700 ? 'text-green-400' :
              (selectedApplication.creditScore || 0) >= 600 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {selectedApplication.creditScore || 'Pending'}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Assigned Officer</p>
            <p className="text-xl font-bold text-white mt-1">
              {selectedApplication.assignedOfficer || 'Unassigned'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700">
          <div className="flex gap-1">
            {[
              { id: 'documents', label: 'Documents', icon: Upload },
              { id: 'credit', label: 'Credit Scoring', icon: BarChart3 },
              { id: 'workflow', label: 'Workflow', icon: GitBranch }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ApplicationTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'documents' && (
            <DocumentExtraction
              applicationId={selectedApplication.id}
              documents={selectedApplication.documents}
              onUpload={handleDocumentUpload}
              onVerify={handleDocumentVerify}
              onReject={handleDocumentReject}
              onDelete={handleDocumentDelete}
              onExtract={handleDocumentExtract}
            />
          )}

          {activeTab === 'credit' && (
            <CreditScoring
              applicationId={selectedApplication.id}
              assessment={selectedApplication.creditScore ? MOCK_ASSESSMENT : null}
              onRunAssessment={handleRunAssessment}
              onUpdateAssessment={handleUpdateAssessment}
            />
          )}

          {activeTab === 'workflow' && (
            <WorkflowAutomation
              applicationId={selectedApplication.id}
              workflow={selectedApplication.workflowStage}
              templates={MOCK_TEMPLATES}
              onActionComplete={handleActionComplete}
              onActionAssign={handleActionAssign}
              onAddAction={handleAddAction}
              onApplyTemplate={handleApplyTemplate}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            Finance Applications
          </h1>
          <p className="text-slate-400 mt-2">
            Manage trade finance applications with smart document extraction and automated workflows
          </p>
        </div>

        {/* Main Content */}
        {showNewApplication ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <button
                  onClick={() => setShowNewApplication(false)}
                  className="text-sm text-slate-400 hover:text-white mb-2 flex items-center gap-1"
                >
                  ← Back to Applications
                </button>
                <h2 className="text-2xl font-bold text-white">New Finance Application</h2>
              </div>
            </div>
            <ApplicationBuilder
              onSubmit={handleSubmitApplication}
              onSaveDraft={handleSaveDraft}
            />
          </div>
        ) : selectedApplication ? (
          renderApplicationDetail()
        ) : (
          renderApplicationList()
        )}
      </div>
    </div>
  );
};

export default BankFinanceApplications;
