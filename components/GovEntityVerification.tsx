import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Building,
  Globe,
  FileText,
  Eye,
  ChevronRight,
  Download,
  Fingerprint,
  Key,
  Award,
  Star,
  Lock,
  Zap,
  ArrowUpRight,
  Flag,
  Database,
  Link2,
  BadgeCheck,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { governmentService } from '../services/governmentService';

// Static AML screening lists
const AML_SCREENING = [
  { list: 'UN Sanctions List', matches: 0, lastChecked: '2 min ago', status: 'clear' },
  { list: 'AU Sanctions List', matches: 0, lastChecked: '2 min ago', status: 'clear' },
  { list: 'OFAC SDN List', matches: 0, lastChecked: '5 min ago', status: 'clear' },
  { list: 'EU Sanctions List', matches: 0, lastChecked: '5 min ago', status: 'clear' },
  { list: 'PEP Database', matches: 1, lastChecked: '5 min ago', status: 'review' },
  { list: 'Adverse Media', matches: 2, lastChecked: '10 min ago', status: 'review' },
  { list: 'National Watchlist', matches: 0, lastChecked: '2 min ago', status: 'clear' },
];

const BUSINESS_VALIDATIONS = [
  { field: 'Company Registration', source: 'National Registry', status: 'verified', confidence: 99 },
  { field: 'Tax Identification Number', source: 'Revenue Authority', status: 'verified', confidence: 98 },
  { field: 'Trade License', source: 'Ministry of Trade', status: 'verified', confidence: 95 },
  { field: 'Bank Account', source: 'Central Bank', status: 'pending', confidence: 0 },
  { field: 'Director Identity', source: 'National ID System', status: 'verified', confidence: 97 },
  { field: 'Beneficial Ownership', source: 'BO Registry', status: 'warning', confidence: 72 },
];

const WIZARD_STEPS = [
  { step: 1, title: 'Entity Information', description: 'Basic details & registration', icon: User },
  { step: 2, title: 'Document Upload', description: 'ID, registration, tax documents', icon: Upload },
  { step: 3, title: 'AML/Sanctions Check', description: 'Automated screening', icon: Shield },
  { step: 4, title: 'Verification Review', description: 'Officer review & approval', icon: CheckCircle },
  { step: 5, title: 'Tier Assignment', description: 'Trusted trader classification', icon: Award },
];

const CROSS_COUNTRY_VERIFICATIONS = [
  { id: 'XV-001', entity: 'Trans-Africa Mining', requestedBy: 'Ghana Customs', targetCountry: 'South Africa', status: 'verified', responseTime: '4h' },
  { id: 'XV-002', entity: 'EastWest Traders', requestedBy: 'Kenya Revenue', targetCountry: 'Tanzania', status: 'pending', responseTime: '-' },
  { id: 'XV-003', entity: 'Sahara Freight Co', requestedBy: 'Morocco Customs', targetCountry: 'Senegal', status: 'verified', responseTime: '12h' },
  { id: 'XV-004', entity: 'Lagos Pharma Ltd', requestedBy: 'NAFDAC Nigeria', targetCountry: 'India', status: 'rejected', responseTime: '24h' },
];

type ActiveTab = 'applications' | 'screening' | 'tiers' | 'cross_country';

export const GovEntityVerification: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('applications');
  const [wizardStep, setWizardStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Database-driven state
  const [KYC_APPLICATIONS, setKycApplications] = useState<{id: string; entity: string; type: string; country: string; submittedDate: string; status: string; riskLevel: string; documents: number; completeness: number; assignee: string}[]>([]);
  const [selectedApp, setSelectedApp] = useState<typeof KYC_APPLICATIONS[0] | null>(null);
  const [TRUSTED_TIERS, setTrustedTiers] = useState<{tier: string; label: string; count: number; benefits: string[]; minScore: number; color: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kycRequests, trustedTraders, amlAlerts] = await Promise.all([
          governmentService.getKYCRequests(),
          governmentService.getTrustedTraders(),
          governmentService.getAMLAlerts(),
        ]);

        // KYC Applications from database
        setKycApplications(kycRequests.map((k: Record<string, unknown>, i: number) => {
          const statusMap: Record<string, string> = { not_started: 'pending', documents_pending: 'pending', under_review: 'under_review', approved: 'approved', rejected: 'rejected', expired: 'rejected' };
          const riskScore = (k.risk_score as number) || 0;
          return {
            id: `KYC-${String(i + 1).padStart(4, '0')}`,
            entity: (k.entity_name as string) || (k.user_id as string)?.substring(0, 8) || 'Unknown',
            type: (k.request_type as string) === 'kyb' ? 'Organization' : 'Individual',
            country: (k.country as string) || 'Unknown',
            submittedDate: k.submitted_at ? new Date(k.submitted_at as string).toLocaleDateString() : '',
            status: statusMap[(k.status as string)] || 'pending',
            riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
            documents: ((k.documents_submitted as string[]) || []).length,
            completeness: (k.status as string) === 'approved' ? 100 : Math.round(Math.random() * 40 + 50),
            assignee: 'Auto-assigned',
          };
        }));

        // Trusted trader tiers from database
        const tierCounts: Record<string, number> = { gold: 0, silver: 0, bronze: 0, standard: 0 };
        trustedTraders.forEach(t => {
          const tier = t.tier || 'standard';
          tierCounts[tier] = (tierCounts[tier] || 0) + 1;
        });
        setTrustedTiers([
          { tier: 'Gold', label: 'Authorized Economic Operator', count: tierCounts.gold, benefits: ['Fast-track clearance', 'Reduced inspections', 'Priority processing', 'Self-assessment'], minScore: 90, color: '#f59e0b' },
          { tier: 'Silver', label: 'Trusted Trader', count: tierCounts.silver, benefits: ['Simplified procedures', 'Reduced bond requirements', 'Periodic review'], minScore: 75, color: '#94a3b8' },
          { tier: 'Bronze', label: 'Known Trader', count: tierCounts.bronze, benefits: ['Standard processing', 'Online submissions'], minScore: 50, color: '#b45309' },
          { tier: 'Standard', label: 'Registered Trader', count: tierCounts.standard, benefits: ['Basic access', 'Manual processing'], minScore: 0, color: '#6b7280' },
        ]);
      } catch (e) {
        console.error('Entity verification data fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredApps = KYC_APPLICATIONS.filter(app => {
    const matchesSearch = searchQuery === '' || app.entity.toLowerCase().includes(searchQuery.toLowerCase()) || app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'under_review': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { id: 'applications', label: 'KYC Applications', icon: Key },
    { id: 'screening', label: 'AML Screening', icon: ShieldAlert },
    { id: 'tiers', label: 'Trusted Trader Tiers', icon: Award },
    { id: 'cross_country', label: 'Cross-Country', icon: Globe },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-trade-accent" />
        <span className="ml-3 text-sm text-gray-500">Loading verification data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm border-l-4 border-l-trade-accent">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-trade-accent" /> Entity Verification
            </h1>
            <p className="text-xs text-gray-500 mt-1">Trust framework — Digital KYC, AML screening, sanctions checks & trusted trader tiers</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/gov/kyc/new')}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
            >
              <UserCheck className="w-3.5 h-3.5" /> New Verification
            </button>
            <button 
              onClick={() => navigate('/gov/kyc/search')}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
            >
              <Search className="w-3.5 h-3.5" /> Search Entity
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-trade-primary text-white rounded-lg text-xs font-bold">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total Verified</p>
          <p className="text-xl font-black text-trade-primary dark:text-white">12,375</p>
          <p className="text-[10px] text-green-500 font-bold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />8.2%</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-[10px] font-bold text-amber-500 uppercase">Pending Review</p>
          <p className="text-xl font-black text-amber-600">{KYC_APPLICATIONS.filter(a => a.status === 'pending').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-[10px] font-bold text-gray-400 uppercase">AML Flags</p>
          <p className="text-xl font-black text-red-600">3</p>
          <p className="text-[10px] text-gray-400">requiring review</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-[10px] font-bold text-gray-400 uppercase">AEO Operators</p>
          <p className="text-xl font-black text-trade-primary dark:text-white">245</p>
          <p className="text-[10px] text-gray-400">Gold tier</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Avg Processing</p>
          <p className="text-xl font-black text-trade-primary dark:text-white">2.4d</p>
          <p className="text-[10px] text-green-500 font-bold">-18% faster</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-trade-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* TAB: KYC APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
            {/* Application List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entity or ID..." className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-xs border-none outline-none" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-slate-700 text-xs p-2 rounded-lg border-none outline-none">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredApps.map(app => (
                  <div key={app.id} onClick={() => setSelectedApp(app)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedApp?.id === app.id ? 'bg-trade-primary/5 border-trade-accent' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${app.type === 'Individual' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                          {app.type === 'Individual' ? <User className="w-4 h-4 text-blue-600" /> : <Building className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-xs">{app.entity}</p>
                          <p className="text-[10px] text-gray-400">{app.id} &middot; {app.country} &middot; {app.submittedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getRiskStyle(app.riskLevel)}`}>{app.riskLevel}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize ${getStatusStyle(app.status)}`}>{app.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full">
                        <div className={`h-full rounded-full ${app.completeness === 100 ? 'bg-green-500' : app.completeness >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${app.completeness}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400">{app.completeness}% complete</span>
                      <span className="text-[10px] text-gray-400">{app.documents} docs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wizard / Detail Panel */}
            <div className="space-y-4">
              {/* Step-by-Step Wizard */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-trade-accent" /> Verification Wizard
                </h3>
                <div className="space-y-2">
                  {WIZARD_STEPS.map(ws => (
                    <div key={ws.step}
                      onClick={() => setWizardStep(ws.step)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                        wizardStep === ws.step ? 'bg-trade-primary/10 border border-trade-accent' :
                        wizardStep > ws.step ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' :
                        'border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        wizardStep > ws.step ? 'bg-green-500 text-white' :
                        wizardStep === ws.step ? 'bg-trade-primary text-white' :
                        'bg-gray-200 dark:bg-slate-700 text-gray-500'
                      }`}>
                        {wizardStep > ws.step ? <CheckCircle className="w-4 h-4" /> : ws.step}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{ws.title}</p>
                        <p className="text-[10px] text-gray-400">{ws.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Application Detail */}
              {selectedApp && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">{selectedApp.entity}</h3>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between"><span className="text-gray-500">ID</span><span className="font-mono font-bold text-trade-primary dark:text-trade-accent">{selectedApp.id}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-bold text-gray-900 dark:text-white">{selectedApp.type}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Country</span><span className="font-bold text-gray-900 dark:text-white">{selectedApp.country}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Assignee</span><span className="font-bold text-gray-900 dark:text-white">{selectedApp.assignee}</span></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Risk</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskStyle(selectedApp.riskLevel)}`}>{selectedApp.riskLevel}</span>
                    </div>
                  </div>

                  {/* Business ID Validations */}
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">ID Validation Status</p>
                  <div className="space-y-1.5 mb-4">
                    {BUSINESS_VALIDATIONS.map((bv, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-2">
                          {bv.status === 'verified' ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> :
                           bv.status === 'pending' ? <Clock className="w-3.5 h-3.5 text-amber-500" /> :
                           <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          <span className="text-[10px] text-gray-700 dark:text-gray-300">{bv.field}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{bv.source}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700">Approve</button>
                    <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700">Reject</button>
                    <button className="px-3 py-2 bg-amber-500 text-white rounded-lg text-[10px] font-bold hover:bg-amber-600">Escalate</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: AML SCREENING */}
        {activeTab === 'screening' && (
          <div className="space-y-4 animate-fade-in">
            {/* Search Entity */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" /> AML / Sanctions Screening
              </h3>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Enter entity name, ID, or passport number..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-xs border-none outline-none" />
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Screen Now
                </button>
              </div>

              {/* Screening Results */}
              <div className="space-y-2">
                {AML_SCREENING.map((screen, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${
                    screen.status === 'clear' ? 'bg-green-50 dark:bg-green-900/5 border-green-200 dark:border-green-800' :
                    'bg-amber-50 dark:bg-amber-900/5 border-amber-200 dark:border-amber-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      {screen.status === 'clear' ?
                        <CheckCircle className="w-4 h-4 text-green-600" /> :
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      }
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{screen.list}</p>
                        <p className="text-[10px] text-gray-400">Last checked: {screen.lastChecked}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        screen.matches === 0 ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {screen.matches} match{screen.matches !== 1 ? 'es' : ''}
                      </span>
                      {screen.status === 'review' && (
                        <button className="px-2 py-1 bg-amber-600 text-white rounded text-[9px] font-bold">Review</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Biometric & Blockchain Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-2 mb-3">
                  <Fingerprint className="w-4 h-4 text-blue-600" /> Biometric Verification
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">Advanced identity verification using biometric matching</p>
                <div className="space-y-2">
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-gray-700 dark:text-gray-300">Facial Recognition</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">Available</span>
                  </div>
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-gray-700 dark:text-gray-300">Fingerprint Match</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">Available</span>
                  </div>
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-gray-700 dark:text-gray-300">Document Liveness</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">Available</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
                <h3 className="font-bold text-purple-900 dark:text-purple-200 text-sm flex items-center gap-2 mb-3">
                  <Link2 className="w-4 h-4 text-purple-600" /> Blockchain Trade Identity
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-400 mb-3">Immutable identity records on distributed ledger</p>
                <div className="space-y-2">
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <p className="text-[10px] text-purple-600 font-bold uppercase">Verified Identities</p>
                    <p className="text-xl font-black text-purple-700 dark:text-purple-300">4,230</p>
                  </div>
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <p className="text-[10px] text-purple-600 font-bold uppercase">Cross-Border Verified</p>
                    <p className="text-xl font-black text-purple-700 dark:text-purple-300">1,890</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TRUSTED TRADER TIERS */}
        {activeTab === 'tiers' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TRUSTED_TIERS.map(tier => (
                <div key={tier.tier} className="bg-white dark:bg-slate-800 p-5 rounded-xl border-2 hover:shadow-md transition-shadow"
                  style={{ borderColor: tier.color + '40' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: tier.color + '20' }}>
                      <Award className="w-5 h-5" style={{ color: tier.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{tier.tier}</p>
                      <p className="text-[10px] text-gray-400">{tier.label}</p>
                    </div>
                  </div>
                  <div className="text-center mb-3">
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{tier.count.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">registered traders</p>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {tier.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
                    <p className="text-[10px] text-gray-400">Min compliance score</p>
                    <p className="text-sm font-black" style={{ color: tier.color }}>{tier.minScore}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance Gamification */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="font-bold text-green-900 dark:text-green-200 text-sm flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-green-600" /> Compliance Gamification
              </h3>
              <p className="text-xs text-green-700 dark:text-green-400 mb-3">Traders earn badges for sustained compliance. Higher tiers unlock benefits.</p>
              <div className="flex flex-wrap gap-2">
                {['On-Time Filer', 'Zero Violations', 'Digital Pioneer', 'Community Trader', 'AfCFTA Champion', 'Green Corridor'].map(badge => (
                  <span key={badge} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-green-200 dark:border-green-700 rounded-full text-[10px] font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                    <Award className="w-3 h-3" /> {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: CROSS-COUNTRY VERIFICATION */}
        {activeTab === 'cross_country' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-trade-accent" /> Cross-Country Verification Requests
                </h3>
                <button className="px-3 py-1.5 bg-trade-primary text-white rounded-lg text-[10px] font-bold">New Request</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Entity</th>
                      <th className="p-3 text-left">Requested By</th>
                      <th className="p-3 text-center">Target Country</th>
                      <th className="p-3 text-center">Response Time</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {CROSS_COUNTRY_VERIFICATIONS.map(v => (
                      <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="p-3 font-mono font-bold text-trade-primary dark:text-trade-accent text-[10px]">{v.id}</td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{v.entity}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{v.requestedBy}</td>
                        <td className="p-3 text-center text-gray-600 dark:text-gray-400">{v.targetCountry}</td>
                        <td className="p-3 text-center font-bold text-gray-900 dark:text-white">{v.responseTime}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusStyle(v.status)}`}>{v.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
