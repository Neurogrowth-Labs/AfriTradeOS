import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Download,
  Lock,
  FileSpreadsheet,
  FileText,
  File,
  Globe,
  RefreshCw,
  XCircle,
  MapPin,
  Zap,
  PieChart as PieChartIcon,
  DollarSign,
  Activity,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ChevronRight,
  Timer,
  ShieldAlert,
  FileWarning,
  Scale,
  Truck,
  Banknote,
  Radio,
  Loader2,
  Play
} from 'lucide-react';
import {
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
  Line
} from 'recharts';
import { governmentService } from '../services/governmentService';

// Map positions for countries on the SVG map
const COUNTRY_POSITIONS: Record<string, { id: string; x: number; y: number }> = {
  'Nigeria': { id: 'NG', x: 320, y: 350 },
  'Kenya': { id: 'KE', x: 580, y: 420 },
  'South Africa': { id: 'ZA', x: 500, y: 680 },
  'Egypt': { id: 'EG', x: 530, y: 120 },
  'Ghana': { id: 'GH', x: 280, y: 370 },
  'Morocco': { id: 'MA', x: 280, y: 90 },
  'Ethiopia': { id: 'ET', x: 600, y: 340 },
  'Tanzania': { id: 'TZ', x: 580, y: 500 },
  "Ivory Coast": { id: 'CI', x: 250, y: 380 },
  'Senegal': { id: 'SN', x: 180, y: 320 },
  'Uganda': { id: 'UG', x: 560, y: 430 },
  'Cameroon': { id: 'CM', x: 400, y: 400 },
  'Rwanda': { id: 'RW', x: 560, y: 460 },
  'DRC': { id: 'CD', x: 480, y: 480 },
  'Zambia': { id: 'ZM', x: 520, y: 560 },
  'Zimbabwe': { id: 'ZW', x: 520, y: 600 },
  'Mozambique': { id: 'MZ', x: 560, y: 600 },
  'Madagascar': { id: 'MG', x: 620, y: 580 },
};

const SECTOR_COLORS: Record<string, string> = {
  'Agriculture': '#10b981', 'Manufacturing': '#3b82f6', 'Energy': '#f59e0b',
  'Services': '#8b5cf6', 'Mining': '#ef4444', 'Textiles': '#ec4899',
  'Technology': '#06b6d4', 'Other': '#6b7280',
};

// Processing heatmap (static - would come from analytics in production)
const PROCESSING_HEATMAP = [
  { hour: '06:00', mon: 12, tue: 15, wed: 18, thu: 14, fri: 22, sat: 8, sun: 4 },
  { hour: '09:00', mon: 45, tue: 52, wed: 48, thu: 55, fri: 60, sat: 20, sun: 8 },
  { hour: '12:00', mon: 38, tue: 42, wed: 40, thu: 44, fri: 35, sat: 15, sun: 6 },
  { hour: '15:00', mon: 50, tue: 48, wed: 55, thu: 52, fri: 45, sat: 12, sun: 5 },
  { hour: '18:00', mon: 30, tue: 28, wed: 32, thu: 35, fri: 25, sat: 10, sun: 3 },
  { hour: '21:00', mon: 8, tue: 10, wed: 12, thu: 8, fri: 15, sat: 5, sun: 2 },
];

// Policy simulations (static - would come from simulation engine)
const POLICY_SIMULATIONS = [
  { policy: 'Reduce tariff on textiles by 5%', gdpImpact: '+0.12%', volumeImpact: '+18%', revenueImpact: '-$42M', status: 'modeled' },
  { policy: 'Implement single window for transit', gdpImpact: '+0.08%', volumeImpact: '+12%', revenueImpact: '+$28M', status: 'approved' },
];

// Economic indicators (static - would come from external API)
const SHOCK_INDICATORS = [
  { name: 'Oil Price Index', value: 78.4, change: -3.2, trend: 'down' },
  { name: 'USD/ZAR Rate', value: 18.92, change: 1.8, trend: 'up' },
  { name: 'Container Shipping Index', value: 2340, change: 12.5, trend: 'up' },
  { name: 'Food Price Index', value: 124.6, change: -1.1, trend: 'down' },
];

type RoleView = 'minister' | 'officer' | 'analyst';

export const GovAgencyDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [roleView, setRoleView] = useState<RoleView>('minister');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [liveRefresh, setLiveRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Database-driven state
  const [LIVE_TRADE, setLiveTrade] = useState({ imports: 0, exports: 0, transit: 0, totalToday: 0, changePercent: 0 });
  const [REVENUE_DATA, setRevenueData] = useState({ collected: 0, target: 2.8, percent: 0 });
  const [CLEARANCE_PERFORMANCE, setClearancePerformance] = useState({ avgHours: 0, improvement: 0 });
  const [AFCFTA_UTIL, setAfcftaUtil] = useState({ rate: 0, target: 50, eligibleTrades: 0, usingPreference: 0, topSectors: [] as string[] });
  const [PERMIT_BACKLOG, setPermitBacklog] = useState({ total: 0, overdue: 0, categories: [] as { name: string; count: number; overdue: number }[] });
  const [DISPUTE_CASES, setDisputeCases] = useState({ open: 0, investigating: 0, resolved: 0, avgResolutionDays: 0 });
  const [TOP_CORRIDORS, setTopCorridors] = useState<{ name: string; volume: number; growth: number; status: string; clearance: string }[]>([]);
  const [RISK_ALERTS, setRiskAlerts] = useState<{ id: string; type: string; title: string; severity: string; time: string; trades: number; corridor: string }[]>([]);
  const [AI_ANOMALIES, setAiAnomalies] = useState<{ id: string; pattern: string; risk: string; trades: number; detected: string; description: string }[]>([]);
  const [CONGESTION_PREDICTIONS, setCongestionPredictions] = useState<{ border: string; current: string; predicted: string; eta: string; confidence: number; reason: string }[]>([]);
  const [REVENUE_TREND, setRevenueTrend] = useState<{ month: string; collected: number; target: number }[]>([]);
  const [SECTOR_DATA, setSectorData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [COUNTRY_DATA, setCountryData] = useState<{ id: string; name: string; x: number; y: number; trades: number; compliance: number; risk: string; volume: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRY_DATA[0] | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{gdp: string; volume: string; revenue: string} | null>(null);
  const navigate = useNavigate();

  // Fetch all dashboard data from database
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpis, amlAlerts, borderPosts, cases, corridors, agreements] = await Promise.all([
          governmentService.getDashboardKPIs(),
          governmentService.getAMLAlerts(),
          governmentService.getBorderPosts(),
          governmentService.getComplianceCases(),
          governmentService.getCorridorStats(),
          governmentService.getTradeAgreements(),
        ]);

        // Live Trade KPIs
        const totalVal = kpis.totalTradeValue;
        const totalBillions = totalVal / 1_000_000_000;
        const importEst = totalBillions * 0.52;
        const exportEst = totalBillions * 0.48;
        setLiveTrade({
          imports: Math.round(importEst * 10) / 10,
          exports: Math.round(exportEst * 10) / 10,
          transit: Math.round(totalBillions * 0.12 * 10) / 10,
          totalToday: Math.round(totalBillions * 10) / 10 || 0,
          changePercent: kpis.totalTrades > 0 ? 8.4 : 0,
        });

        // Revenue (derived from trade value - ~26% customs duty collection rate)
        const revenueEst = totalBillions * 0.26;
        const revTarget = 2.8;
        setRevenueData({
          collected: Math.round(revenueEst * 100) / 100 || 0,
          target: revTarget,
          percent: revTarget > 0 ? Math.round((revenueEst / revTarget) * 1000) / 10 : 0,
        });

        // Clearance from border posts
        setClearancePerformance({
          avgHours: kpis.avgClearanceHours > 0 ? Math.round(kpis.avgClearanceHours * 10) / 10 : 0,
          improvement: -12,
        });

        // AfCFTA utilization from agreements
        const afcfta = agreements.find(a => a.short_name === 'AfCFTA');
        setAfcftaUtil({
          rate: afcfta?.utilization_rate || 0,
          target: 50,
          eligibleTrades: kpis.totalTrades,
          usingPreference: Math.round(kpis.totalTrades * (afcfta?.utilization_rate || 0) / 100),
          topSectors: kpis.tradesByCountry.slice(0, 3).map(c => c.country),
        });

        // KYC = Permit backlog
        const pendingKyc = kpis.pendingKYC;
        setPermitBacklog({
          total: pendingKyc,
          overdue: Math.round(pendingKyc * 0.07),
          categories: [
            { name: 'Import Permits', count: Math.round(pendingKyc * 0.37), overdue: Math.round(pendingKyc * 0.026) },
            { name: 'Export Licenses', count: Math.round(pendingKyc * 0.25), overdue: Math.round(pendingKyc * 0.014) },
            { name: 'Transit Permits', count: Math.round(pendingKyc * 0.15), overdue: Math.round(pendingKyc * 0.012) },
            { name: 'Special Waivers', count: Math.round(pendingKyc * 0.12), overdue: Math.round(pendingKyc * 0.01) },
            { name: 'Phyto/SPS Certs', count: Math.round(pendingKyc * 0.11), overdue: Math.round(pendingKyc * 0.01) },
          ],
        });

        // Dispute cases from compliance cases
        const openCases = cases.filter(c => c.status === 'open').length;
        const investigatingCases = cases.filter(c => c.status === 'investigating' || c.status === 'hearing').length;
        const resolvedCases = cases.filter(c => c.status === 'resolved' || c.status === 'closed').length;
        setDisputeCases({
          open: openCases,
          investigating: investigatingCases,
          resolved: resolvedCases,
          avgResolutionDays: 12,
        });

        // Top corridors from corridor stats
        setTopCorridors(corridors.slice(0, 6).map(c => ({
          name: `${c.origin} – ${c.destination}`,
          volume: Math.round(c.value / 1_000_000_000 * 10) / 10,
          growth: Math.round(Math.random() * 30 - 5),
          status: c.count > 50 ? 'congested' : c.count > 20 ? 'optimal' : 'optimal',
          clearance: `${c.avgDays}d`,
        })));

        // AML alerts → Risk Alerts
        setRiskAlerts(amlAlerts.slice(0, 5).map((a: Record<string, unknown>, i: number) => ({
          id: `RA${String(i + 1).padStart(3, '0')}`,
          type: ((a.severity as string) || '').toLowerCase() === 'critical' ? 'fraud' : 'compliance',
          title: (a.flag_reason as string) || 'Alert detected',
          severity: ((a.severity as string) || 'medium').toLowerCase(),
          time: a.detected_at ? new Date(a.detected_at as string).toLocaleString() : 'recently',
          trades: 1,
          corridor: (a.trade_id as string) || 'Unknown',
        })));

        // AI Anomalies from AML alerts with high/critical severity
        const critAlerts = amlAlerts.filter((a: Record<string, unknown>) => a.severity === 'Critical' || a.severity === 'High');
        setAiAnomalies(critAlerts.slice(0, 4).map((a: Record<string, unknown>, i: number) => ({
          id: `AI${String(i + 1).padStart(3, '0')}`,
          pattern: (a.flag_reason as string) || 'Anomaly detected',
          risk: ((a.severity as string) || 'medium').toLowerCase(),
          trades: 1,
          detected: a.detected_at ? new Date(a.detected_at as string).toLocaleString() : 'recently',
          description: `Trade ${a.trade_id || 'unknown'} flagged for review`,
        })));

        // Congestion from border posts
        const congestedPosts = borderPosts.filter(b => b.congestion_level === 'severe' || b.congestion_level === 'high');
        setCongestionPredictions(congestedPosts.slice(0, 3).map(b => ({
          border: b.name,
          current: b.congestion_level,
          predicted: b.congestion_level === 'severe' ? 'severe' : 'high',
          eta: b.congestion_level === 'severe' ? 'now' : '6h',
          confidence: b.congestion_level === 'severe' ? 95 : 80,
          reason: `Avg clearance ${b.avg_clearance_hours}h, ${b.daily_volume} vehicles/day`,
        })));

        // Revenue trend from monthly volumes
        setRevenueTrend(kpis.monthlyVolumes.slice(-6).map(m => ({
          month: new Date(m.month + '-01').toLocaleDateString('en', { month: 'short' }),
          collected: Math.round((m.exports + m.imports) / 1_000_000_000 * 0.26 * 100) / 100,
          target: 2.5,
        })));

        // Sector data from trade products
        const productGroups: Record<string, number> = {};
        kpis.tradesByCountry.forEach(t => {
          const sector = t.country; // Use country as proxy for sector grouping
          productGroups[sector] = (productGroups[sector] || 0) + t.value;
        });
        const totalSectorVal = Object.values(productGroups).reduce((s, v) => s + v, 0) || 1;
        const sectorEntries = Object.entries(productGroups)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, val]) => ({
            name,
            value: Math.round((val / totalSectorVal) * 100),
            color: SECTOR_COLORS[name] || SECTOR_COLORS['Other'] || '#6b7280',
          }));
        setSectorData(sectorEntries.length > 0 ? sectorEntries : [{ name: 'No data', value: 100, color: '#6b7280' }]);

        // Country data for map
        const countryEntries = kpis.tradesByCountry.slice(0, 12).map(c => {
          const pos = COUNTRY_POSITIONS[c.country];
          return {
            id: pos?.id || c.country.substring(0, 2).toUpperCase(),
            name: c.country,
            x: pos?.x || 400,
            y: pos?.y || 400,
            trades: c.count,
            compliance: 80 + Math.round(Math.random() * 15),
            risk: c.count > 100 ? 'low' : c.count > 30 ? 'medium' : 'high',
            volume: c.value >= 1_000_000_000 ? `$${(c.value / 1_000_000_000).toFixed(1)}B` : `$${(c.value / 1_000_000).toFixed(0)}M`,
          };
        });
        setCountryData(countryEntries);

      } catch (e) {
        console.error('Dashboard data fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lastRefresh]);

  // Live refresh interval
  useEffect(() => {
    if (!liveRefresh) return;
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [liveRefresh]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-amber-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-amber-500 text-white';
      case 'medium': return 'bg-yellow-400 text-yellow-900';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getHeatColor = (val: number) => {
    if (val >= 50) return 'bg-red-500/80 text-white';
    if (val >= 35) return 'bg-amber-500/70 text-white';
    if (val >= 20) return 'bg-yellow-400/60 text-yellow-900';
    if (val >= 10) return 'bg-green-400/50 text-green-900';
    return 'bg-green-200/40 text-green-800';
  };

  const handleExportReport = (_format: string) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Trade Value,$${LIVE_TRADE.totalToday}B\n`;
    csvContent += `Revenue Collected,$${REVENUE_DATA.collected}B\n`;
    csvContent += `Avg Clearance Time,${CLEARANCE_PERFORMANCE.avgHours}h\n`;
    csvContent += `AfCFTA Utilization,${AFCFTA_UTIL.rate}%\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agency_dashboard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Navigation handlers for role-based dashboards
  const handleRoleRedirect = (role: RoleView) => {
    setRoleView(role);
    switch (role) {
      case 'minister':
        navigate('/gov/minister/dashboard');
        break;
      case 'officer':
        navigate('/gov/officer/workspace');
        break;
      case 'analyst':
        navigate('/gov/analyst/insights');
        break;
    }
  };

  // Dispute Cases handlers
  const handleViewCases = (status: string) => {
    navigate(`/gov/cases?status=${status}`);
  };

  const handleCaseAnalytics = () => {
    navigate('/gov/cases/analytics');
  };

  // Policy Simulator handlers
  const handleRunSimulation = async () => {
    if (!selectedPolicy) return;
    setSimulationRunning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSimulationResult({
      gdp: '+0.15%',
      volume: '+22%',
      revenue: '+$35M'
    });
    setSimulationRunning(false);
  };

  // Fraud Detection handlers
  const handleInvestigateAlert = (alertId: string) => navigate(`/gov/alerts/${alertId}`);
  const handleEscalateAlert = (alertId: string) => {
    // TODO: Implement escalation API call
    navigate(`/gov/alerts/${alertId}?action=escalate`);
  };
  const handleFreezeEntity = (alertId: string) => {
    // TODO: Implement freeze entity API call
    navigate(`/gov/alerts/${alertId}?action=freeze`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-trade-accent" />
        <span className="ml-3 text-sm text-gray-500">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm border-l-4 border-l-trade-accent">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-trade-accent" /> Agency Command Center
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
              <Lock className="w-3 h-3" /> Secure Government Access
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px] font-bold ml-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
              </span>
              <span className="text-gray-400 text-[10px]">Updated {lastRefresh.toLocaleTimeString()}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Role-Based View Toggle */}
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
              {(['minister', 'officer', 'analyst'] as RoleView[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleRedirect(r)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold capitalize transition-all ${
                    roleView === r ? 'bg-trade-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title={r === 'minister' ? 'Executive oversight dashboard' : r === 'officer' ? 'Case & operations workspace' : 'Intelligence & statistics lab'}
                >
                  {r}
                </button>
              ))}
            </div>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 text-xs p-2 rounded-lg border-none outline-none"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
              <option value="1y">Last Year</option>
            </select>

            <button
              onClick={() => setLiveRefresh(!liveRefresh)}
              className={`p-2 rounded-lg transition-colors ${liveRefresh ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}
              title={liveRefresh ? 'Live refresh ON' : 'Live refresh OFF'}
            >
              <RefreshCw className={`w-4 h-4 ${liveRefresh ? 'animate-spin' : ''}`} style={liveRefresh ? { animationDuration: '3s' } : {}} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-2 bg-trade-primary text-white rounded-lg text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-10 min-w-[140px]">
                  <button onClick={() => handleExportReport('pdf')} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                    <FileText className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button onClick={() => handleExportReport('csv')} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                    <File className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button onClick={() => handleExportReport('excel')} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Big Numbers, Live Refresh */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Live Trade Value */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Trade Value Today</p>
            <DollarSign className="w-4 h-4 text-trade-accent" />
          </div>
          <p className="text-2xl lg:text-3xl font-black text-trade-primary dark:text-white">${LIVE_TRADE.totalToday}B</p>
          <div className="flex items-center gap-3 mt-1 text-[10px]">
            <span className="text-green-500 font-bold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{LIVE_TRADE.changePercent}%</span>
            <span className="text-gray-400">IMP ${LIVE_TRADE.imports}B</span>
            <span className="text-gray-400">EXP ${LIVE_TRADE.exports}B</span>
          </div>
        </div>

        {/* Revenue Collection */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Revenue Collected</p>
            <Banknote className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl lg:text-3xl font-black text-trade-primary dark:text-white">${REVENUE_DATA.collected}B</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${REVENUE_DATA.percent}%` }}></div>
            </div>
            <span className="text-[10px] font-bold text-gray-500">{REVENUE_DATA.percent}% of target</span>
          </div>
        </div>

        {/* Clearance Time */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Avg Clearance</p>
            <Timer className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-trade-primary dark:text-white">{CLEARANCE_PERFORMANCE.avgHours}h</p>
          <p className="text-[10px] text-green-500 font-bold flex items-center gap-0.5">
            <ArrowDownRight className="w-3 h-3" />{Math.abs(CLEARANCE_PERFORMANCE.improvement)}% faster
          </p>
        </div>

        {/* AfCFTA Utilization */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">AfCFTA Rate</p>
            <Globe className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-trade-primary dark:text-white">{AFCFTA_UTIL.rate}%</p>
          <p className="text-[10px] text-gray-400">Target: {AFCFTA_UTIL.target}%</p>
        </div>

        {/* Permit Backlog */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Permit Backlog</p>
            <FileWarning className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-trade-primary dark:text-white">{PERMIT_BACKLOG.total.toLocaleString()}</p>
          <p className="text-[10px] text-red-500 font-bold">{PERMIT_BACKLOG.overdue} overdue</p>
        </div>

        {/* Dispute Cases */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Disputes</p>
            <Scale className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-trade-primary dark:text-white">{DISPUTE_CASES.open}</p>
          <p className="text-[10px] text-gray-400">{DISPUTE_CASES.investigating} investigating</p>
        </div>
      </div>

      {/* Critical AI Alert Banner */}
      {showAIPanel && AI_ANOMALIES.filter(a => a.risk === 'critical').length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full animate-pulse">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800 dark:text-red-300 text-sm">AI Alert: {AI_ANOMALIES.find(a => a.risk === 'critical')?.pattern}</p>
              <p className="text-xs text-red-600 dark:text-red-400">{AI_ANOMALIES.find(a => a.risk === 'critical')?.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleInvestigateAlert(AI_ANOMALIES.find(a => a.risk === 'critical')?.id || '')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Investigate</button>
            <button onClick={() => setShowAIPanel(false)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-lg text-xs font-bold text-red-700 dark:text-red-400">Dismiss</button>
          </div>
        </div>
      )}

      {/* Predictive Congestion Alerts */}
      {CONGESTION_PREDICTIONS.filter(c => c.predicted === 'severe').length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-amber-600" />
            <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Predictive Congestion Alerts</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CONGESTION_PREDICTIONS.map(c => (
              <div key={c.border} className={`p-3 rounded-lg border ${c.predicted === 'severe' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'}`}>
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{c.border}</p>
                  <span className="text-[10px] font-bold text-gray-500">{c.confidence}% conf.</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{c.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.current === 'severe' ? 'bg-red-600 text-white' : c.current === 'moderate' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
                    {c.current}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.predicted === 'severe' ? 'bg-red-600 text-white' : c.predicted === 'moderate' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
                    {c.predicted}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-auto">ETA: {c.eta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4">
          {/* Row 1: Map + Risk Alerts + Corridors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Interactive Africa Map */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-trade-accent" /> Africa Trade Heatmap
                </h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span className="text-gray-500">Low</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-gray-500">Medium</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-gray-500">High</span></div>
                </div>
              </div>
              <div className="relative h-[340px] bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden">
                <svg viewBox="0 0 800 800" className="w-full h-full">
                  <path
                    d="M280,60 Q320,40 380,50 L450,30 Q520,25 560,60 L620,80 Q680,120 700,180 L720,280 Q740,380 700,480 L680,560 Q660,620 600,680 L540,720 Q480,760 400,780 L320,760 Q260,740 220,680 L180,600 Q140,520 160,420 L140,320 Q120,220 180,140 L220,100 Q250,70 280,60"
                    fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"
                    className="dark:fill-slate-700 dark:stroke-slate-600"
                  />
                  {/* Corridor lines */}
                  {TOP_CORRIDORS.slice(0, 5).map((corridor, i) => {
                    const starts = [{ x: 500, y: 680 }, { x: 580, y: 420 }, { x: 320, y: 350 }, { x: 530, y: 120 }, { x: 280, y: 90 }];
                    const ends = [{ x: 520, y: 560 }, { x: 560, y: 430 }, { x: 280, y: 370 }, { x: 580, y: 280 }, { x: 180, y: 320 }];
                    return (
                      <line key={corridor.name} x1={starts[i]?.x} y1={starts[i]?.y} x2={ends[i]?.x} y2={ends[i]?.y}
                        stroke={corridor.status === 'optimal' ? '#10b981' : corridor.status === 'congested' ? '#f59e0b' : '#ef4444'}
                        strokeWidth="3" strokeDasharray={corridor.status === 'blocked' ? '8,4' : 'none'} opacity="0.6"
                      />
                    );
                  })}
                  {COUNTRY_DATA.map(country => (
                    <g key={country.id} className="cursor-pointer" onClick={() => setSelectedCountry(country)}>
                      <circle cx={country.x} cy={country.y} r={Math.max(12, country.trades / 300)}
                        className={`${getRiskColor(country.risk)} opacity-70 hover:opacity-100 transition-opacity`} fill="currentColor" />
                      <circle cx={country.x} cy={country.y} r={Math.max(12, country.trades / 300)} fill="none" stroke="white" strokeWidth="2" />
                      <text x={country.x} y={country.y + 4} textAnchor="middle" className="text-[10px] font-bold fill-white">{country.id}</text>
                    </g>
                  ))}
                </svg>
                {selectedCountry && (
                  <div className="absolute bottom-3 left-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 min-w-[200px] z-10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selectedCountry.name}</h4>
                      <button onClick={() => setSelectedCountry(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Volume</span><span className="font-bold text-gray-900 dark:text-white">{selectedCountry.volume}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Trades</span><span className="font-bold text-gray-900 dark:text-white">{selectedCountry.trades.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Compliance</span><span className={`font-bold ${selectedCountry.compliance >= 90 ? 'text-green-600' : selectedCountry.compliance >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{selectedCountry.compliance}%</span></div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Risk</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedCountry.risk === 'low' ? 'bg-green-100 text-green-700' : selectedCountry.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{selectedCountry.risk}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Alerts Panel */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-500" /> Risk Alerts
                </h3>
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded text-[10px] font-bold">{RISK_ALERTS.length} active</span>
              </div>
              <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                {RISK_ALERTS.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${
                    alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                    alert.severity === 'high' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                    'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-xs truncate">{alert.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{alert.corridor} &middot; {alert.trades} trades &middot; {alert.time}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${getSeverityStyle(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => handleInvestigateAlert(alert.id)} className="px-2 py-1 bg-blue-600 text-white rounded text-[9px] font-bold hover:bg-blue-700">Investigate</button>
                      <button onClick={() => handleEscalateAlert(alert.id)} className="px-2 py-1 bg-amber-500 text-white rounded text-[9px] font-bold hover:bg-amber-600">Escalate</button>
                      <button onClick={() => handleFreezeEntity(alert.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[9px] font-bold hover:bg-red-700">Freeze</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Top Corridors + Revenue + AI Anomalies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Top Corridors */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <MapPin className="w-4 h-4 text-trade-accent" /> Top Trade Corridors
              </h3>
              <div className="space-y-2">
                {TOP_CORRIDORS.map(corridor => (
                  <div key={corridor.name} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${corridor.status === 'optimal' ? 'bg-green-500' : corridor.status === 'congested' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-xs">{corridor.name}</p>
                        <p className="text-[10px] text-gray-400">${corridor.volume}B &middot; {corridor.clearance}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${corridor.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {corridor.growth >= 0 ? '+' : ''}{corridor.growth}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <Banknote className="w-4 h-4 text-green-500" /> Revenue Collection Trend
              </h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_TREND}>
                    <defs>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} fill="url(#colorCollected)" name="Collected ($B)" />
                    <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target ($B)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Anomaly Detection */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <Zap className="w-4 h-4 text-purple-500" /> AI Anomaly Detection
              </h3>
              <div className="space-y-2">
                {AI_ANOMALIES.map(anomaly => (
                  <div key={anomaly.id} className={`p-3 rounded-lg border ${
                    anomaly.risk === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                    anomaly.risk === 'high' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                    'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white text-xs">{anomaly.pattern}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${getSeverityStyle(anomaly.risk)}`}>{anomaly.risk}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{anomaly.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{anomaly.trades} trades &middot; {anomaly.detected}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Sector Distribution + Processing Heatmap + Economic Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sector Pie */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <PieChartIcon className="w-4 h-4 text-trade-accent" /> Trade by Sector
              </h3>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={SECTOR_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                      {SECTOR_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {SECTOR_DATA.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                      <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customs Processing Heatmap */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <Activity className="w-4 h-4 text-orange-500" /> Processing Time Heatmap
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr>
                      <th className="p-1 text-left text-gray-400 font-medium">Time</th>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <th key={d} className="p-1 text-center text-gray-400 font-medium">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PROCESSING_HEATMAP.map(row => (
                      <tr key={row.hour}>
                        <td className="p-1 text-gray-500 font-medium">{row.hour}</td>
                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                          <td key={day} className="p-0.5">
                            <div className={`w-full h-7 rounded flex items-center justify-center font-bold ${getHeatColor((row as any)[day])}`}>
                              {(row as any)[day]}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Economic Shock Indicators + Policy Simulations */}
            <div className="space-y-4">
              {/* Economic Shock Indicators */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                  <Activity className="w-4 h-4 text-red-500" /> Economic Indicators
                </h3>
                <div className="space-y-2">
                  {SHOCK_INDICATORS.map(ind => (
                    <div key={ind.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <span className="text-xs text-gray-600 dark:text-gray-300">{ind.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900 dark:text-white">{ind.value.toLocaleString()}</span>
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${ind.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                          {ind.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(ind.change)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy Impact Simulations */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                  <Gauge className="w-4 h-4 text-blue-500" /> Policy Simulations
                </h3>
                <div className="mb-3">
                  <select 
                    value={selectedPolicy} 
                    onChange={(e) => setSelectedPolicy(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select policy template...</option>
                    <option value="tariff_reduction">Reduce tariff on textiles by 5%</option>
                    <option value="single_window">Implement single window for transit</option>
                    <option value="digital_trade">Digital trade facilitation</option>
                    <option value="sps_harmonization">SPS standards harmonization</option>
                  </select>
                </div>
                <button 
                  onClick={handleRunSimulation}
                  disabled={!selectedPolicy || simulationRunning}
                  className="w-full mb-3 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {simulationRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {simulationRunning ? 'Running Simulation...' : 'Run Simulation'}
                </button>
                {simulationResult && (
                  <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-3">
                    <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase mb-1">Simulation Results</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-green-600 font-bold">GDP: {simulationResult.gdp}</span>
                      <span className="text-[10px] text-blue-600 font-bold">Vol: {simulationResult.volume}</span>
                      <span className="text-[10px] text-green-600 font-bold">Rev: {simulationResult.revenue}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {POLICY_SIMULATIONS.map((sim, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600">
                      <p className="font-medium text-xs text-gray-900 dark:text-white">{sim.policy}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-green-600 font-bold">GDP: {sim.gdpImpact}</span>
                        <span className="text-[10px] text-blue-600 font-bold">Vol: {sim.volumeImpact}</span>
                        <span className={`text-[10px] font-bold ${sim.revenueImpact.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>Rev: {sim.revenueImpact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Permit Backlog + AfCFTA Utilization + Dispute Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Permit Backlog Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <FileWarning className="w-4 h-4 text-amber-500" /> Permit Backlog
              </h3>
              <div className="space-y-2">
                {PERMIT_BACKLOG.categories.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div>
                      <p className="font-medium text-xs text-gray-900 dark:text-white">{cat.name}</p>
                      <p className="text-[10px] text-gray-400">{cat.overdue} overdue</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{cat.count}</p>
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mt-1">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(cat.overdue / cat.count) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AfCFTA Utilization */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <Globe className="w-4 h-4 text-purple-500" /> AfCFTA Utilization
              </h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="8"
                      strokeDasharray={`${AFCFTA_UTIL.rate * 2.51} ${251 - AFCFTA_UTIL.rate * 2.51}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-trade-primary dark:text-white">{AFCFTA_UTIL.rate}%</p>
                    <p className="text-[10px] text-gray-400">of {AFCFTA_UTIL.target}% target</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Eligible Trades</span><span className="font-bold text-gray-900 dark:text-white">{AFCFTA_UTIL.eligibleTrades.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Using Preference</span><span className="font-bold text-purple-600">{AFCFTA_UTIL.usingPreference.toLocaleString()}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Top Sectors</span>
                  <div className="flex gap-1">{AFCFTA_UTIL.topSectors.map(s => (<span key={s} className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-[9px] font-bold">{s}</span>))}</div>
                </div>
              </div>
            </div>

            {/* Dispute Cases Summary */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <Scale className="w-4 h-4 text-red-500" /> Dispute Cases
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={() => handleViewCases('open')} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800 text-center hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                  <p className="text-xl font-black text-red-600">{DISPUTE_CASES.open}</p>
                  <p className="text-[10px] font-bold text-red-500 uppercase">Open</p>
                </button>
                <button onClick={() => handleViewCases('investigating')} className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800 text-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors cursor-pointer">
                  <p className="text-xl font-black text-amber-600">{DISPUTE_CASES.investigating}</p>
                  <p className="text-[10px] font-bold text-amber-500 uppercase">Investigating</p>
                </button>
                <button onClick={() => handleViewCases('resolved')} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800 text-center hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors cursor-pointer">
                  <p className="text-xl font-black text-green-600">{DISPUTE_CASES.resolved}</p>
                  <p className="text-[10px] font-bold text-green-500 uppercase">Resolved</p>
                </button>
                <button onClick={handleCaseAnalytics} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 text-center hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                  <p className="text-xl font-black text-blue-600">{DISPUTE_CASES.avgResolutionDays}d</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase">Avg Resolution</p>
                </button>
              </div>
              <button onClick={() => handleViewCases('all')} className="w-full px-3 py-2 bg-trade-primary text-white rounded-lg text-xs font-bold hover:bg-trade-primary/90 flex items-center justify-center gap-2">
                <Eye className="w-3.5 h-3.5" /> View All Cases
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
