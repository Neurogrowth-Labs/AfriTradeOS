
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
  BarChart3,
  Warehouse,
  Search,
  Star,
  Phone,
  Mail,
  ExternalLink,
  ThermometerSnowflake,
  Shield,
  Clock
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
import { useCurrency } from '../contexts/CurrencyContext';

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

interface WarehouseData {
  id: string;
  name: string;
  operator: string;
  country: string;
  city: string;
  type: 'bonded' | 'general' | 'cold_storage' | 'hazmat';
  capacity: string;
  available: number;
  pricePerSqm: number;
  rating: number;
  reviews: number;
  certifications: string[];
  features: string[];
  contact: { phone: string; email: string };
  x: number;
  y: number;
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

const WAREHOUSES: WarehouseData[] = [
  { id: 'wh1', name: 'Lagos Free Zone Warehouse A', operator: 'Bolloré Logistics', country: 'Nigeria', city: 'Lagos', type: 'bonded', capacity: '25,000 sqm', available: 35, pricePerSqm: 12, rating: 4.6, reviews: 89, certifications: ['ISO 9001', 'AEO', 'TAPA'], features: ['24/7 Security', 'CCTV', 'Fire Suppression', 'Loading Docks'], contact: { phone: '+234 1 234 5678', email: 'lagos@bollore.com' }, x: 320, y: 350 },
  { id: 'wh2', name: 'Tema Port Logistics Hub', operator: 'Maersk Warehousing', country: 'Ghana', city: 'Tema', type: 'general', capacity: '18,000 sqm', available: 60, pricePerSqm: 9, rating: 4.8, reviews: 124, certifications: ['ISO 14001', 'C-TPAT'], features: ['Rail Access', 'Container Yard', 'Cross-Docking'], contact: { phone: '+233 30 212 3456', email: 'tema@maersk.com' }, x: 280, y: 330 },
  { id: 'wh3', name: 'Mombasa Cold Chain Center', operator: 'Kuehne+Nagel', country: 'Kenya', city: 'Mombasa', type: 'cold_storage', capacity: '8,000 sqm', available: 25, pricePerSqm: 22, rating: 4.7, reviews: 67, certifications: ['HACCP', 'GDP', 'ISO 22000'], features: ['-25°C to +15°C', 'Pharma Grade', 'Reefer Plugs'], contact: { phone: '+254 41 234 5678', email: 'mombasa@kuehne-nagel.com' }, x: 600, y: 460 },
  { id: 'wh4', name: 'Durban Industrial Park', operator: 'Imperial Logistics', country: 'South Africa', city: 'Durban', type: 'general', capacity: '45,000 sqm', available: 40, pricePerSqm: 8, rating: 4.5, reviews: 156, certifications: ['ISO 9001', 'BEE Level 2'], features: ['Automated WMS', 'E-commerce Fulfillment', 'Value-Added Services'], contact: { phone: '+27 31 234 5678', email: 'durban@imperiallogistics.com' }, x: 520, y: 720 },
  { id: 'wh5', name: 'Djibouti Free Trade Zone', operator: 'DP World', country: 'Djibouti', city: 'Djibouti City', type: 'bonded', capacity: '32,000 sqm', available: 55, pricePerSqm: 11, rating: 4.4, reviews: 45, certifications: ['ISO 28000', 'AEO'], features: ['Duty Free', 'Re-export Hub', 'Multi-modal'], contact: { phone: '+253 21 35 1234', email: 'djibouti@dpworld.com' }, x: 650, y: 310 },
  { id: 'wh6', name: 'Tangier Med Logistics Platform', operator: 'TMSA', country: 'Morocco', city: 'Tangier', type: 'bonded', capacity: '55,000 sqm', available: 45, pricePerSqm: 10, rating: 4.9, reviews: 198, certifications: ['ISO 9001', 'ISO 14001', 'AEO'], features: ['EU Gateway', 'Automotive Hub', 'Pharma Zone'], contact: { phone: '+212 539 33 7000', email: 'logistics@tmsa.ma' }, x: 270, y: 80 },
  { id: 'wh7', name: 'Cairo Hazmat Storage Facility', operator: 'Agility', country: 'Egypt', city: 'Cairo', type: 'hazmat', capacity: '5,000 sqm', available: 30, pricePerSqm: 28, rating: 4.3, reviews: 34, certifications: ['ADR', 'IMDG', 'ISO 45001'], features: ['Hazmat Licensed', 'Spill Containment', 'Emergency Response'], contact: { phone: '+20 2 2345 6789', email: 'cairo@agility.com' }, x: 560, y: 100 },
  { id: 'wh8', name: 'Dar es Salaam Gateway', operator: 'Bollore Africa', country: 'Tanzania', city: 'Dar es Salaam', type: 'general', capacity: '15,000 sqm', available: 50, pricePerSqm: 7, rating: 4.2, reviews: 56, certifications: ['ISO 9001'], features: ['Inland Container Depot', 'Customs Clearance', 'Transit Storage'], contact: { phone: '+255 22 211 2345', email: 'dar@bollore.com' }, x: 610, y: 510 },
];

const WAREHOUSE_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  bonded: { label: 'Bonded', color: 'text-blue-600', bg: 'bg-blue-100', icon: Shield },
  general: { label: 'General', color: 'text-gray-600', bg: 'bg-gray-100', icon: Package },
  cold_storage: { label: 'Cold Storage', color: 'text-cyan-600', bg: 'bg-cyan-100', icon: ThermometerSnowflake },
  hazmat: { label: 'Hazmat', color: 'text-red-600', bg: 'bg-red-100', icon: Shield },
};

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
  const { currencySymbol, formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<'ports' | 'routes' | 'freight' | 'corridors' | 'warehouses'>('ports');
  const [selectedPort, setSelectedPort] = useState<PortData | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null);
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [warehouseTypeFilter, setWarehouseTypeFilter] = useState<string>('all');

  const filteredWarehouses = WAREHOUSES.filter(w => {
    const matchesSearch = warehouseSearch === '' ||
      w.name.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
      w.city.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
      w.country.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
      w.operator.toLowerCase().includes(warehouseSearch.toLowerCase());
    const matchesType = warehouseTypeFilter === 'all' || w.type === warehouseTypeFilter;
    return matchesSearch && matchesType;
  });

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
              <p className="text-[10px] text-gray-500">Port congestion • Route optimization • Freight estimator • Corridor scoring • Warehouse locator</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'ports' as const, label: 'Port Tracker', icon: Anchor },
            { id: 'routes' as const, label: 'Route Options', icon: MapPin },
            { id: 'freight' as const, label: 'Freight Estimator', icon: DollarSign },
            { id: 'corridors' as const, label: 'Corridor Scores', icon: BarChart3 },
            { id: 'warehouses' as const, label: 'Warehouse Locator', icon: Warehouse },
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

      {/* WAREHOUSE LOCATOR */}
      {activeTab === 'warehouses' && (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={warehouseSearch} 
                onChange={e => setWarehouseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Search warehouses by name, city, country, or operator..." 
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <div className="flex gap-2">
              {['all', 'bonded', 'general', 'cold_storage', 'hazmat'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setWarehouseTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    warehouseTypeFilter === type 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type === 'cold_storage' ? 'Cold Storage' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Map + List */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
            {/* Map */}
            <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden min-h-[400px]">
              <div className="absolute top-3 left-3 z-10 bg-slate-800/90 backdrop-blur p-2 rounded-lg border border-slate-700">
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Warehouse Locations</span>
              </div>
              <svg viewBox="0 0 800 800" className="w-full h-full">
                <rect width="800" height="800" fill="#0f172a" />
                <path d="M 280 60 Q 200 100 150 250 Q 130 350 160 450 Q 200 550 300 620 Q 350 680 420 750 Q 480 780 520 720 Q 560 650 580 550 Q 620 450 650 350 Q 660 250 600 150 Q 550 80 450 60 Q 370 50 280 60 Z"
                  fill="#1e293b" stroke="#334155" strokeWidth="1" />
                {filteredWarehouses.map(w => {
                  const config = WAREHOUSE_TYPE_CONFIG[w.type];
                  const color = w.type === 'bonded' ? '#3b82f6' : w.type === 'cold_storage' ? '#06b6d4' : w.type === 'hazmat' ? '#ef4444' : '#6b7280';
                  return (
                    <g key={w.id} onClick={() => setSelectedWarehouse(selectedWarehouse?.id === w.id ? null : w)} className="cursor-pointer">
                      <circle cx={w.x} cy={w.y} r={16} fill={`${color}30`}>
                        <animate attributeName="r" values="14;18;14" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <rect x={w.x - 8} y={w.y - 8} width="16" height="16" rx="3" fill={color} stroke="#0f172a" strokeWidth="2" />
                      <text x={w.x} y={w.y - 16} fill="#94a3b8" fontSize="7" textAnchor="middle" fontWeight="bold">{w.city}</text>
                    </g>
                  );
                })}
              </svg>
              {selectedWarehouse && (
                <div className="absolute bottom-3 left-3 right-3 md:right-auto md:w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-xl p-4 border shadow-2xl z-20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selectedWarehouse.name}</h4>
                      <p className="text-[10px] text-gray-500">{selectedWarehouse.operator} • {selectedWarehouse.city}, {selectedWarehouse.country}</p>
                    </div>
                    <button onClick={() => setSelectedWarehouse(null)}><X className="w-4 h-4 text-gray-400" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
                      <p className="text-[9px] text-gray-400">Capacity</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedWarehouse.capacity}</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
                      <p className="text-[9px] text-gray-400">Available</p>
                      <p className="text-xs font-bold text-green-600">{selectedWarehouse.available}%</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
                      <p className="text-[9px] text-gray-400">Price/sqm</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{currencySymbol}{selectedWarehouse.pricePerSqm}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedWarehouse.features.map(f => (
                      <span key={f} className="text-[9px] bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${selectedWarehouse.contact.phone}`} className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                    <a href={`mailto:${selectedWarehouse.contact.email}`} className="flex-1 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Warehouse List */}
            <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">
                {filteredWarehouses.length} warehouses found
              </div>
              {filteredWarehouses.map(w => {
                const config = WAREHOUSE_TYPE_CONFIG[w.type];
                const TypeIcon = config.icon;
                return (
                  <div 
                    key={w.id} 
                    onClick={() => setSelectedWarehouse(w)}
                    className={`bg-white dark:bg-slate-800 rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${
                      selectedWarehouse?.id === w.id ? 'border-teal-400 ring-1 ring-teal-200' : 'border-gray-100 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${config.bg}`}>
                          <TypeIcon className={`w-3.5 h-3.5 ${config.color}`} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">{w.name}</h4>
                          <p className="text-[10px] text-gray-500">{w.operator}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] mb-2">
                      <span className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {w.city}, {w.country}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400" /> {w.rating} ({w.reviews})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-1.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-[9px] text-gray-400">Capacity</p>
                        <p className="text-[10px] font-bold text-gray-800 dark:text-white">{w.capacity}</p>
                      </div>
                      <div className="text-center p-1.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-[9px] text-gray-400">Available</p>
                        <p className={`text-[10px] font-bold ${w.available >= 50 ? 'text-green-600' : w.available >= 25 ? 'text-amber-600' : 'text-red-600'}`}>{w.available}%</p>
                      </div>
                      <div className="text-center p-1.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-[9px] text-gray-400">{currencySymbol}/sqm/mo</p>
                        <p className="text-[10px] font-bold text-gray-800 dark:text-white">{currencySymbol}{w.pricePerSqm}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {w.certifications.slice(0, 3).map(cert => (
                        <span key={cert} className="text-[8px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded">{cert}</span>
                      ))}
                      {w.certifications.length > 3 && (
                        <span className="text-[8px] text-gray-400">+{w.certifications.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
