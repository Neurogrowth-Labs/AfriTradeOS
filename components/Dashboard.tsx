
import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Activity,
  Clock,
  AlertTriangle,
  Map as MapIcon,
  X,
  AlertOctagon,
  Eye,
  EyeOff,
  Briefcase,
  FileText,
  TrendingUp,
  Search,
  CheckCircle,
  Plus,
  Scale,
  Users,
  Zap,
  GripVertical,
  LayoutGrid,
  Bell,
  Landmark,
  DollarSign,
  MessageSquare,
  Filter,
  Volume2,
  VolumeX,
  Banknote,
  Navigation,
  Anchor,
  Building2,
  ZoomIn,
  ZoomOut,
  Layers,
  CircleDot,
  Package
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { fastChatResponse } from '../services/geminiService';
import { mockDatabase } from '../services/mockDatabase'; // Import DB
import { UserPersona, AppView, DbTrade } from '../types';

// --- Types & Mock Data ---

interface DashboardProps {
  userRole: UserPersona;
  navigateTo: (view: AppView) => void;
}

interface TradeLane {
  id: string;
  from: string;
  to: string;
  coords: { x1: number; y1: number; x2: number; y2: number; cx: number; cy: number };
  volume: string;
  value: string;
  status: 'optimal' | 'delayed' | 'blocked';
  commodity: string;
}

interface Hub {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'operational' | 'congested' | 'maintenance';
}

type AlertCategory = 'trade_delay' | 'compliance' | 'currency' | 'logistics' | 'general';

interface Alert {
  id: number;
  title: string;
  message: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
  category: AlertCategory;
  read: boolean;
  actionable: boolean;
  actionLabel?: string;
  actionView?: AppView;
}

// Widget configuration types
interface WidgetConfig {
  id: string;
  title: string;
  icon: React.ElementType;
  visible: boolean;
  order: number;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'kpis', title: 'Key Metrics', icon: Activity, visible: true, order: 0 },
  { id: 'trades', title: 'Active Trades', icon: Truck, visible: true, order: 1 },
  { id: 'alerts', title: 'Live Alerts', icon: Bell, visible: true, order: 2 },
  { id: 'finance', title: 'Finance Overview', icon: Landmark, visible: true, order: 3 },
  { id: 'map', title: 'Trade Routes', icon: MapIcon, visible: true, order: 4 },
  { id: 'ai', title: 'AI Insights', icon: Zap, visible: true, order: 5 },
];

// Static reference data for African trade hubs (used for map visualization)
const AFRICAN_HUBS: Hub[] = [
  { id: 'cairo', name: 'Cairo', x: 550, y: 80, status: 'operational' },
  { id: 'lagos', name: 'Lagos', x: 320, y: 350, status: 'operational' },
  { id: 'nairobi', name: 'Nairobi', x: 600, y: 450, status: 'operational' },
  { id: 'joburg', name: 'Johannesburg', x: 500, y: 700, status: 'operational' },
  { id: 'casablanca', name: 'Casablanca', x: 280, y: 60, status: 'operational' },
  { id: 'dakar', name: 'Dakar', x: 150, y: 280, status: 'operational' },
];

export const Dashboard: React.FC<DashboardProps> = ({ userRole, navigateTo }) => {
  const [insight, setInsight] = useState("Loading AI strategic brief...");
  const [selectedLane, setSelectedLane] = useState<TradeLane | null>(null);
  const [myTrades, setMyTrades] = useState<DbTrade[]>([]);

  // Widget customization state - merge saved settings with default icons
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem(`dashboard_widgets_${userRole}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Array<{ id: string; visible: boolean; order: number }>;
        // Merge saved visibility/order with actual icon components from defaults
        return DEFAULT_WIDGETS.map(defaultWidget => {
          const savedWidget = parsed.find(w => w.id === defaultWidget.id);
          return savedWidget 
            ? { ...defaultWidget, visible: savedWidget.visible, order: savedWidget.order }
            : defaultWidget;
        }).sort((a, b) => a.order - b.order);
      } catch {
        return DEFAULT_WIDGETS;
      }
    }
    return DEFAULT_WIDGETS;
  });
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);

  // Alert filtering state
  const [alertFilter, setAlertFilter] = useState<AlertCategory | 'all'>('all');
  const [alertSoundEnabled, setAlertSoundEnabled] = useState(true);
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  // Map interaction state
  const [mapZoom, setMapZoom] = useState(1);
  const [showMapLayers, setShowMapLayers] = useState(false);
  const [activeMapLayers, setActiveMapLayers] = useState({
    routes: true,
    hubs: true,
    congestion: true,
    weather: false
  });
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);

  // -- REAL-TIME STATE (initialized empty, populated from database) --
  const [lanes, setLanes] = useState<TradeLane[]>([]);
  const [hubs, setHubs] = useState<Hub[]>(AFRICAN_HUBS);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [declarations, setDeclarations] = useState<{id: string; exporter: string; origin: string; commodity: string; risk: number; status: string}[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [metrics, setMetrics] = useState({
    activeShipments: 0,
    complianceScore: 0,
    pendingDocs: 0,
    avgClearance: 0,
    dailyRevenue: 0,
    pendingDeclarations: 0,
    financeRequests: 0,
    activeLCs: 0,
    totalExports: 0,
    tradeBalance: 0,
  });

  const [govExportData, setGovExportData] = useState([
    { month: 'Jan', exports: 4000, imports: 2400 },
    { month: 'Feb', exports: 3000, imports: 1398 },
    { month: 'Mar', exports: 2000, imports: 9800 },
    { month: 'Apr', exports: 2780, imports: 3908 },
    { month: 'May', exports: 1890, imports: 4800 },
    { month: 'Jun', exports: 2390, imports: 3800 },
  ]);

  // Category icon and color mapping
  const getCategoryInfo = (category: AlertCategory) => {
    switch (category) {
      case 'trade_delay':
        return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Trade Delay' };
      case 'compliance':
        return { icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Compliance' };
      case 'currency':
        return { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100', label: 'Currency' };
      case 'logistics':
        return { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Logistics' };
      default:
        return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100', label: 'General' };
    }
  };

  // Filter alerts by category
  const filteredAlerts = alertFilter === 'all' 
    ? alerts 
    : alerts.filter(a => a.category === alertFilter);

  useEffect(() => {
    let isMounted = true;

    const fetchInsight = async () => {
      try {
        const prompt = `Provide a 1-sentence executive summary for a ${userRole} in the AfCFTA zone today.`;
        const text = await fastChatResponse(prompt);
        if (isMounted && text) {
            setInsight(text);
        }
      } catch (e) {
        if (isMounted) setInsight("System operational. AI strategic brief currently unavailable.");
      }
    };
    
    const fetchAllData = async () => {
        setLoadingData(true);
        try {
            // Fetch trades
            const trades = await mockDatabase.getTrades();
            if (isMounted) {
                setMyTrades(trades);
                
                // Generate trade lanes from real trades
                const tradeLanes: TradeLane[] = trades.slice(0, 4).map((t) => ({
                    id: t.id,
                    from: t.origin_country || 'Origin',
                    to: t.destination_country || 'Destination',
                    coords: { x1: 320, y1: 350, x2: 550, y2: 80, cx: 400, cy: 200 },
                    volume: `${Math.floor((t.value || 0) / 1000)} Tons`,
                    value: `$${((t.value || 0) / 1000).toFixed(1)}K`,
                    status: t.status === 'completed' ? 'optimal' : t.status === 'paused' ? 'blocked' : 'delayed',
                    commodity: t.product || 'Goods'
                }));
                setLanes(tradeLanes);
            }
            
            // Fetch finance requests
            const financeReqs = await mockDatabase.getFinanceRequests('');
            
            // Fetch KYC requests for declarations
            const kycReqs = await mockDatabase.getKYCRequests();
            if (isMounted) {
                const decls = kycReqs.map(k => ({
                    id: k.id,
                    exporter: k.entity_name || 'Unknown',
                    origin: k.country || 'Unknown',
                    commodity: 'Trade Goods',
                    risk: k.risk_level === 'High' ? 80 : k.risk_level === 'Medium' ? 50 : 20,
                    status: k.status === 'Approved' ? 'Cleared' : k.status === 'Rejected' ? 'Flagged' : 'Review'
                }));
                setDeclarations(decls);
            }
            
            // Calculate real metrics
            if (isMounted) {
                const pendingTrades = trades.filter(t => t.status !== 'completed').length;
                const completedTrades = trades.filter(t => t.status === 'completed').length;
                const totalValue = trades.reduce((sum, t) => sum + (t.value || 0), 0);
                
                setMetrics({
                    activeShipments: trades.length,
                    complianceScore: trades.length > 0 ? Math.min(100, 70 + completedTrades * 5) : 0,
                    pendingDocs: pendingTrades,
                    avgClearance: trades.length > 0 ? 2.5 : 0,
                    dailyRevenue: totalValue / 1000000,
                    pendingDeclarations: kycReqs.length,
                    financeRequests: financeReqs.length,
                    activeLCs: financeReqs.reduce((sum, f) => sum + (f.amount || 0), 0) / 1000000,
                    totalExports: totalValue / 1000000000,
                    tradeBalance: totalValue / 1000000,
                });
            }
        } catch (e) {
            console.error('Failed to fetch dashboard data:', e);
        } finally {
            if (isMounted) setLoadingData(false);
        }
    };

    fetchInsight();
    fetchAllData();

    return () => {
        isMounted = false;
    };
  }, [userRole]);

  // --- REAL-TIME SIMULATION ENGINE (only runs when there's actual data) ---
  useEffect(() => {
    // Don't run simulation for new accounts with no data
    if (myTrades.length === 0) return;
    
    const interval = setInterval(() => {
      // 1. Jitter Charts (Gov View) - only if there's data
      if (myTrades.length > 0) {
        setGovExportData(prev => prev.map(d => ({
          ...d,
          exports: Math.max(1000, d.exports + (Math.random() - 0.5) * 200),
          imports: Math.max(1000, d.imports + (Math.random() - 0.5) * 200)
        })));
      }

      // 3. Dynamic Trade Map (Randomly flip status for lanes and hubs)
      if (Math.random() > 0.7) {
        // Lanes
        setLanes(prevLanes => prevLanes.map(lane => {
          if (Math.random() > 0.8) {
            const statuses: ('optimal' | 'delayed' | 'blocked')[] = ['optimal', 'optimal', 'delayed', 'blocked'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return { ...lane, status: newStatus };
          }
          return lane;
        }));

        // Hubs
        setHubs(prevHubs => prevHubs.map(hub => {
          if (Math.random() > 0.85) {
             const statuses: ('operational' | 'congested' | 'maintenance')[] = ['operational', 'operational', 'operational', 'congested', 'maintenance'];
             const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
             return { ...hub, status: newStatus };
          }
          return hub;
        }));
      }

      // 4. Inject Alerts with Categories
      if (Math.random() > 0.92) { // Occasional new alert
        const newAlerts: Alert[] = [
          // Trade Delay Alerts
          { 
            id: Date.now(), 
            title: 'Shipment Delay Detected', 
            message: `Shipment #${Math.floor(Math.random() * 9000) + 1000} delayed at Lagos port. ETA extended by 48 hours.`, 
            time: 'Just now', 
            severity: 'high',
            category: 'trade_delay',
            read: false,
            actionable: true,
            actionLabel: 'Track Shipment',
            actionView: AppView.LOGISTICS
          },
          { 
            id: Date.now(), 
            title: 'Customs Processing Delay', 
            message: 'Documentation review pending for 3 shipments at Mombasa customs.', 
            time: 'Just now', 
            severity: 'medium',
            category: 'trade_delay',
            read: false,
            actionable: true,
            actionLabel: 'View Details',
            actionView: AppView.COMPLIANCE
          },
          // Compliance Alerts
          { 
            id: Date.now(), 
            title: 'Compliance Flag Raised', 
            message: `Shipment #${Math.floor(Math.random() * 9000) + 1000} flagged for origin verification under AfCFTA rules.`, 
            time: 'Just now', 
            severity: 'high',
            category: 'compliance',
            read: false,
            actionable: true,
            actionLabel: 'Review Now',
            actionView: AppView.COMPLIANCE
          },
          { 
            id: Date.now(), 
            title: 'Certificate Expiring', 
            message: 'Your Certificate of Origin for Kenya exports expires in 7 days.', 
            time: 'Just now', 
            severity: 'medium',
            category: 'compliance',
            read: false,
            actionable: true,
            actionLabel: 'Renew',
            actionView: AppView.COMPLIANCE
          },
          { 
            id: Date.now(), 
            title: 'New Regulation Alert', 
            message: 'ECOWAS updated tariff codes for agricultural products effective next month.', 
            time: 'Just now', 
            severity: 'low',
            category: 'compliance',
            read: false,
            actionable: false
          },
          // Currency Fluctuation Alerts
          { 
            id: Date.now(), 
            title: 'NGN/USD Rate Alert', 
            message: 'Nigerian Naira depreciated 2.5% against USD in the last 24 hours.', 
            time: 'Just now', 
            severity: 'high',
            category: 'currency',
            read: false,
            actionable: true,
            actionLabel: 'Hedge Position',
            actionView: AppView.TRADE_FINANCE
          },
          { 
            id: Date.now(), 
            title: 'KES Strengthening', 
            message: 'Kenyan Shilling gained 1.2% against EUR. Consider adjusting payment terms.', 
            time: 'Just now', 
            severity: 'medium',
            category: 'currency',
            read: false,
            actionable: false
          },
          { 
            id: Date.now(), 
            title: 'ZAR Volatility Warning', 
            message: 'South African Rand showing high volatility. FX risk elevated for ZAR trades.', 
            time: 'Just now', 
            severity: 'medium',
            category: 'currency',
            read: false,
            actionable: true,
            actionLabel: 'View FX Rates',
            actionView: AppView.TRADE_FINANCE
          },
          // Logistics Alerts
          { 
            id: Date.now(), 
            title: 'Route Congestion Cleared', 
            message: 'Lagos-Abidjan corridor congestion eased. Normal transit times resumed.', 
            time: 'Just now', 
            severity: 'low',
            category: 'logistics',
            read: false,
            actionable: false
          },
          { 
            id: Date.now(), 
            title: 'Port Strike Warning', 
            message: 'Potential labor action at Durban port next week. Plan alternative routes.', 
            time: 'Just now', 
            severity: 'high',
            category: 'logistics',
            read: false,
            actionable: true,
            actionLabel: 'View Routes',
            actionView: AppView.LOGISTICS
          },
          // General Alerts
          { 
            id: Date.now(), 
            title: 'Market Opportunity', 
            message: 'Sudden spike in demand for Shea Butter in West Africa. Premium prices available.', 
            time: 'Just now', 
            severity: 'low',
            category: 'general',
            read: false,
            actionable: true,
            actionLabel: 'Explore',
            actionView: AppView.MARKETPLACE
          }
        ];
        const randomAlert = newAlerts[Math.floor(Math.random() * newAlerts.length)];
        setAlerts(prev => [{ ...randomAlert, id: Date.now() }, ...prev.slice(0, 9)]);
      }

    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [myTrades.length]);

  // --- Widget Configuration Functions ---

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev => {
      const updated = prev.map(w =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      );
      localStorage.setItem(`dashboard_widgets_${userRole}`, JSON.stringify(updated));
      return updated;
    });
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === widgetId);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      updated.forEach((w, i) => w.order = i);
      localStorage.setItem(`dashboard_widgets_${userRole}`, JSON.stringify(updated));
      return updated;
    });
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem(`dashboard_widgets_${userRole}`);
  };

  const isWidgetVisible = (widgetId: string) => {
    return widgets.find(w => w.id === widgetId)?.visible ?? true;
  };

  // --- Dynamic Content Rendering Based on Role ---

  const getKPIs = () => {
    switch (userRole) {
      case UserPersona.EXPORTER_SME:
        return [
          { label: 'Active Shipments', value: metrics.activeShipments.toString(), sub: 'Live Tracking', icon: Truck, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Compliance Health', value: 'Good', sub: `Score: ${metrics.complianceScore}/100`, icon: ShieldCheck, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Pending Docs', value: metrics.pendingDocs.toString(), sub: 'Action Required', icon: FileText, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'Avg Clearance', value: `${metrics.avgClearance} Days`, sub: '-4h vs Avg', icon: Clock, color: 'text-trade-secondary', bg: 'bg-indigo-50' },
        ];
      case UserPersona.CUSTOMS:
        return [
          { label: 'Pending Declarations', value: metrics.pendingDeclarations.toString(), sub: '+12% Vol', icon: FileText, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'High Risk Flags', value: '18', sub: 'Action Req', icon: AlertOctagon, color: 'text-trade-error', bg: 'bg-red-50' },
          { label: 'Revenue (Daily)', value: `$${metrics.dailyRevenue}M`, sub: 'Duties & Taxes', icon: Activity, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Insp. Efficiency', value: '94%', sub: '+2% vs Target', icon: CheckCircle, color: 'text-trade-secondary', bg: 'bg-purple-50' },
        ];
      case UserPersona.BANK:
        return [
          { label: 'Finance Requests', value: metrics.financeRequests.toString(), sub: '8 Pending', icon: Briefcase, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Active LCs', value: `$${metrics.activeLCs}M`, sub: 'Across 12 Trades', icon: Activity, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Credit Risk', value: 'Medium', sub: 'Nigeria Exposure', icon: AlertTriangle, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'FX Rate (NGN)', value: '1,650', sub: '+0.5% Today', icon: TrendingUp, color: 'text-trade-secondary', bg: 'bg-purple-50' },
        ];
      case UserPersona.IMPORTER:
        return [
          { label: 'Active Imports', value: metrics.activeShipments.toString(), sub: 'Orders in Progress', icon: Package, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'In Transit', value: Math.max(0, metrics.activeShipments - metrics.pendingDocs).toString(), sub: 'Shipments Moving', icon: Truck, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Pending Payments', value: metrics.pendingDocs.toString(), sub: 'Action Required', icon: DollarSign, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'Compliance', value: `${metrics.complianceScore}%`, sub: 'Import Health', icon: ShieldCheck, color: 'text-trade-success', bg: 'bg-green-50' },
        ];
      case UserPersona.GOVERNMENT:
        return [
          { label: 'Total Exports', value: `$${metrics.totalExports}B`, sub: 'YTD 2024', icon: ArrowUpRight, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Trade Balance', value: `+$${metrics.tradeBalance}M`, sub: 'Surplus', icon: Scale, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Intra-Africa', value: '18%', sub: 'Target: 25%', icon: MapIcon, color: 'text-trade-secondary', bg: 'bg-purple-50' },
          { label: 'SME Participation', value: '45%', sub: '+5% YoY', icon: Users, color: 'text-trade-accent', bg: 'bg-yellow-50' },
        ];
      default: 
        return [
          { label: 'Active Shipments', value: metrics.activeShipments.toString(), sub: '+12% vs last week', icon: Truck, color: 'text-trade-primary', bg: 'bg-blue-50' },
          { label: 'Avg Clearance Time', value: '38h', sub: '-4h improvement', icon: Clock, color: 'text-trade-warning', bg: 'bg-orange-50' },
          { label: 'Compliance Score', value: `${metrics.complianceScore}%`, sub: 'AfCFTA Standard', icon: ShieldCheck, color: 'text-trade-success', bg: 'bg-green-50' },
          { label: 'Risk Exposure', value: 'Low', sub: 'Score: 12/100', icon: Activity, color: 'text-trade-secondary', bg: 'bg-purple-50' },
        ];
    }
  };

  // Role-specific quick actions configuration
  const getQuickActions = () => {
    switch (userRole) {
      case UserPersona.EXPORTER_SME:
        return [
          { label: 'New Trade', icon: Plus, color: 'bg-trade-primary', desc: 'Start export', action: () => navigateTo(AppView.TRADE_LIFECYCLE) },
          { label: 'Check HS Code', icon: Search, color: 'bg-trade-secondary', desc: 'Verify codes', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Track Shipment', icon: Truck, color: 'bg-trade-success', desc: 'Live tracking', action: () => navigateTo(AppView.LOGISTICS) },
          { label: 'Find Buyer', icon: Users, color: 'bg-trade-accent', desc: 'Marketplace', action: () => navigateTo(AppView.MARKETPLACE) },
          { label: 'Get Finance', icon: Banknote, color: 'bg-purple-500', desc: 'Apply now', action: () => navigateTo(AppView.TRADE_FINANCE) },
          { label: 'AI Assistant', icon: MessageSquare, color: 'bg-pink-500', desc: 'Get help', action: () => navigateTo(AppView.LIVE_ASSISTANT) },
        ];
      case UserPersona.EXPORTER_ENTERPRISE:
        return [
          { label: 'New Trade', icon: Plus, color: 'bg-trade-primary', desc: 'Create order', action: () => navigateTo(AppView.TRADE_LIFECYCLE) },
          { label: 'Bulk Upload', icon: FileText, color: 'bg-trade-secondary', desc: 'Import CSV', action: () => navigateTo(AppView.TRADE_LIFECYCLE) },
          { label: 'Compliance', icon: ShieldCheck, color: 'bg-trade-success', desc: 'Check status', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Logistics', icon: Truck, color: 'bg-trade-warning', desc: 'Manage routes', action: () => navigateTo(AppView.LOGISTICS) },
          { label: 'Finance', icon: Landmark, color: 'bg-purple-500', desc: 'LC & Payments', action: () => navigateTo(AppView.TRADE_FINANCE) },
          { label: 'Analytics', icon: TrendingUp, color: 'bg-pink-500', desc: 'Reports', action: () => navigateTo(AppView.MARKET_INTEL) },
        ];
      case UserPersona.CUSTOMS:
        return [
          { label: 'Scan Declaration', icon: Search, color: 'bg-trade-primary', desc: 'Quick scan', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Risk Queue', icon: AlertOctagon, color: 'bg-trade-error', desc: 'High priority', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Verify Origin', icon: MapIcon, color: 'bg-trade-secondary', desc: 'CoO check', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Release Goods', icon: CheckCircle, color: 'bg-trade-success', desc: 'Approve', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Flag Shipment', icon: AlertTriangle, color: 'bg-trade-warning', desc: 'Hold', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Reports', icon: FileText, color: 'bg-purple-500', desc: 'Generate', action: () => navigateTo(AppView.REGULATOR) },
        ];
      case UserPersona.BANK:
        return [
          { label: 'New LC', icon: Plus, color: 'bg-trade-primary', desc: 'Issue letter', action: () => navigateTo(AppView.TRADE_FINANCE) },
          { label: 'Review Apps', icon: FileText, color: 'bg-trade-secondary', desc: 'Pending', action: () => navigateTo(AppView.TRADE_FINANCE) },
          { label: 'Risk Check', icon: ShieldCheck, color: 'bg-trade-warning', desc: 'KYC/AML', action: () => navigateTo(AppView.KYC_VERIFICATION) },
          { label: 'FX Rates', icon: DollarSign, color: 'bg-trade-success', desc: 'Live rates', action: () => navigateTo(AppView.TRADE_FINANCE) },
          { label: 'Disbursements', icon: Banknote, color: 'bg-purple-500', desc: 'Process', action: () => navigateTo(AppView.TRADE_FINANCE) },
          { label: 'Portfolio', icon: Briefcase, color: 'bg-pink-500', desc: 'Overview', action: () => navigateTo(AppView.TRADE_FINANCE) },
        ];
      case UserPersona.GOVERNMENT:
        return [
          { label: 'Trade Stats', icon: TrendingUp, color: 'bg-trade-primary', desc: 'Dashboard', action: () => navigateTo(AppView.MARKET_INTEL) },
          { label: 'Policy Review', icon: Scale, color: 'bg-trade-secondary', desc: 'Regulations', action: () => navigateTo(AppView.REGULATOR) },
          { label: 'Compliance', icon: ShieldCheck, color: 'bg-trade-success', desc: 'AfCFTA', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Revenue', icon: Landmark, color: 'bg-trade-warning', desc: 'Collections', action: () => navigateTo(AppView.REGULATOR) },
          { label: 'SME Support', icon: Users, color: 'bg-purple-500', desc: 'Programs', action: () => navigateTo(AppView.MARKETPLACE) },
          { label: 'Reports', icon: FileText, color: 'bg-pink-500', desc: 'Generate', action: () => navigateTo(AppView.REGULATOR) },
        ];
      case UserPersona.IMPORTER:
        return [
          { label: 'New Import', icon: Plus, color: 'bg-trade-primary', desc: 'Create order', action: () => navigateTo(AppView.TRADE_LIFECYCLE) },
          { label: 'Track Shipment', icon: Truck, color: 'bg-teal-600', desc: 'Live tracking', action: () => navigateTo(AppView.LOGISTICS) },
          { label: 'Find Supplier', icon: Users, color: 'bg-trade-accent', desc: 'Source goods', action: () => navigateTo(AppView.MARKETPLACE) },
          { label: 'Trade Finance', icon: Landmark, color: 'bg-purple-500', desc: 'L/C & Payments', action: () => navigateTo(AppView.TRADE_FINANCE) },
          { label: 'Compliance', icon: ShieldCheck, color: 'bg-trade-success', desc: 'Check imports', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Market Prices', icon: TrendingUp, color: 'bg-pink-500', desc: 'Live prices', action: () => navigateTo(AppView.MARKET_INTEL) },
        ];
      case UserPersona.LOGISTICS:
        return [
          { label: 'New Booking', icon: Plus, color: 'bg-trade-primary', desc: 'Create', action: () => navigateTo(AppView.LOGISTICS) },
          { label: 'Track Fleet', icon: Truck, color: 'bg-trade-success', desc: 'Live GPS', action: () => navigateTo(AppView.LOGISTICS) },
          { label: 'Route Plan', icon: Navigation, color: 'bg-trade-secondary', desc: 'Optimize', action: () => navigateTo(AppView.LOGISTICS) },
          { label: 'Customs Docs', icon: FileText, color: 'bg-trade-warning', desc: 'Prepare', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Port Status', icon: Anchor, color: 'bg-purple-500', desc: 'Live', action: () => navigateTo(AppView.LOGISTICS) },
          { label: 'Warehouse', icon: Building2, color: 'bg-pink-500', desc: 'Inventory', action: () => navigateTo(AppView.LOGISTICS) },
        ];
      default:
        return [
          { label: 'Dashboard', icon: LayoutGrid, color: 'bg-trade-primary', desc: 'Overview', action: () => navigateTo(AppView.DASHBOARD) },
          { label: 'Trades', icon: Briefcase, color: 'bg-trade-secondary', desc: 'Manage', action: () => navigateTo(AppView.TRADE_LIFECYCLE) },
          { label: 'Compliance', icon: ShieldCheck, color: 'bg-trade-success', desc: 'Check', action: () => navigateTo(AppView.COMPLIANCE) },
          { label: 'Logistics', icon: Truck, color: 'bg-trade-warning', desc: 'Track', action: () => navigateTo(AppView.LOGISTICS) },
          { label: 'Finance', icon: Landmark, color: 'bg-purple-500', desc: 'Manage', action: () => navigateTo(AppView.TRADE_FINANCE) },
          { label: 'Help', icon: MessageSquare, color: 'bg-pink-500', desc: 'Support', action: () => navigateTo(AppView.LIVE_ASSISTANT) },
        ];
    }
  };

  // Render Quick Actions Grid Component
  const renderQuickActionsGrid = () => {
    const actions = getQuickActions();
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-trade-accent" /> Quick Actions
          </h3>
          <span className="text-[10px] text-gray-400">{userRole}</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {actions.map(action => (
            <button 
              key={action.label} 
              onClick={action.action}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-trade-accent dark:hover:border-trade-accent hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <div className={`p-2 rounded-full text-white shadow-lg ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-trade-primary dark:text-gray-300 text-center leading-tight">{action.label}</span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMainWidget = () => {
    // 1. SME View: Enhanced Action Center + List
    if (userRole === UserPersona.EXPORTER_SME) {
      return (
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-5 animate-fade-in">
           <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-trade-accent" /> Quick Actions
                </h3>
                <span className="text-[10px] bg-trade-primary/10 text-trade-primary px-2 py-0.5 rounded-full font-medium">SME Tools</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                 {getQuickActions().map(action => (
                    <button 
                        key={action.label} 
                        onClick={action.action}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-trade-accent dark:hover:border-trade-accent hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group text-left"
                    >
                       <div className={`p-2 rounded-lg text-white shadow-lg ${action.color} group-hover:scale-110 transition-transform shrink-0`}>
                          <action.icon className="w-4 h-4" />
                       </div>
                       <div>
                         <span className="text-xs font-semibold text-trade-primary dark:text-gray-300 block">{action.label}</span>
                         <span className="text-[10px] text-gray-400">{action.desc}</span>
                       </div>
                    </button>
                 ))}
              </div>
           </div>
           
           <div className="flex-1">
              <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white mb-3 flex items-center justify-between">
                  My Active Trades
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
                  </span>
              </h3>
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
                 {myTrades.length === 0 ? (
                     <div className="text-center py-4 text-gray-400 text-sm">No active trades found. Start a new one.</div>
                 ) : myTrades.map(ship => (
                    <div key={ship.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-700">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${ship.status === 'pending_execution' || ship.status === 'draft' || ship.status === 'pending_compliance' ? 'bg-blue-100 text-blue-600' : ship.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                             <Truck className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="font-bold font-heading text-trade-primary dark:text-white text-sm">To: {ship.destination_country || 'Pending'}</p>
                             <p className="text-[10px] font-mono text-gray-500">{ship.id}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-xs font-bold uppercase ${ship.status === 'completed' ? 'text-trade-success' : ship.status === 'paused' ? 'text-trade-warning' : 'text-blue-600'}`}>{ship.status}</p>
                          <p className="text-[10px] text-gray-500">{ship.product || 'General Cargo'}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      );
    }

    // 2. Importer View: Import Dashboard with supplier insights and order tracking
    if (userRole === UserPersona.IMPORTER) {
      return (
        <div className="flex-1 flex flex-col gap-4 animate-fade-in">
           {/* Importer Quick Actions */}
           {renderQuickActionsGrid()}

           <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
             {/* Import Trends Chart */}
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-trade-accent" /> Import Trends
                   </h3>
                   <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" /> Live
                   </span>
                </div>
                <div className="flex-1 min-h-[180px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={govExportData}>
                         <defs>
                            <linearGradient id="colorImports" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                               <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorAfcfta" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#C9A24D" stopOpacity={0.6}/>
                               <stop offset="95%" stopColor="#C9A24D" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                         <YAxis stroke="#94a3b8" fontSize={10} />
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                         <Tooltip contentStyle={{backgroundColor: '#0B1F33', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px'}} />
                         <Area type="monotone" dataKey="imports" stroke="#0d9488" fillOpacity={1} fill="url(#colorImports)" name="AfCFTA Imports" />
                         <Area type="monotone" dataKey="exports" stroke="#C9A24D" fillOpacity={1} fill="url(#colorAfcfta)" name="Int'l Tariff Imports" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gray-500">
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> AfCFTA Tariff</span>
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-trade-accent" /> International Tariff</span>
                </div>
             </div>

             {/* Active Import Orders */}
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-trade-primary" /> Active Import Orders
                   </h3>
                   <button onClick={() => navigateTo(AppView.TRADE_LIFECYCLE)} className="text-[10px] text-trade-primary hover:underline font-bold">View All</button>
                </div>
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[260px]">
                   {myTrades.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                         <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                         <p className="text-sm">No import orders yet.</p>
                         <button onClick={() => navigateTo(AppView.TRADE_LIFECYCLE)} className="text-trade-primary text-xs hover:underline mt-1">Create your first import order</button>
                      </div>
                   ) : myTrades.map(order => (
                      <div key={order.id} onClick={() => navigateTo(AppView.TRADE_LIFECYCLE)} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-700 hover:border-trade-primary/30 transition-colors cursor-pointer">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                               order.status === 'completed' ? 'bg-green-100 text-green-600' :
                               order.status === 'pending_execution' ? 'bg-teal-100 text-teal-600' :
                               order.status === 'paused' ? 'bg-red-100 text-red-600' :
                               'bg-blue-100 text-blue-600'
                            }`}>
                               <Package className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="font-bold font-heading text-trade-primary dark:text-white text-sm">{order.product || 'Import Order'}</p>
                               <p className="text-[10px] text-gray-500">From: {order.origin_country || 'Supplier'}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                               order.status === 'completed' ? 'bg-green-100 text-green-700' :
                               order.status === 'pending_execution' ? 'bg-teal-100 text-teal-700' :
                               order.status === 'paused' ? 'bg-red-100 text-red-700' :
                               order.status === 'pending_compliance' ? 'bg-yellow-100 text-yellow-700' :
                               'bg-blue-100 text-blue-700'
                            }`}>
                               {order.status === 'pending_execution' ? 'in transit' :
                                order.status === 'pending_compliance' ? 'pending' :
                                order.status === 'pending_settlement' ? 'clearing' :
                                order.status?.replace('_', ' ') || 'draft'}
                            </span>
                            <p className="text-[10px] text-gray-500 mt-0.5">${order.value?.toLocaleString() || '0'}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           </div>
        </div>
      );
    }

    // 3. Customs View: Quick Actions + Risk Screening Table
    if (userRole === UserPersona.CUSTOMS) {
      return (
        <div className="flex-1 flex flex-col gap-4 animate-fade-in">
           {/* Customs Quick Actions Bar */}
           <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                 <h3 className="text-sm font-heading font-bold text-trade-primary dark:text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-trade-accent" /> Quick Actions
                 </h3>
                 <span className="text-[10px] bg-trade-secondary/10 text-trade-secondary px-2 py-0.5 rounded-full font-medium">Customs Tools</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                 {getQuickActions().map(action => (
                    <button 
                       key={action.label} 
                       onClick={action.action}
                       className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-trade-accent dark:hover:border-trade-accent hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group whitespace-nowrap"
                    >
                       <div className={`p-1.5 rounded-lg text-white ${action.color} group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-3.5 h-3.5" />
                       </div>
                       <span className="text-xs font-medium text-trade-primary dark:text-gray-300">{action.label}</span>
                    </button>
                 ))}
              </div>
           </div>

           {/* Risk Screening Table */}
           <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-0 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                 <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-trade-secondary" /> Live Risk Inspection Feed
                 </h3>
                 <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold font-mono">18 High Risk</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold font-mono">420 Cleared</span>
                 </div>
              </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                 <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 uppercase font-medium">
                    <tr>
                       <th className="px-4 py-3">ID</th>
                       <th className="px-4 py-3">Exporter</th>
                       <th className="px-4 py-3">Origin</th>
                       <th className="px-4 py-3">Commodity</th>
                       <th className="px-4 py-3">Risk Score</th>
                       <th className="px-4 py-3">Status</th>
                       <th className="px-4 py-3">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {declarations.length === 0 ? (
                       <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                             No declarations found. Data will appear when trades are processed.
                          </td>
                       </tr>
                    ) : declarations.map(dec => (
                       <tr key={dec.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 font-mono">{dec.id}</td>
                          <td className="px-4 py-3 font-medium text-trade-primary dark:text-white">{dec.exporter}</td>
                          <td className="px-4 py-3">{dec.origin}</td>
                          <td className="px-4 py-3">{dec.commodity}</td>
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-2">
                                <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                   <div className={`h-full ${dec.risk > 50 ? 'bg-trade-error' : 'bg-trade-success'}`} style={{ width: `${dec.risk}%` }} />
                                </div>
                                <span className={`font-bold font-mono ${dec.risk > 50 ? 'text-trade-error' : 'text-trade-success'}`}>{dec.risk}</span>
                             </div>
                          </td>
                          <td className="px-4 py-3">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                dec.status === 'Cleared' ? 'bg-green-100 text-green-700' : 
                                dec.status === 'Flagged' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                             }`}>
                                {dec.status}
                             </span>
                          </td>
                          <td className="px-4 py-3">
                             <button onClick={() => navigateTo(AppView.COMPLIANCE)} className="text-trade-secondary hover:underline font-medium">Inspect</button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           </div>
        </div>
      );
    }

    // 3. Government View: Macro Charts with Quick Actions
    if (userRole === UserPersona.GOVERNMENT) {
       return (
          <div className="flex-1 flex flex-col gap-4 animate-fade-in">
             {/* Government Quick Actions Bar */}
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                   <h3 className="text-sm font-heading font-bold text-trade-primary dark:text-white flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-trade-accent" /> Quick Actions
                   </h3>
                   <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">Policy Tools</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                   {getQuickActions().map(action => (
                      <button 
                         key={action.label} 
                         onClick={action.action}
                         className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-trade-accent dark:hover:border-trade-accent hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group whitespace-nowrap"
                      >
                         <div className={`p-1.5 rounded-lg text-white ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-3.5 h-3.5" />
                         </div>
                         <span className="text-xs font-medium text-trade-primary dark:text-gray-300">{action.label}</span>
                      </button>
                   ))}
                </div>
             </div>

             {/* Trade Balance Chart */}
             <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-base font-heading font-bold text-trade-primary dark:text-white">National Trade Balance (Live)</h3>
                    <div className="flex items-center gap-2">
                       <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                       </span>
                       <select className="bg-gray-100 dark:bg-slate-700 rounded-lg p-1.5 text-xs outline-none">
                           <option>Last 6 Months</option>
                           <option>Year to Date</option>
                       </select>
                    </div>
                </div>
                <div className="flex-1 min-h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={govExportData}>
                       <defs>
                          <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0B1F33" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#0B1F33" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#C9A24D" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#C9A24D" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                       <YAxis stroke="#94a3b8" fontSize={10} />
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                       <Tooltip contentStyle={{backgroundColor: '#0B1F33', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px'}} />
                       <Area type="monotone" dataKey="exports" stroke="#0B1F33" fillOpacity={1} fill="url(#colorExp)" name="Exports" />
                       <Area type="monotone" dataKey="imports" stroke="#C9A24D" fillOpacity={1} fill="url(#colorImp)" name="Imports" />
                    </AreaChart>
                 </ResponsiveContainer>
                </div>
             </div>
          </div>
       );
    }

    // 4. Enterprise/Logistics View: Enhanced Interactive Map (Default)
    return (
      <div className="flex-1 bg-slate-900 dark:bg-slate-950 rounded-xl shadow-lg relative overflow-hidden border border-slate-700 group animate-fade-in min-h-[400px]">
        {/* Map Legend Panel */}
        <div className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-700">
           <div className="flex items-center gap-2 mb-2">
              <MapIcon className="w-3.5 h-3.5 text-trade-accent" />
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider font-heading">Live Trade Flow</span>
              <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
           </div>
           <div className="flex gap-3 text-[10px] mb-2">
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-trade-success"></span> <span className="text-slate-400">Optimal</span></div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-trade-warning"></span> <span className="text-slate-400">Delay</span></div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-trade-error"></span> <span className="text-slate-400">Blocked</span></div>
           </div>
           {/* Hub Stats Summary */}
           <div className="pt-2 border-t border-slate-700 grid grid-cols-3 gap-2 text-center">
              <div>
                 <p className="text-[10px] text-slate-500">Active</p>
                 <p className="text-sm font-bold text-trade-success">{hubs.filter(h => h.status === 'operational').length}</p>
              </div>
              <div>
                 <p className="text-[10px] text-slate-500">Congested</p>
                 <p className="text-sm font-bold text-trade-warning">{hubs.filter(h => h.status === 'congested').length}</p>
              </div>
              <div>
                 <p className="text-[10px] text-slate-500">Routes</p>
                 <p className="text-sm font-bold text-trade-accent">{lanes.length}</p>
              </div>
           </div>
        </div>

        {/* Map Controls - Right Side */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
           {/* Zoom Controls */}
           <div className="bg-slate-800/90 backdrop-blur rounded-lg border border-slate-700 overflow-hidden">
              <button 
                 onClick={() => setMapZoom(prev => Math.min(prev + 0.2, 2))}
                 className="p-2 hover:bg-slate-700 transition-colors block border-b border-slate-700"
                 title="Zoom In"
              >
                 <ZoomIn className="w-4 h-4 text-slate-300" />
              </button>
              <button 
                 onClick={() => setMapZoom(prev => Math.max(prev - 0.2, 0.5))}
                 className="p-2 hover:bg-slate-700 transition-colors block"
                 title="Zoom Out"
              >
                 <ZoomOut className="w-4 h-4 text-slate-300" />
              </button>
           </div>
           
           {/* Layer Toggle */}
           <div className="relative">
              <button 
                 onClick={() => setShowMapLayers(!showMapLayers)}
                 className={`p-2 rounded-lg border transition-colors ${showMapLayers ? 'bg-trade-primary border-trade-primary' : 'bg-slate-800/90 border-slate-700 hover:bg-slate-700'}`}
                 title="Map Layers"
              >
                 <Layers className="w-4 h-4 text-slate-300" />
              </button>
              
              {/* Layer Options Dropdown */}
              {showMapLayers && (
                 <div className="absolute right-0 mt-2 w-40 bg-slate-800/95 backdrop-blur rounded-lg border border-slate-700 shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-slate-700">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Map Layers</p>
                    </div>
                    {[
                       { key: 'routes', label: 'Trade Routes', icon: Navigation },
                       { key: 'hubs', label: 'Trade Hubs', icon: CircleDot },
                       { key: 'congestion', label: 'Congestion', icon: AlertTriangle },
                       { key: 'weather', label: 'Weather', icon: Activity },
                    ].map(layer => (
                       <button
                          key={layer.key}
                          onClick={() => setActiveMapLayers(prev => ({ ...prev, [layer.key]: !prev[layer.key as keyof typeof prev] }))}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700 transition-colors"
                       >
                          <span className="flex items-center gap-2 text-xs text-slate-300">
                             <layer.icon className="w-3.5 h-3.5" />
                             {layer.label}
                          </span>
                          <span className={`w-3 h-3 rounded-sm border ${activeMapLayers[layer.key as keyof typeof activeMapLayers] ? 'bg-trade-primary border-trade-primary' : 'border-slate-500'}`}>
                             {activeMapLayers[layer.key as keyof typeof activeMapLayers] && (
                                <CheckCircle className="w-3 h-3 text-white" />
                             )}
                          </span>
                       </button>
                    ))}
                 </div>
              )}
           </div>

           {/* Quick Actions */}
           <button 
              onClick={() => navigateTo(AppView.LOGISTICS)}
              className="p-2 bg-trade-primary/90 hover:bg-trade-primary rounded-lg border border-trade-primary transition-colors"
              title="Full Map View"
           >
              <ArrowUpRight className="w-4 h-4 text-white" />
           </button>
        </div>

        {/* SVG Map with Zoom Transform */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <svg 
            viewBox="0 0 800 800" 
            className="w-full h-full max-w-[800px] opacity-90 transition-transform duration-300"
            style={{ transform: `scale(${mapZoom})` }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <path 
              d="M 280,60 C 350,60 450,70 550,80 C 600,200 650,300 600,450 C 550,600 500,700 500,700 C 400,600 320,500 320,350 C 200,300 150,280 150,280 C 150,150 200,100 280,60 Z"
              className="fill-slate-800 dark:fill-slate-900 stroke-slate-700 stroke-2"
            />

            {/* Trade Routes Layer */}
            {activeMapLayers.routes && lanes.map((lane) => {
              const color = lane.status === 'optimal' ? '#1FA971' : lane.status === 'delayed' ? '#F5A623' : '#D64545';
              return (
                <g key={lane.id} onClick={() => setSelectedLane(lane)} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <path
                    d={`M ${lane.coords.x1} ${lane.coords.y1} Q ${lane.coords.cx} ${lane.coords.cy} ${lane.coords.x2} ${lane.coords.y2}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    className="animate-[dash_30s_linear_infinite]"
                    opacity="0.6"
                  />
                  <circle r="3" fill="white">
                    <animateMotion 
                      dur={lane.status === 'delayed' ? '6s' : '3s'} 
                      repeatCount="indefinite"
                      path={`M ${lane.coords.x1} ${lane.coords.y1} Q ${lane.coords.cx} ${lane.coords.cy} ${lane.coords.x2} ${lane.coords.y2}`}
                    />
                  </circle>
                </g>
              );
            })}

            {/* Trade Hubs Layer */}
            {activeMapLayers.hubs && hubs.map((hub) => {
              const color = hub.status === 'operational' ? '#1FA971' : hub.status === 'congested' ? '#F5A623' : '#D64545';
              const isSelected = selectedHub?.id === hub.id;
              return (
                <g key={hub.id} onClick={() => setSelectedHub(isSelected ? null : hub)} className="cursor-pointer">
                  <circle 
                    cx={hub.x} cy={hub.y} 
                    r={isSelected ? 10 : 6} 
                    fill={color} 
                    filter="url(#glow)" 
                    className={`transition-all ${isSelected ? '' : 'animate-pulse'}`} 
                  />
                  <circle cx={hub.x} cy={hub.y} r="12" fill={color} opacity="0.2" className="animate-[ping_3s_ease-in-out_infinite]" />
                  <text x={hub.x} y={hub.y - 15} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">{hub.name}</text>
                  {activeMapLayers.congestion && (
                     <text x={hub.x} y={hub.y + 18} textAnchor="middle" fill={color} fontSize="8" fontWeight="bold" opacity="0.8">
                        {hub.status.toUpperCase()}
                     </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hub Detail Overlay */}
        {selectedHub && (
          <div className="absolute bottom-6 right-6 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl rounded-xl p-4 border border-slate-200 dark:border-slate-700 animate-fade-in z-20">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <div className={`p-2 rounded-lg ${
                    selectedHub.status === 'operational' ? 'bg-green-100 dark:bg-green-900/30' :
                    selectedHub.status === 'congested' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-red-100 dark:bg-red-900/30'
                 }`}>
                    <Anchor className={`w-4 h-4 ${
                       selectedHub.status === 'operational' ? 'text-green-600' :
                       selectedHub.status === 'congested' ? 'text-orange-600' : 'text-red-600'
                    }`} />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 dark:text-white font-heading text-sm">{selectedHub.name}</h4>
                    <p className={`text-[10px] font-bold uppercase ${
                       selectedHub.status === 'operational' ? 'text-green-600' :
                       selectedHub.status === 'congested' ? 'text-orange-600' : 'text-red-600'
                    }`}>{selectedHub.status}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedHub(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg text-center">
                <p className="text-[10px] text-slate-500">Inbound</p>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{lanes.filter(l => l.to === selectedHub.name).length}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg text-center">
                <p className="text-[10px] text-slate-500">Outbound</p>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{lanes.filter(l => l.from === selectedHub.name).length}</p>
              </div>
            </div>

            <button 
               onClick={() => navigateTo(AppView.LOGISTICS)}
               className="w-full py-2 bg-trade-primary hover:bg-trade-primary/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
            >
               View Hub Details <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        )}
        
        {/* Lane Detail Overlay */}
        {selectedLane && !selectedHub && (
          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl rounded-xl p-4 border border-slate-200 dark:border-slate-700 animate-fade-in z-20">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading text-sm">
                  {selectedLane.from} <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" /> {selectedLane.to}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{selectedLane.commodity}</p>
              </div>
              <button onClick={() => setSelectedLane(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-lg">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Volume</p>
                <p className="font-semibold text-slate-900 dark:text-white font-mono text-sm">{selectedLane.volume}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-lg">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Value</p>
                <p className="font-semibold text-slate-900 dark:text-white font-mono text-sm">{selectedLane.value}</p>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
              selectedLane.status === 'optimal' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              selectedLane.status === 'delayed' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              <span className="flex items-center gap-2">
                 {selectedLane.status === 'optimal' ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                 {selectedLane.status === 'optimal' ? 'Route Clear' : selectedLane.status === 'delayed' ? 'Customs Delay' : 'Route Blocked'}
              </span>
              <button 
                 onClick={() => navigateTo(AppView.LOGISTICS)}
                 className="text-[10px] font-bold underline"
              >
                 Track
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">

      {/* Dashboard Header with Customize Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-white">
            Command Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time overview of your trade operations
          </p>
        </div>
        <button
          onClick={() => setShowWidgetConfig(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <LayoutGrid className="w-4 h-4" />
          Customize
        </button>
      </div>

      {/* 1. KPI Bar */}
      {isWidgetVisible('kpis') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getKPIs().map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                  <p className={`text-xl font-bold font-heading mt-1 ${kpi.color} dark:text-white`}>{kpi.value}</p>
                  <p className="text-[10px] text-gray-500">{kpi.sub}</p>
               </div>
               <div className={`p-2 rounded-lg ${kpi.bg} dark:bg-slate-700/50`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
               </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
         {/* 2. Main Widget (Dynamic) */}
         {renderMainWidget()}

         {/* 3. AI Insight Card & Alerts */}
         <div className="flex flex-col gap-4">
             <div className="bg-gradient-to-br from-trade-primary to-trade-secondary p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Briefcase className="w-24 h-24" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase backdrop-blur-sm border border-white/10 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> AI Executive Brief
                       </span>
                       <span className="text-[10px] text-trade-accent flex items-center gap-1 animate-pulse"><Clock className="w-3 h-3" /> Live</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-90">{insight}</p>
                 </div>
             </div>

             {/* Recent Trades - Visible for all roles */}
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
                        <Truck className="w-4 h-4 text-trade-primary" /> Recent Trades
                    </h3>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
                    </span>
                 </div>
                 <div className="space-y-2.5 max-h-[180px] overflow-y-auto">
                    {myTrades.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">No trades found. <button onClick={() => navigateTo(AppView.TRADE_LIFECYCLE)} className="text-trade-primary hover:underline">Create one</button></div>
                    ) : myTrades.slice(0, 5).map(trade => (
                       <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-700 hover:border-trade-primary/30 transition-colors cursor-pointer" onClick={() => navigateTo(AppView.TRADE_LIFECYCLE)}>
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${trade.status === 'completed' ? 'bg-green-100 text-green-600' : trade.status === 'paused' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Truck className="w-4 h-4" />
                             </div>
                             <div>
                                <p className="font-bold font-heading text-trade-primary dark:text-white text-sm">{trade.product || 'Trade'} → {trade.destination_country || 'Pending'}</p>
                                <p className="text-[10px] font-mono text-gray-500">{trade.id}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className={`text-xs font-bold uppercase ${trade.status === 'completed' ? 'text-trade-success' : trade.status === 'paused' ? 'text-trade-warning' : 'text-blue-600'}`}>{trade.status?.replace('_', ' ')}</p>
                             <p className="text-[10px] text-gray-500">${trade.value?.toLocaleString() || '0'}</p>
                          </div>
                       </div>
                    ))}
                 </div>
             </div>

             {/* Enhanced Real-time Alerts Panel */}
             <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                 {/* Alert Header with Controls */}
                 <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                       <h3 className="text-base font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
                           <Bell className="w-4 h-4 text-trade-warning" /> Real-time Alerts
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                           </span>
                       </h3>
                       <div className="flex items-center gap-2">
                          <button 
                             onClick={() => setAlertSoundEnabled(!alertSoundEnabled)}
                             className={`p-1.5 rounded-lg transition-colors ${alertSoundEnabled ? 'bg-trade-primary/10 text-trade-primary' : 'bg-gray-100 text-gray-400'}`}
                             title={alertSoundEnabled ? 'Mute alerts' : 'Enable sound'}
                          >
                             {alertSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                             onClick={() => setShowAlertPanel(!showAlertPanel)}
                             className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-500 hover:text-trade-primary transition-colors"
                             title="Expand alerts"
                          >
                             <Filter className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] rounded-full font-bold">
                              {filteredAlerts.length} Active
                          </span>
                       </div>
                    </div>
                    
                    {/* Category Filter Pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                       {[
                          { key: 'all', label: 'All', icon: Bell },
                          { key: 'trade_delay', label: 'Delays', icon: Clock },
                          { key: 'compliance', label: 'Compliance', icon: ShieldCheck },
                          { key: 'currency', label: 'Currency', icon: DollarSign },
                          { key: 'logistics', label: 'Logistics', icon: Truck },
                       ].map(cat => (
                          <button
                             key={cat.key}
                             onClick={() => setAlertFilter(cat.key as AlertCategory | 'all')}
                             className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                                alertFilter === cat.key 
                                   ? 'bg-trade-primary text-white shadow-sm' 
                                   : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                             }`}
                          >
                             <cat.icon className="w-3 h-3" />
                             {cat.label}
                          </button>
                       ))}
                    </div>
                 </div>
                 
                 {/* Alerts List */}
                 <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                    {filteredAlerts.length === 0 ? (
                       <div className="text-center py-8 text-gray-400 text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          No alerts in this category
                       </div>
                    ) : filteredAlerts.map(alert => {
                       const catInfo = getCategoryInfo(alert.category);
                       const CategoryIcon = catInfo.icon;
                       return (
                          <div 
                             key={alert.id} 
                             className={`flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all cursor-pointer border-l-4 ${
                                alert.severity === 'high' ? 'border-l-red-500' : 
                                alert.severity === 'medium' ? 'border-l-orange-400' : 'border-l-green-400'
                             } ${!alert.read ? 'ring-1 ring-trade-primary/20' : ''}`}
                          >
                             <div className={`p-1.5 rounded-lg ${catInfo.bg} dark:bg-slate-600 shrink-0`}>
                                <CategoryIcon className={`w-3.5 h-3.5 ${catInfo.color}`} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                   <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{alert.title}</h4>
                                   <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                      alert.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                      alert.severity === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                   }`}>
                                      {alert.severity}
                                   </span>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{alert.message}</p>
                                <div className="flex items-center justify-between mt-2">
                                   <span className="text-[9px] text-gray-400 flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" /> {alert.time}
                                   </span>
                                   {alert.actionable && alert.actionLabel && (
                                      <button 
                                         onClick={(e) => { e.stopPropagation(); alert.actionView && navigateTo(alert.actionView); }}
                                         className="text-[10px] font-bold text-trade-primary hover:text-trade-secondary transition-colors flex items-center gap-1"
                                      >
                                         {alert.actionLabel}
                                         <ArrowUpRight className="w-3 h-3" />
                                      </button>
                                   )}
                                </div>
                             </div>
                          </div>
                       );
                    })}
                 </div>
             </div>
         </div>
      </div>

      {/* Widget Configuration Modal */}
      {showWidgetConfig && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-trade-primary dark:text-white flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" />
                    Customize Dashboard
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Show, hide, or reorder your widgets</p>
                </div>
                <button
                  onClick={() => setShowWidgetConfig(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="space-y-3">
                {widgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      widget.visible
                        ? 'border-trade-primary/30 bg-trade-primary/5'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'
                    } transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <button className="cursor-grab text-gray-400 hover:text-gray-600">
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <div className={`p-2 rounded-lg ${widget.visible ? 'bg-trade-primary/10' : 'bg-gray-200 dark:bg-slate-700'}`}>
                        <widget.icon className={`w-4 h-4 ${widget.visible ? 'text-trade-primary' : 'text-gray-400'}`} />
                      </div>
                      <span className={`font-medium ${widget.visible ? 'text-trade-primary dark:text-white' : 'text-gray-400'}`}>
                        {widget.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveWidget(widget.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUpRight className="w-3 h-3 rotate-[-45deg]" />
                        </button>
                        <button
                          onClick={() => moveWidget(widget.id, 'down')}
                          disabled={index === widgets.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUpRight className="w-3 h-3 rotate-[135deg]" />
                        </button>
                      </div>
                      <button
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          widget.visible
                            ? 'bg-trade-primary text-white'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                        }`}
                      >
                        {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-between">
              <button
                onClick={resetWidgets}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={() => setShowWidgetConfig(false)}
                className="px-6 py-2 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
