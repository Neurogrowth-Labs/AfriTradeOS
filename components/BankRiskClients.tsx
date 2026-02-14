import React, { useState } from 'react';
import {
  Users,
  Building2,
  Globe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Target,
  Zap,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

interface Client {
  id: string;
  type: 'corporate' | 'sme' | 'individual';
  name: string;
  country: string;
  industry: string;
  relationshipManager: string;
  onboardingDate: string;
  status: 'active' | 'inactive' | 'under_review' | 'blocked';
  riskRating: 'low' | 'medium' | 'high' | 'critical';
  creditLimit: number;
  currentExposure: number;
  currency: string;
  lastActivityDate: string;
  contactPerson: string;
  email: string;
  phone: string;
  totalTransactions: number;
  totalVolume: number;
  isFavorite: boolean;
  kycStatus: 'approved' | 'pending' | 'expired';
  notes?: string;
}

interface MarketRisk {
  id: string;
  category: 'currency' | 'commodity' | 'country' | 'interest_rate' | 'credit';
  name: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  exposure: number;
  hedgedPercent: number;
  lastUpdated: string;
}

interface RiskMetric {
  name: string;
  value: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'deteriorating';
}

interface BankRiskClientsProps {
  userRole?: string;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: 'CLT-001',
    type: 'corporate',
    name: 'Nairobi Coffee Exports Ltd',
    country: 'Kenya',
    industry: 'Agriculture',
    relationshipManager: 'Sarah Okonkwo',
    onboardingDate: '2022-03-15',
    status: 'active',
    riskRating: 'low',
    creditLimit: 500000,
    currentExposure: 250000,
    currency: 'USD',
    lastActivityDate: '2024-01-18',
    contactPerson: 'John Mwangi',
    email: 'john@nairobicoffee.co.ke',
    phone: '+254 712 345 678',
    totalTransactions: 45,
    totalVolume: 2500000,
    isFavorite: true,
    kycStatus: 'approved'
  },
  {
    id: 'CLT-002',
    type: 'corporate',
    name: 'Lagos Textiles International',
    country: 'Nigeria',
    industry: 'Manufacturing',
    relationshipManager: 'Michael Adeyemi',
    onboardingDate: '2021-08-20',
    status: 'active',
    riskRating: 'medium',
    creditLimit: 1000000,
    currentExposure: 750000,
    currency: 'USD',
    lastActivityDate: '2024-01-17',
    contactPerson: 'Amina Hassan',
    email: 'amina@lagostextiles.ng',
    phone: '+234 803 456 7890',
    totalTransactions: 78,
    totalVolume: 5200000,
    isFavorite: true,
    kycStatus: 'approved'
  },
  {
    id: 'CLT-003',
    type: 'sme',
    name: 'Accra Gold Exports',
    country: 'Ghana',
    industry: 'Mining',
    relationshipManager: 'Sarah Okonkwo',
    onboardingDate: '2023-01-10',
    status: 'under_review',
    riskRating: 'high',
    creditLimit: 200000,
    currentExposure: 180000,
    currency: 'USD',
    lastActivityDate: '2024-01-12',
    contactPerson: 'Grace Obi',
    email: 'grace@accragold.gh',
    phone: '+233 24 567 8901',
    totalTransactions: 12,
    totalVolume: 450000,
    isFavorite: false,
    kycStatus: 'pending',
    notes: 'Under review due to recent compliance concerns'
  },
  {
    id: 'CLT-004',
    type: 'corporate',
    name: 'Casablanca Trading Co',
    country: 'Morocco',
    industry: 'Trading',
    relationshipManager: 'Michael Adeyemi',
    onboardingDate: '2020-05-12',
    status: 'blocked',
    riskRating: 'critical',
    creditLimit: 0,
    currentExposure: 0,
    currency: 'EUR',
    lastActivityDate: '2024-01-05',
    contactPerson: 'Pierre Dubois',
    email: 'pierre@casablancatrading.ma',
    phone: '+212 6 12 34 56 78',
    totalTransactions: 156,
    totalVolume: 8900000,
    isFavorite: false,
    kycStatus: 'expired',
    notes: 'Blocked due to sanctions match'
  },
  {
    id: 'CLT-005',
    type: 'sme',
    name: 'Cape Town Wines Export',
    country: 'South Africa',
    industry: 'Food & Beverage',
    relationshipManager: 'Sarah Okonkwo',
    onboardingDate: '2023-06-01',
    status: 'active',
    riskRating: 'low',
    creditLimit: 300000,
    currentExposure: 85000,
    currency: 'USD',
    lastActivityDate: '2024-01-16',
    contactPerson: 'David van der Berg',
    email: 'david@capetownwines.co.za',
    phone: '+27 21 123 4567',
    totalTransactions: 23,
    totalVolume: 680000,
    isFavorite: false,
    kycStatus: 'approved'
  }
];

const MOCK_MARKET_RISKS: MarketRisk[] = [
  {
    id: 'MR-001',
    category: 'currency',
    name: 'USD/KES Exchange Rate',
    currentValue: 153.25,
    previousValue: 151.80,
    changePercent: 0.96,
    trend: 'up',
    riskLevel: 'medium',
    exposure: 2500000,
    hedgedPercent: 65,
    lastUpdated: '2024-01-18T10:30:00Z'
  },
  {
    id: 'MR-002',
    category: 'currency',
    name: 'EUR/NGN Exchange Rate',
    currentValue: 1650.50,
    previousValue: 1680.20,
    changePercent: -1.77,
    trend: 'down',
    riskLevel: 'high',
    exposure: 3200000,
    hedgedPercent: 45,
    lastUpdated: '2024-01-18T10:30:00Z'
  },
  {
    id: 'MR-003',
    category: 'commodity',
    name: 'Coffee (Arabica) Price',
    currentValue: 185.40,
    previousValue: 178.60,
    changePercent: 3.81,
    trend: 'up',
    riskLevel: 'low',
    exposure: 1800000,
    hedgedPercent: 80,
    lastUpdated: '2024-01-18T09:00:00Z'
  },
  {
    id: 'MR-004',
    category: 'commodity',
    name: 'Gold Spot Price',
    currentValue: 2028.50,
    previousValue: 2045.30,
    changePercent: -0.82,
    trend: 'down',
    riskLevel: 'medium',
    exposure: 950000,
    hedgedPercent: 55,
    lastUpdated: '2024-01-18T10:00:00Z'
  },
  {
    id: 'MR-005',
    category: 'country',
    name: 'Nigeria Country Risk',
    currentValue: 68,
    previousValue: 65,
    changePercent: 4.62,
    trend: 'up',
    riskLevel: 'high',
    exposure: 4500000,
    hedgedPercent: 0,
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  {
    id: 'MR-006',
    category: 'interest_rate',
    name: 'SOFR Rate',
    currentValue: 5.33,
    previousValue: 5.31,
    changePercent: 0.38,
    trend: 'stable',
    riskLevel: 'low',
    exposure: 8000000,
    hedgedPercent: 70,
    lastUpdated: '2024-01-18T06:00:00Z'
  }
];

const MOCK_RISK_METRICS: RiskMetric[] = [
  { name: 'Portfolio VaR (95%)', value: 2.8, target: 3.0, status: 'good', trend: 'stable' },
  { name: 'Credit Utilization', value: 72, target: 80, status: 'good', trend: 'improving' },
  { name: 'NPL Ratio', value: 3.2, target: 5.0, status: 'good', trend: 'improving' },
  { name: 'Concentration Risk', value: 28, target: 25, status: 'warning', trend: 'deteriorating' },
  { name: 'Liquidity Coverage', value: 125, target: 100, status: 'good', trend: 'stable' },
  { name: 'FX Exposure', value: 45, target: 40, status: 'warning', trend: 'stable' }
];

export const BankRiskClients: React.FC<BankRiskClientsProps> = () => {
  const [activeView, setActiveView] = useState<'clients' | 'risk'>('clients');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedRiskCategories, setExpandedRiskCategories] = useState<Set<string>>(new Set(['currency', 'commodity', 'country']));

  const toggleRiskCategory = (category: string) => {
    setExpandedRiskCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleFavorite = (clientId: string) => {
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, isFavorite: !c.isFavorite } : c
    ));
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || client.riskRating === riskFilter;
    const matchesType = typeFilter === 'all' || client.type === typeFilter;
    return matchesSearch && matchesStatus && matchesRisk && matchesType;
  });

  const clientStats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    totalExposure: clients.reduce((sum, c) => sum + c.currentExposure, 0),
    totalLimit: clients.reduce((sum, c) => sum + c.creditLimit, 0),
    highRisk: clients.filter(c => ['high', 'critical'].includes(c.riskRating)).length
  };

  const getRiskStyle = (risk: Client['riskRating']) => {
    const styles = {
      low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };
    return styles[risk];
  };

  const getStatusStyle = (status: Client['status']) => {
    const styles = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2 },
      inactive: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Clock },
      under_review: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Eye },
      blocked: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle }
    };
    return styles[status];
  };

  const getMarketRiskIcon = (category: MarketRisk['category']) => {
    const icons = {
      currency: DollarSign,
      commodity: BarChart3,
      country: Globe,
      interest_rate: Percent,
      credit: Shield
    };
    return icons[category];
  };

  const renderClientsList = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Clients</p>
              <p className="text-2xl font-bold text-white mt-1">{clientStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{clientStats.active}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Exposure</p>
              <p className="text-2xl font-bold text-white mt-1">${(clientStats.totalExposure / 1000000).toFixed(2)}M</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Credit Utilization</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {Math.round((clientStats.totalExposure / clientStats.totalLimit) * 100)}%
              </p>
            </div>
            <Target className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">High Risk</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{clientStats.highRisk}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="corporate">Corporate</option>
          <option value="sme">SME</option>
          <option value="individual">Individual</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="under_review">Under Review</option>
          <option value="blocked">Blocked</option>
        </select>
        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Risk</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400 w-8"></th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Client</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Country</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Risk</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Exposure</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Utilization</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Last Activity</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => {
              const riskStyle = getRiskStyle(client.riskRating);
              const statusStyle = getStatusStyle(client.status);
              const StatusIcon = statusStyle.icon;
              const utilization = client.creditLimit > 0 ? (client.currentExposure / client.creditLimit) * 100 : 0;

              return (
                <tr
                  key={client.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedClient(client)}
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(client.id);
                      }}
                      className="text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      {client.isFavorite ? (
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ) : (
                        <StarOff className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        client.type === 'corporate' ? 'bg-blue-500/20' :
                        client.type === 'sme' ? 'bg-purple-500/20' : 'bg-green-500/20'
                      }`}>
                        {client.type === 'corporate' ? (
                          <Building2 className="w-5 h-5 text-blue-400" />
                        ) : client.type === 'sme' ? (
                          <Building2 className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Users className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{client.name}</p>
                        <p className="text-sm text-slate-400">{client.industry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{client.country}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${riskStyle.bg} ${riskStyle.text}`}>
                      {client.riskRating.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <StatusIcon className="w-3 h-3" />
                      {client.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">
                      {client.currency} {client.currentExposure.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            utilization >= 90 ? 'bg-red-500' :
                            utilization >= 70 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-400">{Math.round(utilization)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400">{client.lastActivityDate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedClient(client);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
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

  const renderClientDetail = () => {
    if (!selectedClient) return null;

    const riskStyle = getRiskStyle(selectedClient.riskRating);
    const statusStyle = getStatusStyle(selectedClient.status);
    const StatusIcon = statusStyle.icon;
    const utilization = selectedClient.creditLimit > 0 ? (selectedClient.currentExposure / selectedClient.creditLimit) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => setSelectedClient(null)}
              className="text-sm text-slate-400 hover:text-white mb-2 flex items-center gap-1"
            >
              ← Back to Clients
            </button>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                selectedClient.type === 'corporate' ? 'bg-blue-500/20' : 'bg-purple-500/20'
              }`}>
                <Building2 className={`w-8 h-8 ${
                  selectedClient.type === 'corporate' ? 'text-blue-400' : 'text-purple-400'
                }`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                <p className="text-slate-400">{selectedClient.id} • {selectedClient.industry} • {selectedClient.country}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFavorite(selectedClient.id)}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {selectedClient.isFavorite ? (
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              ) : (
                <StarOff className="w-5 h-5" />
              )}
            </button>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${riskStyle.bg} ${riskStyle.text}`}>
              {selectedClient.riskRating.toUpperCase()} RISK
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              <StatusIcon className="w-4 h-4" />
              {selectedClient.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Credit Limit</p>
            <p className="text-2xl font-bold text-white mt-1">
              {selectedClient.currency} {selectedClient.creditLimit.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Current Exposure</p>
            <p className="text-2xl font-bold text-white mt-1">
              {selectedClient.currency} {selectedClient.currentExposure.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    utilization >= 90 ? 'bg-red-500' :
                    utilization >= 70 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">{Math.round(utilization)}%</span>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Total Volume</p>
            <p className="text-2xl font-bold text-white mt-1">
              ${(selectedClient.totalVolume / 1000000).toFixed(2)}M
            </p>
            <p className="text-xs text-slate-500 mt-1">{selectedClient.totalTransactions} transactions</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Relationship Manager</p>
            <p className="text-2xl font-bold text-white mt-1">{selectedClient.relationshipManager}</p>
            <p className="text-xs text-slate-500 mt-1">Since {selectedClient.onboardingDate}</p>
          </div>
        </div>

        {/* Contact & KYC Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Contact Person</p>
                  <p className="text-white">{selectedClient.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white">{selectedClient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="text-white">{selectedClient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Country</p>
                  <p className="text-white">{selectedClient.country}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <span className="text-white">KYC Status</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedClient.kycStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                  selectedClient.kycStatus === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {selectedClient.kycStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span className="text-white">Last Activity</span>
                </div>
                <span className="text-slate-400">{selectedClient.lastActivityDate}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-slate-400" />
                  <span className="text-white">Risk Rating</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${riskStyle.bg} ${riskStyle.text}`}>
                  {selectedClient.riskRating.toUpperCase()}
                </span>
              </div>
            </div>

            {selectedClient.notes && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-300">{selectedClient.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
            <FileText className="w-4 h-4" />
            View Documents
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
            <Activity className="w-4 h-4" />
            Transaction History
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
            <Edit2 className="w-4 h-4" />
            Edit Client
          </button>
        </div>
      </div>
    );
  };

  const renderMarketRisk = () => {
    const groupedRisks = MOCK_MARKET_RISKS.reduce((acc, risk) => {
      if (!acc[risk.category]) acc[risk.category] = [];
      acc[risk.category].push(risk);
      return acc;
    }, {} as Record<string, MarketRisk[]>);

    return (
      <div className="space-y-6">
        {/* Risk Metrics Overview */}
        <div className="grid grid-cols-3 gap-4">
          {MOCK_RISK_METRICS.slice(0, 6).map((metric, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">{metric.name}</p>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  metric.status === 'good' ? 'bg-green-500/20 text-green-400' :
                  metric.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {metric.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{metric.value}%</p>
                <div className="flex items-center gap-1 text-sm">
                  {metric.trend === 'improving' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  ) : metric.trend === 'deteriorating' ? (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  ) : (
                    <Activity className="w-4 h-4 text-slate-400" />
                  )}
                  <span className={`${
                    metric.trend === 'improving' ? 'text-green-400' :
                    metric.trend === 'deteriorating' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Target: {metric.target}%</p>
            </div>
          ))}
        </div>

        {/* Market Risk Categories */}
        <div className="space-y-4">
          {Object.entries(groupedRisks).map(([category, risks]) => {
            const CategoryIcon = getMarketRiskIcon(category as MarketRisk['category']);
            const isExpanded = expandedRiskCategories.has(category);

            return (
              <div key={category} className="bg-slate-900 rounded-xl border border-slate-700">
                <button
                  onClick={() => toggleRiskCategory(category)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <CategoryIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {category.replace('_', ' ')} Risk
                      </h3>
                      <p className="text-sm text-slate-400">{risks.length} indicators</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3">
                    {risks.map(risk => {
                      const riskStyle = getRiskStyle(risk.riskLevel);
                      return (
                        <div key={risk.id} className="p-4 bg-slate-800/50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium">{risk.name}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold text-white">{risk.currentValue}</span>
                                  <div className={`flex items-center gap-1 text-sm ${
                                    risk.trend === 'up' ? 'text-green-400' :
                                    risk.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                                  }`}>
                                    {risk.trend === 'up' ? (
                                      <TrendingUp className="w-4 h-4" />
                                    ) : risk.trend === 'down' ? (
                                      <TrendingDown className="w-4 h-4" />
                                    ) : (
                                      <Activity className="w-4 h-4" />
                                    )}
                                    <span>{risk.changePercent > 0 ? '+' : ''}{risk.changePercent.toFixed(2)}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${riskStyle.bg} ${riskStyle.text}`}>
                                {risk.riskLevel.toUpperCase()}
                              </span>
                              <div className="mt-2">
                                <p className="text-xs text-slate-500">Exposure</p>
                                <p className="text-sm text-white">${(risk.exposure / 1000000).toFixed(2)}M</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Hedged</span>
                                <span>{risk.hedgedPercent}%</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${risk.hedgedPercent}%` }}
                                />
                              </div>
                            </div>
                            <button className="px-3 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
            </div>
            Risk & Clients
          </h1>
          <p className="text-slate-400 mt-2">
            Client directory and market risk monitoring for trade finance
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => {
              setActiveView('clients');
              setSelectedClient(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'clients' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Client Directory
          </button>
          <button
            onClick={() => {
              setActiveView('risk');
              setSelectedClient(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'risk' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            Market Risk
          </button>
        </div>

        {/* Content */}
        {activeView === 'clients' ? (
          selectedClient ? renderClientDetail() : renderClientsList()
        ) : (
          renderMarketRisk()
        )}
      </div>
    </div>
  );
};

export default BankRiskClients;
