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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

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
  buyer_org_name: string;
  seller_org_name: string;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'documents' | 'activity' | 'versions' | 'analytics'>('overview');
  const [createStep, setCreateStep] = useState(1);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [signatureData, setSignatureData] = useState({ name: '', title: '', agreed: false });
  const [shareData, setShareData] = useState({ email: '', method: 'email' as 'email' | 'platform' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);

  const defaultFormData: ContractFormData = {
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
    seller_org_id: '',
    buyer_org_name: '',
    seller_org_name: ''
  };
  const [formData, setFormData] = useState<ContractFormData>(defaultFormData);

  // B8: Version history mock data
  const mockVersions = [
    { id: 'v4', version: '4.0', date: '2024-03-15', author: 'System', changes: 'Payment milestone #3 completed', type: 'auto' as const },
    { id: 'v3', version: '3.0', date: '2024-02-20', author: 'Jane Doe', changes: 'Updated delivery deadline from April 15 to April 30', type: 'amendment' as const },
    { id: 'v2', version: '2.0', date: '2024-01-15', author: 'John Smith', changes: 'Added late delivery penalty clause (2%/day)', type: 'amendment' as const },
    { id: 'v1', version: '1.0', date: '2024-01-03', author: 'System', changes: 'Contract created and signed by both parties', type: 'creation' as const },
  ];

  // B9: Performance analytics data
  const performanceData = [
    { metric: 'On-Time Delivery', value: 78 },
    { metric: 'Payment Compliance', value: 92 },
    { metric: 'Quality Score', value: 85 },
    { metric: 'Dispute Rate', value: 12 },
  ];
  const contractValueTrend = [
    { month: 'Jul', value: 280000 },
    { month: 'Aug', value: 350000 },
    { month: 'Sep', value: 420000 },
    { month: 'Oct', value: 510000 },
    { month: 'Nov', value: 480000 },
    { month: 'Dec', value: 620000 },
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

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setContracts((data || []).map((c: any) => ({
        ...c,
        buyer_org_name: c.buyer_org?.name || c.metadata?.buyer_org_name || '',
        seller_org_name: c.seller_org?.name || c.metadata?.seller_org_name || ''
      })));
    } catch (e) {
      console.error('Failed to fetch contracts:', e);
      setContracts([]);
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
          { id: '3', name: 'Manufacturing Supply Agreement', description: 'For manufactured goods', category: 'manufacturing', terms_structure: [{ name: 'Deposit', percentage: 20 }, { name: 'Production', percentage: 40 }, { name: 'Delivery', percentage: 40 }], usage_count: 67 },
          { id: '4', name: 'Import Purchase Agreement', description: 'Standard import contract with AfCFTA preferential terms', category: 'import', terms_structure: [{ name: 'LC at Sight', percentage: 70 }, { name: 'On Delivery', percentage: 30 }], usage_count: 112 },
          { id: '5', name: 'Supplier Framework Agreement', description: 'Long-term supplier contract with AfCFTA clause library', category: 'import', terms_structure: [{ name: 'Quarterly', percentage: 25 }, { name: 'Quarterly', percentage: 25 }, { name: 'Quarterly', percentage: 25 }, { name: 'Quarterly', percentage: 25 }], usage_count: 78 },
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

      setSelectedMilestones(data || []);
    } catch (e) {
      console.error('Failed to fetch milestones:', e);
      setSelectedMilestones([]);
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

  const statusDistribution = [
    { name: 'Active', value: stats.active, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Completed', value: stats.completed, color: '#3b82f6' },
    { name: 'Disputed', value: stats.disputed, color: '#ef4444' },
  ];

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    loadMilestones(contract.id);
    setShowDetailModal(true);
    setActiveTab('overview');
  };

  const handleCreateContract = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const totalValue = formData.quantity * formData.unit_price;
      const payload = {
        title: formData.title,
        description: formData.description,
        template_id: formData.template_id || null,
        category: formData.category,
        commodity: formData.commodity,
        hs_code: formData.hs_code || null,
        quantity: formData.quantity,
        unit: formData.unit,
        unit_price: formData.unit_price,
        total_value: totalValue,
        currency: formData.currency,
        incoterms: formData.incoterms,
        effective_date: formData.effective_date || null,
        expiry_date: formData.expiry_date || null,
        delivery_deadline: formData.delivery_deadline || null,
        late_delivery_penalty: formData.late_delivery_penalty || 0,
        status: 'draft' as const,
        created_by: user.id,
        seller_user_id: user.id,
        metadata: {
          buyer_org_name: formData.buyer_org_name,
          seller_org_name: formData.seller_org_name
        }
      };

      const { error } = await supabase.from('contracts').insert(payload);
      if (error) throw error;

      setShowCreateModal(false);
      setCreateStep(1);
      setFormData(defaultFormData);
      setIsEditMode(false);
      setEditingContractId(null);
      await loadContracts();
    } catch (e: any) {
      console.error('Failed to create contract:', e);
      alert('Failed to create contract: ' + (e.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditContract = (contract: Contract) => {
    setIsEditMode(true);
    setEditingContractId(contract.id);
    setFormData({
      title: contract.title || '',
      description: contract.description || '',
      template_id: '',
      category: contract.category || '',
      commodity: contract.commodity || '',
      hs_code: '',
      quantity: contract.quantity || 0,
      unit: contract.unit || 'tons',
      unit_price: contract.unit_price || 0,
      currency: contract.currency || 'USD',
      incoterms: contract.incoterms || 'FOB',
      effective_date: contract.effective_date || '',
      expiry_date: contract.expiry_date || '',
      delivery_deadline: contract.delivery_deadline || '',
      late_delivery_penalty: 0,
      buyer_org_id: '',
      seller_org_id: '',
      buyer_org_name: contract.buyer_org_name || '',
      seller_org_name: contract.seller_org_name || ''
    });
    setCreateStep(2);
    setShowDetailModal(false);
    setShowCreateModal(true);
  };

  const handleUpdateContract = async () => {
    if (!editingContractId) return;
    setIsProcessing(true);
    try {
      const totalValue = formData.quantity * formData.unit_price;
      const updates = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        commodity: formData.commodity,
        hs_code: formData.hs_code || null,
        quantity: formData.quantity,
        unit: formData.unit,
        unit_price: formData.unit_price,
        total_value: totalValue,
        currency: formData.currency,
        incoterms: formData.incoterms,
        effective_date: formData.effective_date || null,
        expiry_date: formData.expiry_date || null,
        delivery_deadline: formData.delivery_deadline || null,
        late_delivery_penalty: formData.late_delivery_penalty || 0,
        metadata: {
          buyer_org_name: formData.buyer_org_name,
          seller_org_name: formData.seller_org_name
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('id', editingContractId);

      if (error) throw error;

      setShowCreateModal(false);
      setCreateStep(1);
      setFormData(defaultFormData);
      setIsEditMode(false);
      setEditingContractId(null);
      await loadContracts();
    } catch (e: any) {
      console.error('Failed to update contract:', e);
      alert('Failed to update contract: ' + (e.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTerminateContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to terminate this contract? This action cannot be undone.')) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', contractId);

      if (error) throw error;

      setShowDetailModal(false);
      setSelectedContract(null);
      await loadContracts();
    } catch (e: any) {
      console.error('Failed to terminate contract:', e);
      alert('Failed to terminate contract: ' + (e.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
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
            Digital signing, AfCFTA clause library, version control & contract alerts
          </p>
        </div>
        <button
          onClick={() => { setIsEditMode(false); setEditingContractId(null); setFormData(defaultFormData); setCreateStep(1); setShowCreateModal(true); }}
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
                  { key: 'versions', label: 'Versions', icon: History },
                  { key: 'analytics', label: 'Analytics', icon: ClipboardList },
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
                    {(selectedContract.status === 'draft' || selectedContract.status === 'pending_approval' || selectedContract.status === 'active' || selectedContract.status === 'in_progress') && (
                      <button
                        onClick={() => handleEditContract(selectedContract)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 text-amber-700 dark:text-amber-400 font-medium rounded-xl transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Contract
                      </button>
                    )}
                    {selectedContract.status !== 'cancelled' && selectedContract.status !== 'completed' && (
                      <button
                        onClick={() => handleTerminateContract(selectedContract.id)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-700 dark:text-red-400 font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Terminate
                      </button>
                    )}
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

              {/* B8: VERSION CONTROL */}
              {activeTab === 'versions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase">Version History</h3>
                    <span className="text-xs text-gray-400">Current: v{mockVersions[0].version}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-slate-700" />
                    {mockVersions.map((ver) => (
                      <div key={ver.id} className="relative flex gap-4 pb-5">
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold ${
                          ver.type === 'creation' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                          ver.type === 'amendment' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                          'bg-gray-100 dark:bg-slate-700 text-gray-500'
                        }`}>
                          v{ver.version}
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold text-trade-primary dark:text-white text-sm">{ver.changes}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              ver.type === 'creation' ? 'bg-green-100 text-green-700' :
                              ver.type === 'amendment' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{ver.type}</span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>By: {ver.author}</span>
                            <span>{new Date(ver.date).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button className="text-xs text-trade-primary hover:underline font-medium">View Diff</button>
                            {ver.type === 'amendment' && <button className="text-xs text-gray-500 hover:underline">Revert</button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* B9: PERFORMANCE ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">Contract Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {performanceData.map(p => (
                      <div key={p.metric} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <div className="relative w-16 h-16 mx-auto mb-2">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-slate-700" />
                            <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" fill="none"
                              strokeDasharray={163} strokeDashoffset={163 - (163 * p.value) / 100}
                              className={`transition-all duration-700 ${p.value >= 70 ? 'text-green-500' : p.value >= 40 ? 'text-amber-500' : 'text-red-500'}`} />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-trade-primary dark:text-white">{p.value}%</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{p.metric}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-trade-primary dark:text-white mb-3">Contract Value Trend</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={contractValueTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="rgba(59,130,246,0.15)" strokeWidth={2} name="Value" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-trade-primary dark:text-white mb-3">Status Distribution</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                            {statusDistribution.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      {statusDistribution.map(s => (
                        <span key={s.name} className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} /> {s.name} ({s.value})
                        </span>
                      ))}
                    </div>
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
                  <h2 className="text-xl font-bold text-trade-primary dark:text-white">{isEditMode ? 'Edit Contract' : 'Create New Contract'}</h2>
                  <p className="text-sm text-gray-500">{isEditMode ? 'Update contract details' : `Step ${createStep} of 3`}</p>
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); setCreateStep(1); setIsEditMode(false); setEditingContractId(null); setFormData(defaultFormData); }}
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
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buyer (Company / Organization)</label>
                      <input
                        type="text"
                        value={formData.buyer_org_name}
                        onChange={(e) => setFormData({ ...formData, buyer_org_name: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                        placeholder="e.g., European Chocolate Co."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seller (Company / Organization)</label>
                      <input
                        type="text"
                        value={formData.seller_org_name}
                        onChange={(e) => setFormData({ ...formData, seller_org_name: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 outline-none"
                        placeholder="e.g., Ghana Cocoa Board"
                      />
                    </div>
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
                onClick={() => {
                  if (isEditMode && createStep === 2) {
                    setShowCreateModal(false); setIsEditMode(false); setEditingContractId(null); setFormData(defaultFormData);
                  } else if (createStep > 1) {
                    setCreateStep(createStep - 1);
                  } else {
                    setShowCreateModal(false); setIsEditMode(false); setEditingContractId(null); setFormData(defaultFormData);
                  }
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {isEditMode && createStep === 2 ? 'Cancel' : createStep > 1 ? 'Back' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (isEditMode) {
                    if (createStep < 3) setCreateStep(createStep + 1);
                    else handleUpdateContract();
                  } else {
                    if (createStep < 3) setCreateStep(createStep + 1);
                    else handleCreateContract();
                  }
                }}
                disabled={(createStep === 1 && !isEditMode && !formData.template_id) || isProcessing}
                className="px-6 py-2 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : createStep < 3 ? (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                ) : isEditMode ? (
                  <>Update Contract <Check className="w-4 h-4" /></>
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
