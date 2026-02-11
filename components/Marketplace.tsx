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
  Users
} from 'lucide-react';
import { mockDatabase } from '../services/mockDatabase';
import { DbOrganization } from '../types';
import { supabase } from '../services/supabase';

const CATEGORIES = [
  { id: 'all', label: 'All Partners' },
  { id: 'buyer', label: 'Buyers', icon: Briefcase },
  { id: 'seller', label: 'Suppliers', icon: Building2 },
  { id: 'logistics', label: 'Logistics', icon: Truck },
  { id: 'legal', label: 'Legal & Compliance', icon: Scale },
  { id: 'finance', label: 'Finance & Insurance', icon: Building2 },
];

export const Marketplace: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [partners, setPartners] = useState<DbOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

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

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
         <div className="flex items-center justify-between mb-2">
           <h2 className="text-3xl font-bold">AfriTrade Network</h2>
           <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
             <Users className="w-4 h-4" />
             <span className="text-sm font-bold">{totalCount} Partners</span>
           </div>
         </div>
         <p className="text-blue-100 mb-6 max-w-2xl">Connect with verified buyers, suppliers, and service providers across the continent. All onboarded companies automatically appear here.</p>
         
         <div className="bg-white rounded-xl p-2 flex items-center shadow-md max-w-3xl">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input 
               type="text"
               placeholder="Search by company name, commodity, or service..." 
               className="flex-1 p-3 text-gray-800 outline-none placeholder-gray-400 bg-transparent"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
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

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-0 overflow-y-auto pr-2 pb-6">
           {filteredPartners.map(partner => (
              <div key={partner.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col group">
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
                      onClick={() => handleMessage(partner.name)}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    <button
                      onClick={() => handleConnect(partner.name)}
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
    </div>
  );
};