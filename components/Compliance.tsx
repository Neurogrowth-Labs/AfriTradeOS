import React, { useState } from 'react';
import { 
  Scale, 
  FileCheck, 
  BrainCircuit, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ShieldCheck, 
  RefreshCw, 
  Search,
  BarChart3,
  Globe,
  BookOpen,
  ArrowRight,
  ChevronDown,
  Clock,
  FileText,
  MapPin,
  Bell,
  Zap,
  Circle
} from 'lucide-react';
import { analyzeCompliance } from '../services/geminiService';

const AFRICAN_COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", 
  "Cameroon", "Central African Republic", "Chad", "Comoros", "DR Congo", "Republic of Congo", 
  "Cote d'Ivoire", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", 
  "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", 
  "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", 
  "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", 
  "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", 
  "Tunisia", "Uganda", "Zambia", "Zimbabwe"
];

// B10: Compliance dashboard risk data
const COMPLIANCE_RISKS = [
  { id: 'r1', area: 'Rules of Origin', status: 'compliant', score: 92, details: 'AfCFTA certificate valid until Dec 2026' },
  { id: 'r2', area: 'Import Licensing', status: 'warning', score: 65, details: 'Import permit renewal due in 30 days' },
  { id: 'r3', area: 'Customs Documentation', status: 'compliant', score: 88, details: 'All import declarations up to date' },
  { id: 'r4', area: 'Sanctions Screening', status: 'compliant', score: 100, details: 'No matches found in latest screening' },
  { id: 'r5', area: 'Import VAT & Duties', status: 'critical', score: 35, details: 'VAT registration pending for Nigeria imports' },
  { id: 'r6', area: 'Product Standards', status: 'warning', score: 70, details: 'Conformity certificate expiring in 60 days' },
  { id: 'r7', area: 'Tariff Classification', status: 'compliant', score: 95, details: 'HS codes verified for AfCFTA preferential rates' },
  { id: 'r8', area: 'Pre-Shipment Inspection', status: 'warning', score: 72, details: 'PVoC inspection required for next shipment' },
];

// B11: Cross-border requirement guides
const CROSS_BORDER_GUIDES = [
  {
    id: 'g1', title: 'Exporting to Nigeria', country: 'Nigeria', steps: [
      { step: 1, title: 'Obtain Export License', description: 'Apply through your country\'s trade ministry. Processing: 5-10 business days.', required: true },
      { step: 2, title: 'Product Certification', description: 'Obtain SON (Standards Organisation of Nigeria) conformity certificate.', required: true },
      { step: 3, title: 'AfCFTA Certificate of Origin', description: 'Apply via customs portal with proof of local content ≥40%.', required: true },
      { step: 4, title: 'Customs Declaration', description: 'Complete NCS Single Window declaration form. Include HS codes.', required: true },
      { step: 5, title: 'Payment of Duties', description: 'Pay applicable tariffs (reduced under AfCFTA). Ensure FOREX compliance.', required: true },
    ]
  },
  {
    id: 'g2', title: 'Exporting to Kenya', country: 'Kenya', steps: [
      { step: 1, title: 'Register with KRA', description: 'Register as an importer/exporter with Kenya Revenue Authority.', required: true },
      { step: 2, title: 'KEBS Standards Mark', description: 'Obtain Kenya Bureau of Standards certification for your product.', required: true },
      { step: 3, title: 'Pre-Shipment Inspection', description: 'Arrange PVoC (Pre-Export Verification of Conformity) inspection.', required: true },
      { step: 4, title: 'IDF Application', description: 'Apply for Import Declaration Form through KRA iTax portal.', required: true },
    ]
  },
  {
    id: 'g3', title: 'Exporting to South Africa', country: 'South Africa', steps: [
      { step: 1, title: 'SARS Registration', description: 'Register with South African Revenue Service for customs.', required: true },
      { step: 2, title: 'NRCS Compliance', description: 'Ensure product meets National Regulator for Compulsory Specifications.', required: true },
      { step: 3, title: 'Letter of Authority', description: 'Obtain import permit from ITAC if product requires one.', required: false },
      { step: 4, title: 'Customs Clearance', description: 'Submit SAD500 form through customs broker. Pay duties via eFiling.', required: true },
    ]
  },
  {
    id: 'g4', title: 'Importing from Ghana', country: 'Ghana', steps: [
      { step: 1, title: 'Verify AfCFTA Eligibility', description: 'Confirm product qualifies for AfCFTA preferential tariff rates with Certificate of Origin.', required: true },
      { step: 2, title: 'Import Permit Application', description: 'Apply for import permit through your country\'s trade regulatory body.', required: true },
      { step: 3, title: 'Pre-Arrival Declaration', description: 'Submit advance customs declaration at least 48h before shipment arrival.', required: true },
      { step: 4, title: 'Duty & Tax Calculation', description: 'Calculate applicable AfCFTA reduced duties and local VAT. Use tariff calculator.', required: true },
      { step: 5, title: 'Customs Inspection', description: 'Schedule inspection at port of entry. Prepare all supporting documents.', required: true },
    ]
  },
  {
    id: 'g5', title: 'Importing from Egypt', country: 'Egypt', steps: [
      { step: 1, title: 'Verify Certificate of Origin', description: 'Ensure supplier provides valid AfCFTA or bilateral trade certificate.', required: true },
      { step: 2, title: 'Quality & Standards Check', description: 'Verify product meets destination country\'s standards (KEBS, SON, SABS).', required: true },
      { step: 3, title: 'Import Declaration Filing', description: 'File import declaration through your country\'s Single Window system.', required: true },
      { step: 4, title: 'Payment & Clearance', description: 'Pay applicable duties (check AfCFTA reductions) and clear goods at port.', required: true },
    ]
  },
];

export const Compliance: React.FC = () => {
  const [activeView, setActiveView] = useState<'simulator' | 'dashboard' | 'guides' | 'checklist'>('simulator');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [product, setProduct] = useState('Cotton T-Shirts');
  const [origin, setOrigin] = useState('Benin');
  const [dest, setDest] = useState('Nigeria');
  const [components, setComponents] = useState('40% sourced from India, 60% locally sourced');
  
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const scenario = `Exporting ${product} from ${origin} to ${dest}. Components: ${components}. Analyze Rules of Origin compliance.`;
      const result = await analyzeCompliance(scenario);
      setAnalysis(result);
      // Simulate score calculation based on result length/content for demo
      setScore(result.toLowerCase().includes('compliant') ? 92 : 45);
    } catch (e) {
      setAnalysis("Error analyzing compliance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-5 animate-fade-in pb-4 font-sans">
      
      {/* Header with Tabs */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
         <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-3">
               <div className="p-2 bg-trade-primary/10 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-trade-primary dark:text-white" />
               </div>
               <div>
                  <h2 className="text-lg font-bold font-heading text-trade-primary dark:text-white">Import Compliance Engine</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AfCFTA regulatory guidelines, AI compliance checker & policy change alerts</p>
               </div>
           </div>
         </div>
         <div className="flex gap-2">
           {[
             { id: 'simulator' as const, label: 'RoO Simulator', icon: Scale },
             { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
             { id: 'checklist' as const, label: 'Checklist', icon: FileCheck },
             { id: 'guides' as const, label: 'Cross-Border Guides', icon: BookOpen },
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveView(tab.id)}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                 activeView === tab.id ? 'bg-trade-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
               }`}>
               <tab.icon className="w-3.5 h-3.5" /> {tab.label}
             </button>
           ))}
         </div>
      </div>

      {/* B10: COMPLIANCE DASHBOARD */}
      {activeView === 'dashboard' && (
        <div className="flex-1 flex flex-col gap-5">
          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 text-center">
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-slate-700" />
                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="none"
                    strokeDasharray={213} strokeDashoffset={213 - (213 * 75) / 100}
                    className="text-amber-500 transition-all duration-700" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-trade-primary dark:text-white">75%</span>
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Overall Compliance</p>
              <p className="text-[10px] text-amber-600">Needs Attention</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
              <div className="grid grid-cols-3 gap-3 h-full">
                {[
                  { label: 'Compliant', count: COMPLIANCE_RISKS.filter(r => r.status === 'compliant').length, color: 'text-green-600 bg-green-100' },
                  { label: 'Warning', count: COMPLIANCE_RISKS.filter(r => r.status === 'warning').length, color: 'text-amber-600 bg-amber-100' },
                  { label: 'Critical', count: COMPLIANCE_RISKS.filter(r => r.status === 'critical').length, color: 'text-red-600 bg-red-100' },
                ].map(s => (
                  <div key={s.label} className="text-center flex flex-col items-center justify-center">
                    <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.count}</p>
                    <p className="text-[10px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex flex-col justify-center">
              <p className="text-xs text-gray-500 uppercase mb-2">Last Audit</p>
              <p className="text-sm font-bold text-trade-primary dark:text-white flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Feb 8, 2026</p>
              <p className="text-xs text-gray-500 mt-2 mb-1">Next Review</p>
              <p className="text-sm font-bold text-trade-primary dark:text-white flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Mar 1, 2026</p>
            </div>
          </div>

          {/* Risk Items */}
          <div className="space-y-3">
            {COMPLIANCE_RISKS.map(risk => (
              <div key={risk.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-5 flex items-center justify-between ${
                risk.status === 'critical' ? 'border-red-200 dark:border-red-900/30' :
                risk.status === 'warning' ? 'border-amber-200 dark:border-amber-900/30' :
                'border-gray-100 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    risk.status === 'compliant' ? 'bg-green-100 text-green-600' :
                    risk.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {risk.status === 'compliant' ? <CheckCircle className="w-5 h-5" /> :
                     risk.status === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                     <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{risk.area}</h4>
                    <p className="text-xs text-gray-500">{risk.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        risk.score >= 80 ? 'bg-green-500' : risk.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`} style={{ width: `${risk.score}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{risk.score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTERACTIVE COMPLIANCE CHECKLIST */}
      {activeView === 'checklist' && (
        <div className="flex-1 flex flex-col gap-4">
          {/* Regulatory Change Alert */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Regulatory Update — Nigeria</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">New SON conformity assessment requirement effective March 2026. Products in HS Chapter 84-85 now require additional certification.</p>
              <button className="mt-2 text-[10px] font-bold text-amber-700 hover:text-amber-900 underline">View Full Notice</button>
            </div>
          </div>

          {/* AI Compliance Assistant */}
          <div className="bg-gradient-to-r from-trade-primary to-trade-secondary rounded-xl p-4 text-white flex items-center gap-4">
            <div className="p-2.5 bg-white/20 rounded-xl shrink-0"><Zap className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium">AI Compliance Assistant: You have <span className="font-bold">3 items</span> requiring action. Complete them to maintain your compliance score above 80%.</p>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {[
              { id: 'ck1', title: 'Certificate of Origin', category: 'Customs', status: 'complete' as const, description: 'AfCFTA Certificate of Origin filed and verified', deadline: 'Completed Feb 1' },
              { id: 'ck2', title: 'Import License Renewal', category: 'Licensing', status: 'warning' as const, description: 'Import permit expires in 30 days — renewal required', deadline: 'Due Mar 15' },
              { id: 'ck3', title: 'VAT Registration (Nigeria)', category: 'Duties', status: 'critical' as const, description: 'VAT registration pending for Nigeria import operations', deadline: 'Overdue' },
              { id: 'ck4', title: 'Product Standards (KEBS)', category: 'Standards', status: 'pending' as const, description: 'Kenya Bureau of Standards certification for electronics', deadline: 'Due Apr 1' },
              { id: 'ck5', title: 'Sanctions Screening', category: 'Compliance', status: 'complete' as const, description: 'Latest screening completed — no matches found', deadline: 'Completed Feb 8' },
              { id: 'ck6', title: 'Pre-Shipment Inspection', category: 'Customs', status: 'pending' as const, description: 'PVoC inspection required for next Kenya-bound shipment', deadline: 'Due Mar 20' },
              { id: 'ck7', title: 'Customs Bond Renewal', category: 'Customs', status: 'complete' as const, description: 'Customs bond guarantee renewed for 2026', deadline: 'Completed Jan 15' },
              { id: 'ck8', title: 'AfCFTA Tariff Classification', category: 'Duties', status: 'complete' as const, description: 'HS codes verified for preferential tariff rates', deadline: 'Completed Feb 5' },
            ].map(item => (
              <div key={item.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-4 flex items-center gap-4 transition-all hover:shadow-sm ${
                item.status === 'critical' ? 'border-red-200 dark:border-red-900/30' :
                item.status === 'warning' ? 'border-amber-200 dark:border-amber-900/30' :
                item.status === 'complete' ? 'border-green-200 dark:border-green-900/30' :
                'border-gray-100 dark:border-slate-700'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.status === 'complete' ? 'bg-green-100 text-green-600' :
                  item.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                  item.status === 'critical' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {item.status === 'complete' ? <CheckCircle className="w-4 h-4" /> :
                   item.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                   item.status === 'critical' ? <XCircle className="w-4 h-4" /> :
                   <Circle className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">{item.category}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[10px] font-bold ${
                    item.status === 'critical' ? 'text-red-600' :
                    item.status === 'warning' ? 'text-amber-600' :
                    item.status === 'complete' ? 'text-green-600' : 'text-gray-500'
                  }`}>{item.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B11: CROSS-BORDER GUIDES */}
      {activeView === 'guides' && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900/30 p-4 flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800 dark:text-blue-300">Step-by-step compliance guides for exporting to key African markets under AfCFTA.</p>
          </div>
          {CROSS_BORDER_GUIDES.map(guide => (
            <div key={guide.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <button onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 dark:text-white">{guide.title}</h3>
                    <p className="text-xs text-gray-500">{guide.steps.length} steps • {guide.steps.filter(s => s.required).length} required</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedGuide === guide.id ? 'rotate-180' : ''}`} />
              </button>
              {expandedGuide === guide.id && (
                <div className="border-t border-gray-100 dark:border-slate-700 p-5 space-y-4">
                  {guide.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold">{step.step}</div>
                        {idx < guide.steps.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-slate-700 my-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">{step.title}</h4>
                          {step.required && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded">REQUIRED</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ORIGINAL SIMULATOR VIEW */}
      {activeView === 'simulator' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
         
         {/* Left Panel: Inputs & Score */}
         <div className="lg:col-span-3 flex flex-col gap-5">
             {/* Score Card */}
             <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                 loading ? 'bg-gray-50 border-gray-200' :
                 score > 0 ? (score >= 60 ? 'bg-green-50/50 border-trade-success/30' : 'bg-red-50/50 border-trade-error/30') :
                 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
             }`}>
                 <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 font-heading">Compliance Score</h3>
                 <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                     <svg className="w-full h-full transform -rotate-90">
                         <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-200 dark:text-slate-700" />
                         <circle 
                            cx="56" 
                            cy="56" 
                            r="48" 
                            stroke="currentColor" 
                            strokeWidth="10" 
                            fill="none" 
                            strokeDasharray={301} 
                            strokeDashoffset={301 - (301 * score) / 100} 
                            className={`transition-all duration-1000 ease-out ${score >= 60 ? 'text-trade-success' : 'text-trade-error'}`} 
                         />
                     </svg>
                     <span className="absolute text-3xl font-black font-mono text-trade-primary dark:text-white">
                         {loading ? <Loader2 className="animate-spin w-6 h-6 text-trade-secondary" /> : score}
                     </span>
                 </div>
                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                     loading ? 'bg-gray-200 text-gray-500' :
                     score >= 60 ? 'bg-green-100 text-trade-success' : 
                     score > 0 ? 'bg-red-100 text-trade-error' : 'bg-gray-100 text-gray-400'
                 }`}>
                     {loading ? 'Analyzing...' : score === 0 ? 'Not Run' : score >= 60 ? 'Likely Compliant' : 'Non-Compliant'}
                 </span>
             </div>

             {/* Inputs */}
             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex-1">
                 <h3 className="font-bold text-trade-primary dark:text-white mb-3 font-heading text-sm">Trade Parameters</h3>
                 <div className="space-y-3">
                     <div>
                         <label className="text-[10px] font-semibold text-gray-500 uppercase">Product</label>
                         <input 
                            type="text" 
                            value={product}
                            onChange={e => setProduct(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-trade-primary dark:text-white text-xs focus:border-trade-primary focus:ring-1 focus:ring-trade-primary/50 outline-none"
                         />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                         <div>
                             <label className="text-[10px] font-semibold text-gray-500 uppercase">Origin</label>
                             <input 
                                type="text" 
                                value={origin}
                                onChange={e => setOrigin(e.target.value)}
                                className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-trade-primary dark:text-white text-xs focus:border-trade-primary focus:ring-1 focus:ring-trade-primary/50 outline-none"
                             />
                         </div>
                         <div>
                             <label className="text-[10px] font-semibold text-gray-500 uppercase">Destination</label>
                             <select 
                                value={dest}
                                onChange={e => setDest(e.target.value)}
                                className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-trade-primary dark:text-white text-xs focus:border-trade-primary focus:ring-1 focus:ring-trade-primary/50 outline-none appearance-none cursor-pointer"
                             >
                                {AFRICAN_COUNTRIES.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                             </select>
                         </div>
                     </div>
                     <div>
                         <label className="text-[10px] font-semibold text-gray-500 uppercase">Input Sourcing</label>
                         <textarea 
                            value={components}
                            onChange={e => setComponents(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-trade-primary dark:text-white text-xs h-16 resize-none focus:border-trade-primary focus:ring-1 focus:ring-trade-primary/50 outline-none"
                         />
                     </div>
                     
                     <button 
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full py-2 bg-trade-primary hover:bg-trade-secondary text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-trade-primary/20"
                     >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Run Simulation
                     </button>
                 </div>
             </div>
         </div>

         {/* Center Panel: Rules Breakdown */}
         <div className="lg:col-span-5 flex flex-col">
             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm h-full overflow-y-auto">
                 <h3 className="text-base font-bold font-heading text-trade-primary dark:text-white mb-5 flex items-center gap-2">
                     <Scale className="w-4 h-4 text-trade-accent" /> Rules of Origin Breakdown
                 </h3>
                 
                 <div className="space-y-5">
                     <div className="flex gap-3">
                         <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${score > 0 ? 'bg-green-100 text-trade-success' : 'bg-gray-100 text-gray-400'}`}>
                             {score > 0 ? <CheckCircle className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                         </div>
                         <div>
                             <h4 className="font-bold text-trade-primary dark:text-white text-xs">Wholly Obtained Status</h4>
                             <p className="text-[10px] text-gray-500 mt-0.5">Product must be grown, harvested, or extracted entirely within the member state.</p>
                             <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-trade-success bg-green-50 dark:bg-green-900/10 px-2 py-0.5 rounded w-fit font-mono">
                                 PASSED: Cotton harvested in {origin}
                             </div>
                         </div>
                     </div>

                     <div className="relative pl-2.5 border-l-2 border-gray-100 dark:border-slate-700 ml-2.5 py-1"></div>

                     <div className="flex gap-3">
                         <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${score > 0 && score < 60 ? 'bg-red-100 text-trade-error' : score >= 60 ? 'bg-green-100 text-trade-success' : 'bg-gray-100 text-gray-400'}`}>
                              {score > 0 && score < 60 ? <XCircle className="w-3 h-3" /> : score >= 60 ? <CheckCircle className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                         </div>
                         <div>
                             <h4 className="font-bold text-trade-primary dark:text-white text-xs">Substantial Transformation (Value Added)</h4>
                             <p className="text-[10px] text-gray-500 mt-0.5">Non-originating materials must not exceed 60% of ex-works price.</p>
                             {score > 0 && (
                                 <div className={`mt-1 text-[10px] font-medium px-2 py-0.5 rounded w-fit font-mono ${score >= 60 ? 'text-trade-success bg-green-50' : 'text-trade-error bg-red-50'}`}>
                                     {score >= 60 ? 'PASSED: 60% Local Content' : 'FAILED: High non-originating content'}
                                 </div>
                             )}
                         </div>
                     </div>
                     
                     <div className="relative pl-2.5 border-l-2 border-gray-100 dark:border-slate-700 ml-2.5 py-1"></div>

                     <div className="flex gap-3">
                         <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0 text-gray-400">
                             <div className="w-1.5 h-1.5 rounded-full bg-current" />
                         </div>
                         <div>
                             <h4 className="font-bold text-trade-primary dark:text-white text-xs">Change in Tariff Heading (CTH)</h4>
                             <p className="text-[10px] text-gray-500 mt-0.5">Final product HS code must differ from non-originating input codes.</p>
                         </div>
                     </div>
                 </div>

                 {score === 0 && (
                     <div className="mt-6 p-6 text-center text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                         <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                         <p className="text-xs">Run simulation to see breakdown</p>
                     </div>
                 )}
             </div>
         </div>

         {/* Right Panel: AI Explanation */}
         <div className="lg:col-span-4 flex flex-col">
             <div className="bg-gradient-to-br from-trade-primary to-trade-secondary dark:from-slate-800 dark:to-slate-800 p-5 rounded-xl border border-trade-primary/50 dark:border-slate-700 shadow-sm h-full flex flex-col text-white">
                 <div className="flex items-center gap-2 mb-3">
                     <BrainCircuit className="w-4 h-4 text-trade-accent" />
                     <h3 className="font-bold font-heading text-sm">AI Legal Counsel</h3>
                 </div>
                 
                 <div className="flex-1 bg-white/10 dark:bg-slate-900/50 rounded-xl p-3 border border-white/10 dark:border-slate-700 overflow-y-auto backdrop-blur-sm">
                     {loading ? (
                         <div className="flex flex-col items-center justify-center h-full text-trade-accent">
                             <Loader2 className="w-5 h-5 animate-spin mb-1" />
                             <span className="text-[10px]">Consulting AfCFTA Protocols...</span>
                         </div>
                     ) : analysis ? (
                         <div className="prose prose-sm prose-invert max-w-none">
                             <div className="text-xs text-gray-100 whitespace-pre-wrap leading-relaxed">
                                 {analysis}
                             </div>
                             
                             <div className="mt-4 pt-3 border-t border-white/10">
                                 <h4 className="text-[10px] font-bold text-trade-accent uppercase mb-1">Recommended Actions</h4>
                                 <ul className="space-y-1">
                                     <li className="flex items-start gap-2 text-[10px] text-gray-300">
                                         <ChevronRight className="w-2.5 h-2.5 mt-0.5 text-trade-accent" />
                                         Obtain Supplier Declaration to prove local origin in {origin}.
                                     </li>
                                     <li className="flex items-start gap-2 text-[10px] text-gray-300">
                                         <ChevronRight className="w-2.5 h-2.5 mt-0.5 text-trade-accent" />
                                         Apply for AfCFTA Certificate of Origin via Customs Portal.
                                     </li>
                                 </ul>
                             </div>
                         </div>
                     ) : (
                         <div className="text-center text-gray-400 py-8">
                             <p className="text-xs">AI analysis will appear here after simulation.</p>
                         </div>
                     )}
                 </div>

                 <div className="mt-3 p-2.5 bg-trade-accent/20 rounded-lg flex items-start gap-2 border border-trade-accent/30">
                     <AlertTriangle className="w-3.5 h-3.5 text-trade-accent mt-0.5" />
                     <p className="text-[10px] text-trade-accent leading-tight">
                         <strong>AI Strategic Insight:</strong> Changing your sourcing country could reduce tariffs by 6% when exporting to {dest}.
                     </p>
                 </div>
             </div>
         </div>

      </div>
      )}
    </div>
  );
};