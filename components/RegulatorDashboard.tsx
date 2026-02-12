import React, { useState } from 'react';
import {
  Building,
  AlertTriangle,
  Download,
  Lock,
  FileSpreadsheet,
  FileText,
  File,
  TrendingUp,
  TrendingDown,
  Shield,
  Package,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Zap,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';

// Sector distribution data
const SECTOR_DATA = [
  { name: 'Agriculture', value: 45, color: '#10b981' },
  { name: 'Manufacturing', value: 25, color: '#3b82f6' },
  { name: 'Energy', value: 15, color: '#f59e0b' },
  { name: 'Services', value: 15, color: '#8b5cf6' },
];

// Compliance trend over time
const COMPLIANCE_TREND = [
  { month: 'Jan', rate: 82, trades: 1240 },
  { month: 'Feb', rate: 84, trades: 1380 },
  { month: 'Mar', rate: 83, trades: 1520 },
  { month: 'Apr', rate: 88, trades: 1650 },
  { month: 'May', rate: 89, trades: 1890 },
  { month: 'Jun', rate: 91, trades: 2100 },
];

// Regional incident data
const INCIDENT_DATA = [
  { region: 'West Africa', aml: 12, compliance: 45, trades: 4520, revenue: 1.2 },
  { region: 'East Africa', aml: 8, compliance: 32, trades: 3210, revenue: 0.9 },
  { region: 'Southern Africa', aml: 5, compliance: 28, trades: 5670, revenue: 1.8 },
  { region: 'North Africa', aml: 15, compliance: 38, trades: 2890, revenue: 1.1 },
  { region: 'Central Africa', aml: 10, compliance: 35, trades: 1560, revenue: 0.4 },
];

// Country-level data for heatmap
const COUNTRY_DATA = [
  { id: 'NG', name: 'Nigeria', x: 320, y: 350, trades: 4520, compliance: 89, risk: 'low', volume: '$1.2B' },
  { id: 'KE', name: 'Kenya', x: 580, y: 420, trades: 2340, compliance: 92, risk: 'low', volume: '$680M' },
  { id: 'ZA', name: 'South Africa', x: 500, y: 680, trades: 5670, compliance: 95, risk: 'low', volume: '$2.1B' },
  { id: 'EG', name: 'Egypt', x: 530, y: 120, trades: 1890, compliance: 87, risk: 'medium', volume: '$520M' },
  { id: 'GH', name: 'Ghana', x: 280, y: 370, trades: 1560, compliance: 91, risk: 'low', volume: '$420M' },
  { id: 'MA', name: 'Morocco', x: 280, y: 90, trades: 1230, compliance: 88, risk: 'medium', volume: '$380M' },
  { id: 'ET', name: 'Ethiopia', x: 600, y: 340, trades: 890, compliance: 78, risk: 'high', volume: '$210M' },
  { id: 'TZ', name: 'Tanzania', x: 580, y: 500, trades: 1120, compliance: 85, risk: 'medium', volume: '$290M' },
  { id: 'CI', name: "Cote d'Ivoire", x: 250, y: 380, trades: 980, compliance: 84, risk: 'medium', volume: '$270M' },
  { id: 'SN', name: 'Senegal', x: 180, y: 320, trades: 670, compliance: 90, risk: 'low', volume: '$180M' },
  { id: 'UG', name: 'Uganda', x: 560, y: 430, trades: 540, compliance: 82, risk: 'medium', volume: '$140M' },
  { id: 'CM', name: 'Cameroon', x: 400, y: 400, trades: 720, compliance: 79, risk: 'high', volume: '$190M' },
];

// AfCFTA corridor data
const CORRIDOR_DATA = [
  { name: 'Lagos-Accra', volume: 2.4, growth: 15, status: 'optimal' },
  { name: 'Nairobi-Kampala', volume: 1.8, growth: 22, status: 'optimal' },
  { name: 'Johannesburg-Maputo', volume: 3.2, growth: 8, status: 'congested' },
  { name: 'Cairo-Khartoum', volume: 0.9, growth: -5, status: 'blocked' },
  { name: 'Casablanca-Dakar', volume: 1.1, growth: 12, status: 'optimal' },
];

// HS Code breakdown
const HS_CODE_DATA = [
  { code: '0901', name: 'Coffee', value: 450, growth: 12 },
  { code: '2709', name: 'Petroleum Oils', value: 890, growth: -3 },
  { code: '7108', name: 'Gold', value: 670, growth: 8 },
  { code: '1801', name: 'Cocoa Beans', value: 320, growth: 15 },
  { code: '2601', name: 'Iron Ores', value: 280, growth: 5 },
  { code: '0803', name: 'Bananas', value: 190, growth: 18 },
];

// Sanctioned traders list
const SANCTIONED_TRADERS = [
  { id: 'ST001', name: 'Dubious Exports Ltd', country: 'Nigeria', reason: 'Fraudulent documentation', date: '2024-02-15', severity: 'high' },
  { id: 'ST002', name: 'Shadow Trading Co', country: 'Kenya', reason: 'Money laundering suspicion', date: '2024-01-28', severity: 'critical' },
  { id: 'ST003', name: 'Phantom Logistics', country: 'South Africa', reason: 'Customs evasion', date: '2024-03-02', severity: 'medium' },
];

// Suspicious patterns detected by AI
const AI_PATTERNS = [
  { id: 'AP001', pattern: 'Unusual price variance', trades: 23, risk: 'high', detected: '2 hours ago' },
  { id: 'AP002', pattern: 'Circular trade routes', trades: 8, risk: 'critical', detected: '45 mins ago' },
  { id: 'AP003', pattern: 'Document timestamp anomaly', trades: 15, risk: 'medium', detected: '4 hours ago' },
  { id: 'AP004', pattern: 'Rapid entity changes', trades: 5, risk: 'high', detected: '1 day ago' },
];

type RegulatorTab = 'overview' | 'corridors' | 'commodities' | 'sanctions' | 'afcfta';

export const RegulatorDashboard: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<RegulatorTab>('overview');
  const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRY_DATA[0] | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [showAIAlerts, setShowAIAlerts] = useState(true);

  const ALL_REGIONS = ['All Regions', 'West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa'];

  // Filter data based on selected region
  const filteredIncidentData = selectedRegion === 'all'
    ? INCIDENT_DATA
    : INCIDENT_DATA.filter(d => d.region === selectedRegion);

  // Calculate totals
  const totalTradeVolume = INCIDENT_DATA.reduce((sum, r) => sum + r.revenue, 0);
  const totalTrades = INCIDENT_DATA.reduce((sum, r) => sum + r.trades, 0);
  const avgCompliance = Math.round(COUNTRY_DATA.reduce((sum, c) => sum + c.compliance, 0) / COUNTRY_DATA.length);
  const totalAMLIncidents = INCIDENT_DATA.reduce((sum, r) => sum + r.aml, 0);

  // Export report functionality
  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    if (format === 'csv') {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Region,AML Alerts,Compliance Issues,Trades,Revenue (B)\n';
      filteredIncidentData.forEach(row => {
        csvContent += `${row.region},${row.aml},${row.compliance},${row.trades},${row.revenue}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `regulatory_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      let csvContent = 'data:application/vnd.ms-excel;charset=utf-8,';
      csvContent += 'AfriTradeOS Regulatory Report\n\n';
      csvContent += 'Generated: ' + new Date().toLocaleDateString() + '\n';
      csvContent += 'Region: ' + (selectedRegion === 'all' ? 'All Regions' : selectedRegion) + '\n\n';
      csvContent += 'Region,AML Alerts,Compliance Issues,Trades,Revenue (B)\n';
      filteredIncidentData.forEach(row => {
        csvContent += `${row.region},${row.aml},${row.compliance},${row.trades},${row.revenue}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `regulatory_report_${new Date().toISOString().split('T')[0]}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `
AFRITRADEOS REGULATORY REPORT
=============================

Generated: ${new Date().toLocaleDateString()}
Region: ${selectedRegion === 'all' ? 'All Regions' : selectedRegion}

SUMMARY
-------
Total Trade Volume: $${totalTradeVolume.toFixed(1)}B
Average Compliance Rate: ${avgCompliance}%
Active Traders: ${totalTrades.toLocaleString()}
AML Incidents (Active): ${totalAMLIncidents}

REGIONAL BREAKDOWN
------------------
${filteredIncidentData.map(r => `${r.region}: ${r.aml} AML Alerts, ${r.compliance} Compliance Issues, $${r.revenue}B Volume`).join('\n')}

SECTOR DISTRIBUTION
-------------------
${SECTOR_DATA.map(s => `${s.name}: ${s.value}%`).join('\n')}

AfCFTA CORRIDORS
----------------
${CORRIDOR_DATA.map(c => `${c.name}: $${c.volume}B (${c.growth > 0 ? '+' : ''}${c.growth}%)`).join('\n')}
      `;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `regulatory_report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setShowExportMenu(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-amber-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const tabs = [
    { id: 'overview', label: 'National Overview', icon: BarChart3 },
    { id: 'corridors', label: 'Trade Corridors', icon: Globe },
    { id: 'commodities', label: 'Commodities', icon: Package },
    { id: 'sanctions', label: 'Sanctions & Alerts', icon: AlertTriangle },
    { id: 'afcfta', label: 'AfCFTA Compliance', icon: Shield },
  ];

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm border-l-4 border-l-trade-accent">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-trade-accent" /> National Trade Control Tower
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Lock className="w-3 h-3" /> Secure Government & Regulator Access
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-bold ml-2">
                LIVE DATA
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 text-sm p-2 rounded-lg border-none outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value === 'All Regions' ? 'all' : e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 text-sm p-2 rounded-lg border-none outline-none"
            >
              {ALL_REGIONS.map(region => (
                <option key={region} value={region === 'All Regions' ? 'all' : region}>{region}</option>
              ))}
            </select>

            {/* Refresh Button */}
            <button className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">
              <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Export Menu */}
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
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as RegulatorTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-trade-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Macro Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Trade Volume</p>
          <p className="text-3xl font-black text-trade-primary dark:text-white mt-1">${totalTradeVolume.toFixed(1)}B</p>
          <p className="text-xs text-green-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 12% YoY
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-xs font-bold text-gray-400 uppercase">Avg Compliance Rate</p>
          <p className="text-3xl font-black text-trade-primary dark:text-white mt-1">{avgCompliance}%</p>
          <p className="text-xs text-green-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 2.1% from Q1
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-xs font-bold text-gray-400 uppercase">Active Traders</p>
          <p className="text-3xl font-black text-trade-primary dark:text-white mt-1">{totalTrades.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-bold mt-1">Across 54 Countries</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-xs font-bold text-gray-400 uppercase">AML Incidents</p>
          <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">{totalAMLIncidents}</p>
          <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Active Investigations
          </p>
        </div>
      </div>

      {/* AI Alerts Banner */}
      {showAIAlerts && AI_PATTERNS.filter(p => p.risk === 'critical').length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800 dark:text-red-300 text-sm">AI Alert: Suspicious Pattern Detected</p>
              <p className="text-xs text-red-700 dark:text-red-400">
                {AI_PATTERNS.find(p => p.risk === 'critical')?.pattern} affecting {AI_PATTERNS.find(p => p.risk === 'critical')?.trades} trades
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">
              Investigate
            </button>
            <button
              onClick={() => setShowAIAlerts(false)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-lg text-sm font-bold text-red-700 dark:text-red-400 hover:bg-red-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* TAB: NATIONAL OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Africa Heatmap */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-trade-accent" />
                    Africa Trade Heatmap
                  </h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-500">Low Risk</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-gray-500">Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-500">High Risk</span>
                    </div>
                  </div>
                </div>

                {/* SVG Map */}
                <div className="relative h-[400px] bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden">
                  <svg viewBox="0 0 800 800" className="w-full h-full">
                    {/* Simplified Africa outline */}
                    <path
                      d="M280,60 Q320,40 380,50 L450,30 Q520,25 560,60 L620,80 Q680,120 700,180 L720,280 Q740,380 700,480 L680,560 Q660,620 600,680 L540,720 Q480,760 400,780 L320,760 Q260,740 220,680 L180,600 Q140,520 160,420 L140,320 Q120,220 180,140 L220,100 Q250,70 280,60"
                      fill="#e2e8f0"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      className="dark:fill-slate-700 dark:stroke-slate-600"
                    />

                    {/* Trade corridors */}
                    {CORRIDOR_DATA.map((corridor, i) => {
                      const startPoints = [
                        { x: 320, y: 350 }, // Lagos
                        { x: 580, y: 420 }, // Nairobi
                        { x: 500, y: 680 }, // Johannesburg
                        { x: 530, y: 120 }, // Cairo
                        { x: 280, y: 90 },  // Casablanca
                      ];
                      const endPoints = [
                        { x: 280, y: 370 }, // Accra
                        { x: 560, y: 430 }, // Kampala
                        { x: 600, y: 650 }, // Maputo
                        { x: 580, y: 280 }, // Khartoum
                        { x: 180, y: 320 }, // Dakar
                      ];
                      return (
                        <line
                          key={corridor.name}
                          x1={startPoints[i].x}
                          y1={startPoints[i].y}
                          x2={endPoints[i].x}
                          y2={endPoints[i].y}
                          stroke={corridor.status === 'optimal' ? '#10b981' : corridor.status === 'congested' ? '#f59e0b' : '#ef4444'}
                          strokeWidth="3"
                          strokeDasharray={corridor.status === 'blocked' ? '8,4' : 'none'}
                          opacity="0.6"
                        />
                      );
                    })}

                    {/* Country markers */}
                    {COUNTRY_DATA.map(country => (
                      <g
                        key={country.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedCountry(country)}
                      >
                        <circle
                          cx={country.x}
                          cy={country.y}
                          r={Math.max(12, country.trades / 300)}
                          className={`${getRiskColor(country.risk)} opacity-70 hover:opacity-100 transition-opacity`}
                          fill="currentColor"
                        />
                        <circle
                          cx={country.x}
                          cy={country.y}
                          r={Math.max(12, country.trades / 300)}
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x={country.x}
                          y={country.y + 30}
                          textAnchor="middle"
                          className="text-[10px] font-bold fill-gray-700 dark:fill-gray-300"
                        >
                          {country.id}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Country Detail Popup */}
                  {selectedCountry && (
                    <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 min-w-[200px]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">{selectedCountry.name}</h4>
                        <button onClick={() => setSelectedCountry(null)} className="text-gray-400 hover:text-gray-600">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Trade Volume</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedCountry.volume}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Active Trades</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedCountry.trades.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Compliance</span>
                          <span className={`font-bold ${selectedCountry.compliance >= 90 ? 'text-green-600' : selectedCountry.compliance >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                            {selectedCountry.compliance}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Risk Level</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            selectedCountry.risk === 'low' ? 'bg-green-100 text-green-700' :
                            selectedCountry.risk === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {selectedCountry.risk}
                          </span>
                        </div>
                      </div>
                      <button className="w-full mt-3 px-3 py-1.5 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Sector Exposure */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-trade-accent" />
                    Trade by Sector
                  </h3>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={SECTOR_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
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
                  </div>
                  <div className="space-y-2 mt-2">
                    {SECTOR_DATA.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                          <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Pattern Detection */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    AI Pattern Detection
                  </h3>
                  <div className="space-y-3">
                    {AI_PATTERNS.slice(0, 3).map(pattern => (
                      <div
                        key={pattern.id}
                        className={`p-3 rounded-lg border ${
                          pattern.risk === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                          pattern.risk === 'high' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                          'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{pattern.pattern}</p>
                            <p className="text-xs text-gray-500 mt-1">{pattern.trades} trades • {pattern.detected}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            pattern.risk === 'critical' ? 'bg-red-600 text-white' :
                            pattern.risk === 'high' ? 'bg-amber-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {pattern.risk}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Trend */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Compliance Rate Trend (6 Months)</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={COMPLIANCE_TREND}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} fill="url(#colorRate)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Regional Risk Analysis */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> Regional Risk Analysis
                  </h3>
                  <div className="text-sm text-gray-500 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    Live Data
                  </div>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredIncidentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="region" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white' }} />
                      <Legend />
                      <Bar dataKey="aml" name="AML Alerts" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="compliance" name="Compliance Issues" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TRADE CORRIDORS */}
        {activeTab === 'corridors' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">AfCFTA Trade Corridors</h3>
              <div className="space-y-4">
                {CORRIDOR_DATA.map(corridor => (
                  <div
                    key={corridor.name}
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      corridor.status === 'optimal' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                      corridor.status === 'congested' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        corridor.status === 'optimal' ? 'bg-green-100 text-green-600' :
                        corridor.status === 'congested' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{corridor.name}</h4>
                        <p className="text-sm text-gray-500">Trade Volume: ${corridor.volume}B</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`font-bold flex items-center gap-1 ${corridor.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {corridor.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {corridor.growth >= 0 ? '+' : ''}{corridor.growth}%
                        </p>
                        <p className="text-xs text-gray-500">YoY Growth</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        corridor.status === 'optimal' ? 'bg-green-600 text-white' :
                        corridor.status === 'congested' ? 'bg-amber-500 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {corridor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMMODITIES */}
        {activeTab === 'commodities' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Top Traded Commodities by HS Code</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4 text-left">HS Code</th>
                      <th className="p-4 text-left">Commodity</th>
                      <th className="p-4 text-right">Value ($M)</th>
                      <th className="p-4 text-right">YoY Growth</th>
                      <th className="p-4 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {HS_CODE_DATA.map(item => (
                      <tr key={item.code} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="p-4 font-mono font-bold text-trade-primary dark:text-trade-accent">{item.code}</td>
                        <td className="p-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                        <td className="p-4 text-right font-bold text-gray-900 dark:text-white">${item.value}M</td>
                        <td className={`p-4 text-right font-bold ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growth >= 0 ? '+' : ''}{item.growth}%
                        </td>
                        <td className="p-4 text-right">
                          {item.growth >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-600 inline" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600 inline" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SANCTIONS & ALERTS */}
        {activeTab === 'sanctions' && (
          <div className="space-y-6 animate-fade-in">
            {/* Sanctioned Traders */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Sanctioned Trader List
                </h3>
                <button className="text-sm text-trade-primary font-bold hover:underline">View Full List</button>
              </div>
              <div className="space-y-3">
                {SANCTIONED_TRADERS.map(trader => (
                  <div
                    key={trader.id}
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      trader.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      trader.severity === 'high' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                      'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{trader.name}</h4>
                      <p className="text-sm text-gray-500">{trader.country} • {trader.reason}</p>
                      <p className="text-xs text-gray-400 mt-1">Sanctioned: {trader.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      trader.severity === 'critical' ? 'bg-red-600 text-white' :
                      trader.severity === 'high' ? 'bg-amber-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {trader.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Pattern Alerts */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Suspicious Trade Patterns (AI-Detected)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_PATTERNS.map(pattern => (
                  <div
                    key={pattern.id}
                    className={`p-4 rounded-xl border ${
                      pattern.risk === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      pattern.risk === 'high' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                      'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">{pattern.pattern}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pattern.risk === 'critical' ? 'bg-red-600 text-white' :
                        pattern.risk === 'high' ? 'bg-amber-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {pattern.risk}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{pattern.trades} trades affected</p>
                    <p className="text-xs text-gray-400 mt-1">Detected: {pattern.detected}</p>
                    <button className="mt-3 w-full px-3 py-1.5 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90">
                      Investigate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: AfCFTA COMPLIANCE */}
        {activeTab === 'afcfta' && (
          <div className="space-y-6 animate-fade-in">
            {/* AfCFTA Compliance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-xs font-bold text-green-600 uppercase">Compliant Trades</p>
                    <p className="text-3xl font-black text-green-700 dark:text-green-400">87%</p>
                  </div>
                </div>
                <p className="text-sm text-green-600">12,450 trades meet AfCFTA rules of origin</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-8 h-8 text-amber-600" />
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase">Pending Review</p>
                    <p className="text-3xl font-black text-amber-700 dark:text-amber-400">8%</p>
                  </div>
                </div>
                <p className="text-sm text-amber-600">1,120 trades awaiting verification</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-xs font-bold text-red-600 uppercase">Non-Compliant</p>
                    <p className="text-3xl font-black text-red-700 dark:text-red-400">5%</p>
                  </div>
                </div>
                <p className="text-sm text-red-600">680 trades failed compliance checks</p>
              </div>
            </div>

            {/* Rules of Origin by Country */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">AfCFTA Compliance by Country</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4 text-left">Country</th>
                      <th className="p-4 text-center">Compliance Rate</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Trades</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {COUNTRY_DATA.slice(0, 6).map(country => (
                      <tr key={country.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="p-4 font-medium text-gray-900 dark:text-white">{country.name}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  country.compliance >= 90 ? 'bg-green-500' :
                                  country.compliance >= 80 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${country.compliance}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">{country.compliance}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            country.compliance >= 90 ? 'bg-green-100 text-green-700' :
                            country.compliance >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {country.compliance >= 90 ? 'Excellent' : country.compliance >= 80 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900 dark:text-white">{country.trades.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <button className="text-trade-primary hover:underline text-sm font-bold">View Report</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
