import React, { useState } from 'react';
import {
  Shield,
  Search,
  User,
  Building2,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Eye,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Flag,
  MapPin,
  Calendar,
  Link2,
  ExternalLink,
  Download,
  MoreVertical,
  Zap,
  Users,
  Briefcase,
  CreditCard,
  Activity,
  TrendingUp,
  Scale,
  Fingerprint,
  ScanLine,
  BadgeCheck,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Ban
} from 'lucide-react';

interface KYCProfile {
  id: string;
  entityType: 'individual' | 'company';
  name: string;
  country: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'expired';
  lastReviewDate: string;
  nextReviewDate: string;
  assignedAnalyst?: string;
  completionPercentage: number;
  documents: KYCDocument[];
  verifications: Verification[];
  flags: ComplianceFlag[];
}

interface KYCDocument {
  id: string;
  type: 'passport' | 'national_id' | 'company_registration' | 'tax_certificate' | 'bank_statement' | 'utility_bill' | 'beneficial_ownership' | 'financial_statement';
  name: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  uploadedDate: string;
  expiryDate?: string;
  verifiedBy?: string;
  notes?: string;
}

interface Verification {
  id: string;
  type: 'identity' | 'address' | 'sanctions' | 'pep' | 'adverse_media' | 'beneficial_ownership';
  status: 'pending' | 'passed' | 'failed' | 'review_required';
  lastChecked: string;
  source: string;
  details?: string;
  matchScore?: number;
}

interface ComplianceFlag {
  id: string;
  type: 'sanctions' | 'pep' | 'adverse_media' | 'high_risk_country' | 'unusual_activity' | 'document_issue';
  severity: 'info' | 'warning' | 'critical';
  description: string;
  raisedDate: string;
  resolvedDate?: string;
  resolution?: string;
}

interface AMLAlert {
  id: string;
  entityId: string;
  entityName: string;
  alertType: 'transaction' | 'pattern' | 'sanctions' | 'pep' | 'adverse_media' | 'threshold';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'escalated' | 'resolved' | 'false_positive';
  description: string;
  createdDate: string;
  assignedTo?: string;
  transactionDetails?: TransactionDetail[];
  relatedEntities?: string[];
}

interface TransactionDetail {
  id: string;
  date: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  counterparty: string;
  country: string;
  flagReason?: string;
}

interface BankDueDiligenceProps {
  userRole?: string;
}

const MOCK_KYC_PROFILES: KYCProfile[] = [
  {
    id: 'KYC-001',
    entityType: 'company',
    name: 'Nairobi Coffee Exports Ltd',
    country: 'Kenya',
    riskLevel: 'low',
    status: 'approved',
    lastReviewDate: '2024-01-10',
    nextReviewDate: '2025-01-10',
    assignedAnalyst: 'Sarah Okonkwo',
    completionPercentage: 100,
    documents: [
      { id: 'd1', type: 'company_registration', name: 'Certificate of Incorporation.pdf', status: 'verified', uploadedDate: '2024-01-05', verifiedBy: 'Sarah Okonkwo' },
      { id: 'd2', type: 'tax_certificate', name: 'Tax Compliance Certificate.pdf', status: 'verified', uploadedDate: '2024-01-05', expiryDate: '2024-12-31', verifiedBy: 'Sarah Okonkwo' },
      { id: 'd3', type: 'beneficial_ownership', name: 'UBO Declaration.pdf', status: 'verified', uploadedDate: '2024-01-06', verifiedBy: 'Sarah Okonkwo' }
    ],
    verifications: [
      { id: 'v1', type: 'sanctions', status: 'passed', lastChecked: '2024-01-10', source: 'OFAC, UN, EU Sanctions Lists' },
      { id: 'v2', type: 'pep', status: 'passed', lastChecked: '2024-01-10', source: 'Global PEP Database' },
      { id: 'v3', type: 'adverse_media', status: 'passed', lastChecked: '2024-01-10', source: 'LexisNexis' }
    ],
    flags: []
  },
  {
    id: 'KYC-002',
    entityType: 'individual',
    name: 'Ahmed Hassan',
    country: 'Egypt',
    riskLevel: 'medium',
    status: 'in_progress',
    lastReviewDate: '2024-01-15',
    nextReviewDate: '2024-07-15',
    assignedAnalyst: 'Michael Adeyemi',
    completionPercentage: 65,
    documents: [
      { id: 'd4', type: 'passport', name: 'Passport.pdf', status: 'verified', uploadedDate: '2024-01-12', expiryDate: '2028-05-20', verifiedBy: 'Michael Adeyemi' },
      { id: 'd5', type: 'utility_bill', name: 'Utility Bill.pdf', status: 'pending', uploadedDate: '2024-01-14' },
      { id: 'd6', type: 'bank_statement', name: 'Bank Statement.pdf', status: 'pending', uploadedDate: '2024-01-14' }
    ],
    verifications: [
      { id: 'v4', type: 'identity', status: 'passed', lastChecked: '2024-01-12', source: 'ID Verification API' },
      { id: 'v5', type: 'sanctions', status: 'passed', lastChecked: '2024-01-15', source: 'OFAC, UN, EU Sanctions Lists' },
      { id: 'v6', type: 'pep', status: 'review_required', lastChecked: '2024-01-15', source: 'Global PEP Database', details: 'Potential match found - requires manual review', matchScore: 72 }
    ],
    flags: [
      { id: 'f1', type: 'pep', severity: 'warning', description: 'Potential PEP match detected - family member of government official', raisedDate: '2024-01-15' }
    ]
  },
  {
    id: 'KYC-003',
    entityType: 'company',
    name: 'Lagos Textiles International',
    country: 'Nigeria',
    riskLevel: 'high',
    status: 'pending',
    lastReviewDate: '2023-06-20',
    nextReviewDate: '2024-01-20',
    completionPercentage: 30,
    documents: [
      { id: 'd7', type: 'company_registration', name: 'CAC Certificate.pdf', status: 'expired', uploadedDate: '2023-06-15', expiryDate: '2023-12-31' }
    ],
    verifications: [
      { id: 'v7', type: 'sanctions', status: 'pending', lastChecked: '2023-06-20', source: 'OFAC, UN, EU Sanctions Lists' }
    ],
    flags: [
      { id: 'f2', type: 'document_issue', severity: 'critical', description: 'Company registration document has expired', raisedDate: '2024-01-01' },
      { id: 'f3', type: 'high_risk_country', severity: 'warning', description: 'Entity operates in high-risk jurisdiction', raisedDate: '2023-06-20' }
    ]
  },
  {
    id: 'KYC-004',
    entityType: 'company',
    name: 'Casablanca Trading Co',
    country: 'Morocco',
    riskLevel: 'critical',
    status: 'rejected',
    lastReviewDate: '2024-01-05',
    nextReviewDate: '2024-01-05',
    assignedAnalyst: 'Sarah Okonkwo',
    completionPercentage: 100,
    documents: [],
    verifications: [
      { id: 'v8', type: 'sanctions', status: 'failed', lastChecked: '2024-01-05', source: 'OFAC Sanctions List', details: 'Entity found on OFAC SDN List' }
    ],
    flags: [
      { id: 'f4', type: 'sanctions', severity: 'critical', description: 'Entity appears on OFAC SDN List - immediate action required', raisedDate: '2024-01-05' }
    ]
  }
];

const MOCK_AML_ALERTS: AMLAlert[] = [
  {
    id: 'AML-001',
    entityId: 'KYC-002',
    entityName: 'Ahmed Hassan',
    alertType: 'pattern',
    severity: 'medium',
    status: 'investigating',
    description: 'Unusual transaction pattern detected - multiple high-value transfers to different countries within 24 hours',
    createdDate: '2024-01-16',
    assignedTo: 'Michael Adeyemi',
    transactionDetails: [
      { id: 't1', date: '2024-01-15', amount: 45000, currency: 'USD', type: 'debit', counterparty: 'ABC Trading LLC', country: 'UAE', flagReason: 'High-risk jurisdiction' },
      { id: 't2', date: '2024-01-15', amount: 32000, currency: 'USD', type: 'debit', counterparty: 'XYZ Imports', country: 'Turkey', flagReason: 'Rapid succession' },
      { id: 't3', date: '2024-01-15', amount: 28000, currency: 'USD', type: 'debit', counterparty: 'Global Supplies', country: 'Lebanon', flagReason: 'High-risk jurisdiction' }
    ]
  },
  {
    id: 'AML-002',
    entityId: 'KYC-003',
    entityName: 'Lagos Textiles International',
    alertType: 'threshold',
    severity: 'high',
    status: 'new',
    description: 'Transaction exceeds reporting threshold - $500,000 wire transfer to offshore account',
    createdDate: '2024-01-17',
    transactionDetails: [
      { id: 't4', date: '2024-01-17', amount: 500000, currency: 'USD', type: 'debit', counterparty: 'Cayman Holdings Ltd', country: 'Cayman Islands', flagReason: 'Offshore jurisdiction, threshold exceeded' }
    ]
  },
  {
    id: 'AML-003',
    entityId: 'KYC-004',
    entityName: 'Casablanca Trading Co',
    alertType: 'sanctions',
    severity: 'critical',
    status: 'escalated',
    description: 'Attempted transaction with sanctioned entity - blocked automatically',
    createdDate: '2024-01-05',
    assignedTo: 'Compliance Head',
    relatedEntities: ['OFAC SDN Entity #12345']
  },
  {
    id: 'AML-004',
    entityId: 'KYC-001',
    entityName: 'Nairobi Coffee Exports Ltd',
    alertType: 'adverse_media',
    severity: 'low',
    status: 'resolved',
    description: 'News article mentioning company in context of industry-wide investigation - no direct involvement',
    createdDate: '2024-01-08',
    assignedTo: 'Sarah Okonkwo'
  }
];

export const BankDueDiligence: React.FC<BankDueDiligenceProps> = () => {
  console.log('BankDueDiligence rendering...');
  const [activeView, setActiveView] = useState<'kyc' | 'aml'>('kyc');
  const [kycProfiles, setKycProfiles] = useState<KYCProfile[]>(MOCK_KYC_PROFILES);
  const [amlAlerts, setAmlAlerts] = useState<AMLAlert[]>(MOCK_AML_ALERTS);
  const [selectedProfile, setSelectedProfile] = useState<KYCProfile | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AMLAlert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['documents', 'verifications', 'flags']));
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const toggleAlert = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const kycStats = {
    total: kycProfiles.length,
    approved: kycProfiles.filter(p => p.status === 'approved').length,
    pending: kycProfiles.filter(p => ['pending', 'in_progress'].includes(p.status)).length,
    highRisk: kycProfiles.filter(p => ['high', 'critical'].includes(p.riskLevel)).length
  };

  const amlStats = {
    total: amlAlerts.length,
    new: amlAlerts.filter(a => a.status === 'new').length,
    investigating: amlAlerts.filter(a => a.status === 'investigating').length,
    critical: amlAlerts.filter(a => a.severity === 'critical').length
  };

  const filteredProfiles = kycProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || profile.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || profile.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const filteredAlerts = amlAlerts.filter(alert => {
    const matchesSearch = alert.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getRiskStyle = (risk: KYCProfile['riskLevel']) => {
    const styles = {
      low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };
    return styles[risk];
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
      pending: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Clock },
      in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: RefreshCw },
      approved: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2 },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
      expired: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: AlertCircle },
      verified: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2 },
      uploaded: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock }
    };
    return styles[status] || styles.pending;
  };

  const getAlertSeverityStyle = (severity: AMLAlert['severity']) => {
    const styles = {
      low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };
    return styles[severity];
  };

  const getAlertStatusStyle = (status: AMLAlert['status']) => {
    const styles = {
      new: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      investigating: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
      escalated: { bg: 'bg-red-500/20', text: 'text-red-400' },
      resolved: { bg: 'bg-green-500/20', text: 'text-green-400' },
      false_positive: { bg: 'bg-slate-500/20', text: 'text-slate-400' }
    };
    return styles[status];
  };

  const getVerificationIcon = (type: Verification['type']) => {
    const icons = {
      identity: Fingerprint,
      address: MapPin,
      sanctions: Ban,
      pep: Users,
      adverse_media: FileText,
      beneficial_ownership: Building2
    };
    return icons[type];
  };

  const renderKYCList = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Profiles</p>
              <p className="text-2xl font-bold text-white mt-1">{kycStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{kycStats.approved}</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending Review</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{kycStats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">High Risk</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{kycStats.highRisk}</p>
            </div>
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search profiles..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Risk Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Profiles List */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Entity</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Country</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Risk Level</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Completion</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Next Review</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfiles.map(profile => {
              const riskStyle = getRiskStyle(profile.riskLevel);
              const statusStyle = getStatusStyle(profile.status);
              const StatusIcon = statusStyle.icon;

              return (
                <tr
                  key={profile.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${profile.entityType === 'company' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                        {profile.entityType === 'company' ? (
                          <Building2 className="w-5 h-5 text-blue-400" />
                        ) : (
                          <User className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{profile.name}</p>
                        <p className="text-sm text-slate-400">{profile.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{profile.country}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${riskStyle.bg} ${riskStyle.text}`}>
                      {profile.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <StatusIcon className="w-3 h-3" />
                      {profile.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            profile.completionPercentage === 100 ? 'bg-green-500' :
                            profile.completionPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${profile.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-400">{profile.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400">{profile.nextReviewDate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedProfile(profile);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
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
    </div>
  );

  const renderKYCDetail = () => {
    console.log('renderKYCDetail called, selectedProfile:', selectedProfile);
    if (!selectedProfile) return null;

    // Defensive checks for required arrays
    const documents = selectedProfile.documents || [];
    const verifications = selectedProfile.verifications || [];
    const flags = selectedProfile.flags || [];

    console.log('documents:', documents, 'verifications:', verifications, 'flags:', flags);

    const riskStyle = getRiskStyle(selectedProfile.riskLevel);
    const statusStyle = getStatusStyle(selectedProfile.status);
    console.log('riskStyle:', riskStyle, 'statusStyle:', statusStyle);
    const StatusIcon = statusStyle.icon;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => setSelectedProfile(null)}
              className="text-sm text-slate-400 hover:text-white mb-2 flex items-center gap-1"
            >
              ← Back to Profiles
            </button>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${selectedProfile.entityType === 'company' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                {selectedProfile.entityType === 'company' ? (
                  <Building2 className="w-8 h-8 text-blue-400" />
                ) : (
                  <User className="w-8 h-8 text-purple-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedProfile.name}</h2>
                <p className="text-slate-400">{selectedProfile.id} • {selectedProfile.country}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${riskStyle.bg} ${riskStyle.text}`}>
              {selectedProfile.riskLevel.toUpperCase()} RISK
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              <StatusIcon className="w-4 h-4" />
              {selectedProfile.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Completion</p>
            <p className="text-2xl font-bold text-white mt-1">{selectedProfile.completionPercentage}%</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Documents</p>
            <p className="text-2xl font-bold text-white mt-1">{documents.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Last Review</p>
            <p className="text-2xl font-bold text-white mt-1">{selectedProfile.lastReviewDate}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Assigned To</p>
            <p className="text-2xl font-bold text-white mt-1">{selectedProfile.assignedAnalyst || 'Unassigned'}</p>
          </div>
        </div>

        {/* Flags Alert */}
        {flags.length > 0 && (
          <div className={`p-4 rounded-lg border ${
            flags.some(f => f.severity === 'critical') ? 'bg-red-500/10 border-red-500/30' :
            flags.some(f => f.severity === 'warning') ? 'bg-amber-500/10 border-amber-500/30' :
            'bg-blue-500/10 border-blue-500/30'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                flags.some(f => f.severity === 'critical') ? 'text-red-400' :
                flags.some(f => f.severity === 'warning') ? 'text-amber-400' : 'text-blue-400'
              }`} />
              <div>
                <p className="font-medium text-white">{flags.length} Active Flag(s)</p>
                <ul className="mt-2 space-y-1">
                  {flags.map(flag => (
                    <li key={flag.id} className="text-sm text-slate-300">• {flag.description}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="bg-slate-900 rounded-xl border border-slate-700">
          <button
            onClick={() => toggleSection('documents')}
            className="w-full flex items-center justify-between p-4"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Documents ({documents.length})
            </h3>
            {expandedSections.has('documents') ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          {expandedSections.has('documents') && (
            <div className="p-4 pt-0 space-y-3">
              {documents.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No documents uploaded</p>
              ) : (
                documents.map(doc => {
                  const docStatusStyle = getStatusStyle(doc.status as KYCProfile['status']);
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-white">{doc.name}</p>
                          <p className="text-xs text-slate-400">
                            {doc.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {doc.expiryDate && ` • Expires: ${doc.expiryDate}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${docStatusStyle.bg} ${docStatusStyle.text}`}>
                          {doc.status.replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Verifications Section */}
        <div className="bg-slate-900 rounded-xl border border-slate-700">
          <button
            onClick={() => toggleSection('verifications')}
            className="w-full flex items-center justify-between p-4"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-purple-400" />
              Verifications ({verifications.length})
            </h3>
            {expandedSections.has('verifications') ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          {expandedSections.has('verifications') && (
            <div className="p-4 pt-0 space-y-3">
              {verifications.map(verification => {
                const VerificationIcon = getVerificationIcon(verification.type);
                const verificationStatusColors = {
                  pending: 'text-slate-400 bg-slate-500/20',
                  passed: 'text-green-400 bg-green-500/20',
                  failed: 'text-red-400 bg-red-500/20',
                  review_required: 'text-amber-400 bg-amber-500/20'
                };

                return (
                  <div key={verification.id} className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <VerificationIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">{verification.type.replace(/_/g, ' ')} Check</p>
                          <p className="text-sm text-slate-400">Source: {verification.source}</p>
                          {verification.details && (
                            <p className="text-sm text-amber-400 mt-1">{verification.details}</p>
                          )}
                          {verification.matchScore && (
                            <p className="text-sm text-slate-400 mt-1">Match Score: {verification.matchScore}%</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${verificationStatusColors[verification.status]}`}>
                          {verification.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
            Request Documents
          </button>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors">
            Run All Checks
          </button>
          {selectedProfile.status !== 'approved' && selectedProfile.status !== 'rejected' && (
            <>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
                Reject
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderAMLList = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Alerts</p>
              <p className="text-2xl font-bold text-white mt-1">{amlStats.total}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">New Alerts</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{amlStats.new}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Investigating</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{amlStats.investigating}</p>
            </div>
            <Search className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Critical</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{amlStats.critical}</p>
            </div>
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="investigating">Investigating</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
          <option value="false_positive">False Positive</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => {
          const severityStyle = getAlertSeverityStyle(alert.severity);
          const alertStatusStyle = getAlertStatusStyle(alert.status);

          return (
            <div
              key={alert.id}
              className={`bg-slate-900 rounded-xl border ${severityStyle.border} p-4 cursor-pointer hover:bg-slate-800/50 transition-colors`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${severityStyle.bg}`}>
                    <AlertTriangle className={`w-6 h-6 ${severityStyle.text}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-white font-medium">{alert.id}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityStyle.bg} ${severityStyle.text}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${alertStatusStyle.bg} ${alertStatusStyle.text}`}>
                        {alert.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1">{alert.entityName}</p>
                    <p className="text-sm text-slate-400 mt-2">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {alert.createdDate}
                      </span>
                      <span className="capitalize">{alert.alertType.replace(/_/g, ' ')}</span>
                      {alert.assignedTo && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {alert.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAlert(alert.id);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {expandedAlerts.has(alert.id) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {expandedAlerts.has(alert.id) && alert.transactionDetails && alert.transactionDetails.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Related Transactions:</p>
                  <div className="space-y-2">
                    {alert.transactionDetails.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${tx.type === 'credit' ? 'bg-green-400' : 'bg-red-400'}`} />
                          <span className="text-sm text-white">{tx.counterparty}</span>
                          <span className="text-xs text-slate-500">{tx.country}</span>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.type === 'credit' ? '+' : '-'}{tx.currency} {tx.amount.toLocaleString()}
                          </p>
                          {tx.flagReason && (
                            <p className="text-xs text-amber-400">{tx.flagReason}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            Due Diligence
          </h1>
          <p className="text-slate-400 mt-2">
            KYC verification and AML screening for trade finance compliance
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => {
              setActiveView('kyc');
              setSelectedProfile(null);
              setSelectedAlert(null);
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'kyc' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <BadgeCheck className="w-4 h-4" />
            KYC Review
          </button>
          <button
            onClick={() => {
              setActiveView('aml');
              setSelectedProfile(null);
              setSelectedAlert(null);
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'aml' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            AML Screening
          </button>
        </div>

        {/* Content */}
        {activeView === 'kyc' ? (
          selectedProfile ? renderKYCDetail() : renderKYCList()
        ) : (
          renderAMLList()
        )}
      </div>
    </div>
  );
};

export default BankDueDiligence;
