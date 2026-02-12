import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  AlertTriangle,
  Database,
  Zap,
  Layers,
  Download,
  RefreshCw,
  Clock,
  Bell,
  AlertOctagon,
  TrendingUp,
  Terminal
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
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

// System health dimensions
const HEALTH_DATA = [
  { subject: 'Technical Arch', A: 92, fullMark: 100 },
  { subject: 'Business Ops', A: 94, fullMark: 100 },
  { subject: 'Cybersecurity', A: 88, fullMark: 100 },
  { subject: 'AI Intelligence', A: 98, fullMark: 100 },
  { subject: 'User Experience', A: 91, fullMark: 100 },
];

// API latency data
const LATENCY_DATA = [
  { name: 'Auth', ms: 85, status: 'good' },
  { name: 'Gemini AI', ms: 650, status: 'warning' },
  { name: 'Database', ms: 32, status: 'good' },
  { name: 'Payment API', ms: 180, status: 'good' },
  { name: 'Customs API', ms: 420, status: 'warning' },
  { name: 'Rendering', ms: 12, status: 'good' },
];

// Uptime history (last 30 days)
const UPTIME_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  uptime: 99.5 + Math.random() * 0.5,
  incidents: Math.random() > 0.9 ? 1 : 0
}));

// Real-time metrics
const REALTIME_METRICS = [
  { time: '00:00', requests: 1200, errors: 3, latency: 120 },
  { time: '04:00', requests: 800, errors: 1, latency: 95 },
  { time: '08:00', requests: 3500, errors: 8, latency: 180 },
  { time: '12:00', requests: 5200, errors: 12, latency: 220 },
  { time: '16:00', requests: 4800, errors: 6, latency: 165 },
  { time: '20:00', requests: 2900, errors: 4, latency: 130 },
  { time: 'Now', requests: 3200, errors: 2, latency: 145 },
];

// Incident logs
const INCIDENT_LOGS = [
  { id: 'INC-001', title: 'High API latency detected', severity: 'warning', service: 'Payment Gateway', time: '15 mins ago', status: 'investigating', description: 'Response times exceeded 500ms threshold' },
  { id: 'INC-002', title: 'Database connection pool exhausted', severity: 'critical', service: 'PostgreSQL', time: '2 hours ago', status: 'resolved', description: 'Connection limit reached causing query failures' },
  { id: 'INC-003', title: 'AI service timeout', severity: 'warning', service: 'Gemini API', time: '4 hours ago', status: 'resolved', description: 'Gemini API returned timeout errors for 3 minutes' },
  { id: 'INC-004', title: 'SSL certificate expiring', severity: 'info', service: 'CDN', time: '1 day ago', status: 'scheduled', description: 'Certificate expires in 14 days - auto-renewal scheduled' },
  { id: 'INC-005', title: 'Memory usage spike', severity: 'warning', service: 'Worker Nodes', time: '2 days ago', status: 'resolved', description: 'Memory usage exceeded 90% - auto-scaled successfully' },
];

// Service status
const SERVICES = [
  { name: 'API Gateway', status: 'operational', uptime: 99.98, latency: 45, region: 'Global' },
  { name: 'Authentication', status: 'operational', uptime: 99.99, latency: 85, region: 'Global' },
  { name: 'Database (Primary)', status: 'operational', uptime: 99.95, latency: 32, region: 'EU-West' },
  { name: 'Database (Replica)', status: 'operational', uptime: 99.92, latency: 38, region: 'US-East' },
  { name: 'Payment Gateway', status: 'degraded', uptime: 99.85, latency: 180, region: 'Global' },
  { name: 'AI/ML Services', status: 'operational', uptime: 99.90, latency: 650, region: 'US-Central' },
  { name: 'Storage (CDN)', status: 'operational', uptime: 99.99, latency: 15, region: 'Global' },
  { name: 'Queue Workers', status: 'operational', uptime: 99.88, latency: 120, region: 'EU-West' },
  { name: 'Email Service', status: 'operational', uptime: 99.95, latency: 200, region: 'US-East' },
  { name: 'Customs Integration', status: 'maintenance', uptime: 98.50, latency: 420, region: 'Africa' },
];

// Backup status
const BACKUP_STATUS = [
  { name: 'Database Full Backup', lastRun: '2 hours ago', nextRun: 'In 22 hours', status: 'success', size: '2.4 GB' },
  { name: 'Database Incremental', lastRun: '30 mins ago', nextRun: 'In 30 mins', status: 'success', size: '124 MB' },
  { name: 'File Storage Sync', lastRun: '1 hour ago', nextRun: 'In 5 hours', status: 'success', size: '8.2 GB' },
  { name: 'Log Archive', lastRun: '6 hours ago', nextRun: 'In 18 hours', status: 'success', size: '1.8 GB' },
];

// Queue status
const QUEUE_STATUS = [
  { name: 'trade_processing', pending: 23, processing: 5, failed: 0, throughput: '120/min' },
  { name: 'notification_queue', pending: 156, processing: 12, failed: 2, throughput: '500/min' },
  { name: 'compliance_checks', pending: 8, processing: 3, failed: 0, throughput: '45/min' },
  { name: 'document_generation', pending: 45, processing: 8, failed: 1, throughput: '80/min' },
];

// Alert channels
const ALERT_CHANNELS = [
  { name: 'Slack (#ops-alerts)', status: 'active', lastAlert: '15 mins ago' },
  { name: 'Email (ops@afritrade.os)', status: 'active', lastAlert: '2 hours ago' },
  { name: 'PagerDuty', status: 'active', lastAlert: '1 day ago' },
  { name: 'SMS (On-call)', status: 'active', lastAlert: '3 days ago' },
];

type SystemTab = 'overview' | 'services' | 'incidents' | 'queues' | 'backups' | 'logs';

export const SystemDiagnostic: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SystemTab>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeRange, setTimeRange] = useState('24h');

  // Simulate auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Calculate overall health score
  const overallHealth = Math.round(HEALTH_DATA.reduce((sum, d) => sum + d.A, 0) / HEALTH_DATA.length);
  const operationalServices = SERVICES.filter(s => s.status === 'operational').length;
  const avgUptime = (SERVICES.reduce((sum, s) => sum + s.uptime, 0) / SERVICES.length).toFixed(2);
  const activeIncidents = INCIDENT_LOGS.filter(i => i.status === 'investigating').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-amber-500';
      case 'maintenance': return 'bg-blue-500';
      case 'outage': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'warning': return 'bg-amber-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'services', label: 'Services', icon: Server },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'queues', label: 'Queues', icon: Layers },
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'logs', label: 'Logs', icon: Terminal },
  ];

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${overallHealth >= 90 ? 'bg-green-100 dark:bg-green-900/30' : overallHealth >= 70 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <Activity className={`w-8 h-8 ${overallHealth >= 90 ? 'text-green-600' : overallHealth >= 70 ? 'text-amber-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-slate-50">System Health & Diagnostics</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Real-time infrastructure monitoring and incident management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Health Score</p>
              <p className={`text-3xl font-black ${overallHealth >= 90 ? 'text-green-600' : overallHealth >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                {overallHealth}<span className="text-sm text-gray-400 font-medium">/100</span>
              </p>
            </div>
            <div className="h-10 w-px bg-gray-200 dark:bg-slate-600 mx-2"></div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-100 dark:bg-slate-700 text-sm p-2 rounded-lg border-none outline-none"
              >
                <option value="1h">Last 1 hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
              <button className="flex items-center gap-2 bg-trade-primary hover:bg-trade-secondary text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Uptime</p>
            <p className="text-2xl font-black text-green-700 dark:text-green-300 mt-1">{avgUptime}%</p>
            <p className="text-xs text-green-600 mt-1">Last 30 days</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Services</p>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{operationalServices}/{SERVICES.length}</p>
            <p className="text-xs text-blue-600 mt-1">Operational</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Avg Latency</p>
            <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">145ms</p>
            <p className="text-xs text-purple-600 mt-1">P95: 320ms</p>
          </div>
          <div className={`p-3 rounded-xl ${activeIncidents > 0 ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800' : 'bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600'}`}>
            <p className={`text-xs font-bold uppercase ${activeIncidents > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>Incidents</p>
            <p className={`text-2xl font-black mt-1 ${activeIncidents > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>{activeIncidents}</p>
            <p className={`text-xs mt-1 ${activeIncidents > 0 ? 'text-amber-600' : 'text-gray-600'}`}>Active</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Last Refresh</p>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-1">{lastRefresh.toLocaleTimeString()}</p>
            <p className="text-xs text-gray-600 mt-1">{autoRefresh ? 'Auto-refresh ON' : 'Manual'}</p>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {INCIDENT_LOGS.filter(i => i.severity === 'critical' && i.status === 'investigating').length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
              <AlertOctagon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800 dark:text-red-300 text-sm">Critical Incident Active</p>
              <p className="text-xs text-red-700 dark:text-red-400">
                {INCIDENT_LOGS.find(i => i.severity === 'critical' && i.status === 'investigating')?.title}
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">
            View Incident
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SystemTab)}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Radar Chart */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-base font-bold font-heading text-trade-primary dark:text-slate-50 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-trade-secondary" /> System Dimensions
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_DATA}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="AfriTradeOS"
                        dataKey="A"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Real-time Traffic */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-base font-bold font-heading text-trade-primary dark:text-slate-50 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-trade-secondary" /> Real-time Traffic & Performance
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REALTIME_METRICS}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRequests)" name="Requests/min" />
                      <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} name="Latency (ms)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Service Status Grid */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold font-heading text-trade-primary dark:text-slate-50 flex items-center gap-2">
                  <Server className="w-4 h-4 text-trade-secondary" /> Service Status
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-500">Operational</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-gray-500">Degraded</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-500">Maintenance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-500">Outage</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {SERVICES.map(service => (
                  <div
                    key={service.name}
                    className={`p-3 rounded-lg border ${
                      service.status === 'operational' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' :
                      service.status === 'degraded' ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' :
                      service.status === 'maintenance' ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' :
                      'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)} ${service.status === 'operational' ? 'animate-pulse' : ''}`}></div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{service.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{service.latency}ms • {service.uptime}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* API Latency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-base font-bold font-heading text-trade-primary dark:text-slate-50 mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> API Response Times
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={LATENCY_DATA} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#0B1F33', color: 'white' }}
                      />
                      <Bar dataKey="ms" radius={[0, 4, 4, 0]} barSize={20}>
                        {LATENCY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.ms > 300 ? '#f59e0b' : entry.ms > 500 ? '#ef4444' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Alert Channels */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-base font-bold font-heading text-trade-primary dark:text-slate-50 mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-500" /> Alert Channels
                </h3>
                <div className="space-y-3">
                  {ALERT_CHANNELS.map(channel => (
                    <div key={channel.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${channel.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{channel.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{channel.lastAlert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">All Services</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4 text-left">Service</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Uptime</th>
                      <th className="p-4 text-center">Latency</th>
                      <th className="p-4 text-center">Region</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {SERVICES.map(service => (
                      <tr key={service.name} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-900 dark:text-white">{service.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            service.status === 'operational' ? 'bg-green-100 text-green-700' :
                            service.status === 'degraded' ? 'bg-amber-100 text-amber-700' :
                            service.status === 'maintenance' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {service.status}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-900 dark:text-white">{service.uptime}%</td>
                        <td className="p-4 text-center">
                          <span className={`font-bold ${service.latency > 300 ? 'text-amber-600' : 'text-green-600'}`}>
                            {service.latency}ms
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-500">{service.region}</td>
                        <td className="p-4 text-right">
                          <button className="text-trade-primary hover:underline text-sm font-bold">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INCIDENTS */}
        {activeTab === 'incidents' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Incident Log</h3>
                <button className="px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold">
                  Report Incident
                </button>
              </div>
              <div className="space-y-3">
                {INCIDENT_LOGS.map(incident => (
                  <div
                    key={incident.id}
                    className={`p-4 rounded-xl border ${
                      incident.status === 'investigating' ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' :
                      incident.status === 'resolved' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' :
                      'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          incident.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-gray-500">{incident.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityColor(incident.severity)}`}>
                              {incident.severity}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              incident.status === 'investigating' ? 'bg-amber-100 text-amber-700' :
                              incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {incident.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{incident.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{incident.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Server className="w-3 h-3" /> {incident.service}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {incident.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-trade-primary hover:underline text-sm font-bold">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: QUEUES */}
        {activeTab === 'queues' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Queue Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4 text-left">Queue Name</th>
                      <th className="p-4 text-center">Pending</th>
                      <th className="p-4 text-center">Processing</th>
                      <th className="p-4 text-center">Failed</th>
                      <th className="p-4 text-center">Throughput</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {QUEUE_STATUS.map(queue => (
                      <tr key={queue.name} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">{queue.name}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${queue.pending > 100 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                            {queue.pending}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">{queue.processing}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${queue.failed > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {queue.failed}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-900 dark:text-white">{queue.throughput}</td>
                        <td className="p-4 text-right">
                          <button className="text-trade-primary hover:underline text-sm font-bold">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BACKUPS */}
        {activeTab === 'backups' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Backup Status</h3>
                <button className="px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold">
                  Run Manual Backup
                </button>
              </div>
              <div className="space-y-3">
                {BACKUP_STATUS.map(backup => (
                  <div key={backup.name} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${backup.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{backup.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>Last: {backup.lastRun}</span>
                            <span>Next: {backup.nextRun}</span>
                            <span>Size: {backup.size}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        backup.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {backup.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">System Logs</h3>
                <div className="flex gap-2">
                  <select className="bg-gray-100 dark:bg-slate-700 text-sm p-2 rounded-lg border-none outline-none">
                    <option>All Levels</option>
                    <option>Error</option>
                    <option>Warning</option>
                    <option>Info</option>
                    <option>Debug</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300">
                    <Download className="w-4 h-4 inline mr-1" /> Export
                  </button>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-300 h-[400px] overflow-y-auto">
                <div className="space-y-1">
                  <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">2024-03-15 14:32:15</span> API Gateway started successfully</p>
                  <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">2024-03-15 14:32:16</span> Database connection pool initialized (max: 100)</p>
                  <p><span className="text-amber-400">[WARN]</span> <span className="text-gray-500">2024-03-15 14:32:18</span> Payment gateway response time exceeded threshold (520ms)</p>
                  <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">2024-03-15 14:32:20</span> Cache warmed up successfully (1,245 entries)</p>
                  <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">2024-03-15 14:32:22</span> Worker nodes scaled to 8 instances</p>
                  <p><span className="text-red-400">[ERROR]</span> <span className="text-gray-500">2024-03-15 14:32:25</span> Failed to connect to Customs API: timeout after 30s</p>
                  <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">2024-03-15 14:32:26</span> Retry attempt 1/3 for Customs API connection</p>
                  <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">2024-03-15 14:32:28</span> Customs API connection restored</p>
                  <p><span className="text-blue-400">[DEBUG]</span> <span className="text-gray-500">2024-03-15 14:32:30</span> Processing batch: 45 trade documents</p>
                  <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">2024-03-15 14:32:32</span> Compliance check completed for trade TRD-2024-12345</p>
                  <p><span className="text-amber-400">[WARN]</span> <span className="text-gray-500">2024-03-15 14:32:35</span> Memory usage at 78% - monitoring closely</p>
                  <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">2024-03-15 14:32:38</span> Scheduled backup initiated</p>
                  <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">2024-03-15 14:32:40</span> Health check passed for all services</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
