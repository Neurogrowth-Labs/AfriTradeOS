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
  EyeOff
} from 'lucide-react';
import { fastChatResponse } from '../services/geminiService';

// --- Types & Mock Data ---

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

const ALERTS = [
  { id: 1, type: 'compliance', severity: 'high', title: 'Potential ROO Breach', message: 'Shipment #402 (Cotton) contains >60% non-originating materials.', time: '10m ago' },
  { id: 2, type: 'logistics', severity: 'medium', title: 'Border Congestion', message: 'Beitbridge crossing delays increasing by 4 hours.', time: '35m ago' },
  { id: 3, type: 'market', severity: 'low', title: 'FX Fluctuation', message: 'NGN/USD volatility may impact import duties.', time: '2h ago' },
  { id: 4, type: 'compliance', severity: 'medium', title: 'Doc Missing', message: 'Phytosanitary cert missing for Shipment #889.', time: '3h ago' },
];

export const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState("Loading AI trade strategic brief...");
  const [selectedLane, setSelectedLane] = useState<TradeLane | null>(null);
  
  // Configurable Widget State
  const [showConfig, setShowConfig] = useState(false);
  const [widgets, setWidgets] = useState({
    kpis: true,
    map: true,
    alerts: true
  });

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const text = await fastChatResponse("Provide a 1-sentence executive summary of current trade risks in the AfCFTA zone today.");
        setInsight(text);
      } catch (e) {
        setInsight("System operational. AI strategic brief currently unavailable.");
      }
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      
      {/* Configuration Toggle */}
      <div className="absolute top-[-4.5rem] right-0 hidden md:block z-50">
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${showConfig ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:text-blue-600'}`}
        >
          <Settings className="w-3.5 h-3.5" />
          Customize
        </button>

        {/* Config Menu */}
        {showConfig && (
           <div className="absolute top-10 right-0 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 p-2 z-50 animate-fade-in">
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 px-2">Visible Widgets</p>
              <div className="space-y-1">
                 {[
                   { id: 'kpis', label: 'KPI Tiles' },
                   { id: 'map', label: 'Trade Map' },
                   { id: 'alerts', label: 'Risk Radar' }
                 ].map(w => (
                   <button 
                     key={w.id} 
                     onClick={() => toggleWidget(w.id as keyof typeof widgets)}
                     className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-gray-200"
                   >
                     {w.label}
                     {widgets[w.id as keyof typeof widgets] ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                   </button>
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* 1. KPI Tiles */}
      {widgets.kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {[
            { label: 'Active Shipments', value: '142', sub: '+12% vs last week', icon: Truck, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Avg Clearance Time', value: '38h', sub: '-4h improvement', icon: Clock, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Compliance Score', value: '98.5%', sub: 'AfCFTA Standard', icon: ShieldCheck, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Risk Exposure', value: 'Low', sub: 'Score: 12/100', icon: Activity, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-start justify-between transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                <p className={`text-xs mt-1 ${stat.sub.includes('+') || stat.sub.includes('Low') || stat.sub.includes('improvement') ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {stat.sub}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 2. Interactive Map (Main Panel) */}
        {widgets.map && (
          <div className="flex-1 bg-slate-900 dark:bg-slate-950 rounded-xl shadow-lg relative overflow-hidden border border-slate-700 group animate-fade-in">
            <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur p-3 rounded-lg border border-slate-700">
               <div className="flex items-center gap-2 mb-2">
                  <MapIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Trade Flow</span>
               </div>
               <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> <span className="text-slate-400">Optimal</span></div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> <span className="text-slate-400">Delay</span></div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> <span className="text-slate-400">Blocked</span></div>
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

                {/* Simplified Africa Outline - Dynamic based on class logic isn't trivial in SVG without CSS vars or classes */}
                <path 
                  d="M 280,60 C 350,60 450,70 550,80 C 600,200 650,300 600,450 C 550,600 500,700 500,700 C 400,600 320,500 320,350 C 200,300 150,280 150,280 C 150,150 200,100 280,60 Z"
                  className="fill-slate-800 dark:fill-slate-900 stroke-slate-700 stroke-2"
                />

                {/* Trade Lanes */}
                {LANES.map((lane) => {
                  const color = lane.status === 'optimal' ? '#22c55e' : lane.status === 'delayed' ? '#eab308' : '#ef4444';
                  return (
                    <g key={lane.id} onClick={() => setSelectedLane(lane)} className="cursor-pointer hover:opacity-80 transition-opacity">
                      {/* Lane Path */}
                      <path
                        d={`M ${lane.coords.x1} ${lane.coords.y1} Q ${lane.coords.cx} ${lane.coords.cy} ${lane.coords.x2} ${lane.coords.y2}`}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="8,4"
                        className="animate-[dash_30s_linear_infinite]"
                        opacity="0.6"
                      />
                      {/* Animated Particle */}
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

                {/* Hubs */}
                {HUBS.map((hub) => (
                  <g key={hub.id}>
                    <circle cx={hub.x} cy={hub.y} r="6" fill="#60a5fa" filter="url(#glow)" className="animate-pulse" />
                    <circle cx={hub.x} cy={hub.y} r="12" fill="#60a5fa" opacity="0.2" className="animate-[ping_3s_ease-in-out_infinite]" />
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
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedLane.volume}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Value</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedLane.value}</p>
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
        )}

        {/* 3. AI Alerts Panel (Right Sidebar) */}
        {widgets.alerts && (
          <div className="w-full lg:w-96 flex flex-col gap-4 animate-fade-in">
             {/* AI Briefing Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 dark:from-indigo-950 dark:to-slate-900 p-5 rounded-xl text-white shadow-lg border border-indigo-700/50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/10 rounded-lg shrink-0">
                  <Activity className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-indigo-100 uppercase tracking-wider">AI Strategic Brief</h3>
                  <p className="text-sm leading-relaxed text-white/90">{insight}</p>
                </div>
              </div>
            </div>

            {/* Alerts Feed */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex-1 flex flex-col overflow-hidden transition-colors">
               <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <AlertTriangle className="w-4 h-4 text-orange-500" />
                     Risk Radar
                  </h3>
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-medium">4 Active</span>
               </div>
               
               <div className="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
                  {ALERTS.map(alert => (
                    <div key={alert.id} className="p-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer group">
                       <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                             alert.type === 'compliance' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                             alert.type === 'logistics' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' :
                             'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          }`}>
                             {alert.type}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{alert.time}</span>
                       </div>
                       <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 mb-1">{alert.title}</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{alert.message}</p>
                       {alert.severity === 'high' && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                             <AlertOctagon className="w-3 h-3" /> Critical Action Required
                          </div>
                       )}
                    </div>
                  ))}
               </div>
               
               <button className="p-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 border-t border-gray-100 dark:border-slate-700 transition-colors">
                  View Full Risk Report
               </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
};
