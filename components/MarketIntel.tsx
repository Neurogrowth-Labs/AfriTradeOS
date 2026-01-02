import React, { useState } from 'react';
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
  Target
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
  Legend
} from 'recharts';
import { getMarketIntelligence } from '../services/geminiService';

// Mock Data Generators
const generatePriceData = () => [
  { month: 'Jan', price: 1100 + Math.random()*200, globalAvg: 1150 },
  { month: 'Feb', price: 1150 + Math.random()*200, globalAvg: 1160 },
  { month: 'Mar', price: 1080 + Math.random()*200, globalAvg: 1170 },
  { month: 'Apr', price: 1250 + Math.random()*200, globalAvg: 1180 },
  { month: 'May', price: 1300 + Math.random()*200, globalAvg: 1190 },
  { month: 'Jun', price: 1400 + Math.random()*200, globalAvg: 1200 },
];

const COMPETITOR_DATA = [
  { country: 'China', volume: 4500, share: '35%' },
  { country: 'India', volume: 3200, share: '25%' },
  { country: 'Vietnam', volume: 2100, share: '15%' },
  { country: 'South Africa', volume: 1800, share: '12%' },
  { country: 'Egypt', volume: 1200, share: '8%' },
];

const DEMAND_HEATMAP = [
  { country: 'Nigeria', demand: 'High', trend: '+15%', region: 'West Africa', sentiment: 'Positive' },
  { country: 'Kenya', demand: 'Medium', trend: '+5%', region: 'East Africa', sentiment: 'Neutral' },
  { country: 'Ghana', demand: 'High', trend: '+12%', region: 'West Africa', sentiment: 'Positive' },
  { country: 'Ethiopia', demand: 'Low', trend: '-2%', region: 'East Africa', sentiment: 'Caution' },
  { country: 'Angola', demand: 'Medium', trend: '+8%', region: 'Southern Africa', sentiment: 'Improving' },
];

export const MarketIntel: React.FC = () => {
  const [query, setQuery] = useState('Cocoa');
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{text: string, sources: any[]} | null>(null);
  const [priceData, setPriceData] = useState(generatePriceData());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    // Simulate data refresh
    setPriceData(generatePriceData());
    
    try {
        const result = await getMarketIntelligence(`Analyze current market demand, pricing trends, and risks for ${query} in African markets. Provide a strategic outlook.`);
        setAiReport({
            text: result.text || "No report available.",
            sources: result.groundingChunks?.map((c: any) => ({
                title: c.web?.title,
                uri: c.web?.uri
            })).filter((s: any) => s.uri) || []
        });
    } catch (e) {
        setAiReport({ text: "Market intelligence unavailable at this moment.", sources: [] });
    } finally {
        setLoading(false);
    }
  };

  // Initial load
  React.useEffect(() => {
      handleSearch({ preventDefault: () => {} } as any);
  }, []);

  return (
      <div className="h-full flex flex-col gap-5 animate-fade-in pb-4">
          {/* Header & Search */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
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
      </div>
  );
};