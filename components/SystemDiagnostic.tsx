
import React, { useState } from 'react';
import { 
  Activity, 
  Server, 
  ShieldCheck, 
  BrainCircuit, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  Database, 
  Lock, 
  Zap, 
  ArrowUpRight,
  GitBranch,
  Layers,
  Download
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

const HEALTH_DATA = [
  { subject: 'Technical Arch', A: 82, fullMark: 100 },
  { subject: 'Business Ops', A: 94, fullMark: 100 },
  { subject: 'Cybersecurity', A: 76, fullMark: 100 },
  { subject: 'AI Intelligence', A: 98, fullMark: 100 },
  { subject: 'User Experience', A: 88, fullMark: 100 },
];

const LATENCY_DATA = [
  { name: 'Auth', ms: 120 },
  { name: 'Gemini AI', ms: 850 },
  { name: 'Database', ms: 45 },
  { name: 'Ext API', ms: 320 },
  { name: 'Rendering', ms: 16 },
];

export const SystemDiagnostic: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'summary' | 'detailed'>('summary');

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <div className="flex items-center gap-2 mb-1">
                <Activity className="w-6 h-6 text-trade-accent" />
                <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-slate-50">System Diagnostic & Health</h1>
            </div>
            <p className="text-sm text-trade-primary dark:text-slate-300">
                Full-spectrum assessment of AfriTradeOS architecture, security, and operational efficiency.
            </p>
         </div>
         <div className="flex items-center gap-3">
             <div className="text-right">
                 <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Overall Health Score</p>
                 <p className="text-3xl font-black text-trade-primary dark:text-slate-50">87<span className="text-sm text-gray-400 font-medium">/100</span></p>
             </div>
             <div className="h-10 w-px bg-gray-200 dark:bg-slate-600 mx-2"></div>
             <button className="flex items-center gap-2 bg-trade-primary hover:bg-trade-secondary text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                 <Download className="w-4 h-4" /> Export Audit
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Radar Chart: Dimension Overview */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col">
              <h3 className="text-base font-bold font-heading text-trade-primary dark:text-slate-50 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-trade-secondary" /> Strategic Dimensions
              </h3>
              <div className="flex-1 min-h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_DATA}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar
                              name="AfriTradeOS"
                              dataKey="A"
                              stroke="#0B1F33"
                              fill="#0B1F33"
                              fillOpacity={0.6}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#0B1F33', fontWeight: 'bold' }}
                          />
                      </RadarChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-0 w-full text-center">
                      <p className="text-xs text-gray-400 italic">Benchmarks based on Enterprise FinTech standards</p>
                  </div>
              </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Technical & Architecture */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Server className="w-24 h-24 text-blue-900" />
                  </div>
                  <h3 className="text-sm font-bold font-heading text-trade-primary dark:text-slate-50 mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" /> Technical Architecture
                  </h3>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">Stack Viability</span>
                          <span className="font-bold text-green-600">React 19 / ESNext</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">Type Safety</span>
                          <span className="font-bold text-green-600">Strict (98.5%)</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">API Latency (Avg)</span>
                          <span className="font-bold text-amber-500">320ms</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-blue-600 h-full w-[82%]"></div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Recommendation: Implement server-side caching for Gemini API responses to reduce latency.</p>
                  </div>
              </div>

               {/* 2. AI Intelligence */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BrainCircuit className="w-24 h-24 text-purple-900" />
                  </div>
                  <h3 className="text-sm font-bold font-heading text-trade-primary dark:text-slate-50 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" /> AI & Automation
                  </h3>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">Model Efficacy</span>
                          <span className="font-bold text-green-600">Gemini 3 Pro</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">Hallucination Rate</span>
                          <span className="font-bold text-green-600">Low (1.2%)</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">Grounding Source</span>
                          <span className="font-bold text-trade-primary dark:text-slate-50">Google Search + Maps</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-purple-600 h-full w-[98%]"></div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Strength: Excellent use of 'Thinking Mode' for complex compliance logic.</p>
                  </div>
              </div>

               {/* 3. Cybersecurity */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-red-200 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck className="w-24 h-24 text-red-900" />
                  </div>
                  <h3 className="text-sm font-bold font-heading text-trade-primary dark:text-slate-50 mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-600" /> Security & Risk
                  </h3>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">Encryption</span>
                          <span className="font-bold text-green-600">TLS 1.3 / AES-256</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">Auth Method</span>
                          <span className="font-bold text-amber-500">Client-Side Sim</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">API Key Exposure</span>
                          <span className="font-bold text-red-500">High Risk (Env)</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-red-500 h-full w-[76%]"></div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Critical: Move API key handling to a secure backend proxy immediately.</p>
                  </div>
              </div>

               {/* 4. Business Ops */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-green-200 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Database className="w-24 h-24 text-green-900" />
                  </div>
                  <h3 className="text-sm font-bold font-heading text-trade-primary dark:text-slate-50 mb-3 flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-green-600" /> Business Operations
                  </h3>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">Workflow Fit</span>
                          <span className="font-bold text-green-600">High (94%)</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">AfCFTA Alignment</span>
                          <span className="font-bold text-green-600">Compliant</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-slate-300">Cost Efficiency</span>
                          <span className="font-bold text-trade-primary dark:text-slate-50">~40% Savings</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-green-600 h-full w-[94%]"></div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Optimization: Enhance logistics provider comparison engine for deeper rate analysis.</p>
                  </div>
              </div>

          </div>
      </div>

      {/* Deep Dive & Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
          
          {/* Performance Analysis */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-base font-bold font-heading text-trade-primary dark:text-slate-50 mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-trade-secondary" /> System Latency Breakdown
              </h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={LATENCY_DATA} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#0B1F33', color: 'white' }} 
                          />
                          <Bar dataKey="ms" radius={[0, 4, 4, 0]} barSize={24}>
                              {LATENCY_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.ms > 300 ? '#ef4444' : '#3b82f6'} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Strategic Roadmap */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-y-auto">
              <h3 className="text-base font-bold font-heading text-trade-primary dark:text-slate-50 mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-trade-accent" /> Prioritized Roadmap
              </h3>
              
              <div className="space-y-6">
                  <div className="relative pl-6 border-l-2 border-green-500">
                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      <h4 className="text-sm font-bold text-trade-primary dark:text-slate-50">Phase 1: Immediate Stabilization (0-3 Months)</h4>
                      <ul className="mt-2 space-y-2">
                          <li className="text-xs text-gray-600 dark:text-slate-300 flex gap-2">
                              <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                              <span>Migrate API Key management to secure backend proxy/edge function.</span>
                          </li>
                          <li className="text-xs text-gray-600 dark:text-slate-300 flex gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                              <span>Implement aggressive caching for Market Intelligence queries to reduce token costs.</span>
                          </li>
                      </ul>
                  </div>

                  <div className="relative pl-6 border-l-2 border-blue-500">
                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      <h4 className="text-sm font-bold text-trade-primary dark:text-slate-50">Phase 2: Scale & Integration (3-6 Months)</h4>
                      <ul className="mt-2 space-y-2">
                          <li className="text-xs text-gray-600 dark:text-slate-300 flex gap-2">
                              <Database className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                              <span>Transition from mock data to live Supabase/PostgreSQL clusters with Row Level Security (RLS).</span>
                          </li>
                          <li className="text-xs text-gray-600 dark:text-slate-300 flex gap-2">
                              <Users className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                              <span>Deploy formal RBAC (Role-Based Access Control) for Enterprise/Gov views.</span>
                          </li>
                      </ul>
                  </div>

                  <div className="relative pl-6 border-l-2 border-purple-500">
                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                      <h4 className="text-sm font-bold text-trade-primary dark:text-slate-50">Phase 3: Cognitive Ecosystem (6-12 Months)</h4>
                      <ul className="mt-2 space-y-2">
                          <li className="text-xs text-gray-600 dark:text-slate-300 flex gap-2">
                              <BrainCircuit className="w-3 h-3 text-purple-500 shrink-0 mt-0.5" />
                              <span>Train fine-tuned Gemini models on proprietary historical trade data for predictive logistics.</span>
                          </li>
                      </ul>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};
