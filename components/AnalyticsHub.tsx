
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Globe,
  Shield,
  Zap,
  Download,
  Activity,
  X,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Scale,
  Package,
  PieChart as PieIcon
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
  Line
} from 'recharts';
import { mockDatabase } from '../services/mockDatabase';
import { fastChatResponse } from '../services/geminiService';

// --- TYPES ---
interface KPI {
  id: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface RiskItem {
  country: string;
  political: number;
  currency: number;
  logistics: number;
  overall: number;
  trend: 'up' | 'down' | 'stable';
}

type TimeRange = 'month' | 'quarter' | 'year';
type DashboardPreset = 'analyst' | 'policy' | 'investor';

// --- MOCK DATA ---
const TRADE_BALANCE_DATA = [
  { period: 'Jan', imports: 4200, exports: 3800, balance: -400 },
  { period: 'Feb', imports: 3900, exports: 4100, balance: 200 },
  { period: 'Mar', imports: 4500, exports: 4300, balance: -200 },
  { period: 'Apr', imports: 4100, exports: 4600, balance: 500 },
  { period: 'May', imports: 4800, exports: 5100, balance: 300 },
  { period: 'Jun', imports: 4300, exports: 5400, balance: 1100 },
  { period: 'Jul', imports: 4600, exports: 5200, balance: 600 },
  { period: 'Aug', imports: 5100, exports: 5800, balance: 700 },
  { period: 'Sep', imports: 4900, exports: 6100, balance: 1200 },
  { period: 'Oct', imports: 5200, exports: 5900, balance: 700 },
  { period: 'Nov', imports: 5500, exports: 6400, balance: 900 },
  { period: 'Dec', imports: 5800, exports: 6800, balance: 1000 },
];

const SECTOR_INDEX = [
  { sector: 'Agriculture', value: 82, growth: 12, volume: '$8.2B', color: '#10b981' },
  { sector: 'Mining', value: 74, growth: 8, volume: '$6.1B', color: '#6366f1' },
  { sector: 'Manufacturing', value: 68, growth: 15, volume: '$5.4B', color: '#3b82f6' },
  { sector: 'FMCG', value: 71, growth: 22, volume: '$4.8B', color: '#f59e0b' },
  { sector: 'Energy', value: 65, growth: -3, volume: '$3.9B', color: '#ef4444' },
  { sector: 'Textiles', value: 58, growth: 18, volume: '$2.1B', color: '#ec4899' },
];

const CORRIDOR_DATA = [
  { id: 'c1', name: 'Lagos–Accra', bloc: 'ECOWAS', score: 88, volume: '$2.4B', trend: '+12%', status: 'optimal' },
  { id: 'c2', name: 'Mombasa–Kampala', bloc: 'EAC', score: 76, volume: '$1.8B', trend: '+8%', status: 'good' },
  { id: 'c3', name: 'Durban–Maputo', bloc: 'SADC', score: 82, volume: '$1.5B', trend: '+5%', status: 'optimal' },
  { id: 'c4', name: 'Casablanca–Dakar', bloc: 'UMA', score: 61, volume: '$0.9B', trend: '-2%', status: 'warning' },
  { id: 'c5', name: 'Cairo–Khartoum', bloc: 'COMESA', score: 45, volume: '$0.6B', trend: '-8%', status: 'critical' },
  { id: 'c6', name: 'Douala–Bangui', bloc: 'CEMAC', score: 52, volume: '$0.4B', trend: '+3%', status: 'warning' },
];

const RISK_DATA: RiskItem[] = [
  { country: 'Nigeria', political: 62, currency: 78, logistics: 55, overall: 65, trend: 'up' },
  { country: 'Kenya', political: 45, currency: 52, logistics: 40, overall: 46, trend: 'down' },
  { country: 'Ghana', political: 35, currency: 48, logistics: 38, overall: 40, trend: 'stable' },
  { country: 'Egypt', political: 58, currency: 65, logistics: 42, overall: 55, trend: 'up' },
  { country: 'South Africa', political: 50, currency: 60, logistics: 35, overall: 48, trend: 'stable' },
  { country: 'Ethiopia', political: 72, currency: 80, logistics: 68, overall: 73, trend: 'up' },
];

const TARIFF_SCENARIO = [
  { item: 'Before AfCFTA', duty: 15, margin: 22, landed: 115 },
  { item: 'After AfCFTA', duty: 5, margin: 32, landed: 105 },
  { item: 'Full Lib.', duty: 0, margin: 37, landed: 100 },
];

const HEATMAP_REGIONS = [
  { id: 'wa', name: 'West Africa', x: 250, y: 320, intensity: 0.92, volume: '$12.4B', growth: '+14%', countries: 'Nigeria, Ghana, Senegal, Côte d\'Ivoire' },
  { id: 'ea', name: 'East Africa', x: 580, y: 420, intensity: 0.75, volume: '$8.1B', growth: '+11%', countries: 'Kenya, Tanzania, Ethiopia, Uganda' },
  { id: 'sa', name: 'Southern Africa', x: 480, y: 640, intensity: 0.68, volume: '$7.2B', growth: '+6%', countries: 'South Africa, Mozambique, Zambia' },
  { id: 'na', name: 'North Africa', x: 420, y: 130, intensity: 0.55, volume: '$5.8B', growth: '+4%', countries: 'Egypt, Morocco, Tunisia, Algeria' },
  { id: 'ca', name: 'Central Africa', x: 430, y: 440, intensity: 0.35, volume: '$2.1B', growth: '+9%', countries: 'DRC, Cameroon, Gabon, Congo' },
];

const DEMAND_FORECAST = [
  { month: 'Jan', actual: 3200, forecast: 3300, lower: 3000, upper: 3600 },
  { month: 'Feb', actual: 3400, forecast: 3500, lower: 3200, upper: 3800 },
  { month: 'Mar', actual: 3100, forecast: 3400, lower: 3100, upper: 3700 },
  { month: 'Apr', actual: 3800, forecast: 3600, lower: 3300, upper: 3900 },
  { month: 'May', actual: 4200, forecast: 3900, lower: 3600, upper: 4200 },
  { month: 'Jun', actual: 4500, forecast: 4200, lower: 3900, upper: 4500 },
  { month: 'Jul', actual: null, forecast: 4500, lower: 4100, upper: 4900 },
  { month: 'Aug', actual: null, forecast: 4800, lower: 4300, upper: 5300 },
  { month: 'Sep', actual: null, forecast: 5100, lower: 4500, upper: 5700 },
];

export const AnalyticsHub: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('quarter');
  const [preset, setPreset] = useState<DashboardPreset>('analyst');
  const [selectedCountry, setSelectedCountry] = useState('All Africa');
  const [selectedBloc, setSelectedBloc] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState<typeof HEATMAP_REGIONS[0] | null>(null);
  const [aiInsight, setAiInsight] = useState('Loading strategic intelligence...');
  const [_showFilters, _setShowFilters] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [scenarioReduction, setScenarioReduction] = useState(5);
  const [_loadingData, setLoadingData] = useState(true);
  const [tradeData, setTradeData] = useState(TRADE_BALANCE_DATA);
  const [metrics, setMetrics] = useState({
    totalTrade: '$48.2B',
    tradeGrowth: '+12.4%',
    intraAfrica: '18.3%',
    corridorScore: 72,
    activeDeals: 1247,
    complianceRate: '94%',
    riskIndex: 48,
    forecastAccuracy: '89%',
  });

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const trades = await mockDatabase.getTrades();
        if (mounted && trades.length > 0) {
          const total = trades.reduce((s, t) => s + (t.value || 0), 0);
          setMetrics(prev => ({
            ...prev,
            activeDeals: trades.length,
            totalTrade: `$${(total / 1e9).toFixed(1)}B`,
          }));
        }
      } catch (e) { console.warn('Data fetch error:', e); } finally {
        if (mounted) setLoadingData(false);
      }
      try {
        const text = await fastChatResponse(
          'As a trade analyst in the AfCFTA zone, provide a 2-sentence executive market intelligence brief for today covering trade flows and risk outlook.'
        );
        if (mounted && text) setAiInsight(text);
      } catch {
        if (mounted) setAiInsight('AfCFTA intra-African trade volumes up 12% YoY driven by ECOWAS agricultural exports. Currency volatility in NGN and ETB remains the primary risk factor for Q4.');
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  // Real-time jitter simulation
  useEffect(() => {
    const iv = setInterval(() => {
      setTradeData(prev => prev.map(d => ({
        ...d,
        imports: Math.max(2000, d.imports + (Math.random() - 0.5) * 150),
        exports: Math.max(2000, d.exports + (Math.random() - 0.5) * 150),
      })));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const kpis: KPI[] = [
    { id: 'k1', label: 'Total Trade Volume', value: metrics.totalTrade, change: metrics.tradeGrowth, up: true, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'k2', label: 'Intra-Africa Share', value: metrics.intraAfrica, change: '+2.1pp', up: true, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'k3', label: 'Corridor Score', value: `${metrics.corridorScore}/100`, change: '+4pts', up: true, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'k4', label: 'Risk Index', value: `${metrics.riskIndex}`, change: '-3pts', up: false, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { id: 'k5', label: 'Active Deals', value: metrics.activeDeals.toLocaleString(), change: '+8%', up: true, icon: Package, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { id: 'k6', label: 'Compliance Rate', value: metrics.complianceRate, change: '+1.2%', up: true, icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  const scenarioMargin = 22 + scenarioReduction * 1.8;

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-4">
      {/* Top Bar: Filters + Presets + Time Slider */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-trade-primary dark:text-white">Analytics Hub</h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Real-time Trade Intelligence Command Centre</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700 rounded-lg p-1 border border-gray-100 dark:border-slate-600">
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="text-[11px] font-medium bg-transparent text-gray-700 dark:text-gray-300 outline-none px-2 py-1 rounded cursor-pointer"
            >
              <option>All Africa</option>
              <option>Nigeria</option>
              <option>Kenya</option>
              <option>Ghana</option>
              <option>South Africa</option>
              <option>Egypt</option>
              <option>Ethiopia</option>
            </select>
            <div className="w-px h-4 bg-gray-200 dark:bg-slate-600" />
            <select
              value={selectedBloc}
              onChange={e => setSelectedBloc(e.target.value)}
              className="text-[11px] font-medium bg-transparent text-gray-700 dark:text-gray-300 outline-none px-2 py-1 rounded cursor-pointer"
            >
              <option>All</option>
              <option>ECOWAS</option>
              <option>EAC</option>
              <option>SADC</option>
              <option>COMESA</option>
              <option>CEMAC</option>
            </select>
          </div>

          {/* Time Range */}
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
            {(['month', 'quarter', 'year'] as TimeRange[]).map(t => (
              <button key={t} onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  timeRange === t ? 'bg-white dark:bg-slate-600 text-trade-primary dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t === 'month' ? '1M' : t === 'quarter' ? '3M' : '1Y'}
              </button>
            ))}
          </div>

          {/* Preset Selector */}
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
            {(['analyst', 'policy', 'investor'] as DashboardPreset[]).map(p => (
              <button key={p} onClick={() => setPreset(p)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all capitalize ${
                  preset === p ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {p}
              </button>
            ))}
          </div>

          <button onClick={() => setShowScenario(!showScenario)}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-[11px] font-bold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors">
            <Sliders className="w-3 h-3" /> Scenario
          </button>

          <button className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 rounded-lg text-[11px] font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      {/* Scenario Modelling Bar */}
      {showScenario && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Tariff Impact Simulator
            </h3>
            <button onClick={() => setShowScenario(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Tariff Reduction</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="range" min={0} max={15} value={scenarioReduction}
                  onChange={e => setScenarioReduction(Number(e.target.value))}
                  className="flex-1 accent-amber-500" />
                <span className="text-lg font-black text-amber-700 dark:text-amber-400 w-12 text-right">{scenarioReduction}%</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-100 dark:border-slate-700">
              <p className="text-[10px] text-gray-500 uppercase">Duty Impact</p>
              <p className="text-xl font-black text-green-600">-${(scenarioReduction * 12.5).toFixed(0)}M</p>
              <p className="text-[10px] text-gray-400">Annual savings</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-100 dark:border-slate-700">
              <p className="text-[10px] text-gray-500 uppercase">Margin Impact</p>
              <p className="text-xl font-black text-blue-600">+{scenarioMargin.toFixed(1)}%</p>
              <p className="text-[10px] text-gray-400">Projected margin</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-100 dark:border-slate-700">
              <p className="text-[10px] text-gray-500 uppercase">Trade Volume</p>
              <p className="text-xl font-black text-purple-600">+{(scenarioReduction * 2.3).toFixed(1)}%</p>
              <p className="text-[10px] text-gray-400">Volume increase</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-lg font-black text-trade-primary dark:text-white">{kpi.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart + Map + Risk */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left: Trade Balance Chart + Sector Index */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto">
          {/* Trade Balance Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-trade-primary dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> Trade Balance (USD M)
              </h3>
              <span className="text-[10px] bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
              </span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tradeData}>
                  <defs>
                    <linearGradient id="ahExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ahImp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="period" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="exports" stroke="#10b981" fill="url(#ahExp)" strokeWidth={2} name="Exports" />
                  <Area type="monotone" dataKey="imports" stroke="#ef4444" fill="url(#ahImp)" strokeWidth={2} name="Imports" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector Performance Index */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-500" /> Sector Performance Index
            </h3>
            <div className="space-y-2.5">
              {SECTOR_INDEX.map(s => (
                <div key={s.sector} className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 w-24 truncate">{s.sector}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 dark:text-white w-8 text-right">{s.value}</span>
                  <span className={`text-[10px] font-bold w-10 text-right ${s.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {s.growth >= 0 ? '+' : ''}{s.growth}%
                  </span>
                  <span className="text-[10px] text-gray-400 w-14 text-right">{s.volume}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Demand Forecast */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-trade-primary dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> AI Demand Forecast
              </h3>
              <span className="text-[10px] bg-purple-100 dark:bg-purple-900/20 text-purple-600 px-2 py-0.5 rounded-full font-bold">Predictive</span>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMAND_FORECAST}>
                  <defs>
                    <linearGradient id="ahFc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="#8b5cf620" name="Upper Bound" />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" name="Lower Bound" />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Actual" connectNulls={false} />
                  <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} name="Forecast" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Center: AfCFTA Heatmap */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex-1 min-h-[400px]">
            <div className="absolute top-3 left-3 z-10 bg-slate-800/90 backdrop-blur p-2 rounded-lg border border-slate-700">
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">AfCFTA Corridor Heatmap</span>
            </div>
            <svg viewBox="0 0 800 800" className="w-full h-full">
              <rect width="800" height="800" fill="#0f172a" />
              <path d="M 280 60 Q 200 100 150 250 Q 130 350 160 450 Q 200 550 300 620 Q 350 680 420 750 Q 480 780 520 720 Q 560 650 580 550 Q 620 450 650 350 Q 660 250 600 150 Q 550 80 450 60 Q 370 50 280 60 Z"
                fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {HEATMAP_REGIONS.map(r => (
                <g key={r.id} onClick={() => setSelectedRegion(selectedRegion?.id === r.id ? null : r)} className="cursor-pointer">
                  <circle cx={r.x} cy={r.y} r={55 * r.intensity} fill={`rgba(59, 130, 246, ${r.intensity * 0.25})`}>
                    <animate attributeName="r" values={`${50 * r.intensity};${60 * r.intensity};${50 * r.intensity}`} dur="4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={r.x} cy={r.y} r={35 * r.intensity} fill={`rgba(59, 130, 246, ${r.intensity * 0.5})`} />
                  <circle cx={r.x} cy={r.y} r={14} fill={`rgba(96, 165, 250, ${0.4 + r.intensity * 0.6})`} stroke="#0f172a" strokeWidth="2" />
                  <text x={r.x} y={r.y - 22} fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">{r.name}</text>
                  <text x={r.x} y={r.y + 32} fill="#60a5fa" fontSize="10" textAnchor="middle" fontWeight="bold">{r.volume}</text>
                  <text x={r.x} y={r.y + 46} fill={r.growth.startsWith('+') ? '#10b981' : '#ef4444'} fontSize="9" textAnchor="middle" fontWeight="bold">{r.growth}</text>
                </g>
              ))}
              {/* Corridor lines */}
              <line x1="250" y1="320" x2="580" y2="420" stroke="#3b82f680" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="250" y1="320" x2="420" y2="130" stroke="#3b82f640" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="580" y1="420" x2="480" y2="640" stroke="#3b82f660" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="430" y1="440" x2="250" y2="320" stroke="#3b82f630" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
            {selectedRegion && (
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xl z-20">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selectedRegion.name}</h4>
                    <p className="text-[10px] text-gray-500">{selectedRegion.countries}</p>
                  </div>
                  <button onClick={() => setSelectedRegion(null)}><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-[10px] text-gray-500">Volume</span>
                    <p className="text-sm font-bold text-blue-600">{selectedRegion.volume}</p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-[10px] text-gray-500">Growth</span>
                    <p className="text-sm font-bold text-green-600">{selectedRegion.growth}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Strategic Brief */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">AI Strategic Brief</span>
            </div>
            <p className="text-[12px] leading-relaxed opacity-95">{aiInsight}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full">Forecast Accuracy: {metrics.forecastAccuracy}</span>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full">Updated: Just now</span>
            </div>
          </div>
        </div>

        {/* Right: Risk Engine + Corridor Performance */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
          {/* Risk Score Engine */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" /> Risk Score Engine
            </h3>
            <div className="space-y-2">
              {RISK_DATA.map(r => (
                <div key={r.country} className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-800 dark:text-white">{r.country}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[11px] font-black ${r.overall < 50 ? 'text-green-600' : r.overall < 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        {r.overall}
                      </span>
                      {r.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
                      {r.trend === 'down' && <TrendingDown className="w-3 h-3 text-green-500" />}
                      {r.trend === 'stable' && <Activity className="w-3 h-3 text-gray-400" />}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1">
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-red-400" style={{ width: `${r.political}%` }} />
                      </div>
                      <span className="text-[8px] text-gray-400">Political</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${r.currency}%` }} />
                      </div>
                      <span className="text-[8px] text-gray-400">Currency</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-400" style={{ width: `${r.logistics}%` }} />
                      </div>
                      <span className="text-[8px] text-gray-400">Logistics</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Corridor Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-teal-500" /> Corridor Performance
            </h3>
            <div className="space-y-2">
              {CORRIDOR_DATA.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      c.status === 'optimal' ? 'bg-green-500' :
                      c.status === 'good' ? 'bg-blue-500' :
                      c.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-[11px] font-bold text-gray-800 dark:text-white">{c.name}</p>
                      <p className="text-[9px] text-gray-400">{c.bloc} • {c.volume}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-gray-800 dark:text-white">{c.score}</p>
                    <p className={`text-[9px] font-bold ${c.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{c.trend}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tariff Before/After */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500" /> Tariff Impact
            </h3>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TARIFF_SCENARIO} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis dataKey="item" type="category" width={75} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Bar dataKey="duty" fill="#ef4444" name="Duty %" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="margin" fill="#10b981" name="Margin %" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
