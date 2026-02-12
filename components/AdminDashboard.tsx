import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  Settings,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Clock,
  PauseCircle,
  Activity,
  Download,
  Key,
  Building2,
  Globe,
  ToggleLeft,
  ToggleRight,
  Upload,
  UserCog,
  Layers,
  CreditCard,
  Shield,
  Copy,
  Trash2,
  Plus,
  GripVertical,
  Check,
  X,
  Server,
  Zap,
  TrendingUp,
  MoreVertical,
  Briefcase,
  Truck
} from 'lucide-react';
import { mockDatabase } from '../services/mockDatabase';
import { DbKYCRequest, DbAMLAlert, DbAuditLog, UserPersona } from '../types';

type AdminTab = 'overview' | 'roles' | 'tenants' | 'subscriptions' | 'kyc' | 'aml' | 'logs' | 'api' | 'modules';

// Role permissions matrix
interface RolePermission {
  role: UserPersona;
  permissions: {
    dashboard: boolean;
    trades: boolean;
    finance: boolean;
    compliance: boolean;
    logistics: boolean;
    marketplace: boolean;
    admin: boolean;
    regulator: boolean;
    reports: boolean;
  };
}

// Tenant/Country instance
interface Tenant {
  id: string;
  country: string;
  flag: string;
  status: 'active' | 'pending' | 'suspended';
  users: number;
  trades: number;
  modules: string[];
  createdAt: string;
}

// API Key
interface APIKey {
  id: string;
  name: string;
  key: string;
  environment: 'production' | 'staging' | 'development';
  permissions: string[];
  lastUsed: string;
  createdAt: string;
  status: 'active' | 'revoked';
}

// Module configuration
interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  countries: string[];
}

// Subscription plan
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  subscribers: number;
  status: 'active' | 'deprecated';
}

// Mock data for roles
const INITIAL_ROLE_PERMISSIONS: RolePermission[] = [
  { role: UserPersona.ADMIN, permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: true, marketplace: true, admin: true, regulator: true, reports: true } },
  { role: UserPersona.GOVERNMENT, permissions: { dashboard: true, trades: false, finance: false, compliance: true, logistics: false, marketplace: false, admin: false, regulator: true, reports: true } },
  { role: UserPersona.CUSTOMS, permissions: { dashboard: true, trades: true, finance: false, compliance: true, logistics: true, marketplace: false, admin: false, regulator: true, reports: true } },
  { role: UserPersona.BANK, permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: false, marketplace: false, admin: false, regulator: false, reports: true } },
  { role: UserPersona.EXPORTER_SME, permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: true, marketplace: true, admin: false, regulator: false, reports: false } },
  { role: UserPersona.EXPORTER_ENTERPRISE, permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: true, marketplace: true, admin: false, regulator: false, reports: true } },
  { role: UserPersona.IMPORTER, permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: true, marketplace: true, admin: false, regulator: false, reports: false } },
  { role: UserPersona.LOGISTICS, permissions: { dashboard: true, trades: true, finance: false, compliance: false, logistics: true, marketplace: true, admin: false, regulator: false, reports: false } },
  { role: UserPersona.ANALYST, permissions: { dashboard: true, trades: false, finance: false, compliance: false, logistics: false, marketplace: true, admin: false, regulator: false, reports: true } },
];

// Mock tenants
const MOCK_TENANTS: Tenant[] = [
  { id: 'NG', country: 'Nigeria', flag: '🇳🇬', status: 'active', users: 4520, trades: 12450, modules: ['trade', 'finance', 'logistics', 'compliance'], createdAt: '2024-01-15' },
  { id: 'KE', country: 'Kenya', flag: '🇰🇪', status: 'active', users: 2340, trades: 8920, modules: ['trade', 'finance', 'logistics', 'compliance'], createdAt: '2024-02-01' },
  { id: 'GH', country: 'Ghana', flag: '🇬🇭', status: 'active', users: 1890, trades: 6780, modules: ['trade', 'finance', 'logistics'], createdAt: '2024-02-20' },
  { id: 'ZA', country: 'South Africa', flag: '🇿🇦', status: 'active', users: 3210, trades: 15670, modules: ['trade', 'finance', 'logistics', 'compliance', 'marketplace'], createdAt: '2024-01-01' },
  { id: 'EG', country: 'Egypt', flag: '🇪🇬', status: 'pending', users: 890, trades: 2340, modules: ['trade', 'finance'], createdAt: '2024-03-10' },
  { id: 'MA', country: 'Morocco', flag: '🇲🇦', status: 'active', users: 1560, trades: 5430, modules: ['trade', 'finance', 'logistics'], createdAt: '2024-02-15' },
  { id: 'ET', country: 'Ethiopia', flag: '🇪🇹', status: 'pending', users: 450, trades: 1230, modules: ['trade'], createdAt: '2024-03-20' },
  { id: 'TZ', country: 'Tanzania', flag: '🇹🇿', status: 'active', users: 1120, trades: 4560, modules: ['trade', 'finance', 'logistics'], createdAt: '2024-02-28' },
];

// Mock API keys
const MOCK_API_KEYS: APIKey[] = [
  { id: 'ak_1', name: 'Production API', key: 'sk_live_Af7x...9Kp2', environment: 'production', permissions: ['read', 'write', 'delete'], lastUsed: '2024-03-15 14:30', createdAt: '2024-01-01', status: 'active' },
  { id: 'ak_2', name: 'Staging API', key: 'sk_test_Bh3y...4Mn1', environment: 'staging', permissions: ['read', 'write'], lastUsed: '2024-03-14 09:15', createdAt: '2024-01-15', status: 'active' },
  { id: 'ak_3', name: 'Development API', key: 'sk_dev_Cx5z...2Lq8', environment: 'development', permissions: ['read', 'write', 'delete'], lastUsed: '2024-03-15 16:45', createdAt: '2024-02-01', status: 'active' },
  { id: 'ak_4', name: 'Legacy Integration', key: 'sk_live_Dw9k...7Jr3', environment: 'production', permissions: ['read'], lastUsed: '2024-02-28 11:20', createdAt: '2023-06-15', status: 'revoked' },
];

// Mock modules
const MOCK_MODULES: ModuleConfig[] = [
  { id: 'trade', name: 'Trade Management', description: 'Core trade lifecycle and documentation', icon: Briefcase, enabled: true, countries: ['all'] },
  { id: 'finance', name: 'Trade Finance', description: 'Letters of credit, escrow, and payments', icon: CreditCard, enabled: true, countries: ['all'] },
  { id: 'logistics', name: 'Logistics', description: 'Shipment tracking and carrier management', icon: Truck, enabled: true, countries: ['NG', 'KE', 'GH', 'ZA', 'MA', 'TZ'] },
  { id: 'compliance', name: 'Compliance Engine', description: 'AfCFTA rules of origin and tariff calculation', icon: Shield, enabled: true, countries: ['NG', 'KE', 'ZA'] },
  { id: 'marketplace', name: 'Marketplace', description: 'B2B product listings and supplier discovery', icon: Building2, enabled: true, countries: ['ZA'] },
  { id: 'ai_assistant', name: 'AI Assistant', description: 'Intelligent trade guidance and automation', icon: Zap, enabled: true, countries: ['all'] },
  { id: 'kyc', name: 'KYC/AML Module', description: 'Identity verification and risk screening', icon: Users, enabled: true, countries: ['all'] },
  { id: 'analytics', name: 'Advanced Analytics', description: 'Trade intelligence and market insights', icon: TrendingUp, enabled: false, countries: [] },
];

// Country flag mapping
const COUNTRY_FLAGS: Record<string, string> = {
  'Nigeria': '🇳🇬', 'Kenya': '🇰🇪', 'Ghana': '🇬🇭', 'South Africa': '🇿🇦',
  'Egypt': '🇪🇬', 'Morocco': '🇲🇦', 'Ethiopia': '🇪🇹', 'Tanzania': '🇹🇿',
  'Ivory Coast': '🇨🇮', 'Senegal': '🇸🇳', 'Rwanda': '🇷🇼', 'Uganda': '🇺🇬',
  'Cameroon': '🇨🇲', 'DRC': '🇨🇩', 'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼',
  'Mozambique': '🇲🇿', 'Angola': '🇦🇴', 'Botswana': '🇧🇼', 'Namibia': '🇳🇦',
  'Unknown': '🌍',
};

// Mock subscription plans
const MOCK_PLANS: SubscriptionPlan[] = [
  { id: 'free', name: 'Starter', price: 0, currency: 'USD', features: ['5 trades/month', 'Basic compliance', 'Email support'], subscribers: 8450, status: 'active' },
  { id: 'pro', name: 'Professional', price: 99, currency: 'USD', features: ['Unlimited trades', 'Full compliance', 'Priority support', 'API access'], subscribers: 2340, status: 'active' },
  { id: 'enterprise', name: 'Enterprise', price: 499, currency: 'USD', features: ['Everything in Pro', 'Custom integrations', 'Dedicated manager', 'SLA guarantee'], subscribers: 156, status: 'active' },
  { id: 'gov', name: 'Government', price: 0, currency: 'USD', features: ['Regulator access', 'Full oversight', 'Audit reports', 'Compliance dashboards'], subscribers: 42, status: 'active' },
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [kycRequests, setKycRequests] = useState<DbKYCRequest[]>([]);
  const [amlAlerts, setAmlAlerts] = useState<DbAMLAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<DbAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Real admin stats from Supabase
  const [adminStats, setAdminStats] = useState<{
    totalUsers: number;
    totalTrades: number;
    totalOrganizations: number;
    usersByCountry: { country: string; count: number; trades: number }[];
  }>({ totalUsers: 0, totalTrades: 0, totalOrganizations: 0, usersByCountry: [] });

  // State for new features
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>(MOCK_API_KEYS);
  const [modules, setModules] = useState<ModuleConfig[]>(MOCK_MODULES);
  const [plans] = useState<SubscriptionPlan[]>(MOCK_PLANS);
  const [searchQuery, setSearchQuery] = useState('');
  const [impersonateUser, setImpersonateUser] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kyc, aml, logs, stats] = await Promise.all([
          mockDatabase.getKYCRequests(),
          mockDatabase.getAMLAlerts(),
          mockDatabase.getAuditLogs(),
          mockDatabase.getAdminStats(),
        ]);
        setKycRequests(kyc);
        setAmlAlerts(aml);
        setAuditLogs(logs);
        setAdminStats(stats);

        // Build tenants from real country data
        const builtTenants: Tenant[] = stats.usersByCountry.map(c => ({
          id: c.country.substring(0, 2).toUpperCase(),
          country: c.country,
          flag: COUNTRY_FLAGS[c.country] || '🌍',
          status: c.count > 0 ? 'active' as const : 'pending' as const,
          users: c.count,
          trades: c.trades,
          modules: ['trade', 'finance', ...(c.trades > 5 ? ['logistics'] : []), ...(c.count > 3 ? ['compliance'] : [])],
          createdAt: new Date().toISOString().split('T')[0],
        }));
        setTenants(builtTenants.length > 0 ? builtTenants : MOCK_TENANTS);
      } catch (e) {
        console.error('Admin data fetch error:', e);
        setTenants(MOCK_TENANTS);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleKYCAction = async (id: string, action: 'Approved' | 'Rejected') => {
    const success = await mockDatabase.updateKYCStatus(id, action);
    if (success) {
      setKycRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
      await mockDatabase.createAuditLog({ action: `KYC ${action}: ${id}`, status: 'Success' });
    } else {
      setKycRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    }
  };

  const handleAMLAction = async (id: string, action: 'Investigating' | 'Resolved') => {
    const success = await mockDatabase.updateAMLStatus(id, action);
    if (success) {
      setAmlAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, status: action } : alert));
      await mockDatabase.createAuditLog({ action: `AML ${action}: ${id}`, status: 'Success' });
    } else {
      setAmlAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, status: action } : alert));
    }
  };

  const togglePermission = (roleIndex: number, permission: keyof RolePermission['permissions']) => {
    setRolePermissions(prev => {
      const updated = [...prev];
      updated[roleIndex] = {
        ...updated[roleIndex],
        permissions: {
          ...updated[roleIndex].permissions,
          [permission]: !updated[roleIndex].permissions[permission]
        }
      };
      return updated;
    });
  };

  const toggleModule = (moduleId: string) => {
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.map(k =>
      k.id === keyId ? { ...k, status: 'revoked' as const } : k
    ));
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert('API key copied to clipboard');
  };

  // Overview stats from real data
  const totalUsers = adminStats.totalUsers || tenants.reduce((sum, t) => sum + t.users, 0);
  const totalTrades = adminStats.totalTrades || tenants.reduce((sum, t) => sum + t.trades, 0);
  const activeTenants = tenants.filter(t => t.status === 'active').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'roles', label: 'Roles & Permissions', icon: UserCog },
    { id: 'tenants', label: 'Tenants', icon: Globe },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'kyc', label: 'KYC Queue', icon: Users },
    { id: 'aml', label: 'Risk & AML', icon: ShieldAlert },
    { id: 'logs', label: 'Audit Logs', icon: FileText },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'modules', label: 'Modules', icon: Layers },
  ];

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-trade-accent" />
              Admin Console
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Platform Administration & System Configuration
              {loading && <span className="ml-2 text-teal-500 animate-pulse">• Syncing with Supabase...</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {impersonateUser && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
                <Eye className="w-4 h-4" />
                <span>Viewing as: <strong>{impersonateUser}</strong></span>
                <button onClick={() => setImpersonateUser(null)} className="ml-2 hover:text-amber-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={() => alert('Generating admin report...')}
              className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Total Users</p>
            <p className="text-2xl font-black text-trade-primary dark:text-white mt-1">{totalUsers.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Total Trades</p>
            <p className="text-2xl font-black text-trade-primary dark:text-white mt-1">{totalTrades.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Active Tenants</p>
            <p className="text-2xl font-black text-trade-primary dark:text-white mt-1">{activeTenants}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Pending KYC</p>
            <p className="text-2xl font-black text-trade-primary dark:text-white mt-1">{kycRequests.filter(r => r.status === 'Pending').length}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">AML Alerts</p>
            <p className="text-2xl font-black text-trade-primary dark:text-white mt-1">{amlAlerts.filter(a => a.status === 'Open').length}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
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

      {/* Content */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 overflow-y-auto min-h-0">

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status */}
              <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-green-500" />
                  System Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Services</span>
                    </div>
                    <span className="text-xs font-bold text-green-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
                    </div>
                    <span className="text-xs font-bold text-green-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Gateway</span>
                    </div>
                    <span className="text-xs font-bold text-green-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Services</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600">High Load</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-0 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-trade-accent" />
                  Recent System Activity
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-[300px] overflow-y-auto">
                  {auditLogs.slice(0, 8).map(log => (
                    <div key={log.id} className="p-3 flex items-center justify-between text-sm hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          log.status === 'Success' ? 'bg-green-500' :
                          log.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-gray-900 dark:text-white">{log.action}</span>
                        <span className="text-gray-500 text-xs">by {log.user}</span>
                      </div>
                      <span className="text-gray-500 text-xs font-mono">{log.timestamp.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('kyc')}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-trade-accent hover:bg-trade-accent/5 transition-all text-left group"
              >
                <Users className="w-8 h-8 text-trade-accent mb-2" />
                <p className="font-bold text-gray-900 dark:text-white">Review KYC</p>
                <p className="text-xs text-gray-500 mt-1">{kycRequests.filter(r => r.status === 'Pending').length} pending verifications</p>
              </button>
              <button
                onClick={() => setActiveTab('aml')}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-left group"
              >
                <ShieldAlert className="w-8 h-8 text-red-500 mb-2" />
                <p className="font-bold text-gray-900 dark:text-white">AML Alerts</p>
                <p className="text-xs text-gray-500 mt-1">{amlAlerts.filter(a => a.status === 'Open').length} active alerts</p>
              </button>
              <button
                onClick={() => setActiveTab('tenants')}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left group"
              >
                <Globe className="w-8 h-8 text-purple-500 mb-2" />
                <p className="font-bold text-gray-900 dark:text-white">Manage Tenants</p>
                <p className="text-xs text-gray-500 mt-1">{tenants.length} country instances</p>
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
              >
                <Key className="w-8 h-8 text-blue-500 mb-2" />
                <p className="font-bold text-gray-900 dark:text-white">API Keys</p>
                <p className="text-xs text-gray-500 mt-1">{apiKeys.filter(k => k.status === 'active').length} active keys</p>
              </button>
            </div>
          </div>
        )}

        {/* TAB: ROLES & PERMISSIONS */}
        {activeTab === 'roles' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Role & Permission Matrix</h2>
                <p className="text-sm text-gray-500">Drag to reorder roles. Toggle permissions for each role.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90">
                <Plus className="w-4 h-4" /> Add Custom Role
              </button>
            </div>

            <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-medium border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4 text-left w-48">Role</th>
                      <th className="p-4 text-center">Dashboard</th>
                      <th className="p-4 text-center">Trades</th>
                      <th className="p-4 text-center">Finance</th>
                      <th className="p-4 text-center">Compliance</th>
                      <th className="p-4 text-center">Logistics</th>
                      <th className="p-4 text-center">Marketplace</th>
                      <th className="p-4 text-center">Admin</th>
                      <th className="p-4 text-center">Regulator</th>
                      <th className="p-4 text-center">Reports</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {rolePermissions.map((rp, index) => (
                      <tr key={rp.role} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab opacity-0 group-hover:opacity-100" />
                            <span className="font-bold text-gray-900 dark:text-white">{rp.role}</span>
                          </div>
                        </td>
                        {Object.entries(rp.permissions).map(([perm, enabled]) => (
                          <td key={perm} className="p-4 text-center">
                            <button
                              onClick={() => togglePermission(index, perm as keyof RolePermission['permissions'])}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                enabled
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600'
                              }`}
                            >
                              {enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Impersonate User Section */}
            <div className="p-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Eye className="w-5 h-5" /> Impersonate User (Support Mode)
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">View the platform as a specific user for troubleshooting.</p>
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="Enter user email or ID..."
                  className="flex-1 px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => setImpersonateUser('trader@example.com')}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700"
                >
                  Impersonate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TENANTS */}
        {activeTab === 'tenants' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tenant Management</h2>
                <p className="text-sm text-gray-500">Manage country instances and regional deployments.</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90">
                  <Plus className="w-4 h-4" /> Add Tenant
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants
                .filter(t => t.country.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(tenant => (
                  <div
                    key={tenant.id}
                    className={`p-4 rounded-xl border ${
                      tenant.status === 'active'
                        ? 'border-green-200 dark:border-green-800 bg-white dark:bg-slate-800'
                        : tenant.status === 'pending'
                        ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    } hover:shadow-md transition-all cursor-pointer`}
                    onClick={() => setSelectedTenant(tenant)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{tenant.flag}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{tenant.country}</h3>
                          <span className={`text-xs font-bold uppercase ${
                            tenant.status === 'active' ? 'text-green-600' :
                            tenant.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                          }`}>{tenant.status}</span>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Users</p>
                        <p className="font-bold text-gray-900 dark:text-white">{tenant.users.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Trades</p>
                        <p className="font-bold text-gray-900 dark:text-white">{tenant.trades.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tenant.modules.map(mod => (
                        <span key={mod} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Bulk Upload Section */}
            <div className="p-6 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-bold text-gray-700 dark:text-gray-300">Bulk User Upload</p>
              <p className="text-sm text-gray-500 mt-1">Upload a CSV file to add multiple users at once</p>
              <button className="mt-3 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                Choose File
              </button>
            </div>
          </div>
        )}

        {/* TAB: SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Subscription Plans</h2>
                <p className="text-sm text-gray-500">Manage pricing tiers and subscriber access.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90">
                <Plus className="w-4 h-4" /> Create Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map(plan => (
                <div key={plan.id} className="p-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-trade-primary dark:text-white">${plan.price}</span>
                        {plan.price > 0 && <span className="text-gray-500 text-sm">/month</span>}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-gray-500">
                      <span className="font-bold text-gray-900 dark:text-white">{plan.subscribers.toLocaleString()}</span> subscribers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: KYC QUEUE */}
        {activeTab === 'kyc' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Verification Queue</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200">
                  <CheckCircle className="w-4 h-4" /> Approve Selected
                </button>
                <button className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-medium border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 w-12">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="p-4">Entity</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Country</th>
                    <th className="p-4">Risk Level</th>
                    <th className="p-4">Docs</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {kycRequests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="p-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">
                        {req.entity_name}
                        <span className="block text-xs text-gray-500 font-normal">{req.id}</span>
                      </td>
                      <td className="p-4">{req.entity_type}</td>
                      <td className="p-4">{req.country}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          req.risk_level === 'Low' ? 'bg-green-100 text-green-700' :
                          req.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {req.risk_level}
                        </span>
                      </td>
                      <td className="p-4 text-blue-600 hover:underline cursor-pointer">{req.document_type}</td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1 font-medium ${
                          req.status === 'Approved' ? 'text-green-600' :
                          req.status === 'Rejected' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {req.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {req.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                          {req.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {req.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleKYCAction(req.id, 'Approved')}
                              className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleKYCAction(req.id, 'Rejected')}
                              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => alert('Viewing KYC details...')}
                              className="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 border border-gray-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: AML ALERTS */}
        {activeTab === 'aml' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Monitoring</h2>
              <button
                onClick={() => { if(confirm('Are you sure you want to pause all trades globally?')) alert('Global trade pause activated.'); }}
                className="text-sm text-red-600 font-bold hover:underline flex items-center gap-1"
              >
                <PauseCircle className="w-4 h-4" /> Global Trade Pause
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {amlAlerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-xl border flex items-center justify-between ${
                  alert.severity === 'Critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900' :
                  alert.severity === 'High' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900' :
                  'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                      alert.severity === 'High' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {alert.flag_reason}
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                          alert.severity === 'Critical' ? 'bg-red-600 text-white' :
                          alert.severity === 'High' ? 'bg-amber-500 text-white' : 'bg-gray-500 text-white'
                        }`}>{alert.severity}</span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Trade ID: <span className="font-mono text-gray-700 dark:text-gray-300">{alert.trade_id}</span> • Detected: {alert.detected_at}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${
                      alert.status === 'Open' ? 'text-red-600' :
                      alert.status === 'Investigating' ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {alert.status.toUpperCase()}
                    </span>
                    {alert.status === 'Open' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAMLAction(alert.id, 'Investigating')}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-bold hover:bg-gray-50 text-gray-700"
                        >
                          Investigate
                        </button>
                        <button
                          onClick={() => window.alert('Trade frozen pending investigation.')}
                          className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 shadow-sm flex items-center gap-1"
                        >
                          <PauseCircle className="w-3 h-3" /> Freeze Trade
                        </button>
                      </div>
                    )}
                    {alert.status === 'Investigating' && (
                      <button
                        onClick={() => handleAMLAction(alert.id, 'Resolved')}
                        className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 shadow-sm"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">System Audit Trail</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600">
                  <Download className="w-4 h-4" /> Export Logs
                </button>
              </div>
            </div>
            <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-medium">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">User</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="p-4 font-mono text-xs text-gray-500">{log.timestamp}</td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{log.action}</td>
                      <td className="p-4">{log.user}</td>
                      <td className="p-4 font-mono text-xs">{log.ip}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'Success' ? 'bg-green-100 text-green-700' :
                          log.status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: API KEYS */}
        {activeTab === 'api' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">API Key Management</h2>
                <p className="text-sm text-gray-500">Manage API keys for external integrations.</p>
              </div>
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90"
              >
                <Plus className="w-4 h-4" /> Generate New Key
              </button>
            </div>

            <div className="space-y-3">
              {apiKeys.map(apiKey => (
                <div
                  key={apiKey.id}
                  className={`p-4 rounded-xl border ${
                    apiKey.status === 'active'
                      ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        apiKey.environment === 'production' ? 'bg-green-100 text-green-600' :
                        apiKey.environment === 'staging' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {apiKey.name}
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                            apiKey.environment === 'production' ? 'bg-green-600 text-white' :
                            apiKey.environment === 'staging' ? 'bg-amber-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>{apiKey.environment}</span>
                          {apiKey.status === 'revoked' && (
                            <span className="text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-red-600 text-white">Revoked</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 font-mono">{apiKey.key}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Last used: {apiKey.lastUsed}</span>
                          <span>Created: {apiKey.createdAt}</span>
                          <span>Permissions: {apiKey.permissions.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    {apiKey.status === 'active' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyApiKey(apiKey.key)}
                          className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
                          title="Copy Key"
                        >
                          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => revokeApiKey(apiKey.id)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MODULES */}
        {activeTab === 'modules' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Module Configuration</h2>
                <p className="text-sm text-gray-500">Enable or disable platform modules by country.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map(module => (
                <div
                  key={module.id}
                  className={`p-4 rounded-xl border ${
                    module.enabled
                      ? 'border-green-200 dark:border-green-800 bg-white dark:bg-slate-800'
                      : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        module.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <module.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{module.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {module.countries[0] === 'all' ? (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium text-blue-600 dark:text-blue-400">
                              All Countries
                            </span>
                          ) : (
                            module.countries.slice(0, 4).map(country => (
                              <span key={country} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                                {country}
                              </span>
                            ))
                          )}
                          {module.countries.length > 4 && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                              +{module.countries.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={`p-1 rounded transition-colors ${
                        module.enabled ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {module.enabled ? (
                        <ToggleRight className="w-8 h-8" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
