import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Truck,
  PlayCircle,
  RefreshCw,
  Database,
  HardDrive,
  Wifi,
  WifiOff,
  AlertOctagon,
  Link,
  ExternalLink,
  Edit,
  Trash,
  RotateCcw
} from 'lucide-react';
import { mockDatabase } from '../services/mockDatabase';
import { DbKYCRequest, DbAMLAlert, DbAuditLog, UserPersona } from '../types';

type AdminTab = 'overview' | 'roles' | 'tenants' | 'subscriptions' | 'kyc' | 'aml' | 'logs' | 'api' | 'modules' | 'services' | 'queues' | 'backup' | 'incidents';

// Toast notification type
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Role permissions matrix
interface RolePermission {
  id: string;
  role: UserPersona;
  description: string;
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
  order: number;
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

// Service status
interface ServiceStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  latency: number;
  lastCheck: string;
}

// Queue status
interface QueueStatus {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped';
  pending: number;
  processing: number;
  failed: number;
  completed: number;
}

// Backup status
interface BackupStatus {
  id: string;
  name: string;
  lastBackup: string;
  nextBackup: string;
  size: string;
  status: 'success' | 'failed' | 'in_progress';
}

// Incident
interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved';
  reportedAt: string;
  reportedBy: string;
}

// Mock data for roles
const INITIAL_ROLE_PERMISSIONS: RolePermission[] = [
  { id: 'role_1', role: UserPersona.ADMIN, description: 'Full platform access', permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: true, marketplace: true, admin: true, regulator: true, reports: true }, order: 1 },
  { id: 'role_2', role: UserPersona.GOVERNMENT, description: 'Government oversight', permissions: { dashboard: true, trades: false, finance: false, compliance: true, logistics: false, marketplace: false, admin: false, regulator: true, reports: true }, order: 2 },
  { id: 'role_3', role: UserPersona.CUSTOMS, description: 'Customs authority', permissions: { dashboard: true, trades: true, finance: false, compliance: true, logistics: true, marketplace: false, admin: false, regulator: true, reports: true }, order: 3 },
  { id: 'role_4', role: UserPersona.BANK, description: 'Financial institution', permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: false, marketplace: false, admin: false, regulator: false, reports: true }, order: 4 },
  { id: 'role_5', role: UserPersona.EXPORTER_SME, description: 'SME exporter', permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: true, marketplace: true, admin: false, regulator: false, reports: false }, order: 5 },
  { id: 'role_6', role: UserPersona.EXPORTER_ENTERPRISE, description: 'Enterprise exporter', permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: true, marketplace: true, admin: false, regulator: false, reports: true }, order: 6 },
  { id: 'role_7', role: UserPersona.IMPORTER, description: 'Importer role', permissions: { dashboard: true, trades: true, finance: true, compliance: true, logistics: true, marketplace: true, admin: false, regulator: false, reports: false }, order: 7 },
  { id: 'role_8', role: UserPersona.LOGISTICS, description: 'Logistics provider', permissions: { dashboard: true, trades: true, finance: false, compliance: false, logistics: true, marketplace: true, admin: false, regulator: false, reports: false }, order: 8 },
  { id: 'role_9', role: UserPersona.ANALYST, description: 'Trade analyst', permissions: { dashboard: true, trades: false, finance: false, compliance: false, logistics: false, marketplace: true, admin: false, regulator: false, reports: true }, order: 9 },
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

// Mock services
const MOCK_SERVICES: ServiceStatus[] = [
  { id: 'api', name: 'API Gateway', status: 'operational', uptime: '99.98%', latency: 45, lastCheck: '2 mins ago' },
  { id: 'database', name: 'PostgreSQL Database', status: 'operational', uptime: '99.99%', latency: 12, lastCheck: '1 min ago' },
  { id: 'payment', name: 'Payment Gateway', status: 'operational', uptime: '99.95%', latency: 120, lastCheck: '3 mins ago' },
  { id: 'ai', name: 'AI Services (Gemini)', status: 'degraded', uptime: '98.50%', latency: 850, lastCheck: '1 min ago' },
  { id: 'storage', name: 'File Storage (S3)', status: 'operational', uptime: '99.99%', latency: 35, lastCheck: '2 mins ago' },
  { id: 'email', name: 'Email Service', status: 'operational', uptime: '99.90%', latency: 200, lastCheck: '5 mins ago' },
];

// Mock queues
const MOCK_QUEUES: QueueStatus[] = [
  { id: 'trade-processing', name: 'Trade Processing', status: 'running', pending: 45, processing: 12, failed: 2, completed: 15420 },
  { id: 'kyc-verification', name: 'KYC Verification', status: 'running', pending: 23, processing: 5, failed: 0, completed: 8950 },
  { id: 'document-generation', name: 'Document Generation', status: 'running', pending: 8, processing: 3, failed: 1, completed: 25680 },
  { id: 'notification', name: 'Notifications', status: 'paused', pending: 156, processing: 0, failed: 12, completed: 145230 },
  { id: 'analytics', name: 'Analytics Jobs', status: 'running', pending: 3, processing: 1, failed: 0, completed: 5420 },
];

// Mock backups
const MOCK_BACKUPS: BackupStatus[] = [
  { id: 'db-daily', name: 'Database Daily Backup', lastBackup: '2024-03-15 02:00', nextBackup: '2024-03-16 02:00', size: '2.4 GB', status: 'success' },
  { id: 'db-weekly', name: 'Database Weekly Backup', lastBackup: '2024-03-10 02:00', nextBackup: '2024-03-17 02:00', size: '2.3 GB', status: 'success' },
  { id: 'files', name: 'File Storage Backup', lastBackup: '2024-03-15 03:00', nextBackup: '2024-03-16 03:00', size: '15.8 GB', status: 'success' },
  { id: 'config', name: 'Configuration Backup', lastBackup: '2024-03-15 01:00', nextBackup: '2024-03-16 01:00', size: '45 MB', status: 'success' },
];

// Mock incidents
const MOCK_INCIDENTS: Incident[] = [
  { id: 'INC-001', title: 'AI Service Latency Spike', severity: 'medium', status: 'investigating', reportedAt: '2024-03-15 10:30', reportedBy: 'System Monitor' },
  { id: 'INC-002', title: 'Payment Gateway Timeout', severity: 'high', status: 'resolved', reportedAt: '2024-03-14 15:45', reportedBy: 'Alert System' },
  { id: 'INC-003', title: 'Database Connection Pool Exhaustion', severity: 'critical', status: 'resolved', reportedAt: '2024-03-13 08:20', reportedBy: 'DBA Team' },
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [kycRequests, setKycRequests] = useState<DbKYCRequest[]>([]);
  const [amlAlerts, setAmlAlerts] = useState<DbAMLAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<DbAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tradePaused, setTradePaused] = useState(false);
  const [selectedKycIds, setSelectedKycIds] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<{ show: boolean; action: string; onConfirm: () => void } | null>(null);

  // Real admin stats from Supabase
  const [adminStats, setAdminStats] = useState<{
    totalUsers: number;
    totalTrades: number;
    totalOrganizations: number;
    usersByCountry: { country: string; count: number; trades: number }[];
  }>({ totalUsers: 0, totalTrades: 0, totalOrganizations: 0, usersByCountry: [] });

  // State for admin features
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>(MOCK_API_KEYS);
  const [modules, setModules] = useState<ModuleConfig[]>(MOCK_MODULES);
  const [plans] = useState<SubscriptionPlan[]>(MOCK_PLANS);
  const [services] = useState<ServiceStatus[]>(MOCK_SERVICES);
  const [queues, setQueues] = useState<QueueStatus[]>(MOCK_QUEUES);
  const [backups, setBackups] = useState<BackupStatus[]>(MOCK_BACKUPS);
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [impersonateUser, setImpersonateUser] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'warning' | 'info' | 'critical'>('all');

  // Toast notification helper
  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Confirmation modal helper
  const confirmAction = useCallback((action: string, onConfirm: () => void) => {
    setShowConfirmModal({ show: true, action, onConfirm });
  }, []);

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

  // ============== API ACTION HANDLERS ==============

  // Role Management
  const handleAddCustomRole = () => {
    navigate('/admin/roles/new');
  };

  const handleTogglePermission = async (roleId: string, permission: keyof RolePermission['permissions']) => {
    setRolePermissions(prev => {
      const updated = prev.map(rp =>
        rp.id === roleId
          ? { ...rp, permissions: { ...rp.permissions, [permission]: !rp.permissions[permission] } }
          : rp
      );
      return updated;
    });
    showToast('Permissions updated successfully', 'success');
    // API: PATCH /api/roles/{roleId}/permissions
  };

  const handleReorderRoles = async (roleIds: string[]) => {
    setRolePermissions(prev => {
      const reordered = roleIds.map((id, index) => {
        const role = prev.find(r => r.id === id);
        return role ? { ...role, order: index + 1 } : null;
      }).filter(Boolean) as RolePermission[];
      return reordered;
    });
    showToast('Role order saved', 'success');
    // API: PATCH /api/roles/reorder
  };

  // Tenant Management
  const handleAddTenant = () => {
    navigate('/admin/tenants/new');
  };

  const handleTenantClick = (tenantId: string) => {
    navigate(`/admin/tenants/${tenantId}`);
  };

  const handleSearchTenants = (query: string) => {
    setSearchQuery(query);
    // API: GET /api/tenants?search={query}
  };

  // Subscription Plans
  const handleCreatePlan = () => {
    navigate('/billing/plans/create');
  };

  const handleEditPlan = (planId: string) => {
    navigate(`/billing/plans/${planId}/edit`);
  };

  // KYC Verification Queue
  const handleKYCAction = async (id: string, action: 'Approved' | 'Rejected') => {
    const success = await mockDatabase.updateKYCStatus(id, action);
    if (success) {
      setKycRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
      await mockDatabase.createAuditLog({ action: `KYC ${action}: ${id}`, status: 'Success' });
      showToast(`KYC request ${action.toLowerCase()}`, 'success');
    }
  };

  const handleApproveSelected = async () => {
    if (selectedKycIds.length === 0) {
      showToast('No items selected', 'warning');
      return;
    }
    confirmAction(`Approve ${selectedKycIds.length} KYC requests`, async () => {
      for (const id of selectedKycIds) {
        await handleKYCAction(id, 'Approved');
      }
      setSelectedKycIds([]);
      showToast(`${selectedKycIds.length} requests approved`, 'success');
      // API: POST /api/verification/approve { ids: selectedKycIds }
    });
  };

  // AML/Transaction Monitoring
  const handleGlobalTradePause = () => {
    confirmAction('Pause all trades globally', async () => {
      setTradePaused(true);
      showToast('Global trade pause activated', 'warning');
      // API: POST /api/trade/pause
    });
  };

  const handleGlobalTradeResume = () => {
    confirmAction('Resume all trades', async () => {
      setTradePaused(false);
      showToast('Trading resumed', 'success');
      // API: POST /api/trade/resume
    });
  };

  const handleAMLAction = async (id: string, action: 'Investigating' | 'Resolved') => {
    const success = await mockDatabase.updateAMLStatus(id, action);
    if (success) {
      setAmlAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, status: action } : alert));
      await mockDatabase.createAuditLog({ action: `AML ${action}: ${id}`, status: 'Success' });
      showToast(`Alert marked as ${action.toLowerCase()}`, 'success');
    }
  };

  const handleInvestigateAlert = (alertId: string) => {
    navigate(`/monitoring/alerts/${alertId}`);
  };

  const handleDismissAlert = async (alertId: string) => {
    setAmlAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Alert dismissed', 'info');
    // API: POST /api/alerts/{alertId}/dismiss
  };

  // Audit Logs
  const handleExportLogs = () => {
    showToast('Downloading audit logs...', 'info');
    // API: GET /api/audit/export?format=csv
    setTimeout(() => showToast('Audit logs exported successfully', 'success'), 1500);
  };

  const handleCopyLogLink = (logId: string) => {
    const logUrl = `${window.location.origin}/admin/logs/${logId}`;
    navigator.clipboard.writeText(logUrl);
    showToast('Log link copied to clipboard', 'success');
  };

  const handleDeleteLog = (logId: string) => {
    confirmAction('Delete this log entry', () => {
      setAuditLogs(prev => prev.filter(l => l.id !== logId));
      showToast('Log entry deleted', 'success');
      // API: DELETE /api/audit/{logId}
    });
  };

  // Module Configuration
  const handleToggleModule = async (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    confirmAction(`${module.enabled ? 'Disable' : 'Enable'} ${module.name}`, async () => {
      setModules(prev => prev.map(m =>
        m.id === moduleId ? { ...m, enabled: !m.enabled } : m
      ));
      showToast(`${module.name} ${module.enabled ? 'disabled' : 'enabled'}`, 'success');
      // API: PATCH /api/modules/{moduleId} { enabled: !module.enabled }
    });
  };

  // API Key Management
  const handleRevokeApiKey = (keyId: string) => {
    confirmAction('Revoke this API key', () => {
      setApiKeys(prev => prev.map(k =>
        k.id === keyId ? { ...k, status: 'revoked' as const } : k
      ));
      showToast('API key revoked', 'success');
    });
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast('API key copied to clipboard', 'success');
  };

  const handleGenerateNewKey = () => {
    navigate('/admin/api-keys/new');
  };

  // Services
  const handleViewService = (serviceName: string) => {
    navigate(`/services/${serviceName}`);
  };

  // Queue Management
  const handleManageQueue = (queueName: string) => {
    navigate(`/queues/${queueName}`);
  };

  const handlePauseQueue = (queueId: string) => {
    setQueues(prev => prev.map(q =>
      q.id === queueId ? { ...q, status: 'paused' as const } : q
    ));
    showToast('Queue paused', 'warning');
  };

  const handleResumeQueue = (queueId: string) => {
    setQueues(prev => prev.map(q =>
      q.id === queueId ? { ...q, status: 'running' as const } : q
    ));
    showToast('Queue resumed', 'success');
  };

  const handleRetryFailedJobs = (queueId: string) => {
    showToast('Retrying failed jobs...', 'info');
    setQueues(prev => prev.map(q =>
      q.id === queueId ? { ...q, failed: 0 } : q
    ));
    setTimeout(() => showToast('Failed jobs requeued', 'success'), 1000);
  };

  // Backup Management
  const handleRunManualBackup = (backupId: string) => {
    showToast('Starting manual backup...', 'info');
    setBackups(prev => prev.map(b =>
      b.id === backupId ? { ...b, status: 'in_progress' as const } : b
    ));
    // Simulate backup completion
    setTimeout(() => {
      setBackups(prev => prev.map(b =>
        b.id === backupId ? { ...b, status: 'success' as const, lastBackup: new Date().toISOString().replace('T', ' ').substring(0, 16) } : b
      ));
      showToast('Backup completed successfully', 'success');
    }, 3000);
    // API: POST /api/backup/run
  };

  // Incident Management
  const handleReportIncident = () => {
    navigate('/incidents/new');
  };

  const handleViewIncident = (incidentId: string) => {
    navigate(`/incidents/${incidentId}`);
  };

  // Export Trade Report
  const handleExportTradeReport = () => {
    showToast('Generating trade control report...', 'info');
    setTimeout(() => showToast('Report exported', 'success'), 2000);
    // API: GET /api/reports/trade-control/export?range=30days
  };

  // Overview stats
  const totalUsers = adminStats.totalUsers || tenants.reduce((sum, t) => sum + t.users, 0);
  const totalTrades = adminStats.totalTrades || tenants.reduce((sum, t) => sum + t.trades, 0);
  const activeTenants = tenants.filter(t => t.status === 'active').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'roles', label: 'Roles', icon: UserCog },
    { id: 'tenants', label: 'Tenants', icon: Globe },
    { id: 'subscriptions', label: 'Plans', icon: CreditCard },
    { id: 'kyc', label: 'KYC Queue', icon: Users },
    { id: 'aml', label: 'AML', icon: ShieldAlert },
    { id: 'logs', label: 'Audit', icon: FileText },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'modules', label: 'Modules', icon: Layers },
    { id: 'services', label: 'Services', icon: Server },
    { id: 'queues', label: 'Queues', icon: Activity },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'incidents', label: 'Incidents', icon: AlertOctagon },
  ];

  const filteredLogs = auditLogs.filter(log => {
    if (logFilter === 'all') return true;
    if (logFilter === 'warning') return log.status === 'Warning';
    if (logFilter === 'critical') return log.status === 'Failed';
    return log.status === 'Success';
  });

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              toast.type === 'warning' ? 'bg-amber-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
            {toast.type === 'info' && <Activity className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal?.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Action</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {showConfirmModal.action}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showConfirmModal.onConfirm();
                  setShowConfirmModal(null);
                }}
                className="px-4 py-2 bg-trade-primary text-white rounded-lg font-bold hover:bg-trade-primary/90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Trade Pause Banner */}
      {tradePaused && (
        <div className="bg-red-600 text-white px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5" />
            <span className="font-bold">GLOBAL TRADE PAUSE ACTIVE</span>
            <span className="text-red-200">• All trade processing is currently halted</span>
          </div>
          <button
            onClick={handleGlobalTradeResume}
            className="px-4 py-1.5 bg-white text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 flex items-center gap-1"
          >
            <PlayCircle className="w-4 h-4" /> Resume Trading
          </button>
        </div>
      )}

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
              {loading && <span className="ml-2 text-teal-500 animate-pulse">• Syncing...</span>}
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
              onClick={handleExportTradeReport}
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-trade-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
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
                  {services.slice(0, 4).map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          service.status === 'operational' ? 'bg-green-500 animate-pulse' :
                          service.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{service.latency}ms</span>
                        <span className={`text-xs font-bold ${
                          service.status === 'operational' ? 'text-green-600' :
                          service.status === 'degraded' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {service.status === 'operational' ? 'Operational' :
                           service.status === 'degraded' ? 'Degraded' : 'Down'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('services')}
                  className="mt-4 w-full py-2 text-sm text-trade-primary font-bold hover:underline flex items-center justify-center gap-1"
                >
                  View All Services <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Recent Activity */}
              <div className="p-0 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-trade-accent" />
                    Recent System Activity
                  </span>
                  <button onClick={() => setActiveTab('logs')} className="text-xs text-trade-primary hover:underline">
                    View All
                  </button>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-[280px] overflow-y-auto">
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
                <p className="text-xs text-gray-500 mt-1">{kycRequests.filter(r => r.status === 'Pending').length} pending</p>
              </button>
              <button
                onClick={() => setActiveTab('aml')}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-left group"
              >
                <ShieldAlert className="w-8 h-8 text-red-500 mb-2" />
                <p className="font-bold text-gray-900 dark:text-white">AML Alerts</p>
                <p className="text-xs text-gray-500 mt-1">{amlAlerts.filter(a => a.status === 'Open').length} active</p>
              </button>
              <button
                onClick={() => setActiveTab('queues')}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left group"
              >
                <Activity className="w-8 h-8 text-purple-500 mb-2" />
                <p className="font-bold text-gray-900 dark:text-white">Queue Status</p>
                <p className="text-xs text-gray-500 mt-1">{queues.reduce((sum, q) => sum + q.pending, 0)} pending jobs</p>
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
              >
                <Database className="w-8 h-8 text-blue-500 mb-2" />
                <p className="font-bold text-gray-900 dark:text-white">Backups</p>
                <p className="text-xs text-gray-500 mt-1">Last: {backups[0]?.lastBackup.split(' ')[0]}</p>
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
              <button
                onClick={handleAddCustomRole}
                className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90"
              >
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
                    {rolePermissions.sort((a, b) => a.order - b.order).map((rp) => (
                      <tr key={rp.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab opacity-0 group-hover:opacity-100" />
                            <div>
                              <span className="font-bold text-gray-900 dark:text-white">{rp.role}</span>
                              <p className="text-[10px] text-gray-500">{rp.description}</p>
                            </div>
                          </div>
                        </td>
                        {Object.entries(rp.permissions).map(([perm, enabled]) => (
                          <td key={perm} className="p-4 text-center">
                            <button
                              onClick={() => handleTogglePermission(rp.id, perm as keyof RolePermission['permissions'])}
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
                    onChange={(e) => handleSearchTenants(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <button
                  onClick={handleAddTenant}
                  className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90"
                >
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
                    onClick={() => handleTenantClick(tenant.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      tenant.status === 'active'
                        ? 'border-green-200 dark:border-green-800 bg-white dark:bg-slate-800'
                        : tenant.status === 'pending'
                        ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}
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
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                      >
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
              <button
                onClick={handleCreatePlan}
                className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold hover:bg-trade-primary/90"
              >
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
                  <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      <span className="font-bold text-gray-900 dark:text-white">{plan.subscribers.toLocaleString()}</span> subscribers
                    </p>
                    <button
                      onClick={() => handleEditPlan(plan.id)}
                      className="p-2 text-gray-400 hover:text-trade-primary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
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
                <button
                  onClick={handleApproveSelected}
                  disabled={selectedKycIds.length === 0}
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Selected ({selectedKycIds.length})
                </button>
                <button className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-medium border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedKycIds.length === kycRequests.filter(r => r.status === 'Pending').length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKycIds(kycRequests.filter(r => r.status === 'Pending').map(r => r.id));
                          } else {
                            setSelectedKycIds([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-4">Entity</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Country</th>
                    <th className="p-4">Risk</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {kycRequests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedKycIds.includes(req.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedKycIds(prev => [...prev, req.id]);
                            } else {
                              setSelectedKycIds(prev => prev.filter(id => id !== req.id));
                            }
                          }}
                          disabled={req.status !== 'Pending'}
                          className="rounded border-gray-300"
                        />
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
                              onClick={() => navigate(`/admin/kyc/${req.id}`)}
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
                onClick={tradePaused ? handleGlobalTradeResume : handleGlobalTradePause}
                className={`flex items-center gap-1 text-sm font-bold ${
                  tradePaused ? 'text-green-600 hover:underline' : 'text-red-600 hover:underline'
                }`}
              >
                {tradePaused ? (
                  <><PlayCircle className="w-4 h-4" /> Resume Trading</>
                ) : (
                  <><PauseCircle className="w-4 h-4" /> Global Trade Pause</>
                )}
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
                          onClick={() => handleInvestigateAlert(alert.id)}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-bold hover:bg-gray-50 text-gray-700"
                        >
                          Investigate
                        </button>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm font-medium hover:bg-gray-200 text-gray-600"
                        >
                          Dismiss
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
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="all">All Logs</option>
                  <option value="info">Info Only</option>
                  <option value="warning">Warnings</option>
                  <option value="critical">Critical</option>
                </select>
                <button
                  onClick={handleExportLogs}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  <Download className="w-4 h-4" /> Export
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
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredLogs.map(log => (
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
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleCopyLogLink(log.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            title="Copy Link"
                          >
                            <Link className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
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
                onClick={handleGenerateNewKey}
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
                        </div>
                      </div>
                    </div>
                    {apiKey.status === 'active' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyApiKey(apiKey.key)}
                          className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200"
                          title="Copy Key"
                        >
                          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleRevokeApiKey(apiKey.id)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200"
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
                <p className="text-sm text-gray-500">Enable or disable platform modules. Changes take effect immediately.</p>
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
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleModule(module.id)}
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

        {/* TAB: SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Service Health</h2>
                <p className="text-sm text-gray-500">Monitor all platform services and their status.</p>
              </div>
              <button
                onClick={() => showToast('Refreshing service status...', 'info')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div
                  key={service.id}
                  onClick={() => handleViewService(service.id)}
                  className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        service.status === 'operational' ? 'bg-green-100 text-green-600' :
                        service.status === 'degraded' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {service.status === 'operational' ? <Wifi className="w-5 h-5" /> :
                         service.status === 'degraded' ? <Activity className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{service.name}</h4>
                        <span className={`text-xs font-bold ${
                          service.status === 'operational' ? 'text-green-600' :
                          service.status === 'degraded' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {service.status === 'operational' ? 'Operational' :
                           service.status === 'degraded' ? 'Degraded' : 'Down'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <p className="text-[10px] text-gray-500">Uptime</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{service.uptime}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <p className="text-[10px] text-gray-500">Latency</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{service.latency}ms</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <p className="text-[10px] text-gray-500">Checked</p>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{service.lastCheck}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: QUEUES */}
        {activeTab === 'queues' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Queue Status</h2>
                <p className="text-sm text-gray-500">Monitor and manage background job queues.</p>
              </div>
            </div>

            <div className="space-y-3">
              {queues.map(queue => (
                <div
                  key={queue.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        queue.status === 'running' ? 'bg-green-100 text-green-600' :
                        queue.status === 'paused' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{queue.name}</h4>
                        <span className={`text-xs font-bold uppercase ${
                          queue.status === 'running' ? 'text-green-600' :
                          queue.status === 'paused' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {queue.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {queue.status === 'running' ? (
                        <button
                          onClick={() => handlePauseQueue(queue.id)}
                          className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 flex items-center gap-1"
                        >
                          <PauseCircle className="w-3.5 h-3.5" /> Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResumeQueue(queue.id)}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 flex items-center gap-1"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Resume
                        </button>
                      )}
                      {queue.failed > 0 && (
                        <button
                          onClick={() => handleRetryFailedJobs(queue.id)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Retry Failed
                        </button>
                      )}
                      <button
                        onClick={() => handleManageQueue(queue.id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-2xl font-black text-amber-600">{queue.pending}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-black text-blue-600">{queue.processing}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Processing</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-2xl font-black text-red-600">{queue.failed}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Failed</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-black text-green-600">{queue.completed.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: BACKUP */}
        {activeTab === 'backup' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Backup Status</h2>
                <p className="text-sm text-gray-500">Monitor and manage system backups.</p>
              </div>
            </div>

            <div className="space-y-3">
              {backups.map(backup => (
                <div
                  key={backup.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        backup.status === 'success' ? 'bg-green-100 text-green-600' :
                        backup.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {backup.status === 'in_progress' ? (
                          <RefreshCw className="w-6 h-6 animate-spin" />
                        ) : (
                          <HardDrive className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{backup.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Last: {backup.lastBackup}</span>
                          <span>Next: {backup.nextBackup}</span>
                          <span>Size: {backup.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        backup.status === 'success' ? 'bg-green-100 text-green-700' :
                        backup.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {backup.status === 'success' ? 'Success' :
                         backup.status === 'in_progress' ? 'In Progress' : 'Failed'}
                      </span>
                      <button
                        onClick={() => handleRunManualBackup(backup.id)}
                        disabled={backup.status === 'in_progress'}
                        className="px-3 py-1.5 bg-trade-primary text-white rounded-lg text-xs font-bold hover:bg-trade-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> Run Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: INCIDENTS */}
        {activeTab === 'incidents' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Incident Log</h2>
                <p className="text-sm text-gray-500">Track and manage system incidents.</p>
              </div>
              <button
                onClick={handleReportIncident}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
              >
                <Plus className="w-4 h-4" /> Report Incident
              </button>
            </div>

            <div className="space-y-3">
              {incidents.map(incident => (
                <div
                  key={incident.id}
                  onClick={() => handleViewIncident(incident.id)}
                  className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${
                    incident.severity === 'critical' ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10' :
                    incident.severity === 'high' ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10' :
                    'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        incident.severity === 'high' ? 'bg-amber-100 text-amber-600' :
                        incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <AlertOctagon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500">{incident.id}</span>
                          <h4 className="font-bold text-gray-900 dark:text-white">{incident.title}</h4>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                            incident.severity === 'critical' ? 'bg-red-600 text-white' :
                            incident.severity === 'high' ? 'bg-amber-500 text-white' :
                            incident.severity === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Reported: {incident.reportedAt} by {incident.reportedBy}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      incident.status === 'open' ? 'bg-red-100 text-red-700' :
                      incident.status === 'investigating' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
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
