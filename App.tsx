
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  Coins,
  Languages,
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
  ExternalLink
} from 'lucide-react';
import { AppView, UserPersona } from './types';
import { Dashboard } from './components/Dashboard';
import { TradeLifecycle } from './components/TradeLifecycle';
import { MarketIntel } from './components/MarketIntel';
import { Compliance } from './components/Compliance';
import { Logistics } from './components/Logistics';
import { LiveAssistant } from './components/LiveAssistant';
import { MarketingStudio } from './components/MarketingStudio';
import { TradeFinance } from './components/TradeFinance';
import { Marketplace } from './components/Marketplace';
import { UserProfile } from './components/UserProfile';
import { CoPilot } from './components/CoPilot';
import { Onboarding } from './components/Onboarding';
import { AdminDashboard } from './components/AdminDashboard';
import { RegulatorDashboard } from './components/RegulatorDashboard';
import { SystemDiagnostic } from './components/SystemDiagnostic';
import { KYCVerification } from './components/KYCVerification';
import { TenderManagement } from './components/TenderManagement';
import { SmartContracts } from './components/SmartContracts';
import { AnalyticsHub } from './components/AnalyticsHub';
import { AnalystMarketResearch } from './components/AnalystMarketResearch';
import { AnalystTradeTrends } from './components/AnalystTradeTrends';
import { AnalystRegulatoryData } from './components/AnalystRegulatoryData';
import { AnalystLogisticsData } from './components/AnalystLogisticsData';
import { AnalystFinanceMetrics } from './components/AnalystFinanceMetrics';
import { AnalystMarketPlayers } from './components/AnalystMarketPlayers';
import { AnalystTenderAnalysis } from './components/AnalystTenderAnalysis';
import { GovAgencyDashboard } from './components/GovAgencyDashboard';
import { GovPolicyCompliance } from './components/GovPolicyCompliance';
import { GovTradeAgreements } from './components/GovTradeAgreements';
import { GovTradeStatistics } from './components/GovTradeStatistics';
import { GovTradeFlows } from './components/GovTradeFlows';
import { GovEntityVerification } from './components/GovEntityVerification';
import { GovBusinessRegistry } from './components/GovBusinessRegistry';
import { CustomsAuthorityPanel } from './components/CustomsAuthorityPanel';
import { supabase } from './services/supabase';
import { mockDatabase } from './services/mockDatabase';
import { getMenuForRole, canAccessView } from './config/roleMenuConfig';

// Internal Component: Password Reset Modal
const PasswordResetModal = ({ onClose }: { onClose: () => void }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
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
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Set New Password</h3>
            <p className="text-sm text-gray-500">Secure your account with a new credential.</p>
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
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
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
};

const viewToRoute: Record<AppView, string> = {
  [AppView.DASHBOARD]: '/dashboard',
  [AppView.TRADE_LIFECYCLE]: '/trade',
  [AppView.TRADE_FINANCE]: '/finance',
  [AppView.MARKET_INTEL]: '/market',
  [AppView.COMPLIANCE]: '/compliance',
  [AppView.LOGISTICS]: '/logistics',
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
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize sidebar based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024; // lg breakpoint
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
  
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserPersona>(UserPersona.EXPORTER_SME);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const setCurrentView = (view: AppView) => {
    // Check if user can access this view
    if (!canAccessView(userRole, view)) {
      navigate('/dashboard');
      return;
    }
    navigate(viewToRoute[view] || '/dashboard');
  };
  
  // Route protection: redirect if user tries to access unauthorized route
  useEffect(() => {
    if (isOnboarded && currentView && !canAccessView(userRole, currentView)) {
      navigate('/dashboard');
    }
  }, [location.pathname, userRole, isOnboarded, currentView, navigate]);
  
  // Track if current session is a simulation (bypass Auth listeners)
  const isSimulatedRef = useRef(false);

  // Localization State
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('USD');

  // Notifications State
  interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
  }
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!userProfile?.id) return;
    setNotificationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
      // Fallback mock notifications for demo
      setNotifications([
        { id: '1', type: 'trade_created', title: 'New Trade Created', message: 'Your export order #EXP-2024-001 has been created successfully.', link: '/trade', is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        { id: '2', type: 'kyc_approved', title: 'KYC Approved', message: 'Your business verification has been approved. You can now access all features.', link: '/kyc', is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: '3', type: 'payment_received', title: 'Payment Received', message: 'You received $12,500 from Euro Imports Ltd for order #ORD-789.', link: '/finance', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: '4', type: 'document_approved', title: 'Document Verified', message: 'Your Certificate of Origin has been verified and approved.', link: '/compliance', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: '5', type: 'system_alert', title: 'System Maintenance', message: 'Scheduled maintenance on Feb 15, 2024 from 2:00 AM - 4:00 AM UTC.', link: null, is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      ]);
    } finally {
      setNotificationsLoading(false);
    }
  }, [userProfile?.id]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      if (userProfile?.id) {
        await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('user_id', userProfile.id)
          .eq('is_read', false);
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      if (userProfile?.id) {
        await supabase
          .from('notifications')
          .delete()
          .eq('user_id', userProfile.id);
      }
      setNotifications([]);
    } catch (e) {
      console.error('Failed to clear notifications:', e);
    }
  };

  // Fetch notifications when user profile is loaded
  useEffect(() => {
    if (userProfile?.id) {
      fetchNotifications();
    }
  }, [userProfile?.id, fetchNotifications]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
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

  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const fetchProfile = async (session: any) => {
      try {
        // 1. Try to get profile from DB (Single Source of Truth)
        const dbProfile = await mockDatabase.getUserProfile(session.user.id);
        
        // 2. Fallback to Auth Metadata if DB is empty (First login race condition)
        const meta = session.user.user_metadata || {};
        
        // Existing account: profile exists in DB → skip onboarding
        // New account: no profile at all → show onboarding
        if (dbProfile) {
            if (dbProfile.role) setUserRole(dbProfile.role);
            setUserProfile({
              userName: dbProfile.full_name || meta.full_name || '',
              companyName: dbProfile.company_name || '',
              email: dbProfile.email || session.user.email,
              country: dbProfile.country || 'Ghana',
              phone: dbProfile.phone || meta.phone || '',
              id: dbProfile.id,
              ...meta
            });
            setIsOnboarded(true);
        } else {
            // No profile at all - new account, redirect to onboarding
            console.log("No profile found, redirecting to onboarding...");
            setUserProfile({
              userName: meta.full_name || '',
              email: session.user.email,
              id: session.user.id
            });
            setIsOnboarded(false);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        // On error, keep current state - don't force onboarding for existing users
      }
  };

  // Check for Supabase Session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Session check error:", error.message);
          setIsOnboarded(false);
          setUserProfile(null);
          return;
        }
        if (session) {
          await fetchProfile(session);
        }
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkSession();

    // Listen for auth changes (Login, Logout, Password Recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setShowPasswordReset(true);
        }

        if (session) {
            fetchProfile(session);
        } else {
            // CRITICAL: If we are in Simulation Mode, IGNORE the "signed out" event
            // because there is no real session, but the app should remain logged in.
            if (isSimulatedRef.current) return;

            setIsOnboarded(false);
            setUserProfile(null);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleOnboardingComplete = (role: UserPersona, profile: any) => {
      // Mark as simulated if ID starts with mock_
      if (profile.id && profile.id.startsWith('mock_')) {
          isSimulatedRef.current = true;
      }
      setUserRole(role);
      setUserProfile(profile);
      setIsOnboarded(true);
  };

  const renderView = () => {
    // Trade Analyst gets dedicated analyst-specific components
    if (userRole === UserPersona.ANALYST) {
      switch (currentView) {
        case AppView.DASHBOARD: return <AnalyticsHub />;
        case AppView.MARKET_INTEL: return <AnalystMarketResearch />;
        case AppView.TRADE_LIFECYCLE: return <AnalystTradeTrends />;
        case AppView.COMPLIANCE: return <AnalystRegulatoryData />;
        case AppView.LOGISTICS: return <AnalystLogisticsData />;
        case AppView.TRADE_FINANCE: return <AnalystFinanceMetrics />;
        case AppView.MARKETPLACE: return <AnalystMarketPlayers />;
        case AppView.TENDERS: return <AnalystTenderAnalysis />;
        case AppView.PROFILE: return <UserProfile profileData={userProfile} userRole={userRole} />;
        default: return <AnalyticsHub />;
      }
    }

    // Government Agency gets dedicated government-specific components
    if (userRole === UserPersona.GOVERNMENT) {
      switch (currentView) {
        case AppView.REGULATOR: return <GovAgencyDashboard />;
        case AppView.COMPLIANCE: return <GovPolicyCompliance />;
        case AppView.CONTRACTS: return <GovTradeAgreements />;
        case AppView.MARKET_INTEL: return <GovTradeStatistics />;
        case AppView.LOGISTICS: return <GovTradeFlows />;
        case AppView.KYC_VERIFICATION: return <GovEntityVerification />;
        case AppView.MARKETPLACE: return <GovBusinessRegistry />;
        case AppView.PROFILE: return <UserProfile profileData={userProfile} userRole={userRole} />;
        default: return <GovAgencyDashboard />;
      }
    }

    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard userRole={userRole} navigateTo={setCurrentView} />;
      case AppView.TRADE_LIFECYCLE: return <TradeLifecycle />;
      case AppView.TRADE_FINANCE: return <TradeFinance />;
      case AppView.MARKET_INTEL: return <MarketIntel />;
      case AppView.COMPLIANCE: return <Compliance />;
      case AppView.LOGISTICS: return <Logistics />;
      case AppView.MARKETPLACE: return <Marketplace />;
      case AppView.LIVE_ASSISTANT: return <LiveAssistant />;
      case AppView.MARKETING: return <MarketingStudio />;
      case AppView.PROFILE: return <UserProfile profileData={userProfile} userRole={userRole} />;
      case AppView.ADMIN: return <AdminDashboard />;
      case AppView.REGULATOR: return <RegulatorDashboard />;
      case AppView.DIAGNOSTIC: return <SystemDiagnostic />;
      case AppView.KYC_VERIFICATION: return <KYCVerification />;
      case AppView.TENDERS: return <TenderManagement />;
      case AppView.CONTRACTS: return <SmartContracts />;
      case AppView.CUSTOMS: return <CustomsAuthorityPanel />;
      default: return <Dashboard userRole={userRole} navigateTo={setCurrentView} />;
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
          ? 'bg-white/10 text-trade-accent border-trade-accent shadow-sm'
          : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'
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

  if (!isOnboarded) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen bg-trade-bg dark:bg-slate-950 overflow-hidden transition-colors duration-300 font-sans">
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
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-trade-primary dark:bg-slate-950 border-r border-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-tr from-trade-secondary to-trade-primary border border-trade-accent rounded-lg flex items-center justify-center font-heading font-bold text-white text-lg shadow-lg">A</div>
            <span className="text-lg font-bold font-heading tracking-tight text-white">AfriTradeOS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-0.5 mt-2 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar pb-28">
          {getMenuForRole(userRole).map((section, sectionIdx) => (
            <div key={section.title}>
              <div className={`px-4 py-1.5 ${sectionIdx > 0 ? 'mt-4' : ''} text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading`}>
                {section.title}
              </div>
              {section.items.map((item) => (
                <NavItem key={item.view} view={item.view} icon={item.icon} label={item.label} />
              ))}
            </div>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 bg-trade-primary dark:bg-slate-950">
          <div 
            className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
            onClick={() => setCurrentView(AppView.PROFILE)}
          >
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.userName || 'User')}&background=C9A24D&color=fff`} alt="User" className="w-7 h-7 rounded-full ring-2 ring-trade-accent" />
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-200 truncate">{userProfile?.userName || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{userRole}</p>
            </div>
          </div>
          {/* Role is locked after onboarding - displayed as badge, not editable */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
              <UserCircle className="w-3.5 h-3.5 text-trade-accent" />
              <span className="text-[10px] font-medium text-slate-300">{userRole}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-5 lg:px-6 transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-trade-primary dark:text-gray-400">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-heading font-semibold text-trade-primary dark:text-gray-100">
              {userRole === UserPersona.ANALYST ? (
                currentView === AppView.DASHBOARD ? 'Analytics Hub' :
                currentView === AppView.MARKET_INTEL ? 'Market Research' :
                currentView === AppView.TRADE_LIFECYCLE ? 'Trade Trends' :
                currentView === AppView.COMPLIANCE ? 'Regulatory Data' :
                currentView === AppView.LOGISTICS ? 'Logistics Data' :
                currentView === AppView.TRADE_FINANCE ? 'Finance Metrics' :
                currentView === AppView.MARKETPLACE ? 'Market Players' :
                currentView === AppView.TENDERS ? 'Tender Analysis' :
                'Profile & Settings'
              ) : userRole === UserPersona.GOVERNMENT ? (
                currentView === AppView.REGULATOR ? 'Agency Command Center' :
                currentView === AppView.COMPLIANCE ? 'Policy & Compliance' :
                currentView === AppView.CONTRACTS ? 'Trade Agreements' :
                currentView === AppView.MARKET_INTEL ? 'Trade Statistics' :
                currentView === AppView.LOGISTICS ? 'Trade Flows' :
                currentView === AppView.KYC_VERIFICATION ? 'Entity Verification' :
                currentView === AppView.MARKETPLACE ? 'Business Registry' :
                'Settings'
              ) : (
                currentView === AppView.DASHBOARD ? 'Command Center' : 
                currentView === AppView.TRADE_LIFECYCLE ? 'Trade Workspace' :
                currentView === AppView.TRADE_FINANCE ? 'Trade Finance' :
                currentView === AppView.MARKET_INTEL ? 'Market Intelligence' :
                currentView === AppView.COMPLIANCE ? 'Compliance Engine' :
                currentView === AppView.LOGISTICS ? 'Logistics' :
                currentView === AppView.MARKETPLACE ? 'Partner Network' :
                currentView === AppView.LIVE_ASSISTANT ? 'Live Assistant' : 
                currentView === AppView.MARKETING ? 'Marketing Studio' : 
                currentView === AppView.ADMIN ? 'Admin Console' :
                currentView === AppView.REGULATOR ? 'Regulator Oversight' :
                currentView === AppView.DIAGNOSTIC ? 'System Diagnostic' :
                currentView === AppView.TENDERS ? 'Tenders & RFQ' :
                currentView === AppView.CONTRACTS ? 'Smart Contracts' :
                'Profile & Settings'
              )}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Localization UI */}
            <div className="hidden md:flex items-center gap-2 mr-4 bg-gray-50 dark:bg-slate-800 rounded-lg p-1 border border-gray-100 dark:border-slate-700">
               <button 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-trade-primary dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all"
                  title="Switch Language"
               >
                   <Languages className="w-3 h-3 text-trade-accent" />
                   {language}
               </button>
               <div className="w-px h-3 bg-gray-200 dark:bg-slate-700" />
               <button 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-trade-primary dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all"
                  title="Switch Currency"
               >
                   <Coins className="w-3 h-3 text-trade-accent" />
                   {currency}
               </button>
            </div>

            <button 
              onClick={toggleTheme}
              className="p-1.5 text-trade-secondary hover:text-trade-primary dark:text-gray-400 dark:hover:text-trade-accent transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 text-trade-secondary hover:text-trade-primary dark:text-gray-400 dark:hover:text-trade-accent"
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
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-trade-accent" />
                      <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
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
                          className="p-1.5 text-gray-500 hover:text-trade-accent hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={clearAllNotifications}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        title="Clear all"
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
                        <p className="text-sm">No notifications</p>
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
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              !notification.is_read ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-slate-700'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium truncate ${
                                  !notification.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'
                                }`}>
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
        <div className="flex-1 overflow-auto p-4 lg:p-5 relative flex flex-col">
          <div>
            {renderView()}
          </div>
        </div>

        {/* Global AI Co-Pilot Overlay */}
        <CoPilot currentView={currentView} />
      </main>
    </div>
  );
}
