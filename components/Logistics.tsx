import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Loader2, 
  ExternalLink, 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Ship, 
  Anchor, 
  ArrowRight, 
  Filter,
  DollarSign,
  Star,
  Zap,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { getLogisticsInfo } from '../services/geminiService';
import { mockDatabase } from '../services/mockDatabase';

// Shipment type definition
interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  eta: string;
  progress: number;
  mode: string;
  carrier: string;
  timeline: { location: string; date: string; status: string; label: string; issue?: string }[];
}

// Provider data (static reference data)
const PROVIDERS = [
  { name: 'Maersk Line', type: 'Ocean', cost: '$$', speed: 'Slow', reliability: 'High (98%)', color: '#3b82f6' },
  { name: 'DHL Global', type: 'Air/Road', cost: '$$$$', speed: 'Fast', reliability: 'High (99%)', color: '#eab308' },
  { name: 'Bolloré Logistics', type: 'Road', cost: '$$', speed: 'Medium', reliability: 'Medium (85%)', color: '#6366f1' },
];

export const Logistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'booking'>('tracking');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [liveShipments, setLiveShipments] = useState<Shipment[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(true);

  // Booking State
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; maps: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const userLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi

  // Fetch shipments from database on mount
  useEffect(() => {
    const fetchShipments = async () => {
      setLoadingShipments(true);
      try {
        // Fetch trades and convert to shipment format
        const trades = await mockDatabase.getTrades();
        const shipments: Shipment[] = trades
          .filter(t => t.status === 'pending_execution' || t.status === 'pending_settlement')
          .map(t => ({
            id: t.id,
            origin: t.origin_country || 'Origin',
            destination: t.destination_country || 'Destination',
            status: t.status === 'pending_execution' ? 'on_time' : 'pending',
            eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            progress: t.status === 'pending_execution' ? 50 : 10,
            mode: 'Road',
            carrier: 'Pending Assignment',
            timeline: [
              { location: t.origin_country || 'Origin', date: new Date(t.created_at || Date.now()).toLocaleDateString(), status: 'completed', label: 'Picked Up' },
              { location: 'In Transit', date: 'Current', status: 'active', label: 'In Transit' },
              { location: t.destination_country || 'Destination', date: 'Est.', status: 'pending', label: 'Delivery' },
            ]
          }));
        setLiveShipments(shipments);
        if (shipments.length > 0) {
          setSelectedShipment(shipments[0]);
        }
      } catch (e) {
        console.error('Failed to fetch shipments:', e);
      } finally {
        setLoadingShipments(false);
      }
    };
    fetchShipments();
  }, []);

  // Simulate Realtime Tracking Updates
  useEffect(() => {
    if (liveShipments.length === 0) return;
    const interval = setInterval(() => {
        setLiveShipments(prev => prev.map(s => {
            if (s.status === 'on_time' && s.progress < 100) {
                return { ...s, progress: s.progress + 0.5 }; // Slowly increment
            }
            return s;
        }));
    }, 2000);
    return () => clearInterval(interval);
  }, [liveShipments.length]);

  // Update selected shipment view when live data changes
  useEffect(() => {
      if (!selectedShipment) return;
      const updated = liveShipments.find(s => s.id === selectedShipment.id);
      if (updated) setSelectedShipment(updated);
  }, [liveShipments, selectedShipment?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await getLogisticsInfo(query, userLocation);
      const mapSources: any[] = [];
      data.groundingChunks?.forEach((chunk: any) => {
        if (chunk.maps?.uri) {
            mapSources.push({
            title: chunk.maps.title,
            uri: chunk.maps.uri,
            address: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]?.text
          });
        }
      });
      setResult({ text: data.text || "No logistics data found.", maps: mapSources });
    } catch (err) {
      console.error(err);
      setResult({ text: "Error fetching logistics data.", maps: [] });
    } finally {
      setLoading(false);
    }
  };

  // Quote request state management
  const [quoteRequests, setQuoteRequests] = useState<Record<string, 'pending' | 'sent' | 'received'>>({});

  const handleAction = async (action: string, providerName?: string) => {
    if (action === 'Quote Request' && providerName) {
      // Update status to 'sent' for this provider
      setQuoteRequests(prev => ({ ...prev, [providerName]: 'sent' }));

      // In a real app, this would make an API call to store the request
      // For now, simulate the request being stored and provider notified
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate receiving quote after some time
        setTimeout(() => {
          setQuoteRequests(prev => ({ ...prev, [providerName]: 'received' }));
        }, 5000);

      } catch (e) {
        console.error('Failed to send quote request:', e);
        setQuoteRequests(prev => ({ ...prev, [providerName]: 'pending' }));
      }
    } else {
      alert(`${action} initiated. Awaiting confirmation.`);
    }
  };

  const getQuoteButtonState = (providerName: string) => {
    const status = quoteRequests[providerName];
    if (status === 'sent') {
      return { text: 'Quote Requested', disabled: true, className: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
    if (status === 'received') {
      return { text: 'Quote Received', disabled: true, className: 'bg-green-100 text-green-700 border-green-200' };
    }
    return { text: 'Request Quote', disabled: false, className: 'border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700' };
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
       {/* Header / Tabs */}
       <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Truck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supply Chain Control Tower</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">End-to-end visibility & provider selection</p>
             </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('tracking')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'tracking' ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-teal-300 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
             >
                Track Shipments
             </button>
             <button 
                onClick={() => setActiveTab('booking')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'booking' ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-teal-300 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
             >
                Find Providers
             </button>
          </div>
       </div>

       {/* TRACKING VIEW */}
       {activeTab === 'tracking' && (
         <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* Shipment List */}
            <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
               {loadingShipments ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  </div>
               ) : liveShipments.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-8 text-center">
                    <Truck className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">No Active Shipments</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Create a trade with status &quot;In Transit&quot; to track shipments here.
                    </p>
                  </div>
               ) : liveShipments.map(shipment => (
                  <div 
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedShipment?.id === shipment.id 
                        ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 ring-1 ring-teal-500' 
                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-teal-300'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-xs font-bold text-gray-500">{shipment.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            shipment.status === 'on_time' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            shipment.status === 'delayed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                            {shipment.status.replace('_', ' ')}
                        </span>
                     </div>
                     <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{shipment.origin.split(',')[0]}</p>
                            <p className="text-xs text-gray-500">Origin</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{shipment.destination.split(',')[0]}</p>
                            <p className="text-xs text-gray-500">Destination</p>
                        </div>
                     </div>
                     <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 transition-all duration-1000 ease-linear" style={{ width: `${shipment.progress}%` }} />
                     </div>
                     <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>{shipment.carrier}</span>
                        <span>ETA: {shipment.eta}</span>
                     </div>
                  </div>
               ))}
            </div>

            {/* Detail View */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                {!selectedShipment ? (
                  <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                    <Truck className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">No Shipment Selected</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select a shipment from the list or create a new trade to start tracking.
                    </p>
                  </div>
                ) : (
                <>
                {/* Status Card & Map Placeholder */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                {selectedShipment.origin} <span className="text-gray-300">→</span> {selectedShipment.destination}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Via {selectedShipment.mode} Freight • Carrier: {selectedShipment.carrier}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-bold text-gray-400 uppercase">Estimated Arrival</p>
                             <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedShipment.eta}</p>
                        </div>
                    </div>
                    
                    {/* Visual Timeline */}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between relative">
                            {/* Connector Line */}
                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-slate-700 -z-10" />
                            
                            {selectedShipment.timeline.map((event, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                                        event.status === 'completed' ? 'bg-teal-500 border-teal-100 dark:border-teal-900 text-white' :
                                        event.status === 'delayed' ? 'bg-red-500 border-red-100 dark:border-red-900 text-white' :
                                        event.status === 'active' ? 'bg-white border-teal-500 text-teal-500 animate-pulse' :
                                        'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-300'
                                    }`}>
                                        {event.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : 
                                         event.status === 'delayed' ? <AlertTriangle className="w-4 h-4" /> :
                                         <div className="w-2 h-2 rounded-full bg-current" />}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{event.location}</p>
                                        <p className="text-[10px] text-gray-500">{event.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Exception Management */}
                {selectedShipment.status === 'at_risk' || selectedShipment.status === 'delayed' ? (
                     <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6 flex flex-col md:flex-row gap-6 animate-fade-in">
                        <div className="flex-1">
                            <h4 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5" /> Exception Detected: Customs Hold
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                Shipment is held at Cotonou border control due to missing Certificate of Conformity. Delay impact: +48h.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => handleAction('Agent Contact')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors">
                                    Contact Agent
                                </button>
                                <button onClick={() => handleAction('Document Upload')} className="px-4 py-2 bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold rounded-lg transition-colors">
                                    Upload Documents
                                </button>
                            </div>
                        </div>
                        <div className="md:w-64 bg-white dark:bg-slate-800 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                             <p className="text-xs font-bold text-gray-500 uppercase mb-2">Root Cause Analysis</p>
                             <div className="space-y-2">
                                 <div className="flex justify-between text-sm">
                                     <span className="text-gray-600 dark:text-gray-400">Doc Compliance</span>
                                     <span className="text-red-500 font-bold">Failed</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                     <span className="text-gray-600 dark:text-gray-400">Duty Payment</span>
                                     <span className="text-emerald-500 font-bold">Verified</span>
                                 </div>
                             </div>
                        </div>
                     </div>
                ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6 flex items-center gap-4">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <div>
                            <h4 className="text-emerald-800 dark:text-emerald-400 font-bold">Shipment On Track</h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">All milestones completed on schedule. No exceptions detected.</p>
                        </div>
                    </div>
                )}
                </>
              )}
            </div>
         </div>
       )}

       {/* BOOKING VIEW */}
       {activeTab === 'booking' && (
           <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
               <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Find & Compare Logistics Providers</h3>
                   <p className="text-gray-500 mb-6">AI-powered benchmarking for African trade routes</p>
                   
                   <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. Freight forwarders from Accra to Lagos for perishable goods..."
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 outline-none transition-all shadow-sm"
                      />
                      <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Compare'}
                      </button>
                   </form>
               </div>

               {/* Comparison Table (Mocked for Demo, usually dynamic) */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {PROVIDERS.map((provider, i) => (
                       <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: provider.color }} />
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <h4 className="font-bold text-lg text-gray-900 dark:text-white">{provider.name}</h4>
                                   <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{provider.type}</span>
                               </div>
                               {provider.name.includes('DHL') && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Recommended</span>}
                           </div>
                           
                           <div className="space-y-3 mb-6">
                               <div className="flex justify-between text-sm">
                                   <span className="text-gray-500">Cost</span>
                                   <div className="flex text-gray-900 dark:text-white font-bold">{provider.cost}</div>
                               </div>
                               <div className="flex justify-between text-sm">
                                   <span className="text-gray-500">Speed</span>
                                   <span className="text-gray-900 dark:text-white font-bold">{provider.speed}</span>
                               </div>
                               <div className="flex justify-between text-sm">
                                   <span className="text-gray-500">Reliability</span>
                                   <span className="text-emerald-600 font-bold">{provider.reliability}</span>
                               </div>
                           </div>
                           
                           <button
                               onClick={() => handleAction('Quote Request', provider.name)}
                               disabled={getQuoteButtonState(provider.name).disabled}
                               className={`w-full py-2.5 rounded-lg border font-bold transition-colors ${getQuoteButtonState(provider.name).className}`}
                           >
                               {getQuoteButtonState(provider.name).text}
                           </button>
                       </div>
                   ))}
               </div>

               {/* Gemini Results */}
               {result && (
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" /> AI Insights
                      </h4>
                      <div className="prose prose-sm prose-teal dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                          <div className="whitespace-pre-wrap">{result.text}</div>
                      </div>
                      
                      {result.maps.length > 0 && (
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {result.maps.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                   <MapPin className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                                   <div>
                                       <h5 className="text-sm font-bold text-gray-900 dark:text-white">{source.title}</h5>
                                       {source.address && <p className="text-xs text-gray-500 line-clamp-1">{source.address}</p>}
                                   </div>
                                </a>
                              ))}
                          </div>
                      )}
                  </div>
               )}
           </div>
       )}
    </div>
  );
};