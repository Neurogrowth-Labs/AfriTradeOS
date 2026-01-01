import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Briefcase, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  FileText, 
  AlertCircle,
  Loader2,
  Package,
  Anchor,
  Check,
  AlertTriangle,
  XCircle,
  Play,
  RefreshCw,
  Download,
  UploadCloud,
  Sliders
} from 'lucide-react';
import { analyzeCompliance } from '../services/geminiService';

type Step = 'create' | 'compliance' | 'execution' | 'settlement';
type SystemStatus = 'nominal' | 'warning' | 'critical';

interface TradeData {
  product: string;
  hsCode: string;
  origin: string;
  destination: string;
  value: string;
  incoterm: string;
}

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
  const [tradeData, setTradeData] = useState<TradeData>({
    product: '',
    hsCode: '',
    origin: 'Ghana',
    destination: 'Kenya',
    value: '',
    incoterm: 'CIF'
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
      const val = parseInt(tradeData.value || '0');
      setSimData({
        nonOriginatingValue: val * 0.4, // Assume 40% non-originating initially
        exWorksPrice: val,
        originCountry: tradeData.origin,
        hsCode: tradeData.hsCode
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
  const complianceStatus = isCompliant ? 'Compliant' : 'Non-Compliant';

  const handleNext = () => {
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
      
      const prompt = `Analyze AfCFTA compliance for exporting ${tradeData.product} (HS Code: ${tradeData.hsCode}, Value: $${tradeData.value}) from ${tradeData.origin} to ${tradeData.destination}. LVC calculated is ${lvcPercentage.toFixed(1)}%.`;
      const result = await analyzeCompliance(prompt);
      setComplianceResult(result);
      
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

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      
      {/* Visual Progress Bar (Top) */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
            className={`h-full transition-all duration-500 ease-out ${
                systemStatus === 'critical' ? 'bg-red-500' :
                systemStatus === 'warning' ? 'bg-amber-400' :
                'bg-emerald-500'
            }`}
            style={{ width: `${getProgressPercent()}%` }}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: Cockpit Checklist (Sidebar) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
             <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Flight Plan</span>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        systemStatus === 'nominal' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                        systemStatus === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                             systemStatus === 'nominal' ? 'bg-emerald-500' :
                             systemStatus === 'warning' ? 'bg-amber-500' :
                             'bg-red-500'
                        }`} />
                        {systemStatus === 'nominal' ? 'System Nominal' : systemStatus === 'warning' ? 'Check Required' : 'Critical Alert'}
                    </div>
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">Trade #TRD-089</h2>
             </div>

             <div className="flex-1 overflow-y-auto py-2">
                 {steps.map((step, idx) => {
                     const isCurrent = step.id === currentStep;
                     const isPast = steps.findIndex(s => s.id === currentStep) > idx;
                     
                     return (
                         <button 
                            key={step.id}
                            onClick={() => goToStep(step.id)}
                            className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors border-l-4 ${
                                isCurrent 
                                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500' 
                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700/50'
                            }`}
                         >
                             <div className={`mt-0.5 ${
                                 isCurrent ? 'text-blue-600 dark:text-blue-400' : 
                                 isPast ? 'text-emerald-500' : 
                                 'text-gray-300 dark:text-gray-600'
                             }`}>
                                 {isPast ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                             </div>
                             <div>
                                 <div className={`text-sm font-semibold ${
                                     isCurrent ? 'text-blue-700 dark:text-blue-300' : 
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
             
             <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-xs text-gray-400 text-center">
                 AfriTradeOS v2.1
             </div>
        </div>

        {/* RIGHT: Main Workspace (Content) */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col relative overflow-hidden">
            
            {/* Step 1: Create Trade */}
            {currentStep === 'create' && (
                <div className="p-8 flex-1 overflow-y-auto animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-blue-500" /> 
                            Initialize Trade
                        </h3>
                        <span className="text-sm text-gray-400">Step 1 of 4</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</label>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all group-hover:bg-white dark:group-hover:bg-slate-950"
                                    placeholder="e.g., Shea Butter"
                                    value={tradeData.product}
                                    onChange={(e) => setTradeData({...tradeData, product: e.target.value})}
                                />
                                {tradeData.product && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">HS Code</label>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono transition-all group-hover:bg-white dark:group-hover:bg-slate-950"
                                    placeholder="####.##"
                                    value={tradeData.hsCode}
                                    onChange={(e) => setTradeData({...tradeData, hsCode: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Origin</label>
                            <select 
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium cursor-pointer"
                                value={tradeData.origin}
                                onChange={(e) => setTradeData({...tradeData, origin: e.target.value})}
                            >
                                <option>Ghana</option>
                                <option>Nigeria</option>
                                <option>Kenya</option>
                                <option>South Africa</option>
                                <option>Egypt</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destination</label>
                            <select 
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium cursor-pointer"
                                value={tradeData.destination}
                                onChange={(e) => setTradeData({...tradeData, destination: e.target.value})}
                            >
                                <option>Kenya</option>
                                <option>South Africa</option>
                                <option>Egypt</option>
                                <option>Ghana</option>
                                <option>Nigeria</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value (USD)</label>
                            <div className="relative group">
                                <input 
                                    type="number" 
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all group-hover:bg-white dark:group-hover:bg-slate-950"
                                    placeholder="0.00"
                                    value={tradeData.value}
                                    onChange={(e) => setTradeData({...tradeData, value: e.target.value})}
                                />
                                {tradeData.value && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">USD</span>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                Incoterm
                                {tradeData.incoterm && <span className="text-blue-500">{tradeData.incoterm} Selected</span>}
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                            {['EXW', 'FOB', 'CIF', 'DDP'].map(term => (
                                <button 
                                    key={term}
                                    onClick={() => setTradeData({...tradeData, incoterm: term})}
                                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                        tradeData.incoterm === term 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
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
                            disabled={systemStatus === 'warning'}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                                systemStatus === 'warning'
                                ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
                            }`}
                        >
                            Next: Compliance <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Compliance (UPGRADED) */}
            {currentStep === 'compliance' && (
                <div className="p-8 flex-1 overflow-y-auto animate-fade-in flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" /> 
                            AfCFTA Rules Engine
                        </h3>
                        <span className="text-sm text-gray-400">Step 2 of 4</span>
                    </div>

                    {!complianceResult ? (
                        <div className="space-y-8">
                            
                            {/* 1. Status Dashboard */}
                            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 ${
                                isCompliant 
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' 
                                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                            }`}>
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-full ${isCompliant ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                                        {isCompliant ? <CheckCircle className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-bold ${isCompliant ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
                                            {isCompliant ? 'AfCFTA Compliant' : 'Non-Compliant'}
                                        </h2>
                                        <p className={`font-medium ${isCompliant ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                                            {isCompliant 
                                                ? 'Eligible for 0% Preferential Duty Rate' 
                                                : 'Requires Standard MFN Duty Payment (15%)'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right min-w-[150px]">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Local Value Content</span>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{lvcPercentage.toFixed(1)}%</div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div 
                                            className={`h-full ${isCompliant ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                            style={{width: `${Math.min(lvcPercentage, 100)}%`}} 
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Threshold: 40%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* 2. What-If Simulator */}
                                <div className="lg:col-span-4 space-y-4">
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Sliders className="w-5 h-5 text-purple-500" />
                                            <h4 className="font-bold text-gray-900 dark:text-white">What-If Simulator</h4>
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

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500 uppercase flex justify-between">
                                                    Ex-Works Price
                                                    <span>${simData.exWorksPrice.toLocaleString()}</span>
                                                </label>
                                                <input 
                                                    type="number"
                                                    value={simData.exWorksPrice}
                                                    onChange={(e) => setSimData({...simData, exWorksPrice: parseInt(e.target.value)})}
                                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-sm">AI Recommendation</h4>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                            {isCompliant 
                                                ? "Current sourcing structure meets the 40% Value Add threshold. You are safe to generate the Certificate of Origin." 
                                                : "LVC is below 40%. Consider sourcing packaging or additives locally to increase Originating Material Value by at least 5%."
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Rules Breakdown & Docs */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Rules of Origin Breakdown</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5"><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Substantial Transformation</p>
                                                    <p className="text-xs text-gray-500">The product has undergone sufficient processing in {simData.originCountry} to change its tariff classification.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {isCompliant ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Value Added Rule (40%)</p>
                                                    <p className="text-xs text-gray-500">Local content must exceed 40% of the ex-works price. Current: {lvcPercentage.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-500" /> Required Documents
                                        </h4>
                                        <div className="space-y-3">
                                            {[
                                                { name: 'AfCFTA Certificate of Origin', status: isCompliant ? 'Ready' : 'Locked' },
                                                { name: 'Supplier Declaration', status: 'Ready' }
                                            ].map((doc, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950/50 rounded-lg border border-gray-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded flex items-center justify-center border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500">PDF</div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{doc.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            disabled={doc.status === 'Locked'}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                doc.status === 'Locked' 
                                                                ? 'text-gray-300 cursor-not-allowed' 
                                                                : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                                            }`}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            disabled={doc.status === 'Locked'}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                                doc.status === 'Locked'
                                                                ? 'bg-gray-100 text-gray-400'
                                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                                            }`}
                                                        >
                                                            {doc.status === 'Locked' ? 'Not Eligible' : 'Generate'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
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
                             {/* Result View (After AI Audit) - Can reuse similar structure or detailed text */}
                             <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                 <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-3">AI Legal Opinion</h5>
                                 <div className="prose prose-sm prose-purple dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                                     <div className="whitespace-pre-wrap">{complianceResult}</div>
                                 </div>
                            </div>
                            <div className="flex justify-end pt-4 gap-3">
                                 <button onClick={() => setComplianceResult(null)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium px-4">
                                     Back to Simulator
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
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Truck className="w-6 h-6 text-teal-500" /> 
                            Logistics Monitor
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                            <span className="text-teal-600 dark:text-teal-400 font-medium">Live Tracking Active</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100%-4rem)]">
                        {/* Timeline */}
                        <div className="lg:col-span-2 space-y-8 pl-4 border-l-2 border-gray-100 dark:border-slate-700 ml-2 relative py-2">
                            {[
                                { title: 'Shipment Booked', date: 'Oct 24, 09:00', status: 'done', desc: 'Freight forwarder confirmed.' },
                                { title: 'Cargo Picked Up', date: 'Oct 25, 14:30', status: 'done', desc: 'Truck en route to Tema Port.' },
                                { title: 'Export Customs', date: 'Oct 26, 10:00', status: 'active', desc: 'Documentation under review.' },
                                { title: 'Ocean Transit', date: 'Est. Oct 30', status: 'pending', desc: 'Vessel: MSC Africa' },
                                { title: 'Import Customs', date: 'Est. Nov 12', status: 'pending', desc: 'Mombasa Port' },
                                { title: 'Final Delivery', date: 'Est. Nov 14', status: 'pending', desc: 'Warehouse Nairobi' }
                            ].map((event, i) => (
                                 <div key={i} className="relative pl-8">
                                     <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 transition-all ${
                                         event.status === 'done' ? 'bg-teal-500 border-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.2)]' :
                                         event.status === 'active' ? 'bg-white dark:bg-slate-800 border-blue-500 animate-pulse' :
                                         'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                                     }`} />
                                     <h4 className={`text-sm font-bold ${event.status === 'pending' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{event.title}</h4>
                                     <span className="text-xs text-gray-400 block mb-1">{event.date}</span>
                                     <p className="text-sm text-gray-500 dark:text-gray-400">{event.desc}</p>
                                 </div>
                            ))}
                        </div>

                        {/* Widgets */}
                        <div className="space-y-4">
                            <div className="bg-teal-50 dark:bg-teal-900/10 p-5 rounded-xl border border-teal-100 dark:border-teal-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="w-5 h-5 text-teal-600" />
                                    <span className="font-bold text-teal-800 dark:text-teal-300 text-sm uppercase">Tracking ID</span>
                                </div>
                                <div className="text-2xl font-mono text-gray-800 dark:text-gray-200">MSCU9483292</div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                 <h5 className="font-bold text-gray-900 dark:text-white mb-3 text-sm uppercase">Action Items</h5>
                                 <div className="space-y-3">
                                     <label className="flex items-start gap-3 cursor-pointer group">
                                         <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                                         <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Upload Packing List</span>
                                     </label>
                                     <label className="flex items-start gap-3 cursor-pointer group">
                                         <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                                         <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Approve Insurance Quote</span>
                                     </label>
                                 </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
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
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
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
                                         <div className="w-6 h-6 bg-gradient-to-tr from-blue-500 to-teal-400 rounded flex items-center justify-center font-bold text-white text-xs">A</div>
                                         <span className="font-bold text-gray-900 dark:text-white tracking-tight">AfriTradeOS</span>
                                     </div>
                                     <p className="text-gray-500 text-sm mt-2">Invoice #INV-2024-001</p>
                                 </div>
                                 <div className="text-right">
                                     <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                                        PAYMENT PENDING
                                     </span>
                                 </div>
                             </div>
                         </div>

                         <div className="p-8 space-y-8">
                             <div className="grid grid-cols-2 gap-8">
                                 <div>
                                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
                                     <p className="font-semibold text-gray-900 dark:text-white">Generic Importer Ltd</p>
                                     <p className="text-sm text-gray-500">Nairobi, Kenya</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Due</p>
                                     <p className="text-3xl font-bold text-gray-900 dark:text-white">$ {parseInt(tradeData.value || "0").toLocaleString()}</p>
                                     <p className="text-sm text-gray-500">Due Nov 24, 2024</p>
                                 </div>
                             </div>

                             <div>
                                 <table className="w-full text-sm">
                                     <thead className="border-b border-gray-100 dark:border-slate-800">
                                         <tr>
                                             <th className="text-left font-semibold text-gray-500 pb-3 pl-2">Description</th>
                                             <th className="text-right font-semibold text-gray-500 pb-3 pr-2">Amount</th>
                                         </tr>
                                     </thead>
                                     <tbody className="text-gray-700 dark:text-gray-300">
                                         <tr>
                                             <td className="py-4 pl-2 border-b border-gray-50 dark:border-slate-800">
                                                 <p className="font-medium text-gray-900 dark:text-white">{tradeData.product}</p>
                                                 <p className="text-xs text-gray-500">{tradeData.incoterm} - {tradeData.origin} to {tradeData.destination}</p>
                                             </td>
                                             <td className="py-4 pr-2 text-right border-b border-gray-50 dark:border-slate-800">
                                                 $ {parseInt(tradeData.value || "0").toLocaleString()}
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </div>

                             <div className="grid grid-cols-2 gap-4 pt-4">
                                 <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                                     <CreditCard className="w-4 h-4" /> Pay Now
                                 </button>
                                 <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                     <FileText className="w-4 h-4" /> Download PDF
                                 </button>
                             </div>
                         </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => setCurrentStep('create')}
                            className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm font-medium transition-colors"
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