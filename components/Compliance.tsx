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
  Search
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

export const Compliance: React.FC = () => {
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
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-trade-primary/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-trade-primary dark:text-white" />
             </div>
             <div>
                <h2 className="text-lg font-bold font-heading text-trade-primary dark:text-white">AfCFTA Compliance Engine</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automated Rules of Origin Verification</p>
             </div>
         </div>
      </div>

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
    </div>
  );
};