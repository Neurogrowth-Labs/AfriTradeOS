import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Clock,
  MapPin,
  FileText,
  Users,
  Eye,
  ChevronRight,
  Package,
  XCircle,
  Loader2,
  Building,
  Send,
  Award,
  Filter,
  SlidersHorizontal,
  Zap,
  CheckCircle,
  DollarSign,
  Globe,
  Calendar,
  X
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  delivery_location: string;
  submission_deadline: string;
  status: 'draft' | 'published' | 'closed' | 'awarded' | 'cancelled';
  bids_count: number;
  views_count: number;
  organization_name?: string;
  created_at: string;
}

interface TenderManagementProps {
  mode?: 'browse' | 'manage';
}

// B7: Bid submission templates
const BID_TEMPLATES = [
  { id: 'bt1', name: 'Standard Supply Bid', description: 'Basic template for commodity supply', fields: ['price_per_unit', 'delivery_date', 'payment_terms'] },
  { id: 'bt2', name: 'Premium Quality Bid', description: 'Includes quality certifications', fields: ['price_per_unit', 'delivery_date', 'payment_terms', 'certifications', 'samples'] },
  { id: 'bt3', name: 'Bulk Discount Bid', description: 'Volume-based pricing tiers', fields: ['price_per_unit', 'volume_tiers', 'delivery_date', 'payment_terms'] },
];

export const TenderManagement: React.FC<TenderManagementProps> = ({ mode = 'browse' }) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [, setShowCreateModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  // B6: Smart filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterMinBudget, setFilterMinBudget] = useState('');
  const [filterMaxBudget, setFilterMaxBudget] = useState('');
  const [filterDeadline, setFilterDeadline] = useState('');
  // B7: Bid template state
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(BID_TEMPLATES[0]);
  const [bidData, setBidData] = useState({ price: '', delivery: '', terms: 'Net 30', notes: '' });


  useEffect(() => {
    const loadTenders = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('tenders')
          .select('*, organizations(name)')
          .order('created_at', { ascending: false });

        if (statusFilter === 'closing_soon') {
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
          query = query
            .eq('status', 'published')
            .lte('submission_deadline', sevenDaysFromNow.toISOString())
            .gte('submission_deadline', new Date().toISOString());
        } else if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) throw error;

        setTenders((data || []).map((t: Tender & { organizations?: { name: string } }) => ({
          ...t,
          organization_name: t.organizations?.name
        })));
      } catch (e) {
        console.error('Failed to fetch tenders:', e);
        setTenders([]);
      } finally {
        setLoading(false);
      }
    };
    loadTenders();
  }, [statusFilter]);


  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600',
      published: 'bg-green-100 text-green-700',
      closed: 'bg-orange-100 text-orange-700',
      awarded: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${styles[status] || styles.draft}`}>
        {status}
      </span>
    );
  };

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Closed';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const formatBudget = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const filteredTenders = tenders.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.organization_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-trade-secondary" />
            {mode === 'manage' ? 'My Tenders' : 'Tender Opportunities'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'manage' ? 'Manage your procurement requests' : 'Browse and bid on procurement opportunities'}
          </p>
        </div>
        {mode === 'manage' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Tender
          </button>
        )}
      </div>

      {/* B6: SMART SEARCH FILTERS */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, country, organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-trade-primary dark:text-white focus:ring-2 focus:ring-trade-primary/20 focus:border-trade-primary outline-none"
            />
          </div>
          <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              showAdvancedFilters ? 'bg-trade-primary text-white border-trade-primary' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-trade-primary'
            }`}>
            <SlidersHorizontal className="w-4 h-4" /> Advanced Filters
          </button>
          <div className="flex gap-2 flex-wrap">
            {['all', 'published', 'closing_soon', 'closed', 'awarded'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                  statusFilter === status
                    ? 'bg-trade-primary text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {status === 'all' ? 'All' : status === 'closing_soon' ? 'Closing Soon' : status}
              </button>
            ))}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block flex items-center gap-1"><Globe className="w-3 h-3" /> Country</label>
              <input type="text" placeholder="e.g. Nigeria" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:border-trade-primary" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block flex items-center gap-1"><DollarSign className="w-3 h-3" /> Min Budget</label>
              <input type="number" placeholder="0" value={filterMinBudget} onChange={e => setFilterMinBudget(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:border-trade-primary" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block flex items-center gap-1"><DollarSign className="w-3 h-3" /> Max Budget</label>
              <input type="number" placeholder="1000000" value={filterMaxBudget} onChange={e => setFilterMaxBudget(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:border-trade-primary" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block flex items-center gap-1"><Calendar className="w-3 h-3" /> Deadline Before</label>
              <input type="date" value={filterDeadline} onChange={e => setFilterDeadline(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:border-trade-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Tenders', value: tenders.filter(t => t.status === 'published').length, icon: FileText, color: 'text-blue-600 bg-blue-100' },
          { label: 'Total Bids', value: tenders.reduce((sum, t) => sum + t.bids_count, 0), icon: Send, color: 'text-green-600 bg-green-100' },
          { label: 'Awarded', value: tenders.filter(t => t.status === 'awarded').length, icon: Award, color: 'text-purple-600 bg-purple-100' },
          { label: 'Closing Soon', value: tenders.filter(t => t.status === 'published' && getDaysRemaining(t.submission_deadline).includes('day')).length, icon: Clock, color: 'text-orange-600 bg-orange-100' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-trade-primary dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tender List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-trade-primary" />
        </div>
      ) : filteredTenders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tenders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTenders.map(tender => (
            <div
              key={tender.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTender(tender)}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(tender.status)}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getDaysRemaining(tender.submission_deadline)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-trade-primary dark:text-white mb-2">
                    {tender.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {tender.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {tender.organization_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {tender.quantity} {tender.unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tender.delivery_location}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Budget</p>
                    <p className="text-lg font-bold text-trade-success">
                      {formatBudget(tender.budget_min, tender.budget_max, tender.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {tender.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tender.bids_count} bids
                    </span>
                  </div>
                  <button className="flex items-center gap-1 text-trade-primary hover:underline font-medium">
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tender Detail Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(selectedTender.status)}
                    <span className="text-sm text-gray-500">
                      Posted {new Date(selectedTender.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-trade-primary dark:text-white">
                    {selectedTender.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">by {selectedTender.organization_name}</p>
                </div>
                <button
                  onClick={() => setSelectedTender(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedTender.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase">Quantity</p>
                  <p className="text-lg font-bold text-trade-primary dark:text-white">
                    {selectedTender.quantity} {selectedTender.unit}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase">Budget Range</p>
                  <p className="text-lg font-bold text-trade-success">
                    {formatBudget(selectedTender.budget_min, selectedTender.budget_max, selectedTender.currency)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase">Delivery Location</p>
                  <p className="text-lg font-bold text-trade-primary dark:text-white">
                    {selectedTender.delivery_location}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase">Deadline</p>
                  <p className="text-lg font-bold text-trade-primary dark:text-white">
                    {new Date(selectedTender.submission_deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedTender.status === 'published' && (
                <button onClick={() => { setSelectedTender(null); setShowBidModal(true); }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-xl transition-colors">
                  <Zap className="w-5 h-5" />
                  Quick Bid with Template
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B7: ONE-CLICK BID SUBMISSION MODAL */}
      {showBidModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-trade-primary dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> Quick Bid Submission
                </h2>
                <p className="text-sm text-gray-500 mt-1">Select a template and fill in key details</p>
              </div>
              <button onClick={() => setShowBidModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Template Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Choose Template</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {BID_TEMPLATES.map(tpl => (
                    <button key={tpl.id} onClick={() => setSelectedTemplate(tpl)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedTemplate.id === tpl.id ? 'border-trade-primary bg-trade-primary/5' : 'border-gray-200 dark:border-slate-700 hover:border-trade-primary/50'
                      }`}>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{tpl.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">{tpl.description}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {tpl.fields.slice(0, 3).map(f => (
                          <span key={f} className="text-[9px] bg-gray-100 dark:bg-slate-700 text-gray-500 px-1.5 py-0.5 rounded">{f.replace('_', ' ')}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bid Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Price per Unit (USD)</label>
                  <input type="number" value={bidData.price} onChange={e => setBidData(p => ({ ...p, price: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:border-trade-primary" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Delivery Date</label>
                  <input type="date" value={bidData.delivery} onChange={e => setBidData(p => ({ ...p, delivery: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:border-trade-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Payment Terms</label>
                  <select value={bidData.terms} onChange={e => setBidData(p => ({ ...p, terms: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none">
                    {['Net 30', 'Net 60', 'Letter of Credit', 'Cash Against Documents', 'Advance Payment'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Notes</label>
                  <input type="text" value={bidData.notes} onChange={e => setBidData(p => ({ ...p, notes: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="Optional notes..." />
                </div>
              </div>

              <button onClick={() => { alert('Bid submitted successfully!'); setShowBidModal(false); setBidData({ price: '', delivery: '', terms: 'Net 30', notes: '' }); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-xl transition-colors">
                <Send className="w-5 h-5" /> Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
