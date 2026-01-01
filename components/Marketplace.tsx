import React, { useState } from 'react';
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
  Briefcase
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Partners' },
  { id: 'buyer', label: 'Buyers', icon: Briefcase },
  { id: 'seller', label: 'Suppliers', icon: Building2 },
  { id: 'logistics', label: 'Logistics', icon: Truck },
  { id: 'legal', label: 'Legal & Compliance', icon: Scale },
];

const PARTNERS = [
  {
    id: 1,
    name: 'Cocoa Processing Co.',
    type: 'buyer',
    location: 'Accra, Ghana',
    verified: true,
    rating: 4.8,
    reviews: 124,
    tags: ['Agro-Processing', 'Bulk Buyer', 'Fair Trade'],
    desc: 'Leading processor of high-quality cocoa beans seeking reliable regional suppliers.'
  },
  {
    id: 2,
    name: 'Nairobi Fresh Exports',
    type: 'seller',
    location: 'Nairobi, Kenya',
    verified: true,
    rating: 4.5,
    reviews: 89,
    tags: ['Horticulture', 'Avocados', 'Global GAP'],
    desc: 'Exporter of premium fresh produce with established cold chain logistics.'
  },
  {
    id: 3,
    name: 'SwiftTrans Logistics',
    type: 'logistics',
    location: 'Lagos, Nigeria',
    verified: false,
    rating: 4.2,
    reviews: 45,
    tags: ['Road Freight', 'Warehousing', 'Last Mile'],
    desc: 'Cross-border trucking specialist covering the Lagos-Abidjan corridor.'
  },
  {
    id: 4,
    name: 'AfriLaw Partners',
    type: 'legal',
    location: 'Johannesburg, SA',
    verified: true,
    rating: 5.0,
    reviews: 210,
    tags: ['Trade Law', 'Contracts', 'Dispute Resolution'],
    desc: 'Specialized legal firm for AfCFTA compliance and cross-border trade agreements.'
  }
];

export const Marketplace: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filteredPartners = PARTNERS.filter(p => 
    (category === 'all' || p.type === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-0 overflow-y-auto pr-2 pb-6">
         {filteredPartners.map(partner => (
            <div key={partner.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col group">
               <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-gray-500 text-xl">
                        {partner.name.charAt(0)}
                     </div>
                     {partner.verified && (
                        <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-[10px] font-bold uppercase border border-blue-100 dark:border-blue-800">
                           <ShieldCheck className="w-3 h-3" /> Verified
                        </div>
                     )}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">{partner.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                     <MapPin className="w-3 h-3" /> {partner.location}
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4">
                     <div className="flex">
                        {[1,2,3,4,5].map(star => (
                           <Star key={star} className={`w-3 h-3 ${star <= Math.round(partner.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                     </div>
                     <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{partner.rating}</span>
                     <span className="text-xs text-gray-400">({partner.reviews})</span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{partner.desc}</p>
                  
                  <div className="flex flex-wrap gap-2">
                     {partner.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-[10px] font-medium rounded">
                           {tag}
                        </span>
                     ))}
                  </div>
               </div>

               <div className="p-4 border-t border-gray-100 dark:border-slate-700 grid grid-cols-2 gap-3 bg-gray-50/50 dark:bg-slate-900/50">
                  <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-colors">
                     <MessageSquare className="w-3.5 h-3.5" /> Message
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors">
                     <UserPlus className="w-3.5 h-3.5" /> Connect
                  </button>
               </div>
            </div>
         ))}
         
         {filteredPartners.length === 0 && (
             <div className="col-span-full text-center py-20 text-gray-400">
                 <p className="text-lg font-medium">No partners found matching your criteria.</p>
                 <button onClick={() => {setCategory('all'); setSearch('')}} className="mt-2 text-blue-600 hover:underline">Clear filters</button>
             </div>
         )}
      </div>
    </div>
  );
};