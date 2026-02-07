
import React, { useEffect, useState, useRef } from 'react';
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
  Briefcase, 
  FileText, 
  TrendingUp, 
  Search, 
  CheckCircle, 
  Plus, 
  Scale, 
  Users,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { fastChatResponse } from '../services/geminiService';
import { mockDatabase } from '../services/mockDatabase'; // Import DB
import { UserPersona, AppView, DbTrade } from '../types';

// --- Types & Mock Data ---

interface DashboardProps {
  userRole: UserPersona;
  navigateTo: (view: AppView) => void;
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
  status: 'operational' | 'congested' | 'maintenance';
}

interface Alert {
  id: number;
  title: string;
  message: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
}

// Maps & Lanes Data
const INITIAL_HUBS: Hub[] = [
  { id: 'cairo', name: 'Cairo', x: 550, y: 80, status: 'operational' },
  { id: 'lagos', name: 'Lagos', x: 320, y: 350, status: 'operational' },
  { id: 'nairobi', name: 'Nairobi', x: 600, y: 450, status: 'operational' },
  { id: 'joburg', name: 'Johannesburg', x: 500, y: 700, status: 'operational' },
  { id: 'casablanca', name: 'Casablanca', x: 280, y: 60, status: 'operational' },
  { id: 'dakar', name: 'Dakar', x: 150, y: 280, status: 'operational' },
];

const INITIAL_LANES: TradeLane[] = [
  { id: '1', from: 'Lagos', to: 'Cairo', coords: { x1: 320, y1: 350, x2: 550, y2: 80, cx: 400, cy: 200 }, volume: '450 Tons', value: '$12.5M', status: 'optimal', commodity: 'Processed Foods' },
  { id: '2', from: 'Nairobi', to: 'Johannesburg', coords: { x1: 600, y1: 450, x2: 500, y2: 700, cx: 650, cy: 600 }, volume: '1,200 Tons', value: '$45.2M', status: 'delayed', commodity: 'Machinery Parts' },
  { id: '3', from: 'Casablanca', to: 'Lagos', coords: { x1: 280, y1: 60, x2: 320, y2: 350, cx: 200, cy: 200 }, volume: '800 Tons', value: '$8.9M', status: 'optimal', commodity: 'Textiles' },
  { id: '4', from: 'Lagos', to: 'Nairobi', coords: { x1: 320, y1: 350, x2: 600, y2: 450, cx: 460, cy: 500 }, volume: '320 Tons', value: '$5.4M', status: 'blocked', commodity: 'Pharmaceuticals' },
];

// Initial Alerts
const INITIAL_ALERTS: Alert[] = [
  { id: 1, title: 'Compliance Update', message: 'New AfCFTA Rules of Origin for textiles effective next month.', time: '2h ago', severity: 'medium' },
  { id: 2, title: 'Port Congestion', message: 'High delays reported at Mombasa Port due to system maintenance.', time: '5h ago', severity: 'high' },
  { id: 3, title: 'Trade Opportunity', message: 'High demand for Cocoa in Egypt market.', time: '1d ago', severity: 'low' },
];

// Customs Declarations Mock
const DECLARATIONS = [
  { id: 'DEC-001', exporter: 'Global Foods Ltd', origin: 'Ghana', commodity: 'Cocoa Paste', risk: 15, status: 'Cleared' },
  { id: 'DEC-002', exporter: 'Tech Imports SA', origin: 'China', commodity: 'Electronics', risk: 85, status: 'Flagged' },
  { id: 'DEC-003', exporter: 'AgriKenya Exp', origin: 'Kenya', commodity: 'Cut Flowers', risk: 10, status: 'Cleared' },
  { id: 'DEC-004', exporter: 'AutoParts NG', origin: 'India', commodity: 'Brake Pads', risk: 65, status: 'Review' },
];

export const Dashboard: React.FC<DashboardProps> = ({ userRole, navigateTo }) => {
  const [insight, setInsight] = useState("Loading AI strategic brief...");
  const [selectedLane, setSelectedLane] = useState<TradeLane | null>(null);
  const [myTrades, setMyTrades] = useState<DbTrade[]>([]);
  
  // -- REAL-TIME STATE --
  const [lanes, setLanes] = useState<TradeLane[]>(INITIAL_LANES);
  const [hubs, setHubs] = useState<Hub[]>(INITIAL_HUBS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [metrics, setMetrics] = useState({
    activeShipments: 3,
    complianceScore: 88,
    pendingDocs: 1,
    avgClearance: 2.0, // days
    dailyRevenue: 1.2, // M
    pendingDeclarations: 452,
    financeRequests: 24,
    activeLCs: 4.5, // M
    totalExports: 4.2, // B
    tradeBalance: 240, // M
  });

  const [govExportData, setGovExportData] = useState([
    { month: 'Jan', exports: 4000, imports: 2400 },
    { month: 'Feb', exports: 3000, imports: 1398 },
    { month: 'Mar', exports: 2000, imports: 9800 },
    { month: 'Apr', exports: 2780, imports: 3908 },
    { month: 'May', exports: 1890, imports: 4800 },
    { month: 'Jun', exports: 2390, imports: 3800 },
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchInsight = async () => {
      try {
        const prompt = `Provide a 1-sentence executive summary for a ${userRole} in the AfCFTA zone today.`;
        const text = await fastChatResponse(prompt);
        if (isMounted && text) {
            setInsight(text);
        }
      } catch (e) {
        if (isMounted) setInsight("System operational. AI strategic brief currently unavailable.");
      }
    };
    
    const fetchTrades = async () => {
        const data = await mockDatabase.getTrades();
        if (isMounted) {
            setMyTrades(data);
            setMetrics(prev => ({ ...prev, activeShipments: data.length }));
        }
    };

    fetchInsight();
    fetchTrades();

    return () => {
        isMounted = false;
    };
  }, [userRole]);

  // --- REAL-TIME SIMULATION ENGINE ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Jitter Charts (Gov View)
      setGovExportData(prev => prev.map(d => ({
        ...d,
        exports: Math.max(1000, d.exports + (Math.random() - 0.5) * 200),
        imports: Math.max(1000, d.imports + (Math.random() - 0.5) * 200)
      })));

      // 2. Update Metrics (KPIs) - Random Walk
      setMetrics(prev => ({
        ...prev,
        activeShipments: prev.activeShipments, // Don't randomize real count
        dailyRevenue: +(prev.dailyRevenue + (Math.random() - 0.5) * 0.05).toFixed(2),
        pendingDeclarations: Math.max(400, prev.pendingDeclarations + Math.floor((Math.random() - 0.5) * 5)),
        complianceScore: Math.min(100, Math.max(80, prev.complianceScore + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
      }));

      // 3. Dynamic Trade Map (Randomly flip status for lanes and hubs)
      if (Math.random() > 0.7) {
        // Lanes
        setLanes(prevLanes => prevLanes.map(lane => {
          if (Math.random() > 0.8) {
            const statuses: ('optimal' | 'delayed' | 'blocked')[] = ['optimal', 'optimal', 'delayed', 'blocked'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return { ...lane, status: newStatus };
          }
          return lane;
        }));

        // Hubs
        setHubs(prevHubs => prevHubs.map(hub => {
          if (Math.random() > 0.85) {
             const statuses: ('operational' | 'congested' | 'maintenance')[] = ['operational', 'operational', 'operational', 'congested', 'maintenance'];
             const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
             return { ...hub, status: newStatus };
          }
          return hub;
        }));
      }

      // 4. Inject Alerts
      if (Math.random() > 0.95) { // Occasional new alert
        const newAlerts = [
          { 
            id: Date.now(), 
            title: 'New Compliance Flag', 
            message: `Shipment #${Math.floor(Math.random() * 9000) + 1000} flagged for origin verification.`, 
            time: 'Just now', 
            severity: 'high' as const 
          },
          { 
            id: Date.now(), 
            title: 'Market Movement', 
            message: 'Sudden spike in demand for Shea Butter in West Africa.', 
            time: 'Just now', 
            severity: 'low' as const 
          },
          { 
            id: Date.now(), 
            title: 'Logistics Update', 
            message: 'Route cleared: Lagos-Abidjan corridor congestion eased.', 
            time: 'Just now', 
            severity: 'medium' as const 
          }
        ];
        const randomAlert = newAlerts[Math.floor(Math.random() * newAlerts.length)];
        setAlerts(prev => [randomAlert, ...prev.slice(0, 4)]);
      }

    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // --- Dynamic Content Rendering Based on Role ---

  const getKPIs = () => {
    switch (userRole) {
      case UserPersona.EXPORTER_SME:
        return [
          { label: 'Active Shipments', value: metrics.activeShipments.toString(), sub: 'Live Tracking', icon: Truck, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Compliance Health', value: 'Good', sub: `Score: ${metrics.complianceScore}/100`, icon: ShieldCheck, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Pending Docs', value: metrics.pendingDocs.toString(), sub: 'Action Required', icon: FileText, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'Avg Clearance', value: `${metrics.avgClearance} Days`, sub: '-4h vs Avg', icon: Clock, color: 'text-trade-secondary', bg: 'bg-indigo-50' },
        ];
      case UserPersona.CUSTOMS:
        return [
          { label: 'Pending Declarations', value: metrics.pendingDeclarations.toString(), sub: '+12% Vol', icon: FileText, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'High Risk Flags', value: '18', sub: 'Action Req', icon: AlertOctagon, color: 'text-trade-error', bg: 'bg-red-50' },
          { label: 'Revenue (Daily)', value: `$${metrics.dailyRevenue}M`, sub: 'Duties & Taxes', icon: Activity, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Insp. Efficiency', value: '94%', sub: '+2% vs Target', icon: CheckCircle, color: 'text-trade-secondary', bg: 'bg-purple-50' },
        ];
      case UserPersona.BANK:
        return [
          { label: 'Finance Requests', value: metrics.financeRequests.toString(), sub: '8 Pending', icon: Briefcase, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Active LCs', value: `$${metrics.activeLCs}M`, sub: 'Across 12 Trades', icon: Activity, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Credit Risk', value: 'Medium', sub: 'Nigeria Exposure', icon: AlertTriangle, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'FX Rate (NGN)', value: '1,650', sub: '+0.5% Today', icon: TrendingUp, color: 'text-trade-secondary', bg: 'bg-purple-50' },
        ];
      case UserPersona.GOVERNMENT:
        return [
          { label: 'Total Exports', value: `$${metrics.totalExports}B`, sub: 'YTD 2024', icon: ArrowUpRight, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Trade Balance', value: `+$${metrics.tradeBalance}M`, sub: 'Surplus', icon: Scale, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Intra-Africa', value: '18%', sub: 'Target: 25%', icon: MapIcon, color: 'text-trade-secondary', bg: 'bg-purple-50' },
          { label: 'SME Participation', value: '45%', sub: '+5% YoY', icon: Users, color: 'text-trade-accent', bg: 'bg-yellow-50' },
        ];
      default: 
        return [
          { label: 'Active Shipments', value: metrics.activeShipments.toString(), sub: '+12% vs last week', icon: Truck, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Avg Clearance Time', value: '38h', sub: '-4h improvement', icon: Clock, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'Compliance Score', value: `${metrics.complianceScore}%`, sub: 'AfCFTA Standard', icon: ShieldCheck, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Risk Exposure', value: 'Low', sub: 'Score: 12/100', icon: Activity, color: 'text-trade-secondary', bg: 'bg-purple-50' },
        ];
    }
  };

  const renderMainWidget = () => {
    // 1. SME View: Simple Action Center + List
    if (userRole === UserPersona.EXPORTER_SME) {
      return (
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-5 animate-fade-in">
           <div>
              <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {[
                   { label: 'New Trade', icon: Plus, color: 'bg-trade-primary', action: () => navigateTo(AppView.TRADE_LIFECYCLE) },
                   { label: 'Check HS Code', icon: Search, color: 'bg-trade-secondary', action: () => navigateTo(AppView.COMPLIANCE) },
                   { label: 'Track Shipment', icon: Truck, color: 'bg-trade-success', action: () => navigateTo(AppView.LOGISTICS) },
                   { label: 'Find Buyer', icon: Users, color: 'bg-trade-accent', action: () => navigateTo(AppView.MARKETPLACE) }
                 ].map(action => (
                    <button 
                        key={action.label} 
                        onClick={action.action}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-trade-accent dark:hover:border-trade-accent hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group"
                    >
                       <div className={`p-2 rounded-full text-white shadow-lg ${action.color} group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-4 h-4" />
                       </div>
                       <span className="text-xs font-semibold text-trade-primary dark:text-gray-300">{action.label}</span>
                    </button>
                 ))}
              </div>
           </div>
           
           <div className="flex-1">
              <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white mb-3 flex items-center justify-between">
                  My Active Trades
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
                  </span>
              </h3>
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
                 {myTrades.length === 0 ? (
                     <div className="text-center py-4 text-gray-400 text-sm">No active trades found. Start a new one.</div>
                 ) : myTrades.map(ship => (
                    <div key={ship.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-700">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${ship.status === 'pending_execution' || ship.status === 'draft' || ship.status === 'pending_compliance' ? 'bg-blue-100 text-blue-600' : ship.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                             <Truck className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="font-bold font-heading text-trade-primary dark:text-white text-sm">To: {ship.destination_country || 'Pending'}</p>
                             <p className="text-[10px] font-mono text-gray-500">{ship.id}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-xs font-bold uppercase ${ship.status === 'completed' ? 'text-trade-success' : ship.status === 'paused' ? 'text-trade-warning' : 'text-blue-600'}`}>{ship.status}</p>
                          <p className="text-[10px] text-gray-500">{ship.product || 'General Cargo'}</p>
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
           <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-trade-secondary" /> Live Risk Inspection Feed
              </h3>
              <div className="flex gap-2">
                 <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold font-mono">18 High Risk</span>
                 <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold font-mono">420 Cleared</span>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                 <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 uppercase font-medium">
                    <tr>
                       <th className="px-4 py-3">ID</th>
                       <th className="px-4 py-3">Exporter</th>
                       <th className="px-4 py-3">Origin</th>
                       <th className="px-4 py-3">Commodity</th>
                       <th className="px-4 py-3">Risk Score</th>
                       <th className="px-4 py-3">Status</th>
                       <th className="px-4 py-3">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {DECLARATIONS.map(dec => (
                       <tr key={dec.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 font-mono">{dec.id}</td>
                          <td className="px-4 py-3 font-medium text-trade-primary dark:text-white">{dec.exporter}</td>
                          <td className="px-4 py-3">{dec.origin}</td>
                          <td className="px-4 py-3">{dec.commodity}</td>
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-2">
                                <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                   <div className={`h-full ${dec.risk > 50 ? 'bg-trade-error' : 'bg-trade-success'}`} style={{ width: `${dec.risk}%` }} />
                                </div>
                                <span className={`font-bold font-mono ${dec.risk > 50 ? 'text-trade-error' : 'text-trade-success'}`}>{dec.risk}</span>
                             </div>
                          </td>
                          <td className="px-4 py-3">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                dec.status === 'Cleared' ? 'bg-green-100 text-green-700' : 
                                dec.status === 'Flagged' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                             }`}>
                                {dec.status}
                             </span>
                          </td>
                          <td className="px-4 py-3">
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
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-5 animate-fade-in">
             <div className="flex justify-between items-center">
                 <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white">National Trade Balance (Live)</h3>
                 <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <select className="bg-gray-100 dark:bg-slate-700 rounded-lg p-1.5 text-xs outline-none">
                        <option>Last 6 Months</option>
                        <option>Year to Date</option>
                    </select>
                 </div>
             </div>
             <div className="flex-1 min-h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={govExportData}>
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
                       <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                       <YAxis stroke="#94a3b8" fontSize={10} />
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                       <Tooltip contentStyle={{backgroundColor: '#0B1F33', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px'}} />
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
      <div className="flex-1 bg-slate-900 dark:bg-slate-950 rounded-xl shadow-lg relative overflow-hidden border border-slate-700 group animate-fade-in min-h-[400px]">
        <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur p-2.5 rounded-lg border border-slate-700">
           <div className="flex items-center gap-2 mb-1.5">
              <MapIcon className="w-3.5 h-3.5 text-trade-accent" />
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider font-heading">Live Trade Flow</span>
              <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
           </div>
           <div className="flex gap-3 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-trade-success"></span> <span className="text-slate-400">Optimal</span></div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-trade-warning"></span> <span className="text-slate-400">Delay</span></div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-trade-error"></span> <span className="text-slate-400">Blocked</span></div>
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

            {lanes.map((lane) => {
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

            {hubs.map((hub) => {
              const color = hub.status === 'operational' ? '#1FA971' : hub.status === 'congested' ? '#F5A623' : '#D64545';
              return (
                <g key={hub.id}>
                  <circle cx={hub.x} cy={hub.y} r="6" fill={color} filter="url(#glow)" className="animate-pulse" />
                  <circle cx={hub.x} cy={hub.y} r="12" fill={color} opacity="0.2" className="animate-[ping_3s_ease-in-out_infinite]" />
                  <text x={hub.x} y={hub.y - 15} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">{hub.name}</text>
                  <text x={hub.x} y={hub.y + 18} textAnchor="middle" fill={color} fontSize="8" fontWeight="bold" opacity="0.8">
                     {hub.status.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Lane Detail Overlay */}
        {selectedLane && (
          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl rounded-xl p-4 border border-slate-200 dark:border-slate-700 animate-fade-in z-20">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading text-sm">
                  {selectedLane.from} <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" /> {selectedLane.to}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{selectedLane.commodity}</p>
              </div>
              <button onClick={() => setSelectedLane(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-lg">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Volume</p>
                <p className="font-semibold text-slate-900 dark:text-white font-mono text-sm">{selectedLane.volume}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-lg">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Value</p>
                <p className="font-semibold text-slate-900 dark:text-white font-mono text-sm">{selectedLane.value}</p>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
              selectedLane.status === 'optimal' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              selectedLane.status === 'delayed' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {selectedLane.status === 'optimal' ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {selectedLane.status === 'optimal' ? 'Route Clear' : selectedLane.status === 'delayed' ? 'Customs Delay' : 'Route Blocked'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      
      {/* 1. KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getKPIs().map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                <p className={`text-xl font-bold font-heading mt-1 ${kpi.color} dark:text-white`}>{kpi.value}</p>
                <p className="text-[10px] text-gray-500">{kpi.sub}</p>
             </div>
             <div className={`p-2 rounded-lg ${kpi.bg} dark:bg-slate-700/50`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
             </div>
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
         {/* 2. Main Widget (Dynamic) */}
         {renderMainWidget()}

         {/* 3. AI Insight Card & Alerts */}
         <div className="flex flex-col gap-4">
             <div className="bg-gradient-to-br from-trade-primary to-trade-secondary p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Briefcase className="w-24 h-24" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase backdrop-blur-sm border border-white/10 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> AI Executive Brief
                       </span>
                       <span className="text-[10px] text-trade-accent flex items-center gap-1 animate-pulse"><Clock className="w-3 h-3" /> Live</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-90">{insight}</p>
                 </div>
             </div>

             {/* Recent Trades - Visible for all roles */}
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
                        <Truck className="w-4 h-4 text-trade-primary" /> Recent Trades
                    </h3>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
                    </span>
                 </div>
                 <div className="space-y-2.5 max-h-[180px] overflow-y-auto">
                    {myTrades.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">No trades found. <button onClick={() => navigateTo(AppView.TRADE_LIFECYCLE)} className="text-trade-primary hover:underline">Create one</button></div>
                    ) : myTrades.slice(0, 5).map(trade => (
                       <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-700 hover:border-trade-primary/30 transition-colors cursor-pointer" onClick={() => navigateTo(AppView.TRADE_LIFECYCLE)}>
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${trade.status === 'completed' ? 'bg-green-100 text-green-600' : trade.status === 'paused' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Truck className="w-4 h-4" />
                             </div>
                             <div>
                                <p className="font-bold font-heading text-trade-primary dark:text-white text-sm">{trade.product || 'Trade'} → {trade.destination_country || 'Pending'}</p>
                                <p className="text-[10px] font-mono text-gray-500">{trade.id}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className={`text-xs font-bold uppercase ${trade.status === 'completed' ? 'text-trade-success' : trade.status === 'paused' ? 'text-trade-warning' : 'text-blue-600'}`}>{trade.status?.replace('_', ' ')}</p>
                             <p className="text-[10px] text-gray-500">${trade.value?.toLocaleString() || '0'}</p>
                          </div>
                       </div>
                    ))}
                 </div>
             </div>

             {/* Recent Alerts List */}
             <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-trade-warning" /> Live Alerts
                    </h3>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 text-[10px] rounded-full font-bold">
                        {alerts.length} New
                    </span>
                 </div>
                 
                 <div className="space-y-3">
                    {alerts.map(alert => (
                       <div key={alert.id} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-600 animate-in slide-in-from-top-2">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                             alert.severity === 'high' ? 'bg-trade-error' : 
                             alert.severity === 'medium' ? 'bg-trade-warning' : 'bg-trade-success'
                          }`} />
                          <div>
                             <h4 className="text-xs font-bold text-gray-900 dark:text-white">{alert.title}</h4>
                             <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{alert.message}</p>
                             <p className="text-[9px] text-gray-400 mt-1">{alert.time}</p>
                          </div>
                       </div>
                    ))}
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
