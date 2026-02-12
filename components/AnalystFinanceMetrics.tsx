
import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Shield,
  CreditCard,
  Landmark,
  ArrowRight,
  Zap,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// --- DATA ---
const FX_LIVE = [
  { pair: 'NGN/USD', rate: 1650.25, change: -2.5, bid: 1648.50, ask: 1652.00, spread: 3.50 },
  { pair: 'KES/USD', rate: 152.80, change: 1.2, bid: 152.60, ask: 153.00, spread: 0.40 },
  { pair: 'ZAR/USD', rate: 18.45, change: -0.8, bid: 18.43, ask: 18.47, spread: 0.04 },
  { pair: 'GHS/USD', rate: 14.92, change: -1.1, bid: 14.90, ask: 14.94, spread: 0.04 },
  { pair: 'EGP/USD', rate: 48.50, change: -3.2, bid: 48.40, ask: 48.60, spread: 0.20 },
  { pair: 'XOF/USD', rate: 605.50, change: 0.3, bid: 605.00, ask: 606.00, spread: 1.00 },
];

const FX_HISTORY = [
  { time: 'Mon', NGN: 1620, KES: 154, ZAR: 18.2, GHS: 14.7 },
  { time: 'Tue', NGN: 1635, KES: 153.5, ZAR: 18.3, GHS: 14.75 },
  { time: 'Wed', NGN: 1640, KES: 153, ZAR: 18.4, GHS: 14.8 },
  { time: 'Thu', NGN: 1648, KES: 152.8, ZAR: 18.45, GHS: 14.85 },
  { time: 'Fri', NGN: 1650, KES: 152.5, ZAR: 18.5, GHS: 14.9 },
  { time: 'Sat', NGN: 1652, KES: 152.8, ZAR: 18.48, GHS: 14.92 },
];

const FINANCE_PRODUCTS = [
  { id: 'fp1', name: 'Letter of Credit', provider: 'Ecobank', rate: '2.5%', term: '90 days', minScore: 70, type: 'Trade Finance' },
  { id: 'fp2', name: 'Export Factoring', provider: 'Afreximbank', rate: '3.2%', term: '60 days', minScore: 65, type: 'Receivables' },
  { id: 'fp3', name: 'Supply Chain Finance', provider: 'Standard Bank', rate: '1.8%', term: '120 days', minScore: 75, type: 'SCF' },
  { id: 'fp4', name: 'Trade Insurance', provider: 'ATI (Africa)', rate: '0.8%', term: '180 days', minScore: 50, type: 'Insurance' },
  { id: 'fp5', name: 'Working Capital Loan', provider: 'KCB Group', rate: '4.5%', term: '12 months', minScore: 60, type: 'Lending' },
  { id: 'fp6', name: 'Forfaiting', provider: 'FirstRand', rate: '2.8%', term: '6 months', minScore: 70, type: 'Trade Finance' },
];

const COUNTRY_RISK = [
  { country: 'Nigeria', credit: 62, payment: 'High', avgDays: 45, default: 8.2 },
  { country: 'Kenya', credit: 71, payment: 'Medium', avgDays: 32, default: 4.5 },
  { country: 'Ghana', credit: 74, payment: 'Low', avgDays: 28, default: 3.1 },
  { country: 'South Africa', credit: 78, payment: 'Low', avgDays: 25, default: 2.8 },
  { country: 'Egypt', credit: 65, payment: 'Medium', avgDays: 38, default: 5.9 },
  { country: 'Ethiopia', credit: 48, payment: 'High', avgDays: 52, default: 11.4 },
];

export const AnalystFinanceMetrics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fx' | 'products' | 'risk' | 'calculator'>('fx');
  const [fxRates, setFxRates] = useState(FX_LIVE);

  // Calculator state
  const [calcData, setCalcData] = useState({
    cifValue: 50000,
    dutyRate: 10,
    vatRate: 15,
    shippingCost: 3000,
    insuranceCost: 500,
    afcftaDiscount: 60,
  });

  // Simulate FX jitter
  useEffect(() => {
    const iv = setInterval(() => {
      setFxRates(prev => prev.map(fx => ({
        ...fx,
        rate: fx.rate + (Math.random() - 0.5) * fx.rate * 0.001,
        bid: fx.bid + (Math.random() - 0.5) * fx.rate * 0.001,
        ask: fx.ask + (Math.random() - 0.5) * fx.rate * 0.001,
      })));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // Profitability calculator
  const duty = calcData.cifValue * (calcData.dutyRate / 100);
  const afcftaDuty = duty * (1 - calcData.afcftaDiscount / 100);
  const vat = (calcData.cifValue + afcftaDuty) * (calcData.vatRate / 100);
  const totalLanded = calcData.cifValue + afcftaDuty + vat + calcData.shippingCost + calcData.insuranceCost;
  const dutySaving = duty - afcftaDuty;

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-trade-primary dark:text-white">Finance Metrics</h2>
              <p className="text-[10px] text-gray-500">FX rates • Trade finance products • Credit risk • Profitability calculator</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'fx' as const, label: 'FX Rates', icon: DollarSign },
            { id: 'products' as const, label: 'Finance Products', icon: CreditCard },
            { id: 'risk' as const, label: 'Credit Risk', icon: Shield },
            { id: 'calculator' as const, label: 'Profitability Calculator', icon: Calculator },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* FX RATES */}
      {activeTab === 'fx' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {fxRates.map(fx => (
              <div key={fx.pair} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3">
                <p className="text-[10px] font-bold text-gray-500">{fx.pair}</p>
                <p className="text-lg font-black text-trade-primary dark:text-white">{fx.rate.toFixed(2)}</p>
                <p className={`text-[10px] font-bold flex items-center gap-0.5 ${fx.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {fx.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {fx.change > 0 ? '+' : ''}{fx.change}%
                </p>
                <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                  <span>Bid: {fx.bid.toFixed(2)}</span>
                  <span>Ask: {fx.ask.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-trade-primary dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> Weekly FX Trend
              </h3>
              <span className="text-[10px] bg-green-100 dark:bg-green-900/20 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={FX_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="NGN" stroke="#ef4444" strokeWidth={2} name="NGN" dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="KES" stroke="#3b82f6" strokeWidth={2} name="KES" dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="ZAR" stroke="#10b981" strokeWidth={2} name="ZAR" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* FINANCE PRODUCTS */}
      {activeTab === 'products' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FINANCE_PRODUCTS.map(fp => (
              <div key={fp.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{fp.name}</p>
                    <p className="text-[10px] text-gray-500">{fp.provider}</p>
                  </div>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full font-bold">{fp.type}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-gray-400">Rate</p>
                    <p className="text-sm font-black text-green-600">{fp.rate}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-gray-400">Term</p>
                    <p className="text-sm font-black text-trade-primary dark:text-white">{fp.term}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-gray-400">Min Score</p>
                    <p className="text-sm font-black text-gray-600 dark:text-gray-400">{fp.minScore}</p>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1">
                  Compare <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREDIT RISK */}
      {activeTab === 'risk' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" /> Payment Risk by Country
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COUNTRY_RISK}>
                  <XAxis dataKey="country" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Bar dataKey="credit" name="Credit Score" radius={[4, 4, 0, 0]} barSize={24}>
                    {COUNTRY_RISK.map((c, i) => (
                      <Cell key={i} fill={c.credit >= 70 ? '#10b981' : c.credit >= 60 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Country</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Credit Score</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Payment Risk</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Avg Payment Days</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Default Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {COUNTRY_RISK.map(c => (
                  <tr key={c.country} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">{c.country}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-black ${c.credit >= 70 ? 'text-green-600' : c.credit >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{c.credit}/100</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.payment === 'Low' ? 'bg-green-100 text-green-700' : c.payment === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>{c.payment}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400">{c.avgDays} days</td>
                    <td className="px-4 py-3 text-xs font-bold text-red-600">{c.default}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFITABILITY CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-500" /> Trade Cost Inputs
            </h3>
            <div className="space-y-4">
              {[
                { label: 'CIF Value (USD)', key: 'cifValue' as const, min: 0, max: 500000, step: 1000 },
                { label: 'MFN Duty Rate (%)', key: 'dutyRate' as const, min: 0, max: 50, step: 0.5 },
                { label: 'VAT Rate (%)', key: 'vatRate' as const, min: 0, max: 25, step: 0.5 },
                { label: 'Shipping Cost (USD)', key: 'shippingCost' as const, min: 0, max: 20000, step: 100 },
                { label: 'Insurance Cost (USD)', key: 'insuranceCost' as const, min: 0, max: 5000, step: 50 },
                { label: 'AfCFTA Duty Reduction (%)', key: 'afcftaDiscount' as const, min: 0, max: 100, step: 5 },
              ].map(input => (
                <div key={input.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{input.label}</label>
                    <span className="text-sm font-black text-trade-primary dark:text-white">
                      {input.key === 'cifValue' || input.key === 'shippingCost' || input.key === 'insuranceCost'
                        ? `$${calcData[input.key].toLocaleString()}`
                        : `${calcData[input.key]}%`}
                    </span>
                  </div>
                  <input type="range" min={input.min} max={input.max} step={input.step}
                    value={calcData[input.key]}
                    onChange={e => setCalcData(p => ({ ...p, [input.key]: Number(e.target.value) }))}
                    className="w-full accent-emerald-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl p-5 text-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-3">Profit After All Costs</h3>
              <p className="text-3xl font-black">${totalLanded.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-emerald-200 mt-1">Total Landed Cost</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 space-y-3">
              <h3 className="text-sm font-bold text-trade-primary dark:text-white">Cost Breakdown</h3>
              {[
                { label: 'CIF Value', value: calcData.cifValue, color: 'bg-blue-500' },
                { label: 'Duty (AfCFTA reduced)', value: afcftaDuty, color: 'bg-amber-500' },
                { label: 'VAT', value: vat, color: 'bg-purple-500' },
                { label: 'Shipping', value: calcData.shippingCost, color: 'bg-teal-500' },
                { label: 'Insurance', value: calcData.insuranceCost, color: 'bg-pink-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / totalLanded) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-800 dark:text-green-300">AfCFTA Savings</span>
              </div>
              <p className="text-2xl font-black text-green-600">${dutySaving.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] text-green-600">Duty reduction from ${duty.toFixed(0)} → ${afcftaDuty.toFixed(0)} ({calcData.afcftaDiscount}% reduction)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
