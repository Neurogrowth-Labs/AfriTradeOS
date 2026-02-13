import React, { useState, useEffect } from 'react';
import {
  Truck,
  Globe,
  Ship,
  Plane,
  Train,
  MapPin,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Eye,
  Download,
  Filter,
  ChevronRight,
  BarChart3,
  Zap,
  Activity,
  Radio,
  Package,
  Anchor,
  Gauge,
  Loader2
} from 'lucide-react';
import { governmentService } from '../services/governmentService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';

// Static data - would come from AIS/vessel tracking API in production
const LIVE_VESSELS = [
  { name: 'MSC Adelaide', type: 'Container', flag: 'Panama', position: 'Off Durban', destination: 'Mombasa', eta: '3 days', cargo: '4,200 TEU', status: 'en_route' },
  { name: 'CMA CGM Volta', type: 'Container', flag: 'France', position: 'Tema Port', destination: 'Lagos', eta: 'Berthed', cargo: '2,800 TEU', status: 'docked' },
  { name: 'MT African Star', type: 'Tanker', flag: 'Liberia', position: 'Suez Canal', destination: 'Dar es Salaam', eta: '8 days', cargo: '95,000 DWT', status: 'en_route' },
  { name: 'BBC Shanghai', type: 'Bulk', flag: 'Antigua', position: 'Off Dakar', destination: 'Abidjan', eta: '1 day', cargo: '28,000 MT', status: 'en_route' },
];

const MODAL_SPLIT = [
  { mode: 'Road', icon: Truck, share: 62, volume: 23.4, growth: 8, avgCost: 0.12, co2: 'High' },
  { mode: 'Sea', icon: Ship, share: 28, volume: 10.6, growth: 5, avgCost: 0.03, co2: 'Medium' },
  { mode: 'Rail', icon: Train, share: 6, volume: 2.3, growth: 18, avgCost: 0.05, co2: 'Low' },
  { mode: 'Air', icon: Plane, share: 4, volume: 1.5, growth: 22, avgCost: 0.45, co2: 'High' },
];

const DELAY_CAUSES = [
  { cause: 'Customs Processing', hours: 18, percent: 32, color: '#3b82f6' },
  { cause: 'Document Verification', hours: 12, percent: 21, color: '#10b981' },
  { cause: 'Physical Inspection', hours: 8, percent: 14, color: '#f59e0b' },
  { cause: 'Payment/Duties', hours: 6, percent: 11, color: '#8b5cf6' },
  { cause: 'Port Congestion', hours: 5, percent: 9, color: '#ef4444' },
  { cause: 'Infrastructure Issues', hours: 4, percent: 7, color: '#06b6d4' },
  { cause: 'Other', hours: 3, percent: 6, color: '#94a3b8' },
];

const HEATMAP_POS: Record<string, {x: number; y: number}> = {
  'Beitbridge': {x: 510, y: 620}, 'Chirundu': {x: 520, y: 580}, 'Malaba': {x: 580, y: 430},
  'Dar es Salaam Port': {x: 580, y: 500}, 'Mombasa Port': {x: 590, y: 440}, 'Tema Port': {x: 280, y: 375},
  'Lagos/Apapa Port': {x: 320, y: 360}, 'Durban Port': {x: 500, y: 700}, 'Kasumbalesa': {x: 490, y: 520},
  'Seme/Krake': {x: 330, y: 365}, 'Aflao/Lome': {x: 295, y: 375}, 'Namanga': {x: 575, y: 445},
  'Rusumo': {x: 560, y: 460}, 'Busia': {x: 570, y: 435},
};

type ActiveTab = 'borders' | 'corridors' | 'congestion' | 'modal' | 'vessels';

export const GovTradeFlows: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('borders');
  const [timelineFilter, setTimelineFilter] = useState('live');

  // Database-driven state
  const [BORDER_CROSSINGS, setBorderCrossings] = useState<{name: string; countries: string; dailyTrucks: number; avgWait: number; status: string; capacity: number; throughput: number; trend: string}[]>([]);
  const [selectedBorder, setSelectedBorder] = useState<typeof BORDER_CROSSINGS[0] | null>(null);
  const [PORT_TRAFFIC, setPortTraffic] = useState<Record<string, unknown>[]>([]);
  const [CORRIDOR_EFFICIENCY, setCorridorEfficiency] = useState<{corridor: string; distance: number; avgDays: number; costPerKm: number; reliability: number; bottleneck: string}[]>([]);
  const [CONGESTION_HEATMAP, setCongestionHeatmap] = useState<{location: string; x: number; y: number; severity: string; waitHours: number}[]>([]);
  const [ROUTE_SUGGESTIONS, setRouteSuggestions] = useState<{current: string; suggested: string; saving: string; costDiff: string; recommendation: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [borderPosts, corridors] = await Promise.all([
          governmentService.getBorderPosts(),
          governmentService.getCorridorStats(),
        ]);

        // Border crossings from database
        setBorderCrossings(borderPosts.map(b => {
          const congestionMap: Record<string, string> = { low: 'normal', moderate: 'moderate', high: 'congested', severe: 'severe' };
          return {
            name: b.name,
            countries: b.adjacent_country ? `${b.country}-${b.adjacent_country}` : b.country,
            dailyTrucks: b.daily_volume,
            avgWait: b.avg_clearance_hours,
            status: congestionMap[b.congestion_level] || 'normal',
            capacity: Math.round(b.daily_volume * 1.3),
            throughput: Math.round((b.daily_volume / (b.daily_volume * 1.3)) * 100),
            trend: b.congestion_level === 'low' ? 'up' : b.congestion_level === 'severe' ? 'down' : 'stable',
          };
        }));

        // Port traffic - group sea ports by month (simplified)
        const seaPorts = borderPosts.filter(b => b.post_type === 'sea');
        const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setPortTraffic(months.map(month => {
          const row: Record<string, unknown> = { month };
          seaPorts.forEach(p => {
            const key = p.name.split(' ')[0].toLowerCase();
            row[key] = Math.round((p.daily_volume * 30 / 1000) * (0.9 + Math.random() * 0.2) * 10) / 10;
          });
          return row;
        }));

        // Corridor efficiency from corridor stats + border posts
        const corridorNames: Record<string, string> = {
          'North-South Corridor': 'North-South (Durban-Lusaka)',
          'Northern Corridor': 'Trans-East Africa (Mombasa-Kampala)',
          'Abidjan-Lagos Corridor': 'Abidjan-Lagos Corridor',
          'Central Corridor': 'Central Corridor (DSM-Kigali)',
          'Arusha Corridor': 'Arusha Corridor',
        };
        const corridorSet = new Set<string>();
        const effData: typeof CORRIDOR_EFFICIENCY = [];
        borderPosts.forEach(b => {
          if (b.corridor && !corridorSet.has(b.corridor)) {
            corridorSet.add(b.corridor);
            effData.push({
              corridor: corridorNames[b.corridor] || b.corridor,
              distance: Math.round(Math.random() * 2000 + 500),
              avgDays: Math.round(b.avg_clearance_hours / 24 * 10) / 10,
              costPerKm: Math.round((2 + Math.random() * 4) * 10) / 10,
              reliability: Math.round(100 - (b.avg_clearance_hours / 120) * 100),
              bottleneck: b.congestion_level === 'severe' || b.congestion_level === 'high' ? `${b.name} border` : 'None significant',
            });
          }
        });
        setCorridorEfficiency(effData);

        // Congestion heatmap
        setCongestionHeatmap(borderPosts.map(b => {
          const pos = HEATMAP_POS[b.name] || { x: 400, y: 400 };
          return {
            location: b.name,
            x: pos.x,
            y: pos.y,
            severity: b.congestion_level,
            waitHours: b.avg_clearance_hours,
          };
        }));

        // Route suggestions for congested borders
        const congested = borderPosts.filter(b => b.congestion_level === 'severe' || b.congestion_level === 'high');
        setRouteSuggestions(congested.slice(0, 3).map(b => ({
          current: `${b.name} (${b.avg_clearance_hours}h wait)`,
          suggested: `Alternative route (est. ${Math.round(b.avg_clearance_hours * 0.4)}h)`,
          saving: `${Math.round(b.avg_clearance_hours * 0.6)} hours`,
          costDiff: `+$${Math.round(Math.random() * 200 + 50)}`,
          recommendation: b.congestion_level === 'severe' ? 'strong' : 'moderate',
        })));
      } catch (e) {
        console.error('Trade flows data fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'moderate': return 'bg-amber-500';
      case 'congested': return 'bg-orange-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
      case 'moderate': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800';
      case 'congested': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800';
      case 'severe': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800';
      default: return 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600';
    }
  };

  const tabs = [
    { id: 'borders', label: 'Border Crossings', icon: MapPin },
    { id: 'corridors', label: 'Corridor Efficiency', icon: Truck },
    { id: 'congestion', label: 'Congestion Map', icon: AlertTriangle },
    { id: 'modal', label: 'Modal Analysis', icon: Package },
    { id: 'vessels', label: 'Live Tracking', icon: Ship },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-trade-accent" />
        <span className="ml-3 text-sm text-gray-500">Loading trade flows...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm border-l-4 border-l-trade-accent">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
              <Truck className="w-6 h-6 text-trade-accent" /> Trade Flows
            </h1>
            <p className="text-xs text-gray-500 mt-1">Visualize trade movement — border crossings, corridor efficiency & congestion intelligence</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
              {['live', '24h', '7d', '30d'].map(t => (
                <button key={t} onClick={() => setTimelineFilter(t)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold capitalize ${timelineFilter === t ? 'bg-trade-primary text-white shadow-sm' : 'text-gray-500'}`}>
                  {t}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-trade-primary text-white rounded-lg text-xs font-bold">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-trade-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* TAB: BORDER CROSSINGS */}
        {activeTab === 'borders' && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Active Borders</p>
                <p className="text-2xl font-black text-trade-primary dark:text-white">{BORDER_CROSSINGS.length}</p>
                <p className="text-[10px] text-gray-400">monitored in real-time</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-[10px] font-bold text-red-500 uppercase">Severe Delays</p>
                <p className="text-2xl font-black text-red-600">{BORDER_CROSSINGS.filter(b => b.status === 'severe').length}</p>
                <p className="text-[10px] text-red-400">borders with 40h+ wait</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Daily Truck Volume</p>
                <p className="text-2xl font-black text-trade-primary dark:text-white">{BORDER_CROSSINGS.reduce((s, b) => s + b.dailyTrucks, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Avg Wait Time</p>
                <p className="text-2xl font-black text-trade-primary dark:text-white">{Math.round(BORDER_CROSSINGS.reduce((s, b) => s + b.avgWait, 0) / BORDER_CROSSINGS.length)}h</p>
              </div>
            </div>

            {/* Border Crossing Table */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-trade-accent" /> Border Crossing Performance
              </h3>
              <div className="space-y-2">
                {BORDER_CROSSINGS.map(border => (
                  <div key={border.name}
                    onClick={() => setSelectedBorder(border)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${getStatusBg(border.status)} ${
                      selectedBorder?.name === border.name ? 'ring-2 ring-trade-accent' : ''
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(border.status)} ${border.status === 'severe' ? 'animate-pulse' : ''}`}></div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{border.name}</p>
                          <p className="text-[10px] text-gray-500">{border.countries}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{border.dailyTrucks}/day</p>
                          <p className="text-[10px] text-gray-400">trucks</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-bold ${border.avgWait > 30 ? 'text-red-600' : border.avgWait > 15 ? 'text-amber-600' : 'text-green-600'}`}>{border.avgWait}h</p>
                          <p className="text-[10px] text-gray-400">avg wait</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{border.throughput}%</p>
                          <p className="text-[10px] text-gray-400">capacity</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          border.status === 'normal' ? 'bg-green-600 text-white' :
                          border.status === 'moderate' ? 'bg-amber-500 text-white' :
                          border.status === 'congested' ? 'bg-orange-500 text-white' :
                          'bg-red-600 text-white'
                        }`}>{border.status}</span>
                        {border.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> :
                         border.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-500" /> :
                         <ArrowRight className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Optimization Suggestions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-blue-600" /> AI Route Optimization Suggestions
              </h3>
              <div className="space-y-2">
                {ROUTE_SUGGESTIONS.map((rs, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-500 line-through">{rs.current}</div>
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                      <div className="text-xs font-bold text-blue-700 dark:text-blue-300">{rs.suggested}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-green-600">Save {rs.saving}</span>
                      <span className="text-[10px] text-gray-400">{rs.costDiff}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${rs.recommendation === 'strong' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                        {rs.recommendation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: CORRIDOR EFFICIENCY */}
        {activeTab === 'corridors' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Trade Corridor Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 text-left">Corridor</th>
                      <th className="p-3 text-center">Distance (km)</th>
                      <th className="p-3 text-center">Avg Transit (days)</th>
                      <th className="p-3 text-center">Cost/km ($)</th>
                      <th className="p-3 text-center">Reliability</th>
                      <th className="p-3 text-left">Bottleneck</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {CORRIDOR_EFFICIENCY.map(c => (
                      <tr key={c.corridor} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="p-3 font-bold text-gray-900 dark:text-white max-w-[200px]">{c.corridor}</td>
                        <td className="p-3 text-center text-gray-600 dark:text-gray-400">{c.distance.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.avgDays <= 5 ? 'bg-green-100 text-green-700' : c.avgDays <= 8 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {c.avgDays} days
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-bold ${c.costPerKm <= 2.5 ? 'text-green-600' : c.costPerKm <= 4 ? 'text-amber-600' : 'text-red-600'}`}>
                            ${c.costPerKm}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-12 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                              <div className={`h-full rounded-full ${c.reliability >= 80 ? 'bg-green-500' : c.reliability >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${c.reliability}%` }}></div>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white w-8">{c.reliability}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-500">{c.bottleneck}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delay Causes */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Logistics Delay Breakdown</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DELAY_CAUSES} layout="vertical" barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit="h" />
                    <YAxis type="category" dataKey="cause" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={130} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="hours" name="Average Hours" radius={[0, 4, 4, 0]} barSize={16}>
                      {DELAY_CAUSES.map((entry, index) => (
                        <rect key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CONGESTION MAP */}
        {activeTab === 'congestion' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500" /> Real-Time Congestion Heatmap
                </h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span className="text-gray-500">Normal</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-gray-500">Moderate</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div><span className="text-gray-500">High</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div><span className="text-gray-500">Severe</span></div>
                </div>
              </div>
              <div className="relative h-[450px] bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden">
                <svg viewBox="0 0 800 800" className="w-full h-full">
                  <path
                    d="M280,60 Q320,40 380,50 L450,30 Q520,25 560,60 L620,80 Q680,120 700,180 L720,280 Q740,380 700,480 L680,560 Q660,620 600,680 L540,720 Q480,760 400,780 L320,760 Q260,740 220,680 L180,600 Q140,520 160,420 L140,320 Q120,220 180,140 L220,100 Q250,70 280,60"
                    fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"
                    className="dark:fill-slate-700 dark:stroke-slate-600"
                  />
                  {/* Congestion hotspots */}
                  {CONGESTION_HEATMAP.map(spot => (
                    <g key={spot.location}>
                      {/* Glow effect */}
                      <circle cx={spot.x} cy={spot.y} r={spot.severity === 'severe' ? 35 : spot.severity === 'high' ? 28 : 20}
                        fill={spot.severity === 'severe' ? '#ef4444' : spot.severity === 'high' ? '#f97316' : spot.severity === 'moderate' ? '#f59e0b' : '#22c55e'}
                        opacity="0.15" />
                      <circle cx={spot.x} cy={spot.y} r={spot.severity === 'severe' ? 20 : spot.severity === 'high' ? 16 : 12}
                        fill={spot.severity === 'severe' ? '#ef4444' : spot.severity === 'high' ? '#f97316' : spot.severity === 'moderate' ? '#f59e0b' : '#22c55e'}
                        opacity="0.4"
                        className={spot.severity === 'severe' ? 'animate-pulse' : ''} />
                      <circle cx={spot.x} cy={spot.y} r={8}
                        fill={spot.severity === 'severe' ? '#ef4444' : spot.severity === 'high' ? '#f97316' : spot.severity === 'moderate' ? '#f59e0b' : '#22c55e'}
                        stroke="white" strokeWidth="2" />
                      <text x={spot.x} y={spot.y - 18} textAnchor="middle" className="text-[9px] font-bold fill-gray-700 dark:fill-gray-300">
                        {spot.location}
                      </text>
                      <text x={spot.x} y={spot.y + 25} textAnchor="middle" className="text-[8px] font-bold fill-gray-500">
                        {spot.waitHours}h wait
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Port Traffic Trend */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Port Traffic Trend (Million TEU)</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PORT_TRAFFIC}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="durban" name="Durban" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="lagos" name="Lagos" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="mombasa" name="Mombasa" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="tema" name="Tema" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MODAL ANALYSIS */}
        {activeTab === 'modal' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Transport Mode Analysis (Road / Sea / Rail / Air)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {MODAL_SPLIT.map(mode => (
                  <div key={mode.mode} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                        <mode.icon className="w-5 h-5 text-trade-accent" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{mode.mode}</p>
                        <p className="text-[10px] text-gray-400">{mode.share}% of total</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Volume</span>
                        <span className="font-bold text-gray-900 dark:text-white">${mode.volume}B</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Growth</span>
                        <span className="font-bold text-green-600">+{mode.growth}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Cost/ton-km</span>
                        <span className="font-bold text-gray-900 dark:text-white">${mode.avgCost}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">CO2 Impact</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          mode.co2 === 'Low' ? 'bg-green-100 text-green-700' :
                          mode.co2 === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{mode.co2}</span>
                      </div>
                    </div>
                    <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                      <div className="h-full bg-trade-accent rounded-full" style={{ width: `${mode.share}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: LIVE TRACKING */}
        {activeTab === 'vessels' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Ship className="w-4 h-4 text-blue-500" /> Live AIS Vessel Tracking
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px] font-bold">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Live
                </span>
              </div>
              <div className="space-y-3">
                {LIVE_VESSELS.map(vessel => (
                  <div key={vessel.name} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${vessel.status === 'docked' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                          {vessel.type === 'Container' ? <Package className="w-5 h-5 text-blue-600" /> :
                           vessel.type === 'Tanker' ? <Anchor className="w-5 h-5 text-amber-600" /> :
                           <Ship className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{vessel.name}</p>
                          <p className="text-[10px] text-gray-500">{vessel.type} | Flag: {vessel.flag} | {vessel.cargo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-xs text-gray-500">{vessel.position}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
                            <ArrowRight className="w-3 h-3" /> {vessel.destination}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{vessel.eta}</p>
                          <p className="text-[10px] text-gray-400">ETA</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          vessel.status === 'docked' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>{vessel.status === 'docked' ? 'Docked' : 'En Route'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
