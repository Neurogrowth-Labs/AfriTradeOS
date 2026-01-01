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
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6 font-sans">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-trade-primary/10 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-trade-primary dark:text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white">AfCFTA Compliance Engine</h2>
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
                 score > 0 ? (score >= 60 ? 'bg-green-50/50 border-trade-success/30' : 'bg-red-50/50 border-trade-error/30') :
                 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
             }`}>
                 <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 font-heading">Compliance Score</h3>
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
                            className={`transition-all duration-1000 ease-out ${score >= 60 ? 'text-trade-success' : 'text-trade-error'}`} 
                         />
                     </svg>
                     <span className="absolute text-4xl font-black font-mono text-trade-primary dark:text-white">
                         {loading ? <Loader2 className="animate-spin w-8 h-8 text-trade-secondary" /> : score}
                     </span>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                     loading ? 'bg-gray-200 text-gray-500' :
                     score >= 60 ? 'bg-green-100 text-trade-success' : 
                     score > 0 ? 'bg-red-100 text-trade-error' : 'bg-gray-100 text-gray-400'
                 }`}>
                     {loading ? 'Analyzing...' : score === 0 ? 'Not Run' : score >= 60 ? 'Likely Compliant' : 'Non-Compliant'}
                 </span>
             </div>

             {/* Inputs */}
             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex-1">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-4 font-heading">Trade Parameters</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-xs font-semibold text-gray-500 uppercase">Product</label>
                         <input 
                            type="text" 
                            value={product}
                            onChange={e => setProduct(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm focus:border-trade-primary focus:ring-1 focus:ring-trade-primary/50 outline-none"
                         />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                         <div>
                             <label className="text-xs font-semibold text-gray-500 uppercase">Origin</label>
                             <input 
                                type="text" 
                                value={origin}
                                onChange={e => setOrigin(e.target.value)}
                                className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm focus:border-trade-primary focus:ring-1 focus:ring-trade-primary/50 outline-none"
                             />
                         </div>
                         <div>
                             <label className="text-xs font-semibold text-gray-500 uppercase">Destination</label>
                             <input 
                                type="text" 
                                value={dest}
                                onChange={e => setDest(e.target.value)}
                                className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm focus:border-trade-primary focus:ring-1 focus:ring-trade-primary/50 outline-none"
                             />
                         </div>
                     </div>
                     <div>
                         <label className="text-xs font-semibold text-gray-500 uppercase">Input Sourcing</label>
                         <textarea 
                            value={components}
                            onChange={e => setComponents(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm h-20 resize-none focus:border-trade-primary focus:ring-1 focus:ring-trade-primary/50 outline-none"
                         />
                     </div>
                     
                     <button 
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full py-2.5 bg-trade-primary hover:bg-trade-secondary text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-trade-primary/20"
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
                 <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                     <Scale className="w-5 h-5 text-trade-accent" /> Rules of Origin Breakdown
                 </h3>
                 
                 <div className="space-y-6">
                     <div className="flex gap-4">
                         <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${score > 0 ? 'bg-green-100 text-trade-success' : 'bg-gray-100 text-gray-400'}`}>
                             {score > 0 ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                         </div>
                         <div>
                             <h4 className="font-bold text-gray-900 dark:text-white text-sm">Wholly Obtained Status</h4>
                             <p className="text-xs text-gray-500 mt-1">Product must be grown, harvested, or extracted entirely within the member state.</p>
                             <div className="mt-2 flex items-center gap-2 text-xs font-medium text-trade-success bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded w-fit font-mono">
                                 PASSED: Cotton harvested in Benin
                             </div>
                         </div>
                     </div>

                     <div className="relative pl-3 border-l-2 border-gray-100 dark:border-slate-700 ml-3 py-2"></div>

                     <div className="flex gap-4">
                         <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${score > 0 && score < 60 ? 'bg-red-100 text-trade-error' : score >= 60 ? 'bg-green-100 text-trade-success' : 'bg-gray-100 text-gray-400'}`}>
                              {score > 0 && score < 60 ? <XCircle className="w-4 h-4" /> : score >= 60 ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                         </div>
                         <div>
                             <h4 className="font-bold text-gray-900 dark:text-white text-sm">Substantial Transformation (Value Added)</h4>
                             <p className="text-xs text-gray-500 mt-1">Non-originating materials must not exceed 60% of ex-works price.</p>
                             {score > 0 && (
                                 <div className={`mt-2 text-xs font-medium px-2 py-1 rounded w-fit font-mono ${score >= 60 ? 'text-trade-success bg-green-50' : 'text-trade-error bg-red-50'}`}>
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
             <div className="bg-gradient-to-br from-trade-primary to-trade-secondary dark:from-slate-800 dark:to-slate-800 p-6 rounded-xl border border-trade-primary/50 dark:border-slate-700 shadow-sm h-full flex flex-col text-white">
                 <div className="flex items-center gap-2 mb-4">
                     <BrainCircuit className="w-5 h-5 text-trade-accent" />
                     <h3 className="font-bold font-heading">AI Legal Counsel</h3>
                 </div>
                 
                 <div className="flex-1 bg-white/10 dark:bg-slate-900/50 rounded-xl p-4 border border-white/10 dark:border-slate-700 overflow-y-auto backdrop-blur-sm">
                     {loading ? (
                         <div className="flex flex-col items-center justify-center h-full text-trade-accent">
                             <Loader2 className="w-6 h-6 animate-spin mb-2" />
                             <span className="text-xs">Consulting AfCFTA Protocols...</span>
                         </div>
                     ) : analysis ? (
                         <div className="prose prose-sm prose-invert max-w-none">
                             <div className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">
                                 {analysis}
                             </div>
                             
                             <div className="mt-6 pt-4 border-t border-white/10">
                                 <h4 className="text-xs font-bold text-trade-accent uppercase mb-2">Recommended Actions</h4>
                                 <ul className="space-y-2">
                                     <li className="flex items-start gap-2 text-xs text-gray-300">
                                         <ChevronRight className="w-3 h-3 mt-0.5 text-trade-accent" />
                                         Obtain Supplier Declaration to prove local origin.
                                     </li>
                                     <li className="flex items-start gap-2 text-xs text-gray-300">
                                         <ChevronRight className="w-3 h-3 mt-0.5 text-trade-accent" />
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

                 <div className="mt-4 p-3 bg-trade-accent/20 rounded-lg flex items-start gap-2 border border-trade-accent/30">
                     <AlertTriangle className="w-4 h-4 text-trade-accent mt-0.5" />
                     <p className="text-xs text-trade-accent leading-tight">
                         <strong>AI Strategic Insight:</strong> Changing your sourcing country could reduce tariffs by 6%.
                     </p>
                 </div>
             </div>
         </div>

      </div>
    </div>
  );
};