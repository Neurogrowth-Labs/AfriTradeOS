import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  MapPin,
  Package,
  Users,
  FileText,
  CreditCard,
  Shield,
  Settings,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  Leaf,
  Navigation,
  Star,
  Phone,
  MessageSquare,
  Upload,
  Receipt,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Plus,
  ExternalLink,
  Zap,
  Calendar,
  DollarSign,
  Percent,
  Target,
  Award,
  ShieldCheck,
  FileCheck,
  Wrench,
  UserCheck,
  Globe,
  Anchor,
  Plane,
  Train,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Send,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Building,
  Briefcase,
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  Loader2
} from 'lucide-react';
import {
  logisticsProviderService,
  LogisticsKPIs,
  FleetVehicle,
  FleetDriver,
  ActiveShipment,
  LogisticsTender,
  LogisticsInvoice,
  ComplianceDocument,
  BorderAlert,
  Client,
  BackhaulOpportunity
} from '../services/logisticsProviderService';

type LogisticsTab = 'dashboard' | 'fleet' | 'shipments' | 'clients' | 'tenders' | 'invoicing' | 'compliance' | 'settings';

interface LogisticsProviderPanelProps {
  userRole?: string;
  navigateTo?: (view: string) => void;
}

export const LogisticsProviderPanel: React.FC<LogisticsProviderPanelProps> = ({ userRole, navigateTo }) => {
  // Tab State
  const [activeTab, setActiveTab] = useState<LogisticsTab>('dashboard');

  // Data States
  const [kpis, setKpis] = useState<LogisticsKPIs | null>(null);
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);
  const [shipments, setShipments] = useState<ActiveShipment[]>([]);
  const [tenders, setTenders] = useState<LogisticsTender[]>([]);
  const [invoices, setInvoices] = useState<LogisticsInvoice[]>([]);
  const [complianceDocs, setComplianceDocs] = useState<ComplianceDocument[]>([]);
  const [borderAlerts, setBorderAlerts] = useState<BorderAlert[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [backhaulOpps, setBackhaulOpps] = useState<BackhaulOpportunity[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [liveRefresh, setLiveRefresh] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<ActiveShipment | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [fleetView, setFleetView] = useState<'table' | 'cards' | 'map'>('cards');
  const [fleetFilter, setFleetFilter] = useState<'all' | 'available' | 'in_transit' | 'maintenance'>('all');
  const [tenderView, setTenderView] = useState<'kanban' | 'list'>('kanban');
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [shipmentFilter, setShipmentFilter] = useState<'all' | 'in_transit' | 'at_border' | 'delayed'>('all');

  // Map States
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        kpisData,
        fleetData,
        driversData,
        shipmentsData,
        tendersData,
        invoicesData,
        complianceData,
        alertsData,
        clientsData,
        backhaulData
      ] = await Promise.all([
        logisticsProviderService.getDashboardKPIs(),
        logisticsProviderService.getFleet(),
        logisticsProviderService.getDrivers(),
        logisticsProviderService.getActiveShipments(),
        logisticsProviderService.getTenders(),
        logisticsProviderService.getInvoices(),
        logisticsProviderService.getComplianceDocs(),
        logisticsProviderService.getBorderAlerts(),
        logisticsProviderService.getClients(),
        logisticsProviderService.getBackhaulOpportunities()
      ]);

      setKpis(kpisData);
      setFleet(fleetData);
      setDrivers(driversData);
      setShipments(shipmentsData);
      setTenders(tendersData);
      setInvoices(invoicesData);
      setComplianceDocs(complianceData);
      setBorderAlerts(alertsData);
      setClients(clientsData);
      setBackhaulOpps(backhaulData);

      if (shipmentsData.length > 0 && !selectedShipment) {
        setSelectedShipment(shipmentsData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedShipment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!liveRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [liveRefresh, fetchData]);

  // Tab definitions
  const tabs: { id: LogisticsTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'shipments', label: 'Shipments', icon: Package },
    { id: 'clients', label: 'Find Clients', icon: Users },
    { id: 'tenders', label: 'Tenders', icon: FileText },
    { id: 'invoicing', label: 'Invoicing', icon: CreditCard },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Helper functions
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      at_border: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      customs_hold: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      idle: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cleared: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      picked_up: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      booked: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      new: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      awarded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      valid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      expiring_soon: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getRiskColor = (risk: string): string => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      critical: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300'
    };
    return colors[risk] || 'bg-gray-100 text-gray-700';
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      low: 'border-green-500 bg-green-50 dark:bg-green-900/10',
      medium: 'border-amber-500 bg-amber-50 dark:bg-amber-900/10',
      high: 'border-red-500 bg-red-50 dark:bg-red-900/10',
      critical: 'border-red-700 bg-red-100 dark:bg-red-900/20'
    };
    return colors[severity] || 'border-gray-500 bg-gray-50';
  };

  const getModeIcon = (mode: string): React.ElementType => {
    const icons: Record<string, React.ElementType> = {
      road: Truck,
      sea: Anchor,
      air: Plane,
      rail: Train,
      multimodal: Globe
    };
    return icons[mode] || Truck;
  };

  // Render Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +{kpis?.revenueTrend || 0}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${((kpis?.revenueMonth || 0) / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500">Revenue (Month)</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-blue-600">{kpis?.shipmentsInTransit || 0} moving</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis?.activeShipments || 0}</p>
          <p className="text-xs text-gray-500">Active Shipments</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-5 h-5 text-teal-500" />
            <span className="text-xs text-teal-600">{kpis?.fleetActive || 0}/{kpis?.fleetTotal || 0}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis?.fleetUtilization || 0}%</p>
          <p className="text-xs text-gray-500">Fleet Utilization</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-amber-500" />
            {(kpis?.customsRiskScore || 0) < 70 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis?.customsRiskScore || 0}</p>
          <p className="text-xs text-gray-500">Customs Risk Score</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-xs text-red-600">Avg {kpis?.avgDelayHours || 0}h</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis?.borderDelays || 0}</p>
          <p className="text-xs text-gray-500">Border Delays</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Receipt className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-purple-600">${((kpis?.pendingAmount || 0) / 1000).toFixed(1)}K</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis?.pendingInvoices || 0}</p>
          <p className="text-xs text-gray-500">Pending Invoices</p>
        </div>
      </div>

      {/* Border Alerts */}
      {borderAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
          <h3 className="font-bold text-red-800 dark:text-red-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" /> Critical Border Alerts
          </h3>
          <div className="space-y-2">
            {borderAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{alert.borderPost}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${getRiskColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Wait: {alert.avgWaitTime}</span>
                  <span>{alert.affectedShipments} shipments affected</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Shipments Map */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden min-h-[400px] relative">
          <div className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Live Fleet Tracking</span>
            </div>
            <div className="flex gap-3 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> <span className="text-slate-400">Moving</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-slate-400">At Border</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> <span className="text-slate-400">Delayed</span></div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
            <button onClick={() => setMapZoom(z => Math.min(z + 0.3, 4))} className="p-2 bg-slate-800/90 backdrop-blur hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => setMapZoom(z => Math.max(z - 0.3, 0.5))} className="p-2 bg-slate-800/90 backdrop-blur hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => { setMapZoom(1); setMapPan({ x: 0, y: 0 }); }} className="p-2 bg-slate-800/90 backdrop-blur hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* SVG Map */}
          <svg viewBox="0 0 800 600" className="w-full h-full" style={{ transform: `scale(${mapZoom}) translate(${mapPan.x}px, ${mapPan.y}px)` }}>
            <defs>
              <radialGradient id="mapBgGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
            </defs>
            <rect width="800" height="600" fill="url(#mapBgGrad)" />

            {/* Africa outline */}
            <path d="M 280 40 Q 200 80 150 200 Q 130 300 160 400 Q 200 480 300 520 Q 350 560 420 580 Q 480 590 520 550 Q 560 500 580 420 Q 620 340 650 260 Q 660 180 600 100 Q 550 50 450 40 Q 370 30 280 40 Z"
                  fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Route lines and vehicle positions */}
            {shipments.map((shipment, idx) => {
              const startX = 250 + (idx * 80);
              const startY = 200 + (idx * 60);
              const endX = 500 + (idx * 40);
              const endY = 350 + (idx * 50);
              const progress = shipment.progress / 100;
              const currentX = startX + (endX - startX) * progress;
              const currentY = startY + (endY - startY) * progress;

              const routeColor = shipment.riskLevel === 'low' ? '#10b981' :
                                shipment.riskLevel === 'medium' ? '#f59e0b' : '#ef4444';

              return (
                <g key={shipment.id}>
                  {/* Route line */}
                  <line x1={startX} y1={startY} x2={endX} y2={endY}
                    stroke={routeColor} strokeWidth="2" strokeDasharray="6 3" opacity={0.5}>
                    <animate attributeName="stroke-dashoffset" values="0;-18" dur="2s" repeatCount="indefinite" />
                  </line>

                  {/* Progress line */}
                  <line x1={startX} y1={startY} x2={currentX} y2={currentY}
                    stroke={routeColor} strokeWidth="3" opacity={0.8} />

                  {/* Current position marker */}
                  <circle cx={currentX} cy={currentY} r="12" fill={routeColor} opacity={0.3}>
                    <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={currentX} cy={currentY} r="6" fill={routeColor} stroke="#0f172a" strokeWidth="2" />

                  {/* Labels */}
                  <text x={startX - 5} y={startY - 15} fill="#94a3b8" fontSize="10" textAnchor="end">
                    {shipment.origin.split(',')[0]}
                  </text>
                  <text x={endX + 5} y={endY + 15} fill="#94a3b8" fontSize="10">
                    {shipment.destination.split(',')[0]}
                  </text>
                </g>
              );
            })}

            {/* Fleet vehicles not on shipments */}
            {fleet.filter(v => v.status === 'available' || v.status === 'idle').map((vehicle, idx) => (
              <g key={vehicle.id}>
                <circle cx={300 + idx * 100} cy={450 + idx * 30} r="5" fill="#64748b" stroke="#0f172a" strokeWidth="2" />
                <text x={305 + idx * 100} y={455 + idx * 30} fill="#64748b" fontSize="8">{vehicle.registration}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Right Panel - Alerts & Quick Actions */}
        <div className="space-y-4">
          {/* Available Tenders */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" /> Available Tenders
              </h3>
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {kpis?.availableTenders || 0}
              </span>
            </div>
            <div className="space-y-2">
              {tenders.filter(t => t.status === 'new').slice(0, 3).map(tender => (
                <div key={tender.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{tender.title}</p>
                    <span className="text-xs text-green-600 font-bold">{tender.matchScore}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>${(tender.value / 1000).toFixed(0)}K</span>
                    <span>|</span>
                    <span>Due: {new Date(tender.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab('tenders')} className="w-full mt-3 text-center text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline">
              View All Tenders
            </button>
          </div>

          {/* Backhaul Opportunities */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl p-4 text-white">
            <h3 className="font-bold flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4" /> Backhaul Opportunities
            </h3>
            <div className="space-y-2">
              {backhaulOpps.slice(0, 2).map(opp => (
                <div key={opp.id} className="p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{opp.origin.split(',')[0]} → {opp.destination.split(',')[0]}</p>
                    <span className="text-xs font-bold">${opp.value}</span>
                  </div>
                  <p className="text-xs opacity-80 mt-1">{opp.cargoType} • {opp.weight}</p>
                </div>
              ))}
            </div>
            <p className="text-xs opacity-70 mt-3 text-center">AI-matched to your return routes</p>
          </div>

          {/* Fuel & Emissions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Fuel className="w-4 h-4 text-orange-500" /> Fuel & Emissions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                <p className="text-xl font-bold text-orange-600">${((kpis?.fuelCostMonth || 0) / 1000).toFixed(1)}K</p>
                <p className="text-xs text-gray-500">Fuel (Month)</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <p className="text-xl font-bold text-green-600 flex items-center justify-center gap-1">
                  <Leaf className="w-4 h-4" /> {kpis?.carbonEmissions || 0}t
                </p>
                <p className="text-xs text-gray-500">CO2 (Month)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Shipments Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" /> Active Shipments
          </h3>
          <button onClick={() => setActiveTab('shipments')} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {shipments.slice(0, 5).map(shipment => {
            const ModeIcon = getModeIcon(shipment.transportMode);
            return (
              <div key={shipment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => { setSelectedShipment(shipment); setActiveTab('shipments'); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shipment.riskLevel === 'low' ? 'bg-green-100 dark:bg-green-900/30' : shipment.riskLevel === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      <ModeIcon className={`w-4 h-4 ${shipment.riskLevel === 'low' ? 'text-green-600' : shipment.riskLevel === 'medium' ? 'text-amber-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{shipment.trackingNumber}</p>
                      <p className="text-xs text-gray-500">{shipment.origin.split(',')[0]} → {shipment.destination.split(',')[0]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(shipment.status)}`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">ETA: {shipment.eta}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{shipment.progress}% Complete</span>
                    <span>{shipment.client}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${shipment.riskLevel === 'low' ? 'bg-green-500' : shipment.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${shipment.progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render Fleet Tab
  const renderFleet = () => {
    const filteredFleet = fleet.filter(v => fleetFilter === 'all' || v.status === fleetFilter);

    return (
      <div className="space-y-6">
        {/* Fleet Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fleet Management</h2>
            <p className="text-sm text-gray-500">Manage vehicles, drivers, and maintenance</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
              {(['cards', 'table', 'map'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setFleetView(view)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                    fleetView === view ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
            {/* Filters */}
            <div className="flex gap-2">
              {(['all', 'available', 'in_transit', 'maintenance'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setFleetFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    fleetFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{fleet.length}</p>
                <p className="text-xs text-gray-500">Total Vehicles</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{fleet.filter(v => v.status === 'available').length}</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Navigation className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{fleet.filter(v => v.status === 'in_transit').length}</p>
                <p className="text-xs text-gray-500">In Transit</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{fleet.filter(v => v.status === 'maintenance').length}</p>
                <p className="text-xs text-gray-500">Maintenance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Cards View */}
        {fleetView === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFleet.map(vehicle => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`bg-white dark:bg-slate-800 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedVehicle?.id === vehicle.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100 dark:border-slate-700'
                }`}
              >
                <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        vehicle.status === 'available' ? 'bg-green-100 dark:bg-green-900/30' :
                        vehicle.status === 'in_transit' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        vehicle.status === 'maintenance' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-900/30'
                      }`}>
                        <Truck className={`w-5 h-5 ${
                          vehicle.status === 'available' ? 'text-green-600' :
                          vehicle.status === 'in_transit' ? 'text-blue-600' :
                          vehicle.status === 'maintenance' ? 'text-orange-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{vehicle.registration}</p>
                        <p className="text-xs text-gray-500 capitalize">{vehicle.type} • {vehicle.capacity}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span className="text-gray-900 dark:text-white font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" /> {vehicle.currentLocation}
                    </span>
                  </div>
                  {vehicle.driver && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Driver</span>
                      <span className="text-gray-900 dark:text-white font-medium">{vehicle.driver}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Fuel Level</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${vehicle.fuelLevel > 50 ? 'bg-green-500' : vehicle.fuelLevel > 20 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${vehicle.fuelLevel}%` }} />
                      </div>
                      <span className="text-xs font-medium">{vehicle.fuelLevel}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Health Score</span>
                    <span className={`font-bold ${vehicle.healthScore >= 90 ? 'text-green-600' : vehicle.healthScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                      {vehicle.healthScore}/100
                    </span>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-between text-xs text-gray-500">
                  <span>Next Service: {vehicle.nextMaintenance}</span>
                  <span>{(vehicle.mileage / 1000).toFixed(0)}K km</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fleet Table View */}
        {fleetView === 'table' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Vehicle</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Driver</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fuel</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Health</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredFleet.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{vehicle.registration}</p>
                          <p className="text-xs text-gray-500 capitalize">{vehicle.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{vehicle.driver || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{vehicle.currentLocation}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${vehicle.fuelLevel > 50 ? 'bg-green-500' : vehicle.fuelLevel > 20 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${vehicle.fuelLevel}%` }} />
                        </div>
                        <span className="text-xs">{vehicle.fuelLevel}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${vehicle.healthScore >= 90 ? 'text-green-600' : vehicle.healthScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        {vehicle.healthScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Drivers Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-500" /> Driver Registry
            </h3>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Driver
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {drivers.map(driver => (
              <div key={driver.id} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{driver.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{driver.name}</p>
                    <p className="text-xs text-gray-500">{driver.phone}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(driver.status)}`}>
                    {driver.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-gray-500">Trips</span>
                    <p className="font-medium text-gray-900 dark:text-white">{driver.totalTrips}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Behavior Score</span>
                    <p className={`font-bold ${driver.behaviorScore >= 90 ? 'text-green-600' : driver.behaviorScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                      {driver.behaviorScore}/100
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {driver.certifications.slice(0, 3).map((cert, i) => (
                    <span key={i} className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Shipments Tab
  const renderShipments = () => {
    const filteredShipments = shipments.filter(s => {
      if (shipmentFilter === 'all') return true;
      if (shipmentFilter === 'in_transit') return s.status === 'in_transit' || s.status === 'picked_up';
      if (shipmentFilter === 'at_border') return s.status === 'at_border' || s.status === 'customs_hold';
      if (shipmentFilter === 'delayed') return s.riskLevel === 'high';
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Shipments</h2>
            <p className="text-sm text-gray-500">End-to-end tracking and management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search shipments..."
                className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'in_transit', 'at_border', 'delayed'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setShipmentFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    shipmentFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipment List */}
          <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-2">
            {filteredShipments.map(shipment => {
              const ModeIcon = getModeIcon(shipment.transportMode);
              return (
                <div
                  key={shipment.id}
                  onClick={() => setSelectedShipment(shipment)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedShipment?.id === shipment.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ModeIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-xs font-bold text-gray-500">{shipment.trackingNumber}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRiskColor(shipment.riskLevel)}`}>
                      {shipment.riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{shipment.origin.split(',')[0]}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{shipment.destination.split(',')[0]}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className={`h-full ${shipment.riskLevel === 'low' ? 'bg-green-500' : shipment.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${shipment.progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{shipment.client}</span>
                    <span>ETA: {shipment.eta}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shipment Detail */}
          <div className="lg:col-span-2">
            {selectedShipment ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-gray-500">{selectedShipment.trackingNumber}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(selectedShipment.status)}`}>
                          {selectedShipment.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedShipment.origin} → {selectedShipment.destination}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{selectedShipment.cargo} • {selectedShipment.weight}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold">Value</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">${selectedShipment.value.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                      <Phone className="w-3.5 h-3.5" /> Call Driver
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200">
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200">
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200">
                      <Receipt className="w-3.5 h-3.5" /> Invoice
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">Shipment Timeline</h4>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />
                    <div className="space-y-4">
                      {selectedShipment.timeline.map((milestone, idx) => (
                        <div key={idx} className="relative flex items-start gap-4 ml-1">
                          <div className={`relative z-10 w-3 h-3 rounded-full mt-1.5 ${
                            milestone.status === 'completed' ? 'bg-green-500' :
                            milestone.status === 'current' ? 'bg-blue-500 ring-4 ring-blue-100' :
                            milestone.status === 'delayed' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <p className={`font-medium ${milestone.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {milestone.milestone}
                              </p>
                              <span className={`text-xs ${milestone.status === 'delayed' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                {milestone.actual || milestone.planned}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{milestone.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" /> Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedShipment.documents.map((doc, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${
                        doc.status === 'verified' ? 'bg-green-50 dark:bg-green-900/10 border-green-200' :
                        doc.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/10 border-red-200' :
                        doc.status === 'uploaded' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200' : 'bg-gray-50 dark:bg-slate-700 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</span>
                          {doc.status === 'verified' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {doc.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                          {doc.status === 'uploaded' && <Clock className="w-4 h-4 text-blue-500" />}
                          {doc.status === 'pending' && <AlertCircle className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-xs text-gray-500 capitalize mt-1">{doc.status}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profitability */}
                <div className="p-6 bg-gray-50 dark:bg-slate-700/30">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" /> Profitability
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Revenue</p>
                      <p className="text-xl font-bold text-green-600">${selectedShipment.profitability.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Costs</p>
                      <p className="text-xl font-bold text-red-600">${selectedShipment.profitability.costs.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Margin</p>
                      <p className="text-xl font-bold text-blue-600">{selectedShipment.profitability.margin.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">No Shipment Selected</h3>
                <p className="text-sm text-gray-500">Select a shipment to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Find Clients Tab
  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Find Clients</h2>
          <p className="text-sm text-gray-500">Verified exporters and importers looking for logistics partners</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, route, cargo..."
              className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Backhaul Opportunities Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5" /> AI-Matched Backhaul Opportunities
            </h3>
            <p className="text-sm opacity-90">Avoid empty return trips - we found {backhaulOpps.length} loads matching your routes</p>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            View All Matches
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {backhaulOpps.map(opp => (
            <div key={opp.id} className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Navigation className="w-4 h-4" />
                  {opp.origin.split(',')[0]} → {opp.destination.split(',')[0]}
                </div>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">{opp.matchScore}% match</span>
              </div>
              <p className="text-xs opacity-80">{opp.cargoType} • {opp.weight}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold">${opp.value}</span>
                <button className="px-3 py-1 bg-white text-teal-700 rounded-lg text-xs font-bold hover:bg-white/90">
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <div key={client.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white">{client.name}</h4>
                    {client.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{client.type} • {client.country}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(client.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{client.rating}</span>
              <span className="text-xs text-gray-500">({client.totalShipments} shipments)</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Credit Score</span>
                <span className={`font-bold ${client.creditScore >= 80 ? 'text-green-600' : client.creditScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {client.creditScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Terms</span>
                <span className="text-gray-900 dark:text-white font-medium">{client.paymentTerms}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {client.preferredCargo.slice(0, 2).map((cargo, i) => (
                <span key={i} className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {cargo}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Send Quote
              </button>
              <button className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200">
                <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Tenders Tab
  const renderTenders = () => {
    const tendersByStatus = {
      new: tenders.filter(t => t.status === 'new'),
      preparing: tenders.filter(t => t.status === 'preparing'),
      submitted: tenders.filter(t => t.status === 'submitted'),
      awarded: tenders.filter(t => t.status === 'awarded')
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Logistics Tenders</h2>
            <p className="text-sm text-gray-500">Government, AfCFTA, and private sector opportunities</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
              {(['kanban', 'list'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setTenderView(view)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                    tenderView === view ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Kanban View */}
        {tenderView === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['new', 'preparing', 'submitted', 'awarded'] as const).map(status => (
              <div key={status} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                    {status === 'new' && <Plus className="w-4 h-4 text-purple-500" />}
                    {status === 'preparing' && <Clock className="w-4 h-4 text-amber-500" />}
                    {status === 'submitted' && <Send className="w-4 h-4 text-blue-500" />}
                    {status === 'awarded' && <Award className="w-4 h-4 text-green-500" />}
                    {status}
                  </h3>
                  <span className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {tendersByStatus[status].length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tendersByStatus[status].map(tender => (
                    <div key={tender.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          tender.issuerType === 'government' ? 'bg-blue-100 text-blue-700' :
                          tender.issuerType === 'afcfta' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {tender.issuerType}
                        </span>
                        <span className="text-xs text-green-600 font-bold">{tender.matchScore}%</span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">{tender.title}</h4>
                      <p className="text-xs text-gray-500 mb-3">{tender.corridor}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900 dark:text-white">${(tender.value / 1000).toFixed(0)}K</span>
                        <span className="text-gray-500">Due: {new Date(tender.deadline).toLocaleDateString()}</span>
                      </div>
                      {status === 'new' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Win Probability</span>
                            <span className={`font-bold ${tender.winProbability >= 70 ? 'text-green-600' : tender.winProbability >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                              {tender.winProbability}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className={`h-full ${tender.winProbability >= 70 ? 'bg-green-500' : tender.winProbability >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${tender.winProbability}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {tenderView === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tender</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Corridor</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Deadline</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Match</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {tenders.map(tender => (
                  <tr key={tender.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{tender.title}</p>
                      <p className="text-xs text-gray-500">{tender.issuer}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                        tender.issuerType === 'government' ? 'bg-blue-100 text-blue-700' :
                        tender.issuerType === 'afcfta' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {tender.issuerType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{tender.corridor}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${(tender.value / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(tender.deadline).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${tender.matchScore >= 80 ? 'text-green-600' : tender.matchScore >= 60 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {tender.matchScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(tender.status)}`}>
                        {tender.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                        {tender.status === 'new' ? 'Start Bid' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render Invoicing Tab
  const renderInvoicing = () => {
    const filteredInvoices = invoices.filter(inv => {
      if (invoiceFilter === 'all') return true;
      if (invoiceFilter === 'pending') return inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'draft';
      if (invoiceFilter === 'paid') return inv.status === 'paid';
      if (invoiceFilter === 'overdue') return inv.status === 'overdue';
      return true;
    });

    const totalPending = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoicing & Payments</h2>
            <p className="text-sm text-gray-500">Manage billing, track payments, and reconcile accounts</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CircleDollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Outstanding</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">${totalPending.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Paid (This Month)</p>
                <p className="text-xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Overdue</p>
                <p className="text-xl font-bold text-red-600">${totalOverdue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Banknote className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg. Payment Time</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">12 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'pending', 'paid', 'overdue'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setInvoiceFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                invoiceFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Issued</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Due</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <p className="font-mono font-medium text-gray-900 dark:text-white text-sm">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">Shipment: {invoice.shipmentId}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{invoice.client}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900 dark:text-white">${invoice.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{invoice.currency}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{invoice.issueDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{invoice.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg" title="View">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg" title="Download">
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg" title="Send Reminder">
                          <Send className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Compliance Tab
  const renderCompliance = () => {
    const validDocs = complianceDocs.filter(d => d.status === 'valid').length;
    const expiringDocs = complianceDocs.filter(d => d.status === 'expiring_soon').length;
    const expiredDocs = complianceDocs.filter(d => d.status === 'expired').length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compliance & Certifications</h2>
            <p className="text-sm text-gray-500">Manage licenses, permits, and customs documentation</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        </div>

        {/* Compliance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{complianceDocs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Valid</p>
                <p className="text-2xl font-bold text-green-600">{validDocs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold text-amber-600">{expiringDocs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Expired</p>
                <p className="text-2xl font-bold text-red-600">{expiredDocs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Soon Alert */}
        {expiringDocs > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
            <h3 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" /> Documents Expiring Soon
            </h3>
            <div className="space-y-2">
              {complianceDocs.filter(d => d.status === 'expiring_soon').map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">Expires: {doc.expiryDate}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700">
                    Renew Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceDocs.map(doc => (
            <div key={doc.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-4 ${
              doc.status === 'valid' ? 'border-green-200 dark:border-green-900/30' :
              doc.status === 'expiring_soon' ? 'border-amber-200 dark:border-amber-900/30' :
              doc.status === 'expired' ? 'border-red-200 dark:border-red-900/30' : 'border-gray-100 dark:border-slate-700'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    doc.status === 'valid' ? 'bg-green-100 dark:bg-green-900/30' :
                    doc.status === 'expiring_soon' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    doc.status === 'expired' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-slate-700'
                  }`}>
                    <FileText className={`w-4 h-4 ${
                      doc.status === 'valid' ? 'text-green-600' :
                      doc.status === 'expiring_soon' ? 'text-amber-600' :
                      doc.status === 'expired' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(doc.status)}`}>
                    {doc.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-500 capitalize bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">{doc.category}</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{doc.name}</h4>
              <p className="text-xs text-gray-500 mb-3">{doc.issuingAuthority}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Issued: {doc.issueDate}</span>
                <span>Expires: {doc.expiryDate}</span>
              </div>
              {doc.linkedEntity && (
                <p className="text-xs text-blue-600 mt-2">Linked: {doc.linkedEntity}</p>
              )}
            </div>
          ))}
        </div>

        {/* Customs Document Generator */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" /> Auto-Generate Customs Documents
          </h3>
          <p className="text-sm opacity-90 mb-4">Generate Bill of Lading, Commercial Invoice, Packing List, SAD forms, and Certificate of Origin automatically from your shipment data.</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-bold hover:bg-white/90">
              Generate Documents
            </button>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
              HS Code Search
            </button>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
              AfCFTA Calculator
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Settings Tab
  const renderSettings = () => (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500">Manage your company profile, users, and preferences</p>
      </div>

      {/* Company Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-500" /> Company Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
            <input type="text" defaultValue="AfriTrans Logistics Ltd" className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Registration Number</label>
            <input type="text" defaultValue="REG-2019-0045678" className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tax ID</label>
            <input type="text" defaultValue="TIN-123456789" className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Country</label>
            <select className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
              <option>South Africa</option>
              <option>Kenya</option>
              <option>Nigeria</option>
              <option>Ghana</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" /> Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Language</label>
            <select className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
              <option>English</option>
              <option>French</option>
              <option>Portuguese</option>
              <option>Swahili</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Currency</label>
            <select className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
              <option>USD - US Dollar</option>
              <option>ZAR - South African Rand</option>
              <option>KES - Kenyan Shilling</option>
              <option>NGN - Nigerian Naira</option>
              <option>EUR - Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Timezone</label>
            <select className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
              <option>Africa/Johannesburg (GMT+2)</option>
              <option>Africa/Nairobi (GMT+3)</option>
              <option>Africa/Lagos (GMT+1)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date Format</label>
            <select className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Notifications</h3>
        <div className="space-y-4">
          {[
            { label: 'Shipment Updates', desc: 'Get notified when shipment status changes' },
            { label: 'Border Alerts', desc: 'Receive alerts for border delays and closures' },
            { label: 'Invoice Reminders', desc: 'Reminders for pending and overdue invoices' },
            { label: 'Tender Opportunities', desc: 'New tenders matching your profile' },
            { label: 'Compliance Expiry', desc: 'Document and permit expiration warnings' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* API & Integrations */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-500" /> Integrations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'ERP System', status: 'connected', icon: Building },
            { name: 'TMS Integration', status: 'not_connected', icon: Truck },
            { name: 'Banking API', status: 'connected', icon: Banknote },
            { name: 'GPS Telematics', status: 'connected', icon: MapPin }
          ].map((integration, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <integration.icon className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">{integration.name}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
          Cancel
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );

  // Loading state
  if (loading && !kpis) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      {/* Header / Tabs */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Logistics Provider Panel</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fleet management, shipments, tenders & compliance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Live Refresh Toggle */}
          <button
            onClick={() => setLiveRefresh(!liveRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              liveRefresh ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${liveRefresh ? 'animate-spin' : ''}`} />
            {liveRefresh ? 'Live' : 'Paused'}
          </button>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'fleet' && renderFleet()}
        {activeTab === 'shipments' && renderShipments()}
        {activeTab === 'clients' && renderClients()}
        {activeTab === 'tenders' && renderTenders()}
        {activeTab === 'invoicing' && renderInvoicing()}
        {activeTab === 'compliance' && renderCompliance()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default LogisticsProviderPanel;
