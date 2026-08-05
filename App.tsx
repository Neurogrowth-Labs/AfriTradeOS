import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  Coins,
  Languages,
  Globe,
  Wifi,
  UserCircle,
  Key,
  CheckCircle,
  Loader2,
  AlertTriangle,
  FileText,
  Package,
  CreditCard,
  Shield,
  CheckCheck,
  Trash2,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { AppView, UserPersona } from './types';
import { useCurrency, CURRENCIES } from './contexts/CurrencyContext';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { useNotifications } from './contexts/NotificationContext';
import { supabase } from './services/supabase';
import { Footer } from './components/Footer';
import { getMenuForRole, canAccessView } from './config/roleMenuConfig';

// --- Lazy-loaded route components (code splitting) ---
const Dashboard = lazy(() =>
  import('./components/Dashboard').then(m => ({ default: m.Dashboard }))
);
const TradeLifecycle = lazy(() =>
  import('./components/TradeLifecycle').then(m => ({ default: m.TradeLifecycle }))
);
const MarketIntel = lazy(() =>
  import('./components/MarketIntel').then(m => ({ default: m.MarketIntel }))
);
const Compliance = lazy(() =>
  import('./components/Compliance').then(m => ({ default: m.Compliance }))
);
const Logistics = lazy(() =>
  import('./components/Logistics').then(m => ({ default: m.Logistics }))
);
const LiveAssistant = lazy(() =>
  import('./components/LiveAssistant').then(m => ({ default: m.LiveAssistant }))
);
const MarketingStudio = lazy(() =>
  import('./components/MarketingStudio').then(m => ({ default: m.MarketingStudio }))
);
const TradeFinance = lazy(() =>
  import('./components/TradeFinance').then(m => ({ default: m.TradeFinance }))
);
const Marketplace = lazy(() =>
  import('./components/Marketplace').then(m => ({ default: m.Marketplace }))
);
const UserProfile = lazy(() =>
  import('./components/UserProfile').then(m => ({ default: m.UserProfile }))
);
const CoPilot = lazy(() => import('./components/CoPilot').then(m => ({ default: m.CoPilot })));
const Onboarding = lazy(() =>
  import('./components/Onboarding').then(m => ({ default: m.Onboarding }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const RegulatorDashboard = lazy(() =>
  import('./components/RegulatorDashboard').then(m => ({ default: m.RegulatorDashboard }))
);
const SystemDiagnostic = lazy(() =>
  import('./components/SystemDiagnostic').then(m => ({ default: m.SystemDiagnostic }))
);
const KYCVerification = lazy(() =>
  import('./components/KYCVerification').then(m => ({ default: m.KYCVerification }))
);
const TenderManagement = lazy(() =>
  import('./components/TenderManagement').then(m => ({ default: m.TenderManagement }))
);
const SmartContracts = lazy(() =>
  import('./components/SmartContracts').then(m => ({ default: m.SmartContracts }))
);
const AnalyticsHub = lazy(() =>
  import('./components/AnalyticsHub').then(m => ({ default: m.AnalyticsHub }))
);
const AnalystMarketResearch = lazy(() =>
  import('./components/AnalystMarketResearch').then(m => ({ default: m.AnalystMarketResearch }))
);
const AnalystTradeTrends = lazy(() =>
  import('./components/AnalystTradeTrends').then(m => ({ default: m.AnalystTradeTrends }))
);
const AnalystRegulatoryData = lazy(() =>
  import('./components/AnalystRegulatoryData').then(m => ({ default: m.AnalystRegulatoryData }))
);
const AnalystLogisticsData = lazy(() =>
  import('./components/AnalystLogisticsData').then(m => ({ default: m.AnalystLogisticsData }))
);
const AnalystFinanceMetrics = lazy(() =>
  import('./components/AnalystFinanceMetrics').then(m => ({ default: m.AnalystFinanceMetrics }))
);
const AnalystMarketPlayers = lazy(() =>
  import('./components/AnalystMarketPlayers').then(m => ({ default: m.AnalystMarketPlayers }))
);
const AnalystTenderAnalysis = lazy(() =>
  import('./components/AnalystTenderAnalysis').then(m => ({ default: m.AnalystTenderAnalysis }))
);
const GovAgencyDashboard = lazy(() =>
  import('./components/GovAgencyDashboard').then(m => ({ default: m.GovAgencyDashboard }))
);
const GovPolicyCompliance = lazy(() =>
  import('./components/GovPolicyCompliance').then(m => ({ default: m.GovPolicyCompliance }))
);
const GovTradeAgreements = lazy(() =>
  import('./components/GovTradeAgreements').then(m => ({ default: m.GovTradeAgreements }))
);
const GovTradeStatistics = lazy(() =>
  import('./components/GovTradeStatistics').then(m => ({ default: m.GovTradeStatistics }))
);
const GovTradeFlows = lazy(() =>
  import('./components/GovTradeFlows').then(m => ({ default: m.GovTradeFlows }))
);
const GovEntityVerification = lazy(() =>
  import('./components/GovEntityVerification').then(m => ({ default: m.GovEntityVerification }))
);
const GovBusinessRegistry = lazy(() =>
  import('./components/GovBusinessRegistry').then(m => ({ default: m.GovBusinessRegistry }))
);
const CustomsAuthorityPanel = lazy(() =>
  import('./components/CustomsAuthorityPanel').then(m => ({ default: m.CustomsAuthorityPanel }))
);
const LogisticsProviderPanel = lazy(() =>
  import('./components/LogisticsProviderPanel').then(m => ({ default: m.LogisticsProviderPanel }))
);
const ImporterPanel = lazy(() => import('./components/ImporterPanel'));
const BankFinanceDashboard = lazy(() => import('./components/BankFinanceDashboard'));
const BankFinanceApplications = lazy(() => import('./components/BankFinanceApplications'));
const BankDueDiligence = lazy(() => import('./components/BankDueDiligence'));
const BankRiskClients = lazy(() => import('./components/BankRiskClients'));
const BankAccountSettings = lazy(() => import('./components/BankAccountSettings'));
const BankTradeTools = lazy(() => import('./components/BankTradeTools'));
const PrivacyPolicy = lazy(() =>
  import('./components/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy }))
);
const TermsOfService = lazy(() =>
  import('./components/TermsOfService').then(m => ({ default: m.TermsOfService }))
);

// Internal Component: Password Reset Modal
const PasswordResetModal = ({ onClose }: { onClose: () => void }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-premium max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="type-header text-gray-900 dark:text-white">Set New Password</h3>
            <p className="type-body text-gray-500">Secure your account with a new credential.</p>
          </div>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5" /> Password updated successfully!
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}
            <div>
              <label className="block type-caption font-semibold uppercase tracking-[0.08em] text-gray-500 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-premium w-full text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Map routes to AppView
const routeToView: Record<string, AppView> = {
  '/': AppView.DASHBOARD,
  '/dashboard': AppView.DASHBOARD,
  '/trade': AppView.TRADE_LIFECYCLE,
  '/finance': AppView.TRADE_FINANCE,
  '/market': AppView.MARKET_INTEL,
  '/compliance': AppView.COMPLIANCE,
  '/logistics': AppView.LOGISTICS,
  '/logistics-provider': AppView.LOGISTICS_PROVIDER,
  '/marketplace': AppView.MARKETPLACE,
  '/assistant': AppView.LIVE_ASSISTANT,
  '/marketing': AppView.MARKETING,
  '/profile': AppView.PROFILE,
  '/admin': AppView.ADMIN,
  '/regulator': AppView.REGULATOR,
  '/diagnostic': AppView.DIAGNOSTIC,
  '/kyc': AppView.KYC_VERIFICATION,
  '/tenders': AppView.TENDERS,
  '/contracts': AppView.CONTRACTS,
  '/customs': AppView.CUSTOMS,
  '/bank-dashboard': AppView.BANK_DASHBOARD,
  '/bank-applications': AppView.BANK_APPLICATIONS,
  '/bank-due-diligence': AppView.BANK_DUE_DILIGENCE,
  '/bank-risk-clients': AppView.BANK_RISK_CLIENTS,
  '/bank-settings': AppView.BANK_SETTINGS,
  '/bank-trade-tools': AppView.BANK_TRADE_TOOLS,
  '/importer': AppView.IMPORTER_PANEL,
  '/privacy': AppView.PRIVACY,
  '/terms': AppView.TERMS,
};

const viewToRoute: Record<AppView, string> = {
  [AppView.DASHBOARD]: '/dashboard',
  [AppView.TRADE_LIFECYCLE]: '/trade',
  [AppView.TRADE_FINANCE]: '/finance',
  [AppView.MARKET_INTEL]: '/market',
  [AppView.COMPLIANCE]: '/compliance',
  [AppView.LOGISTICS]: '/logistics',
  [AppView.LOGISTICS_PROVIDER]: '/logistics-provider',
  [AppView.MARKETPLACE]: '/marketplace',
  [AppView.LIVE_ASSISTANT]: '/assistant',
  [AppView.MARKETING]: '/marketing',
  [AppView.PROFILE]: '/profile',
  [AppView.ADMIN]: '/admin',
  [AppView.REGULATOR]: '/regulator',
  [AppView.DIAGNOSTIC]: '/diagnostic',
  [AppView.READINESS]: '/dashboard',
  [AppView.KYC_VERIFICATION]: '/kyc',
  [AppView.TENDERS]: '/tenders',
  [AppView.CONTRACTS]: '/contracts',
  [AppView.CUSTOMS]: '/customs',
  [AppView.BANK_DASHBOARD]: '/bank-dashboard',
  [AppView.BANK_APPLICATIONS]: '/bank-applications',
  [AppView.BANK_DUE_DILIGENCE]: '/bank-due-diligence',
  [AppView.BANK_RISK_CLIENTS]: '/bank-risk-clients',
  [AppView.BANK_SETTINGS]: '/bank-settings',
  [AppView.BANK_TRADE_TOOLS]: '/bank-trade-tools',
  [AppView.IMPORTER_PANEL]: '/importer',
  [AppView.PRIVACY]: '/privacy',
  [AppView.TERMS]: '/terms',
};

// Suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-trade-accent" />
  </div>
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthLoading,
    isOnboarded,
    userRole,
    userProfile,
    showPasswordReset,
    setShowPasswordReset,
    handleLogout,
    handleOnboardingComplete,
  } = useAuth();
  const {
    notifications,
    notificationsLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();

  // Initialize sidebar based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Auto-close sidebar on mobile when resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentView = routeToView[location.pathname] || AppView.DASHBOARD;

  const setCurrentView = (view: AppView) => {
    if (!canAccessView(userRole, view)) {
      navigate('/dashboard');
      return;
    }
    navigate(viewToRoute[view] || '/dashboard');
  };

  // Route protection
  useEffect(() => {
    if (isOnboarded && currentView && !canAccessView(userRole, currentView)) {
      navigate('/dashboard');
    }
  }, [location.pathname, userRole, isOnboarded, currentView, navigate]);

  // Localization State
  const { language, setLanguage, t, LANGUAGES } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      trade_created: <Package className="w-4 h-4 text-blue-500" />,
      trade_updated: <Package className="w-4 h-4 text-amber-500" />,
      trade_completed: <CheckCircle className="w-4 h-4 text-green-500" />,
      kyc_submitted: <Shield className="w-4 h-4 text-blue-500" />,
      kyc_approved: <Shield className="w-4 h-4 text-green-500" />,
      kyc_rejected: <Shield className="w-4 h-4 text-red-500" />,
      document_uploaded: <FileText className="w-4 h-4 text-blue-500" />,
      document_approved: <FileText className="w-4 h-4 text-green-500" />,
      document_rejected: <FileText className="w-4 h-4 text-red-500" />,
      payment_received: <CreditCard className="w-4 h-4 text-green-500" />,
      payment_sent: <CreditCard className="w-4 h-4 text-amber-500" />,
      system_alert: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    };
    return icons[type] || <Bell className="w-4 h-4 text-gray-500" />;
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') !== 'light';
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const renderView = () => {
    // Public/legal pages accessible regardless of role
    switch (currentView) {
      case AppView.PRIVACY:
        return <PrivacyPolicy />;
      case AppView.TERMS:
        return <TermsOfService />;
    }

    // Trade Analyst gets dedicated analyst-specific components
    if (userRole === UserPersona.ANALYST) {
      switch (currentView) {
        case AppView.DASHBOARD:
          return <AnalyticsHub />;
        case AppView.MARKET_INTEL:
          return <AnalystMarketResearch />;
        case AppView.TRADE_LIFECYCLE:
          return <AnalystTradeTrends />;
        case AppView.COMPLIANCE:
          return <AnalystRegulatoryData />;
        case AppView.LOGISTICS:
          return <AnalystLogisticsData />;
        case AppView.TRADE_FINANCE:
          return <AnalystFinanceMetrics />;
        case AppView.MARKETPLACE:
          return <AnalystMarketPlayers />;
        case AppView.TENDERS:
          return <AnalystTenderAnalysis />;
        case AppView.PROFILE:
          return <UserProfile profileData={userProfile} userRole={userRole} />;
        default:
          return <AnalyticsHub />;
      }
    }

    // Government Agency gets dedicated government-specific components
    if (userRole === UserPersona.GOVERNMENT) {
      switch (currentView) {
        case AppView.REGULATOR:
          return <GovAgencyDashboard />;
        case AppView.COMPLIANCE:
          return <GovPolicyCompliance />;
        case AppView.CONTRACTS:
          return <GovTradeAgreements />;
        case AppView.MARKET_INTEL:
          return <GovTradeStatistics />;
        case AppView.LOGISTICS:
          return <GovTradeFlows />;
        case AppView.KYC_VERIFICATION:
          return <GovEntityVerification />;
        case AppView.MARKETPLACE:
          return <GovBusinessRegistry />;
        case AppView.PROFILE:
          return <UserProfile profileData={userProfile} userRole={userRole} />;
        default:
          return <GovAgencyDashboard />;
      }
    }

    // Logistics Provider gets dedicated logistics provider panel
    if (userRole === UserPersona.LOGISTICS) {
      switch (currentView) {
        case AppView.LOGISTICS_PROVIDER:
          return <LogisticsProviderPanel userRole={userRole} navigateTo={setCurrentView} />;
        case AppView.PROFILE:
          return <UserProfile profileData={userProfile} userRole={userRole} />;
        default:
          return <LogisticsProviderPanel userRole={userRole} navigateTo={setCurrentView} />;
      }
    }

    if (userRole === UserPersona.IMPORTER) {
      switch (currentView) {
        case AppView.IMPORTER_PANEL:
          return <ImporterPanel userRole={userRole} navigateTo={setCurrentView} />;
        case AppView.PROFILE:
          return <UserProfile profileData={userProfile} userRole={userRole} />;
        default:
          return <ImporterPanel userRole={userRole} navigateTo={setCurrentView} />;
      }
    }

    // Bank / Insurer gets dedicated bank-specific components
    if (userRole === UserPersona.BANK) {
      switch (currentView) {
        case AppView.BANK_DASHBOARD:
          return <BankFinanceDashboard />;
        case AppView.BANK_APPLICATIONS:
          return <BankFinanceApplications />;
        case AppView.BANK_DUE_DILIGENCE:
          return <BankDueDiligence />;
        case AppView.BANK_RISK_CLIENTS:
          return <BankRiskClients />;
        case AppView.BANK_SETTINGS:
          return <BankAccountSettings />;
        case AppView.BANK_TRADE_TOOLS:
          return <BankTradeTools />;
        default:
          return <BankFinanceDashboard />;
      }
    }

    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard userRole={userRole} navigateTo={setCurrentView} />;
      case AppView.TRADE_LIFECYCLE:
        return <TradeLifecycle />;
      case AppView.TRADE_FINANCE:
        return <TradeFinance />;
      case AppView.MARKET_INTEL:
        return <MarketIntel />;
      case AppView.COMPLIANCE:
        return <Compliance />;
      case AppView.LOGISTICS:
        return <Logistics />;
      case AppView.MARKETPLACE:
        return <Marketplace />;
      case AppView.LIVE_ASSISTANT:
        return <LiveAssistant />;
      case AppView.MARKETING:
        return <MarketingStudio />;
      case AppView.PROFILE:
        return <UserProfile profileData={userProfile} userRole={userRole} />;
      case AppView.ADMIN:
        return <AdminDashboard />;
      case AppView.REGULATOR:
        return <RegulatorDashboard />;
      case AppView.DIAGNOSTIC:
        return <SystemDiagnostic />;
      case AppView.KYC_VERIFICATION:
        return <KYCVerification />;
      case AppView.TENDERS:
        return <TenderManagement />;
      case AppView.CONTRACTS:
        return <SmartContracts />;
      case AppView.CUSTOMS:
        return <CustomsAuthorityPanel />;
      case AppView.LOGISTICS_PROVIDER:
        return <LogisticsProviderPanel userRole={userRole} navigateTo={setCurrentView} />;
      default:
        return <Dashboard userRole={userRole} navigateTo={setCurrentView} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-xs font-medium border-l-4 ${
        currentView === view
          ? `${isDark ? 'bg-white/10' : 'bg-trade-accent/10'} text-trade-accent border-trade-accent shadow-sm`
          : `${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} border-transparent`
      }`}
    >
      <Icon className={`w-4 h-4 ${currentView === view ? 'text-trade-accent' : ''}`} />
      {label}
    </button>
  );

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-trade-bg dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-trade-accent" />
      </div>
    );
  }

  // Public legal pages accessible without authentication
  if (location.pathname === '/privacy' || location.pathname === '/terms') {
    return (
      <div className="min-h-screen flex flex-col dark bg-gradient-to-br from-[#020617] via-[#071126] to-[#0a1628]">
        <div className="w-full p-4 md:p-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8B547] to-[#D4A43A] flex items-center justify-center shadow-lg shadow-[#E8B547]/25">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#071126]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">AfriTradeOS</span>
          </a>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-[#E8B547] hover:text-[#D4A43A] transition-colors"
          >
            Sign In
          </button>
        </div>
        <div className="flex-1 p-4 md:p-8 lg:p-10">
          <Suspense fallback={<LoadingFallback />}>
            {location.pathname === '/privacy' ? <PrivacyPolicy /> : <TermsOfService />}
          </Suspense>
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <div
      className={`${isDark ? 'dark-gold-platform' : 'light-gold-platform'} flex h-screen overflow-hidden transition-colors duration-300 font-sans ${isDark ? 'bg-[#0B0B0B]' : 'bg-[#f5f3ee]'}`}
    >
      {/* Password Reset Overlay */}
      {showPasswordReset && <PasswordResetModal onClose={() => setShowPasswordReset(false)} />}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 ${isDark ? 'bg-[#070707] text-white' : 'bg-white text-gray-900'} border-r ${isDark ? 'border-[#C9A24D]/25' : 'border-gray-200'} transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div
          className={`p-5 border-b ${isDark ? 'border-[#C9A24D]/20' : 'border-gray-200'} flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <img
              src="/afritradeos.jpeg"
              alt="AfriTradeOS"
              className="w-7 h-7 rounded-lg object-cover shadow-lg"
            />
            <span className={`type-header ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AfriTradeOS
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-icon lg:hidden text-slate-400 hover:text-white bg-white/5 border-[#C9A24D]/20 shadow-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-0.5 mt-2 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar pb-28">
          {isAuthLoading ? (
            // Skeleton loading for sidebar menu
            <div className="space-y-2 animate-pulse">
              <div className="px-4 py-1.5">
                <div className="h-3 w-16 bg-slate-700 rounded" />
              </div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-4 h-4 bg-slate-700 rounded" />
                  <div className="h-3 w-24 bg-slate-700 rounded" />
                </div>
              ))}
              <div className="px-4 py-1.5 mt-4">
                <div className="h-3 w-20 bg-slate-700 rounded" />
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-4 h-4 bg-slate-700 rounded" />
                  <div className="h-3 w-20 bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            getMenuForRole(userRole).map((section, sectionIdx) => (
              <div key={section.title}>
                <div
                  className={`px-4 py-1.5 ${sectionIdx > 0 ? 'mt-4' : ''} text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-gray-400'} uppercase tracking-wider font-heading`}
                >
                  {section.title}
                </div>
                {section.items.map(item => (
                  <NavItem key={item.view} view={item.view} icon={item.icon} label={item.label} />
                ))}
              </div>
            ))
          )}
        </nav>

        <div
          className={`absolute bottom-0 left-0 right-0 p-3 border-t ${isDark ? 'border-[#C9A24D]/20 bg-[#070707]' : 'border-gray-200 bg-white'}`}
        >
          <div
            className={`flex items-center gap-2 mb-2 cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} p-2 rounded-lg transition-colors`}
            onClick={() => {
              if (userRole === UserPersona.BANK) {
                setCurrentView(AppView.BANK_SETTINGS);
              } else {
                setCurrentView(AppView.PROFILE);
              }
            }}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.userName || 'User')}&background=C9A24D&color=fff`}
              alt="User"
              className="w-7 h-7 rounded-full ring-2 ring-trade-accent"
            />
            <div className="overflow-hidden">
              <p
                className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'} truncate`}
              >
                {userProfile?.userName || 'User'}
              </p>
              <p className={`type-caption ${isDark ? 'text-slate-400' : 'text-gray-500'} truncate`}>
                {userRole}
              </p>
            </div>
          </div>
          {/* Role badge and Logout button */}
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 flex items-center gap-2 px-3 py-1.5 ${isDark ? 'bg-[#15110A] border-[#C9A24D]/25' : 'bg-gray-50 border-gray-200'} rounded-lg border`}
            >
              <UserCircle className="w-3.5 h-3.5 text-trade-accent" />
              <span
                className={`text-[10px] font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}
              >
                {userRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-icon p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/20 shadow-none"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header
          className={`sticky top-0 z-30 h-14 ${isDark ? 'bg-gradient-to-r from-[#1A1505] via-[#15110A] to-[#1A1505] border-[#C9A24D]/20' : 'bg-white border-gray-200'} border-b flex items-center justify-between px-4 lg:px-6 shadow-lg`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-trade-primary dark:text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className={`type-header ${isDark ? 'text-[#F7E7B1]' : 'text-gray-900'}`}>
              {userRole === UserPersona.ANALYST
                ? currentView === AppView.DASHBOARD
                  ? 'Analytics Hub'
                  : currentView === AppView.MARKET_INTEL
                    ? 'Market Research'
                    : currentView === AppView.TRADE_LIFECYCLE
                      ? 'Trade Trends'
                      : currentView === AppView.COMPLIANCE
                        ? 'Regulatory Data'
                        : currentView === AppView.LOGISTICS
                          ? 'Logistics Data'
                          : currentView === AppView.TRADE_FINANCE
                            ? 'Finance Metrics'
                            : currentView === AppView.MARKETPLACE
                              ? 'Market Players'
                              : currentView === AppView.TENDERS
                                ? 'Tender Analysis'
                                : 'Profile & Settings'
                : userRole === UserPersona.GOVERNMENT
                  ? currentView === AppView.REGULATOR
                    ? 'Agency Command Center'
                    : currentView === AppView.COMPLIANCE
                      ? 'Policy & Compliance'
                      : currentView === AppView.CONTRACTS
                        ? 'Trade Agreements'
                        : currentView === AppView.MARKET_INTEL
                          ? 'Trade Statistics'
                          : currentView === AppView.LOGISTICS
                            ? 'Trade Flows'
                            : currentView === AppView.KYC_VERIFICATION
                              ? 'Entity Verification'
                              : currentView === AppView.MARKETPLACE
                                ? 'Business Registry'
                                : t('settings')
                  : userRole === UserPersona.LOGISTICS
                    ? currentView === AppView.LOGISTICS_PROVIDER
                      ? 'Logistics Command Center'
                      : currentView === AppView.PROFILE
                        ? t('settings')
                        : 'Logistics Command Center'
                    : currentView === AppView.DASHBOARD
                      ? t('commandCenter')
                      : currentView === AppView.TRADE_LIFECYCLE
                        ? 'Trade Workspace'
                        : currentView === AppView.TRADE_FINANCE
                          ? 'Trade Finance'
                          : currentView === AppView.MARKET_INTEL
                            ? 'Market Intelligence'
                            : currentView === AppView.COMPLIANCE
                              ? 'Compliance Engine'
                              : currentView === AppView.LOGISTICS
                                ? 'Logistics'
                                : currentView === AppView.MARKETPLACE
                                  ? 'Partner Network'
                                  : currentView === AppView.LIVE_ASSISTANT
                                    ? 'Live Assistant'
                                    : currentView === AppView.MARKETING
                                      ? 'Marketing Studio'
                                      : currentView === AppView.ADMIN
                                        ? 'Admin Console'
                                        : currentView === AppView.REGULATOR
                                          ? 'Regulator Oversight'
                                          : currentView === AppView.DIAGNOSTIC
                                            ? 'System Diagnostic'
                                            : currentView === AppView.TENDERS
                                              ? 'Tenders & RFQ'
                                              : currentView === AppView.CONTRACTS
                                                ? 'Smart Contracts'
                                                : currentView === AppView.PRIVACY
                                                  ? 'Privacy Policy'
                                                  : currentView === AppView.TERMS
                                                    ? 'Terms of Service'
                                                    : 'Profile & Settings'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30">
              <Wifi className="w-3 h-3" />
              {t('realTimeReady')}
            </div>
            {/* Localization UI */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="btn-secondary min-h-0 px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-[#F7E7B1] hover:bg-[#C9A24D]/10"
                title="Switch Language"
              >
                <Languages className="w-3 h-3 text-trade-accent" />
                {language}
              </button>
              {showLanguageDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                      {t('selectLanguage')}
                    </span>
                  </div>
                  {LANGUAGES.map(item => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${language === item.code ? 'bg-trade-accent/10' : ''}`}
                    >
                      <Globe className="w-4 h-4 text-trade-accent" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {item.nativeLabel}
                        </p>
                      </div>
                      {language === item.code && (
                        <CheckCircle className="w-4 h-4 text-trade-accent" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="btn-secondary min-h-0 px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-[#F7E7B1] hover:bg-[#C9A24D]/10"
                title="Switch Currency"
              >
                <Coins className="w-3 h-3 text-trade-accent" />
                <span>{CURRENCIES.find(c => c.code === currency)?.flag}</span>
                {currency}
              </button>
              {showCurrencyDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                      {t('selectCurrency')}
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    <div className="px-2 py-1.5">
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase px-2">
                        African Currencies
                      </span>
                    </div>
                    {CURRENCIES.filter(c =>
                      ['NGN', 'KES', 'ZAR', 'EGP', 'GHS', 'XOF', 'MAD'].includes(c.code)
                    ).map(c => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${currency === c.code ? 'bg-trade-accent/10' : ''}`}
                      >
                        <span className="text-base">{c.flag}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {c.code}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{c.name}</p>
                        </div>
                        <span className="text-xs text-gray-400">{c.symbol}</span>
                        {currency === c.code && (
                          <CheckCircle className="w-4 h-4 text-trade-accent" />
                        )}
                      </button>
                    ))}
                    <div className="px-2 py-1.5 border-t border-gray-100 dark:border-slate-700">
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase px-2">
                        International
                      </span>
                    </div>
                    {CURRENCIES.filter(c =>
                      ['USD', 'EUR', 'GBP', 'CNY', 'INR'].includes(c.code)
                    ).map(c => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${currency === c.code ? 'bg-trade-accent/10' : ''}`}
                      >
                        <span className="text-base">{c.flag}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {c.code}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{c.name}</p>
                        </div>
                        <span className="text-xs text-gray-400">{c.symbol}</span>
                        {currency === c.code && (
                          <CheckCircle className="w-4 h-4 text-trade-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`btn-icon p-0 ${isDark ? 'text-[#C9A24D] hover:text-[#F7E7B1]' : 'text-[#8B7025] hover:text-[#6b5a2e]'}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn-icon relative p-0 text-[#C9A24D] hover:text-[#F7E7B1]"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-trade-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {showNotifications && (
                <div className="card-premium absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-trade-accent" />
                      <span className="type-body font-semibold text-gray-900 dark:text-white">
                        {t('notifications')}
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-trade-accent text-white text-[10px] font-bold rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="btn-icon p-0 text-gray-500 hover:text-trade-accent hover:bg-gray-100 dark:hover:bg-slate-600 shadow-none"
                          title={t('markAllRead')}
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={clearAllNotifications}
                        className="btn-icon p-0 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-600 shadow-none"
                        title={t('clearAll')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-trade-accent animate-spin" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-slate-400">
                        <Bell className="w-10 h-10 mb-2 opacity-30" />
                        <p className="text-sm">{t('noNotifications')}</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (!notification.is_read) markAsRead(notification.id);
                            if (notification.link) {
                              navigate(notification.link);
                              setShowNotifications(false);
                            }
                          }}
                          className={`px-4 py-3 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                            !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                !notification.is_read
                                  ? 'bg-blue-100 dark:bg-blue-900/30'
                                  : 'bg-gray-100 dark:bg-slate-700'
                              }`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    !notification.is_read
                                      ? 'text-gray-900 dark:text-white'
                                      : 'text-gray-700 dark:text-slate-300'
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                                  {formatRelativeTime(notification.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              {notification.link && (
                                <div className="flex items-center gap-1 mt-1 text-trade-accent text-xs">
                                  <ExternalLink className="w-3 h-3" />
                                  <span>View details</span>
                                </div>
                              )}
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-trade-accent rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          // Could navigate to a dedicated notifications page
                        }}
                        className="w-full text-center text-xs text-trade-accent hover:text-trade-accent/80 font-medium py-1"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div
          className={`flex-1 overflow-auto p-4 lg:p-6 relative flex flex-col custom-scrollbar ${isDark ? 'bg-[#0B0B0B]' : 'bg-[#f5f3ee]'}`}
        >
          <div className="mx-auto w-full max-w-7xl flex-1">
            <Suspense fallback={<LoadingFallback />}>{renderView()}</Suspense>
          </div>
          <Footer />
        </div>

        {/* Global AI Co-Pilot Overlay */}
        <Suspense fallback={null}>
          <CoPilot currentView={currentView} />
        </Suspense>
      </main>
    </div>
  );
}
