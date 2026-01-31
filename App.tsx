
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  Scale, 
  Truck, 
  Mic, 
  Image as ImageIcon,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  Briefcase,
  Landmark,
  Users,
  Coins,
  Languages,
  UserCircle,
  Settings,
  ShieldAlert,
  Building,
  Activity,
  Key,
  CheckCircle,
  Loader2,
  AlertTriangle
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
import { supabase } from './services/supabase';
import { mockDatabase } from './services/mockDatabase';

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

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Auth & Onboarding State
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userRole, setUserRole] = useState<UserPersona>(UserPersona.EXPORTER_SME);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  // Track if current session is a simulation (bypass Auth listeners)
  const isSimulatedRef = useRef(false);

  // Localization State
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('USD');
  
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
        
        // Check if profile is complete (Has Company Name)
        // The Safe Mode SQL trigger creates profiles with empty company_name. 
        // We use this to detect if the user needs to finish onboarding.
        if (dbProfile && dbProfile.company_name) {
            setUserRole(dbProfile.role);
            setUserProfile({
              userName: dbProfile.full_name,
              companyName: dbProfile.company_name,
              email: dbProfile.email,
              country: dbProfile.country,
              phone: dbProfile.phone || meta.phone || '',
              id: dbProfile.id,
              ...meta
            });
            setIsOnboarded(true);
        } else {
            // Profile exists but is incomplete (Skeleton from trigger) OR doesn't exist yet
            console.log("Profile incomplete, redirecting to onboarding...");
            
            // Pre-fill what we know for the Onboarding component
            setUserProfile({
              userName: dbProfile?.full_name || meta.full_name || '',
              email: session.user.email,
              id: session.user.id
            });
            setIsOnboarded(false);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        // If critical error, force logout to reset state
        // await supabase.auth.signOut(); 
        setIsOnboarded(false);
      }
  };

  // Check for Supabase Session
  useEffect(() => {
    const checkSession = async () => {
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

  if (!isOnboarded) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen bg-trade-bg dark:bg-slate-950 overflow-hidden transition-colors duration-300 font-sans">
      {/* Password Reset Overlay */}
      {showPasswordReset && <PasswordResetModal onClose={() => setShowPasswordReset(false)} />}

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
          <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">Platform</div>
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Command Center" />
          <NavItem view={AppView.TRADE_LIFECYCLE} icon={Briefcase} label="Trade Workspace" />
          <NavItem view={AppView.TRADE_FINANCE} icon={Landmark} label="Trade Finance" />
          <NavItem view={AppView.MARKET_INTEL} icon={Globe} label="Market Intelligence" />
          <NavItem view={AppView.COMPLIANCE} icon={Scale} label="Trade Compliance" />
          <NavItem view={AppView.LOGISTICS} icon={Truck} label="Logistics Grid" />
          
          <div className="px-4 py-1.5 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">Ecosystem</div>
          <NavItem view={AppView.MARKETPLACE} icon={Users} label="Partner Network" />
          
          <div className="px-4 py-1.5 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">Governance</div>
          <NavItem view={AppView.ADMIN} icon={ShieldAlert} label="Admin Console" />
          <NavItem view={AppView.REGULATOR} icon={Building} label="Regulator Portal" />
          <NavItem view={AppView.DIAGNOSTIC} icon={Activity} label="System Health" />
          
          <div className="px-4 py-1.5 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">AI Tools</div>
          <NavItem view={AppView.LIVE_ASSISTANT} icon={Mic} label="Voice Assistant" />
          <NavItem view={AppView.MARKETING} icon={ImageIcon} label="Marketing Studio" />
          
          <div className="px-4 py-1.5 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">Account</div>
          <NavItem view={AppView.PROFILE} icon={Settings} label="Profile & Settings" />
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
          <div className="relative">
              <UserCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <select 
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserPersona)}
                  className="w-full bg-slate-800 text-slate-300 text-[10px] font-medium rounded-lg py-1.5 pl-8 pr-2 border border-slate-700 outline-none focus:border-trade-accent focus:ring-1 focus:ring-trade-accent appearance-none cursor-pointer hover:bg-slate-750 transition-colors"
              >
                  {Object.values(UserPersona).map(role => (
                      <option key={role} value={role}>{role}</option>
                  ))}
              </select>
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
              {currentView === AppView.DASHBOARD ? 'Command Center' : 
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
               'Profile & Settings'}
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
            <button className="relative p-1.5 text-trade-secondary hover:text-trade-primary dark:text-gray-400 dark:hover:text-trade-accent">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-trade-error rounded-full border border-white dark:border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-5 relative flex flex-col">
          <div className="flex-1 min-h-0">
            {renderView()}
          </div>
        </div>

        {/* Global AI Co-Pilot Overlay */}
        <CoPilot currentView={currentView} />
      </main>
    </div>
  );
}
