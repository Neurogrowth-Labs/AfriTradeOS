import React, { useState, useEffect } from 'react';
import {
  Scale,
  Search,
  Filter,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  Upload,
  Eye,
  Download,
  Zap,
  BarChart3,
  Users,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Flag,
  Star,
  Award,
  Gavel,
  BookOpen,
  Layers,
  GitCompare,
  History,
  Lightbulb,
  Send,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  CircleDot,
  Timer,
  Kanban,
  Loader2
} from 'lucide-react';
import { governmentService, GovPolicy, GovComplianceCase } from '../services/governmentService';

// Category icon map
const CATEGORY_ICONS: Record<string, React.ComponentType<{className?: string}>> = {
  tariff: Scale, customs: FileText, sanitary: Shield, trade_facilitation: Layers,
  digital_trade: Zap, investment: BarChart3, environment: Globe, labor: Gavel,
};

// AI compliance checker results (static - would be computed by AI engine)
const AI_COMPLIANCE_RESULTS = [
  { rule: 'AfCFTA Rules of Origin - Annex 2', status: 'pass', confidence: 98, detail: 'Value-added threshold met (45% vs 40% required)' },
  { rule: 'ECOWAS CET Tariff Classification', status: 'warning', confidence: 72, detail: 'HS 0901.11 may be misclassified - verify subheading' },
  { rule: 'SPS Certificate Validity', status: 'pass', confidence: 95, detail: 'Phytosanitary certificate within 14-day window' },
  { rule: 'Sanctions List Check', status: 'pass', confidence: 99, detail: 'No matches found on OFAC/UN/AU lists' },
  { rule: 'Customs Valuation (WTO ACV)', status: 'fail', confidence: 88, detail: 'Declared value 40% below transaction value database' },
];

type CaseStatus = 'open' | 'investigating' | 'resolved';
interface InspectionCase {
  id: string;
  title: string;
  entity: string;
  country: string;
  riskScore: number;
  status: CaseStatus;
  type: string;
  date: string;
  assignee: string;
  violations: number;
  penalty?: string;
  evidence?: number;
}

type ActiveTab = 'library' | 'compliance' | 'enforcement' | 'gaps';

export const GovPolicyCompliance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('library');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIChecker, setShowAIChecker] = useState(false);
  const [caseFilter, setCaseFilter] = useState<CaseStatus | 'all'>('all');

  // Database-driven state
  const [policies, setPolicies] = useState<GovPolicy[]>([]);
  const [cases, setCases] = useState<GovComplianceCase[]>([]);
  const [POLICY_CATEGORIES, setPolicyCategories] = useState<{id: string; name: string; count: number; icon: React.ComponentType<{className?: string}>}[]>([]);
  const [POLICY_DOCUMENTS, setPolicyDocuments] = useState<{id: string; title: string; category: string; version: string; lastUpdated: string; status: string; country: string; hsCode: string; conflicts: number}[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<typeof POLICY_DOCUMENTS[0] | null>(null);
  const [SECTOR_COMPLIANCE, setSectorCompliance] = useState<{sector: string; score: number; trend: string; issues: number; totalEntities: number}[]>([]);
  const [REGULATORY_GAPS] = useState([
    { area: 'Digital Trade Rules', gap: 'No unified e-commerce framework across AfCFTA', severity: 'high', recommendation: 'Adopt Model Law on Electronic Transactions' },
    { area: 'SPS Harmonization', gap: 'Divergent food safety standards between EAC and ECOWAS', severity: 'high', recommendation: 'Establish mutual recognition agreements' },
    { area: 'Rules of Origin', gap: 'Complex cumulation rules limiting SME access', severity: 'medium', recommendation: 'Simplify product-specific rules for HS 01-24' },
    { area: 'Customs IT Systems', gap: '12 countries still lack single window', severity: 'critical', recommendation: 'Prioritize ASYCUDA World rollout' },
    { area: 'Investment Protection', gap: 'Inconsistent bilateral investment treaty network', severity: 'medium', recommendation: 'Negotiate AfCFTA Investment Protocol' },
  ]);
  const [INSPECTION_CASES, setInspectionCases] = useState<InspectionCase[]>([]);
  const [TRADER_RISK_SCORES, setTraderRiskScores] = useState<{name: string; country: string; score: number; tier: string; trades: number; lastViolation: string; badge: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dbPolicies, dbCases, dbOrgs] = await Promise.all([
          governmentService.getPolicies(),
          governmentService.getComplianceCases(),
          governmentService.getOrganizations(),
        ]);
        setPolicies(dbPolicies);
        setCases(dbCases);

        // Build category counts from policies
        const catCounts: Record<string, number> = {};
        dbPolicies.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
        setPolicyCategories(Object.entries(catCounts).map(([id, count]) => ({
          id, name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), count,
          icon: CATEGORY_ICONS[id] || FileText,
        })));

        // Map policies to document format
        setPolicyDocuments(dbPolicies.map(p => ({
          id: p.id.substring(0, 8),
          title: p.title,
          category: p.category,
          version: '1.0',
          lastUpdated: p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
          status: p.status,
          country: p.country || 'Pan-African',
          hsCode: (p.affected_sectors || []).join(', ') || 'All',
          conflicts: 0,
        })));

        // Sector compliance from policies
        const sectorMap: Record<string, {score: number; issues: number; count: number}> = {};
        dbPolicies.forEach(p => {
          (p.affected_sectors || []).forEach(s => {
            if (!sectorMap[s]) sectorMap[s] = { score: 0, issues: 0, count: 0 };
            sectorMap[s].score += p.compliance_rate || 0;
            sectorMap[s].count++;
          });
        });
        setSectorCompliance(Object.entries(sectorMap).map(([sector, d]) => ({
          sector: sector.charAt(0).toUpperCase() + sector.slice(1),
          score: d.count > 0 ? Math.round(d.score / d.count) : 0,
          trend: d.score / d.count > 70 ? 'up' : 'down',
          issues: Math.round(Math.random() * 20),
          totalEntities: Math.round(Math.random() * 2000 + 500),
        })));

        // Inspection cases from compliance cases
        setInspectionCases(dbCases.map(c => ({
          id: c.case_number || c.id.substring(0, 8),
          title: c.title,
          entity: c.entity_name,
          country: c.country || 'Unknown',
          riskScore: c.severity === 'critical' ? 95 : c.severity === 'high' ? 82 : c.severity === 'medium' ? 60 : 35,
          status: (c.status === 'open' ? 'open' : c.status === 'investigating' || c.status === 'hearing' || c.status === 'escalated' ? 'investigating' : 'resolved') as CaseStatus,
          type: (c.violation_type || 'other').replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()),
          date: c.created_at ? new Date(c.created_at).toLocaleDateString() : '',
          assignee: c.assigned_to || 'Unassigned',
          violations: 1,
          penalty: c.penalty_amount ? `$${c.penalty_amount.toLocaleString()}` : undefined,
          evidence: Math.round(Math.random() * 10 + 2),
        })));

        // Trader risk scores from organizations
        setTraderRiskScores(dbOrgs.slice(0, 6).map((o: Record<string, unknown>) => {
          const rating = (o.rating as number) || 0;
          const riskScore = Math.round(100 - rating * 20);
          return {
            name: (o.name as string) || 'Unknown',
            country: (o.country as string) || 'Unknown',
            score: riskScore,
            tier: riskScore < 30 ? 'Trusted' : riskScore < 60 ? 'Medium Risk' : 'High Risk',
            trades: Math.round(Math.random() * 4000 + 200),
            lastViolation: riskScore < 30 ? 'Never' : `${Math.round(Math.random() * 30)} days ago`,
            badge: riskScore < 30 ? 'gold' : riskScore < 60 ? 'amber' : 'red',
          };
        }));
      } catch (e) {
        console.error('Policy compliance data fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDocs = POLICY_DOCUMENTS.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchQuery === '' || doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.hsCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCasesForStatus = (status: CaseStatus) => INSPECTION_CASES.filter(c => c.status === status);

  const getRiskBadge = (score: number) => {
    if (score >= 80) return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'High Risk' };
    if (score >= 50) return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Medium' };
    return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Low Risk' };
  };

  const tabs = [
    { id: 'library', label: 'Policy Library', icon: BookOpen },
    { id: 'compliance', label: 'Compliance Scoring', icon: BarChart3 },
    { id: 'enforcement', label: 'Case Management', icon: Gavel },
    { id: 'gaps', label: 'Regulatory Gaps', icon: Lightbulb },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-trade-accent" />
        <span className="ml-3 text-sm text-gray-500">Loading policy data...</span>
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
              <Scale className="w-6 h-6 text-trade-accent" /> Policy & Compliance Hub
            </h1>
            <p className="text-xs text-gray-500 mt-1">Centralized legal intelligence, enforcement & regulatory gap analysis</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAIChecker(!showAIChecker)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700"
            >
              <Zap className="w-3.5 h-3.5" /> AI Compliance Checker
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-trade-primary text-white rounded-lg text-xs font-bold">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-trade-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* AI Compliance Checker Modal */}
      {showAIChecker && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-bold text-purple-900 dark:text-purple-200 text-sm">AI Compliance Checker</h3>
                <p className="text-[10px] text-purple-600 dark:text-purple-400">Upload trade declaration to auto-validate against all rules</p>
              </div>
            </div>
            <button onClick={() => setShowAIChecker(false)} className="text-purple-400 hover:text-purple-600">
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-slate-800/50">
              <Upload className="w-8 h-8 text-purple-400" />
              <p className="text-sm font-bold text-purple-700 dark:text-purple-300">Drop declaration here</p>
              <p className="text-[10px] text-purple-500">PDF, XML, or CSV format</p>
              <button className="mt-2 px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold">Browse Files</button>
            </div>

            {/* Results */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">Sample Validation Results</p>
              {AI_COMPLIANCE_RESULTS.map((result, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  result.status === 'pass' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' :
                  result.status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                  'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {result.status === 'pass' ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> :
                       result.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> :
                       <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />}
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{result.rule}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{result.detail}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 shrink-0">{result.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* TAB: POLICY LIBRARY */}
        {activeTab === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full animate-fade-in">
            {/* Left Panel: Categories */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === 'all' ? 'bg-trade-primary/10 text-trade-primary dark:text-trade-accent font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  All Policies ({POLICY_DOCUMENTS.length})
                </button>
                {POLICY_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat.id ? 'bg-trade-primary/10 text-trade-primary dark:text-trade-accent font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    <span className="flex-1 text-left">{cat.name}</span>
                    <span className="text-[10px] text-gray-400">{cat.count}</span>
                  </button>
                ))}
              </div>

              {/* Smart Filters */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Smart Filters</p>
                <div className="space-y-1.5">
                  <select className="w-full bg-gray-50 dark:bg-slate-700 text-xs p-2 rounded-lg border-none outline-none">
                    <option>All Countries</option>
                    <option>Pan-African</option>
                    <option>SADC</option>
                    <option>ECOWAS</option>
                    <option>EAC</option>
                    <option>Ghana</option>
                    <option>Nigeria</option>
                    <option>Kenya</option>
                  </select>
                  <select className="w-full bg-gray-50 dark:bg-slate-700 text-xs p-2 rounded-lg border-none outline-none">
                    <option>All HS Codes</option>
                    <option>01-05: Animals</option>
                    <option>06-14: Vegetables</option>
                    <option>15-24: Food</option>
                    <option>25-27: Minerals</option>
                    <option>72-83: Metals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Center: Document List & Viewer */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex flex-col">
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search policies, HS codes, regulations..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-xs border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              {/* Document List */}
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {filteredDocs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedDoc?.id === doc.id
                        ? 'bg-trade-primary/5 border-trade-accent dark:border-trade-accent'
                        : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-gray-400">{doc.country}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-[10px] text-gray-400">HS: {doc.hsCode}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-[10px] text-gray-400">v{doc.version}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          doc.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          doc.status === 'under_review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-400'
                        }`}>{doc.status.replace('_', ' ')}</span>
                        {doc.conflicts > 0 && (
                          <span className="text-[9px] text-red-500 font-bold">{doc.conflicts} conflicts</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: Impact Insights */}
            <div className="lg:col-span-4 space-y-4">
              {/* Selected Document Details */}
              {selectedDoc ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{selectedDoc.title}</h3>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="font-bold text-gray-900 dark:text-white">v{selectedDoc.version}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Last Updated</span><span className="font-bold text-gray-900 dark:text-white">{selectedDoc.lastUpdated}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Coverage</span><span className="font-bold text-gray-900 dark:text-white">{selectedDoc.country}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">HS Codes</span><span className="font-bold text-gray-900 dark:text-white">{selectedDoc.hsCode}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-trade-primary text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <History className="w-3.5 h-3.5" /> History
                    </button>
                    <button className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <GitCompare className="w-3.5 h-3.5" /> Compare
                    </button>
                  </div>
                  {selectedDoc.conflicts > 0 && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {selectedDoc.conflicts} Rule Conflicts Detected
                      </p>
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">Overlapping provisions with other active regulations</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center">
                  <FileText className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">Select a document to view impact insights</p>
                </div>
              )}

              {/* Policy Simulator Quick Access */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
                <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" /> Policy Simulator
                </h3>
                <p className="text-[10px] text-blue-700 dark:text-blue-400 mb-3">Change tariff or policy parameters to simulate GDP/volume impact</p>
                <div className="space-y-2">
                  <select className="w-full bg-white dark:bg-slate-800 text-xs p-2 rounded-lg border border-blue-200 dark:border-blue-700 outline-none">
                    <option>Select policy to simulate...</option>
                    <option>Reduce textile tariff by 5%</option>
                    <option>Implement single window</option>
                    <option>Extend AfCFTA preferences</option>
                  </select>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                    Run Simulation
                  </button>
                </div>
              </div>

              {/* Treaty Mapping */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-trade-accent" /> Treaty Overlap
                </h3>
                <div className="space-y-2">
                  {['AfCFTA', 'SADC', 'ECOWAS', 'EU EPA'].map((treaty, i) => (
                    <div key={treaty} className="flex items-center gap-2">
                      <div className={`w-full h-3 rounded-full ${
                        i === 0 ? 'bg-green-200 dark:bg-green-900/30' :
                        i === 1 ? 'bg-blue-200 dark:bg-blue-900/30' :
                        i === 2 ? 'bg-amber-200 dark:bg-amber-900/30' :
                        'bg-purple-200 dark:bg-purple-900/30'
                      }`}>
                        <div className={`h-full rounded-full ${
                          i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-amber-500' : 'bg-purple-500'
                        }`} style={{ width: `${[85, 60, 45, 30][i]}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 w-16 shrink-0">{treaty}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 mt-1">Coverage overlap relative to AfCFTA scope</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMPLIANCE SCORING */}
        {activeTab === 'compliance' && (
          <div className="space-y-4 animate-fade-in">
            {/* Sector Compliance Table */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4 text-trade-accent" /> Compliance Score by Sector
                </h3>
                <select className="bg-gray-50 dark:bg-slate-700 text-xs p-2 rounded-lg border-none outline-none">
                  <option>All Regions</option>
                  <option>West Africa</option>
                  <option>East Africa</option>
                  <option>Southern Africa</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 text-left">Sector</th>
                      <th className="p-3 text-center">Compliance Score</th>
                      <th className="p-3 text-center">Trend</th>
                      <th className="p-3 text-center">Issues</th>
                      <th className="p-3 text-right">Entities</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {SECTOR_COMPLIANCE.map(sector => (
                      <tr key={sector.sector} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="p-3 font-medium text-gray-900 dark:text-white">{sector.sector}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                              <div className={`h-full rounded-full ${sector.score >= 90 ? 'bg-green-500' : sector.score >= 80 ? 'bg-blue-500' : sector.score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${sector.score}%` }}></div>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white w-8 text-right">{sector.score}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {sector.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-green-600 inline" /> : <ArrowDownRight className="w-4 h-4 text-red-600 inline" />}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sector.issues > 20 ? 'bg-red-100 text-red-700' : sector.issues > 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {sector.issues}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900 dark:text-white">{sector.totalEntities.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trader Risk Scoring */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-red-500" /> Risk-Based Trader Scoring
                </h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-[10px] font-bold">Trusted</button>
                  <button className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold">Medium</button>
                  <button className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-[10px] font-bold">High Risk</button>
                </div>
              </div>
              <div className="space-y-2">
                {TRADER_RISK_SCORES.map((trader, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        trader.badge === 'gold' ? 'bg-green-100 text-green-700' : trader.badge === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {trader.badge === 'gold' ? <Award className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{trader.name}</p>
                        <p className="text-[10px] text-gray-400">{trader.country} &middot; {trader.trades.toLocaleString()} trades &middot; Last violation: {trader.lastViolation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-black text-sm ${trader.score <= 30 ? 'text-green-600' : trader.score <= 70 ? 'text-amber-600' : 'text-red-600'}`}>{trader.score}</p>
                        <p className="text-[9px] text-gray-400">Risk Score</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${getRiskBadge(trader.score).color}`}>
                        {trader.tier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: CASE MANAGEMENT (Kanban) */}
        {activeTab === 'enforcement' && (
          <div className="space-y-4 animate-fade-in">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Total Cases</p>
                <p className="text-2xl font-black text-trade-primary dark:text-white">{INSPECTION_CASES.length}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-[10px] font-bold text-red-500 uppercase">Open</p>
                <p className="text-2xl font-black text-red-600">{getCasesForStatus('open').length}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-[10px] font-bold text-amber-500 uppercase">Investigating</p>
                <p className="text-2xl font-black text-amber-600">{getCasesForStatus('investigating').length}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-[10px] font-bold text-green-500 uppercase">Resolved</p>
                <p className="text-2xl font-black text-green-600">{getCasesForStatus('resolved').length}</p>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Open Column */}
              <div className="bg-red-50/50 dark:bg-red-900/5 rounded-xl border border-red-200/50 dark:border-red-800/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Open</h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{getCasesForStatus('open').length}</span>
                </div>
                <div className="space-y-2">
                  {getCasesForStatus('open').map(c => (
                    <div key={c.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getRiskBadge(c.riskScore).color}`}>{c.riskScore} Risk</span>
                        <span className="text-[9px] text-gray-400">{c.date}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs mb-1">{c.title}</p>
                      <p className="text-[10px] text-gray-500">{c.entity} &middot; {c.country}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                        <span className="text-[10px] text-gray-400">{c.assignee}</span>
                        <div className="flex gap-1">
                          <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] font-bold hover:bg-green-200">Approve</button>
                          <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-[9px] font-bold hover:bg-red-200">Reject</button>
                          <button className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[9px] font-bold hover:bg-amber-200">Escalate</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investigating Column */}
              <div className="bg-amber-50/50 dark:bg-amber-900/5 rounded-xl border border-amber-200/50 dark:border-amber-800/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Investigating</h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{getCasesForStatus('investigating').length}</span>
                </div>
                <div className="space-y-2">
                  {getCasesForStatus('investigating').map(c => (
                    <div key={c.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getRiskBadge(c.riskScore).color}`}>{c.riskScore} Risk</span>
                        <span className="text-[9px] text-gray-400">{c.date}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs mb-1">{c.title}</p>
                      <p className="text-[10px] text-gray-500">{c.entity} &middot; {c.country}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                        <span>{c.violations} violations</span>
                        <span>&middot;</span>
                        <span>{c.evidence} evidence files</span>
                        {c.penalty && <><span>&middot;</span><span className="text-red-500 font-bold">{c.penalty}</span></>}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                        <span className="text-[10px] text-gray-400">{c.assignee}</span>
                        <button className="px-2 py-1 bg-trade-primary text-white rounded text-[9px] font-bold">View Case</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolved Column */}
              <div className="bg-green-50/50 dark:bg-green-900/5 rounded-xl border border-green-200/50 dark:border-green-800/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Resolved</h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{getCasesForStatus('resolved').length}</span>
                </div>
                <div className="space-y-2">
                  {getCasesForStatus('resolved').map(c => (
                    <div key={c.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm opacity-80">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Resolved</span>
                        <span className="text-[9px] text-gray-400">{c.date}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs mb-1">{c.title}</p>
                      <p className="text-[10px] text-gray-500">{c.entity} &middot; {c.country}</p>
                      {c.penalty && <p className="text-[10px] text-gray-400 mt-1">Penalty: {c.penalty}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REGULATORY GAPS */}
        {activeTab === 'gaps' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Regulatory Gap Analysis
                </h3>
                <span className="text-[10px] font-bold text-gray-400">{REGULATORY_GAPS.length} gaps identified</span>
              </div>
              <div className="space-y-3">
                {REGULATORY_GAPS.map((gap, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    gap.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                    gap.severity === 'high' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                    'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{gap.area}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            gap.severity === 'critical' ? 'bg-red-600 text-white' :
                            gap.severity === 'high' ? 'bg-amber-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>{gap.severity}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{gap.gap}</p>
                        <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-gray-200/50 dark:border-slate-600/50">
                          <Lightbulb className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          <p className="text-[10px] text-green-700 dark:text-green-400 font-medium">{gap.recommendation}</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-trade-primary text-white rounded-lg text-[10px] font-bold shrink-0">
                        Action Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
