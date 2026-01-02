import React, { useState } from 'react';
import { 
  Building, 
  Globe, 
  TrendingUp, 
  AlertTriangle, 
  Map as MapIcon,
  Download,
  Calendar,
  Lock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const SECTOR_DATA = [
  { name: 'Agriculture', value: 45, color: '#10b981' },
  { name: 'Manufacturing', value: 25, color: '#3b82f6' },
  { name: 'Energy', value: 15, color: '#f59e0b' },
  { name: 'Services', value: 15, color: '#8b5cf6' },
];

const COMPLIANCE_TREND = [
  { month: 'Jan', rate: 82 },
  { month: 'Feb', rate: 84 },
  { month: 'Mar', rate: 83 },
  { month: 'Apr', rate: 88 },
  { month: 'May', rate: 89 },
  { month: 'Jun', rate: 91 },
];

const INCIDENT_DATA = [
  { region: 'West Africa', aml: 12, compliance: 45 },
  { region: 'East Africa', aml: 8, compliance: 32 },
  { region: 'Southern Africa', aml: 5, compliance: 28 },
  { region: 'North Africa', aml: 15, compliance: 38 },
];

export const RegulatorDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('YTD');

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
       {/* Header */}
       <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex justify-between items-center border-l-4 border-l-trade-accent">
         <div>
           <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-trade-accent" /> National Oversight Portal
           </h1>
           <p className="text-sm text-gray-500 flex items-center gap-2">
              <Lock className="w-3 h-3" /> Secure Read-Only Access • Government Regulator View
           </p>
         </div>
         <div className="flex gap-2">
            <select className="bg-gray-100 dark:bg-slate-700 text-sm p-2 rounded-lg border-none outline-none">
                <option>All Regions</option>
                <option>West Africa</option>
                <option>East Africa</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold">
               <Download className="w-4 h-4" /> Export Report
            </button>
         </div>
       </div>

       {/* Macro Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
             <p className="text-xs font-bold text-gray-400 uppercase">Total Trade Volume</p>
             <p className="text-3xl font-black text-trade-primary dark:text-white mt-1">$4.2B</p>
             <p className="text-xs text-green-500 font-bold mt-1">↑ 12% YoY</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
             <p className="text-xs font-bold text-gray-400 uppercase">Avg Compliance Rate</p>
             <p className="text-3xl font-black text-trade-primary dark:text-white mt-1">91.4%</p>
             <p className="text-xs text-green-500 font-bold mt-1">↑ 2.1% from Q1</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
             <p className="text-xs font-bold text-gray-400 uppercase">Active Traders</p>
             <p className="text-3xl font-black text-trade-primary dark:text-white mt-1">12,450</p>
             <p className="text-xs text-gray-500 font-bold mt-1">Across 5 Regions</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
             <p className="text-xs font-bold text-gray-400 uppercase">AML Incidents</p>
             <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">42</p>
             <p className="text-xs text-red-500 font-bold mt-1">Active Investigations</p>
          </div>
       </div>

       {/* Charts Row 1 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
           
           {/* Sector Exposure */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trade Volume by Sector</h3>
              <div className="flex-1 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                     <PieChart>
                        <Pie
                           data={SECTOR_DATA}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {SECTOR_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                     {SECTOR_DATA.map(d => (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                           <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                           <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                           <span className="font-bold text-gray-900 dark:text-white">{d.value}%</span>
                        </div>
                     ))}
                  </div>
              </div>
           </div>

           {/* Compliance Trend */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Compliance Rate Trend (6 Months)</h3>
              <div className="flex-1">
                 <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={COMPLIANCE_TREND}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                       <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} 
                       />
                       <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
       </div>

       {/* Charts Row 2: Regional Risk */}
       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex-1">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5 text-red-500" /> Regional Risk & Incident Analysis
              </h3>
              <div className="text-sm text-gray-500 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                 Data updated: Live
              </div>
           </div>
           
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={INCIDENT_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="region" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white' }} />
                      <Bar dataKey="aml" name="AML Alerts" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="compliance" name="Compliance Issues" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
              </ResponsiveContainer>
           </div>
       </div>
    </div>
  );
};