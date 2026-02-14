import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Filter,
  Search,
  Bell,
  MapPin,
  Ship,
  FileText,
  Users,
  Building,
  Globe,
  Zap,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  CreditCard,
  Percent,
  Calendar,
  AlertOctagon,
  Activity,
  Eye,
  Flag,
  Anchor,
  Package,
  Banknote
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
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
  ComposedChart
} from 'recharts';

// Types
interface PortfolioExposure {
  category: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface TradeFlow {
  id: string;
  tradeRef: string;
  exporter: string;
  importer: string;
  corridor: string;
  value: number;
  currency: string;
  product: string;
  status: 'in_transit' | 'at_port' | 'customs_hold' | 'delivered' | 'delayed';
  documentStatus: {
    bl: 'pending' | 'verified' | 'missing';
    invoice: 'pending' | 'verified' | 'missing';
    coo: 'pending' | 'verified' | 'missing';
    insurance: 'pending' | 'verified' | 'missing';
  };
  paymentMilestone: string;
  eta: string;
  daysDelayed?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface CreditApplication {
  id: string;
  applicant: string;
  type: string;
  amount: number;
  currency: string;
  stage: 'new' | 'under_review' | 'kyc_hold' | 'aml_hold' | 'approved' | 'disbursed' | 'overdue';
  submittedAt: string;
  assignedTo?: string;
  riskScore: number;
  daysInStage: number;
}

interface RiskAlert {
  id: string;
  type: 'shipment' | 'aml' | 'policy' | 'fx' | 'port' | 'political' | 'sanctions';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  actionRequired: boolean;
  relatedEntity?: string;
}

interface CountryRisk {
  country: string;
  code: string;
  riskScore: number;
  fxVolatility: number;
  politicalRisk: 'low' | 'medium' | 'high';
  exposure: number;
  claims: number;
}

// Mock Data
const PORTFOLIO_BY_COUNTRY: PortfolioExposure[] = [
  { category: 'Nigeria', value: 45000000, percentage: 28, trend: 'up', color: '#10b981' },
  { category: 'Kenya', value: 32000000, percentage: 20, trend: 'stable', color: '#3b82f6' },
  { category: 'South Africa', value: 28000000, percentage: 17, trend: 'up', color: '#8b5cf6' },
  { category: 'Ghana', value: 22000000, percentage: 14, trend: 'down', color: '#f59e0b' },
  { category: 'Egypt', value: 18000000, percentage: 11, trend: 'stable', color: '#ec4899' },
  { category: 'Others', value: 16000000, percentage: 10, trend: 'up', color: '#6b7280' },
];

const PORTFOLIO_BY_SECTOR: PortfolioExposure[] = [
  { category: 'Agriculture', value: 52000000, percentage: 32, trend: 'up', color: '#10b981' },
  { category: 'Manufacturing', value: 38000000, percentage: 24, trend: 'stable', color: '#3b82f6' },
  { category: 'Mining', value: 28000000, percentage: 17, trend: 'down', color: '#f59e0b' },
  { category: 'Textiles', value: 22000000, percentage: 14, trend: 'up', color: '#8b5cf6' },
  { category: 'Technology', value: 21000000, percentage: 13, trend: 'up', color: '#ec4899' },
];

const PORTFOLIO_BY_CORRIDOR: PortfolioExposure[] = [
  { category: 'SA → Kenya', value: 28000000, percentage: 22, trend: 'up', color: '#10b981' },
  { category: 'Nigeria → Ghana', value: 24000000, percentage: 19, trend: 'stable', color: '#3b82f6' },
  { category: 'Egypt → Ethiopia', value: 18000000, percentage: 14, trend: 'up', color: '#8b5cf6' },
  { category: 'Kenya → Uganda', value: 16000000, percentage: 13, trend: 'down', color: '#f59e0b' },
  { category: 'Morocco → Senegal', value: 14000000, percentage: 11, trend: 'stable', color: '#ec4899' },
  { category: 'Others', value: 27000000, percentage: 21, trend: 'up', color: '#6b7280' },
];

const TRADE_FLOWS: TradeFlow[] = [
  {
    id: 'TF001',
    tradeRef: 'LC-2024-00892',
    exporter: 'Dangote Industries',
    importer: 'Kenya Imports Ltd',
    corridor: 'Nigeria → Kenya',
    value: 2500000,
    currency: 'USD',
    product: 'Cement',
    status: 'in_transit',
    documentStatus: { bl: 'verified', invoice: 'verified', coo: 'pending', insurance: 'verified' },
    paymentMilestone: 'Shipment Departed',
    eta: '2024-02-20',
    riskLevel: 'low'
  },
  {
    id: 'TF002',
    tradeRef: 'LC-2024-00891',
    exporter: 'SA Mining Corp',
    importer: 'Ghana Gold Traders',
    corridor: 'South Africa → Ghana',
    value: 4800000,
    currency: 'USD',
    product: 'Mining Equipment',
    status: 'at_port',
    documentStatus: { bl: 'verified', invoice: 'verified', coo: 'verified', insurance: 'verified' },
    paymentMilestone: 'Awaiting Customs',
    eta: '2024-02-15',
    riskLevel: 'medium'
  },
  {
    id: 'TF003',
    tradeRef: 'LC-2024-00890',
    exporter: 'Ethiopian Coffee Co',
    importer: 'Cairo Beverages',
    corridor: 'Ethiopia → Egypt',
    value: 850000,
    currency: 'USD',
    product: 'Coffee Beans',
    status: 'delayed',
    documentStatus: { bl: 'verified', invoice: 'pending', coo: 'verified', insurance: 'missing' },
    paymentMilestone: 'Documentation Issue',
    eta: '2024-02-12',
    daysDelayed: 5,
    riskLevel: 'high'
  },
  {
    id: 'TF004',
    tradeRef: 'LC-2024-00889',
    exporter: 'Moroccan Textiles',
    importer: 'Senegal Fashion House',
    corridor: 'Morocco → Senegal',
    value: 320000,
    currency: 'USD',
    product: 'Textiles',
    status: 'customs_hold',
    documentStatus: { bl: 'verified', invoice: 'verified', coo: 'pending', insurance: 'verified' },
    paymentMilestone: 'CoO Verification',
    eta: '2024-02-18',
    daysDelayed: 2,
    riskLevel: 'high'
  },
  {
    id: 'TF005',
    tradeRef: 'LC-2024-00888',
    exporter: 'Kenya Tea Board',
    importer: 'UK Tea Importers',
    corridor: 'Kenya → UK',
    value: 1200000,
    currency: 'USD',
    product: 'Tea',
    status: 'delivered',
    documentStatus: { bl: 'verified', invoice: 'verified', coo: 'verified', insurance: 'verified' },
    paymentMilestone: 'Payment Released',
    eta: '2024-02-10',
    riskLevel: 'low'
  },
];

const CREDIT_PIPELINE: CreditApplication[] = [
  { id: 'APP001', applicant: 'Nairobi Exports Ltd', type: 'Letter of Credit', amount: 500000, currency: 'USD', stage: 'new', submittedAt: '2024-02-14', riskScore: 72, daysInStage: 1 },
  { id: 'APP002', applicant: 'Lagos Trading Co', type: 'Export Factoring', amount: 1200000, currency: 'USD', stage: 'under_review', submittedAt: '2024-02-12', assignedTo: 'John M.', riskScore: 68, daysInStage: 3 },
  { id: 'APP003', applicant: 'Accra Commodities', type: 'Trade Guarantee', amount: 750000, currency: 'USD', stage: 'kyc_hold', submittedAt: '2024-02-10', assignedTo: 'Sarah K.', riskScore: 55, daysInStage: 5 },
  { id: 'APP004', applicant: 'Cairo Imports', type: 'Supply Chain Finance', amount: 2000000, currency: 'USD', stage: 'aml_hold', submittedAt: '2024-02-08', assignedTo: 'Ahmed R.', riskScore: 45, daysInStage: 7 },
  { id: 'APP005', applicant: 'Johannesburg Steel', type: 'Letter of Credit', amount: 3500000, currency: 'USD', stage: 'approved', submittedAt: '2024-02-05', assignedTo: 'Mike T.', riskScore: 82, daysInStage: 2 },
  { id: 'APP006', applicant: 'Casablanca Textiles', type: 'Export Insurance', amount: 450000, currency: 'USD', stage: 'disbursed', submittedAt: '2024-02-01', assignedTo: 'Fatima B.', riskScore: 78, daysInStage: 10 },
  { id: 'APP007', applicant: 'Addis Manufacturing', type: 'Working Capital', amount: 800000, currency: 'USD', stage: 'overdue', submittedAt: '2024-01-15', assignedTo: 'David L.', riskScore: 35, daysInStage: 30 },
  { id: 'APP008', applicant: 'Dakar Fisheries', type: 'Trade Finance', amount: 280000, currency: 'USD', stage: 'new', submittedAt: '2024-02-14', riskScore: 65, daysInStage: 1 },
];

const RISK_ALERTS: RiskAlert[] = [
  { id: 'RA001', type: 'shipment', severity: 'high', title: 'Shipment Stuck in Mombasa', description: 'Container MSCU7234567 has been at Mombasa port for 5 days without movement. LC-2024-00890.', timestamp: '2024-02-14T10:30:00Z', actionRequired: true, relatedEntity: 'Ethiopian Coffee Co' },
  { id: 'RA002', type: 'aml', severity: 'critical', title: 'AML Score Increased', description: 'Client "Cairo Imports" AML risk score increased from 45 to 72 due to new transaction patterns.', timestamp: '2024-02-14T09:15:00Z', actionRequired: true, relatedEntity: 'Cairo Imports' },
  { id: 'RA003', type: 'policy', severity: 'medium', title: 'Policy Expiring Soon', description: 'Trade credit insurance policy for "Lagos Trading Co" expires in 7 days. Renewal required.', timestamp: '2024-02-14T08:00:00Z', actionRequired: true, relatedEntity: 'Lagos Trading Co' },
  { id: 'RA004', type: 'fx', severity: 'high', title: 'Currency Risk Threshold Breached', description: 'NGN/USD volatility exceeded 5% threshold. Current exposure: $12.5M in Naira-denominated trades.', timestamp: '2024-02-13T16:45:00Z', actionRequired: true },
  { id: 'RA005', type: 'port', severity: 'medium', title: 'Port Congestion Alert', description: 'Durban port experiencing 3-day average delays. 8 shipments potentially affected.', timestamp: '2024-02-13T14:20:00Z', actionRequired: false },
  { id: 'RA006', type: 'political', severity: 'low', title: 'Election Period Advisory', description: 'Kenya general elections scheduled. Enhanced monitoring recommended for Kenyan corridor trades.', timestamp: '2024-02-13T10:00:00Z', actionRequired: false },
  { id: 'RA007', type: 'sanctions', severity: 'critical', title: 'Sanctions Match Detected', description: 'Potential OFAC match for beneficial owner of "XYZ Trading Ltd". Immediate review required.', timestamp: '2024-02-14T11:00:00Z', actionRequired: true },
];

const COUNTRY_RISKS: CountryRisk[] = [
  { country: 'Nigeria', code: 'NG', riskScore: 65, fxVolatility: 8.2, politicalRisk: 'medium', exposure: 45000000, claims: 3 },
  { country: 'Kenya', code: 'KE', riskScore: 45, fxVolatility: 3.5, politicalRisk: 'low', exposure: 32000000, claims: 1 },
  { country: 'South Africa', code: 'ZA', riskScore: 38, fxVolatility: 4.1, politicalRisk: 'low', exposure: 28000000, claims: 0 },
  { country: 'Ghana', code: 'GH', riskScore: 52, fxVolatility: 5.8, politicalRisk: 'medium', exposure: 22000000, claims: 2 },
  { country: 'Egypt', code: 'EG', riskScore: 48, fxVolatility: 2.9, politicalRisk: 'medium', exposure: 18000000, claims: 1 },
  { country: 'Ethiopia', code: 'ET', riskScore: 72, fxVolatility: 6.5, politicalRisk: 'high', exposure: 12000000, claims: 4 },
  { country: 'Morocco', code: 'MA', riskScore: 35, fxVolatility: 2.1, politicalRisk: 'low', exposure: 15000000, claims: 0 },
  { country: 'Senegal', code: 'SN', riskScore: 42, fxVolatility: 1.8, politicalRisk: 'low', exposure: 8000000, claims: 0 },
];

const MONTHLY_PERFORMANCE = [
  { month: 'Sep', disbursed: 28, repaid: 24, defaults: 1.2, applications: 45 },
  { month: 'Oct', disbursed: 32, repaid: 28, defaults: 0.8, applications: 52 },
  { month: 'Nov', disbursed: 35, repaid: 30, defaults: 1.5, applications: 48 },
  { month: 'Dec', disbursed: 29, repaid: 32, defaults: 0.9, applications: 38 },
  { month: 'Jan', disbursed: 38, repaid: 35, defaults: 1.1, applications: 55 },
  { month: 'Feb', disbursed: 42, repaid: 38, defaults: 0.7, applications: 62 },
];

export const BankFinanceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeExposureView, setActiveExposureView] = useState<'country' | 'sector' | 'corridor' | 'currency'>('country');
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterCorridor, setFilterCorridor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getExposureData = () => {
    switch (activeExposureView) {
      case 'country': return PORTFOLIO_BY_COUNTRY;
      case 'sector': return PORTFOLIO_BY_SECTOR;
      case 'corridor': return PORTFOLIO_BY_CORRIDOR;
      default: return PORTFOLIO_BY_COUNTRY;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      at_port: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      customs_hold: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getDocStatusIcon = (status: 'pending' | 'verified' | 'missing') => {
    if (status === 'verified') return <CheckCircle className="w-3 h-3 text-green-500" />;
    if (status === 'pending') return <Clock className="w-3 h-3 text-amber-500" />;
    return <XCircle className="w-3 h-3 text-red-500" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      high: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-700';
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500',
      under_review: 'bg-indigo-500',
      kyc_hold: 'bg-amber-500',
      aml_hold: 'bg-orange-500',
      approved: 'bg-green-500',
      disbursed: 'bg-emerald-500',
      overdue: 'bg-red-500',
    };
    return colors[stage] || 'bg-gray-500';
  };

  const totalExposure = 161000000;
  const outstandingFacilities = 89000000;
  const defaultRiskIndex = 2.3;
  const pendingClaims = 4;
  const utilizationRate = 78;

  const criticalAlerts = RISK_ALERTS.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-4 overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-xl p-4 border border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Finance Command Center</h2>
              <p className="text-xs text-slate-400">Portfolio • Trade Flows • Risk Intelligence • Credit Pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search trades, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-40"
              />
            </div>
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors">
              <Filter className="w-4 h-4 text-slate-400" />
            </button>
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors relative">
              <Bell className="w-4 h-4 text-slate-400" />
              {criticalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {criticalAlerts}
                </span>
              )}
            </button>
            <button className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Snapshot KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Total Exposure</span>
            <Globe className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">${(totalExposure / 1000000).toFixed(0)}M</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-green-500" />
            <span className="text-[10px] text-green-600">+8.2% MTD</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Outstanding</span>
            <Banknote className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">${(outstandingFacilities / 1000000).toFixed(0)}M</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-gray-500">Across 156 facilities</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Default Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600">{defaultRiskIndex}%</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowDownRight className="w-3 h-3 text-green-500" />
            <span className="text-[10px] text-green-600">-0.4% vs last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Pending Claims</span>
            <Shield className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600">{pendingClaims}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-gray-500">$2.4M total value</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Utilization</span>
            <Percent className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-green-600">{utilizationRate}%</p>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${utilizationRate}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Active Alerts</span>
            <Bell className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600">{criticalAlerts}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-red-500 font-medium">Action required</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column - Portfolio & Risk */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Portfolio Exposure */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Portfolio Exposure</h3>
              <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
                {(['country', 'sector', 'corridor'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveExposureView(view)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                      activeExposureView === view
                        ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getExposureData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {getExposureData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, 'Exposure']}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {getExposureData().map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">${(item.value / 1000000).toFixed(1)}M</span>
                      <span className="text-[10px] text-gray-500">{item.percentage}%</span>
                      {item.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                      {item.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Trade Flow Intelligence */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Live Trade Flow Intelligence</h3>
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterCorridor}
                  onChange={(e) => setFilterCorridor(e.target.value)}
                  className="text-[10px] bg-gray-100 dark:bg-slate-700 border-0 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Corridors</option>
                  <option value="ng-ke">Nigeria → Kenya</option>
                  <option value="za-gh">SA → Ghana</option>
                  <option value="et-eg">Ethiopia → Egypt</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase py-2 px-2">Trade Ref</th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase py-2 px-2">Corridor</th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase py-2 px-2">Value</th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase py-2 px-2">Status</th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase py-2 px-2">Documents</th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase py-2 px-2">Milestone</th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase py-2 px-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {TRADE_FLOWS.map((flow) => (
                    <tr key={flow.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors">
                      <td className="py-2.5 px-2">
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{flow.tradeRef}</p>
                          <p className="text-[10px] text-gray-500">{flow.exporter}</p>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="text-xs text-gray-700 dark:text-gray-300">{flow.corridor}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">${(flow.value / 1000000).toFixed(2)}M</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(flow.status)}`}>
                          {flow.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {flow.daysDelayed && (
                          <span className="ml-1 text-[10px] text-red-500 font-bold">+{flow.daysDelayed}d</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-0.5" title="Bill of Lading">
                            {getDocStatusIcon(flow.documentStatus.bl)}
                            <span className="text-[9px] text-gray-400">BL</span>
                          </div>
                          <div className="flex items-center gap-0.5" title="Invoice">
                            {getDocStatusIcon(flow.documentStatus.invoice)}
                            <span className="text-[9px] text-gray-400">INV</span>
                          </div>
                          <div className="flex items-center gap-0.5" title="Certificate of Origin">
                            {getDocStatusIcon(flow.documentStatus.coo)}
                            <span className="text-[9px] text-gray-400">CoO</span>
                          </div>
                          <div className="flex items-center gap-0.5" title="Insurance">
                            {getDocStatusIcon(flow.documentStatus.insurance)}
                            <span className="text-[9px] text-gray-400">INS</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="text-[10px] text-gray-600 dark:text-gray-400">{flow.paymentMilestone}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          flow.riskLevel === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          flow.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {flow.riskLevel.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Credit Pipeline - Kanban Style */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Credit Pipeline</h3>
              </div>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 overflow-x-auto">
              {(['new', 'under_review', 'kyc_hold', 'aml_hold', 'approved', 'disbursed', 'overdue'] as const).map((stage) => {
                const stageApps = CREDIT_PIPELINE.filter(app => app.stage === stage);
                const stageLabels: Record<string, string> = {
                  new: 'New',
                  under_review: 'Review',
                  kyc_hold: 'KYC Hold',
                  aml_hold: 'AML Hold',
                  approved: 'Approved',
                  disbursed: 'Disbursed',
                  overdue: 'Overdue'
                };
                return (
                  <div key={stage} className="min-w-[140px]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${getStageColor(stage)}`} />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">{stageLabels[stage]}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {stageApps.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {stageApps.map((app) => (
                        <div
                          key={app.id}
                          className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer transition-colors"
                        >
                          <p className="text-[10px] font-bold text-gray-900 dark:text-white truncate">{app.applicant}</p>
                          <p className="text-[9px] text-gray-500 truncate">{app.type}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-bold text-indigo-600">${(app.amount / 1000).toFixed(0)}K</span>
                            <span className={`text-[9px] ${app.riskScore >= 70 ? 'text-green-600' : app.riskScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                              {app.riskScore}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Alerts & Risk Radar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Smart Alerts Engine */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Smart Alerts</h3>
              </div>
              <span className="text-[10px] text-gray-500">{RISK_ALERTS.filter(a => a.actionRequired).length} action required</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {RISK_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {alert.type === 'shipment' && <Ship className="w-3 h-3" />}
                        {alert.type === 'aml' && <Shield className="w-3 h-3" />}
                        {alert.type === 'policy' && <FileText className="w-3 h-3" />}
                        {alert.type === 'fx' && <TrendingUp className="w-3 h-3" />}
                        {alert.type === 'port' && <Anchor className="w-3 h-3" />}
                        {alert.type === 'political' && <Flag className="w-3 h-3" />}
                        {alert.type === 'sanctions' && <AlertOctagon className="w-3 h-3" />}
                        <span className="text-xs font-bold">{alert.title}</span>
                      </div>
                      <p className="text-[10px] opacity-80 line-clamp-2">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] opacity-60">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {alert.relatedEntity && (
                          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">{alert.relatedEntity}</span>
                        )}
                      </div>
                    </div>
                    {alert.actionRequired && (
                      <span className="shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Country Risk Heat Map */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Risk Radar</h3>
              </div>
              <span className="text-[10px] text-gray-500">8 countries monitored</span>
            </div>
            <div className="space-y-2">
              {COUNTRY_RISKS.sort((a, b) => b.riskScore - a.riskScore).slice(0, 6).map((country) => (
                <div key={country.code} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                    {country.code}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{country.country}</span>
                      <span className={`text-[10px] font-bold ${
                        country.riskScore >= 60 ? 'text-red-600' :
                        country.riskScore >= 45 ? 'text-amber-600' :
                        'text-green-600'
                      }`}>
                        {country.riskScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          country.riskScore >= 60 ? 'bg-red-500' :
                          country.riskScore >= 45 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${country.riskScore}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] text-gray-500">FX: {country.fxVolatility}%</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        country.politicalRisk === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                        country.politicalRisk === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                        'bg-green-100 text-green-600 dark:bg-green-900/30'
                      }`}>
                        {country.politicalRisk.toUpperCase()}
                      </span>
                      {country.claims > 0 && (
                        <span className="text-[9px] text-red-500">{country.claims} claims</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Performance Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Performance</h3>
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_PERFORMANCE}>
                  <defs>
                    <linearGradient id="disbursedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="disbursed" stroke="#10b981" fill="url(#disbursedGrad)" strokeWidth={2} />
                  <Line type="monotone" dataKey="repaid" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-gray-500">Disbursed ($M)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] text-gray-500">Repaid ($M)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankFinanceDashboard;
