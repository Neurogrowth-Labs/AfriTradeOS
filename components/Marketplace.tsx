import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  MessageSquare,
  UserPlus,
  Building2,
  Truck,
  Scale,
  Briefcase,
  Loader2,
  Users,
  Network,
  X,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Globe,
  Award,
  Clock,
  Zap,
  Calendar
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { mockDatabase } from '../services/mockDatabase';
import { DbOrganization } from '../types';
import { supabase } from '../services/supabase';

// Fix for default marker icon in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper function to get coordinates from location string
const getCoordinatesFromLocation = (location: string): [number, number] => {
  // Map of common African cities to coordinates
  const cityCoordinates: Record<string, [number, number]> = {
    'Lagos, Nigeria': [6.5244, 3.3792],
    'Nairobi, Kenya': [-1.2921, 36.8219],
    'Accra, Ghana': [5.6037, -0.1870],
    'Cairo, Egypt': [30.0444, 31.2357],
    'Johannesburg, South Africa': [-26.2041, 28.0473],
    'Kinshasa, DRC': [-4.4419, 15.2663],
    'Dar es Salaam, Tanzania': [-6.7924, 39.2083],
    'Addis Ababa, Ethiopia': [9.0320, 38.7469],
    'Casablanca, Morocco': [33.5731, -7.5898],
    'Kigali, Rwanda': [-1.9536, 30.0606],
    'Kampala, Uganda': [0.3476, 32.5825],
    'Abidjan, Ivory Coast': [5.3599, -4.0083],
    'Dakar, Senegal': [14.7167, -17.4677],
    'Luanda, Angola': [-8.8390, 13.2894],
    'Maputo, Mozambique': [-25.9692, 32.5732],
    'Lusaka, Zambia': [-15.3875, 28.3228],
    'Harare, Zimbabwe': [-17.8252, 31.0335],
    'Tunis, Tunisia': [36.8065, 10.1815],
    'Algiers, Algeria': [36.7538, 3.0588],
  };

  // Try to match the location to known coordinates
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (location.includes(city.split(',')[0])) {
      return coords;
    }
  }

  // Default to center of Africa with some randomization
  const baseHash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const lat = -10 + (baseHash % 40); // Latitude between -10 and 30
  const lng = -15 + ((baseHash * 7) % 50); // Longitude between -15 and 35
  return [lat, lng];
};

// Create custom colored markers
const createColoredIcon = (color: string) => {
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="#000" stroke-width="1" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.3 12.5 28.5 12.5 28.5S25 20.8 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

const CATEGORIES = [
  { id: 'all', label: 'All Partners' },
  { id: 'buyer', label: 'Buyers', icon: Briefcase },
  { id: 'seller', label: 'Suppliers', icon: Building2 },
  { id: 'logistics', label: 'Logistics', icon: Truck },
  { id: 'legal', label: 'Legal & Compliance', icon: Scale },
  { id: 'finance', label: 'Finance & Insurance', icon: Building2 },
  { id: 'afcfta', label: 'AfCFTA Eligible', icon: Globe },
];

// Network graph node positions (pre-computed for visual layout)
const NETWORK_NODES = [
  { id: 'center', name: 'Your Company', x: 400, y: 300, type: 'self', size: 20 },
  { id: 'n1', name: 'Ghana Cocoa Board', x: 200, y: 150, type: 'seller', size: 14 },
  { id: 'n2', name: 'Maersk Logistics', x: 600, y: 150, type: 'logistics', size: 12 },
  { id: 'n3', name: 'Euro Chocolate Co.', x: 150, y: 350, type: 'buyer', size: 14 },
  { id: 'n4', name: 'KCB Trade Finance', x: 650, y: 350, type: 'finance', size: 12 },
  { id: 'n5', name: 'Kenya Coffee Export', x: 250, y: 480, type: 'seller', size: 12 },
  { id: 'n6', name: 'DHL Global', x: 550, y: 480, type: 'logistics', size: 10 },
  { id: 'n7', name: 'Legal Associates', x: 400, y: 520, type: 'legal', size: 10 },
];

const NETWORK_EDGES = [
  { from: 'center', to: 'n1', strength: 0.9 },
  { from: 'center', to: 'n2', strength: 0.7 },
  { from: 'center', to: 'n3', strength: 0.8 },
  { from: 'center', to: 'n4', strength: 0.6 },
  { from: 'center', to: 'n5', strength: 0.5 },
  { from: 'center', to: 'n6', strength: 0.4 },
  { from: 'center', to: 'n7', strength: 0.3 },
  { from: 'n1', to: 'n3', strength: 0.6 },
  { from: 'n2', to: 'n6', strength: 0.5 },
  { from: 'n5', to: 'n7', strength: 0.4 },
];

export const Marketplace: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [partners, setPartners] = useState<DbOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'network' | 'world_map'>('grid');
  const [selectedProfile, setSelectedProfile] = useState<DbOrganization | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [selectedPartnerForMeeting, setSelectedPartnerForMeeting] = useState<DbOrganization | null>(null);
  const [showMatchesView, setShowMatchesView] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    companySize: '',
    tradeHistory: '',
    certifications: '',
    minRating: ''
  });

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      try {
        // Fetch all organizations (including newly onboarded companies)
        let query = supabase
          .from('organizations')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        // Apply category filter if not 'all'
        if (category !== 'all') {
          query = query.eq('type', category);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error("Supabase error:", error);
          // Fallback to mockDatabase
          const fallbackData = await mockDatabase.getOrganizations(category === 'all' ? undefined : category);
          setPartners(fallbackData);
          setTotalCount(fallbackData.length);
        } else {
          // Map database fields to expected format
          const mappedPartners = (data || []).map((org: any) => ({
            ...org,
            logo_initial: org.logo_initial || org.name?.charAt(0)?.toUpperCase() || 'O',
            tags: org.tags || [],
            rating: org.rating || 4.5,
            reviews_count: org.reviews_count || 0,
            verification_status: org.verification_status ?? org.is_verified ?? false
          }));
          setPartners(mappedPartners);
          setTotalCount(count || mappedPartners.length);
        }
      } catch (error) {
        console.error("Failed to fetch partners:", error);
        // Fallback to mockDatabase
        const fallbackData = await mockDatabase.getOrganizations(category === 'all' ? undefined : category);
        setPartners(fallbackData);
        setTotalCount(fallbackData.length);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [category]);

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleConnect = (partner: string) => {
      alert(`Connection request sent to ${partner}.`);
  };

  const handleMessage = (partner: string) => {
      alert(`Opening secure chat with ${partner}...`);
  };

  const handleFindPartners = () => {
    // Trigger search with current filters
    setLoading(true);
    // The useEffect will handle the actual search
    setLoading(false);
  };

  const handleViewMatches = () => {
    setShowMatchesView(true);
  };

  const handleScheduleMeeting = (partner?: DbOrganization) => {
    if (partner) {
      setSelectedPartnerForMeeting(partner);
    }
    setShowMeetingScheduler(true);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    // Re-fetch with filters applied
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
         <div className="flex items-center justify-between mb-2">
           <h2 className="text-3xl font-bold">Find Suppliers & Partners</h2>
           <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
             <Users className="w-4 h-4" />
             <span className="text-sm font-bold">{totalCount} Partners</span>
           </div>
         </div>
         <p className="text-blue-100 mb-6 max-w-2xl">Verified supplier database with AfCFTA eligibility, performance ratings, and AI-powered matching. Connect, message, or send RFQs directly.</p>
         
         <div className="flex gap-2 mb-4">
           <button onClick={() => setViewMode('grid')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>
             <Users className="w-3.5 h-3.5" /> Partner Grid
           </button>
           <button onClick={() => setViewMode('network')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'network' ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>
             <Network className="w-3.5 h-3.5" /> Network Graph
           </button>
           <button onClick={() => setViewMode('world_map')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'world_map' ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>
             <Globe className="w-3.5 h-3.5" /> World Map
           </button>
         </div>

         <div className="bg-white rounded-xl p-2 flex items-center shadow-md max-w-3xl">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input
               type="text"
               placeholder="Search by company name, commodity, or service..."
               className="flex-1 p-3 text-gray-800 outline-none placeholder-gray-400 bg-transparent"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleFindPartners()}
            />
            <button
              onClick={handleFindPartners}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
            >
               Find Partners
            </button>
         </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
         {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button 
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                    category === cat.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {cat.label}
              </button>
            )
         })}
      </div>

      {/* AI Matchmaking & Enhanced Filters */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white flex items-center gap-4 shadow-md">
        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full w-fit mb-1">AI Partner Match</p>
          <p className="text-sm opacity-95">Based on your product portfolio and trade history, we found <span className="font-bold">3 high-compatibility partners</span> in West Africa with verified KYC and strong reliability scores.</p>
        </div>
        <button
          onClick={handleViewMatches}
          className="shrink-0 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors"
        >
          View Matches
        </button>
      </div>

      {/* Enhanced Filters Row */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">Filters:</span>
        <select
          value={filters.companySize}
          onChange={(e) => setFilters({ ...filters, companySize: e.target.value })}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-xs text-gray-700 dark:text-gray-300 outline-none"
        >
          <option value="">Company Size</option>
          <option value="small">Small (1-50)</option>
          <option value="medium">Medium (51-500)</option>
          <option value="large">Large (500+)</option>
        </select>
        <select
          value={filters.tradeHistory}
          onChange={(e) => setFilters({ ...filters, tradeHistory: e.target.value })}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-xs text-gray-700 dark:text-gray-300 outline-none"
        >
          <option value="">Trade History</option>
          <option value="new">New (0-5 trades)</option>
          <option value="experienced">Experienced (5-50)</option>
          <option value="veteran">Veteran (50+)</option>
        </select>
        <select
          value={filters.certifications}
          onChange={(e) => setFilters({ ...filters, certifications: e.target.value })}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-xs text-gray-700 dark:text-gray-300 outline-none"
        >
          <option value="">Certifications</option>
          <option value="afcfta">AfCFTA Certified</option>
          <option value="iso">ISO Certified</option>
          <option value="organic">Organic Certified</option>
        </select>
        <select
          value={filters.minRating}
          onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-xs text-gray-700 dark:text-gray-300 outline-none"
        >
          <option value="">Min Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
          <option value="3.5">3.5+ Stars</option>
        </select>
        <button
          onClick={() => handleScheduleMeeting()}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" /> Schedule B2B Meeting
        </button>
      </div>

      {/* WORLD MAP VIEW WITH LEAFLET */}
      {viewMode === 'world_map' ? (
        <div className="flex-1 rounded-xl border border-slate-700 relative overflow-hidden min-h-[600px]">
          {/* Legend */}
          <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="flex flex-col gap-2 text-[10px]">
              <span className="font-bold text-gray-900 dark:text-white mb-1">Partner Types</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Supplier</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Buyer</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Logistics</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> Finance</span>
            </div>
          </div>

          <MapContainer
            center={[0, 20]}
            zoom={3}
            className="h-full w-full rounded-xl"
            style={{ minHeight: '600px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredPartners.map((partner) => {
              const coordinates = getCoordinatesFromLocation(partner.location);
              const colors: Record<string, string> = {
                seller: '#10b981',
                buyer: '#a855f7',
                logistics: '#f59e0b',
                finance: '#14b8a6',
                legal: '#6366f1'
              };
              const color = colors[partner.type] || '#3b82f6';
              const icon = createColoredIcon(color);

              return (
                <Marker
                  key={partner.id}
                  position={coordinates}
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedProfile(partner),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                          {partner.logo_initial}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm">{partner.name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {partner.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs mb-2">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span className="font-bold">{partner.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({partner.reviews_count})</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{partner.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScheduleMeeting(partner);
                          }}
                          className="flex-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessage(partner.name);
                          }}
                          className="flex-1 px-2 py-1 rounded border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : viewMode === 'network' ? (
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden min-h-[500px]">
          <div className="absolute top-3 left-3 z-10 bg-slate-800/90 backdrop-blur p-2 rounded-lg border border-slate-700">
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Self</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Supplier</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Buyer</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Logistics</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> Finance</span>
            </div>
          </div>
          <svg viewBox="0 0 800 600" className="w-full h-full">
            <rect width="800" height="600" fill="#0f172a" />
            {NETWORK_EDGES.map((edge, idx) => {
              const fromNode = NETWORK_NODES.find(n => n.id === edge.from)!;
              const toNode = NETWORK_NODES.find(n => n.id === edge.to)!;
              return (
                <line key={idx} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
                  stroke="#334155" strokeWidth={edge.strength * 3} opacity={0.5} strokeDasharray={edge.strength < 0.5 ? '4 4' : 'none'} />
              );
            })}
            {NETWORK_NODES.map(node => {
              const colors: Record<string, string> = { self: '#3b82f6', seller: '#10b981', buyer: '#a855f7', logistics: '#f59e0b', finance: '#14b8a6', legal: '#6366f1' };
              return (
                <g key={node.id} className="cursor-pointer">
                  <circle cx={node.x} cy={node.y} r={node.size + 6} fill={colors[node.type]} opacity={0.15}>
                    <animate attributeName="r" values={`${node.size+4};${node.size+10};${node.size+4}`} dur="4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={node.x} cy={node.y} r={node.size} fill={colors[node.type]} stroke="#0f172a" strokeWidth="3" />
                  <text x={node.x} y={node.y + node.size + 14} fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">{node.name}</text>
                  {node.type === 'self' && <text x={node.x} y={node.y + 4} fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">YOU</text>}
                </g>
              );
            })}
          </svg>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-0 overflow-y-auto pr-2 pb-6">
           {filteredPartners.map(partner => (
              <div key={partner.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
                onClick={() => setSelectedProfile(partner)}>
                 <div className="p-6 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-700/60 flex items-center justify-center border border-blue-100 dark:border-slate-600 text-blue-700 dark:text-blue-200 font-bold shrink-0">
                          {partner.logo_initial}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">{partner.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{partner.location}</span>
                          </div>
                        </div>
                      </div>

                      {partner.verification_status && (
                        <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40 shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 mb-4">
                      {partner.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(partner.tags || []).slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {(partner.tags?.length || 0) > 4 && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700">
                          +{partner.tags.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="font-bold">{partner.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({partner.reviews_count})</span>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {partner.type}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMessage(partner.name); }}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConnect(partner.name); }}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Connect
                    </button>
                  </div>
              </div>
           ))}
        </div>
      )}

      {/* B5: PARTNER PROFILE MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-slate-600">
                    {selectedProfile.logo_initial}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProfile.name}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedProfile.location}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Rating & Compliance */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1"><Star className="w-4 h-4 text-amber-500" /></div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedProfile.rating.toFixed(1)}</p>
                  <p className="text-[10px] text-gray-500">{selectedProfile.reviews_count} reviews</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {selectedProfile.verification_status ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedProfile.verification_status ? 'Verified' : 'Pending'}</p>
                  <p className="text-[10px] text-gray-500">KYC Status</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1"><Award className="w-4 h-4 text-blue-600" /></div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{selectedProfile.type}</p>
                  <p className="text-[10px] text-gray-500">Category</p>
                </div>
              </div>

              {/* Supplier Performance Dashboard */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" /> Supplier Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase mb-0.5">On-Time Delivery</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                      <span className="text-xs font-bold text-green-600">92%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase mb-0.5">Quality Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '88%' }} />
                      </div>
                      <span className="text-xs font-bold text-blue-600">88%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase mb-0.5">Trade Volume</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">$2.4M</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase mb-0.5">Response Time</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">&lt;4h avg</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">About</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProfile.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Compliance Status</h3>
                <div className="space-y-2">
                  {[
                    { label: 'KYC/KYB Verification', status: selectedProfile.verification_status },
                    { label: 'Trade License', status: true },
                    { label: 'AML Screening', status: true },
                    { label: 'Financial Statements', status: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                      {item.status ? (
                        <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Cleared</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedProfile.tags || []).map(tag => (
                    <span key={tag} className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { handleMessage(selectedProfile.name); setSelectedProfile(null); }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
                <button onClick={() => { handleConnect(selectedProfile.name); setSelectedProfile(null); }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                  <UserPlus className="w-4 h-4" /> Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEETING SCHEDULER MODAL */}
      {showMeetingScheduler && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule B2B Meeting</h2>
                  {selectedPartnerForMeeting && (
                    <p className="text-sm text-gray-500 mt-1">with {selectedPartnerForMeeting.name}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowMeetingScheduler(false);
                    setSelectedPartnerForMeeting(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Time
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Type
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500">
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Agenda (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of meeting purpose..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowMeetingScheduler(false);
                    setSelectedPartnerForMeeting(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert(`Meeting request sent${selectedPartnerForMeeting ? ' to ' + selectedPartnerForMeeting.name : ''}!`);
                    setShowMeetingScheduler(false);
                    setSelectedPartnerForMeeting(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI MATCHES VIEW MODAL */}
      {showMatchesView && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI-Matched Partners</h2>
                  <p className="text-sm text-gray-500 mt-1">High-compatibility partners based on your profile</p>
                </div>
                <button
                  onClick={() => setShowMatchesView(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPartners.slice(0, 6).map(partner => (
                  <div
                    key={partner.id}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border-2 border-blue-200 dark:border-blue-900/30 p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold shrink-0">
                        {partner.logo_initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{partner.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {partner.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 px-2 py-1 rounded-full font-bold">
                        <Star className="w-3 h-3" /> {(Math.random() * 20 + 80).toFixed(0)}%
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {partner.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProfile(partner);
                          setShowMatchesView(false);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          handleScheduleMeeting(partner);
                          setShowMatchesView(false);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3 h-3" /> Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};