import React, { useState, useEffect } from 'react';
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
  ToggleRight,
  LogOut,
  Loader2
} from 'lucide-react';
import { supabase } from '../services/supabase';

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
  onSignOut?: () => void;
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

export const BankAccountSettings: React.FC<BankAccountSettingsProps> = ({ onSignOut }) => {
  const [signingOut, setSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [currencies, setCurrencies] = useState<Currency[]>(MOCK_CURRENCIES);
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncingRates, setSyncingRates] = useState(false);
  const [syncingIntegration, setSyncingIntegration] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Trade Finance Officer',
    department: 'Trade Finance',
    mfaEnabled: false
  });

  // New role form state
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  // Fetch data from Supabase on mount
  useEffect(() => {
    fetchAuditLogs();
    fetchIntegrations();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data && data.length > 0) {
        setAuditLogs(data.map(log => ({
          id: log.id,
          timestamp: log.created_at,
          user: log.user_id || 'System',
          action: log.action,
          resource: log.entity_type || '',
          details: log.new_values ? JSON.stringify(log.new_values).slice(0, 50) : '',
          ipAddress: log.ip_address || '',
          status: log.status as 'success' | 'failure'
        })));
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*');

      if (error) throw error;
      if (data && data.length > 0) {
        setIntegrations(data.map(int => ({
          id: int.id,
          name: int.name,
          type: int.type as 'api' | 'webhook' | 'database' | 'service',
          status: int.status as 'connected' | 'disconnected' | 'error',
          lastSync: int.last_sync_at || '',
          description: int.description || '',
          icon: int.type === 'api' ? 'globe' : int.type === 'database' ? 'database' : 'link'
        })));
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      if (onSignOut) {
        onSignOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setSigningOut(false);
    }
  };

  // Add new user
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) return;

    setLoading(true);
    try {
      const newUserData: UserAccount = {
        id: `U${String(users.length + 1).padStart(3, '0')}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        status: 'pending',
        lastLogin: '',
        permissions: ['view_applications'],
        mfaEnabled: newUser.mfaEnabled
      };

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'CREATE_USER',
        entity_type: 'User',
        entity_id: newUserData.id,
        new_values: { name: newUser.name, email: newUser.email, role: newUser.role },
        status: 'success'
      });

      setUsers(prev => [...prev, newUserData]);
      setShowAddUser(false);
      setNewUser({ name: '', email: '', role: 'Trade Finance Officer', department: 'Trade Finance', mfaEnabled: false });
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (userId: string, updates: Partial<UserAccount>) => {
    setLoading(true);
    try {
      await supabase.from('audit_logs').insert({
        action: 'UPDATE_USER',
        entity_type: 'User',
        entity_id: userId,
        new_values: updates,
        status: 'success'
      });

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      await supabase.from('audit_logs').insert({
        action: 'DELETE_USER',
        entity_type: 'User',
        entity_id: userId,
        status: 'success'
      });

      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new role
  const handleAddRole = async () => {
    if (!newRole.name) return;

    setLoading(true);
    try {
      const newRoleData: Role = {
        id: `R${String(roles.length + 1).padStart(3, '0')}`,
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions.map((p, i) => ({
          id: `P${String(i + 10).padStart(3, '0')}`,
          name: p,
          category: 'Custom',
          description: p.replace(/_/g, ' ')
        })),
        userCount: 0,
        isSystem: false
      };

      await supabase.from('audit_logs').insert({
        action: 'CREATE_ROLE',
        entity_type: 'Role',
        entity_id: newRoleData.id,
        new_values: { name: newRole.name, permissions: newRole.permissions },
        status: 'success'
      });

      setRoles(prev => [...prev, newRoleData]);
      setShowAddRole(false);
      setNewRole({ name: '', description: '', permissions: [] });
    } catch (error) {
      console.error('Error adding role:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete role
  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) return;

    setLoading(true);
    try {
      await supabase.from('audit_logs').insert({
        action: 'DELETE_ROLE',
        entity_type: 'Role',
        entity_id: roleId,
        status: 'success'
      });

      setRoles(prev => prev.filter(r => r.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync exchange rates
  const handleSyncRates = async () => {
    setSyncingRates(true);
    try {
      // Simulate API call to fetch rates
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update currencies with slightly modified rates to show change
      setCurrencies(prev => prev.map(c => ({
        ...c,
        exchangeRate: c.isBase ? 1 : c.exchangeRate * (0.99 + Math.random() * 0.02),
        lastUpdated: new Date().toISOString()
      })));

      await supabase.from('audit_logs').insert({
        action: 'SYNC_RATES',
        entity_type: 'Currency',
        new_values: { synced_at: new Date().toISOString() },
        status: 'success'
      });
    } catch (error) {
      console.error('Error syncing rates:', error);
    } finally {
      setSyncingRates(false);
    }
  };

  // Sync integration
  const handleSyncIntegration = async (integrationId: string) => {
    setSyncingIntegration(integrationId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIntegrations(prev => prev.map(int =>
        int.id === integrationId
          ? { ...int, lastSync: new Date().toISOString(), status: 'connected' as const }
          : int
      ));

      await supabase.from('audit_logs').insert({
        action: 'SYNC_INTEGRATION',
        entity_type: 'Integration',
        entity_id: integrationId,
        status: 'success'
      });
    } catch (error) {
      console.error('Error syncing integration:', error);
    } finally {
      setSyncingIntegration(null);
    }
  };

  // Export audit logs
  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP Address', 'Status'].join(','),
      ...filteredLogs.map(log =>
        [log.timestamp, log.user, log.action, log.resource, `"${log.details}"`, log.ipAddress, log.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(log =>
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
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateUser(user.id, { mfaEnabled: !user.mfaEnabled })}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Toggle MFA"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(user.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Delete user"
                      >
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

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add New User</h3>
              <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Department</label>
                <select
                  value={newUser.department}
                  onChange={e => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Trade Finance">Trade Finance</option>
                  <option value="Risk Management">Risk Management</option>
                  <option value="Compliance">Compliance</option>
                  <option value="IT">IT</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mfaEnabled"
                  checked={newUser.mfaEnabled}
                  onChange={e => setNewUser(prev => ({ ...prev, mfaEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800"
                />
                <label htmlFor="mfaEnabled" className="text-sm text-slate-400">Enable MFA</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={loading || !newUser.name || !newUser.email}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete User</h3>
            </div>
            <p className="text-slate-400 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Status</label>
                <select
                  value={editingUser.status}
                  onChange={e => setEditingUser(prev => prev ? { ...prev, status: e.target.value as 'active' | 'inactive' | 'pending' } : null)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser(prev => prev ? { ...prev, role: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateUser(editingUser.id, { status: editingUser.status, role: editingUser.role })}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
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
        {roles.map(role => (
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
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-red-400 text-sm hover:bg-red-500/10 rounded-lg transition-colors"
                    >
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

      {/* Create Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Role</h3>
              <button onClick={() => setShowAddRole(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={e => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={e => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder="Describe this role"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Permissions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {['view_applications', 'approve_applications', 'manage_documents', 'view_kyc', 'approve_kyc', 'view_aml', 'view_risk', 'generate_reports'].map(perm => (
                    <label key={perm} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(perm)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewRole(prev => ({ ...prev, permissions: [...prev.permissions, perm] }));
                          } else {
                            setNewRole(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== perm) }));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800"
                      />
                      <span className="text-sm text-white">{perm.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddRole(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRole}
                disabled={loading || !newRole.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrenciesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">Configure supported currencies and exchange rates</p>
        <button
          onClick={handleSyncRates}
          disabled={syncingRates}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncingRates ? 'animate-spin' : ''}`} />
          {syncingRates ? 'Syncing...' : 'Sync Rates'}
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
        {integrations.map(integration => {
          const statusStyle = getStatusStyle(integration.status);
          const Icon = getIntegrationIcon(integration.icon);
          const isSyncing = syncingIntegration === integration.id;

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
                  <button
                    onClick={() => handleSyncIntegration(integration.id)}
                    disabled={isSyncing}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Sync now"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Settings">
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
        <button
          onClick={handleExportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
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
        <div className="mb-8 flex items-start justify-between">
          <div>
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
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 border border-red-600/30 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
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
