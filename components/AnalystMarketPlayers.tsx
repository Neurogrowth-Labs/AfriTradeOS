
import React, { useState } from 'react';
import {
  Search,
  Star,
  ShieldCheck,
  MessageSquare,
  UserPlus,
  Building2,
  Truck,
  Scale,
  Briefcase,
  Award,
  Users,
  Zap,
  CheckCircle,
  X
} from 'lucide-react';

// --- TYPES ---
interface MarketPlayer {
  id: string;
  name: string;
  type: 'buyer' | 'seller' | 'logistics' | 'finance' | 'legal';
  country: string;
  sector: string;
  trustScore: number;
  kycStatus: 'verified' | 'pending' | 'unverified';
  matchScore?: number;
  rating: number;
  reviews: number;
  certifications: string[];
  description: string;
  logo: string;
  tags: string[];
}

// --- DATA ---
const MARKET_PLAYERS: MarketPlayer[] = [
  { id: 'mp1', name: 'Ghana Cocoa Board', type: 'seller', country: 'Ghana', sector: 'Agriculture', trustScore: 95, kycStatus: 'verified', matchScore: 92, rating: 4.8, reviews: 124, certifications: ['AfCFTA Certified', 'ISO 9001', 'Fair Trade'], description: 'Premier cocoa supplier with vertically integrated processing. 60+ years of trade excellence.', logo: 'G', tags: ['cocoa', 'agriculture', 'premium'] },
  { id: 'mp2', name: 'Dangote Industries', type: 'buyer', country: 'Nigeria', sector: 'Manufacturing', trustScore: 91, kycStatus: 'verified', matchScore: 88, rating: 4.6, reviews: 89, certifications: ['AfCFTA Certified', 'ISO 14001'], description: 'Africa\'s largest industrial conglomerate. Major buyer of raw materials and commodities.', logo: 'D', tags: ['cement', 'manufacturing', 'bulk'] },
  { id: 'mp3', name: 'Maersk East Africa', type: 'logistics', country: 'Kenya', sector: 'Logistics', trustScore: 88, kycStatus: 'verified', matchScore: 85, rating: 4.5, reviews: 256, certifications: ['ISO 28000', 'AEO Certified'], description: 'Full container and LCL shipping across African corridors. Digital tracking.', logo: 'M', tags: ['shipping', 'container', 'sea freight'] },
  { id: 'mp4', name: 'KCB Trade Finance', type: 'finance', country: 'Kenya', sector: 'Banking', trustScore: 93, kycStatus: 'verified', matchScore: 78, rating: 4.4, reviews: 67, certifications: ['Central Bank Licensed', 'AfCFTA Trade Finance'], description: 'Leading East African trade finance provider. L/C, guarantees, and supply chain finance.', logo: 'K', tags: ['trade finance', 'LC', 'banking'] },
  { id: 'mp5', name: 'Bolloré Transport', type: 'logistics', country: 'Senegal', sector: 'Logistics', trustScore: 86, kycStatus: 'verified', matchScore: 82, rating: 4.3, reviews: 198, certifications: ['ISO 9001', 'TAPA'], description: 'Pan-African logistics operator with port terminal operations across 20+ countries.', logo: 'B', tags: ['logistics', 'ports', 'warehousing'] },
  { id: 'mp6', name: 'Ethiopian Coffee Export', type: 'seller', country: 'Ethiopia', sector: 'Agriculture', trustScore: 82, kycStatus: 'verified', matchScore: 90, rating: 4.7, reviews: 78, certifications: ['AfCFTA Certified', 'Organic', 'Rainforest Alliance'], description: 'Specialty coffee exporter. Direct sourcing from Ethiopian highlands.', logo: 'E', tags: ['coffee', 'organic', 'specialty'] },
  { id: 'mp7', name: 'Afreximbank', type: 'finance', country: 'Egypt', sector: 'Banking', trustScore: 97, kycStatus: 'verified', matchScore: 75, rating: 4.9, reviews: 45, certifications: ['AAA Rated', 'DFI'], description: 'African Export-Import Bank. Continental trade finance institution.', logo: 'A', tags: ['DFI', 'export finance', 'guarantees'] },
  { id: 'mp8', name: 'Shoprite Holdings', type: 'buyer', country: 'South Africa', sector: 'Retail', trustScore: 89, kycStatus: 'verified', matchScore: 80, rating: 4.2, reviews: 312, certifications: ['ISO 22000', 'HACCP'], description: 'Africa\'s largest food retailer. Sourcing fresh produce and FMCG across 15 countries.', logo: 'S', tags: ['retail', 'FMCG', 'fresh produce'] },
];

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  buyer: { icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Buyer' },
  seller: { icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Supplier' },
  logistics: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Logistics' },
  finance: { icon: Scale, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Finance' },
  legal: { icon: Scale, color: 'text-red-600', bg: 'bg-red-100', label: 'Legal' },
};

export const AnalystMarketPlayers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<MarketPlayer | null>(null);

  const filtered = MARKET_PLAYERS.filter(p => {
    const matchesSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase()) ||
      p.sector.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in pb-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-trade-primary dark:text-white">Market Players</h2>
              <p className="text-[10px] text-gray-500">Verified directory • Trust scores • AI matchmaking • Business profiles</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Search players, sectors, countries..." />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Players' },
            { id: 'buyer', label: 'Buyers' },
            { id: 'seller', label: 'Suppliers' },
            { id: 'logistics', label: 'Logistics' },
            { id: 'finance', label: 'Finance' },
          ].map(f => (
            <button key={f.id} onClick={() => setTypeFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                typeFilter === f.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Matchmaking Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-300" />
          <div>
            <p className="text-sm font-bold text-white">AI Matchmaking Active</p>
            <p className="text-[10px] text-indigo-200">Match scores calculated based on your trade profile, sector, and location</p>
          </div>
        </div>
        <span className="text-[10px] bg-white/20 text-white px-3 py-1 rounded-full font-bold">{filtered.length} matches found</span>
      </div>

      {/* Player Grid + Detail */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Grid */}
        <div className={`${selectedPlayer ? 'lg:col-span-7' : 'lg:col-span-12'} overflow-y-auto space-y-3`}>
          {filtered.map(player => {
            const config = TYPE_CONFIG[player.type];
            return (
              <div key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className={`bg-white dark:bg-slate-800 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedPlayer?.id === player.id ? 'border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-200' : 'border-gray-100 dark:border-slate-700'
                }`}>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center text-lg font-black ${config.color} shrink-0`}>
                    {player.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{player.name}</h4>
                          {player.kycStatus === 'verified' && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-gray-500">{player.country} • {player.sector}</p>
                      </div>
                      {player.matchScore && (
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg shrink-0">
                          {player.matchScore}% match
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{player.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{player.rating}</span>
                        <span className="text-[10px] text-gray-400">({player.reviews})</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>{config.label}</span>
                      <span className="text-[10px] text-gray-400">Trust: <span className="font-bold text-gray-700 dark:text-white">{player.trustScore}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedPlayer && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-y-auto">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl ${TYPE_CONFIG[selectedPlayer.type].bg} flex items-center justify-center text-xl font-black ${TYPE_CONFIG[selectedPlayer.type].color}`}>
                    {selectedPlayer.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedPlayer.name}</h3>
                    <p className="text-xs text-gray-500">{selectedPlayer.country} • {selectedPlayer.sector}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPlayer(null)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-black text-indigo-600">{selectedPlayer.trustScore}</p>
                  <p className="text-[9px] text-gray-400">Trust Score</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-lg font-black text-gray-900 dark:text-white">{selectedPlayer.rating}</span>
                  </div>
                  <p className="text-[9px] text-gray-400">{selectedPlayer.reviews} reviews</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-black text-emerald-600">{selectedPlayer.matchScore}%</p>
                  <p className="text-[9px] text-gray-400">Match</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{selectedPlayer.description}</p>

              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1">
                  {selectedPlayer.certifications.map(cert => (
                    <span key={cert} className="text-[10px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Award className="w-3 h-3" /> {cert}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">KYC Status</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 w-fit ${
                  selectedPlayer.kycStatus === 'verified' ? 'bg-green-100 text-green-700' :
                  selectedPlayer.kycStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedPlayer.kycStatus === 'verified' ? <CheckCircle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {selectedPlayer.kycStatus === 'verified' ? 'KYC Verified' : selectedPlayer.kycStatus === 'pending' ? 'KYC Pending' : 'Not Verified'}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </button>
                <button className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Connect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
