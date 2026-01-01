import React, { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  ShieldCheck, 
  Truck, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Map as MapIcon,
  X,
  AlertOctagon,
  Settings,
  Eye,
  EyeOff,
  Briefcase,
  FileText,
  TrendingUp,
  BarChart2,
  PieChart,
  Search,
  CheckCircle,
  Plus,
  Scale,
  Users
} from 'lucide-react';
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
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { fastChatResponse } from '../services/geminiService';
import { UserPersona } from '../types';

// --- Types & Mock Data ---

interface DashboardProps {
  userRole: UserPersona;
}

interface TradeLane {
  id: string;
  from: string;
  to: string;
  coords: { x1: number; y1: number; x2: number; y2: number; cx: number; cy: number };
  volume: string;
  value: string;
  status: 'optimal' | 'delayed' | 'blocked';
  commodity: string;
}

interface Hub {
  id: string;
  name: string;
  x: number;
  y: number;
}

// Maps & Lanes Data
const HUBS: Hub[] = [
  { id: 'cairo', name: 'Cairo', x: 550, y: 80 },
  { id: 'lagos', name: 'Lagos', x: 320, y: 350 },
  { id: 'nairobi', name: 'Nairobi', x: 600, y: 450 },
  { id: 'joburg', name: 'Johannesburg', x: 500, y: 700 },
  { id: 'casablanca', name: 'Casablanca', x: 280, y: 60 },
  { id: 'dakar', name: 'Dakar', x: 150, y: 280 },
];

const LANES: TradeLane[] = [
  { id: '1', from: 'Lagos', to: 'Cairo', coords: { x1: 320, y1: 350, x2: 550, y2: 80, cx: 400, cy: 200 }, volume: '450 Tons', value: '$12.5M', status: 'optimal', commodity: 'Processed Foods' },
  { id: '2', from: 'Nairobi', to: 'Johannesburg', coords: { x1: 600, y1: 450, x2: 500, y2: 700, cx: 650, cy: 600 }, volume: '1,200 Tons', value: '$45.2M', status: 'delayed', commodity: 'Machinery Parts' },
  { id: '3', from: 'Casablanca', to: 'Lagos', coords: { x1: 280, y1: 60, x2: 320, y2: 350, cx: 200, cy: 200 }, volume: '800 Tons', value: '$8.9M', status: 'optimal', commodity: 'Textiles' },
  { id: '4', from: 'Lagos', to: 'Nairobi', coords: { x1: 320, y1: 350, x2: 600, y2: 450, cx: 460, cy: 500 }, volume: '320 Tons', value: '$5.4M', status: 'blocked', commodity: 'Pharmaceuticals' },
];

// Alert Data
const ALERTS = [
  { id: 1, type: 'compliance', severity: 'high', title: 'Potential ROO Breach', message: 'Shipment #402 may not qualify for 0% tariff because non-originating materials exceed 60%.', time: '10m ago' },
  { id: 2, type: 'logistics', severity: 'medium', title: 'Border Congestion', message: 'Beitbridge crossing delays increasing. Expect +4h transit time.', time: '35m ago' },
  { id: 3, type: 'market', severity: 'low', title: 'FX Fluctuation', message: 'NGN/USD volatility may impact calculated import duties.', time: '2h ago' },
  { id: 4, type: 'compliance', severity: 'medium', title: 'Doc Missing', message: 'Shipment #889 is missing a Phytosanitary Certificate. Without it, customs clearance cannot proceed.', time: '3h ago' },
];

// Customs Declarations Mock
const DECLARATIONS = [
  { id: 'DEC-001', exporter: 'Global Foods Ltd', origin: 'Ghana', commodity: 'Cocoa Paste', risk: 15, status: 'Cleared' },
  { id: 'DEC-002', exporter: 'Tech Imports SA', origin: 'China', commodity: 'Electronics', risk: 85, status: 'Flagged' },
  { id: 'DEC-003', exporter: 'AgriKenya Exp', origin: 'Kenya', commodity: 'Cut Flowers', risk: 10, status: 'Cleared' },
  { id: 'DEC-004', exporter: 'AutoParts NG', origin: 'India', commodity: 'Brake Pads', risk: 65, status: 'Review' },
];

// Government Charts Data
const GOV_EXPORT_DATA = [
  { month: 'Jan', exports: 4000, imports: 2400 },
  { month: 'Feb', exports: 3000, imports: 1398 },
  { month: 'Mar', exports: 2000, imports: 9800 },
  { month: 'Apr', exports: 2780, imports: 3908 },
  { month: 'May', exports: 1890, imports: 4800 },
  { month: 'Jun', exports: 2390, imports: 3800 },
];

export const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [insight, setInsight] = useState("Loading AI strategic brief...");
  const [selectedLane, setSelectedLane] = useState<TradeLane | null>(null);
  
  // Configurable Widget State
  const [showConfig, setShowConfig] = useState(false);
  const [widgets, setWidgets] = useState({
    kpis: true,
    main: true,
    sidebar: true
  });

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const prompt = `Provide a 1-sentence executive summary for a ${userRole} in the AfCFTA zone today.`;
        const text = await fastChatResponse(prompt);
        setInsight(text);
      } catch (e) {
        setInsight("System operational. AI strategic brief currently unavailable.");
      }
    };
    fetchInsight();
  }, [userRole]);

  // --- Dynamic Content Rendering Based on Role ---

  const getKPIs = () => {
    switch (userRole) {
      case UserPersona.EXPORTER_SME:
        return [
          { label: 'Active Shipments', value: '3', sub: '2 On Time', icon: Truck, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Compliance Health', value: 'Good', sub: 'Score: 88/100', icon: ShieldCheck, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Pending Docs', value: '1', sub: 'Cert of Origin', icon: FileText, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'Avg Clearance', value: '2 Days', sub: '-4h vs Avg', icon: Clock, color: 'text-trade-secondary', bg: 'bg-indigo-50' },
        ];
      case UserPersona.CUSTOMS:
        return [
          { label: 'Pending Declarations', value: '452', sub: '+12% Vol', icon: FileText, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'High Risk Flags', value: '18', sub: 'Action Req', icon: AlertOctagon, color: 'text-trade-error', bg: 'bg-red-50' },
          { label: 'Revenue (Daily)', value: '$1.2M', sub: 'Duties & Taxes', icon: Activity, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Insp. Efficiency', value: '94%', sub: '+2% vs Target', icon: CheckCircle, color: 'text-trade-secondary', bg: 'bg-purple-50' },
        ];
      case UserPersona.BANK:
        return [
          { label: 'Finance Requests', value: '24', sub: '8 Pending', icon: Briefcase, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Active LCs', value: '$4.5M', sub: 'Across 12 Trades', icon: Activity, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Credit Risk', value: 'Medium', sub: 'Nigeria Exposure', icon: AlertTriangle, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'FX Rate (NGN)', value: '1,650', sub: '+0.5% Today', icon: TrendingUp, color: 'text-trade-secondary', bg: 'bg-purple-50' },
        ];
      case UserPersona.GOVERNMENT:
        return [
          { label: 'Total Exports', value: '$4.2B', sub: 'YTD 2024', icon: ArrowUpRight, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Trade Balance', value: '+$240M', sub: 'Surplus', icon: Scale, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Intra-Africa', value: '18%', sub: 'Target: 25%', icon: MapIcon, color: 'text-trade-secondary', bg: 'bg-purple-50' },
          { label: 'SME Participation', value: '45%', sub: '+5% YoY', icon: Users, color: 'text-trade-accent', bg: 'bg-yellow-50' },
        ];
      default: // Enterprise / Logistics
        return [
          { label: 'Active Shipments', value: '142', sub: '+12% vs last week', icon: Truck, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Avg Clearance Time', value: '38h', sub: '-4h improvement', icon: Clock, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'Compliance Score', value: '98.5%', sub: 'AfCFTA Standard', icon: ShieldCheck, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Risk Exposure', value: 'Low', sub: 'Score: 12/100', icon: Activity, color: 'text-trade-secondary', bg: 'bg-purple-50' },
        ];
    }
  };

  const renderMainWidget = () => {
    // 1. SME View: Simple Action Center + List
    if (userRole === UserPersona.EXPORTER_SME) {
      return (
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6 animate-fade-in">
           <div>
              <h3 className="text-lg font-heading font-bold text-trade-primary dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: 'New Trade', icon: Plus, color: 'bg-trade-primary' },
                   { label: 'Check HS Code', icon: Search, color: 'bg-trade-secondary' },
                   { label: 'Track Shipment', icon: Truck, color: 'bg-trade-success' },
                   { label: 'Find Buyer', icon: Users, color: 'bg-trade-accent' }
                 ].map(action => (
                    <button key={action.label} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-trade-accent dark:hover:border-trade-accent hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group">
                       <div className={`p-3 rounded-full text-white shadow-lg ${action.color} group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-5 h-5" />
                       </div>
                       <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{action.label}</span>
                    </button>
                 ))}
              </div>
           </div>
           
           <div className="flex-1">
              <h3 className="text-lg font-heading font-bold text-trade-primary dark:text-white mb-4">My Active Shipments</h3>
              <div className="space-y-3">
                 {[
                   { id: '#TRD-882', dest: 'Lagos, NG', status: 'In Transit', eta: '2 Days' },
                   { id: '#TRD-889', dest: 'Accra, GH', status: 'Customs Hold', eta: 'Delayed' },
                 ].map(ship => (
                    <div key={ship.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-700">
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${ship.status === 'In Transit' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                             <Truck className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="font-bold font-heading text-gray-900 dark:text-white">{ship.dest}</p>
                             <p className="text-xs font-mono text-gray-500">{ship.id}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-sm font-bold ${ship.status === 'In Transit' ? 'text-trade-success' : 'text-trade-error'}`}>{ship.status}</p>
                          <p className="text-xs text-gray-500">ETA: {ship.eta}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      );
    }

    // 2. Customs View: Risk Screening Table
    if (userRole === UserPersona.CUSTOMS) {
      return (
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-0 flex flex-col animate-fade-in overflow-hidden">
           <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-heading font-bold text-trade-primary dark:text-white flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-trade-secondary" /> Live Risk Inspection Feed
              </h3>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold font-mono">18 High Risk</span>
                 <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold font-mono">420 Cleared</span>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 uppercase font-medium">
                    <tr>
                       <th className="px-6 py-4">ID</th>
                       <th className="px-6 py-4">Exporter</th>
                       <th className="px-6 py-4">Origin</th>
                       <th className="px-6 py-4">Commodity</th>
                       <th className="px-6 py-4">Risk Score</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {DECLARATIONS.map(dec => (
                       <tr key={dec.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs">{dec.id}</td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{dec.exporter}</td>
                          <td className="px-6 py-4">{dec.origin}</td>
                          <td className="px-6 py-4">{dec.commodity}</td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                   <div className={`h-full ${dec.risk > 50 ? 'bg-trade-error' : 'bg-trade-success'}`} style={{ width: `${dec.risk}%` }} />
                                </div>
                                <span className={`font-bold font-mono ${dec.risk > 50 ? 'text-trade-error' : 'text-trade-success'}`}>{dec.risk}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded text-xs font-bold ${
                                dec.status === 'Cleared' ? 'bg-green-100 text-green-700' : 
                                dec.status === 'Flagged' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                             }`}>
                                {dec.status}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <button className="text-trade-secondary hover:underline font-medium">Inspect</button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      );
    }

    // 3. Government View: Macro Charts
    if (userRole === UserPersona.GOVERNMENT) {
       return (
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6 animate-fade-in">
             <div className="flex justify-between items-center">
                 <h3 className="text-lg font-heading font-bold text-trade-primary dark:text-white">National Trade Balance</h3>
                 <select className="bg-gray-100 dark:bg-slate-700 rounded-lg p-2 text-sm outline-none">
                     <option>Last 6 Months</option>
                     <option>Year to Date</option>
                 </select>
             </div>
             <div className="flex-1 min-h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={GOV_EXPORT_DATA}>
                       <defs>
                          <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0B1F33" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#0B1F33" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#C9A24D" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#C9A24D" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="month" stroke="#94a3b8" />
                       <YAxis stroke="#94a3b8" />
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                       <Tooltip contentStyle={{backgroundColor: '#0B1F33', border: 'none', borderRadius: '8px', color: 'white'}} />
                       <Area type="monotone" dataKey="exports" stroke="#0B1F33" fillOpacity={1} fill="url(#colorExp)" name="Exports" />
                       <Area type="monotone" dataKey="imports" stroke="#C9A24D" fillOpacity={1} fill="url(#colorImp)" name="Imports" />
                    </AreaChart>
                 </ResponsiveContainer>
             </div>
          </div>
       );
    }

    // 4. Enterprise/Logistics View: Global Map (Default)
    return (
      <div className="flex-1 bg-slate-900 dark:bg-slate-950 rounded-xl shadow-lg relative overflow-hidden border border-slate-700 group animate-fade-in">
        <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur p-3 rounded-lg border border-slate-700">
           <div className="flex items-center gap-2 mb-2">
              <MapIcon className="w-4 h-4 text-trade-accent" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-heading">Live Trade Flow</span>
           </div>
           <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-trade-success"></span> <span className="text-slate-400">Optimal</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-trade-warning"></span> <span className="text-slate-400">Delay</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-trade-error"></span> <span className="text-slate-400">Blocked</span></div>
           </div>
        </div>

        {/* SVG Map */}
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 800 800" className="w-full h-full max-w-[800px] opacity-90">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <path 
              d="M 280,60 C 350,60 450,70 550,80 C 600,200 650,300 600,450 C 550,600 500,700 500,700 C 400,600 320,500 320,350 C 200,300 150,280 150,280 C 150,150 200,100 280,60 Z"
              className="fill-slate-800 dark:fill-slate-900 stroke-slate-700 stroke-2"
            />

            {LANES.map((lane) => {
              const color = lane.status === 'optimal' ? '#1FA971' : lane.status === 'delayed' ? '#F5A623' : '#D64545';
              return (
                <g key={lane.id} onClick={() => setSelectedLane(lane)} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <path
                    d={`M ${lane.coords.x1} ${lane.coords.y1} Q ${lane.coords.cx} ${lane.coords.cy} ${lane.coords.x2} ${lane.coords.y2}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    className="animate-[dash_30s_linear_infinite]"
                    opacity="0.6"
                  />
                  <circle r="3" fill="white">
                    <animateMotion 
                      dur={lane.status === 'delayed' ? '6s' : '3s'} 
                      repeatCount="indefinite"
                      path={`M ${lane.coords.x1} ${lane.coords.y1} Q ${lane.coords.cx} ${lane.coords.cy} ${lane.coords.x2} ${lane.coords.y2}`}
                    />
                  </circle>
                </g>
              );
            })}

            {HUBS.map((hub) => (
              <g key={hub.id}>
                <circle cx={hub.x} cy={hub.y} r="6" fill="#C9A24D" filter="url(#glow)" className="animate-pulse" />
                <circle cx={hub.x} cy={hub.y} r="12" fill="#C9A24D" opacity="0.2" className="animate-[ping_3s_ease-in-out_infinite]" />
                <text x={hub.x} y={hub.y - 15} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">{hub.name}</text>
              </g>
            ))}
          </svg>
        </div>
        
        {/* Lane Detail Overlay */}
        {selectedLane && (
          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl rounded-xl p-5 border border-slate-200 dark:border-slate-700 animate-fade-in z-20">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                  {selectedLane.from} <ArrowUpRight className="w-4 h-4 text-slate-400" /> {selectedLane.to}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{selectedLane.commodity}</p>
              </div>
              <button onClick={() => setSelectedLane(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400">Volume</p>
                <p className="font-semibold text-slate-900 dark:text-white font-mono">{selectedLane.volume}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400">Value</p>
                <p className="font-semibold text-slate-900 dark:text-white font-mono">{selectedLane.value}</p>
              </div>
            </div>

            <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              selectedLane.status === 'optimal' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              selectedLane.status === 'delayed' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {selectedLane.status === 'optimal' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {selectedLane.status === 'optimal' ? 'Route Clear' : selectedLane.status === 'delayed' ? 'Customs Delay' : 'Route Blocked'}
            </div>
          </div>
        )}
      </div>
    );
  };