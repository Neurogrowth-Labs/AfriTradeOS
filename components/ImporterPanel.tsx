import React, { useState, useEffect } from 'react';
import {
  Package, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle,
  Ship, Plane, Truck, FileText, Scale, DollarSign, BarChart3, Settings,
  Search, Filter, Download, Upload, Eye, Edit, MapPin, Calendar,
  Users, Award, Target, Activity, Bell, ChevronRight, ExternalLink,
  Building2, Globe, Shield, Percent, FileCheck, AlertCircle, XCircle
} from 'lucide-react';
import { UserPersona, AppView } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import {
  getDashboardKPIs,
  getImportOrders,
  getSuppliers,
  getShipmentTracking,
  getDocuments,
  getCustomsRequirements,
  getCostBreakdown,
  getNotifications,
  getSupplierPerformanceMetrics,
  getCarrierPerformanceMetrics,
  getCustomsClearanceMetrics,
  searchHSCode,
  getTradeAgreementRules,
  ImportOrder,
  SupplierProfile,
  ImportShipmentTracking,
  DocumentRecord,
  CostBreakdown,
  WorkflowNotification,
  SupplierPerformanceMetric,
  CarrierPerformanceMetric,
  CustomsClearanceMetric,
  JourneyStatus,
  TransportMode,
  ComplianceStatus,
  ImporterKPIs
} from '../services/importerService';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ImporterTab = 'dashboard' | 'orders' | 'shipments' | 'documents' | 'compliance' | 'finance' | 'analytics' | 'settings';

interface ImporterPanelProps {
  userRole?: UserPersona;
  navigateTo?: (view: AppView) => void;
}

const ImporterPanel: React.FC<ImporterPanelProps> = ({ userRole, navigateTo }) => {
  const [activeTab, setActiveTab] = useState<ImporterTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const { formatCurrency, currency } = useCurrency();

  // Data states
  const [kpis, setKpis] = useState<ImporterKPIs | null>(null);
  const [orders, setOrders] = useState<ImportOrder[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const [supplierMetrics, setSupplierMetrics] = useState<SupplierPerformanceMetric[]>([]);
  const [carrierMetrics, setCarrierMetrics] = useState<CarrierPerformanceMetric[]>([]);
  const [customsMetrics, setCustomsMetrics] = useState<CustomsClearanceMetric[]>([]);

  // Filter states
  const [orderFilter, setOrderFilter] = useState<{
    status?: JourneyStatus;
    supplier?: string;
    country?: string;
    transportMode?: TransportMode;
    complianceStatus?: ComplianceStatus;
  }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ImportOrder | null>(null);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<ImportShipmentTracking | null>(null);
  const [selectedOrderCosts, setSelectedOrderCosts] = useState<CostBreakdown | null>(null);

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Re-fetch orders when filters change
  useEffect(() => {
    fetchOrders();
  }, [orderFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        kpisData,
        ordersData,
        suppliersData,
        documentsData,
        notificationsData,
        supplierMetricsData,
        carrierMetricsData,
        customsMetricsData
      ] = await Promise.all([
        getDashboardKPIs(),
        getImportOrders(),
        getSuppliers(),
        getDocuments(),
        getNotifications(),
        getSupplierPerformanceMetrics(),
        getCarrierPerformanceMetrics(),
        getCustomsClearanceMetrics()
      ]);

      setKpis(kpisData);
      setOrders(ordersData);
      setSuppliers(suppliersData);
      setDocuments(documentsData);
      setNotifications(notificationsData);
      setSupplierMetrics(supplierMetricsData);
      setCarrierMetrics(carrierMetricsData);
      setCustomsMetrics(customsMetricsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersData = await getImportOrders(orderFilter);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrderSelect = async (order: ImportOrder) => {
    setSelectedOrder(order);
    try {
      const [trackingData, costsData] = await Promise.all([
        getShipmentTracking(order.id),
        getCostBreakdown(order.id)
      ]);
      setSelectedOrderTracking(trackingData);
      setSelectedOrderCosts(costsData);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const tabs = [
    { id: 'dashboard' as ImporterTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'orders' as ImporterTab, label: 'Import Orders', icon: Package },
    { id: 'shipments' as ImporterTab, label: 'Shipment Tracking', icon: Ship },
    { id: 'documents' as ImporterTab, label: 'Documents', icon: FileText },
    { id: 'compliance' as ImporterTab, label: 'Compliance', icon: Shield },
    { id: 'finance' as ImporterTab, label: 'Finance', icon: DollarSign },
    { id: 'analytics' as ImporterTab, label: 'Analytics', icon: TrendingUp },
    { id: 'settings' as ImporterTab, label: 'Settings', icon: Settings }
  ];

  // Helper functions
  const getStatusColor = (status: JourneyStatus) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'IN_TRANSIT': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'AT_PORT': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'CUSTOMS_CLEARANCE': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'RECEIVED': return 'text-gray-600 bg-gray-100 dark:bg-gray-700/30';
      case 'EXCEPTION': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'COMPLIANT': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'NON_COMPLIANT': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'NEEDS_REVIEW': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'SEA': return Ship;
      case 'AIR': return Plane;
      case 'LAND': return Truck;
      case 'MULTI_MODAL': return Package;
      default: return Package;
    }
  };

  const filteredOrders = orders.filter(order =>
    !searchQuery ||
    order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.sourceCountry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================================
  // RENDER FUNCTIONS FOR EACH TAB
  // ============================================================================

  const renderDashboard = () => {
    if (!kpis) return <div className="text-center py-12">Loading...</div>;

    const orderStatusData = [
      { name: 'In Transit', value: kpis.ordersInTransit, color: '#3B82F6' },
      { name: 'Clearance', value: kpis.ordersPendingClearance, color: '#EAB308' },
      { name: 'Delivered', value: kpis.ordersDelivered, color: '#10B981' }
    ];

    const recentOrders = orders.slice(0, 5);

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.activeOrders}</p>
            <p className="text-xs text-gray-500">Active Orders</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <Ship className="w-5 h-5 text-purple-500" />
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.ordersInTransit}</p>
            <p className="text-xs text-gray-500">In Transit</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.ordersPendingClearance}</p>
            <p className="text-xs text-gray-500">Pending Clearance</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(kpis.totalImportSpend)}</p>
            <p className="text-xs text-gray-500">Total Spend (YTD)</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <Percent className="w-5 h-5 text-indigo-500" />
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Savings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(kpis.dutySavings)}</p>
            <p className="text-xs text-gray-500">Duty Savings (AfCFTA)</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-xs text-green-600 dark:text-green-400">{kpis.complianceScore}%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.complianceScore}%</p>
            <p className="text-xs text-gray-500">Compliance Score</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {orderStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{kpis.onTimeDeliveryRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${kpis.onTimeDeliveryRate}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Lead Time</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{kpis.averageLeadTime} days</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(kpis.averageLeadTime / 60) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customs Clearance</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{kpis.customsClearanceTime}h</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(kpis.customsClearanceTime / 96) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Supplier Performance</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{kpis.supplierPerformance}/5.0</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(kpis.supplierPerformance / 5) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alerts</h3>
              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full font-bold">
                {notifications.filter(n => !n.read).length} New
              </span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.slice(0, 5).map(notif => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border ${
                    !notif.read
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Bell className={`w-4 h-4 mt-0.5 ${
                      notif.priority === 'HIGH' ? 'text-red-500' :
                      notif.priority === 'MEDIUM' ? 'text-yellow-500' : 'text-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="mt-4 w-full text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              View All Alerts →
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Import Orders</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Order No.</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Supplier</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Country</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Value</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const TransportIcon = getTransportIcon(order.transportMode);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer"
                      onClick={() => {
                        handleOrderSelect(order);
                        setActiveTab('orders');
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <TransportIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{order.supplier}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{order.sourceCountry}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(order.totalValue)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(order.journeyStatus)}`}>
                          {order.journeyStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {order.eta ? new Date(order.eta).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    return (
      <div className="space-y-4">
        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, suppliers, countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2 text-sm font-semibold"
            >
              <Filter className="w-4 h-4" />
              Filters {Object.keys(orderFilter).length > 0 && `(${Object.keys(orderFilter).length})`}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-semibold">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Status</label>
                <select
                  value={orderFilter.status || ''}
                  onChange={(e) => setOrderFilter({ ...orderFilter, status: e.target.value as JourneyStatus || undefined })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="RECEIVED">Received</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="AT_PORT">At Port</option>
                  <option value="CUSTOMS_CLEARANCE">Customs Clearance</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="EXCEPTION">Exception</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Transport Mode</label>
                <select
                  value={orderFilter.transportMode || ''}
                  onChange={(e) => setOrderFilter({ ...orderFilter, transportMode: e.target.value as TransportMode || undefined })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Modes</option>
                  <option value="SEA">Sea</option>
                  <option value="AIR">Air</option>
                  <option value="LAND">Land</option>
                  <option value="MULTI_MODAL">Multi-Modal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Compliance</label>
                <select
                  value={orderFilter.complianceStatus || ''}
                  onChange={(e) => setOrderFilter({ ...orderFilter, complianceStatus: e.target.value as ComplianceStatus || undefined })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All</option>
                  <option value="COMPLIANT">Compliant</option>
                  <option value="PENDING">Pending</option>
                  <option value="NON_COMPLIANT">Non-Compliant</option>
                  <option value="NEEDS_REVIEW">Needs Review</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setOrderFilter({})}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 text-sm font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Order No.</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Supplier</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Source</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Incoterm</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">PO Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Transport</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Value</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ETA</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Customs</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Compliance</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const TransportIcon = getTransportIcon(order.transportMode);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <TransportIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{order.supplier}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{order.sourceCountry}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded">
                          {order.incoterm}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.poDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded">
                          {order.transportMode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(order.journeyStatus)}`}>
                          {order.journeyStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(order.totalValue)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {order.eta ? new Date(order.eta).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          order.customsDeclarationStatus === 'CLEARED' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                          order.customsDeclarationStatus === 'UNDER_REVIEW' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                          order.customsDeclarationStatus === 'HELD' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                          'bg-gray-100 dark:bg-slate-700 text-gray-600'
                        }`}>
                          {order.customsDeclarationStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getComplianceStatusColor(order.complianceStatus)}`}>
                          {order.complianceStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOrderSelect(order)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
                            title="Documents"
                          >
                            <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No import orders found</p>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Details: {selectedOrder.orderNo}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Order Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Supplier</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedOrder.supplier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Source Country</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedOrder.sourceCountry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Incoterm</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedOrder.incoterm}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Transport Mode</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedOrder.transportMode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">HS Code</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedOrder.hsCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Value</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedOrder.totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedOrder.quantity || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Weight (kg)</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedOrder.weight || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Volume (m³)</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedOrder.volume || '-'}</p>
                  </div>
                </div>

                {/* Shipment Timeline */}
                {selectedOrderTracking && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Shipment Timeline</h3>
                    <div className="space-y-3">
                      {selectedOrderTracking.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            milestone.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30' :
                            milestone.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            milestone.status === 'DELAYED' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-gray-100 dark:bg-slate-700'
                          }`}>
                            {milestone.status === 'COMPLETED' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : milestone.status === 'IN_PROGRESS' ? (
                              <Activity className="w-4 h-4 text-blue-600" />
                            ) : milestone.status === 'DELAYED' ? (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{milestone.stage}</p>
                            {milestone.timestamp && (
                              <p className="text-xs text-gray-500">{new Date(milestone.timestamp).toLocaleString()}</p>
                            )}
                            {milestone.location && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {milestone.location}
                              </p>
                            )}
                            {milestone.notes && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{milestone.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                {selectedOrderCosts && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cost Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Purchase Value</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrderCosts.purchaseValue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Duties & Taxes</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrderCosts.dutiesAndTaxes)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Port Charges</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrderCosts.portCharges)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Inland Transport</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrderCosts.inlandTransport)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Insurance</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrderCosts.insurance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Other Fees</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrderCosts.otherFees)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 bg-blue-50 dark:bg-blue-900/20 px-4 rounded-lg mt-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Total Landed Cost</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(selectedOrderCosts.totalLandedCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderShipments = () => {
    const activeShipments = orders.filter(o =>
      o.journeyStatus === 'IN_TRANSIT' ||
      o.journeyStatus === 'AT_PORT' ||
      o.journeyStatus === 'CUSTOMS_CLEARANCE'
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Ship className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeShipments.length}</p>
                <p className="text-xs text-gray-500">Active Shipments</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orders.filter(o => o.journeyStatus === 'CUSTOMS_CLEARANCE').length}
                </p>
                <p className="text-xs text-gray-500">In Customs</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis?.averageLeadTime || 0}</p>
                <p className="text-xs text-gray-500">Avg Lead Time (days)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Shipments */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Shipment Tracking</h3>
          <div className="space-y-4">
            {activeShipments.map(order => {
              const TransportIcon = getTransportIcon(order.transportMode);
              const progress =
                order.journeyStatus === 'IN_TRANSIT' ? 40 :
                order.journeyStatus === 'AT_PORT' ? 70 :
                order.journeyStatus === 'CUSTOMS_CLEARANCE' ? 85 : 0;

              return (
                <div key={order.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TransportIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{order.orderNo}</p>
                        <p className="text-xs text-gray-500">{order.supplier} • {order.sourceCountry}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(order.journeyStatus)}`}>
                      {order.journeyStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Shipment Progress</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500 mb-1">Carrier</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{order.assignedLogisticsPartner || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">ETA</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {order.eta ? new Date(order.eta).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => {
                          handleOrderSelect(order);
                          setActiveTab('orders');
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 ml-auto"
                      >
                        Track <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeShipments.length === 0 && (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <Ship className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active shipments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    const orderDocs = documents.reduce((acc, doc) => {
      if (!acc[doc.orderId]) acc[doc.orderId] = [];
      acc[doc.orderId].push(doc);
      return acc;
    }, {} as Record<string, DocumentRecord[]>);

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Document Library</h3>
            <p className="text-xs text-gray-500 mt-1">Manage all trade documentation and compliance records</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-semibold">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        {Object.entries(orderDocs).map(([orderId, docs]) => {
          const order = orders.find(o => o.id === orderId);
          if (!order) return null;

          return (
            <div key={orderId} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-md font-bold text-gray-900 dark:text-white">{order.orderNo}</h4>
                  <p className="text-xs text-gray-500">{order.supplier} • {order.sourceCountry}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getComplianceStatusColor(order.complianceStatus)}`}>
                  {order.complianceStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">{doc.documentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                        {doc.expiryDate && (
                          <p className="text-xs text-gray-500">Expires {new Date(doc.expiryDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        doc.status === 'VERIFIED' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                        doc.status === 'EXPIRED' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                        doc.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                        'bg-gray-100 dark:bg-slate-700 text-gray-600'
                      }`}>
                        {doc.status}
                      </span>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded">
                        <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(orderDocs).length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No documents uploaded</p>
          </div>
        )}
      </div>
    );
  };

  const renderCompliance = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HS Code Lookup */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">HS Code Lookup</h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search HS Code or product description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">Example: 8517.12.00</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Telephones for cellular networks</p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duty Rate:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax Rate:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">16%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Duty Calculator */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Duty & Tax Calculator</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">HS Code</label>
                <input
                  type="text"
                  placeholder="e.g., 8517.12.00"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">CIF Value (USD)</label>
                <input
                  type="number"
                  placeholder="Enter value"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
                Calculate
              </button>
            </div>
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Compliance Status by Order</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => {
              const completedChecks = Math.floor(Math.random() * 5) + 3;
              const totalChecks = 7;
              const percentage = (completedChecks / totalChecks) * 100;

              return (
                <div key={order.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.orderNo}</p>
                      <p className="text-xs text-gray-500">{order.supplier}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getComplianceStatusColor(order.complianceStatus)}`}>
                      {order.complianceStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Compliance Checks</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {completedChecks}/{totalChecks}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage === 100 ? 'bg-green-500' :
                          percentage >= 70 ? 'bg-blue-500' :
                          percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {completedChecks >= 7 ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> All checks passed
                      </span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {totalChecks - completedChecks} checks pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AfCFTA Benefits */}
        <div className="bg-gradient-to-r from-amber-50 to-green-50 dark:from-amber-900/20 dark:to-green-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AfCFTA Preferential Trade</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                You've saved <span className="font-bold text-green-600">{formatCurrency(kpis?.dutySavings || 0)}</span> in duties this year through AfCFTA preferential rates.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Eligible Orders</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {orders.filter(o => o.hsCode === '2204.21.00').length}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Avg Duty Reduction</p>
                  <p className="text-xl font-bold text-green-600">25%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinance = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(kpis?.totalImportSpend || 0)}</p>
            <p className="text-xs text-gray-500">Total Import Spend (YTD)</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <Percent className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-green-600 font-semibold">Savings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(kpis?.dutySavings || 0)}</p>
            <p className="text-xs text-gray-500">Duty Savings</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <FileCheck className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-gray-600">Avg</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(orders.reduce((sum, o) => sum + o.totalValue, 0) / Math.max(orders.length, 1))}
            </p>
            <p className="text-xs text-gray-500">Avg Order Value</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <Scale className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(185000)}
            </p>
            <p className="text-xs text-gray-500">Duties Paid (YTD)</p>
          </div>
        </div>

        {/* Cost Breakdown by Order */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Order Cost Breakdown</h3>
          <div className="space-y-4">
            {orders.slice(0, 3).map(order => {
              const purchaseValue = order.totalValue;
              const dutiesAndTaxes = purchaseValue * 0.26;
              const totalLandedCost = purchaseValue + dutiesAndTaxes + 1200 + 800 + (purchaseValue * 0.015) + 450;

              return (
                <div key={order.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.orderNo}</p>
                      <p className="text-xs text-gray-500">{order.supplier}</p>
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(totalLandedCost)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500 mb-1">Purchase</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(purchaseValue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Duties & Tax</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(dutiesAndTaxes)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Port Charges</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(1200)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Transport</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(800)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Insurance</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(purchaseValue * 0.015)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spend Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Import Spend Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={customsMetrics.map(m => ({
              month: m.month,
              spend: m.dutiesPaid * 3.5,
              duties: m.dutiesPaid
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Area type="monotone" dataKey="spend" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Total Spend" />
              <Area type="monotone" dataKey="duties" stackId="2" stroke="#EAB308" fill="#EAB308" name="Duties Paid" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    return (
      <div className="space-y-6">
        {/* Supplier Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Supplier Performance Scorecard</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Supplier</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Country</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Orders</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">On-Time %</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Lead Time</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Total Value</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Rating</th>
                </tr>
              </thead>
              <tbody>
                {supplierMetrics.map(supplier => (
                  <tr key={supplier.supplierId} className="border-b border-gray-100 dark:border-slate-700">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">{supplier.supplierName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{supplier.country}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{supplier.totalOrders}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              supplier.onTimeDeliveryRate >= 90 ? 'bg-green-500' :
                              supplier.onTimeDeliveryRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${supplier.onTimeDeliveryRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{supplier.onTimeDeliveryRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{supplier.averageLeadTime}d</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(supplier.totalValue)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{supplier.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Carrier Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Carrier Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {carrierMetrics.map(carrier => {
              const CarrierIcon = getTransportIcon(carrier.transportMode);
              return (
                <div key={carrier.carrierId} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CarrierIcon className="w-5 h-5 text-blue-500" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{carrier.carrierName}</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipments:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{carrier.totalShipments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">On-Time:</span>
                      <span className={`font-semibold ${
                        carrier.onTimeRate >= 90 ? 'text-green-600' :
                        carrier.onTimeRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{carrier.onTimeRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Delay:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{carrier.averageDelay}h</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customs Clearance Efficiency */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Customs Clearance Efficiency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customsMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="averageClearanceTime"
                stroke="#3B82F6"
                name="Avg Clearance Time (h)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="complianceScore"
                stroke="#10B981"
                name="Compliance Score (%)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="holdRate"
                stroke="#EAB308"
                name="Hold Rate (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Company Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Company Name</label>
              <input
                type="text"
                placeholder="Enter company name"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Registration Number</label>
              <input
                type="text"
                placeholder="Enter registration number"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Country</label>
              <select className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
                <option>Kenya</option>
                <option>Nigeria</option>
                <option>South Africa</option>
                <option>Ghana</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Tax ID</label>
              <input
                type="text"
                placeholder="Enter tax ID"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {[
              'Shipment status updates',
              'Customs clearance alerts',
              'Document expiry warnings',
              'Payment due reminders',
              'Compliance updates'
            ].map((pref, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{pref}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Preferred Suppliers</h3>
          <div className="space-y-2">
            {suppliers.slice(0, 3).map(supplier => (
              <div key={supplier.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{supplier.name}</p>
                    <p className="text-xs text-gray-500">{supplier.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{supplier.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !kpis) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading importer panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Importer Panel</h2>
            <p className="text-xs text-gray-500">Manage import orders, shipments, and compliance</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'shipments' && renderShipments()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'compliance' && renderCompliance()}
        {activeTab === 'finance' && renderFinance()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default ImporterPanel;
