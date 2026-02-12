
import React, { useState } from 'react';
import {
  Search,
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  FileText,
  Download,
  Loader2,
  ArrowRight,
  Zap,
  Target,
  BrainCircuit,
  X,
  ChevronRight,
  Star,
  DollarSign,
  Package,
  Shield,
  CheckCircle,
  MapPin
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { getMarketIntelligence } from '../services/geminiService';

// --- TYPES ---
interface CountryProfile {
  id: string;
  name: string;
  flag: string;
  gdp: string;
  population: string;
  topImports: string[];
  topExports: string[];
  tradeBalance: string;
  afcftaStatus: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  ease: number;
  consumption: string;
  bloc: string;
}

interface HSProduct {
  code: string;
  name: string;
  volume: string;
  trend: string;
  topMarkets: string[];
  tariffRate: string;
  afcftaRate: string;
}

// --- DATA ---
const COUNTRY_PROFILES: CountryProfile[] = [
  { id: 'ng', name: 'Nigeria', flag: '🇳🇬', gdp: '$477B', population: '223M', topImports: ['Refined Petroleum', 'Wheat', 'Vehicles', 'Plastics'], topExports: ['Crude Oil', 'Cocoa', 'Rubber', 'Cashew Nuts'], tradeBalance: '-$12.4B', afcftaStatus: 'Ratified', riskLevel: 'Medium', ease: 62, consumption: '$340B', bloc: 'ECOWAS' },
  { id: 'ke', name: 'Kenya', flag: '🇰🇪', gdp: '$113B', population: '54M', topImports: ['Petroleum', 'Iron/Steel', 'Machinery', 'Vehicles'], topExports: ['Tea', 'Coffee', 'Cut Flowers', 'Vegetables'], tradeBalance: '-$9.8B', afcftaStatus: 'Ratified', riskLevel: 'Low', ease: 73, consumption: '$98B', bloc: 'EAC' },
  { id: 'gh', name: 'Ghana', flag: '🇬🇭', gdp: '$77B', population: '33M', topImports: ['Vehicles', 'Rice', 'Cement', 'Machinery'], topExports: ['Gold', 'Cocoa', 'Oil', 'Manganese'], tradeBalance: '+$2.1B', afcftaStatus: 'Ratified (HQ)', riskLevel: 'Low', ease: 78, consumption: '$65B', bloc: 'ECOWAS' },
  { id: 'za', name: 'South Africa', flag: '🇿🇦', gdp: '$399B', population: '60M', topImports: ['Petroleum', 'Machinery', 'Electronics', 'Vehicles'], topExports: ['Gold', 'Platinum', 'Iron Ore', 'Vehicles'], tradeBalance: '+$5.6B', afcftaStatus: 'Ratified', riskLevel: 'Medium', ease: 84, consumption: '$310B', bloc: 'SADC' },
  { id: 'eg', name: 'Egypt', flag: '🇪🇬', gdp: '$476B', population: '104M', topImports: ['Wheat', 'Petroleum', 'Iron/Steel', 'Machinery'], topExports: ['Petroleum', 'Textiles', 'Chemicals', 'Citrus'], tradeBalance: '-$18.2B', afcftaStatus: 'Ratified', riskLevel: 'Medium', ease: 71, consumption: '$380B', bloc: 'COMESA' },
  { id: 'et', name: 'Ethiopia', flag: '🇪🇹', gdp: '$156B', population: '120M', topImports: ['Petroleum', 'Machinery', 'Vehicles', 'Cereals'], topExports: ['Coffee', 'Oilseeds', 'Gold', 'Flowers'], tradeBalance: '-$11.8B', afcftaStatus: 'Ratified', riskLevel: 'High', ease: 48, consumption: '$110B', bloc: 'IGAD' },
];

const HS_PRODUCTS: HSProduct[] = [
  { code: '0901.11', name: 'Coffee (not roasted)', volume: '$2.8B', trend: '+8%', topMarkets: ['EU', 'USA', 'Japan'], tariffRate: '12%', afcftaRate: '0%' },
  { code: '1801.00', name: 'Cocoa Beans', volume: '$4.1B', trend: '+15%', topMarkets: ['Netherlands', 'USA', 'Germany'], tariffRate: '10%', afcftaRate: '0%' },
  { code: '0604.20', name: 'Cut Flowers', volume: '$1.2B', trend: '+22%', topMarkets: ['Netherlands', 'UK', 'Germany'], tariffRate: '8%', afcftaRate: '2%' },
  { code: '2523.29', name: 'Portland Cement', volume: '$0.8B', trend: '+18%', topMarkets: ['Nigeria', 'Ghana', 'Tanzania'], tariffRate: '20%', afcftaRate: '5%' },
  { code: '1006.30', name: 'Rice (semi/wholly milled)', volume: '$3.2B', trend: '+5%', topMarkets: ['Nigeria', 'Senegal', 'Ghana'], tariffRate: '25%', afcftaRate: '10%' },
  { code: '7108.12', name: 'Gold (unwrought)', volume: '$6.4B', trend: '+12%', topMarkets: ['UAE', 'Switzerland', 'India'], tariffRate: '5%', afcftaRate: '0%' },
];

const COMPETITOR_BENCHMARK = [
  { country: 'China', share: 28, volume: 14200 },
  { country: 'India', share: 18, volume: 9100 },
  { country: 'EU', share: 22, volume: 11100 },
  { country: 'USA', share: 12, volume: 6100 },
  { country: 'Intra-Africa', share: 15, volume: 7600 },
  { country: 'Others', share: 5, volume: 2500 },
];

const PRICE_BENCHMARK = [
  { month: 'Jan', cocoa: 3200, coffee: 4100, gold: 1950 },
  { month: 'Feb', cocoa: 3350, coffee: 4050, gold: 1980 },
  { month: 'Mar', cocoa: 3100, coffee: 4200, gold: 2010 },
  { month: 'Apr', cocoa: 3500, coffee: 4300, gold: 2050 },
  { month: 'May', cocoa: 3700, coffee: 4150, gold: 2100 },
  { month: 'Jun', cocoa: 3900, coffee: 4400, gold: 2080 },
];

const RADAR_DATA = [
  { metric: 'Market Size', A: 85, B: 70, C: 95 },
  { metric: 'Growth Rate', A: 75, B: 90, C: 60 },
  { metric: 'Ease of Entry', A: 80, B: 65, C: 85 },
  { metric: 'Infrastructure', A: 60, B: 55, C: 90 },
  { metric: 'AfCFTA Benefit', A: 90, B: 85, C: 75 },
  { metric: 'Risk Profile', A: 55, B: 70, C: 80 },
];

export const AnalystMarketResearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profiles' | 'hsCode' | 'competitors' | 'opportunities'>('profiles');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [_selectedCountry, setSelectedCountry] = useState<CountryProfile | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [opportunityQuery, setOpportunityQuery] = useState('');
  const [opportunities, setOpportunities] = useState<string | null>(null);

  const toggleCompare = (id: string) => {
    setCompareList(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const result = await getMarketIntelligence(
        `Provide a concise market research summary for "${searchQuery}" in African markets. Include demand trends, top importing countries, price outlook, and trade barriers. Format as executive brief.`
      );
      setAiReport(result.text || 'No data available.');
    } catch {
      setAiReport('Market research data temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const findOpportunities = async () => {
    if (!opportunityQuery.trim()) return;
    setAiLoading(true);
    try {
      const result = await getMarketIntelligence(
        `As an AfCFTA trade analyst, answer this market opportunity question: "${opportunityQuery}". Provide top 5 results with country, growth rate, and rationale. Be specific with data.`
      );
      setOpportunities(result.text || 'No opportunities found.');
    } catch {
      setOpportunities('AI opportunity finder temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateSummary = async (country: CountryProfile) => {
    setAiLoading(true);
    try {
      const result = await getMarketIntelligence(
        `Generate a 3-paragraph executive summary for ${country.name} as a trade destination in the AfCFTA context. Cover: market size, key opportunities, and risks. Include specific data points.`
      );
      setAiReport(result.text || 'Summary unavailable.');
    } catch {
      setAiReport(`${country.name}: GDP ${country.gdp}, population ${country.population}. ${country.afcftaStatus}. Key risk: ${country.riskLevel}.`);
    } finally {
      setAiLoading(false);
    }
  };

  const comparedCountries = COUNTRY_PROFILES.filter(c => compareList.includes(c.id));

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-trade-primary dark:text-white">Market Research</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Country profiles • HS Code intelligence • Competitor analysis • AI opportunity finder</p>
            </div>
          </div>
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-trade-primary dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder='Search "cement demand in West Africa"...' />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <button type="submit" disabled={loading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ArrowRight className="w-3 h-3" /> Search</>}
            </button>
          </form>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'profiles' as const, label: 'Country Profiles', icon: MapPin },
            { id: 'hsCode' as const, label: 'HS Code Intel', icon: Package },
            { id: 'competitors' as const, label: 'Competitors', icon: Users },
            { id: 'opportunities' as const, label: 'AI Opportunity Finder', icon: Zap },
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

      {/* AI Search Results Banner */}
      {aiReport && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">AI Research Report</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" /> PDF
              </button>
              <button onClick={() => setAiReport(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{aiReport}</p>
        </div>
      )}

      {/* COUNTRY PROFILES TAB */}
      {activeTab === 'profiles' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
          {/* Compare Bar */}
          {compareList.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Comparing {compareList.length}/3 countries</span>
                <div className="flex gap-1">
                  {comparedCountries.map(c => (
                    <span key={c.id} className="text-[10px] bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                      {c.flag} {c.name}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setCompareList([])} className="text-xs text-blue-600 hover:underline">Clear</button>
            </div>
          )}

          {/* Country Comparison Radar */}
          {compareList.length >= 2 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
              <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" /> Side-by-Side Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RADAR_DATA}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9 }} />
                      <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                      <Radar name={comparedCountries[0]?.name || 'A'} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                      {comparedCountries[1] && <Radar name={comparedCountries[1].name} dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />}
                      {comparedCountries[2] && <Radar name={comparedCountries[2].name} dataKey="C" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />}
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {comparedCountries.map((c, _i) => (
                    <div key={c.id} className="p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold">{c.flag} {c.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.riskLevel === 'Low' ? 'bg-green-100 text-green-700' : c.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{c.riskLevel} Risk</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-xs font-black text-trade-primary dark:text-white">{c.gdp}</p><p className="text-[9px] text-gray-400">GDP</p></div>
                        <div><p className="text-xs font-black text-trade-primary dark:text-white">{c.population}</p><p className="text-[9px] text-gray-400">Population</p></div>
                        <div><p className="text-xs font-black text-trade-primary dark:text-white">{c.ease}</p><p className="text-[9px] text-gray-400">Ease Score</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Country Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COUNTRY_PROFILES.map(country => (
              <div key={country.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{country.name}</h4>
                      <span className="text-[10px] text-gray-400">{country.bloc} • {country.afcftaStatus}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleCompare(country.id)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                      compareList.includes(country.id) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 hover:text-blue-500'
                    }`}>
                    {compareList.includes(country.id) ? <CheckCircle className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-xs font-black text-trade-primary dark:text-white">{country.gdp}</p>
                    <p className="text-[9px] text-gray-400">GDP</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-xs font-black text-trade-primary dark:text-white">{country.population}</p>
                    <p className="text-[9px] text-gray-400">Population</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-xs font-black text-trade-primary dark:text-white">{country.consumption}</p>
                    <p className="text-[9px] text-gray-400">Consumption</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Top Imports</p>
                  <div className="flex flex-wrap gap-1">
                    {country.topImports.slice(0, 3).map(imp => (
                      <span key={imp} className="text-[9px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">{imp}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      country.riskLevel === 'Low' ? 'bg-green-100 text-green-700' : country.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{country.riskLevel}</span>
                    <span className="text-[10px] text-gray-400">Ease: {country.ease}/100</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setSelectedCountry(country); generateSummary(country); }}
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5">
                      <FileText className="w-3 h-3" /> Summary
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HS CODE INTEL TAB */}
      {activeTab === 'hsCode' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HS_PRODUCTS.map(product => (
              <div key={product.code} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{product.code}</p>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{product.name}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    product.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {product.trend}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                    <p className="text-[9px] text-gray-400">Trade Volume</p>
                    <p className="text-sm font-black text-trade-primary dark:text-white">{product.volume}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                    <p className="text-[9px] text-gray-400">AfCFTA Rate</p>
                    <p className="text-sm font-black text-green-600">{product.afcftaRate}</p>
                    <p className="text-[9px] text-gray-400 line-through">MFN: {product.tariffRate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">Top Markets</p>
                  <div className="flex flex-wrap gap-1">
                    {product.topMarkets.map(m => (
                      <span key={m} className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPETITORS TAB */}
      {activeTab === 'competitors' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Import Source Market Share (%)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COMPETITOR_BENCHMARK} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis dataKey="country" type="category" width={80} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Bar dataKey="share" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={18}>
                    {COMPETITOR_BENCHMARK.map((_, _i) => {
                      const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#6366f1', '#10b981', '#94a3b8'];
                      return <rect key={_i} fill={colors[_i]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" /> Price Benchmarking (USD/MT)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PRICE_BENCHMARK}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="cocoa" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Cocoa" />
                  <Line type="monotone" dataKey="coffee" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Coffee" />
                  <Line type="monotone" dataKey="gold" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Gold" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Trade Barriers Tracker */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" /> Trade Barriers Tracker
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { type: 'Tariff', count: 12, severity: 'Medium', desc: 'Average MFN tariff 15.2% — AfCFTA reducing to 5.1%', color: 'amber' },
                { type: 'Non-Tariff', count: 28, severity: 'High', desc: 'SPS measures, import licenses, quotas across ECOWAS', color: 'red' },
                { type: 'Regulatory', count: 8, severity: 'Low', desc: 'Documentation requirements, standards conformity', color: 'green' },
              ].map(b => (
                <div key={b.type} className={`p-4 rounded-lg border border-${b.color}-200 dark:border-${b.color}-800 bg-${b.color}-50 dark:bg-${b.color}-900/10`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{b.type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${b.color}-100 text-${b.color}-700`}>{b.severity}</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">{b.count}</p>
                  <p className="text-[10px] text-gray-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI OPPORTUNITY FINDER TAB */}
      {activeTab === 'opportunities' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">AI Market Opportunity Finder</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Ask questions like: &ldquo;Top 5 fastest growing markets for maize flour exports&rdquo; or &ldquo;Where can I export cassava with lowest tariffs?&rdquo;</p>
            <div className="flex gap-2">
              <input type="text" value={opportunityQuery} onChange={e => setOpportunityQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && findOpportunities()}
                className="flex-1 px-4 py-3 rounded-lg border border-purple-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-trade-primary dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Ask about market opportunities..." />
              <button onClick={findOpportunities} disabled={aiLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><BrainCircuit className="w-4 h-4" /> Find</>}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                'Top 5 growing markets for maize flour',
                'Best AfCFTA tariff savings for textiles',
                'Emerging demand for cement in East Africa',
                'Lowest risk markets for agricultural exports',
              ].map(q => (
                <button key={q} onClick={() => { setOpportunityQuery(q); }}
                  className="text-[10px] bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700 hover:bg-purple-50 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {opportunities && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-trade-primary dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" /> Opportunity Results
                </h3>
                <button className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <Download className="w-3 h-3" /> Export PDF
                </button>
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{opportunities}</div>
            </div>
          )}

          {/* Quick Market Entry Playbooks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { market: 'West Africa', score: 88, entry: 'Direct Export', timeline: '3-6 months', keyReq: 'ECOWAS CET compliance' },
              { market: 'East Africa', score: 82, entry: 'Distributor Model', timeline: '4-8 months', keyReq: 'EAC standards cert' },
              { market: 'Southern Africa', score: 76, entry: 'Joint Venture', timeline: '6-12 months', keyReq: 'SADC trade protocol' },
            ].map(p => (
              <div key={p.market} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{p.market}</h4>
                  <span className="text-xs font-black text-emerald-600">{p.score}/100</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Entry Strategy</span>
                    <span className="font-bold text-gray-800 dark:text-white">{p.entry}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Timeline</span>
                    <span className="font-bold text-gray-800 dark:text-white">{p.timeline}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Key Requirement</span>
                    <span className="font-bold text-blue-600">{p.keyReq}</span>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 bg-gray-50 dark:bg-slate-700 text-xs font-bold text-trade-primary dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1">
                  View Playbook <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
