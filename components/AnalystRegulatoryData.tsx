
import React, { useState } from 'react';
import {
  Scale,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronDown,
  FileText,
  Globe,
  Shield,
  BookOpen,
  Download,
  ArrowRight,
  Zap,
} from 'lucide-react';

// --- TYPES ---
interface TariffEntry {
  hsCode: string;
  description: string;
  mfnRate: number;
  afcftaRate: number;
  saving: number;
  category: string;
  status: 'liberalized' | 'sensitive' | 'excluded';
}

interface RooRule {
  hsCode: string;
  product: string;
  rule: string;
  criteria: string;
  threshold: string;
  status: 'compliant' | 'check_required' | 'non_compliant';
}

interface NTBAlert {
  id: string;
  country: string;
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  affectedProducts: string[];
}

interface LegalUpdate {
  id: string;
  title: string;
  country: string;
  category: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  summary: string;
}

// --- DATA ---
const TARIFF_DB: TariffEntry[] = [
  { hsCode: '0901.11', description: 'Coffee (not roasted, not decaffeinated)', mfnRate: 12, afcftaRate: 0, saving: 12, category: 'Agriculture', status: 'liberalized' },
  { hsCode: '1801.00', description: 'Cocoa beans, whole or broken', mfnRate: 10, afcftaRate: 0, saving: 10, category: 'Agriculture', status: 'liberalized' },
  { hsCode: '2523.29', description: 'Portland cement', mfnRate: 20, afcftaRate: 5, saving: 15, category: 'Manufacturing', status: 'sensitive' },
  { hsCode: '6109.10', description: 'T-shirts, singlets (cotton)', mfnRate: 20, afcftaRate: 0, saving: 20, category: 'Textiles', status: 'liberalized' },
  { hsCode: '8471.30', description: 'Portable digital computers', mfnRate: 15, afcftaRate: 5, saving: 10, category: 'Electronics', status: 'sensitive' },
  { hsCode: '1006.30', description: 'Rice (semi/wholly milled)', mfnRate: 25, afcftaRate: 10, saving: 15, category: 'Agriculture', status: 'sensitive' },
  { hsCode: '7108.12', description: 'Gold (unwrought, non-monetary)', mfnRate: 5, afcftaRate: 0, saving: 5, category: 'Mining', status: 'liberalized' },
  { hsCode: '2710.12', description: 'Light petroleum oils', mfnRate: 15, afcftaRate: 15, saving: 0, category: 'Energy', status: 'excluded' },
  { hsCode: '0304.49', description: 'Frozen fish fillets', mfnRate: 18, afcftaRate: 3, saving: 15, category: 'Agriculture', status: 'liberalized' },
  { hsCode: '3004.90', description: 'Medicaments (packaged)', mfnRate: 10, afcftaRate: 0, saving: 10, category: 'Pharmaceuticals', status: 'liberalized' },
];

const ROO_RULES: RooRule[] = [
  { hsCode: '0901.11', product: 'Coffee', rule: 'Wholly Obtained', criteria: 'Product must be wholly grown/harvested in exporting country', threshold: '100% local', status: 'compliant' },
  { hsCode: '1801.00', product: 'Cocoa Beans', rule: 'Wholly Obtained', criteria: 'Must be grown and harvested in AfCFTA state party', threshold: '100% local', status: 'compliant' },
  { hsCode: '6109.10', product: 'Cotton T-shirts', rule: 'Value Added', criteria: 'Min 40% value added in exporting country (LVC method)', threshold: '≥40% VA', status: 'check_required' },
  { hsCode: '2523.29', product: 'Portland Cement', rule: 'Change in Tariff Heading', criteria: 'Raw materials must undergo substantial transformation', threshold: 'CTH + 30% VA', status: 'compliant' },
  { hsCode: '8471.30', product: 'Computers', rule: 'Value Added + CTH', criteria: 'Assembly + min 25% local value content', threshold: '≥25% VA + CTH', status: 'non_compliant' },
  { hsCode: '3004.90', product: 'Medicaments', rule: 'Value Added', criteria: 'Min 30% domestic value for pharmaceutical products', threshold: '≥30% VA', status: 'check_required' },
];

const NTB_ALERTS: NTBAlert[] = [
  { id: 'ntb1', country: 'Nigeria', type: 'Import Ban', description: 'Continued ban on imported poultry products for SPS reasons', severity: 'high', date: '2025-01-15', affectedProducts: ['Frozen Chicken', 'Poultry Products'] },
  { id: 'ntb2', country: 'Kenya', type: 'Standards Requirement', description: 'New KEBS pre-export verification of conformity (PVoC) requirements for textiles', severity: 'medium', date: '2025-01-20', affectedProducts: ['Textiles', 'Garments'] },
  { id: 'ntb3', country: 'Tanzania', type: 'Documentation', description: 'Additional phytosanitary certificate required for all plant-based imports', severity: 'medium', date: '2025-02-01', affectedProducts: ['Agriculture', 'Plant Products'] },
  { id: 'ntb4', country: 'South Africa', type: 'Anti-Dumping', description: 'Provisional anti-dumping duties on imported steel products from select countries', severity: 'high', date: '2025-01-28', affectedProducts: ['Steel', 'Iron Products'] },
  { id: 'ntb5', country: 'Egypt', type: 'Import License', description: 'Mandatory registration in the national product registry for all importers', severity: 'low', date: '2025-02-05', affectedProducts: ['All Categories'] },
];

const LEGAL_UPDATES: LegalUpdate[] = [
  { id: 'lu1', title: 'ECOWAS CET Revision — 45 Tariff Lines Updated', country: 'ECOWAS Region', category: 'Tariff', date: '2025-02-10', impact: 'high', summary: 'Common External Tariff adjustments affecting agricultural and industrial goods. Average reduction of 3.2pp across affected lines.' },
  { id: 'lu2', title: 'Kenya Revenue Authority Digital Declaration Mandate', country: 'Kenya', category: 'Customs', date: '2025-02-08', impact: 'medium', summary: 'All customs declarations must be filed electronically through KRA iCMS portal effective March 1, 2025.' },
  { id: 'lu3', title: 'AfCFTA Phase II Services Protocol Ratification', country: 'Continental', category: 'Trade Agreement', date: '2025-02-05', impact: 'high', summary: 'Phase II negotiations on services, investment, and competition policy entering implementation stage.' },
  { id: 'lu4', title: 'South Africa ITAC Import Permit Updates', country: 'South Africa', category: 'Licensing', date: '2025-02-01', impact: 'low', summary: 'Updated list of products requiring ITAC import permits. 12 HS codes added, 8 removed.' },
];

export const AnalystRegulatoryData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tariffs' | 'roo' | 'ntb' | 'legal' | 'wizard'>('tariffs');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedRoo, setExpandedRoo] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState({ product: '', origin: '', destination: '', hsCode: '' });

  const filteredTariffs = TARIFF_DB.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.hsCode.includes(searchQuery) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(TARIFF_DB.map(t => t.category)))];

  const wizardSteps = [
    { title: 'Product Details', desc: 'What are you exporting?' },
    { title: 'Origin & Destination', desc: 'Where from and to?' },
    { title: 'Compliance Check', desc: 'Requirements analysis' },
    { title: 'Document Checklist', desc: 'Required documents' },
  ];

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-trade-primary dark:text-white">Regulatory Data</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Tariff database • Rules of Origin • NTB alerts • Legal updates • Compliance wizard</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder='Search HS code or product (e.g. "0901.11" or "coffee")...' />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'tariffs' as const, label: 'Tariff Database', icon: Scale },
            { id: 'roo' as const, label: 'Rules of Origin', icon: Globe },
            { id: 'ntb' as const, label: 'NTB Alerts', icon: AlertTriangle },
            { id: 'legal' as const, label: 'Legal Updates', icon: BookOpen },
            { id: 'wizard' as const, label: 'Compliance Wizard', icon: Zap },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TARIFF DATABASE */}
      {activeTab === 'tariffs' && (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  categoryFilter === cat ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800 p-3 text-center">
              <p className="text-xl font-black text-green-600">{TARIFF_DB.filter(t => t.status === 'liberalized').length}</p>
              <p className="text-[10px] text-green-600 font-bold">Liberalized</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 p-3 text-center">
              <p className="text-xl font-black text-amber-600">{TARIFF_DB.filter(t => t.status === 'sensitive').length}</p>
              <p className="text-[10px] text-amber-600 font-bold">Sensitive</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-3 text-center">
              <p className="text-xl font-black text-red-600">{TARIFF_DB.filter(t => t.status === 'excluded').length}</p>
              <p className="text-[10px] text-red-600 font-bold">Excluded</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 p-3 text-center">
              <p className="text-xl font-black text-blue-600">{(TARIFF_DB.reduce((s, t) => s + t.saving, 0) / TARIFF_DB.length).toFixed(1)}%</p>
              <p className="text-[10px] text-blue-600 font-bold">Avg Saving</p>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">HS Code</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">MFN Rate</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">AfCFTA Rate</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Saving</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredTariffs.map(t => (
                    <tr key={t.hsCode} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono font-bold text-blue-600">{t.hsCode}</td>
                      <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{t.description}</td>
                      <td className="px-4 py-3 text-[10px] text-gray-500">{t.category}</td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">{t.mfnRate}%</td>
                      <td className="px-4 py-3 text-xs font-bold text-green-600">{t.afcftaRate}%</td>
                      <td className="px-4 py-3 text-xs font-bold text-emerald-600">-{t.saving}pp</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'liberalized' ? 'bg-green-100 text-green-700' :
                          t.status === 'sensitive' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RULES OF ORIGIN */}
      {activeTab === 'roo' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-3">
            {ROO_RULES.map(r => (
              <div key={r.hsCode} className={`bg-white dark:bg-slate-800 rounded-xl border p-4 transition-all cursor-pointer ${
                r.status === 'compliant' ? 'border-green-200 dark:border-green-800' :
                r.status === 'check_required' ? 'border-amber-200 dark:border-amber-800' : 'border-red-200 dark:border-red-800'
              }`} onClick={() => setExpandedRoo(expandedRoo === r.hsCode ? null : r.hsCode)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      r.status === 'compliant' ? 'bg-green-100 text-green-600' :
                      r.status === 'check_required' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {r.status === 'compliant' ? <CheckCircle className="w-4 h-4" /> :
                       r.status === 'check_required' ? <AlertTriangle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{r.product}</p>
                      <p className="text-[10px] text-gray-500">HS {r.hsCode} • {r.rule}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">{r.threshold}</span>
                    {expandedRoo === r.hsCode ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {expandedRoo === r.hsCode && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">{r.criteria}</p>
                    <div className="mt-2 flex gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        r.status === 'compliant' ? 'bg-green-50 text-green-700' :
                        r.status === 'check_required' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {r.status === 'compliant' ? 'Meets AfCFTA requirements' :
                         r.status === 'check_required' ? 'Verification needed — provide supporting docs' : 'Does not meet current criteria'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NTB ALERTS */}
      {activeTab === 'ntb' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-3">
            {NTB_ALERTS.map(ntb => (
              <div key={ntb.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-4 ${
                ntb.severity === 'high' ? 'border-red-200 dark:border-red-800' :
                ntb.severity === 'medium' ? 'border-amber-200 dark:border-amber-800' : 'border-gray-100 dark:border-slate-700'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${
                      ntb.severity === 'high' ? 'text-red-500' : ntb.severity === 'medium' ? 'text-amber-500' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{ntb.country} — {ntb.type}</p>
                      <p className="text-[10px] text-gray-500">{ntb.date}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ntb.severity === 'high' ? 'bg-red-100 text-red-700' :
                    ntb.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>{ntb.severity.toUpperCase()}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{ntb.description}</p>
                <div className="flex flex-wrap gap-1">
                  {ntb.affectedProducts.map(p => (
                    <span key={p} className="text-[9px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEGAL UPDATES */}
      {activeTab === 'legal' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-3">
            {LEGAL_UPDATES.map(lu => (
              <div key={lu.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{lu.title}</p>
                      <p className="text-[10px] text-gray-500">{lu.country} • {lu.category} • {lu.date}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    lu.impact === 'high' ? 'bg-red-100 text-red-700' :
                    lu.impact === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>{lu.impact} impact</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{lu.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLIANCE WIZARD */}
      {activeTab === 'wizard' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* Step Indicator */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2">
              {wizardSteps.map((step, i) => (
                <React.Fragment key={i}>
                  <button onClick={() => setWizardStep(i)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      wizardStep === i ? 'bg-amber-600 text-white' :
                      wizardStep > i ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
                    }`}>
                    {wizardStep > i ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>}
                    <span className="hidden md:inline">{step.title}</span>
                  </button>
                  {i < wizardSteps.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Wizard Content */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 flex-1">
            {wizardStep === 0 && (
              <div className="max-w-lg mx-auto space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">What are you trading?</h3>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Product Name</label>
                  <input type="text" value={wizardData.product} onChange={e => setWizardData(p => ({ ...p, product: e.target.value }))}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Cotton T-shirts" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">HS Code (optional)</label>
                  <input type="text" value={wizardData.hsCode} onChange={e => setWizardData(p => ({ ...p, hsCode: e.target.value }))}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 6109.10" />
                </div>
                <button onClick={() => setWizardStep(1)} className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {wizardStep === 1 && (
              <div className="max-w-lg mx-auto space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Origin &amp; Destination</h3>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Exporting From</label>
                  <select value={wizardData.origin} onChange={e => setWizardData(p => ({ ...p, origin: e.target.value }))}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm outline-none">
                    <option value="">Select country</option>
                    {['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Ethiopia', 'Tanzania', 'Senegal'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Importing To</label>
                  <select value={wizardData.destination} onChange={e => setWizardData(p => ({ ...p, destination: e.target.value }))}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm outline-none">
                    <option value="">Select country</option>
                    {['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Ethiopia', 'Tanzania', 'Senegal'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setWizardStep(0)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white font-bold rounded-lg text-sm">Back</button>
                  <button onClick={() => setWizardStep(2)} className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                    Check Compliance <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {wizardStep === 2 && (
              <div className="max-w-lg mx-auto space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Compliance Results</h3>
                <div className="space-y-3">
                  {[
                    { check: 'AfCFTA Certificate of Origin', status: 'pass', detail: 'Product qualifies for preferential tariff' },
                    { check: 'Rules of Origin (Value Added)', status: 'pass', detail: '≥40% local value content verified' },
                    { check: 'SPS/TBT Requirements', status: 'warning', detail: 'Phytosanitary certificate may be required' },
                    { check: 'Import License', status: 'pass', detail: 'No special license required' },
                    { check: 'Customs Documentation', status: 'pass', detail: 'Standard customs declaration applicable' },
                  ].map(c => (
                    <div key={c.check} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        {c.status === 'pass' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                         c.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{c.check}</p>
                          <p className="text-[10px] text-gray-500">{c.detail}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'pass' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>{c.status === 'pass' ? 'COMPLIANT' : 'CHECK'}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setWizardStep(1)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white font-bold rounded-lg text-sm">Back</button>
                  <button onClick={() => setWizardStep(3)} className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                    View Documents <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {wizardStep === 3 && (
              <div className="max-w-lg mx-auto space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Required Documents</h3>
                <div className="space-y-2">
                  {[
                    { doc: 'Certificate of Origin (AfCFTA)', required: true },
                    { doc: 'Commercial Invoice', required: true },
                    { doc: 'Packing List', required: true },
                    { doc: 'Bill of Lading / Airway Bill', required: true },
                    { doc: 'Customs Declaration Form', required: true },
                    { doc: 'Phytosanitary Certificate', required: false },
                    { doc: 'Insurance Certificate', required: false },
                  ].map(d => (
                    <div key={d.doc} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium text-gray-800 dark:text-white">{d.doc}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${d.required ? 'text-red-600' : 'text-gray-400'}`}>
                        {d.required ? 'REQUIRED' : 'OPTIONAL'}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setWizardStep(0); setWizardData({ product: '', origin: '', destination: '', hsCode: '' }); }}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download Checklist
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
