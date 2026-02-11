import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { 
  Landmark, 
  ShieldAlert, 
  TrendingUp, 
  FileCheck, 
  ArrowRight, 
  Clock,
  CheckCircle,
  Loader2,
  Plus,
  X,
  DollarSign,
  Calculator,
  Shield,
  AlertTriangle,
  TrendingDown,
  Percent,
  Info,
  RefreshCw,
  Zap
} from 'lucide-react';
import { mockDatabase } from '../services/mockDatabase';
import { DbFinanceRequest } from '../types';

// FX Rate data types
interface FXRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  history: { time: string; rate: number }[];
}

// Tariff calculator types
interface TariffResult {
  cif: number;
  duty: number;
  dutyRate: number;
  vat: number;
  vatRate: number;
  afcftaDiscount: number;
  totalTax: number;
  totalLanded: number;
}

// Hedging suggestion types
interface HedgingSuggestion {
  id: string;
  type: 'forward' | 'option' | 'swap';
  pair: string;
  description: string;
  savings: string;
  risk: 'low' | 'medium' | 'high';
  term: string;
}

interface ReadinessBreakdown {
  label: string;
  score: number;
  max: number;
}

interface CountryRisk {
  country: string;
  risk: number;
  value: number;
  percentage: number;
}

interface Financier {
  id: string;
  name: string;
  type: string;
  product: string;
  interest_rate: number;
  term: string;
  min_score: number;
  logo_initial: string;
}

const FALLBACK_FUNDING_OPTIONS: Financier[] = [
  { id: 'opt_1', name: 'Ecobank', type: 'Bank', product: 'Letter of Credit', interest_rate: 2.5, term: '90 Days', min_score: 70, logo_initial: 'E' },
  { id: 'opt_2', name: 'Afreximbank', type: 'DFI', product: 'Trade Guarantee', interest_rate: 1.8, term: '180 Days', min_score: 80, logo_initial: 'A' },
  { id: 'opt_3', name: 'Allianz', type: 'Insurer', product: 'Credit Insurance', interest_rate: 0.9, term: 'Annual', min_score: 60, logo_initial: 'AL' },
  { id: 'opt_4', name: 'Stanbic IBTC', type: 'Bank', product: 'Invoice Factoring', interest_rate: 3.2, term: '60 Days', min_score: 65, logo_initial: 'S' },
  { id: 'opt_5', name: 'DBSA', type: 'DFI', product: 'Import Guarantee', interest_rate: 2.0, term: '120 Days', min_score: 75, logo_initial: 'D' },
  { id: 'opt_6', name: 'ATI', type: 'Insurer', product: 'Supplier Credit Insurance', interest_rate: 1.2, term: 'Annual', min_score: 55, logo_initial: 'AT' },
];

// Mock FX rates data
const MOCK_FX_RATES: FXRate[] = [
  { pair: 'USD/NGN', rate: 1550.25, change: -12.50, changePercent: -0.80, history: Array.from({length: 30}, (_, i) => ({ time: `Day ${i+1}`, rate: 1530 + Math.sin(i * 0.3) * 40 + Math.random() * 20 })) },
  { pair: 'USD/KES', rate: 129.45, change: 0.85, changePercent: 0.66, history: Array.from({length: 30}, (_, i) => ({ time: `Day ${i+1}`, rate: 127 + Math.sin(i * 0.2) * 3 + Math.random() * 2 })) },
  { pair: 'USD/ZAR', rate: 18.72, change: -0.15, changePercent: -0.80, history: Array.from({length: 30}, (_, i) => ({ time: `Day ${i+1}`, rate: 18.2 + Math.sin(i * 0.25) * 0.8 + Math.random() * 0.3 })) },
  { pair: 'USD/GHS', rate: 15.80, change: 0.22, changePercent: 1.41, history: Array.from({length: 30}, (_, i) => ({ time: `Day ${i+1}`, rate: 15.3 + Math.sin(i * 0.15) * 0.6 + Math.random() * 0.2 })) },
  { pair: 'USD/EGP', rate: 50.85, change: -0.35, changePercent: -0.68, history: Array.from({length: 30}, (_, i) => ({ time: `Day ${i+1}`, rate: 49.5 + Math.sin(i * 0.18) * 1.5 + Math.random() * 0.5 })) },
];

const MOCK_HEDGING: HedgingSuggestion[] = [
  { id: 'h1', type: 'forward', pair: 'USD/NGN', description: 'Lock in current rate of 1,550.25 for 90 days to protect against Naira depreciation', savings: '$4,200', risk: 'low', term: '90 days' },
  { id: 'h2', type: 'option', pair: 'USD/KES', description: 'Buy a put option at 130 KES strike for downside protection with upside flexibility', savings: '$1,800', risk: 'medium', term: '60 days' },
  { id: 'h3', type: 'swap', pair: 'USD/ZAR', description: 'Currency swap arrangement for recurring ZAR payments, reducing transaction costs', savings: '$3,500', risk: 'low', term: '180 days' },
  { id: 'h4', type: 'forward', pair: 'USD/GHS', description: 'Forward contract to hedge Cedi exposure on pending cocoa export payments', savings: '$2,100', risk: 'medium', term: '120 days' },
];

export const TradeFinance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'options' | 'applications' | 'fx_rates' | 'calculator' | 'hedging'>('options');
  const [applications, setApplications] = useState<DbFinanceRequest[]>([]);
  const [financiers, setFinanciers] = useState<Financier[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFinanciers, setLoadingFinanciers] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Financier | null>(null);
  const [applyForm, setApplyForm] = useState({ amount: '', product_type: '' });
  const [submitting, setSubmitting] = useState(false);

  // Finance Readiness Score state
  const [readinessScore, setReadinessScore] = useState(50);
  const [readinessBreakdown, setReadinessBreakdown] = useState<ReadinessBreakdown[]>([]);
  const [countryRisks, setCountryRisks] = useState<CountryRisk[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // FX & Calculator state
  const [selectedFXPair, setSelectedFXPair] = useState<FXRate>(MOCK_FX_RATES[0]);
  const [calcForm, setCalcForm] = useState({ cifValue: 10000, hsCode: '0709.93', origin: 'Ghana', destination: 'Kenya', isAfcfta: true });
  const [calcResult, setCalcResult] = useState<TariffResult | null>(null);

  // Calculate tariff
  const calculateTariff = () => {
    const dutyRate = calcForm.isAfcfta ? 0 : 20; // AfCFTA = 0% duty
    const vatRate = calcForm.destination === 'Kenya' ? 16 : calcForm.destination === 'Nigeria' ? 7.5 : calcForm.destination === 'South Africa' ? 15 : calcForm.destination === 'Egypt' ? 14 : 15;
    const duty = (calcForm.cifValue * dutyRate) / 100;
    const vat = ((calcForm.cifValue + duty) * vatRate) / 100;
    const afcftaDiscount = calcForm.isAfcfta ? (calcForm.cifValue * 20) / 100 : 0;
    setCalcResult({
      cif: calcForm.cifValue,
      duty, dutyRate, vat, vatRate,
      afcftaDiscount,
      totalTax: duty + vat,
      totalLanded: calcForm.cifValue + duty + vat,
    });
  };

  // Load financiers and metrics on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingFinanciers(true);
      setLoadingMetrics(true);
      
      try {
        // Load financiers
        const financiersData = await mockDatabase.getFinanciers();
        setFinanciers(financiersData.length > 0 ? financiersData : FALLBACK_FUNDING_OPTIONS);
        
        // Load finance readiness score
        const readiness = await mockDatabase.calculateFinanceReadiness();
        setReadinessScore(readiness.score);
        setReadinessBreakdown(readiness.breakdown);
        
        // Load country risk exposure
        const risks = await mockDatabase.calculateCountryRiskExposure();
        setCountryRisks(risks);
      } catch (e) {
        setFinanciers(FALLBACK_FUNDING_OPTIONS);
        setReadinessScore(50);
      } finally {
        setLoadingFinanciers(false);
        setLoadingMetrics(false);
      }
    };
    loadData();
  }, []);

  const fetchApplications = async () => {
      setLoading(true);
      try {
          const data = await mockDatabase.getFinanceRequests('current_user');
          setApplications(data);
      } catch(e) {
          console.error("Failed to fetch applications", e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    if (activeTab === 'applications') {
        fetchApplications();
    }
  }, [activeTab]);

  const handleApply = (provider: Financier) => {
    setSelectedProvider(provider);
    setApplyForm({ amount: '', product_type: provider.product });
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!applyForm.amount || !selectedProvider) return;
    
    setSubmitting(true);
    try {
      const result = await mockDatabase.createFinanceRequest({
        product_type: `${selectedProvider.name} - ${applyForm.product_type}`,
        amount: parseFloat(applyForm.amount),
        financier_id: selectedProvider.id !== 'opt_1' && selectedProvider.id !== 'opt_2' && selectedProvider.id !== 'opt_3' ? selectedProvider.id : undefined
      });
      
      if (result) {
        setShowApplyModal(false);
        setActiveTab('applications');
        fetchApplications();
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (e) {
      console.error('Submit error:', e);
      alert('Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Landmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trade Finance & Risk</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">L/C, invoice financing, guarantees & cross-border risk management</p>
             </div>
         </div>
         <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600">
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            <span>FX Exposure: <span className="font-bold text-gray-900 dark:text-white">$124,500</span></span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Stats & Risk */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           
           {/* Readiness Score */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">Finance Readiness Score</h3>
              {loadingMetrics ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                <>
                  <div className="h-48 w-full relative flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={[
                                { name: 'Ready', value: readinessScore, color: readinessScore >= 80 ? '#10b981' : readinessScore >= 60 ? '#f59e0b' : '#ef4444' },
                                { name: 'Gap', value: 100 - readinessScore, color: '#e2e8f0' },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              startAngle={180}
                              endAngle={0}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              <Cell fill={readinessScore >= 80 ? '#10b981' : readinessScore >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth={0} />
                              <Cell fill="#e2e8f0" strokeWidth={0} />
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-0 text-center">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">{readinessScore}</span>
                        <span className="block text-xs text-gray-500">
                          {readinessScore >= 80 ? 'Excellent' : readinessScore >= 60 ? 'Good' : readinessScore >= 40 ? 'Fair' : 'Poor'}
                        </span>
                     </div>
                  </div>
                  
                  {/* Breakdown */}
                  {readinessBreakdown.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {readinessBreakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full" 
                                style={{ width: `${(item.score / item.max) * 100}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-700 dark:text-gray-300 w-10 text-right">{item.score}/{item.max}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-4 text-center">
                     {readinessScore >= 80 
                       ? 'You qualify for premium trade financing options.' 
                       : readinessScore >= 60 
                         ? 'You qualify for standard trade loans. Complete KYC to improve.' 
                         : 'Complete your profile and KYC to unlock financing options.'}
                  </p>
                </>
              )}
           </div>

           {/* Risk Dashboard */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex-1 min-h-0 overflow-hidden">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                  Country Risk Exposure
                  <TrendingUp className="w-4 h-4" />
              </h3>
              {loadingMetrics ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : countryRisks.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No trade data available
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="h-48 flex-shrink-0">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={countryRisks.map(r => ({ name: r.country, risk: r.risk }))} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                           <XAxis type="number" hide domain={[0, 100]} />
                           <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 10, fill: '#64748b'}} />
                           <Tooltip
                             cursor={{fill: 'transparent'}}
                             contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white' }}
                             formatter={(value: number) => [`${value}/100`, 'Risk Score']}
                           />
                           <Bar dataKey="risk" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={10} name="Risk Score" />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>

                  {/* Exposure breakdown */}
                  <div className="mt-3 space-y-1 flex-shrink-0">
                    {countryRisks.slice(0, 3).map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 truncate max-w-[100px]">{r.country}</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {r.percentage > 0 ? `${r.percentage}%` : 'No trades'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {countryRisks.some(r => r.risk >= 60 && r.percentage >= 30) && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 flex-shrink-0">
                       <p className="text-[10px] text-red-700 dark:text-red-300">
                          <span className="font-bold">Alert:</span> High concentration in risky markets.
                       </p>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>

        {/* Right Column: Funding Marketplace + New Tabs */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
           <div className="flex border-b border-gray-100 dark:border-slate-700 overflow-x-auto">
              {[
                { id: 'options' as const, label: 'Funding', icon: Landmark },
                { id: 'applications' as const, label: 'Applications', icon: FileCheck },
                { id: 'fx_rates' as const, label: 'FX Rates', icon: TrendingUp },
                { id: 'calculator' as const, label: 'Calculator', icon: Calculator },
                { id: 'hedging' as const, label: 'Hedging', icon: Shield },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
           </div>

           <div className="p-6 flex-1 overflow-y-auto">

              {/* A9: FX RATES CHARTS */}
              {activeTab === 'fx_rates' && (
                <div className="space-y-6">
                  {/* Rate Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {MOCK_FX_RATES.map(fx => (
                      <button
                        key={fx.pair}
                        onClick={() => setSelectedFXPair(fx)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedFXPair.pair === fx.pair
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                            : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <p className="text-[10px] font-bold text-gray-500 uppercase">{fx.pair}</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{fx.rate.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        <p className={`text-xs font-bold flex items-center gap-1 ${fx.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {fx.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {fx.change >= 0 ? '+' : ''}{fx.changePercent.toFixed(2)}%
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Selected Chart */}
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{selectedFXPair.pair}</h4>
                        <p className="text-xs text-gray-500">30-Day Historical Chart</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{selectedFXPair.rate.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        <p className={`text-xs font-bold ${selectedFXPair.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedFXPair.change >= 0 ? '+' : ''}{selectedFXPair.change.toFixed(2)} ({selectedFXPair.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedFXPair.history}>
                          <defs>
                            <linearGradient id="fxGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                          <XAxis dataKey="time" tick={{fontSize: 9}} stroke="#94a3b8" />
                          <YAxis tick={{fontSize: 10}} stroke="#94a3b8" domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '12px'}} />
                          <Area type="monotone" dataKey="rate" stroke="#6366f1" fill="url(#fxGrad)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* A10: TARIFF/VAT/AfCFTA CALCULATOR */}
              {activeTab === 'calculator' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calculator Form */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-indigo-500" /> Tariff & Tax Calculator
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">CIF Value (USD)</label>
                        <input
                          type="number"
                          value={calcForm.cifValue}
                          onChange={(e) => setCalcForm(prev => ({ ...prev, cifValue: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">HS Code</label>
                        <input
                          type="text"
                          value={calcForm.hsCode}
                          onChange={(e) => setCalcForm(prev => ({ ...prev, hsCode: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                          placeholder="####.##"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Origin</label>
                          <select
                            value={calcForm.origin}
                            onChange={(e) => setCalcForm(prev => ({ ...prev, origin: e.target.value }))}
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none"
                          >
                            {['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'Egypt'].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Destination</label>
                          <select
                            value={calcForm.destination}
                            onChange={(e) => setCalcForm(prev => ({ ...prev, destination: e.target.value }))}
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none"
                          >
                            {['Kenya', 'Nigeria', 'South Africa', 'Egypt', 'Ghana'].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={calcForm.isAfcfta}
                          onChange={(e) => setCalcForm(prev => ({ ...prev, isAfcfta: e.target.checked }))}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">AfCFTA Preferential Tariff</span>
                          <p className="text-[10px] text-gray-500">Apply 0% duty under African Continental Free Trade Area</p>
                        </div>
                      </label>
                      <button
                        onClick={calculateTariff}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Calculator className="w-4 h-4" /> Calculate
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  <div>
                    {calcResult ? (
                      <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-white">Cost Breakdown</h3>
                        <div className="space-y-2">
                          {[
                            { label: 'CIF Value', value: calcResult.cif, color: 'text-gray-900' },
                            { label: `Import Duty (${calcResult.dutyRate}%)`, value: calcResult.duty, color: calcResult.duty === 0 ? 'text-green-600' : 'text-red-600' },
                            { label: `VAT (${calcResult.vatRate}%)`, value: calcResult.vat, color: 'text-amber-600' },
                          ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                              <span className={`font-bold font-mono ${item.color} dark:text-white`}>${item.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                          ))}
                        </div>
                        {calcResult.afcftaDiscount > 0 && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800 dark:text-green-300">AfCFTA Savings</span>
                            </div>
                            <span className="font-bold font-mono text-green-700 dark:text-green-400">-${calcResult.afcftaDiscount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                        )}
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-900/30">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-indigo-900 dark:text-indigo-300">Total Landed Cost</span>
                            <span className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-400">${calcResult.totalLanded.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Total taxes: ${calcResult.totalTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                        <Calculator className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-sm">Enter trade details and click Calculate</p>
                        <p className="text-xs mt-1">to see the full cost breakdown</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* A11: CURRENCY HEDGING SUGGESTIONS */}
              {activeTab === 'hedging' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-500" /> AI Hedging Recommendations
                    </h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> AI-Powered
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Based on your trade portfolio exposure and current FX volatility</p>
                  <div className="space-y-3">
                    {MOCK_HEDGING.map(h => (
                      <div key={h.id} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              h.type === 'forward' ? 'bg-blue-100 text-blue-600' :
                              h.type === 'option' ? 'bg-purple-100 text-purple-600' : 'bg-teal-100 text-teal-600'
                            }`}>
                              {h.type === 'forward' ? <ArrowRight className="w-4 h-4" /> :
                               h.type === 'option' ? <Shield className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white capitalize">{h.type} Contract</h4>
                              <span className="text-xs text-gray-500">{h.pair} &middot; {h.term}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-green-600">{h.savings}</span>
                            <p className="text-[10px] text-gray-400">Est. savings</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{h.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            h.risk === 'low' ? 'bg-green-100 text-green-700' :
                            h.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>Risk: {h.risk}</span>
                          <button className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
                            Apply Strategy <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Portfolio Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Portfolio FX Exposure Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Total Exposure</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">$124,500</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hedged</p>
                        <p className="text-lg font-bold text-green-600">$45,200</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Unhedged</p>
                        <p className="text-lg font-bold text-red-600">$79,300</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'options' && (
                 <div className="grid grid-cols-1 gap-4">
                    {loadingFinanciers ? (
                      <div className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 text-indigo-500 mx-auto" /></div>
                    ) : financiers.map(opt => (
                       <div key={opt.id} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group relative overflow-hidden">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-gray-500 text-xl">
                                   {opt.logo_initial}
                                </div>
                                <div>
                                   <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{opt.name}</h4>
                                      <span className="text-[10px] uppercase font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{opt.type}</span>
                                   </div>
                                   <p className="text-sm text-gray-500">{opt.product}</p>
                                </div>
                             </div>
                             <div className="text-right hidden sm:block">
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{opt.interest_rate}%</p>
                                <p className="text-xs text-gray-400">Interest Rate</p>
                             </div>
                          </div>
                          
                          <div className="mt-4 flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                             <div>
                                <p className="text-xs text-gray-400 uppercase">Term</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{opt.term}</p>
                             </div>
                             <div>
                                <p className="text-xs text-gray-400 uppercase">Readiness</p>
                                <div className="flex items-center gap-1">
                                    <span className={`font-semibold ${78 >= opt.min_score ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {78 >= opt.min_score ? 'Qualified' : `Need ${opt.min_score}`}
                                    </span>
                                </div>
                             </div>
                             <div className="ml-auto">
                                <button 
                                   onClick={() => handleApply(opt)}
                                   className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                                >
                                   Apply Now <ArrowRight className="w-4 h-4" />
                                </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              )}

              {activeTab === 'applications' && (
                 <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 text-indigo-500 mx-auto" /></div>
                    ) : applications.map(app => (
                       <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-700">
                          <div className="flex items-center gap-4">
                             <div className={`p-2 rounded-full ${
                                app.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                                app.status === 'under_review' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'
                             }`}>
                                {app.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{app.provider_name}</h4>
                                <p className="text-xs text-gray-500">{app.product_type} • {app.id}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="font-bold text-gray-900 dark:text-white">${app.amount.toLocaleString()}</p>
                             <p className={`text-xs font-bold ${
                                app.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'
                             }`}>{app.status.replace('_', ' ')}</p>
                             <p className="text-[10px] text-gray-400">{app.date_requested}</p>
                          </div>
                       </div>
                    ))}
                    
                    {!loading && applications.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No active applications</p>
                            <button 
                              onClick={() => setActiveTab('options')}
                              className="mt-4 text-indigo-600 hover:underline text-sm font-medium"
                            >
                              Browse funding options
                            </button>
                        </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center font-bold text-indigo-600 text-xl">
                    {selectedProvider.logo_initial}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedProvider.name}</h2>
                    <p className="text-sm text-gray-500">{selectedProvider.product}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requested Amount (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={applyForm.amount}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Interest Rate</p>
                  <p className="text-lg font-bold text-indigo-600">{selectedProvider.interest_rate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Term</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedProvider.term}</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-bold">Note:</span> Your application will be reviewed within 2-3 business days. Ensure all trade documents are up to date.
                </p>
              </div>

              <button
                onClick={handleSubmitApplication}
                disabled={!applyForm.amount || submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                ) : (
                  <><Plus className="w-5 h-5" /> Submit Application</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};