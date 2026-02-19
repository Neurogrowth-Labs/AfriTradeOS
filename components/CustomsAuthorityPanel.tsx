import React, { useState, useEffect } from 'react';
import {
  Shield, FileText, Search, AlertTriangle, CheckCircle, XCircle, Clock,
  MapPin, Package, TrendingUp, TrendingDown, Users, Building, Globe,
  BarChart3, PieChart as PieChartIcon, Activity, Zap, Eye, Filter,
  Download, RefreshCw, ChevronRight, ChevronDown, ArrowUpRight,
  ArrowDownRight, Truck, Ship, Plane, FileCheck, FileWarning, Scale,
  DollarSign, Loader2, AlertCircle, Ban, ShieldCheck, ShieldAlert,
  Clipboard, ClipboardCheck, Timer, Target, Gauge, Radio, Wifi,
  ThermometerSun, Lock, Unlock, QrCode, Fingerprint, FileSpreadsheet
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import { customsService, CustomsDeclaration, CustomsAlert, CustomsTrader, CustomsShipment, CustomsCertificate, CustomsOfficer } from '../services/customsService';

type CustomsTab = 'dashboard' | 'declarations' | 'review' | 'verification' | 'traders' | 'shipments' | 'analytics' | 'settings';

const RISK_COLORS = {
  low: '#10b981',
  medium: '#f59e0b', 
  high: '#ef4444',
  critical: '#7c2d12'
};

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  submitted: '#3b82f6',
  under_review: '#8b5cf6',
  queried: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  cleared: '#059669',
  cancelled: '#9ca3af'
};

export const CustomsAuthorityPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CustomsTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [liveRefresh, setLiveRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Dashboard KPIs
  const [kpis, setKpis] = useState({
    totalDeclarations: 0, pendingReview: 0, clearedToday: 0, revenueToday: 0,
    avgClearanceHours: 0, highRiskCount: 0, afcftaUtilization: 0,
    topCommodities: [] as any[], declarationsByStatus: [] as any[],
    declarationsByCountry: [] as any[], riskDistribution: [] as any[],
    revenueByType: [] as any[], officerPerformance: [] as any[]
  });

  // Data states
  const [declarations, setDeclarations] = useState<CustomsDeclaration[]>([]);
  const [reviewQueue, setReviewQueue] = useState<CustomsDeclaration[]>([]);
  const [alerts, setAlerts] = useState<CustomsAlert[]>([]);
  const [traders, setTraders] = useState<CustomsTrader[]>([]);
  const [shipments, setShipments] = useState<CustomsShipment[]>([]);
  const [certificates, setCertificates] = useState<CustomsCertificate[]>([]);
  const [officers, setOfficers] = useState<CustomsOfficer[]>([]);
  const [selectedDeclaration, setSelectedDeclaration] = useState<CustomsDeclaration | null>(null);
  const [selectedTrader, setSelectedTrader] = useState<CustomsTrader | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CustomsCertificate | null>(null);
  const [showTraderModal, setShowTraderModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [verifyingCertificate, setVerifyingCertificate] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds for real-time
  const [liveAlertCount, setLiveAlertCount] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpiData, declData, queueData, alertData, traderData, shipmentData, certData, officerData] = await Promise.all([
          customsService.getDashboardKPIs(),
          customsService.getDeclarations({ status: statusFilter, riskLevel: riskFilter, search: searchQuery }),
          customsService.getDeclarationReviewQueue(),
          customsService.getAlerts({ status: 'open' }),
          customsService.getTraders(),
          customsService.getShipments(),
          customsService.getCertificates(),
          customsService.getOfficers()
        ]);
        setKpis(kpiData);
        setDeclarations(declData);
        setReviewQueue(queueData);
        setAlerts(alertData);
        setTraders(traderData);
        setShipments(shipmentData);
        setCertificates(certData);
        setOfficers(officerData);
        setLastRefresh(new Date());
      } catch (e) {
        console.error('Failed to fetch customs data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter, riskFilter, searchQuery]);

  // Real-time auto-refresh with configurable interval
  useEffect(() => {
    if (!liveRefresh) return;
    const interval = setInterval(async () => {
      try {
        const [kpiData, alertData, queueData] = await Promise.all([
          customsService.getDashboardKPIs(),
          customsService.getAlerts({ status: 'open' }),
          customsService.getDeclarationReviewQueue()
        ]);
        setKpis(kpiData);
        setAlerts(alertData);
        setReviewQueue(queueData);
        setLastRefresh(new Date());
        
        // Track new alerts for notification badge
        if (alertData.length > alerts.length) {
          setLiveAlertCount(prev => prev + (alertData.length - alerts.length));
        }
      } catch (e) {
        console.error('Real-time refresh failed:', e);
      }
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [liveRefresh, refreshInterval, alerts.length]);

  // Live simulation for real-time feel - updates KPIs with small variations
  useEffect(() => {
    if (!liveRefresh) return;
    const liveInterval = setInterval(() => {
      setKpis(prev => ({
        ...prev,
        pendingReview: Math.max(0, prev.pendingReview + (Math.random() > 0.7 ? 1 : Math.random() > 0.5 ? -1 : 0)),
        clearedToday: prev.clearedToday + (Math.random() > 0.8 ? 1 : 0),
        revenueToday: prev.revenueToday + (Math.random() > 0.6 ? Math.floor(Math.random() * 5000) : 0),
      }));
    }, 5000);
    return () => clearInterval(liveInterval);
  }, [liveRefresh]);

  const handleDeclarationAction = async (id: string, action: string, notes?: string) => {
    const success = await customsService.updateDeclarationStatus(id, action, notes);
    if (success) {
      const [updated, declData] = await Promise.all([
        customsService.getDeclarationReviewQueue(),
        customsService.getDeclarations({ status: statusFilter, riskLevel: riskFilter, search: searchQuery })
      ]);
      setReviewQueue(updated);
      setDeclarations(declData);
      setSelectedDeclaration(null);
      // Update KPIs after action
      const kpiData = await customsService.getDashboardKPIs();
      setKpis(kpiData);
    }
  };

  // Handle certificate verification
  const handleVerifyCertificate = async (certId: string) => {
    setVerifyingCertificate(certId);
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCertificates(prev => prev.map(c => 
      c.id === certId ? { ...c, status: 'verified' as const, verified_at: new Date().toISOString() } : c
    ));
    setVerifyingCertificate(null);
  };

  // Handle trader profile view
  const handleViewTraderProfile = (trader: CustomsTrader) => {
    setSelectedTrader(trader);
    setShowTraderModal(true);
  };

  // Handle certificate detail view
  const handleViewCertificate = (cert: CustomsCertificate) => {
    setSelectedCertificate(cert);
    setShowCertificateModal(true);
  };

  // Export functions
  const exportDeclarationsCSV = () => {
    const headers = ['Declaration #', 'Type', 'Trader', 'HS Code', 'Origin', 'Destination', 'Value', 'Risk', 'Status'];
    const rows = declarations.map(d => [
      d.declaration_number, d.declaration_type, d.trader_name, d.hs_code,
      d.origin_country, d.destination_country, d.declared_value, d.risk_level, d.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customs_declarations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportTraderRegistry = () => {
    const headers = ['Customs Code', 'TIN', 'Risk Classification', 'Compliance Score', 'Total Declarations', 'Trade Value', 'Violations', 'AEO Tier'];
    const rows = traders.map(t => [
      t.customs_code, t.tin, t.risk_classification, t.compliance_score,
      t.total_declarations, t.total_trade_value, t.violations_count, t.aeo_tier || 'N/A'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trader_registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportRevenueReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      totalRevenue: kpis.revenueToday,
      declarationsProcessed: kpis.clearedToday,
      revenueByType: kpis.revenueByType,
      topCommodities: kpis.topCommodities
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `revenue_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const tabs: { id: CustomsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Command Center', icon: <Gauge className="w-4 h-4" /> },
    { id: 'declarations', label: 'Declarations', icon: <FileText className="w-4 h-4" /> },
    { id: 'review', label: 'Review Queue', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'verification', label: 'Verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'traders', label: 'Trader Registry', icon: <Users className="w-4 h-4" /> },
    { id: 'shipments', label: 'Shipments', icon: <Ship className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Shield className="w-4 h-4" /> }
  ];

  // Render Dashboard (Command Center)
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard title="Total Declarations" value={kpis.totalDeclarations} icon={<FileText />} color="blue" />
        <KPICard title="Pending Review" value={kpis.pendingReview} icon={<Clock />} color="amber" trend={kpis.pendingReview > 10 ? 'up' : 'down'} />
        <KPICard title="Cleared Today" value={kpis.clearedToday} icon={<CheckCircle />} color="green" />
        <KPICard title="Revenue Today" value={formatCurrency(kpis.revenueToday)} icon={<DollarSign />} color="emerald" />
        <KPICard title="High Risk" value={kpis.highRiskCount} icon={<AlertTriangle />} color="red" />
        <KPICard title="AfCFTA Rate" value={`${kpis.afcftaUtilization}%`} icon={<Globe />} color="purple" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Alerts Panel */}
        <div className="lg:col-span-1 bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Risk Alerts
            </h3>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
              {alerts.length} Active
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'bg-red-900/20 border-red-500' :
                alert.severity === 'high' ? 'bg-orange-900/20 border-orange-500' :
                'bg-yellow-900/20 border-yellow-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{alert.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{alert.description?.substring(0, 60)}...</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    alert.severity === 'critical' ? 'bg-red-500 text-white' :
                    alert.severity === 'high' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>{alert.severity}</span>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-slate-500 text-center py-4">No active alerts</p>
            )}
          </div>
        </div>

        {/* Declarations by Status Chart */}
        <div className="lg:col-span-1 bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-400" /> Declaration Status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={kpis.declarationsByStatus}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                dataKey="count"
                nameKey="status"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {kpis.declarationsByStatus.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="lg:col-span-1 bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" /> Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kpis.riskDistribution} layout="vertical">
              <XAxis type="number" stroke="#64748b" />
              <YAxis type="category" dataKey="level" stroke="#64748b" width={60} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {kpis.riskDistribution.map((entry, index) => (
                  <Cell key={index} fill={RISK_COLORS[entry.level as keyof typeof RISK_COLORS] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Review Queue Preview */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-purple-400" /> Pending Review Queue
          </h3>
          <button onClick={() => setActiveTab('review')} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Declaration #</th>
                <th className="text-left py-2 px-3">Trader</th>
                <th className="text-left py-2 px-3">HS Code</th>
                <th className="text-left py-2 px-3">Value</th>
                <th className="text-left py-2 px-3">Risk</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviewQueue.slice(0, 5).map(decl => (
                <tr key={decl.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-2 px-3 font-mono text-blue-400">{decl.declaration_number}</td>
                  <td className="py-2 px-3 text-white">{decl.trader_name}</td>
                  <td className="py-2 px-3 text-slate-300">{decl.hs_code}</td>
                  <td className="py-2 px-3 text-emerald-400">{formatCurrency(decl.declared_value)}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      decl.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                      decl.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      decl.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>{decl.risk_score}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      decl.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                      decl.status === 'under_review' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{decl.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-2 px-3">
                    <button 
                      onClick={() => { setSelectedDeclaration(decl); setActiveTab('review'); }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Commodities & Country Trade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Top Commodities
          </h3>
          <div className="space-y-3">
            {kpis.topCommodities.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {item.hs_code}
                  </span>
                  <span className="text-white text-sm">{item.description?.substring(0, 30) || 'N/A'}</span>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold">{formatCurrency(item.value)}</p>
                  <p className="text-slate-500 text-xs">{item.count} declarations</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" /> Trade by Country
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kpis.declarationsByCountry.slice(0, 6)}>
              <XAxis dataKey="country" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="imports" fill="#3b82f6" name="Imports" />
              <Bar dataKey="exports" fill="#10b981" name="Exports" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Render Review Queue
  const renderReviewQueue = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Queue List */}
      <div className="lg:col-span-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">Review Queue</h3>
          <p className="text-slate-400 text-sm">{reviewQueue.length} pending</p>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {reviewQueue.map(decl => (
            <div 
              key={decl.id}
              onClick={() => setSelectedDeclaration(decl)}
              className={`p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 ${
                selectedDeclaration?.id === decl.id ? 'bg-slate-700/50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-blue-400 text-sm">{decl.declaration_number}</p>
                  <p className="text-white font-medium">{decl.trader_name}</p>
                  <p className="text-slate-400 text-xs">{decl.product_description?.substring(0, 40)}...</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    decl.risk_level === 'critical' ? 'bg-red-500 text-white' :
                    decl.risk_level === 'high' ? 'bg-orange-500 text-white' :
                    decl.risk_level === 'medium' ? 'bg-yellow-500 text-black' :
                    'bg-green-500 text-white'
                  }`}>{decl.risk_score}</span>
                  <p className="text-emerald-400 text-sm mt-1">{formatCurrency(decl.declared_value)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Declaration Detail */}
      <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700">
        {selectedDeclaration ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedDeclaration.declaration_number}</h3>
                <p className="text-slate-400">{selectedDeclaration.trader_name}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDeclarationAction(selectedDeclaration.id, 'approved')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button 
                  onClick={() => handleDeclarationAction(selectedDeclaration.id, 'queried')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" /> Query
                </button>
                <button 
                  onClick={() => handleDeclarationAction(selectedDeclaration.id, 'rejected')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className={`p-4 rounded-lg mb-6 ${
              selectedDeclaration.risk_level === 'critical' ? 'bg-red-900/30 border border-red-500' :
              selectedDeclaration.risk_level === 'high' ? 'bg-orange-900/30 border border-orange-500' :
              selectedDeclaration.risk_level === 'medium' ? 'bg-yellow-900/30 border border-yellow-500' :
              'bg-green-900/30 border border-green-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <p className="font-bold text-white">Risk Score: {selectedDeclaration.risk_score}/100</p>
                    <p className="text-sm opacity-80">Level: {selectedDeclaration.risk_level.toUpperCase()}</p>
                  </div>
                </div>
                {selectedDeclaration.afcfta_eligible && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                    AfCFTA Eligible
                  </span>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase">Shipment Details</h4>
                <DetailRow label="Type" value={selectedDeclaration.declaration_type} />
                <DetailRow label="Origin" value={selectedDeclaration.origin_country} />
                <DetailRow label="Destination" value={selectedDeclaration.destination_country} />
                <DetailRow label="Port of Entry" value={selectedDeclaration.port_of_entry || 'N/A'} />
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase">Goods Information</h4>
                <DetailRow label="HS Code" value={selectedDeclaration.hs_code} />
                <DetailRow label="Description" value={selectedDeclaration.product_description} />
                <DetailRow label="Quantity" value={`${selectedDeclaration.quantity} ${selectedDeclaration.unit}`} />
                <DetailRow label="Declared Value" value={formatCurrency(selectedDeclaration.declared_value)} highlight />
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase">Duties & Taxes</h4>
                <DetailRow label="Duty Rate" value={`${selectedDeclaration.duty_rate}%`} />
                <DetailRow label="Duty Amount" value={formatCurrency(selectedDeclaration.duty_amount)} />
                <DetailRow label="VAT" value={formatCurrency(selectedDeclaration.vat_amount)} />
                <DetailRow label="Total Taxes" value={formatCurrency(selectedDeclaration.total_taxes)} highlight />
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase">Trader Info</h4>
                <DetailRow label="TIN" value={selectedDeclaration.trader_tin || 'N/A'} />
                <DetailRow label="Submitted" value={selectedDeclaration.submitted_at ? new Date(selectedDeclaration.submitted_at).toLocaleString() : 'N/A'} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 text-slate-500">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a declaration to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render Traders Registry
  const renderTraders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Trader Registry</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by TIN or Code..."
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {traders.map(trader => (
          <div key={trader.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  trader.risk_classification === 'trusted' ? 'bg-green-500/20 text-green-400' :
                  trader.risk_classification === 'high_risk' ? 'bg-red-500/20 text-red-400' :
                  trader.risk_classification === 'blacklisted' ? 'bg-red-900/50 text-red-300' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {trader.risk_classification === 'trusted' ? <ShieldCheck className="w-5 h-5" /> :
                   trader.risk_classification === 'blacklisted' ? <Ban className="w-5 h-5" /> :
                   <Building className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-white font-medium">{trader.customs_code || 'N/A'}</p>
                  <p className="text-slate-400 text-xs">{trader.tin}</p>
                </div>
              </div>
              {trader.aeo_tier && (
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  trader.aeo_tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                  trader.aeo_tier === 'silver' ? 'bg-slate-400/20 text-slate-300' :
                  'bg-orange-500/20 text-orange-400'
                }`}>{trader.aeo_tier.toUpperCase()}</span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Compliance</p>
                <p className={`font-bold ${trader.compliance_score >= 80 ? 'text-green-400' : trader.compliance_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {trader.compliance_score}%
                </p>
              </div>
              <div>
                <p className="text-slate-500">Declarations</p>
                <p className="text-white font-bold">{trader.total_declarations}</p>
              </div>
              <div>
                <p className="text-slate-500">Trade Value</p>
                <p className="text-emerald-400 font-bold">{formatCurrency(trader.total_trade_value)}</p>
              </div>
              <div>
                <p className="text-slate-500">Violations</p>
                <p className={`font-bold ${trader.violations_count > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {trader.violations_count}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-xs ${
                trader.sanctions_status === 'clear' ? 'bg-green-500/20 text-green-400' :
                trader.sanctions_status === 'flagged' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Sanctions: {trader.sanctions_status}
              </span>
              <button onClick={() => handleViewTraderProfile(trader)} className="text-blue-400 hover:text-blue-300 text-sm">View Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Declarations Management Tab
  const renderDeclarations = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search declarations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cleared">Cleared</option>
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical</option>
          </select>
          <span className="text-slate-400 text-sm ml-auto">{declarations.length} declarations</span>
        </div>
      </div>

      {/* Declarations Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr className="text-slate-400">
                <th className="text-left py-3 px-4">Declaration #</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Trader</th>
                <th className="text-left py-3 px-4">HS Code</th>
                <th className="text-left py-3 px-4">Origin → Dest</th>
                <th className="text-right py-3 px-4">Value</th>
                <th className="text-center py-3 px-4">Risk</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {declarations.map(decl => (
                <tr key={decl.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                  <td className="py-3 px-4 font-mono text-blue-400">{decl.declaration_number}</td>
                  <td className="py-3 px-4 capitalize text-white">{decl.declaration_type.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-white">{decl.trader_name}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{decl.hs_code}</td>
                  <td className="py-3 px-4 text-slate-300">{decl.origin_country} → {decl.destination_country}</td>
                  <td className="py-3 px-4 text-right text-white">{formatCurrency(decl.declared_value)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase`} style={{ backgroundColor: `${RISK_COLORS[decl.risk_level]}20`, color: RISK_COLORS[decl.risk_level] }}>
                      {decl.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 rounded text-xs font-bold capitalize" style={{ backgroundColor: `${STATUS_COLORS[decl.status]}20`, color: STATUS_COLORS[decl.status] }}>
                      {decl.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => setSelectedDeclaration(decl)} className="text-blue-400 hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {declarations.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-slate-500">No declarations found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Certificate Verification Tab
  const renderVerification = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{certificates.filter(c => c.status === 'verified').length}</p>
              <p className="text-slate-400 text-xs">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{certificates.filter(c => c.status === 'pending').length}</p>
              <p className="text-slate-400 text-xs">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{certificates.filter(c => c.status === 'rejected').length}</p>
              <p className="text-slate-400 text-xs">Rejected</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{certificates.filter(c => c.afcfta_compliant).length}</p>
              <p className="text-slate-400 text-xs">AfCFTA Compliant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-green-400" /> Certificate Registry
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQRScanner(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1">
              <QrCode className="w-4 h-4" /> Scan QR
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr className="text-slate-400">
                <th className="text-left py-3 px-4">Certificate #</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Issuing Authority</th>
                <th className="text-left py-3 px-4">Exporter</th>
                <th className="text-left py-3 px-4">Issue Date</th>
                <th className="text-center py-3 px-4">AfCFTA</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Verify</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map(cert => (
                <tr key={cert.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                  <td className="py-3 px-4 font-mono text-blue-400">{cert.certificate_number}</td>
                  <td className="py-3 px-4 capitalize text-white">{cert.certificate_type}</td>
                  <td className="py-3 px-4 text-slate-300">{cert.issuing_authority}</td>
                  <td className="py-3 px-4 text-white">{cert.exporter_name}</td>
                  <td className="py-3 px-4 text-slate-300">{new Date(cert.issue_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center">
                    {cert.afcfta_compliant ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                      cert.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                      cert.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      cert.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => handleVerifyCertificate(cert.id)}
                      disabled={verifyingCertificate === cert.id || cert.status === 'verified'}
                      className={`text-blue-400 hover:text-blue-300 ${verifyingCertificate === cert.id ? 'animate-pulse' : ''} ${cert.status === 'verified' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {verifyingCertificate === cert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
              {certificates.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-slate-500">No certificates found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Shipments Monitoring Tab
  const renderShipments = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['pre_arrival', 'arrived', 'under_inspection', 'customs_hold', 'cleared'].map(status => {
          const count = shipments.filter(s => s.status === status).length;
          const icons: Record<string, React.ReactNode> = {
            pre_arrival: <Ship className="w-5 h-5" />,
            arrived: <MapPin className="w-5 h-5" />,
            under_inspection: <Eye className="w-5 h-5" />,
            customs_hold: <Lock className="w-5 h-5" />,
            cleared: <Unlock className="w-5 h-5" />
          };
          const colors: Record<string, string> = {
            pre_arrival: 'blue', arrived: 'purple', under_inspection: 'amber', customs_hold: 'red', cleared: 'green'
          };
          return (
            <div key={status} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className={`w-10 h-10 rounded-lg bg-${colors[status]}-500/20 flex items-center justify-center mb-2 text-${colors[status]}-400`}>
                {icons[status]}
              </div>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-slate-400 text-xs capitalize">{status.replace('_', ' ')}</p>
            </div>
          );
        })}
      </div>

      {/* Shipments List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" /> Active Shipments
          </h3>
        </div>
        <div className="divide-y divide-slate-700">
          {shipments.map(shipment => (
            <div key={shipment.id} className="p-4 hover:bg-slate-700/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    shipment.transport_mode === 'sea' ? 'bg-blue-500/20 text-blue-400' :
                    shipment.transport_mode === 'air' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {shipment.transport_mode === 'sea' ? <Ship className="w-5 h-5" /> :
                     shipment.transport_mode === 'air' ? <Plane className="w-5 h-5" /> :
                     <Truck className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{shipment.tracking_number || shipment.container_number}</p>
                    <p className="text-slate-400 text-xs">{shipment.carrier_name} • {shipment.vessel_name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                  shipment.status === 'cleared' ? 'bg-green-500/20 text-green-400' :
                  shipment.status === 'customs_hold' ? 'bg-red-500/20 text-red-400' :
                  shipment.status === 'under_inspection' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {shipment.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{shipment.origin_port} → {shipment.destination_port}</span>
                </div>
                {shipment.current_location && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Globe className="w-4 h-4" />
                    <span>Current: {shipment.current_location}</span>
                  </div>
                )}
                {shipment.eta && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>ETA: {new Date(shipment.eta).toLocaleDateString()}</span>
                  </div>
                )}
                <div className={`flex items-center gap-1 ${shipment.risk_score > 70 ? 'text-red-400' : shipment.risk_score > 40 ? 'text-amber-400' : 'text-green-400'}`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Risk: {shipment.risk_score}%</span>
                </div>
              </div>
            </div>
          ))}
          {shipments.length === 0 && (
            <div className="py-8 text-center text-slate-500">No shipments found</div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Analytics Tab
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Type */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Revenue by Type
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={kpis.revenueByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="type" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Declarations Trend */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> Declaration Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={kpis.declarationsByCountry}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="country" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Officer Performance */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> Officer Performance
          </h3>
          <div className="space-y-3">
            {officers.slice(0, 5).map(officer => (
              <div key={officer.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-bold">
                  {officer.badge_number?.slice(-2) || '??'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{officer.rank} • {officer.station}</span>
                    <span className="text-slate-400 text-xs">{officer.declarations_reviewed} reviewed</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${officer.accuracy_rate}%` }} />
                  </div>
                </div>
                <span className="text-purple-400 text-sm font-bold">{officer.accuracy_rate}%</span>
              </div>
            ))}
            {officers.length === 0 && <p className="text-slate-500 text-center py-4">No officer data</p>}
          </div>
        </div>

        {/* Top Commodities */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" /> Top Commodities
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={kpis.topCommodities}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                dataKey="value"
                nameKey="name"
                label={({ name }) => name}
              >
                {kpis.topCommodities.map((_, index) => (
                  <Cell key={index} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Render Settings Tab
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" /> System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-400 text-sm mb-2">Auto-Refresh Interval</label>
            <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Default Risk Threshold</label>
            <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="50">50 (Medium)</option>
              <option value="70">70 (High)</option>
              <option value="90">90 (Critical)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">SLA Target (Hours)</label>
            <input type="number" defaultValue={24} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Notification Preferences</label>
            <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="all">All Alerts</option>
              <option value="high">High & Critical Only</option>
              <option value="critical">Critical Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-green-400" /> Data Export
        </h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportDeclarationsCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Declarations (CSV)
          </button>
          <button onClick={exportRevenueReport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Revenue Report
          </button>
          <button onClick={exportTraderRegistry} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Trader Registry
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-amber-400" /> Integration Status
        </h3>
        <div className="space-y-3">
          {[
            { name: 'AfCFTA Trade Portal', status: 'connected', color: 'green' },
            { name: 'ASYCUDA World', status: 'connected', color: 'green' },
            { name: 'Port Authority System', status: 'connected', color: 'green' },
            { name: 'Central Bank FX API', status: 'degraded', color: 'amber' },
            { name: 'Sanctions Database', status: 'connected', color: 'green' },
          ].map(integration => (
            <div key={integration.name} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-white">{integration.name}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold bg-${integration.color}-500/20 text-${integration.color}-400`}>
                {integration.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Customs Authority Panel</h1>
              <p className="text-slate-400 text-sm">AfriTrade OS • Digital Single Window</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${liveRefresh ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-slate-400">Last update: {formatTime(lastRefresh)}</span>
            </div>
            <button
              onClick={() => setLiveRefresh(!liveRefresh)}
              className={`p-2 rounded-lg ${liveRefresh ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}
            >
              <Radio className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-white">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'declarations' && renderDeclarations()}
            {activeTab === 'review' && renderReviewQueue()}
            {activeTab === 'verification' && renderVerification()}
            {activeTab === 'traders' && renderTraders()}
            {activeTab === 'shipments' && renderShipments()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </div>

      {/* Trader Profile Modal */}
      {showTraderModal && selectedTrader && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  selectedTrader.risk_classification === 'trusted' ? 'bg-green-500/20 text-green-400' :
                  selectedTrader.risk_classification === 'high_risk' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  <Building className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedTrader.customs_code}</h2>
                  <p className="text-slate-400">TIN: {selectedTrader.tin}</p>
                </div>
              </div>
              <button onClick={() => setShowTraderModal(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Risk & Compliance */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs uppercase mb-1">Risk Classification</p>
                  <p className={`text-lg font-bold capitalize ${
                    selectedTrader.risk_classification === 'trusted' ? 'text-green-400' :
                    selectedTrader.risk_classification === 'high_risk' ? 'text-red-400' :
                    'text-amber-400'
                  }`}>{selectedTrader.risk_classification.replace('_', ' ')}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs uppercase mb-1">Compliance Score</p>
                  <p className={`text-lg font-bold ${selectedTrader.compliance_score >= 80 ? 'text-green-400' : selectedTrader.compliance_score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {selectedTrader.compliance_score}%
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs uppercase mb-1">Total Declarations</p>
                  <p className="text-lg font-bold text-white">{selectedTrader.total_declarations}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs uppercase mb-1">Trade Value</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(selectedTrader.total_trade_value)}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-400 uppercase">Registration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">AEO Tier</span><span className="text-white font-medium">{selectedTrader.aeo_tier?.toUpperCase() || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Sanctions Status</span><span className={`font-medium ${selectedTrader.sanctions_status === 'clear' ? 'text-green-400' : 'text-red-400'}`}>{selectedTrader.sanctions_status}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Violations</span><span className={`font-medium ${selectedTrader.violations_count > 0 ? 'text-red-400' : 'text-green-400'}`}>{selectedTrader.violations_count}</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-400 uppercase">Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Last Declaration</span><span className="text-white">{(selectedTrader as any).last_declaration_date ? new Date((selectedTrader as any).last_declaration_date).toLocaleDateString() : 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Avg Clearance</span><span className="text-white">{(selectedTrader as any).average_clearance_time || 'N/A'} hrs</span></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button onClick={() => { setActiveTab('declarations'); setSearchQuery(selectedTrader.tin); setShowTraderModal(false); }} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                  View Declarations
                </button>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium">
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <QrCode className="w-6 h-6 text-blue-400" /> Certificate QR Scanner
              </h2>
              <button onClick={() => setShowQRScanner(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="aspect-square bg-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-600">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Position QR code within frame</p>
                  <p className="text-slate-500 text-xs mt-1">Camera access required</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-3">Or enter certificate number manually:</p>
                <input 
                  type="text" 
                  placeholder="e.g. COO-2024-NG-001234"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-center"
                />
              </div>
              <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                Verify Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Alert Notification Badge */}
      {liveAlertCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => { setActiveTab('dashboard'); setLiveAlertCount(0); }}
            className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg animate-pulse"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold">{liveAlertCount} New Alert{liveAlertCount > 1 ? 's' : ''}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Helper Components
const KPICard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down';
}> = ({ title, value, icon, color, trend }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
    purple: 'bg-purple-500/20 text-purple-400'
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
        </div>
        {trend && (
          <span className={trend === 'up' ? 'text-red-400' : 'text-green-400'}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-xs mt-1">{title}</p>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex justify-between">
    <span className="text-slate-400">{label}</span>
    <span className={highlight ? 'text-emerald-400 font-bold' : 'text-white'}>{value}</span>
  </div>
);

export default CustomsAuthorityPanel;
