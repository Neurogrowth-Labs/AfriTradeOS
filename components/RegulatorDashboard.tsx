import React, { useState } from 'react';
import {
  Building,
  AlertTriangle,
  Download,
  Lock,
  FileSpreadsheet,
  FileText,
  File
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
  { region: 'Central Africa', aml: 10, compliance: 35 },
];

export const RegulatorDashboard: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const ALL_REGIONS = ['All Regions', 'West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa'];

  // Filter data based on selected region
  const filteredIncidentData = selectedRegion === 'all'
    ? INCIDENT_DATA
    : INCIDENT_DATA.filter(d => d.region === selectedRegion);

  // Export report functionality
  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    if (format === 'csv') {
      // Generate CSV
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Region,AML Alerts,Compliance Issues\n';
      filteredIncidentData.forEach(row => {
        csvContent += `${row.region},${row.aml},${row.compliance}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `regulatory_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      // For Excel, we'll use CSV with .xls extension (basic compatibility)
      let csvContent = 'data:application/vnd.ms-excel;charset=utf-8,';
      csvContent += 'AfriTradeOS Regulatory Report\n\n';
      csvContent += 'Generated: ' + new Date().toLocaleDateString() + '\n';
      csvContent += 'Region: ' + (selectedRegion === 'all' ? 'All Regions' : selectedRegion) + '\n\n';
      csvContent += 'Region,AML Alerts,Compliance Issues\n';
      filteredIncidentData.forEach(row => {
        csvContent += `${row.region},${row.aml},${row.compliance}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `regulatory_report_${new Date().toISOString().split('T')[0]}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF - generate text content (in production, use a PDF library)
      const content = `
AFRITRADEOS REGULATORY REPORT
=============================

Generated: ${new Date().toLocaleDateString()}
Region: ${selectedRegion === 'all' ? 'All Regions' : selectedRegion}

SUMMARY
-------
Total Trade Volume: $4.2B
Average Compliance Rate: 91.4%
Active Traders: 12,450
AML Incidents (Active): 42

REGIONAL BREAKDOWN
------------------
${filteredIncidentData.map(r => `${r.region}: ${r.aml} AML Alerts, ${r.compliance} Compliance Issues`).join('\n')}

SECTOR DISTRIBUTION
-------------------
${SECTOR_DATA.map(s => `${s.name}: ${s.value}%`).join('\n')}
      `;
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `regulatory_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setShowExportMenu(false);
  };

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
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value === 'All Regions' ? 'all' : e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 text-sm p-2 rounded-lg border-none outline-none"
            >
                {ALL_REGIONS.map(region => (
                  <option key={region} value={region === 'All Regions' ? 'all' : region}>{region}</option>
                ))}
            </select>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-10 min-w-[160px]">
                  <button
                    onClick={() => handleExportReport('pdf')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
                  >
                    <FileText className="w-4 h-4" /> Export as PDF
                  </button>
                  <button
                    onClick={() => handleExportReport('csv')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
                  >
                    <File className="w-4 h-4" /> Export as CSV
                  </button>
                  <button
                    onClick={() => handleExportReport('excel')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Export as Excel
                  </button>
                </div>
              )}
            </div>
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
                  <BarChart data={filteredIncidentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white' }} />
                      <Bar dataKey="aml" name="AML Alerts" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="compliance" name="Compliance Issues" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
              </ResponsiveContainer>
           </div>
       </div>
    </div>
  );
};