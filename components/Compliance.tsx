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
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">AfCFTA Compliance Engine</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automated Rules of Origin Verification</p>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
         
         {/* Left Panel: Inputs & Score */}
         <div className="lg:col-span-3 flex flex-col gap-6">
             {/* Score Card */}
             <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                 loading ? 'bg-gray-50 border-gray-200' :
                 score > 0 ? (score >= 60 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800') :
                 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
             }`}>
                 <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Compliance Score</h3>
                 <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                     <svg className="w-full h-full transform -rotate-90">
                         <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" className="text-gray-200 dark:text-slate-700" />
                         <circle 
                            cx="64" 
                            cy="64" 
                            r="56" 
                            stroke="currentColor" 
                            strokeWidth="12" 
                            fill="none" 
                            strokeDasharray={351} 
                            strokeDashoffset={351 - (351 * score) / 100} 
                            className={`transition-all duration-1000 ease-out ${score >= 60 ? 'text-emerald-500' : 'text-red-500'}`} 
                         />
                     </svg>
                     <span className="absolute text-4xl font-black text-gray-900 dark:text-white">
                         {loading ? <Loader2 className="animate-spin w-8 h-8 text-purple-500" /> : score}
                     </span>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                     loading ? 'bg-gray-200 text-gray-500' :
                     score >= 60 ? 'bg-emerald-200 text-emerald-800' : 
                     score > 0 ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-400'
                 }`}>
                     {loading ? 'Analyzing...' : score === 0 ? 'Not Run' : score >= 60 ? 'Likely Compliant' : 'Non-Compliant'}
                 </span>
             </div>

             {/* Inputs */}
             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex-1">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trade Parameters</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-xs font-semibold text-gray-500 uppercase">Product</label>
                         <input 
                            type="text" 
                            value={product}
                            onChange={e => setProduct(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm"
                         />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                         <div>
                             <label className="text-xs font-semibold text-gray-500 uppercase">Origin</label>
                             <input 
                                type="text" 
                                value={origin}
                                onChange={e => setOrigin(e.target.value)}
                                className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm"
                             />
                         </div>
                         <div>
                             <label className="text-xs font-semibold text-gray-500 uppercase">Destination</label>
                             <input 
                                type="text" 
                                value={dest}
                                onChange={e => setDest(e.target.value)}
                                className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm"
                             />
                         </div>
                     </div>
                     <div>
                         <label className="text-xs font-semibold text-gray-500 uppercase">Input Sourcing</label>
                         <textarea 
                            value={components}
                            onChange={e => setComponents(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm h-20 resize-none"
                         />
                     </div>
                     
                     <button 
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                     >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Run Simulation
                     </button>
                 </div>
             </div>
         </div>

         {/* Center Panel: Rules Breakdown */}
         <div className="lg:col-span-5 flex flex-col">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm h-full overflow-y-auto">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                     <Scale className="w-5 h-5 text-blue-500" /> Rules of Origin Breakdown
                 </h3>
                 
                 <div className="space-y-6">
                     <div className="flex gap-4">
                         <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${score > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                             {score > 0 ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                         </div>
                         <div>
                             <h4 className="font-bold text-gray-900 dark:text-white text-sm">Wholly Obtained Status</h4>
                             <p className="text-xs text-gray-500 mt-1">Product must be grown, harvested, or extracted entirely within the member state.</p>
                             <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded w-fit">
                                 PASSED: Cotton harvested in Benin
                             </div>
                         </div>
                     </div>

                     <div className="relative pl-3 border-l-2 border-gray-100 dark:border-slate-700 ml-3 py-2"></div>

                     <div className="flex gap-4">
                         <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${score > 0 && score < 60 ? 'bg-red-100 text-red-600' : score >= 60 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                              {score > 0 && score < 60 ? <XCircle className="w-4 h-4" /> : score >= 60 ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                         </div>
                         <div>
                             <h4 className="font-bold text-gray-900 dark:text-white text-sm">Substantial Transformation (Value Added)</h4>
                             <p className="text-xs text-gray-500 mt-1">Non-originating materials must not exceed 60% of ex-works price.</p>
                             {score > 0 && (
                                 <div className={`mt-2 text-xs font-medium px-2 py-1 rounded w-fit ${score >= 60 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                     {score >= 60 ? 'PASSED: 60% Local Content' : 'FAILED: High non-originating content'}
                                 </div>
                             )}
                         </div>
                     </div>
                     
                     <div className="relative pl-3 border-l-2 border-gray-100 dark:border-slate-700 ml-3 py-2"></div>

                     <div className="flex gap-4">
                         <div className="mt-1 w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0 text-gray-400">
                             <div className="w-2 h-2 rounded-full bg-current" />
                         </div>
                         <div>
                             <h4 className="font-bold text-gray-900 dark:text-white text-sm">Change in Tariff Heading (CTH)</h4>
                             <p className="text-xs text-gray-500 mt-1">Final product HS code must differ from non-originating input codes.</p>
                         </div>
                     </div>
                 </div>

                 {score === 0 && (
                     <div className="mt-8 p-8 text-center text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                         <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                         <p className="text-sm">Run simulation to see breakdown</p>
                     </div>
                 )}
             </div>
         </div>

         {/* Right Panel: AI Explanation */}
         <div className="lg:col-span-4 flex flex-col">
             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm h-full flex flex-col">
                 <div className="flex items-center gap-2 mb-4">
                     <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                     <h3 className="font-bold text-gray-900 dark:text-white">AI Legal Counsel</h3>
                 </div>
                 
                 <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-indigo-50 dark:border-slate-700 overflow-y-auto">
                     {loading ? (
                         <div className="flex flex-col items-center justify-center h-full text-indigo-400">
                             <Loader2 className="w-6 h-6 animate-spin mb-2" />
                             <span className="text-xs">Consulting AfCFTA Protocols...</span>
                         </div>
                     ) : analysis ? (
                         <div className="prose prose-sm prose-indigo dark:prose-invert max-w-none">
                             <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                 {analysis}
                             </div>
                             
                             <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Recommended Actions</h4>
                                 <ul className="space-y-2">
                                     <li className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                         <ChevronRight className="w-3 h-3 mt-0.5 text-indigo-500" />
                                         Obtain Supplier Declaration for locally sourced cotton.
                                     </li>
                                     <li className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                         <ChevronRight className="w-3 h-3 mt-0.5 text-indigo-500" />
                                         Apply for AfCFTA Certificate of Origin via Customs Portal.
                                     </li>
                                 </ul>
                             </div>
                         </div>
                     ) : (
                         <div className="text-center text-gray-400 py-10">
                             <p className="text-sm">AI analysis will appear here after simulation.</p>
                         </div>
                     )}
                 </div>

                 <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-start gap-2">
                     <AlertTriangle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                     <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-tight">
                         <strong>Pro Tip:</strong> Increasing local sourcing by 5% would secure "Wholly Obtained" status, eliminating tariff risks completely.
                     </p>
                 </div>
             </div>
         </div>

      </div>
    </div>
  );
};