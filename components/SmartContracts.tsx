import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Building,
  Package,
  DollarSign,
  Calendar,
  Users,
  FileSignature,
  Milestone,
  Scale,
  Send,
  Download,
  MoreVertical,
  Loader2,
  X,
  Check,
  AlertCircle,
  Truck,
  CreditCard,
  ClipboardList,
  PenTool,
  History,
  MessageSquare,
  Mail,
  Share2,
  FileDown
} from 'lucide-react';
import { supabase } from '../services/supabase';

// Types
interface Contract {
  id: string;
  contract_number: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_approval' | 'active' | 'in_progress' | 'completed' | 'disputed' | 'cancelled' | 'expired';
  category: string;
  commodity: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_value: number;
  currency: string;
  incoterms: string;
  effective_date: string;
  expiry_date: string;
  delivery_deadline: string;
  buyer_org_name?: string;
  seller_org_name?: string;
  buyer_signed_at: string | null;
  seller_signed_at: string | null;
  milestones_count?: number;
  completed_milestones?: number;
  created_at: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  terms_structure: { name: string; percentage: number }[];
  usage_count: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  milestone_type: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  payment_amount: number;
  payment_percentage: number;
  completed_at: string | null;
}

interface ContractFormData {
  title: string;
  description: string;
  template_id: string;
  category: string;
  commodity: string;
  hs_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  currency: string;
  incoterms: string;
  effective_date: string;
  expiry_date: string;
  delivery_deadline: string;
  late_delivery_penalty: number;
  buyer_org_id: string;
  seller_org_id: string;
}

const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];
const UNITS = ['kg', 'tons', 'units', 'pieces', 'containers', 'pallets', 'bags', 'barrels'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR', 'GHS', 'XOF'];

export const SmartContracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedMilestones, setSelectedMilestones] = useState<Milestone[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'documents' | 'activity'>('overview');
  const [createStep, setCreateStep] = useState(1);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [signatureData, setSignatureData] = useState({ name: '', title: '', agreed: false });
  const [shareData, setShareData] = useState({ email: '', method: 'email' as 'email' | 'platform' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>({
    title: '',
    description: '',
    template_id: '',
    category: '',
    commodity: '',
    hs_code: '',
    quantity: 0,
    unit: 'tons',
    unit_price: 0,
    currency: 'USD',
    incoterms: 'FOB',
    effective_date: '',
    expiry_date: '',
    delivery_deadline: '',
    late_delivery_penalty: 0,
    buyer_org_id: '',
    seller_org_id: ''
  });

  // Mock data for demo
  const mockContracts: Contract[] = [
    {
      id: '1',
      contract_number: 'CTR-20241201-abc12345',
      title: 'Cocoa Beans Export Agreement',
      description: 'Annual supply contract for premium cocoa beans from Ghana to Netherlands',
      status: 'active',
      category: 'agriculture',
      commodity: 'Cocoa Beans',
      quantity: 500,
      unit: 'tons',
      unit_price: 2800,
      total_value: 1400000,
      currency: 'USD',
      incoterms: 'FOB',
      effective_date: '2024-01-01',
      expiry_date: '2024-12-31',
      delivery_deadline: '2024-06-30',
      buyer_org_name: 'European Chocolate Co.',
      seller_org_name: 'Ghana Cocoa Board',
      buyer_signed_at: '2024-01-05T10:00:00Z',
      seller_signed_at: '2024-01-03T14:30:00Z',
      milestones_count: 5,
      completed_milestones: 3,
      created_at: '2024-01-01'
    },
    {
      id: '2',
      contract_number: 'CTR-20241115-def67890',
      title: 'Shea Butter Supply Contract',
      description: 'Organic shea butter supply for cosmetics manufacturing',
      status: 'pending_approval',
      category: 'agriculture',
      commodity: 'Shea Butter',
      quantity: 200,
      unit: 'tons',
      unit_price: 1500,
      total_value: 300000,
      currency: 'USD',
      incoterms: 'CIF',
      effective_date: '2024-02-01',
      expiry_date: '2024-08-31',
      delivery_deadline: '2024-04-30',
      buyer_org_name: 'L\'Oreal Africa',
      seller_org_name: 'Burkina Shea Cooperative',
      buyer_signed_at: null,
      seller_signed_at: '2024-01-20T09:00:00Z',
      milestones_count: 4,
      completed_milestones: 0,
      created_at: '2024-01-15'
    },
    {
      id: '3',
      contract_number: 'CTR-20241010-ghi11223',
      title: 'Coffee Export Agreement - Kenya',
      description: 'Premium Arabica coffee beans export to UAE',
      status: 'in_progress',
      category: 'agriculture',
      commodity: 'Coffee Beans',
      quantity: 100,
      unit: 'tons',
      unit_price: 4500,
      total_value: 450000,
      currency: 'USD',
      incoterms: 'FOB',
      effective_date: '2024-01-15',
      expiry_date: '2024-07-15',
      delivery_deadline: '2024-05-15',
      buyer_org_name: 'Dubai Coffee Trading',
      seller_org_name: 'Kenya Coffee Exporters',
      buyer_signed_at: '2024-01-18T11:00:00Z',
      seller_signed_at: '2024-01-16T16:00:00Z',
      milestones_count: 6,
      completed_milestones: 4,
      created_at: '2024-01-10'
    },
    {
      id: '4',
      contract_number: 'CTR-20240905-jkl44556',
      title: 'Textile Manufacturing Agreement',
      description: 'Cotton textile supply for garment manufacturing',
      status: 'completed',
      category: 'manufacturing',
      commodity: 'Cotton Textiles',
      quantity: 50000,
      unit: 'units',
      unit_price: 12,
      total_value: 600000,
      currency: 'USD',
      incoterms: 'DAP',
      effective_date: '2024-09-01',
      expiry_date: '2024-11-30',
      delivery_deadline: '2024-11-15',
      buyer_org_name: 'Ethiopian Garments Ltd',
      seller_org_name: 'Nigeria Textile Mills',
      buyer_signed_at: '2024-09-03T10:00:00Z',
      seller_signed_at: '2024-09-02T14:00:00Z',
      milestones_count: 4,
      completed_milestones: 4,
      created_at: '2024-09-01'
    },
    {
      id: '5',
      contract_number: 'CTR-20241120-mno77889',
      title: 'Cashew Nuts Export Contract',
      description: 'Raw cashew nuts for processing in India',
      status: 'disputed',
      category: 'agriculture',
      commodity: 'Cashew Nuts',
      quantity: 300,
      unit: 'tons',
      unit_price: 1200,
      total_value: 360000,
      currency: 'USD',
      incoterms: 'FOB',
      effective_date: '2024-11-01',
      expiry_date: '2025-04-30',
      delivery_deadline: '2025-02-28',
      buyer_org_name: 'Mumbai Cashew Processors',
      seller_org_name: 'Tanzania Cashew Board',
      buyer_signed_at: '2024-11-05T09:00:00Z',
      seller_signed_at: '2024-11-03T15:00:00Z',
      milestones_count: 5,
      completed_milestones: 2,
      created_at: '2024-11-01'
    }
  ];

  const mockMilestones: Milestone[] = [
    { id: '1', title: 'Advance Payment (30%)', description: 'Initial payment upon contract signing', milestone_type: 'payment', due_date: '2024-01-10', status: 'completed', payment_amount: 420000, payment_percentage: 30, completed_at: '2024-01-08T10:00:00Z' },
    { id: '2', title: 'Quality Inspection', description: 'Pre-shipment quality verification', milestone_type: 'inspection', due_date: '2024-03-15', status: 'completed', payment_amount: 0, payment_percentage: 0, completed_at: '2024-03-14T14:00:00Z' },
    { id: '3', title: 'Shipment Payment (50%)', description: 'Payment upon shipment confirmation', milestone_type: 'payment', due_date: '2024-04-01', status: 'completed', payment_amount: 700000, payment_percentage: 50, completed_at: '2024-03-30T16:00:00Z' },
    { id: '4', title: 'Customs Clearance', description: 'Export customs documentation and clearance', milestone_type: 'customs', due_date: '2024-04-15', status: 'in_progress', payment_amount: 0, payment_percentage: 0, completed_at: null },
    { id: '5', title: 'Final Payment (20%)', description: 'Payment upon delivery confirmation', milestone_type: 'payment', due_date: '2024-06-30', status: 'pending', payment_amount: 280000, payment_percentage: 20, completed_at: null }
  ];

  useEffect(() => {
    loadContracts();
    loadTemplates();
  }, [statusFilter]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('contracts')
        .select(`
          *,
          buyer_org:buyer_org_id(name),
          seller_org:seller_org_id(name)
        `)
        .order('created_at', { ascending: false });

      // Apply proper status filtering
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        setContracts(data.map((c: any) => ({
          ...c,
          buyer_org_name: c.buyer_org?.name,
          seller_org_name: c.seller_org?.name
        })));
      } else {
        const filteredMockContracts = statusFilter === 'all'
          ? mockContracts
          : mockContracts.filter(c => c.status === statusFilter);
        setContracts(filteredMockContracts);
      }
    } catch (e) {
      console.error('Failed to fetch contracts:', e);
      const filteredMockContracts = statusFilter === 'all'
        ? mockContracts
        : mockContracts.filter(c => c.status === statusFilter);
      setContracts(filteredMockContracts);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('is_public', true);

      if (error) throw error;

      if (data && data.length > 0) {
        setTemplates(data);
      } else {
        setTemplates([
          { id: '1', name: 'Standard Export Agreement', description: 'Basic export contract', category: 'export', terms_structure: [{ name: 'Advance', percentage: 30 }, { name: 'On Shipment', percentage: 50 }, { name: 'On Delivery', percentage: 20 }], usage_count: 156 },
          { id: '2', name: 'Agricultural Commodities Contract', description: 'For agricultural exports', category: 'agriculture', terms_structure: [{ name: 'LC', percentage: 100 }], usage_count: 89 },
          { id: '3', name: 'Manufacturing Supply Agreement', description: 'For manufactured goods', category: 'manufacturing', terms_structure: [{ name: 'Deposit', percentage: 20 }, { name: 'Production', percentage: 40 }, { name: 'Delivery', percentage: 40 }], usage_count: 67 }
        ]);
      }
    } catch (e) {
      console.error('Failed to fetch templates:', e);
    }
  };

  const loadMilestones = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contract_milestones')
        .select('*')
        .eq('contract_id', contractId)
        .order('sequence_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSelectedMilestones(data);
      } else {
        setSelectedMilestones(mockMilestones);
      }
    } catch (e) {
      console.error('Failed to fetch milestones:', e);
      setSelectedMilestones(mockMilestones);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: <Edit3 className="w-3 h-3" /> },
      pending_approval: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: <Clock className="w-3 h-3" /> },
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
      in_progress: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: <Loader2 className="w-3 h-3" /> },
      completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: <Check className="w-3 h-3" /> },
      disputed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: <AlertTriangle className="w-3 h-3" /> },
      cancelled: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', icon: <XCircle className="w-3 h-3" /> },
      expired: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: <AlertCircle className="w-3 h-3" /> }
    };
    const style = styles[status] || styles.draft;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {style.icon}
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'delivery': return <Truck className="w-4 h-4" />;
      case 'inspection': return <ClipboardList className="w-4 h-4" />;
      case 'documentation': return <FileText className="w-4 h-4" />;
      case 'customs': return <Scale className="w-4 h-4" />;
      default: return <Milestone className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  };

  const filteredContracts = contracts.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.contract_number.toLowerCase().includes(search.toLowerCase()) ||
    c.commodity?.toLowerCase().includes(search.toLowerCase()) ||
    c.buyer_org_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.seller_org_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active' || c.status === 'in_progress').length,
    pending: contracts.filter(c => c.status === 'pending_approval').length,
    completed: contracts.filter(c => c.status === 'completed').length,
    disputed: contracts.filter(c => c.status === 'disputed').length,
    totalValue: contracts.reduce((sum, c) => sum + (c.total_value || 0), 0)
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    loadMilestones(contract.id);
    setShowDetailModal(true);
    setActiveTab('overview');
  };

  const handleCreateContract = async () => {
    // Implementation for creating contract
    console.log('Creating contract:', formData);
    setShowCreateModal(false);
    setCreateStep(1);
    loadContracts();
  };

  const handleDownload = (format: 'pdf' | 'doc') => {
    if (!selectedContract) return;
    setIsProcessing(true);

    const contractContent = `
      CONTRACT AGREEMENT
      ==================

      Contract Number: ${selectedContract.contract_number}
      Title: ${selectedContract.title}

      PARTIES:
      Buyer: ${selectedContract.buyer_org_name}
      Seller: ${selectedContract.seller_org_name}

      TERMS:
      Commodity: ${selectedContract.commodity}
      Quantity: ${selectedContract.quantity} ${selectedContract.unit}
      Unit Price: ${formatCurrency(selectedContract.unit_price, selectedContract.currency)}
      Total Value: ${formatCurrency(selectedContract.total_value, selectedContract.currency)}
      Incoterms: ${selectedContract.incoterms}

      DATES:
      Effective Date: ${new Date(selectedContract.effective_date).toLocaleDateString()}
      Expiry Date: ${new Date(selectedContract.expiry_date).toLocaleDateString()}
      Delivery Deadline: ${new Date(selectedContract.delivery_deadline).toLocaleDateString()}

      DESCRIPTION:
      ${selectedContract.description}

      SIGNATURES:
      Buyer Signed: ${selectedContract.buyer_signed_at ? new Date(selectedContract.buyer_signed_at).toLocaleDateString() : 'Pending'}
      Seller Signed: ${selectedContract.seller_signed_at ? new Date(selectedContract.seller_signed_at).toLocaleDateString() : 'Pending'}
    `;

    // Create and download file
    const blob = new Blob([contractContent], { type: format === 'pdf' ? 'application/pdf' : 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedContract.contract_number}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsProcessing(false);
  };

  // Sign contract digitally
  const handleSign = async () => {
    if (!selectedContract || !signatureData.name || !signatureData.agreed) return;
    setIsProcessing(true);

    try {
      // In a real app, this would update the contract in the database
      const { data: { user } } = await supabase.auth.getUser();
      const signedAt = new Date().toISOString();

      // Simulate signing - update either buyer or seller signature
      const updateField = selectedContract.buyer_signed_at ? 'seller_signed_at' : 'buyer_signed_at';

      await supabase
        .from('contracts')
        .update({ [updateField]: signedAt })
        .eq('id', selectedContract.id);

      // Update local state
      setSelectedContract({
        ...selectedContract,
        [updateField]: signedAt
      });

      setShowSignModal(false);
      setSignatureData({ name: '', title: '', agreed: false });

      // Reload contracts
      loadContracts();
    } catch (e) {
      console.error('Failed to sign contract:', e);
      alert('Failed to sign contract. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Share contract
  const handleShare = async () => {
    if (!selectedContract || !shareData.email) return;
    setIsProcessing(true);

    try {
      if (shareData.method === 'email') {
        // Simulate sending email
        const subject = encodeURIComponent(`Contract: ${selectedContract.title}`);
        const body = encodeURIComponent(`
You have been invited to view the following contract:

Contract: ${selectedContract.title}
Contract Number: ${selectedContract.contract_number}
Value: ${formatCurrency(selectedContract.total_value, selectedContract.currency)}

Please log in to AfriTradeOS to view the full contract details.
        `);
        window.open(`mailto:${shareData.email}?subject=${subject}&body=${body}`);
      } else {
        // Platform sharing - would create a notification/invitation in the database
        alert(`Contract shared with ${shareData.email} on the platform. They will receive a notification.`);
      }

      setShowShareModal(false);
      setShareData({ email: '', method: 'email' });
    } catch (e) {
      console.error('Failed to share contract:', e);
      alert('Failed to share contract. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-trade-secondary" />
            Smart Contracts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, manage, and track legally compliant digital trade contracts
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Contract
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Contracts', value: stats.total, icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
          { label: 'Completed', value: stats.completed, icon: Check, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Disputed', value: stats.disputed, icon: AlertTriangle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
          { label: 'Total Value', value: formatCurrency(stats.totalValue, 'USD'), icon: DollarSign, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', isValue: true }
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className={`${stat.isValue ? 'text-lg' : 'text-2xl'} font-bold text-trade-primary dark:text-white`}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contracts by number, title, commodity, or party..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 focus:border-trade-primary outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'active', 'pending_approval', 'in_progress', 'completed', 'disputed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap capitalize ${
                statusFilter === status
                  ? 'bg-trade-primary text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-trade-primary" />
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No contracts found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-trade-primary hover:underline font-medium"
          >
            Create your first contract
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map(contract => (
            <div
              key={contract.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewContract(contract)}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {getStatusBadge(contract.status)}
                    <span className="text-xs text-gray-500 font-mono">{contract.contract_number}</span>
                    {contract.buyer_signed_at && contract.seller_signed_at && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <PenTool className="w-3 h-3" /> Fully Signed
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-trade-primary dark:text-white mb-2">
                    {contract.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {contract.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {contract.buyer_org_name} ↔ {contract.seller_org_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {contract.quantity} {contract.unit} {contract.commodity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(contract.delivery_deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Contract Value</p>
                    <p className="text-xl font-bold text-trade-success">
                      {formatCurrency(contract.total_value, contract.currency)}
                    </p>
                    <p className="text-xs text-gray-400">{contract.incoterms}</p>
                  </div>

                  {contract.milestones_count && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Milestones Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-trade-primary rounded-full transition-all"
                            style={{ width: `${(contract.completed_milestones || 0) / contract.milestones_count * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {contract.completed_milestones}/{contract.milestones_count}
                        </span>
                      </div>
                    </div>
                  )}

                  <button className="flex items-center gap-1 text-trade-primary hover:underline font-medium text-sm">
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contract Detail Modal */}
      {showDetailModal && selectedContract && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(selectedContract.status)}
                    <span className="text-sm text-gray-500 font-mono">{selectedContract.contract_number}</span>
                  </div>
                  <h2 className="text-xl font-bold text-trade-primary dark:text-white">
                    {selectedContract.title}
                  </h2>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 border-b border-gray-100 dark:border-slate-700 -mb-6 pb-0">
                {[
                  { key: 'overview', label: 'Overview', icon: Eye },
                  { key: 'milestones', label: 'Milestones', icon: Milestone },
                  { key: 'documents', label: 'Documents', icon: FileText },
                  { key: 'activity', label: 'Activity', icon: History }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-trade-primary text-trade-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Parties */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase mb-2">Buyer</p>
                      <p className="text-lg font-bold text-trade-primary dark:text-white">{selectedContract.buyer_org_name}</p>
                      {selectedContract.buyer_signed_at ? (
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3" />
                          Signed on {new Date(selectedContract.buyer_signed_at).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Pending signature
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase mb-2">Seller</p>
                      <p className="text-lg font-bold text-trade-primary dark:text-white">{selectedContract.seller_org_name}</p>
                      {selectedContract.seller_signed_at ? (
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3" />
                          Signed on {new Date(selectedContract.seller_signed_at).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Pending signature
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase">Commodity</p>
                      <p className="text-lg font-bold text-trade-primary dark:text-white">{selectedContract.commodity}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase">Quantity</p>
                      <p className="text-lg font-bold text-trade-primary dark:text-white">{selectedContract.quantity} {selectedContract.unit}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase">Unit Price</p>
                      <p className="text-lg font-bold text-trade-primary dark:text-white">{formatCurrency(selectedContract.unit_price, selectedContract.currency)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase">Total Value</p>
                      <p className="text-lg font-bold text-trade-success">{formatCurrency(selectedContract.total_value, selectedContract.currency)}</p>
                    </div>
                  </div>

                  {/* Dates & Terms */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase">Effective Date</p>
                      <p className="text-sm font-bold text-trade-primary dark:text-white">{new Date(selectedContract.effective_date).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase">Expiry Date</p>
                      <p className="text-sm font-bold text-trade-primary dark:text-white">{new Date(selectedContract.expiry_date).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase">Delivery Deadline</p>
                      <p className="text-sm font-bold text-trade-primary dark:text-white">{new Date(selectedContract.delivery_deadline).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase">Incoterms</p>
                      <p className="text-sm font-bold text-trade-primary dark:text-white">{selectedContract.incoterms}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedContract.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                    {(selectedContract.status === 'pending_approval' || selectedContract.status === 'active') && (
                      <button
                        onClick={() => setShowSignModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-xl transition-colors"
                      >
                        <PenTool className="w-4 h-4" />
                        Sign Contract
                      </button>
                    )}
                    <div className="relative group">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => handleDownload('pdf')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 w-full text-left"
                        >
                          <FileDown className="w-4 h-4" /> Download as PDF
                        </button>
                        <button
                          onClick={() => handleDownload('doc')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 w-full text-left"
                        >
                          <FileText className="w-4 h-4" /> Download as DOC
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    {selectedContract.status === 'active' && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-700 dark:text-red-400 font-medium rounded-xl transition-colors">
                        <AlertTriangle className="w-4 h-4" />
                        Raise Dispute
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'milestones' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase">Contract Milestones</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium text-trade-primary dark:text-white">
                        {selectedMilestones.filter(m => m.status === 'completed').length}
                      </span>
                      <span>/</span>
                      <span>{selectedMilestones.length} Completed</span>
                    </div>
                  </div>

                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-slate-700" />

                    {selectedMilestones.map((milestone, idx) => (
                      <div key={milestone.id} className="relative flex gap-4 pb-6">
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                          milestone.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                          milestone.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                          milestone.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                          'bg-gray-100 dark:bg-slate-700 text-gray-400'
                        }`}>
                          {milestone.status === 'completed' ? <Check className="w-5 h-5" /> : getMilestoneIcon(milestone.milestone_type)}
                        </div>

                        <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-trade-primary dark:text-white">{milestone.title}</h4>
                              <p className="text-sm text-gray-500">{milestone.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              milestone.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              milestone.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                              milestone.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                              'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {milestone.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due: {new Date(milestone.due_date).toLocaleDateString()}
                            </span>
                            {milestone.payment_amount > 0 && (
                              <span className="flex items-center gap-1 text-trade-success font-medium">
                                <DollarSign className="w-4 h-4" />
                                {formatCurrency(milestone.payment_amount, 'USD')} ({milestone.payment_percentage}%)
                              </span>
                            )}
                            {milestone.completed_at && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Completed: {new Date(milestone.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {milestone.status === 'in_progress' && (
                            <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-trade-primary hover:bg-trade-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
                              <Check className="w-4 h-4" />
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Contract documents will appear here</p>
                  <button className="text-trade-primary hover:underline font-medium">
                    Upload Document
                  </button>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Activity log will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-trade-primary dark:text-white">Create New Contract</h2>
                  <p className="text-sm text-gray-500">Step {createStep} of 3</p>
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); setCreateStep(1); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map(step => (
                  <React.Fragment key={step}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      createStep >= step ? 'bg-trade-primary text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'
                    }`}>
                      {createStep > step ? <Check className="w-4 h-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 rounded ${createStep > step ? 'bg-trade-primary' : 'bg-gray-200 dark:bg-slate-700'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {createStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Select Template</h3>
                  <div className="grid gap-4">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => setFormData({ ...formData, template_id: template.id, category: template.category })}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.template_id === template.id
                            ? 'border-trade-primary bg-trade-primary/5'
                            : 'border-gray-200 dark:border-slate-700 hover:border-trade-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-trade-primary dark:text-white">{template.name}</h4>
                            <p className="text-sm text-gray-500">{template.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span>Category: {template.category}</span>
                              <span>Used {template.usage_count} times</span>
                            </div>
                          </div>
                          {formData.template_id === template.id && (
                            <CheckCircle className="w-6 h-6 text-trade-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {createStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Contract Details</h3>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contract Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                      placeholder="e.g., Cocoa Beans Export Agreement"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                      placeholder="Describe the contract terms and conditions..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commodity</label>
                      <input
                        type="text"
                        value={formData.commodity}
                        onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                        placeholder="e.g., Cocoa Beans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">HS Code</label>
                      <input
                        type="text"
                        value={formData.hs_code}
                        onChange={(e) => setFormData({ ...formData, hs_code: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                        placeholder="e.g., 1801.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                      <input
                        type="number"
                        value={formData.quantity || ''}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                      >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Incoterms</label>
                      <select
                        value={formData.incoterms}
                        onChange={(e) => setFormData({ ...formData, incoterms: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                      >
                        {INCOTERMS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {createStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Pricing & Terms</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Price</label>
                      <input
                        type="number"
                        value={formData.unit_price || ''}
                        onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                      >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Value</label>
                      <p className="p-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-lg font-bold text-trade-success">
                        {formatCurrency(formData.quantity * formData.unit_price, formData.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Effective Date</label>
                      <input
                        type="date"
                        value={formData.effective_date}
                        onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Deadline</label>
                      <input
                        type="date"
                        value={formData.delivery_deadline}
                        onChange={(e) => setFormData({ ...formData, delivery_deadline: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Late Delivery Penalty (%)</label>
                    <input
                      type="number"
                      value={formData.late_delivery_penalty || ''}
                      onChange={(e) => setFormData({ ...formData, late_delivery_penalty: Number(e.target.value) })}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                      placeholder="e.g., 2"
                    />
                    <p className="text-xs text-gray-400 mt-1">Percentage of contract value per day of delay</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-between">
              <button
                onClick={() => createStep > 1 ? setCreateStep(createStep - 1) : setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {createStep > 1 ? 'Back' : 'Cancel'}
              </button>
              <button
                onClick={() => createStep < 3 ? setCreateStep(createStep + 1) : handleCreateContract()}
                disabled={createStep === 1 && !formData.template_id}
                className="px-6 py-2 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createStep < 3 ? (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <>Create Contract <Check className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Contract Modal */}
      {showSignModal && selectedContract && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-trade-primary dark:text-white">Digital Signature</h2>
                <button
                  onClick={() => setShowSignModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Contract:</strong> {selectedContract.title}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {selectedContract.contract_number}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={signatureData.name}
                  onChange={(e) => setSignatureData({ ...signatureData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-trade-primary focus:border-trade-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title / Position
                </label>
                <input
                  type="text"
                  value={signatureData.title}
                  onChange={(e) => setSignatureData({ ...signatureData, title: e.target.value })}
                  placeholder="e.g., Chief Executive Officer"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-trade-primary focus:border-trade-primary outline-none"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={signatureData.agreed}
                  onChange={(e) => setSignatureData({ ...signatureData, agreed: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-trade-primary focus:ring-trade-primary mt-0.5"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  I confirm that I have read and agree to all terms and conditions outlined in this contract.
                  This digital signature is legally binding and equivalent to a handwritten signature.
                </p>
              </div>

              <button
                onClick={handleSign}
                disabled={!signatureData.name || !signatureData.agreed || isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 bg-trade-primary hover:bg-trade-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Signing...</>
                ) : (
                  <><PenTool className="w-5 h-5" /> Sign Contract</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Contract Modal */}
      {showShareModal && selectedContract && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-trade-primary dark:text-white">Share Contract</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {selectedContract.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedContract.contract_number}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Share Method
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShareData({ ...shareData, method: 'email' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-colors ${
                      shareData.method === 'email'
                        ? 'border-trade-primary bg-trade-primary/5 text-trade-primary'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button
                    onClick={() => setShareData({ ...shareData, method: 'platform' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-colors ${
                      shareData.method === 'platform'
                        ? 'border-trade-primary bg-trade-primary/5 text-trade-primary'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Platform
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {shareData.method === 'email' ? 'Email Address' : 'Username or Email'}
                </label>
                <input
                  type="email"
                  value={shareData.email}
                  onChange={(e) => setShareData({ ...shareData, email: e.target.value })}
                  placeholder={shareData.method === 'email' ? 'recipient@company.com' : 'Search user...'}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-trade-primary focus:border-trade-primary outline-none"
                />
              </div>

              <button
                onClick={handleShare}
                disabled={!shareData.email || isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 bg-trade-primary hover:bg-trade-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-5 h-5" /> {shareData.method === 'email' ? 'Send Email' : 'Share on Platform'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
