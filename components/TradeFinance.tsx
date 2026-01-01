import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  Landmark, 
  ShieldAlert, 
  TrendingUp, 
  FileCheck, 
  ArrowRight, 
  Briefcase, 
  Building2, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const READINESS_DATA = [
  { name: 'Ready', value: 78, color: '#10b981' },
  { name: 'Gap', value: 22, color: '#e2e8f0' },
];

const RISK_DATA = [
  { name: 'Nigeria', risk: 65, limit: 100 },
  { name: 'Kenya', risk: 40, limit: 100 },
  { name: 'Ghana', risk: 30, limit: 100 },
  { name: 'Egypt', risk: 55, limit: 100 },
];

const FUNDING_OPTIONS = [
  { 
    id: 1, 
    provider: 'Ecobank', 
    type: 'Bank', 
    product: 'Letter of Credit', 
    rate: '2.5%', 
    term: '90 Days', 
    minScore: 70,
    logo: 'E' 
  },
  { 
    id: 2, 
    provider: 'Afreximbank', 
    type: 'DFI', 
    product: 'Trade Guarantee', 
    rate: '1.8%', 
    term: '180 Days', 
    minScore: 80,
    logo: 'A' 
  },
  { 
    id: 3, 
    provider: 'Allianz', 
    type: 'Insurer', 
    product: 'Credit Insurance', 
    rate: '0.9%', 
    term: 'Annual', 
    minScore: 60,
    logo: 'AL' 
  },
];

const APPLICATIONS = [
  { id: 'FIN-2024-001', provider: 'Ecobank', product: 'Working Capital', amount: '$50,000', status: 'Approved', date: 'Oct 20' },
  { id: 'FIN-2024-003', provider: 'Afreximbank', product: 'Export Factoring', amount: '$120,000', status: 'Under Review', date: 'Nov 02' },
];

export const TradeFinance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'options' | 'applications'>('options');

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Landmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trade Finance & Risk</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Access capital and mitigate cross-border exposure</p>
             </div>
         </div>
         <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600">
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            <span>FX Exposure: <span className="font-bold text-gray-900 dark:text-white">$124,500</span></span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Stats & Risk */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           
           {/* Readiness Score */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Finance Readiness Score</h3>
              <div className="h-48 w-full relative flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={READINESS_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          startAngle={180}
                          endAngle={0}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {READINESS_DATA.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-0 text-center">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">78</span>
                    <span className="block text-xs text-gray-500">Good</span>
                 </div>
              </div>
              <p className="text-sm text-gray-500 mt-[-20px]">
                 You qualify for standard trade loans. Upload audited accounts to reach <span className="font-bold text-emerald-600">Excellent (90+)</span>.
              </p>
              <button className="mt-4 w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                 Improve Score
              </button>
           </div>

           {/* Risk Dashboard */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex-1">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                  Country Risk Exposure
                  <TrendingUp className="w-4 h-4" />
              </h3>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={RISK_DATA} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12, fill: '#64748b'}} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white' }} />
                       <Bar dataKey="risk" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} name="Risk Score" />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                 <p className="text-xs text-red-700 dark:text-red-300">
                    <span className="font-bold">Alert:</span> Nigeria exposure exceeds 60% of portfolio. Recommend diversifying or obtaining political risk insurance.
                 </p>
              </div>
           </div>
        </div>

        {/* Right Column: Funding Marketplace */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
           <div className="flex border-b border-gray-100 dark:border-slate-700">
              <button 
                 onClick={() => setActiveTab('options')}
                 className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'options' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                 Available Funding
              </button>
              <button 
                 onClick={() => setActiveTab('applications')}
                 className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'applications' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                 Application Status
              </button>
           </div>

           <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'options' ? (
                 <div className="grid grid-cols-1 gap-4">
                    {FUNDING_OPTIONS.map(opt => (
                       <div key={opt.id} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group relative overflow-hidden">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-gray-500 text-xl">
                                   {opt.logo}
                                </div>
                                <div>
                                   <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{opt.provider}</h4>
                                      <span className="text-[10px] uppercase font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{opt.type}</span>
                                   </div>
                                   <p className="text-sm text-gray-500">{opt.product}</p>
                                </div>
                             </div>
                             <div className="text-right hidden sm:block">
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{opt.rate}</p>
                                <p className="text-xs text-gray-400">Interest Rate</p>
                             </div>
                          </div>
                          
                          <div className="mt-4 flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                             <div>
                                <p className="text-xs text-gray-400 uppercase">Term</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{opt.term}</p>
                             </div>
                             <div>
                                <p className="text-xs text-gray-400 uppercase">Readiness</p>
                                <div className="flex items-center gap-1">
                                    <span className={`font-semibold ${78 >= opt.minScore ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {78 >= opt.minScore ? 'Qualified' : `Need ${opt.minScore}`}
                                    </span>
                                </div>
                             </div>
                             <div className="ml-auto">
                                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">
                                   Apply Now <ArrowRight className="w-4 h-4" />
                                </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="space-y-4">
                    {APPLICATIONS.map(app => (
                       <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-700">
                          <div className="flex items-center gap-4">
                             <div className={`p-2 rounded-full ${
                                app.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                                app.status === 'Under Review' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'
                             }`}>
                                {app.status === 'Approved' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{app.provider}</h4>
                                <p className="text-xs text-gray-500">{app.product} • {app.id}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="font-bold text-gray-900 dark:text-white">{app.amount}</p>
                             <p className={`text-xs font-bold ${
                                app.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'
                             }`}>{app.status}</p>
                             <p className="text-[10px] text-gray-400">{app.date}</p>
                          </div>
                       </div>
                    ))}
                    
                    {APPLICATIONS.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No active applications</p>
                        </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};