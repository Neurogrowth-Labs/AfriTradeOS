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
  Plus,
  Map as MapIcon,
  ShieldCheck,
  Calendar,
  ChevronDown,
  ChevronRight,
  Circle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { getLogisticsInfo } from '../services/geminiService';
import { mockDatabase } from '../services/mockDatabase';
import { enterpriseExporterService, ShipmentTracking } from '../services/enterpriseExporterService';

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

// Route risk data for color-coded risk levels
interface RouteRisk {
  id: string;
  name: string;
  type: 'port' | 'customs' | 'route';
  risk: 'low' | 'medium' | 'high' | 'critical';
  location: { x: number; y: number };
  detail: string;
  avgDelay: string;
}

// Route map node for SVG visualization
interface RouteNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'origin' | 'port' | 'customs' | 'transit' | 'destination';
}

// ETA Timeline entry
interface ETAEntry {
  id: string;
  shipmentId: string;
  milestone: string;
  planned: string;
  actual?: string;
  status: 'completed' | 'on_time' | 'delayed' | 'upcoming';
  delayHours?: number;
}

const ROUTE_RISKS: RouteRisk[] = [
  { id: 'rr1', name: 'Port of Lagos (Apapa)', type: 'port', risk: 'high', location: { x: 320, y: 350 }, detail: 'Congestion & container backlog, avg 72h wait', avgDelay: '+72h' },
  { id: 'rr2', name: 'Tema Port', type: 'port', risk: 'low', location: { x: 280, y: 320 }, detail: 'Efficient operations, automated gates', avgDelay: '+4h' },
  { id: 'rr3', name: 'Mombasa Port', type: 'port', risk: 'medium', location: { x: 600, y: 470 }, detail: 'Moderate congestion, customs digitized', avgDelay: '+24h' },
  { id: 'rr4', name: 'Cotonou Customs', type: 'customs', risk: 'critical', location: { x: 330, y: 340 }, detail: 'Manual inspections, high corruption index', avgDelay: '+96h' },
  { id: 'rr5', name: 'Kenya-Uganda Border', type: 'customs', risk: 'medium', location: { x: 580, y: 430 }, detail: 'OSBP operational but periodic delays', avgDelay: '+12h' },
  { id: 'rr6', name: 'Trans-Sahara Route', type: 'route', risk: 'high', location: { x: 380, y: 200 }, detail: 'Poor road infrastructure, security risks', avgDelay: '+48h' },
  { id: 'rr7', name: 'Durban Port', type: 'port', risk: 'low', location: { x: 520, y: 720 }, detail: 'Modern deep-water port, quick turnaround', avgDelay: '+8h' },
  { id: 'rr8', name: 'Northern Corridor', type: 'route', risk: 'medium', location: { x: 560, y: 450 }, detail: 'Mombasa-Nairobi-Kampala, improving', avgDelay: '+18h' },
];

const MOCK_ETA_TIMELINE: ETAEntry[] = [
  { id: 'eta1', shipmentId: 'SH-001', milestone: 'Export – Cargo Pickup', planned: 'Jan 15, 08:00', actual: 'Jan 15, 08:30', status: 'completed', delayHours: 0.5 },
  { id: 'eta2', shipmentId: 'SH-001', milestone: 'Export – Port of Origin', planned: 'Jan 16, 14:00', actual: 'Jan 16, 16:00', status: 'completed', delayHours: 2 },
  { id: 'eta3', shipmentId: 'SH-001', milestone: 'In Transit – Customs Clearance', planned: 'Jan 17, 10:00', actual: 'Jan 18, 14:00', status: 'delayed', delayHours: 28 },
  { id: 'eta4', shipmentId: 'SH-001', milestone: 'In Transit – Vessel Departure', planned: 'Jan 19, 06:00', status: 'on_time' },
  { id: 'eta5', shipmentId: 'SH-001', milestone: 'Import – Port of Destination', planned: 'Jan 25, 12:00', status: 'upcoming' },
  { id: 'eta6', shipmentId: 'SH-001', milestone: 'Delivery – Last Mile', planned: 'Jan 27, 09:00', status: 'upcoming' },
];

// Provider data (static reference data)
const PROVIDERS = [
  { name: 'Maersk Line', type: 'Ocean', cost: '$$', speed: 'Slow', reliability: 'High (98%)', color: '#3b82f6' },
  { name: 'DHL Global', type: 'Air/Road', cost: '$$$$', speed: 'Fast', reliability: 'High (99%)', color: '#eab308' },
  { name: 'Bolloré Logistics', type: 'Road', cost: '$$', speed: 'Medium', reliability: 'Medium (85%)', color: '#6366f1' },
];

export const Logistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'booking' | 'route_map' | 'risk_levels' | 'eta_timeline'>('tracking');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RouteRisk | null>(null);
  const [riskFilter, setRiskFilter] = useState<'all' | 'port' | 'customs' | 'route'>('all');
  const [showCustomsDetails, setShowCustomsDetails] = useState(false);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [applyingRoute, setApplyingRoute] = useState(false);
  const [filingCustoms, setFilingCustoms] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setMapZoom(prev => Math.min(prev + 0.3, 4));
  const handleZoomOut = () => setMapZoom(prev => Math.max(prev - 0.3, 0.5));
  const handleResetZoom = () => { setMapZoom(1); setMapPan({ x: 0, y: 0 }); };

  const handleMapWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setMapZoom(prev => Math.min(Math.max(prev + delta, 0.5), 4));
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - mapPan.x, y: e.clientY - mapPan.y });
  };
  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setMapPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const handleMapMouseUp = () => setIsPanning(false);
  const [liveShipments, setLiveShipments] = useState<Shipment[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(true);

  // Booking State
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; maps: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const userLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi

  // Fetch shipments from database on mount - Supabase first, fallback to mock
  useEffect(() => {
    const fetchShipments = async () => {
      setLoadingShipments(true);
      try {
        // Try to fetch from Supabase first
        const supabaseShipments = await enterpriseExporterService.getShipments();
        
        if (supabaseShipments.length > 0) {
          // Convert Supabase shipments to local format
          const shipments: Shipment[] = supabaseShipments.map((s: ShipmentTracking) => {
            // Calculate progress based on status
            const statusProgress: Record<string, number> = {
              booked: 5, picked_up: 15, at_origin_port: 25, departed: 35,
              in_transit: 55, at_destination_port: 75, customs_hold: 80,
              cleared: 85, out_for_delivery: 92, delivered: 100
            };
            return {
              id: s.id,
              origin: s.origin_port || 'Origin',
              destination: s.destination_port || 'Destination',
              status: s.status === 'delivered' ? 'delivered' : s.status === 'customs_hold' ? 'delayed' : 'on_time',
              eta: s.eta ? new Date(s.eta).toLocaleDateString() : 'TBD',
              progress: statusProgress[s.status] || 50,
              mode: s.transport_mode === 'sea' ? 'Sea' : s.transport_mode === 'air' ? 'Air' : 'Road',
              carrier: s.carrier_name || 'Pending Assignment',
              timeline: s.timeline && Array.isArray(s.timeline) ? s.timeline.map((t: { date: string; event: string; location: string }) => ({
                location: t.location || '',
                date: t.date || '',
                status: 'completed',
                label: t.event || ''
              })) : [
                { location: s.origin_port || 'Origin', date: s.departure_date || 'Pending', status: 'completed', label: 'Departed' },
                { location: s.current_location || 'In Transit', date: 'Current', status: 'active', label: 'In Transit' },
                { location: s.destination_port || 'Destination', date: s.eta || 'Est.', status: 'pending', label: 'Arrival' },
              ]
            };
          });
          setLiveShipments(shipments);
          if (shipments.length > 0) {
            setSelectedShipment(shipments[0]);
          }
        } else {
          // Fallback to mock database
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

  // Check Shipments handlers
  const handleViewCustomsDetails = () => {
    setShowCustomsDetails(true);
  };

  const handleDismissAlert = (alertType: string) => {
    setDismissedAlerts([...dismissedAlerts, alertType]);
  };

  const handleApplyRoute = async () => {
    setApplyingRoute(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Optimized route applied successfully! Your shipment route has been updated.');
    } catch (error) {
      alert('Failed to apply route. Please try again.');
    } finally {
      setApplyingRoute(false);
    }
  };

  const handleFileCustoms = async () => {
    setFilingCustoms(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Customs documents filed successfully for ${liveShipments.length} shipment(s)!`);
    } catch (error) {
      alert('Failed to file customs documents. Please try again.');
    } finally {
      setFilingCustoms(false);
    }
  };

  const handleViewQRCodes = () => {
    setShowQRCodes(true);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
       {/* Header / Tabs */}
       <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Truck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipment Tracking & Logistics</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Real-time GPS tracking, multi-leg visualization & AI ETA predictions</p>
             </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg overflow-x-auto">
             {[
               { id: 'tracking' as const, label: 'Track', icon: Truck },
               { id: 'booking' as const, label: 'Providers', icon: Navigation },
               { id: 'route_map' as const, label: 'Route Map', icon: MapIcon },
               { id: 'risk_levels' as const, label: 'Risk Levels', icon: ShieldCheck },
               { id: 'eta_timeline' as const, label: 'ETA Timeline', icon: Calendar },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                   activeTab === tab.id
                     ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-teal-300 shadow-sm'
                     : 'text-gray-500 dark:text-gray-400'
                 }`}
               >
                 <tab.icon className="w-3.5 h-3.5" /> {tab.label}
               </button>
             ))}
          </div>
       </div>

       {liveShipments.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {!dismissedAlerts.includes('customs') && (
             <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3">
               <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
                 <AlertTriangle className="w-4 h-4 text-amber-600" />
               </div>
               <div className="flex-1">
                 <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Customs Clearance Update</p>
                 <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">Port congestion at Lagos — expect +24h delay on shipments via Apapa terminal.</p>
                 <div className="flex gap-2 mt-2">
                   <button
                     onClick={handleViewCustomsDetails}
                     className="text-[10px] font-bold text-amber-700 hover:text-amber-900 underline"
                   >
                     View Details
                   </button>
                   <button
                     onClick={() => handleDismissAlert('customs')}
                     className="text-[10px] text-gray-500 hover:text-gray-700"
                   >
                     Dismiss
                   </button>
                 </div>
               </div>
             </div>
           )}

           {!dismissedAlerts.includes('route') && (
             <div className="bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-900/30 rounded-xl p-4 flex items-start gap-3">
               <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg shrink-0">
                 <Navigation className="w-4 h-4 text-teal-600" />
               </div>
               <div className="flex-1">
                 <p className="text-xs font-bold text-teal-800 dark:text-teal-300">Route Optimization</p>
                 <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-0.5">Switch to Tema Port (Ghana) via AfCFTA free trade zone — save <span className="font-bold">$1,200</span> and <span className="font-bold">2 days</span> transit time.</p>
                 <button
                   onClick={handleApplyRoute}
                   disabled={applyingRoute}
                   className="mt-2 text-[10px] font-bold bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                 >
                   {applyingRoute ? (
                     <>
                       <Loader2 className="w-3 h-3 animate-spin" /> Applying...
                     </>
                   ) : (
                     'Apply Route'
                   )}
                 </button>
               </div>
             </div>
           )}

           {!dismissedAlerts.includes('customs-filing') && (
             <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-xl p-4 flex items-start gap-3">
               <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg shrink-0">
                 <ShieldCheck className="w-4 h-4 text-indigo-600" />
               </div>
               <div className="flex-1">
                 <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300">Automated Customs Filing</p>
                 <p className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-0.5">Pre-filled customs forms ready for {liveShipments.length} shipment{liveShipments.length > 1 ? 's' : ''}. QR codes generated for faster border processing.</p>
                 <div className="flex gap-2 mt-2">
                   <button
                     onClick={handleFileCustoms}
                     disabled={filingCustoms}
                     className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                   >
                     {filingCustoms ? (
                       <>
                         <Loader2 className="w-3 h-3 animate-spin" /> Filing...
                       </>
                     ) : (
                       'File Now'
                     )}
                   </button>
                   <button
                     onClick={handleViewQRCodes}
                     className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                   >
                     View QR Codes
                   </button>
                 </div>
               </div>
             </div>
           )}
         </div>
       )}

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

       {/* A12: INTERACTIVE ROUTE MAP */}
       {activeTab === 'route_map' && (
         <div
           className="flex-1 bg-slate-900 rounded-xl shadow-lg relative overflow-hidden border border-slate-700 min-h-[500px]"
           onWheel={handleMapWheel}
           onMouseDown={handleMapMouseDown}
           onMouseMove={handleMapMouseMove}
           onMouseUp={handleMapMouseUp}
           onMouseLeave={handleMapMouseUp}
           style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
         >
           {/* Map Legend */}
           <div className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                 <MapIcon className="w-3.5 h-3.5 text-teal-400" />
                 <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Route Risk Map</span>
              </div>
              <div className="flex gap-3 text-[10px]">
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> <span className="text-slate-400">Low</span></div>
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-slate-400">Medium</span></div>
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> <span className="text-slate-400">High</span></div>
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-700" /> <span className="text-slate-400">Critical</span></div>
              </div>
           </div>

           {/* Zoom Controls */}
           <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
             <button onClick={handleZoomIn} className="p-2 bg-slate-800/90 backdrop-blur hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors" title="Zoom In">
               <ZoomIn className="w-4 h-4" />
             </button>
             <button onClick={handleZoomOut} className="p-2 bg-slate-800/90 backdrop-blur hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors" title="Zoom Out">
               <ZoomOut className="w-4 h-4" />
             </button>
             <button onClick={handleResetZoom} className="p-2 bg-slate-800/90 backdrop-blur hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors" title="Reset View">
               <Maximize2 className="w-4 h-4" />
             </button>
             <div className="text-center text-[10px] text-slate-500 font-mono mt-1">{Math.round(mapZoom * 100)}%</div>
           </div>

           {/* SVG Map */}
           <svg viewBox="0 0 800 800" className="w-full h-full" style={{ transform: `scale(${mapZoom}) translate(${mapPan.x / mapZoom}px, ${mapPan.y / mapZoom}px)`, transformOrigin: 'center center', transition: isPanning ? 'none' : 'transform 0.2s ease-out' }}>
             <defs>
               <radialGradient id="mapBg" cx="50%" cy="50%" r="50%">
                 <stop offset="0%" stopColor="#1e293b" />
                 <stop offset="100%" stopColor="#0f172a" />
               </radialGradient>
             </defs>
             <rect width="800" height="800" fill="url(#mapBg)" />

             {/* Africa outline (simplified) */}
             <path d="M 280 60 Q 200 100 150 250 Q 130 350 160 450 Q 200 550 300 620 Q 350 680 420 750 Q 480 780 520 720 Q 560 650 580 550 Q 620 450 650 350 Q 660 250 600 150 Q 550 80 450 60 Q 370 50 280 60 Z"
                   fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />

             {/* Route lines connecting hubs */}
             {liveShipments.map((s, i) => {
               const x1 = 250 + (i * 60);
               const y1 = 250 + (i * 40);
               const x2 = 450 + (i * 40);
               const y2 = 400 + (i * 30);
               return (
                 <g key={s.id}>
                   <line x1={x1} y1={y1} x2={x2} y2={y2}
                     stroke={s.status === 'on_time' ? '#10b981' : s.status === 'delayed' ? '#f59e0b' : '#ef4444'}
                     strokeWidth="2" strokeDasharray="6 3" opacity={0.7}>
                     <animate attributeName="stroke-dashoffset" values="0;-18" dur="2s" repeatCount="indefinite" />
                   </line>
                   {/* Moving dot */}
                   <circle r="4" fill={s.status === 'on_time' ? '#10b981' : '#f59e0b'}>
                     <animateMotion dur="4s" repeatCount="indefinite"
                       path={`M ${x1} ${y1} L ${x2} ${y2}`} />
                   </circle>
                   {/* Labels */}
                   <text x={x1 - 10} y={y1 - 10} fill="#94a3b8" fontSize="9" textAnchor="end">{s.origin}</text>
                   <text x={x2 + 10} y={y2 + 15} fill="#94a3b8" fontSize="9">{s.destination}</text>
                 </g>
               );
             })}

             {/* Risk points on map */}
             {ROUTE_RISKS.map(rr => {
               const riskColor = rr.risk === 'low' ? '#10b981' : rr.risk === 'medium' ? '#f59e0b' : rr.risk === 'high' ? '#ef4444' : '#991b1b';
               return (
                 <g key={rr.id} onClick={() => setSelectedRisk(selectedRisk?.id === rr.id ? null : rr)} className="cursor-pointer">
                   <circle cx={rr.location.x} cy={rr.location.y} r="8" fill={riskColor} opacity={0.3}>
                     <animate attributeName="r" values="8;14;8" dur="3s" repeatCount="indefinite" />
                   </circle>
                   <circle cx={rr.location.x} cy={rr.location.y} r="5" fill={riskColor} stroke="#0f172a" strokeWidth="2" />
                   <text x={rr.location.x + 12} y={rr.location.y + 4} fill="#cbd5e1" fontSize="8" fontWeight="bold">{rr.name.split(' ')[0]}</text>
                 </g>
               );
             })}
           </svg>

           {/* Selected Risk Detail */}
           {selectedRisk && (
             <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700 z-20 animate-fade-in">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selectedRisk.name}</h4>
                   <div className="flex items-center gap-2 mt-1">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                       selectedRisk.risk === 'low' ? 'bg-green-100 text-green-700' :
                       selectedRisk.risk === 'medium' ? 'bg-amber-100 text-amber-700' :
                       selectedRisk.risk === 'high' ? 'bg-red-100 text-red-700' : 'bg-red-200 text-red-900'
                     }`}>{selectedRisk.risk} risk</span>
                     <span className="text-[10px] text-gray-500 capitalize">{selectedRisk.type}</span>
                   </div>
                 </div>
                 <button onClick={() => setSelectedRisk(null)} className="text-gray-400 hover:text-gray-700">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               <p className="text-xs text-gray-500 mb-2">{selectedRisk.detail}</p>
               <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                 <span className="text-xs text-gray-500">Avg. Delay</span>
                 <span className={`text-sm font-bold ${
                   selectedRisk.risk === 'low' ? 'text-green-600' : selectedRisk.risk === 'medium' ? 'text-amber-600' : 'text-red-600'
                 }`}>{selectedRisk.avgDelay}</span>
               </div>
             </div>
           )}
         </div>
       )}

       {/* A13: COLOR-CODED RISK LEVELS */}
       {activeTab === 'risk_levels' && (
         <div className="flex-1 flex flex-col gap-4">
           {/* Filter Bar */}
           <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center justify-between">
             <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-teal-500" /> Risk Assessment Matrix
             </h3>
             <div className="flex gap-2">
               {(['all', 'port', 'customs', 'route'] as const).map(f => (
                 <button
                   key={f}
                   onClick={() => setRiskFilter(f)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                     riskFilter === f
                       ? 'bg-teal-500 text-white'
                       : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                   }`}
                 >
                   {f === 'all' ? 'All' : f}
                 </button>
               ))}
             </div>
           </div>

           {/* Risk Cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {ROUTE_RISKS
               .filter(rr => riskFilter === 'all' || rr.type === riskFilter)
               .map(rr => {
                 const riskConfig = {
                   low: { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-900/30', text: 'text-green-700', badge: 'bg-green-100 text-green-800', icon: CheckCircle, barColor: 'bg-green-500', barWidth: '25%' },
                   medium: { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-900/30', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', icon: Clock, barColor: 'bg-amber-500', barWidth: '50%' },
                   high: { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-900/30', text: 'text-red-700', badge: 'bg-red-100 text-red-800', icon: AlertTriangle, barColor: 'bg-red-500', barWidth: '75%' },
                   critical: { bg: 'bg-red-100 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-800', text: 'text-red-900', badge: 'bg-red-200 text-red-900', icon: AlertTriangle, barColor: 'bg-red-700', barWidth: '100%' },
                 };
                 const cfg = riskConfig[rr.risk];
                 const RiskIcon = cfg.icon;
                 return (
                   <div key={rr.id} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 transition-all hover:shadow-md`}>
                     <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center gap-2">
                         <RiskIcon className={`w-4 h-4 ${cfg.text}`} />
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${cfg.badge}`}>{rr.risk}</span>
                       </div>
                       <span className="text-[10px] text-gray-500 capitalize bg-white dark:bg-slate-800 px-2 py-0.5 rounded">{rr.type}</span>
                     </div>
                     <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{rr.name}</h4>
                     <p className="text-xs text-gray-500 mb-3">{rr.detail}</p>
                     <div className="flex items-center justify-between">
                       <div className="flex-1 mr-3">
                         <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                           <div className={`h-full ${cfg.barColor} rounded-full`} style={{ width: cfg.barWidth }} />
                         </div>
                       </div>
                       <span className={`text-xs font-bold ${cfg.text}`}>{rr.avgDelay}</span>
                     </div>
                   </div>
                 );
               })}
           </div>

           {/* Summary Stats */}
           <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
             <div className="grid grid-cols-4 gap-4 text-center">
               <div>
                 <p className="text-xs text-gray-500">Low Risk</p>
                 <p className="text-2xl font-bold text-green-600">{ROUTE_RISKS.filter(r => r.risk === 'low').length}</p>
               </div>
               <div>
                 <p className="text-xs text-gray-500">Medium</p>
                 <p className="text-2xl font-bold text-amber-600">{ROUTE_RISKS.filter(r => r.risk === 'medium').length}</p>
               </div>
               <div>
                 <p className="text-xs text-gray-500">High</p>
                 <p className="text-2xl font-bold text-red-600">{ROUTE_RISKS.filter(r => r.risk === 'high').length}</p>
               </div>
               <div>
                 <p className="text-xs text-gray-500">Critical</p>
                 <p className="text-2xl font-bold text-red-900">{ROUTE_RISKS.filter(r => r.risk === 'critical').length}</p>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* A14: ETA TIMELINE VIEW */}
       {activeTab === 'eta_timeline' && (
         <div className="flex-1 flex flex-col gap-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
             <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
               <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-teal-500" /> ETA & Delay Timeline
               </h3>
               <div className="flex items-center gap-3 text-xs">
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> On Time</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Delayed</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /> Upcoming</span>
               </div>
             </div>
             <div className="p-5">
               {/* Timeline */}
               <div className="relative">
                 <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />
                 {MOCK_ETA_TIMELINE.map((entry, idx) => {
                   const statusConfig = {
                     completed: { bg: 'bg-green-500', ring: 'ring-green-200', text: 'text-green-700', label: 'Completed' },
                     on_time: { bg: 'bg-blue-500', ring: 'ring-blue-200', text: 'text-blue-700', label: 'On Time' },
                     delayed: { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', label: 'Delayed' },
                     upcoming: { bg: 'bg-gray-300', ring: 'ring-gray-100', text: 'text-gray-500', label: 'Upcoming' },
                   };
                   const cfg = statusConfig[entry.status];
                   return (
                     <div key={entry.id} className="relative flex items-start gap-4 mb-6 last:mb-0">
                       {/* Dot */}
                       <div className={`relative z-10 w-3 h-3 rounded-full ${cfg.bg} ring-4 ${cfg.ring} mt-1.5 ml-[18px]`} />
                       
                       {/* Content */}
                       <div className="flex-1 ml-2">
                         <div className={`p-4 rounded-xl border ${
                           entry.status === 'delayed' ? 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10' :
                           entry.status === 'completed' ? 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30' :
                           'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                         }`}>
                           <div className="flex items-center justify-between mb-2">
                             <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                               {entry.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                               {entry.status === 'delayed' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                               {entry.status === 'on_time' && <Clock className="w-4 h-4 text-blue-500" />}
                               {entry.status === 'upcoming' && <Circle className="w-4 h-4 text-gray-400" />}
                               {entry.milestone}
                             </h4>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                               entry.status === 'completed' ? 'bg-green-100 text-green-700' :
                               entry.status === 'delayed' ? 'bg-red-100 text-red-700' :
                               entry.status === 'on_time' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                             }`}>{cfg.label}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-xs">
                             <div>
                               <p className="text-gray-400 uppercase text-[10px] mb-0.5">Planned</p>
                               <p className="font-medium text-gray-700 dark:text-gray-300">{entry.planned}</p>
                             </div>
                             {entry.actual && (
                               <div>
                                 <p className="text-gray-400 uppercase text-[10px] mb-0.5">Actual</p>
                                 <p className={`font-medium ${entry.status === 'delayed' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>{entry.actual}</p>
                               </div>
                             )}
                           </div>
                           {entry.delayHours && entry.delayHours > 1 && (
                             <div className="mt-2 flex items-center gap-2 text-xs">
                               <AlertTriangle className="w-3 h-3 text-red-500" />
                               <span className="text-red-600 font-bold">+{entry.delayHours}h delay</span>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           </div>

           {/* AI ETA Prediction */}
           <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-xl p-4 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-10">
               <Zap className="w-16 h-16" />
             </div>
             <div className="relative z-10 flex items-start gap-3">
               <div className="p-2 bg-white/20 rounded-lg">
                 <Zap className="w-4 h-4" />
               </div>
               <div>
                 <h4 className="font-bold text-sm mb-1">AI ETA Prediction</h4>
                 <p className="text-xs opacity-90">Based on current customs processing times, weather conditions, and port congestion at destination, we estimate a <span className="font-bold">+30h total delay</span> from original schedule. Consider notifying your supplier about adjusted delivery windows.</p>
               </div>
             </div>
           </div>

           {/* Delay Summary Bar */}
           <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
             <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Delay Impact Summary</h4>
             <div className="grid grid-cols-3 gap-4 text-center">
               <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                 <p className="text-xs text-gray-500">On Schedule</p>
                 <p className="text-xl font-bold text-green-600">{MOCK_ETA_TIMELINE.filter(e => e.status === 'completed' || e.status === 'on_time').length}</p>
               </div>
               <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                 <p className="text-xs text-gray-500">Delayed</p>
                 <p className="text-xl font-bold text-red-600">{MOCK_ETA_TIMELINE.filter(e => e.status === 'delayed').length}</p>
               </div>
               <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                 <p className="text-xs text-gray-500">Total Delay</p>
                 <p className="text-xl font-bold text-amber-600">{MOCK_ETA_TIMELINE.reduce((acc, e) => acc + (e.delayHours || 0), 0)}h</p>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* CUSTOMS DETAILS MODAL */}
       {showCustomsDetails && (
         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-100 dark:border-slate-700">
               <div className="flex justify-between items-start">
                 <div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customs Clearance Details</h2>
                   <p className="text-sm text-gray-500 mt-1">Port of Lagos (Apapa Terminal)</p>
                 </div>
                 <button
                   onClick={() => setShowCustomsDetails(false)}
                   className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                 >
                   <X className="w-5 h-5 text-gray-500" />
                 </button>
               </div>
             </div>
             <div className="p-6 space-y-4">
               <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                 <div className="flex items-start gap-3">
                   <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                   <div>
                     <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">Current Situation</h3>
                     <p className="text-sm text-amber-800 dark:text-amber-400">
                       High congestion at Apapa terminal due to container backlog. Average processing time increased from 48h to 72h.
                     </p>
                   </div>
                 </div>
               </div>

               <div>
                 <h3 className="font-bold text-gray-900 dark:text-white mb-3">Affected Shipments</h3>
                 <div className="space-y-2">
                   {liveShipments.slice(0, 3).map(shipment => (
                     <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                       <div>
                         <p className="font-medium text-gray-900 dark:text-white text-sm">{shipment.id}</p>
                         <p className="text-xs text-gray-500">{shipment.origin} → {shipment.destination}</p>
                       </div>
                       <span className="text-xs font-bold text-amber-600">+24h delay</span>
                     </div>
                   ))}
                 </div>
               </div>

               <div>
                 <h3 className="font-bold text-gray-900 dark:text-white mb-3">Recommended Actions</h3>
                 <ul className="space-y-2">
                   <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                     <span>Consider re-routing through Tema Port (Ghana) for faster processing</span>
                   </li>
                   <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                     <span>Ensure all customs documentation is pre-filed to minimize delays</span>
                   </li>
                   <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                     <span>Notify buyers of potential delivery delays</span>
                   </li>
                 </ul>
               </div>

               <button
                 onClick={() => setShowCustomsDetails(false)}
                 className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
               >
                 Close
               </button>
             </div>
           </div>
         </div>
       )}

       {/* QR CODES MODAL */}
       {showQRCodes && (
         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-100 dark:border-slate-700">
               <div className="flex justify-between items-start">
                 <div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipment QR Codes</h2>
                   <p className="text-sm text-gray-500 mt-1">Scan at customs checkpoints for faster processing</p>
                 </div>
                 <button
                   onClick={() => setShowQRCodes(false)}
                   className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                 >
                   <X className="w-5 h-5 text-gray-500" />
                 </button>
               </div>
             </div>
             <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {liveShipments.map(shipment => (
                   <div key={shipment.id} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                     <div className="mb-3">
                       <p className="font-mono text-xs font-bold text-gray-900 dark:text-white">{shipment.id}</p>
                       <p className="text-xs text-gray-500">{shipment.origin} → {shipment.destination}</p>
                     </div>

                     {/* QR Code placeholder - in production, use a QR code library */}
                     <div className="aspect-square bg-white rounded-lg p-4 mb-3 flex items-center justify-center border-2 border-gray-200">
                       <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                         <div className="text-center">
                           <div className="w-32 h-32 mx-auto bg-white/50 rounded grid grid-cols-8 gap-[2px] p-1">
                             {Array.from({ length: 64 }).map((_, i) => (
                               <div
                                 key={i}
                                 className={`${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-white'} rounded-sm`}
                               />
                             ))}
                           </div>
                           <p className="text-[10px] text-gray-600 mt-2 font-mono">{shipment.id}</p>
                         </div>
                       </div>
                     </div>

                     <div className="flex gap-2">
                       <button className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                         Download
                       </button>
                       <button className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                         Print
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