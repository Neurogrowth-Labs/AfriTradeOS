
import React, { useState } from 'react';
import {
  FileText,
  Clock,
  MapPin,
  Users,
  Eye,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  Search,
  ChevronRight,
  BarChart3,
  BrainCircuit,
  MessageSquare,
  UserPlus,
  Send,
  Paperclip,
  FolderOpen,
  Calendar,
  CheckSquare,
  Plus,
  MoreVertical,
  Edit3,
  Trash2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// --- TYPES ---
interface AnalystTender {
  id: string;
  title: string;
  organization: string;
  category: string;
  country: string;
  budget: string;
  deadline: string;
  daysLeft: number;
  status: 'open' | 'closing_soon' | 'closed' | 'awarded';
  bids: number;
  views: number;
  eligibility: 'eligible' | 'partial' | 'ineligible';
  bidProbability: number;
  type: 'government' | 'private';
  summary?: string;
}

// --- DATA ---
const TENDERS: AnalystTender[] = [
  { id: 't1', title: 'Supply of Agricultural Inputs — Fertilizer & Seeds', organization: 'Ministry of Agriculture, Kenya', category: 'Agriculture', country: 'Kenya', budget: '$2.4M–$3.1M', deadline: '2025-03-15', daysLeft: 31, status: 'open', bids: 12, views: 234, eligibility: 'eligible', bidProbability: 78, type: 'government', summary: 'Procurement of 50,000MT NPK fertilizer and improved seed varieties for 2025 planting season across 12 counties.' },
  { id: 't2', title: 'Cocoa Bean Procurement — Q2 2025 Batch', organization: 'Nestlé West Africa', category: 'Agriculture', country: 'Ghana', budget: '$5.0M–$8.0M', deadline: '2025-02-28', daysLeft: 16, status: 'closing_soon', bids: 8, views: 189, eligibility: 'eligible', bidProbability: 85, type: 'private', summary: 'Bulk procurement of Grade A cocoa beans. Must meet EU quality standards and Fair Trade certification.' },
  { id: 't3', title: 'Port Terminal Equipment Upgrade — Tema Port', organization: 'Ghana Ports Authority', category: 'Infrastructure', country: 'Ghana', budget: '$12M–$18M', deadline: '2025-04-01', daysLeft: 48, status: 'open', bids: 4, views: 156, eligibility: 'partial', bidProbability: 42, type: 'government', summary: 'Supply and installation of 4 STS gantry cranes and RTG equipment for Container Terminal 3 expansion.' },
  { id: 't4', title: 'Medical Supplies Distribution Network', organization: 'UNICEF — East Africa', category: 'Healthcare', country: 'Regional', budget: '$1.8M–$2.5M', deadline: '2025-03-10', daysLeft: 26, status: 'open', bids: 18, views: 445, eligibility: 'eligible', bidProbability: 65, type: 'government', summary: 'Last-mile distribution of essential medicines and medical supplies across Kenya, Uganda, and Tanzania.' },
  { id: 't5', title: 'Solar Panel Supply for Rural Electrification', organization: 'Nigerian Rural Electrification Agency', category: 'Energy', country: 'Nigeria', budget: '$8M–$12M', deadline: '2025-02-20', daysLeft: 8, status: 'closing_soon', bids: 22, views: 567, eligibility: 'ineligible', bidProbability: 15, type: 'government', summary: 'Supply of 50MW solar panel systems for off-grid electrification of 200 rural communities.' },
  { id: 't6', title: 'Cotton Yarn Bulk Purchase — Textile Mills', organization: 'Thies Textile SA', category: 'Textiles', country: 'Senegal', budget: '$800K–$1.2M', deadline: '2025-03-20', daysLeft: 36, status: 'open', bids: 6, views: 98, eligibility: 'eligible', bidProbability: 72, type: 'private', summary: 'Annual contract for cotton yarn supply (Ring-spun, 30/1 and 40/1 count). AfCFTA-origin preferred.' },
  { id: 't7', title: 'Road Construction — Trans-Saharan Highway Section', organization: 'African Development Bank', category: 'Infrastructure', country: 'Regional', budget: '$45M–$60M', deadline: '2025-05-01', daysLeft: 78, status: 'open', bids: 3, views: 312, eligibility: 'partial', bidProbability: 28, type: 'government' },
  { id: 't8', title: 'Cement Supply for Housing Development', organization: 'Rwanda Housing Authority', category: 'Construction', country: 'Rwanda', budget: '$3.5M–$5M', deadline: '2025-03-25', daysLeft: 41, status: 'open', bids: 9, views: 178, eligibility: 'eligible', bidProbability: 68, type: 'government', summary: 'Supply of 100,000MT Portland cement for national affordable housing program Phase III.' },
];

const CATEGORY_STATS = [
  { category: 'Agriculture', count: 2, value: 13.5 },
  { category: 'Infrastructure', count: 2, value: 78 },
  { category: 'Healthcare', count: 1, value: 2.5 },
  { category: 'Energy', count: 1, value: 12 },
  { category: 'Textiles', count: 1, value: 1.2 },
  { category: 'Construction', count: 1, value: 5 },
];

// Collaboration Workspace Data
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
}

interface CollabNote {
  id: string;
  tenderId: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'note' | 'task' | 'comment';
  completed?: boolean;
}

interface CollabMessage {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  tenderId?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm1', name: 'Amara Okonkwo', role: 'Lead Analyst', avatar: 'AO', status: 'online' },
  { id: 'tm2', name: 'Kwame Asante', role: 'Bid Manager', avatar: 'KA', status: 'online' },
  { id: 'tm3', name: 'Fatima Hassan', role: 'Compliance Officer', avatar: 'FH', status: 'away' },
  { id: 'tm4', name: 'David Mwangi', role: 'Finance Analyst', avatar: 'DM', status: 'offline' },
  { id: 'tm5', name: 'Sarah Mensah', role: 'Legal Counsel', avatar: 'SM', status: 'online' },
];

const COLLAB_NOTES: CollabNote[] = [
  { id: 'cn1', tenderId: 't1', author: 'Amara Okonkwo', content: 'Verified supplier certifications - all requirements met for Kenya tender', timestamp: '2 hours ago', type: 'note' },
  { id: 'cn2', tenderId: 't2', author: 'Kwame Asante', content: 'Prepare pricing proposal by Feb 25', timestamp: '4 hours ago', type: 'task', completed: false },
  { id: 'cn3', tenderId: 't1', author: 'Fatima Hassan', content: 'AfCFTA Rules of Origin documentation complete', timestamp: '1 day ago', type: 'note' },
  { id: 'cn4', tenderId: 't3', author: 'David Mwangi', content: 'Review financial projections for port equipment bid', timestamp: '1 day ago', type: 'task', completed: true },
  { id: 'cn5', tenderId: 't2', author: 'Sarah Mensah', content: 'Contract terms reviewed - recommend negotiation on payment terms', timestamp: '2 days ago', type: 'comment' },
];

const COLLAB_MESSAGES: CollabMessage[] = [
  { id: 'cm1', author: 'Amara Okonkwo', avatar: 'AO', content: 'Team, the Kenya Agriculture tender deadline is approaching. Let\'s sync on final pricing.', timestamp: '10:30 AM', tenderId: 't1' },
  { id: 'cm2', author: 'Kwame Asante', avatar: 'KA', content: 'I\'ve updated the bid document with the latest cost estimates. Ready for review.', timestamp: '10:45 AM', tenderId: 't1' },
  { id: 'cm3', author: 'Fatima Hassan', avatar: 'FH', content: 'Compliance check complete for Cocoa tender. All certifications verified.', timestamp: '11:00 AM', tenderId: 't2' },
  { id: 'cm4', author: 'Sarah Mensah', avatar: 'SM', content: 'Legal review done. Recommend we proceed with the Ghana Ports tender.', timestamp: '11:15 AM', tenderId: 't3' },
];

export const AnalystTenderAnalysis: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
  const [selectedTender, setSelectedTender] = useState<AnalystTender | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'analytics' | 'matched' | 'workspace'>('feed');
  const [workspaceTab, setWorkspaceTab] = useState<'chat' | 'notes' | 'tasks'>('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [notes, setNotes] = useState(COLLAB_NOTES);
  const [messages, setMessages] = useState(COLLAB_MESSAGES);
  const [newNote, setNewNote] = useState('');

  const filtered = TENDERS.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesEligibility = eligibilityFilter === 'all' || t.eligibility === eligibilityFilter;
    return matchesSearch && matchesStatus && matchesEligibility;
  });

  const matchedTenders = TENDERS.filter(t => t.eligibility === 'eligible').sort((a, b) => b.bidProbability - a.bidProbability);

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-trade-primary dark:text-white">Tender Analysis</h2>
              <p className="text-[10px] text-gray-500">Live tender feed • Eligibility checker • Bid probability • AI summaries • Collaboration</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              placeholder="Search tenders, organizations..." />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'feed' as const, label: 'Tender Feed', icon: FileText },
            { id: 'matched' as const, label: 'AI Matched', icon: Zap },
            { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
            { id: 'workspace' as const, label: 'Collaboration', icon: Users },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-rose-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TENDER FEED */}
      {activeTab === 'feed' && (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1 bg-gray-50 dark:bg-slate-700 rounded-lg p-0.5">
              {['all', 'open', 'closing_soon', 'closed'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${
                    statusFilter === s ? 'bg-white dark:bg-slate-600 text-trade-primary dark:text-white shadow-sm' : 'text-gray-500'
                  }`}>
                  {s === 'all' ? 'All' : s.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gray-50 dark:bg-slate-700 rounded-lg p-0.5">
              {['all', 'eligible', 'partial', 'ineligible'].map(e => (
                <button key={e} onClick={() => setEligibilityFilter(e)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${
                    eligibilityFilter === e ? 'bg-white dark:bg-slate-600 text-trade-primary dark:text-white shadow-sm' : 'text-gray-500'
                  }`}>
                  {e === 'all' ? 'All Eligibility' : e}
                </button>
              ))}
            </div>
          </div>

          {/* Tender Cards */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
            <div className={`${selectedTender ? 'lg:col-span-7' : 'lg:col-span-12'} overflow-y-auto space-y-3`}>
              {filtered.map(tender => (
                <div key={tender.id}
                  onClick={() => setSelectedTender(tender)}
                  className={`bg-white dark:bg-slate-800 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTender?.id === tender.id ? 'border-rose-400 ring-1 ring-rose-200' : 'border-gray-100 dark:border-slate-700'
                  }`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          tender.type === 'government' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>{tender.type === 'government' ? 'GOV' : 'PRIVATE'}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          tender.status === 'open' ? 'bg-green-100 text-green-700' :
                          tender.status === 'closing_soon' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>{tender.status.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{tender.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{tender.organization}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-trade-primary dark:text-white">{tender.budget}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className={`text-[10px] font-bold ${tender.daysLeft <= 7 ? 'text-red-600' : tender.daysLeft <= 14 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {tender.daysLeft}d left
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {tender.country}</span>
                      <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {tender.bids} bids</span>
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {tender.views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tender.eligibility === 'eligible' ? 'bg-green-100 text-green-700' :
                        tender.eligibility === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tender.eligibility === 'eligible' ? <CheckCircle className="w-3 h-3 inline mr-0.5" /> :
                         tender.eligibility === 'partial' ? <AlertTriangle className="w-3 h-3 inline mr-0.5" /> :
                         <XCircle className="w-3 h-3 inline mr-0.5" />}
                        {tender.eligibility}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        tender.bidProbability >= 70 ? 'bg-green-50 text-green-700' :
                        tender.bidProbability >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {tender.bidProbability}% win
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail Panel */}
            {selectedTender && (
              <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-y-auto p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    selectedTender.type === 'government' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>{selectedTender.type === 'government' ? 'Government Tender' : 'Private RFQ'}</span>
                  <button onClick={() => setSelectedTender(null)} className="text-gray-400 hover:text-gray-600">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{selectedTender.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{selectedTender.organization}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <p className="text-[9px] text-gray-400">Budget</p>
                    <p className="text-sm font-black text-trade-primary dark:text-white">{selectedTender.budget}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <p className="text-[9px] text-gray-400">Deadline</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{selectedTender.deadline}</p>
                    <p className={`text-[9px] font-bold ${selectedTender.daysLeft <= 7 ? 'text-red-600' : 'text-gray-400'}`}>{selectedTender.daysLeft} days remaining</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <p className="text-[9px] text-gray-400">Bid Probability</p>
                    <p className={`text-lg font-black ${
                      selectedTender.bidProbability >= 70 ? 'text-green-600' :
                      selectedTender.bidProbability >= 40 ? 'text-amber-600' : 'text-red-600'
                    }`}>{selectedTender.bidProbability}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <p className="text-[9px] text-gray-400">Competition</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{selectedTender.bids}</p>
                    <p className="text-[9px] text-gray-400">bids submitted</p>
                  </div>
                </div>

                {selectedTender.summary && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">AI Summary</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{selectedTender.summary}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Eligibility Status</p>
                  <div className={`p-3 rounded-lg border ${
                    selectedTender.eligibility === 'eligible' ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' :
                    selectedTender.eligibility === 'partial' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' :
                    'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {selectedTender.eligibility === 'eligible' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                       selectedTender.eligibility === 'partial' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                       <XCircle className="w-4 h-4 text-red-600" />}
                      <span className={`text-xs font-bold ${
                        selectedTender.eligibility === 'eligible' ? 'text-green-700' :
                        selectedTender.eligibility === 'partial' ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {selectedTender.eligibility === 'eligible' ? 'Fully Eligible — Meets all requirements' :
                         selectedTender.eligibility === 'partial' ? 'Partially Eligible — Some requirements need review' :
                         'Not Eligible — Key requirements not met'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Prepare Bid
                  </button>
                  <button className="py-2.5 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI MATCHED */}
      {activeTab === 'matched' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 rounded-xl border border-rose-200 dark:border-rose-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-rose-600" />
              <span className="text-sm font-bold text-rose-800 dark:text-rose-300">AI-Matched Tenders</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Tenders automatically matched to your profile, sector, and capabilities. Ranked by win probability.</p>
          </div>

          <div className="space-y-3">
            {matchedTenders.map((t, i) => (
              <div key={t.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{t.title}</h4>
                  <p className="text-[10px] text-gray-500">{t.organization} • {t.country}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-trade-primary dark:text-white">{t.budget}</p>
                  <p className={`text-xs font-black ${t.bidProbability >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                    {t.bidProbability}% win chance
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
          {/* Category Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-rose-500" /> Tenders by Category
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_STATS}>
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: 'white', fontSize: '11px' }} />
                  <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]} barSize={20}>
                    {CATEGORY_STATS.map((_, i) => {
                      const colors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];
                      return <Cell key={i} fill={colors[i % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
                <p className="text-2xl font-black text-trade-primary dark:text-white">{TENDERS.length}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Active Tenders</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
                <p className="text-2xl font-black text-green-600">{TENDERS.filter(t => t.eligibility === 'eligible').length}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Eligible</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
                <p className="text-2xl font-black text-amber-600">{TENDERS.filter(t => t.daysLeft <= 14).length}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Closing Soon</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
                <p className="text-2xl font-black text-purple-600">{Math.round(TENDERS.reduce((s, t) => s + t.bidProbability, 0) / TENDERS.length)}%</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Avg Win Prob.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex-1">
              <h3 className="text-sm font-bold text-trade-primary dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> Top Opportunities
              </h3>
              <div className="space-y-2">
                {TENDERS.filter(t => t.eligibility === 'eligible').sort((a, b) => b.bidProbability - a.bidProbability).slice(0, 4).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{t.title}</p>
                      <p className="text-[9px] text-gray-400">{t.country} • {t.daysLeft}d left</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ml-2 ${
                      t.bidProbability >= 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>{t.bidProbability}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLLABORATION WORKSPACE */}
      {activeTab === 'workspace' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
          {/* Left: Team Members + Notes */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto">
            {/* Team Members */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-trade-primary dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-500" /> Team Members
                </h3>
                <button className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {TEAM_MEMBERS.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                        {member.avatar}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                        member.status === 'online' ? 'bg-green-500' : member.status === 'away' ? 'bg-amber-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{member.name}</p>
                      <p className="text-[10px] text-gray-500">{member.role}</p>
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Workspace Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex-1 flex flex-col">
              <div className="flex gap-2 mb-3">
                {[
                  { id: 'notes' as const, label: 'Notes', icon: Edit3 },
                  { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setWorkspaceTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      workspaceTab === tab.id ? 'bg-rose-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}>
                    <tab.icon className="w-3 h-3" /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Notes */}
              {workspaceTab === 'notes' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-2 overflow-y-auto mb-3">
                    {notes.filter(n => n.type === 'note' || n.type === 'comment').map(note => (
                      <div key={note.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{note.author}</span>
                          <span className="text-[9px] text-gray-400">{note.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] bg-rose-100 dark:bg-rose-900/20 text-rose-600 px-2 py-0.5 rounded-full">
                            {TENDERS.find(t => t.id === note.tenderId)?.title.slice(0, 25)}...
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-xs dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button 
                      onClick={() => {
                        if (newNote.trim()) {
                          setNotes(prev => [...prev, {
                            id: `cn${Date.now()}`,
                            tenderId: 't1',
                            author: 'You',
                            content: newNote,
                            timestamp: 'Just now',
                            type: 'note'
                          }]);
                          setNewNote('');
                        }
                      }}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tasks */}
              {workspaceTab === 'tasks' && (
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {notes.filter(n => n.type === 'task').map(task => (
                    <div key={task.id} className={`p-3 rounded-lg border transition-all ${
                      task.completed 
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                        : 'bg-white dark:bg-slate-700/50 border-gray-100 dark:border-slate-600'
                    }`}>
                      <div className="flex items-start gap-3">
                        <button 
                          onClick={() => setNotes(prev => prev.map(n => 
                            n.id === task.id ? { ...n, completed: !n.completed } : n
                          ))}
                          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            task.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 dark:border-slate-500 hover:border-rose-500'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <div className="flex-1">
                          <p className={`text-xs font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-white'}`}>
                            {task.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-gray-400">{task.author}</span>
                            <span className="text-[9px] text-gray-400">•</span>
                            <span className="text-[9px] text-gray-400">{task.timestamp}</span>
                          </div>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Team Chat */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-trade-primary dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-500" /> Team Chat
              </h3>
              <p className="text-[10px] text-gray-500">Collaborate on tender bids in real-time</p>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{msg.author}</span>
                      <span className="text-[9px] text-gray-400">{msg.timestamp}</span>
                      {msg.tenderId && (
                        <span className="text-[9px] bg-blue-100 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full">
                          {TENDERS.find(t => t.id === msg.tenderId)?.title.slice(0, 20)}...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex gap-2">
                <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && chatMessage.trim()) {
                      setMessages(prev => [...prev, {
                        id: `cm${Date.now()}`,
                        author: 'You',
                        avatar: 'YO',
                        content: chatMessage,
                        timestamp: 'Just now'
                      }]);
                      setChatMessage('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (chatMessage.trim()) {
                      setMessages(prev => [...prev, {
                        id: `cm${Date.now()}`,
                        author: 'You',
                        avatar: 'YO',
                        content: chatMessage,
                        timestamp: 'Just now'
                      }]);
                      setChatMessage('');
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
