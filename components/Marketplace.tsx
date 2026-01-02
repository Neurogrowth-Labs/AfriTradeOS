import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  UserPlus, 
  Filter,
  Building2,
  Truck,
  Scale,
  Briefcase,
  Loader2
} from 'lucide-react';
import { mockDatabase } from '../services/mockDatabase';
import { DbOrganization } from '../types';

const CATEGORIES = [
  { id: 'all', label: 'All Partners' },
  { id: 'buyer', label: 'Buyers', icon: Briefcase },
  { id: 'seller', label: 'Suppliers', icon: Building2 },
  { id: 'logistics', label: 'Logistics', icon: Truck },
  { id: 'legal', label: 'Legal & Compliance', icon: Scale },
];

export const Marketplace: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [partners, setPartners] = useState<DbOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      try {
        const data = await mockDatabase.getOrganizations(category === 'all' ? undefined : category);
        setPartners(data);
      } catch (error) {
        console.error("Failed to fetch partners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [category]);

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
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
         <h2 className="text-3xl font-bold mb-2">AfriTrade Network</h2>
         <p className="text-blue-100 mb-6 max-w-2xl">Connect with verified buyers, suppliers, and service providers across the continent. Build your trusted trade ecosystem.</p>
         
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
                    