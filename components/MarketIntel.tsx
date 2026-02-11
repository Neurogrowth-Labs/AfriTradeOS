
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  TrendingUp, 
  Map as MapIcon, 
  Users, 
  BrainCircuit, 
  ArrowRight, 
  Loader2,
  Globe,
  AlertTriangle,
  Target,
  BarChart3,
  Bell,
  BellRing,
  Plus,
  X,
  TrendingDown,
  Zap,
  PieChart as PieIcon,
  Activity,
  CheckCircle
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
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { getMarketIntelligence } from '../services/geminiService';
import { mockDatabase } from '../services/mockDatabase';
import { DbMarketIntelligence } from '../types';

// Price data will be generated based on search or empty
const generatePriceData = () => [
  { month: 'Jan', price: 1100 + Math.random()*200, globalAvg: 1150 },
  { month: 'Feb', price: 1150 + Math.random()*200, globalAvg: 1160 },
  { month: 'Mar', price: 1080 + Math.random()*200, globalAvg: 1170 },
  { month: 'Apr', price: 1250 + Math.random()*200, globalAvg: 1180 },
  { month: 'May', price: 1300 + Math.random()*200, globalAvg: 1190 },
  { month: 'Jun', price: 1400 + Math.random()*200, globalAvg: 1200 },
];

// Static reference data for competitor analysis (shown after search)
const COMPETITOR_DATA = [
  { country: 'China', volume: 4500, share: '35%' },
  { country: 'India', volume: 3200, share: '25%' },
  { country: 'Vietnam', volume: 2100, share: '15%' },
  { country: 'South Africa', volume: 1800, share: '12%' },
  { country: 'Egypt', volume: 1200, share: '8%' },
];

// Static reference data for demand heatmap (shown after search)
const DEMAND_HEATMAP = [
  { country: 'Nigeria', demand: 'High', trend: '+15%', region: 'West Africa', sentiment: 'Positive' },
  { country: 'Kenya', demand: 'Medium', trend: '+5%', region: 'East Africa', sentiment: 'Neutral' },
  { country: 'Ghana', demand: 'High', trend: '+12%', region: 'West Africa', sentiment: 'Positive' },
  { country: 'Ethiopia', demand: 'Low', trend: '-2%', region: 'East Africa', sentiment: 'Caution' },
  { country: 'Angola', demand: 'Medium', trend: '+8%', region: 'Southern Africa', sentiment: 'Improving' },
];

// Sector dashboard data
const SECTOR_DATA = [
  { sector: 'Agriculture', value: 42, growth: '+12%', color: '#10b981' },
  { sector: 'Mining', value: 28, growth: '+8%', color: '#6366f1' },
  { sector: 'Textiles', value: 15, growth: '+18%', color: '#f59e0b' },
  { sector: 'Manufacturing', value: 10, growth: '+5%', color: '#3b82f6' },
  { sector: 'Services', value: 5, growth: '+22%', color: '#ec4899' },
];

// Heat map data (African regions)
const HEAT_MAP_DATA = [
  { id: 'wa', name: 'West Africa', x: 250, y: 320, intensity: 0.9, volume: '$8.2B', countries: 'Nigeria, Ghana, Senegal' },
  { id: 'ea', name: 'East Africa', x: 580, y: 420, intensity: 0.7, volume: '$5.1B', countries: 'Kenya, Tanzania, Ethiopia' },
  { id: 'sa', name: 'Southern Africa', x: 480, y: 620, intensity: 0.6, volume: '$4.8B', countries: 'South Africa, Mozambique' },
  { id: 'na', name: 'North Africa', x: 400, y: 150, intensity: 0.5, volume: '$3.9B', countries: 'Egypt, Morocco, Tunisia' },
  { id: 'ca', name: 'Central Africa', x: 420, y: 430, intensity: 0.3, volume: '$1.2B', countries: 'DRC, Cameroon, Gabon' },
];

// Import/export flow trend data
const TRADE_FLOW_DATA = [
  { month: 'Jul', imports: 3200, exports: 2800, balance: -400 },
  { month: 'Aug', imports: 3400, exports: 3100, balance: -300 },
  { month: 'Sep', imports: 3100, exports: 3500, balance: 400 },
  { month: 'Oct', imports: 3600, exports: 3800, balance: 200 },
  { month: 'Nov', imports: 3300, exports: 4100, balance: 800 },
  { month: 'Dec', imports: 3800, exports: 4500, balance: 700 },
];

// Product alert type
interface ProductAlert {
  id: string;
  product: string;
  condition: 'price_above' | 'price_below' | 'demand_spike' | 'supply_shortage';
  threshold: string;
  active: boolean;
  triggered: boolean;
}

export const MarketIntel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [aiReport, setAiReport] = useState<{text: string, sources: any[]} | null>(null);
  const [priceData, setPriceData] = useState<{month: string; price: number; globalAvg: number}[]>([]);
  const [marketData, setMarketData] = useState<DbMarketIntelligence[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeView, setActiveView] = useState<'research' | 'heatmap' | 'trends' | 'alerts'>('research');
  const [selectedRegion, setSelectedRegion] = useState<typeof HEAT_MAP_DATA[0] | null>(null);
  const [productAlerts, setProductAlerts] = useState<ProductAlert[]>([
    { id: 'pa1', product: 'Cocoa Beans', condition: 'price_above', threshold: '$3,200/ton', active: true, triggered: false },
    { id: 'pa2', product: 'Shea Butter', condition: 'demand_spike', threshold: '+20% volume', active: true, triggered: true },
    { id: 'pa3', product: 'Coffee (Arabica)', condition: 'price_below', threshold: '$4,000/ton', active: false, triggered: false },
  ]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ product: '', condition: 'price_above' as ProductAlert['condition'], threshold: '' });

  // Fetch market intelligence data from database
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const data = await mockDatabase.getMarketIntelligence();
        setMarketData(data);
      } catch (e) {
        console.error('Failed to fetch market data:', e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Ref to track if component is mounted
  const isMounted = React.useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setHasSearched(true);
    // Generate price data on search
    setPriceData(generatePriceData());
    
    try {
        const result = await getMarketIntelligence(`Analyze current market demand, pricing trends, and risks for ${query} in African markets. Provide a strategic outlook.`);
        
        if (isMounted.current) {
            setAiReport({
                text: result.text || "No report available.",
                sources: result.groundingChunks?.map((c: any) => ({
                    title: c.web?.title,
                    uri: c.web?.uri
                })).filter((s: any) => s.uri) || []
            });
        }
    } catch (e) {
        if (isMounted.current) {
            setAiReport({ text: "Market intelligence unavailable at this moment.", sources: [] });
        }
    } finally {
        if (isMounted.current) setLoading(false);
    }
  };

  const addAlert = () => {
    if (!newAlert.product || !newAlert.threshold) return;
    setProductAlerts(prev => [...prev, { id: `pa${Date.now()}`, ...newAlert, active: true, triggered: false }]);
    setNewAlert({ product: '', condition: 'price_above', threshold: '' });
    setShowAddAlert(false);
  };

  return (
      <div className="h-full flex flex-col gap-5 animate-fade-in pb-4">
          {/* Header & Search + Tabs */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                      <h2 className="text-lg font-bold text-trade-primary dark:text-white">Market Intelligence</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Global data • Real-time AI Analysis</p>
                  </div>
              </div>

              <form onSubmit={handleSearch} className="relative w-full md:w-80">
                  <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-trade-primary dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Search commodity (e.g. Shea Butter)..."
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button type="submit" disabled={loading} className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-1 rounded hover:bg-blue-700 disabled:opacity-50">
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                  </button>
              </form>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'research' as const, label: 'AI Research', icon: BrainCircuit },
                { id: 'heatmap' as const, label: 'Heat Map', icon: Target },
                { id: 'trends' as const, label: 'Trade Flows', icon: Activity },
                { id: 'alerts' as const, label: 'Alerts', icon: BellRing },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeView === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}>
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* B1: HEAT MAP & SECTOR DASHBOARDS */}
          {activeView === 'heatmap' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
              {/* SVG Heat Map */}
              <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden min-h-[400px]">
                <div className="absolute top-3 left-3 z-10 bg-slate-800/90 backdrop-blur p-2 rounded-lg border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Trade Volume Heat Map</span>
                </div>
                <svg viewBox="0 0 800 800" className="w-full h-full">
                  <rect width="800" height="800" fill="#0f172a" />
                  <path d="M 280 60 Q 200 100 150 250 Q 130 350 160 450 Q 200 550 300 620 Q 350 680 420 750 Q 480 780 520 720 Q 560 650 580 550 Q 620 450 650 350 Q 660 250 600 150 Q 550 80 450 60 Q 370 50 280 60 Z"
                    fill="#1e293b" stroke="#334155" strokeWidth="1" />
                  {HEAT_MAP_DATA.map(region => (
                    <g key={region.id} onClick={() => setSelectedRegion(selectedRegion?.id === region.id ? null : region)} className="cursor-pointer">
                      <circle cx={region.x} cy={region.y} r={50 * region.intensity} fill={`rgba(59, 130, 246, ${region.intensity * 0.3})`}>
                        <animate attributeName="r" values={`${45*region.intensity};${55*region.intensity};${45*region.intensity}`} dur="4s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={region.x} cy={region.y} r={30 * region.intensity} fill={`rgba(59, 130, 246, ${region.intensity * 0.6})`} />
                      <circle cx={region.x} cy={region.y} r={12} fill={`rgba(96, 165, 250, ${0.5 + region.intensity * 0.5})`} stroke="#0f172a" strokeWidth="2" />
                      <text x={region.x} y={region.y - 18} fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">{region.name}</text>
                      <text x={region.x} y={region.y + 28} fill="#60a5fa" fontSize="10" textAnchor="middle" fontWeight="bold">{region.volume}</text>
                    </g>
                  ))}
                </svg>
                {selectedRegion && (
                  <div className="absolute bottom-3 left-3 right-3 md:right-auto md:w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xl z-20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selectedRegion.name}</h4>
                        <p className="text-xs text-gray-500">{selectedRegion.countries}</p>
                      </div>
                      <button onClick={() => setSelectedRegion(null)}><X className="w-4 h-4 text-gray-400" /></button>
                    </div>
                    <div className="mt-2 flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-xs text-gray-500">Trade Volume</span>
                      <span className="text-sm font-bold text-blue-600">{selectedRegion.volume}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sector Dashboard */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
                  <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-blue-500" /> Sector Breakdown
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={SECTOR_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                          {SECTOR_DATA.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex-1">
                  <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3">Sector Growth</h3>
                  <div className="space-y-3">
                    {SECTOR_DATA.map(s => (
                      <div key={s.sector} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{s.sector}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{s.value}%</span>
                          <span className="text-[10px] font-bold text-green-600">{s.growth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B2: TRADE FLOW TREND CHARTS */}
          {activeView === 'trends' && (
            <div className="flex-1 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Exports', value: '$21.8B', change: '+12.4%', up: true },
                  { label: 'Total Imports', value: '$20.4B', change: '+8.1%', up: true },
                  { label: 'Trade Balance', value: '+$1.4B', change: '+340%', up: true },
                ].map(stat => (
                  <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
                    <p className="text-xs text-gray-500 uppercase">{stat.label}</p>
                    <p className="text-2xl font-bold text-trade-primary dark:text-white mt-1">{stat.value}</p>
                    <p className={`text-xs font-bold flex items-center gap-1 mt-1 ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {stat.change}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex-1">
                <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> Import / Export Flow (USD Millions)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TRADE_FLOW_DATA}>
                      <defs>
                        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `$${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Area type="monotone" dataKey="exports" stroke="#10b981" fill="url(#expGrad)" strokeWidth={2} name="Exports" />
                      <Area type="monotone" dataKey="imports" stroke="#ef4444" fill="url(#impGrad)" strokeWidth={2} name="Imports" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
                <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3">Trade Balance Trend</h3>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TRADE_FLOW_DATA}>
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '12px' }} />
                      <Bar dataKey="balance" name="Balance" radius={[4, 4, 0, 0]}>
                        {TRADE_FLOW_DATA.map((entry, idx) => (
                          <Cell key={idx} fill={entry.balance >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* B3: CUSTOMIZABLE PRODUCT ALERTS */}
          {activeView === 'alerts' && (
            <div className="flex-1 flex flex-col gap-5">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex items-center justify-between">
                <h3 className="font-bold text-trade-primary dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" /> Product Alerts
                </h3>
                <button onClick={() => setShowAddAlert(!showAddAlert)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> New Alert
                </button>
              </div>

              {showAddAlert && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-900/30 p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Create Alert</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="text" placeholder="Product name" value={newAlert.product}
                      onChange={e => setNewAlert(p => ({ ...p, product: e.target.value }))}
                      className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white text-sm outline-none" />
                    <select value={newAlert.condition} onChange={e => setNewAlert(p => ({ ...p, condition: e.target.value as ProductAlert['condition'] }))}
                      className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white text-sm outline-none">
                      <option value="price_above">Price Above</option>
                      <option value="price_below">Price Below</option>
                      <option value="demand_spike">Demand Spike</option>
                      <option value="supply_shortage">Supply Shortage</option>
                    </select>
                    <input type="text" placeholder="Threshold" value={newAlert.threshold}
                      onChange={e => setNewAlert(p => ({ ...p, threshold: e.target.value }))}
                      className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white text-sm outline-none" />
                    <button onClick={addAlert}
                      className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors">
                      Add Alert
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {productAlerts.map(alert => (
                  <div key={alert.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-5 flex items-center justify-between transition-all ${
                    alert.triggered ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10' : 'border-gray-100 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${alert.triggered ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                        {alert.triggered ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{alert.product}</h4>
                        <p className="text-xs text-gray-500 capitalize">{alert.condition.replace('_', ' ')} — {alert.threshold}</p>
                      </div>
                      {alert.triggered && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" /> TRIGGERED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setProductAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: !a.active } : a))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${alert.active ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${alert.active ? 'left-5' : 'left-0.5'}`} />
                      </button>
                      <button onClick={() => setProductAlerts(prev => prev.filter(a => a.id !== alert.id))}
                        className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORIGINAL RESEARCH VIEW */}
          {activeView === 'research' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 flex-1">
              {/* Left Column: Charts & Data */}
              <div className="lg:col-span-8 flex flex-col gap-5 overflow-y-auto pr-2">
                  
                  {/* Price Chart */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                          <div>
                              <h3 className="text-base font-bold text-trade-primary dark:text-white flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Price Intelligence
                              </h3>
                              <p className="text-[10px] text-gray-500">6-Month Trend vs Global Average (USD/MT)</p>
                          </div>
                          <span className="text-xl font-bold text-trade-primary dark:text-white">$1,420 <span className="text-xs font-normal text-emerald-500">+4.2%</span></span>
                      </div>
                      <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={priceData}>
                                  <defs>
                                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                  <Tooltip 
                                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                      itemStyle={{ color: '#fff' }}
                                  />
                                  <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" name="Local Price" />
                                  <Area type="monotone" dataKey="globalAvg" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Global Avg" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Competitors & Heatmap Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Competitor Analysis */}
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                           <h3 className="text-base font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
                               <Users className="w-4 h-4 text-blue-500" /> Top Exporters
                           </h3>
                           <div className="h-48">
                               <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={COMPETITOR_DATA} layout="vertical">
                                       <XAxis type="number" hide />
                                       <YAxis dataKey="country" type="category" width={70} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '12px' }} />
                                       <Bar dataKey="volume" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                                   </BarChart>
                               </ResponsiveContainer>
                           </div>
                      </div>

                      {/* Demand Heatmap */}
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                          <h3 className="text-base font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4 text-red-500" /> Demand Heatmap
                          </h3>
                          <div className="space-y-2">
                              {DEMAND_HEATMAP.map((item, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
                                      <div className="flex items-center gap-2">
                                          <div className={`w-1.5 h-1.5 rounded-full ${item.demand === 'High' ? 'bg-green-500' : item.demand === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                          <div>
                                              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.country}</p>
                                              <p className="text-[9px] text-gray-400 uppercase">{item.region}</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <span className={`text-[10px] font-bold ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{item.trend}</span>
                                          <p className="text-[9px] text-gray-400">{item.sentiment}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Right Column: AI Research */}
              <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <h3 className="text-base font-bold text-trade-primary dark:text-white flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-purple-600" /> AI Forecast
                      </h3>
                      <p className="text-[10px] text-gray-500">Powered by Gemini 2.0 with Search Grounding</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                       {/* Forecast Gauge */}
                       <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Q4 Demand Outlook</p>
                           <div className="text-2xl font-black text-purple-600 dark:text-purple-400">STRONG BUY</div>
                           <p className="text-[10px] text-gray-500 mt-1">Confidence Score: 88%</p>
                       </div>

                       {/* Risk Outlook */}
                       <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                           <h4 className="text-xs font-bold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                               <AlertTriangle className="w-3.5 h-3.5" /> Risk Outlook
                           </h4>
                           <p className="text-[10px] text-orange-700 dark:text-orange-400 leading-relaxed">
                               Currency volatility in key import markets (Nigeria, Kenya) may impact short-term liquidity. Recommended hedging for contracts {'>'} $50k.
                           </p>
                       </div>

                       {/* AI Report Content */}
                       {loading ? (
                           <div className="flex flex-col items-center justify-center py-8 opacity-50">
                               <Loader2 className="w-6 h-6 text-purple-500 animate-spin mb-2" />
                               <p className="text-xs text-gray-500">Analyzing global markets...</p>
                           </div>
                       ) : aiReport ? (
                           <div className="space-y-3">
                               <div className="prose prose-sm prose-purple dark:prose-invert max-w-none">
                                   <div className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-sans">
                                       {aiReport.text}
                                   </div>
                               </div>
                               
                               {aiReport.sources?.length > 0 && (
                                   <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
                                       <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Citations</p>
                                       <div className="space-y-1">
                                           {aiReport.sources.slice(0, 3).map((s, i) => (
                                               <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-600 dark:text-blue-400 truncate hover:underline">
                                                   {i+1}. {s.title}
                                               </a>
                                           ))}
                                       </div>
                                   </div>
                               )}
                           </div>
                       ) : (
                           <div className="text-center py-8 text-gray-400">
                               <p className="text-xs">Initiate search to generate report.</p>
                           </div>
                       )}
                  </div>
              </div>
          </div>
          )}
      </div>
  );
};
