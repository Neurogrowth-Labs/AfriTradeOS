
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  AlertTriangle,
  Calendar,
  DollarSign,
  Zap,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Download,
  Ship,
  AlertOctagon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
  ComposedChart
} from 'recharts';
import { fastChatResponse } from '../services/geminiService';

// --- DATA ---
const HISTORICAL_FLOWS = [
  { year: '2015', intraAfrica: 12.4, extraAfrica: 45.2, total: 57.6 },
  { year: '2016', intraAfrica: 13.1, extraAfrica: 43.8, total: 56.9 },
  { year: '2017', intraAfrica: 14.8, extraAfrica: 48.1, total: 62.9 },
  { year: '2018', intraAfrica: 15.9, extraAfrica: 52.3, total: 68.2 },
  { year: '2019', intraAfrica: 16.2, extraAfrica: 50.1, total: 66.3 },
  { year: '2020', intraAfrica: 13.8, extraAfrica: 41.2, total: 55.0 },
  { year: '2021', intraAfrica: 17.4, extraAfrica: 53.8, total: 71.2 },
  { year: '2022', intraAfrica: 19.8, extraAfrica: 58.4, total: 78.2 },
  { year: '2023', intraAfrica: 22.1, extraAfrica: 61.2, total: 83.3 },
  { year: '2024', intraAfrica: 25.3, extraAfrica: 64.8, total: 90.1 },
  { year: '2025', intraAfrica: 28.6, extraAfrica: 67.4, total: 96.0 },
];

const SEASONAL_DATA = [
  { month: 'Jan', cocoa: 85, coffee: 72, flowers: 45, mining: 90, textiles: 60 },
  { month: 'Feb', cocoa: 88, coffee: 78, flowers: 95, mining: 88, textiles: 62 },
  { month: 'Mar', cocoa: 92, coffee: 85, flowers: 100, mining: 85, textiles: 65 },
  { month: 'Apr', cocoa: 78, coffee: 90, flowers: 80, mining: 82, textiles: 70 },
  { month: 'May', cocoa: 70, coffee: 88, flowers: 55, mining: 80, textiles: 75 },
  { month: 'Jun', cocoa: 65, coffee: 82, flowers: 40, mining: 78, textiles: 72 },
  { month: 'Jul', cocoa: 60, coffee: 75, flowers: 35, mining: 85, textiles: 68 },
  { month: 'Aug', cocoa: 72, coffee: 70, flowers: 38, mining: 88, textiles: 65 },
  { month: 'Sep', cocoa: 80, coffee: 68, flowers: 50, mining: 90, textiles: 70 },
  { month: 'Oct', cocoa: 90, coffee: 72, flowers: 65, mining: 92, textiles: 75 },
  { month: 'Nov', cocoa: 95, coffee: 80, flowers: 80, mining: 88, textiles: 78 },
  { month: 'Dec', cocoa: 82, coffee: 75, flowers: 90, mining: 82, textiles: 80 },
];

const COMMODITY_PRICES = [
  { month: 'Jul', cocoa: 3200, coffee: 4100, gold: 1950, oil: 82, cotton: 0.85 },
  { month: 'Aug', cocoa: 3350, coffee: 4050, gold: 1980, oil: 85, cotton: 0.88 },
  { month: 'Sep', cocoa: 3100, coffee: 4200, gold: 2010, oil: 88, cotton: 0.82 },
  { month: 'Oct', cocoa: 3500, coffee: 4300, gold: 2050, oil: 84, cotton: 0.90 },
  { month: 'Nov', cocoa: 3700, coffee: 4150, gold: 2100, oil: 78, cotton: 0.92 },
  { month: 'Dec', cocoa: 3900, coffee: 4400, gold: 2080, oil: 75, cotton: 0.95 },
  { month: 'Jan', cocoa: 4100, coffee: 4500, gold: 2120, oil: 80, cotton: 0.88 },
  { month: 'Feb', cocoa: 4250, coffee: 4350, gold: 2150, oil: 82, cotton: 0.91 },
];

const FX_RATES = [
  { pair: 'NGN/USD', rate: 1650, change: -2.5, history: [1580, 1600, 1620, 1640, 1650, 1670, 1650] },
  { pair: 'KES/USD', rate: 152.8, change: 1.2, history: [155, 154, 153, 152, 151, 152, 152.8] },
  { pair: 'ZAR/USD', rate: 18.45, change: -0.8, history: [18.1, 18.2, 18.3, 18.5, 18.6, 18.5, 18.45] },
  { pair: 'GHS/USD', rate: 14.92, change: -1.1, history: [14.5, 14.6, 14.7, 14.8, 14.9, 14.95, 14.92] },
  { pair: 'EGP/USD', rate: 48.5, change: -3.2, history: [46, 46.5, 47, 47.5, 48, 48.3, 48.5] },
  { pair: 'ETB/USD', rate: 56.8, change: -1.8, history: [55, 55.5, 55.8, 56, 56.3, 56.5, 56.8] },
];

const AFCFTA_IMPACT = [
  { period: 'Pre-AfCFTA (2018)', intraShare: 15.2, avgTariff: 14.5, tradeVolume: 68.2 },
  { period: '2021 (Launch)', intraShare: 16.8, avgTariff: 12.1, tradeVolume: 71.2 },
  { period: '2023', intraShare: 19.4, avgTariff: 9.8, tradeVolume: 83.3 },
  { period: '2025 (Current)', intraShare: 22.1, avgTariff: 7.2, tradeVolume: 96.0 },
  { period: '2030 (Projected)', intraShare: 35.0, avgTariff: 3.5, tradeVolume: 145.0 },
];

interface DisruptionAlert {
  id: string;
  title: string;
  type: 'port_strike' | 'conflict' | 'border_closure' | 'weather' | 'policy';
  severity: 'high' | 'medium' | 'low';
  location: string;
  impact: string;
  date: string;
  active: boolean;
}

const DISRUPTIONS: DisruptionAlert[] = [
  { id: 'd1', title: 'Port Strike Warning — Durban', type: 'port_strike', severity: 'high', location: 'South Africa', impact: 'SADC corridor delays expected 48-72h', date: '2h ago', active: true },
  { id: 'd2', title: 'Border Closure — Sudan/Ethiopia', type: 'border_closure', severity: 'high', location: 'East Africa', impact: 'Land route disrupted, sea rerouting advised', date: '5h ago', active: true },
  { id: 'd3', title: 'New ECOWAS Tariff Revision', type: 'policy', severity: 'medium', location: 'West Africa', impact: 'CET adjustments for 45 HS codes effective Mar 1', date: '1d ago', active: true },
  { id: 'd4', title: 'Flooding — Mozambique Corridor', type: 'weather', severity: 'medium', location: 'Southern Africa', impact: 'Road transport delays on N1 highway', date: '2d ago', active: false },
  { id: 'd5', title: 'Ghana Cocoa Export Surge', type: 'policy', severity: 'low', location: 'West Africa', impact: 'Cocoa exports up 23% — demand spike in EU markets', date: '3d ago', active: true },
];

export const AnalystTradeTrends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'historical' | 'seasonal' | 'commodities' | 'fx' | 'disruptions'>('historical');
  const [selectedCommodity, setSelectedCommodity] = useState('cocoa');
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchInsight = async () => {
      try {
        const text = await fastChatResponse(
          'Provide a 2-sentence AI insight on current African trade trends covering commodity prices and trade flow patterns. Be specific with numbers.'
        );
        if (mounted && text) setAiInsight(text);
      } catch {
        if (mounted) setAiInsight('Ghana cocoa exports up 23% driven by EU demand spike. NGN volatility creating hedging opportunities for West Africa corridor traders.');
      }
    };
    fetchInsight();
    return () => { mounted = false; };
  }, []);

  const getDisruptionIcon = (type: DisruptionAlert['type']) => {
    switch (type) {
      case 'port_strike': return Ship;
      case 'conflict': return AlertOctagon;
      case 'border_closure': return AlertTriangle;
      case 'weather': return Globe;
      case 'policy': return BarChart3;
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-trade-primary dark:text-white">Trade Trends</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Historical flows • Seasonal patterns • Commodity tracking • FX overlay • Disruption alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 rounded-lg text-[11px] font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'historical' as const, label: 'Historical Flows', icon: Clock },
            { id: 'seasonal' as const, label: 'Seasonal Trends', icon: Calendar },
            { id: 'commodities' as const, label: 'Commodity Prices', icon: DollarSign },
            { id: 'fx' as const, label: 'FX Overlay', icon: Activity },
            { id: 'disruptions' as const, label: 'Disruptions', icon: AlertTriangle },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Insight Bar */}
      {aiInsight && (
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-3 flex items-center gap-3">
          <Zap className="w-4 h-4 text-amber-300 shrink-0" />
          <p className="text-[11px] text-white/90 leading-relaxed flex-1">{aiInsight}</p>
          <button onClick={() => setAiInsight(null)}><X className="w-3.5 h-3.5 text-white/50" /></button>
        </div>
      )}

      {/* HISTORICAL FLOWS */}
      {activeTab === 'historical' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Trade (2025)', value: '$96.0B', change: '+6.5%', up: true },
              { label: 'Intra-Africa', value: '$28.6B', change: '+13.0%', up: true },
              { label: 'Intra-Africa Share', value: '29.8%', change: '+2.8pp', up: true },
              { label: '10Y CAGR', value: '+5.2%', change: 'Accelerating', up: true },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                <p className="text-[10px] text-gray-500 uppercase">{s.label}</p>
                <p className="text-xl font-black text-trade-primary dark:text-white mt-1">{s.value}</p>
                <p className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${s.up ? 'text-green-600' : 'text-red-600'}`}>
                  {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {s.change}
                </p>
              </div>
            ))}
          </div>

          {/* Historical Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex-1">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" /> African Trade Flows (2015–2025, USD Billions)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={HISTORICAL_FLOWS}>
                  <defs>
                    <linearGradient id="ttIntra" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `$${v}B`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="intraAfrica" stroke="#8b5cf6" fill="url(#ttIntra)" strokeWidth={2} name="Intra-Africa" />
                  <Bar dataKey="extraAfrica" fill="#3b82f640" name="Extra-Africa" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Total" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AfCFTA Impact Timeline */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" /> AfCFTA Impact Timeline
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {AFCFTA_IMPACT.map((p, i) => (
                <div key={p.period} className={`flex-shrink-0 w-44 p-4 rounded-xl border transition-all ${
                  i === 3 ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700' : 'border-gray-100 dark:border-slate-700'
                }`}>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">{p.period}</p>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Intra-Africa</span>
                      <span className="font-black text-violet-600">{p.intraShare}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Avg Tariff</span>
                      <span className="font-black text-green-600">{p.avgTariff}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Volume</span>
                      <span className="font-black text-trade-primary dark:text-white">${p.tradeVolume}B</span>
                    </div>
                  </div>
                  {i === 4 && <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-2 inline-block font-bold">Projected</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEASONAL TRENDS */}
      {activeTab === 'seasonal' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-trade-primary dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" /> Seasonal Export Volume Index (0–100)
              </h3>
              <div className="flex gap-1">
                {['cocoa', 'coffee', 'flowers', 'mining', 'textiles'].map(c => (
                  <button key={c} onClick={() => setSelectedCommodity(c)}
                    className={`px-2 py-1 rounded text-[10px] font-bold capitalize transition-all ${
                      selectedCommodity === c ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SEASONAL_DATA}>
                  <defs>
                    <linearGradient id="ttSeason" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Area type="monotone" dataKey={selectedCommodity} stroke="#f59e0b" fill="url(#ttSeason)" strokeWidth={2.5} name={selectedCommodity} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {['Cocoa', 'Coffee', 'Flowers', 'Mining', 'Textiles'].map((name, i) => {
              const peaks = ['Oct–Dec', 'Apr–Jun', 'Feb–Mar', 'Sep–Nov', 'Nov–Jan'];
              const lows = ['Jun–Aug', 'Sep–Nov', 'Jun–Aug', 'Apr–Jun', 'Jan–Mar'];
              return (
                <div key={name} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{name}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] text-gray-500">Peak: <span className="font-bold text-green-600">{peaks[i]}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-red-400" />
                      <span className="text-[10px] text-gray-500">Low: <span className="font-bold text-red-500">{lows[i]}</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COMMODITY PRICES */}
      {activeTab === 'commodities' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: 'Cocoa', price: '$4,250/MT', change: '+8.2%', up: true },
              { name: 'Coffee', price: '$4,350/MT', change: '+6.1%', up: true },
              { name: 'Gold', price: '$2,150/oz', change: '+3.4%', up: true },
              { name: 'Crude Oil', price: '$82/bbl', change: '-2.1%', up: false },
              { name: 'Cotton', price: '$0.91/lb', change: '+7.1%', up: true },
            ].map(c => (
              <div key={c.name} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3">
                <p className="text-[10px] text-gray-500 uppercase">{c.name}</p>
                <p className="text-lg font-black text-trade-primary dark:text-white">{c.price}</p>
                <p className={`text-[10px] font-bold flex items-center gap-0.5 ${c.up ? 'text-green-600' : 'text-red-500'}`}>
                  {c.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {c.change}
                </p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex-1">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" /> Commodity Price Tracking (8-Month)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COMMODITY_PRICES}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="cocoa" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Cocoa ($/MT)" />
                  <Line type="monotone" dataKey="coffee" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Coffee ($/MT)" />
                  <Line type="monotone" dataKey="gold" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Gold ($/oz)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* FX OVERLAY */}
      {activeTab === 'fx' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {FX_RATES.map(fx => (
              <div key={fx.pair} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3">
                <p className="text-[10px] font-bold text-gray-500">{fx.pair}</p>
                <p className="text-lg font-black text-trade-primary dark:text-white">{fx.rate.toLocaleString()}</p>
                <p className={`text-[10px] font-bold flex items-center gap-0.5 ${fx.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {fx.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {fx.change > 0 ? '+' : ''}{fx.change}%
                </p>
                {/* Mini sparkline */}
                <div className="flex items-end gap-0.5 mt-2 h-6">
                  {fx.history.map((v, i) => {
                    const max = Math.max(...fx.history);
                    const min = Math.min(...fx.history);
                    const range = max - min || 1;
                    const height = ((v - min) / range) * 100;
                    return (
                      <div key={i} className={`flex-1 rounded-sm ${fx.change > 0 ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ height: `${Math.max(15, height)}%`, opacity: 0.4 + (i / fx.history.length) * 0.6 }} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex-1">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Currency Impact on Trade Margins
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FX_RATES}>
                  <XAxis dataKey="pair" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Bar dataKey="change" name="% Change" radius={[4, 4, 0, 0]} barSize={24}>
                    {FX_RATES.map((fx, i) => (
                      <Cell key={i} fill={fx.change > 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* DISRUPTIONS */}
      {activeTab === 'disruptions' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center">
              <p className="text-2xl font-black text-red-600">2</p>
              <p className="text-[10px] text-red-600 font-bold uppercase">High Severity</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 p-4 text-center">
              <p className="text-2xl font-black text-amber-600">2</p>
              <p className="text-[10px] text-amber-600 font-bold uppercase">Medium</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center">
              <p className="text-2xl font-black text-green-600">1</p>
              <p className="text-[10px] text-green-600 font-bold uppercase">Low / Info</p>
            </div>
          </div>

          <div className="space-y-3">
            {DISRUPTIONS.map(d => {
              const Icon = getDisruptionIcon(d.type);
              return (
                <div key={d.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-4 transition-all ${
                  d.severity === 'high' ? 'border-red-200 dark:border-red-800' :
                  d.severity === 'medium' ? 'border-amber-200 dark:border-amber-800' : 'border-gray-100 dark:border-slate-700'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      d.severity === 'high' ? 'bg-red-100 text-red-600' :
                      d.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{d.title}</h4>
                          <p className="text-[10px] text-gray-500">{d.location} • {d.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {d.active && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            d.severity === 'high' ? 'bg-red-100 text-red-700' :
                            d.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          }`}>{d.severity.toUpperCase()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{d.impact}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
