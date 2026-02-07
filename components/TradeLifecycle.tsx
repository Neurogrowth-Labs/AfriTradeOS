
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Briefcase, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  FileText, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Sliders,
  HelpCircle,
  Info
} from 'lucide-react';
import { analyzeCompliance } from '../services/geminiService';
import { mockDatabase } from '../services/mockDatabase';
import { DbTrade } from '../types';

type Step = 'create' | 'compliance' | 'execution' | 'settlement';
type SystemStatus = 'nominal' | 'warning' | 'critical';

// Simulator State
interface ComplianceSim {
  nonOriginatingValue: number;
  exWorksPrice: number;
  originCountry: string;
  hsCode: string;
}

export const TradeLifecycle: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('create');
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('nominal');
  
  // Mapping UI State to Supabase DB Trade Structure
  const [tradeData, setTradeData] = useState<Partial<DbTrade>>({
    product: '',
    hs_code: '',
    origin_country: 'Ghana',
    destination_country: 'Kenya',
    value: 0,
    currency: 'USD',
    incoterm: 'CIF',
    status: 'draft'
  });
  
  // Compliance Analysis State
  const [complianceResult, setComplianceResult] = useState<string | null>(null);
  const [simData, setSimData] = useState<ComplianceSim>({
    nonOriginatingValue: 0,
    exWorksPrice: 0,
    originCountry: 'Ghana',
    hsCode: ''
  });

  // Init simulator data when entering compliance step
  useEffect(() => {
    if (currentStep === 'compliance' && !simData.exWorksPrice) {
      const val = tradeData.value || 0;
      setSimData({
        nonOriginatingValue: val * 0.4, // Assume 40% non-originating initially
        exWorksPrice: val,
        originCountry: tradeData.origin_country || 'Ghana',
        hsCode: tradeData.hs_code || ''
      });
    }
  }, [currentStep, tradeData]);

  const steps: { id: Step; label: string; sub: string; icon: any }[] = [
    { id: 'create', label: 'Deal Capture', sub: 'Initialize trade parameters', icon: Briefcase },
    { id: 'compliance', label: 'Compliance Check', sub: 'AfCFTA Rules of Origin', icon: ShieldCheck },
    { id: 'execution', label: 'Logistics Execution', sub: 'Track movement', icon: Truck },
    { id: 'settlement', label: 'Settlement', sub: 'Invoicing & Finance', icon: CreditCard },
  ];

  // Update system status based on data validity for current step
  useEffect(() => {
    if (currentStep === 'create') {
        const isComplete = tradeData.product && tradeData.value && tradeData.incoterm;
        setSystemStatus(isComplete ? 'nominal' : 'warning');
    }
  }, [tradeData, currentStep]);

  // Dynamic Compliance Calculation
  const lvcPercentage = simData.exWorksPrice > 0 
    ? ((simData.exWorksPrice - simData.nonOriginatingValue) / simData.exWorksPrice) * 100 
    : 0;
  
  const isCompliant = lvcPercentage >= 40; // Simple AfCFTA rule: 40% Value Add

  const handleNext = async () => {
    setLoading(true);
    try {
      if (currentStep === 'create') {
        const savedTrade = await mockDatabase.createTrade({
          ...tradeData,
          status: 'pending_compliance'
        });
        if (savedTrade && savedTrade.id) {
          setTradeData(prev => ({ ...prev, id: savedTrade.id, status: 'pending_compliance' }));
        }
      } else if (currentStep === 'compliance' && tradeData.id) {
        await mockDatabase.updateTrade(tradeData.id, {
          status: 'pending_execution',
          compliance_status: complianceResult || 'pending'
        });
        setTradeData(prev => ({ ...prev, status: 'pending_execution' }));
      } else if (currentStep === 'execution' && tradeData.id) {
        await mockDatabase.updateTrade(tradeData.id, {
          status: 'pending_settlement',
          logistics_status: 'completed'
        });
        setTradeData(prev => ({ ...prev, status: 'pending_settlement' }));
      } else if (currentStep === 'settlement' && tradeData.id) {
        await mockDatabase.updateTrade(tradeData.id, {
          status: 'completed',
          settlement_status: 'paid'
        });
        setTradeData(prev => ({ ...prev, status: 'completed' }));
      }
    } catch (error) {
      console.error("Failed to save trade", error);
    } finally {
      setLoading(false);
    }

    const idx = steps.findIndex(s => s.id === currentStep);
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id);
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  }

  const handleRunCompliance = async () => {
    setLoading(true);
    setSystemStatus('warning');
    try {
      // Simulate API delay for effect
      await new Promise(r => setTimeout(r, 1500));
      
      // const prompt = `Analyze AfCFTA compliance...`;
      // const result = await analyzeCompliance(prompt); 
      setComplianceResult(isCompliant ? "compliant" : "non_compliant");
      
      if (!isCompliant) {
          setSystemStatus('critical');
      } else {
          setSystemStatus('nominal');
      }
    } catch (e) {
      console.error(e);
      setSystemStatus('critical');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercent = () => {
    const idx = steps.findIndex(s => s.id === currentStep);
    return ((idx + 1) / steps.length) * 100;
  };

  const explain = (term: string) => {
    const event = new CustomEvent('open-copilot', { 
        detail: { message: `Why is "${term}" required for this trade? Explain simply in 1 sentence.` } 
    });
    window.dispatchEvent(event);
  };

  const handlePayment = () => {
      alert("Redirecting to Secure Payment Gateway (Pan-African Payment and Settlement System)...");
  };

  const handleDownload = () => {
      alert("Downloading Commercial Invoice #INV-2024-001...");
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      
      {/* Visual Progress Bar (Top) */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
            className={`h-full transition-all duration-500 ease-out ${
                systemStatus === 'critical' ? 'bg-trade-error' :
                systemStatus === 'warning' ? 'bg-trade-warning' :
                'bg-trade-success'
            }`}
            style={{ width: `${getProgressPercent()}%` }}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: Cockpit Checklist (Sidebar) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
             <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider font-heading">Flight Plan</span>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        systemStatus === 'nominal' ? 'bg-green-100 dark:bg-green-900/30 text-trade-success border-green-200 dark:border-green-800' :
                        systemStatus === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-trade-warning border-amber-200 dark:border-amber-800' :
                        'bg-red-100 dark:bg-red-900/30 text-trade-error border-red-200 dark:border-red-800'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                             systemStatus === 'nominal' ? 'bg-trade-success' :
                             systemStatus === 'warning' ? 'bg-trade-warning' :
                             'bg-trade-error'
                        }`} />
                        {systemStatus === 'nominal' ? 'System Nominal' : systemStatus === 'warning' ? 'Check Required' : 'Critical Alert'}
                    </div>
                </div>
                <h2 className="font-bold font-heading text-trade-primary dark:text-white">
                    {tradeData.id ? `Trade #${tradeData.id.slice(0,8)}` : 'New Trade'}
                </h2>
             </div>

             <div className="flex-1 overflow-y-auto py-2">
                 {steps.map((step, idx) => {
                     const isCurrent = step.id === currentStep;
                     const isPast = steps.findIndex(s => s.id === currentStep) > idx;
                     
                     return (
                         <button 
                            key={step.id}
                            onClick={() => goToStep(step.id)}
                            disabled={!tradeData.id && idx > 0} // Disable future steps if not saved
                            className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors border-l-4 ${
                                isCurrent 
                                ? 'bg-blue-50 dark:bg-blue-900/10 border-trade-primary' 
                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                         >
                             <div className={`mt-0.5 ${
                                 isCurrent ? 'text-trade-primary dark:text-blue-400' : 
                                 isPast ? 'text-trade-success' : 
                                 'text-gray-300 dark:text-gray-600'
                             }`}>
                                 {isPast ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                             </div>
                             <div>
                                 <div className={`text-sm font-semibold font-heading ${
                                     isCurrent ? 'text-trade-primary dark:text-blue-300' : 
                                     isPast ? 'text-gray-700 dark:text-gray-300' : 
                                     'text-gray-400 dark:text-gray-500'
                                 }`}>
                                     {step.label}
                                 </div>
                                 <div className="text-xs text-gray-400 dark:text-gray-500">{step.sub}</div>
                             </div>
                         </button>
                     )
                 })}
             </div>
             
             <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-xs text-gray-400 text-center font-mono">
                 AfriTradeOS v2.1
             </div>
        </div>

        {/* RIGHT: Main Workspace (Content) */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col relative overflow-hidden">
            
            {/* Step 1: Create Trade */}
            {currentStep === 'create' && (
                <div className="p-8 flex-1 overflow-y-auto animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-trade-secondary" /> 
                            Initialize Trade
                        </h3>
                        <span className="text-sm text-gray-400">Step 1 of 4</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</label>
                            </div>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-trade-primary/20 focus:border-trade-primary outline-none font-medium transition-all group-hover:bg-white dark:group-hover:bg-slate-950"
                                    placeholder="e.g., Shea Butter"
                                    value={tradeData.product}
                                    onChange={(e) => setTradeData({...tradeData, product: e.target.value})}
                                />
                                {tradeData.product && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-trade-success animate-in zoom-in" />}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 pl-1">Describe the main commodity being traded.</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">HS Code</label>
                                <button onClick={() => explain('HS Code')} className="text-gray-400 hover:text-trade-primary transition-colors flex items-center gap-1 text-[10px]" title="Why is this required?">
                                    <Info className="w-3 h-3" /> Why is this needed?
                                </button>
                            </div>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-trade-primary/20 focus:border-trade-primary outline-none font-mono transition-all group-hover:bg-white dark:group-hover:bg-slate-950"
                                    placeholder="####.##"
                                    value={tradeData.hs_code}
                                    onChange={(e) => setTradeData({...tradeData, hs_code: e.target.value})}
                                />
                                {tradeData.hs_code && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-trade-success animate-in zoom-in" />}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 pl-1">Used to calculate tariff duties.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Origin</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-trade-primary/20 focus:border-trade-primary outline-none font-medium cursor-pointer appearance-none"
                                    value={tradeData.origin_country}
                                    onChange={(e) => setTradeData({...tradeData, origin_country: e.target.value})}
                                >
                                    <option>Ghana</option>
                                    <option>Nigeria</option>
                                    <option>Kenya</option>
                                    <option>South Africa</option>
                                    <option>Egypt</option>
                                </select>
                                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-trade-success animate-in zoom-in" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 pl-1">Determines AfCFTA eligibility.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destination</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-trade-primary/20 focus:border-trade-primary outline-none font-medium cursor-pointer appearance-none"
                                    value={tradeData.destination_country}
                                    onChange={(e) => setTradeData({...tradeData, destination_country: e.target.value})}
                                >
                                    <option>Kenya</option>
                                    <option>South Africa</option>
                                    <option>Egypt</option>
                                    <option>Ghana</option>
                                    <option>Nigeria</option>
                                </select>
                                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-trade-success animate-in zoom-in" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 pl-1">Where the goods are being shipped to.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value (USD)</label>
                            <div className="relative group">
                                <input 
                                    type="number" 
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-trade-primary/20 focus:border-trade-primary outline-none font-medium transition-all group-hover:bg-white dark:group-hover:bg-slate-950"
                                    placeholder="0.00"
                                    value={tradeData.value || ''}
                                    onChange={(e) => setTradeData({...tradeData, value: parseFloat(e.target.value)})}
                                />
                                {tradeData.value ? (
                                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-trade-success animate-in zoom-in" />
                                ) : (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">USD</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 pl-1">Basis for customs valuation.</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                    Incoterm
                                    {tradeData.incoterm && <span className="text-trade-secondary ml-2">{tradeData.incoterm} Selected</span>}
                                </label>
                                <button onClick={() => explain('Incoterms')} className="text-gray-400 hover:text-trade-primary transition-colors flex items-center gap-1 text-[10px]" title="What are Incoterms?">
                                    <Info className="w-3 h-3" /> Why?
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                            {['EXW', 'FOB', 'CIF', 'DDP'].map(term => (
                                <button 
                                    key={term}
                                    onClick={() => setTradeData({...tradeData, incoterm: term})}
                                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                        tradeData.incoterm === term 
                                        ? 'bg-trade-primary text-white border-trade-primary shadow-lg shadow-trade-primary/20' 
                                        : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {term}
                                </button>
                            ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-auto pt-6 border-t border-gray-100 dark:border-slate-700">
                        <button 
                            onClick={handleNext}
                            disabled={systemStatus === 'warning' || loading}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                                systemStatus === 'warning' || loading
                                ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                                : 'bg-trade-primary hover:bg-trade-secondary text-white shadow-lg shadow-trade-primary/20 hover:shadow-trade-primary/30'
                            }`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next: Compliance <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Compliance (Content is largely the same, just keeping the structure) */}
            {currentStep === 'compliance' && (
                <div className="p-8 flex-1 overflow-y-auto animate-fade-in flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" /> 
                            AfCFTA Rules Engine
                        </h3>
                        <span className="text-sm text-gray-400">Step 2 of 4</span>
                    </div>

                    {!complianceResult ? (
                        <div className="space-y-8">
                             <div className="lg:col-span-4 space-y-4">
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Sliders className="w-5 h-5 text-purple-500" />
                                                <h4 className="font-bold text-gray-900 dark:text-white">What-If Simulator</h4>
                                            </div>
                                            <button onClick={() => explain('Rules of Origin Value Add')} className="text-gray-400 hover:text-purple-500">
                                                <HelpCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500 uppercase">Sourcing Origin</label>
                                                <select 
                                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-sm"
                                                    value={simData.originCountry}
                                                    onChange={(e) => setSimData({...simData, originCountry: e.target.value})}
                                                >
                                                    <option>Ghana</option>
                                                    <option>Nigeria</option>
                                                    <option>South Africa</option>
                                                    <option>China (Non-Originating)</option>
                                                    <option>India (Non-Originating)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500 uppercase flex justify-between">
                                                    Non-Originating Value
                                                    <span>${simData.nonOriginatingValue.toLocaleString()}</span>
                                                </label>
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max={simData.exWorksPrice} 
                                                    step="100"
                                                    value={simData.nonOriginatingValue}
                                                    onChange={(e) => setSimData({...simData, nonOriginatingValue: parseInt(e.target.value)})}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                             </div>
                             <div className="lg:col-span-8 space-y-6">
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                        <h4 className="font-bold font-heading text-gray-900 dark:text-white mb-4">Rules of Origin Breakdown</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5"><CheckCircle className="w-5 h-5 text-trade-success" /></div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Substantial Transformation</p>
                                                    <p className="text-xs text-gray-500">The product has undergone sufficient processing in {simData.originCountry} to change its tariff classification.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {isCompliant ? <CheckCircle className="w-5 h-5 text-trade-success" /> : <AlertCircle className="w-5 h-5 text-trade-error" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Value Added Rule (40%)</p>
                                                    <p className="text-xs text-gray-500">Local content must exceed 40% of the ex-works price. Current: {lvcPercentage.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                             </div>

                            <div className="flex justify-end pt-4 gap-3">
                                 <button 
                                    onClick={handleRunCompliance}
                                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium px-4 flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" /> Full AI Audit
                                </button>
                                <button 
                                    onClick={handleNext}
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                                >
                                    Proceed to Execution <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                             <div className={`p-6 rounded-xl border flex gap-4 items-start animate-fade-in ${
                                 complianceResult === 'compliant' 
                                 ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' 
                                 : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                             }`}>
                                 {complianceResult === 'compliant' 
                                    ? <CheckCircle className="w-6 h-6 text-trade-success shrink-0" /> 
                                    : <AlertCircle className="w-6 h-6 text-trade-error shrink-0" />
                                 }
                                 <div>
                                     <h5 className={`text-lg font-bold font-heading mb-1 ${
                                         complianceResult === 'compliant' ? 'text-trade-success' : 'text-trade-error'
                                     }`}>
                                         {complianceResult === 'compliant' ? 'Compliance Confirmed' : 'Compliance Alert'}
                                     </h5>
                                     <p className="text-sm text-gray-700 dark:text-gray-300">
                                         {complianceResult === 'compliant' 
                                            ? "Your trade is AfCFTA-compliant and ready for execution. You are eligible for 0% preferential tariff rates." 
                                            : "Value added is below 40%. This shipment may face full MFN tariffs unless local content is increased."}
                                     </p>
                                 </div>
                            </div>
                            <div className="flex justify-end pt-4 gap-3">
                                 <button onClick={() => setComplianceResult(null)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium px-4">
                                     Modify Parameters
                                 </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Step 3: Execution */}
            {currentStep === 'execution' && (
                <div className="p-8 flex-1 overflow-y-auto animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
                            <Truck className="w-6 h-6 text-teal-500" /> 
                            Logistics Monitor
                        </h3>
                    </div>
                    {/* Placeholder content for execution */}
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-10 rounded-xl text-center text-gray-500">
                        <p>Logistics tracking initialized for Trade ID: {tradeData.id}</p>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700 mt-6">
                        <button 
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20"
                        >
                            Finalize & Settle <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Settlement */}
            {currentStep === 'settlement' && (
                <div className="p-8 flex-1 overflow-y-auto animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-emerald-500" /> 
                            Financial Settlement
                        </h3>
                        <span className="text-sm text-gray-400">Step 4 of 4</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-0 rounded-2xl border border-gray-200 dark:border-slate-700 max-w-2xl mx-auto shadow-sm overflow-hidden">
                         <div className="bg-gray-50 dark:bg-slate-950/50 p-8 border-b border-gray-200 dark:border-slate-700">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                         <div className="w-6 h-6 bg-gradient-to-tr from-trade-secondary to-trade-primary rounded flex items-center justify-center font-bold font-heading text-white text-xs">A</div>
                                         <span className="font-bold font-heading text-gray-900 dark:text-white tracking-tight">AfriTradeOS</span>
                                     </div>
                                     <p className="text-gray-500 text-sm mt-2">Invoice #INV-2024-{tradeData.id ? tradeData.id.slice(0,4) : '001'}</p>
                                 </div>
                                 <div className="text-right">
                                     <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 font-mono">
                                        PAYMENT PENDING
                                     </span>
                                 </div>
                             </div>
                         </div>
                         <div className="p-8 space-y-8">
                              <div className="grid grid-cols-2 gap-8">
                                 <div>
                                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
                                     <p className="font-semibold text-gray-900 dark:text-white">Importer ({tradeData.destination_country})</p>
                                     <p className="text-sm text-gray-500">Net 30 Terms</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Due</p>
                                     <p className="text-3xl font-bold font-mono text-gray-900 dark:text-white">$ {(tradeData.value || 0).toLocaleString()}</p>
                                     <p className="text-sm text-gray-500">Due Nov 24, 2024</p>
                                 </div>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4 pt-4">
                                 <button onClick={handlePayment} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                                     <CreditCard className="w-4 h-4" /> Pay Now
                                 </button>
                                 <button onClick={handleDownload} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                     <FileText className="w-4 h-4" /> Download PDF
                                 </button>
                             </div>
                         </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => {
                                setTradeData({ product: '', hs_code: '', value: 0, status: 'draft', origin_country: 'Ghana', destination_country: 'Kenya' });
                                setCurrentStep('create');
                            }}
                            className="text-gray-500 hover:text-trade-primary dark:text-gray-400 dark:hover:text-blue-400 text-sm font-medium transition-colors"
                        >
                            Start New Trade
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
