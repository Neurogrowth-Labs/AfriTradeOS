
import React, { useState } from 'react';
import {
  Truck,
  Ship,
  Plane,
  Train,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Anchor,
  X,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// --- DATA ---
interface PortData {
  id: string;
  name: string;
  country: string;
  congestion: 'low' | 'medium' | 'high' | 'critical';
  waitTime: string;
  throughput: string;
  trend: string;
  x: number;
  y: number;
}

interface RouteOption {
  id: string;
  from: string;
  to: string;
  mode: 'sea' | 'air' | 'road' | 'rail';
  cost: number;
  duration: string;
  reliability: number;
  co2: string;
}

interface CorridorScore {
  id: string;
  name: string;
  score: number;
  clearanceTime: string;
  infra: number;
  border: number;
  cost: number;
  trend: 'improving' | 'stable' | 'declining';
}

const PORTS: PortData[] = [
  { id: 'p1', name: 'Lagos (Apapa)', country: 'Nigeria', congestion: 'high', waitTime: '72h', throughput: '1.2M TEU', trend: '-5%', x: 320, y: 350 },
  { id: 'p2', name: 'Tema', country: 'Ghana', congestion: 'low', waitTime: '8h', throughput: '1.0M TEU', trend: '+12%', x: 280, y: 330 },
  { id: 'p3', name: 'Mombasa', country: 'Kenya', congestion: 'medium', waitTime: '24h', throughput: '1.4M TEU', trend: '+8%', x: 600, y: 460 },
  { id: 'p4', name: 'Durban', country: 'South Africa', congestion: 'low', waitTime: '12h', throughput: '2.8M TEU', trend: '+3%', x: 520, y: 720 },
  { id: 'p5', name: 'Djibouti', country: 'Djibouti', congestion: 'medium', waitTime: '18h', throughput: '0.9M TEU', trend: '+15%', x: 650, y: 310 },
  { id: 'p6', name: 'Tangier Med', country: 'Morocco', congestion: 'low', waitTime: '6h', throughput: '3.5M TEU', trend: '+10%', x: 270, y: 80 },
  { id: 'p7', name: 'Port Said', country: 'Egypt', congestion: 'medium', waitTime: '16h', throughput: '2.9M TEU', trend: '+5%', x: 560, y: 100 },
  { id: 'p8', name: 'Dar es Salaam', country: 'Tanzania', congestion: 'high', waitTime: '48h', throughput: '0.8M TEU', trend: '-2%', x: 610, y: 510 },
];

const ROUTE_OPTIONS: RouteOption[] = [
  { id: 'r1', from: 'Lagos', to: 'Mombasa', mode: 'sea', cost: 2800, duration: '18 days', reliability: 82, co2: '1.2t' },
  { id: 'r2', from: 'Lagos', to: 'Mombasa', mode: 'air', cost: 8500, duration: '1 day', reliability: 95, co2: '4.8t' },
  { id: 'r3', from: 'Accra', to: 'Lagos', mode: 'road', cost: 1200, duration: '3 days', reliability: 75, co2: '0.8t' },
  { id: 'r4', from: 'Accra', to: 'Lagos', mode: 'rail', cost: 800, duration: '2 days', reliability: 70, co2: '0.3t' },
  { id: 'r5', from: 'Mombasa', to: 'Kampala', mode: 'rail', cost: 950, duration: '4 days', reliability: 68, co2: '0.4t' },
  { id: 'r6', from: 'Durban', to: 'Maputo', mode: 'road', cost: 650, duration: '1 day', reliability: 88, co2: '0.5t' },
];

const CORRIDORS: CorridorScore[] = [
  { id: 'cs1', name: 'Abidjan–Lagos', score: 78, clearanceTime: '36h', infra: 72, border: 65, cost: 85, trend: 'improving' },
  { id: 'cs2', name: 'Northern Corridor (Mombasa–Kampala)', score: 71, clearanceTime: '48h', infra: 68, border: 60, cost: 78, trend: 'improving' },
  { id: 'cs3', name: 'Trans-Sahara (Lagos–Algiers)', score: 42, clearanceTime: '96h', infra: 35, border: 40, cost: 55, trend: 'stable' },
  { id: 'cs4', name: 'Maputo Corridor', score: 85, clearanceTime: '18h', infra: 88, border: 82, cost: 90, trend: 'improving' },
  { id: 'cs5', name: 'Central Corridor (Dar es Salaam–Kigali)', score: 62, clearanceTime: '60h', infra: 55, border: 58, cost: 72, trend: 'improving' },
  { id: 'cs6', name: 'Dakar–Bamako', score: 58, clearanceTime: '54h', infra: 50, border: 55, cost: 68, trend: 'declining' },
];

const FREIGHT_ESTIMATES = [
  { route: 'Lagos → Mombasa', sea: 2800, air: 8500, road: null, rail: null },
  { route: 'Accra → Lagos', sea: 1500, air: 4200, road: 1200, rail: 800 },
  { route: 'Durban → Maputo', sea: 900, air: 3100, road: 650, rail: 500 },
  { route: 'Mombasa → Kampala', sea: null, air: 5200, road: 1800, rail: 950 },
  { route: 'Casablanca → Dakar', sea: 2100, air: 6800, road: 3200, rail: null },
];

const getModeIcon = (mode: string) => {
  switch (mode) {
    case 'sea': return Ship;
    case 'air': return Plane;
    case 'road': return Truck;
    case 'rail': return Train;
    default: return Package;
  }
};

export const AnalystLogisticsData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ports' | 'routes' | 'freight' | 'corridors'>('ports');
  const [selectedPort, setSelectedPort] = useState<PortData | null>(null);

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-trade-primary dark:text-white">Logistics Data</h2>
              <p className="text-[10px] text-gray-500">Port congestion • Route optimization • Freight estimator • Corridor scoring</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'ports' as const, label: 'Port Tracker', icon: Anchor },
            { id: 'routes' as const, label: 'Route Options', icon: MapPin },
            { id: 'freight' as const, label: 'Freight Estimator', icon: DollarSign },
            { id: 'corridors' as const, label: 'Corridor Scores', icon: BarChart3 },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PORT TRACKER */}
      {activeTab === 'ports' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* Map */}
          <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden min-h-[400px]">
            <div className="absolute top-3 left-3 z-10 bg-slate-800/90 backdrop-blur p-2 rounded-lg border border-slate-700">
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Live Port Congestion Map</span>
            </div>
            <svg viewBox="0 0 800 800" className="w-full h-full">
              <rect width="800" height="800" fill="#0f172a" />
              <path d="M 280 60 Q 200 100 150 250 Q 130 350 160 450 Q 200 550 300 620 Q 350 680 420 750 Q 480 780 520 720 Q 560 650 580 550 Q 620 450 650 350 Q 660 250 600 150 Q 550 80 450 60 Q 370 50 280 60 Z"
                fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {PORTS.map(p => {
                const color = p.congestion === 'low' ? '#10b981' : p.congestion === 'medium' ? '#f59e0b' : p.congestion === 'high' ? '#ef4444' : '#dc2626';
                return (
                  <g key={p.id} onClick={() => setSelectedPort(selectedPort?.id === p.id ? null : p)} className="cursor-pointer">
                    <circle cx={p.x} cy={p.y} r={18} fill={`${color}30`}>
                      <animate attributeName="r" values="16;20;16" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={p.x} cy={p.y} r={8} fill={color} stroke="#0f172a" strokeWidth="2" />
                    <text x={p.x} y={p.y - 14} fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">{p.name}</text>
                  </g>
                );
              })}
            </svg>
            {selectedPort && (
              <div className="absolute bottom-3 left-3 right-3 md:right-auto md:w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-xl p-4 border shadow-2xl z-20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selectedPort.name}</h4>
                    <p className="text-[10px] text-gray-500">{selectedPort.country}</p>
                  </div>
                  <button onClick={() => setSelectedPort(null)}><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-[9px] text-gray-400">Wait Time</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedPort.waitTime}</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-[9px] text-gray-400">Throughput</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedPort.throughput}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Port List */}
          <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto">
            {PORTS.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPort(p)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      p.congestion === 'low' ? 'bg-green-500' : p.congestion === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-[10px] text-gray-500">{p.country}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.congestion === 'low' ? 'bg-green-100 text-green-700' :
                    p.congestion === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>{p.congestion}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">Wait: <span className="font-bold text-gray-800 dark:text-white">{p.waitTime}</span></span>
                  <span className="text-gray-500">{p.throughput}</span>
                  <span className={`font-bold ${p.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{p.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROUTE OPTIONS */}
      {activeTab === 'routes' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROUTE_OPTIONS.map(r => {
              const Icon = getModeIcon(r.mode);
              return (
                <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        r.mode === 'sea' ? 'bg-blue-100 text-blue-600' :
                        r.mode === 'air' ? 'bg-purple-100 text-purple-600' :
                        r.mode === 'road' ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">{r.mode}</p>
                        <p className="text-[10px] text-gray-500">{r.from} → {r.to}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <p className="text-[9px] text-gray-400">Cost</p>
                      <p className="text-sm font-black text-trade-primary dark:text-white">${r.cost.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <p className="text-[9px] text-gray-400">Duration</p>
                      <p className="text-sm font-black text-trade-primary dark:text-white">{r.duration}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <p className="text-[9px] text-gray-400">Reliability</p>
                      <p className={`text-sm font-black ${r.reliability >= 80 ? 'text-green-600' : r.reliability >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{r.reliability}%</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <p className="text-[9px] text-gray-400">CO₂</p>
                      <p className="text-sm font-black text-gray-600 dark:text-gray-400">{r.co2}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FREIGHT ESTIMATOR */}
      {activeTab === 'freight' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" /> Freight Cost Comparison (USD per Container)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Route</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase"><Ship className="w-3 h-3 inline mr-1" />Sea</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase"><Plane className="w-3 h-3 inline mr-1" />Air</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase"><Truck className="w-3 h-3 inline mr-1" />Road</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase"><Train className="w-3 h-3 inline mr-1" />Rail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {FREIGHT_ESTIMATES.map(f => (
                    <tr key={f.route} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">{f.route}</td>
                      <td className="px-4 py-3 text-xs font-mono">{f.sea ? `$${f.sea.toLocaleString()}` : <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-xs font-mono">{f.air ? `$${f.air.toLocaleString()}` : <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-xs font-mono">{f.road ? `$${f.road.toLocaleString()}` : <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-xs font-mono">{f.rail ? `$${f.rail.toLocaleString()}` : <span className="text-gray-300">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CORRIDOR SCORES */}
      {activeTab === 'corridors' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-500" /> Corridor Performance Scores
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CORRIDORS} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Bar dataKey="score" name="Score" radius={[0, 6, 6, 0]} barSize={16}>
                    {CORRIDORS.map((c, i) => (
                      <Cell key={i} fill={c.score >= 80 ? '#10b981' : c.score >= 60 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CORRIDORS.map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{c.name}</h4>
                  <div className="flex items-center gap-1">
                    <span className={`text-lg font-black ${c.score >= 80 ? 'text-green-600' : c.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{c.score}</span>
                    {c.trend === 'improving' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {c.trend === 'declining' && <TrendingDown className="w-3 h-3 text-red-500" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Clearance Time</span>
                    <span className="font-bold text-gray-800 dark:text-white">{c.clearanceTime}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Infrastructure</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.infra}%` }} />
                      </div>
                      <span className="font-bold text-gray-800 dark:text-white">{c.infra}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Border Efficiency</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${c.border}%` }} />
                      </div>
                      <span className="font-bold text-gray-800 dark:text-white">{c.border}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
