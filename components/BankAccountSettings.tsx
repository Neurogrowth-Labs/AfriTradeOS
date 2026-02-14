import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  DollarSign,
  Link2,
  FileText,
  Bell,
  Lock,
  Globe,
  Building2,
  User,
  Mail,
  Phone,
  Key,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Download,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  Database,
  Server,
  Webhook,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  permissions: string[];
  mfaEnabled: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBase: boolean;
  isEnabled: boolean;
  lastUpdated: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'database' | 'service';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  description: string;
  icon: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure';
}

interface BankAccountSettingsProps {
  userRole?: string;
}

const MOCK_USERS: UserAccount[] = [
  { id: 'U001', name: 'Sarah Okonkwo', email: 'sarah@bank.com', role: 'Trade Finance Officer', department: 'Trade Finance', status: 'active', lastLogin: '2024-01-18T10:30:00Z', permissions: ['view_applications', 'approve_applications', 'manage_documents'], mfaEnabled: true },
  { id: 'U002', name: 'Michael Adeyemi', email: 'michael@bank.com', role: 'Senior Analyst', department: 'Risk Management', status: 'active', lastLogin: '2024-01-18T09:15:00Z', permissions: ['view_applications', 'view_risk', 'generate_reports'], mfaEnabled: true },
  { id: 'U003', name: 'Grace Mensah', email: 'grace@bank.com', role: 'Compliance Officer', department: 'Compliance', status: 'active', lastLogin: '2024-01-17T16:45:00Z', permissions: ['view_kyc', 'approve_kyc', 'view_aml'], mfaEnabled: true },
  { id: 'U004', name: 'David Kimani', email: 'david@bank.com', role: 'Junior Officer', department: 'Trade Finance', status: 'pending', lastLogin: '', permissions: ['view_applications'], mfaEnabled: false },
  { id: 'U005', name: 'Amina Diallo', email: 'amina@bank.com', role: 'Administrator', department: 'IT', status: 'active', lastLogin: '2024-01-18T08:00:00Z', permissions: ['admin_full'], mfaEnabled: true }
];

const MOCK_ROLES: Role[] = [
  {
    id: 'R001',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: [
      { id: 'P001', name: 'admin_full', category: 'System', description: 'Full administrative access' }
    ],
    userCount: 1,
    isSystem: true
  },
  {
    id: 'R002',
    name: 'Trade Finance Officer',
    description: 'Manage trade finance applications and documents',
    permissions: [
      { id: 'P002', name: 'view_applications', category: 'Applications', description: 'View all applications' },
      { id: 'P003', name: 'approve_applications', category: 'Applications', description: 'Approve/reject applications' },
      { id: 'P004', name: 'manage_documents', category: 'Documents', description: 'Upload and verify documents' }
    ],
    userCount: 2,
    isSystem: false
  },
  {
    id: 'R003',
    name: 'Compliance Officer',
    description: 'KYC/AML review and compliance monitoring',
    permissions: [
      { id: 'P005', name: 'view_kyc', category: 'Compliance', description: 'View KYC profiles' },
      { id: 'P006', name: 'approve_kyc', category: 'Compliance', description: 'Approve KYC profiles' },
      { id: 'P007', name: 'view_aml', category: 'Compliance', description: 'View AML alerts' }
    ],
    userCount: 1,
    isSystem: false
  },
  {
    id: 'R004',
    name: 'Senior Analyst',
    description: 'Risk analysis and reporting',
    permissions: [
      { id: 'P002', name: 'view_applications', category: 'Applications', description: 'View all applications' },
      { id: 'P008', name: 'view_risk', category: 'Risk', description: 'View risk metrics' },
      { id: 'P009', name: 'generate_reports', category: 'Reports', description: 'Generate reports' }
    ],
    userCount: 1,
    isSystem: false
  }
];

const MOCK_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0, isBase: true, isEnabled: true, lastUpdated: '2024-01-18T10:00:00Z' },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92, isBase: false, isEnabled: true, lastUpdated: '2024-01-18T10:00:00Z' },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79, isBase: false, isEnabled: true, lastUpdated: '2024-01-18T10:00:00Z' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', exchangeRate: 18.75, isBase: false, isEnabled: true, lastUpdated: '2024-01-18T10:00:00Z' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', exchangeRate: 1550.00, isBase: false, isEnabled: true, lastUpdated: '2024-01-18T10:00:00Z' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', exchangeRate: 153.25, isBase: false, isEnabled: true, lastUpdated: '2024-01-18T10:00:00Z' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', exchangeRate: 30.90, isBase: false, isEnabled: true, lastUpdated: '2024-01-18T10:00:00Z' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', exchangeRate: 10.05, isBase: false, isEnabled: false, lastUpdated: '2024-01-18T10:00:00Z' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', exchangeRate: 12.45, isBase: false, isEnabled: true, lastUpdated: '2024-01-18T10:00:00Z' },
  { code: 'XOF', name: 'CFA Franc BCEAO', symbol: 'CFA', exchangeRate: 605.50, isBase: false, isEnabled: true, lastUpdated: '2024-01-18T10:00:00Z' }
];

const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'INT001', name: 'SWIFT Network', type: 'api', status: 'connected', lastSync: '2024-01-18T10:30:00Z', description: 'International payment messaging', icon: 'globe' },
  { id: 'INT002', name: 'Core Banking System', type: 'database', status: 'connected', lastSync: '2024-01-18T10:25:00Z', description: 'T24 Core Banking Integration', icon: 'database' },
  { id: 'INT003', name: 'Sanctions Screening', type: 'api', status: 'connected', lastSync: '2024-01-18T10:00:00Z', description: 'OFAC/UN/EU sanctions lists', icon: 'shield' },
  { id: 'INT004', name: 'Credit Bureau', type: 'api', status: 'connected', lastSync: '2024-01-18T09:45:00Z', description: 'Credit score and history', icon: 'activity' },
  { id: 'INT005', name: 'Document OCR', type: 'service', status: 'connected', lastSync: '2024-01-18T10:15:00Z', description: 'AI document extraction', icon: 'file' },
  { id: 'INT006', name: 'FX Rate Provider', type: 'api', status: 'error', lastSync: '2024-01-17T23:00:00Z', description: 'Real-time exchange rates', icon: 'dollar' },
  { id: 'INT007', name: 'Email Notifications', type: 'webhook', status: 'connected', lastSync: '2024-01-18T10:28:00Z', description: 'SendGrid email service', icon: 'mail' },
  { id: 'INT008', name: 'Blockchain Ledger', type: 'api', status: 'disconnected', lastSync: '2024-01-15T12:00:00Z', description: 'Trade document verification', icon: 'link' }
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'AL001', timestamp: '2024-01-18T10:30:00Z', user: 'Sarah Okonkwo', action: 'APPROVE_APPLICATION', resource: 'APP-2024-002', details: 'Application approved with conditions', ipAddress: '192.168.1.100', status: 'success' },
  { id: 'AL002', timestamp: '2024-01-18T10:15:00Z', user: 'Michael Adeyemi', action: 'GENERATE_REPORT', resource: 'Risk Report Q1', details: 'Generated quarterly risk report', ipAddress: '192.168.1.101', status: 'success' },
  { id: 'AL003', timestamp: '2024-01-18T09:45:00Z', user: 'Grace Mensah', action: 'UPDATE_KYC', resource: 'KYC-002', details: 'Updated PEP verification status', ipAddress: '192.168.1.102', status: 'success' },
  { id: 'AL004', timestamp: '2024-01-18T09:30:00Z', user: 'System', action: 'SYNC_RATES', resource: 'Currency Rates', details: 'Automated exchange rate sync failed', ipAddress: '10.0.0.1', status: 'failure' },
  { id: 'AL005', timestamp: '2024-01-18T09:00:00Z', user: 'Amina Diallo', action: 'CREATE_USER', resource: 'U004', details: 'Created new user account for David Kimani', ipAddress: '192.168.1.105', status: 'success' },
  { id: 'AL006', timestamp: '2024-01-18T08:45:00Z', user: 'Sarah Okonkwo', action: 'UPLOAD_DOCUMENT', resource: 'DOC-2024-156', details: 'Uploaded Bill of Lading for APP-2024-001', ipAddress: '192.168.1.100', status: 'success' },
  { id: 'AL007', timestamp: '2024-01-18T08:30:00Z', user: 'Michael Adeyemi', action: 'LOGIN', resource: 'Session', details: 'User logged in successfully', ipAddress: '192.168.1.101', status: 'success' },
  { id: 'AL008', timestamp: '2024-01-18T08:15:00Z', user: 'Unknown', action: 'LOGIN_ATTEMPT', resource: 'Session', details: 'Failed login attempt - invalid credentials', ipAddress: '203.0.113.50', status: 'failure' }
];

type SettingsTab = 'users' | 'roles' | 'currencies' | 'integrations' | 'audit';

export const BankAccountSettings: React.FC<BankAccountSettingsProps> = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
  const [currencies, setCurrencies] = useState<Currency[]>(MOCK_CURRENCIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log =>
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCurrency = (code: string) => {
    setCurrencies(prev => prev.map(c =>
      c.code === code && !c.isBase ? { ...c, isEnabled: !c.isEnabled } : c
    ));
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400' },
      inactive: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
      pending: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
      connected: { bg: 'bg-green-500/20', text: 'text-green-400' },
      disconnected: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
      error: { bg: 'bg-red-500/20', text: 'text-red-400' },
      success: { bg: 'bg-green-500/20', text: 'text-green-400' },
      failure: { bg: 'bg-red-500/20', text: 'text-red-400' }
    };
    return styles[status] || styles.inactive;
  };

  const getIntegrationIcon = (icon: string) => {
    const icons: Record<string, React.ElementType> = {
      globe: Globe,
      database: Database,
      shield: Shield,
      activity: Activity,
      file: FileText,
      dollar: DollarSign,
      mail: Mail,
      link: Link2
    };
    return icons[icon] || Server;
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">User</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Role</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Department</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">MFA</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Last Login</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const statusStyle = getStatusStyle(user.status);
              return (
                <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400">{user.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.mfaEnabled ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-500" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400">{formatTimestamp(user.lastLogin)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <Key className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">Manage roles and permissions for your organization</p>
        <button
          onClick={() => setShowAddRole(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {MOCK_ROLES.map(role => (
          <div key={role.id} className="bg-slate-900 rounded-xl border border-slate-700">
            <button
              onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                    {role.isSystem && (
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">System</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{role.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-medium">{role.userCount}</p>
                  <p className="text-xs text-slate-500">users</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{role.permissions.length}</p>
                  <p className="text-xs text-slate-500">permissions</p>
                </div>
                {expandedRole === role.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {expandedRole === role.id && (
              <div className="p-4 pt-0 border-t border-slate-700">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Permissions</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {role.permissions.map(perm => (
                    <div key={perm.id} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-white text-sm">{perm.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{perm.description}</p>
                    </div>
                  ))}
                </div>
                {!role.isSystem && (
                  <div className="flex items-center gap-3 mt-4">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                      Edit Role
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-red-400 text-sm hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrenciesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">Configure supported currencies and exchange rates</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Sync Rates
        </button>
      </div>

      {/* Currency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencies.map(currency => (
          <div
            key={currency.code}
            className={`bg-slate-900 rounded-xl border p-4 transition-colors ${
              currency.isEnabled ? 'border-slate-700' : 'border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                  currency.isBase ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {currency.symbol}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{currency.code}</h3>
                    {currency.isBase && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Base</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{currency.name}</p>
                </div>
              </div>
              {!currency.isBase && (
                <button
                  onClick={() => toggleCurrency(currency.code)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {currency.isEnabled ? (
                    <ToggleRight className="w-8 h-8 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Exchange Rate</span>
                <span className="text-white font-medium">
                  1 USD = {currency.exchangeRate.toLocaleString()} {currency.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Updated: {formatTimestamp(currency.lastUpdated)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">Manage external system integrations and APIs</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_INTEGRATIONS.map(integration => {
          const statusStyle = getStatusStyle(integration.status);
          const Icon = getIntegrationIcon(integration.icon);

          return (
            <div key={integration.id} className="bg-slate-900 rounded-xl border border-slate-700 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    integration.status === 'connected' ? 'bg-green-500/20' :
                    integration.status === 'error' ? 'bg-red-500/20' : 'bg-slate-800'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      integration.status === 'connected' ? 'text-green-400' :
                      integration.status === 'error' ? 'text-red-400' : 'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{integration.name}</h3>
                    <p className="text-sm text-slate-400">{integration.description}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  {integration.status.toUpperCase()}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  Last sync: {formatTimestamp(integration.lastSync)}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Timestamp</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">User</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Action</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Resource</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Details</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">IP Address</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => {
              const statusStyle = getStatusStyle(log.status);
              return (
                <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-slate-400 text-sm">{formatTimestamp(log.timestamp)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white">{log.user}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{log.resource}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400 text-sm">{log.details}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-500 text-sm font-mono">{log.ipAddress}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'currencies', label: 'Currencies', icon: DollarSign },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'audit', label: 'Audit Logs', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Settings className="w-8 h-8 text-slate-300" />
            </div>
            Account Settings
          </h1>
          <p className="text-slate-400 mt-2">
            Manage users, roles, currencies, integrations, and system configuration
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700 mb-6">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as SettingsTab);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'roles' && renderRolesTab()}
        {activeTab === 'currencies' && renderCurrenciesTab()}
        {activeTab === 'integrations' && renderIntegrationsTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>
    </div>
  );
};

export default BankAccountSettings;
