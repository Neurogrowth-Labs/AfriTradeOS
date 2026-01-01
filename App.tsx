import React, { useState, useEffect } from 'react';
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
  UserCircle
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
import { CoPilot } from './components/CoPilot';
import { Onboarding } from './components/Onboarding';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Auth & Onboarding State
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userRole, setUserRole] = useState<UserPersona>(UserPersona.EXPORTER_SME);
  const [userProfile, setUserProfile] = useState<any>(null);

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
      setUserRole(role);
      setUserProfile(profile);
      setIsOnboarded(true);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard userRole={userRole} />;
      case AppView.TRADE_LIFECYCLE: return <TradeLifecycle />;
      case AppView.MARKET_INTEL: return <MarketIntel />;
      case AppView.COMPLIANCE: return <Compliance />;
      case AppView.LOGISTICS: return <Logistics />;
      case AppView.TRADE_FINANCE: return <TradeFinance />;
      case AppView.MARKETPLACE: return <Marketplace />;
      case AppView.LIVE_ASSISTANT: return <LiveAssistant />;
      case AppView.MARKETING: return <MarketingStudio />;
      default: return <Dashboard userRole={userRole} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
        currentView === view
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  if (!isOnboarded) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">A</div>
            <span className="text-xl font-bold tracking-tight text-slate-100">AfriTradeOS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1 mt-4 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar pb-32">
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</div>
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Command Center" />
          <NavItem view={AppView.TRADE_LIFECYCLE} icon={Briefcase} label="Trade Workspace" />
          <NavItem view={AppView.TRADE_FINANCE} icon={Landmark} label="Trade Finance" />
          <NavItem view={AppView.MARKET_INTEL} icon={Globe} label="Market Intelligence" />
          <NavItem view={AppView.COMPLIANCE} icon={Scale} label="Trade Compliance" />
          <NavItem view={AppView.LOGISTICS} icon={Truck} label="Logistics Grid" />
          
          <div className="px-4 py-2 mt-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Ecosystem</div>
          <NavItem view={AppView.MARKETPLACE} icon={Users} label="Partner Network" />
          
          <div className="px-4 py-2 mt-6 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Tools</div>
          <NavItem view={AppView.LIVE_ASSISTANT} icon={Mic} label="Voice Assistant" />
          <NavItem view={AppView.MARKETING} icon={ImageIcon} label="Marketing Studio" />
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900 dark:bg-slate-950">
          <div className="flex items-center gap-3 mb-3">
            <img src="https://picsum.photos/40/40" alt="User" className="w-8 h-8 rounded-full ring-2 ring-slate-700" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">Kofi Mensah</p>
              <p className="text-xs text-slate-400 truncate">{userRole}</p>
            </div>
          </div>
          <div className="relative">
              <UserCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select 
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserPersona)}
                  className="w-full bg-slate-800 text-slate-300 text-xs font-medium rounded-lg py-2 pl-9 pr-2 border border-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-slate-750 transition-colors"
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
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-8 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 dark:text-gray-400">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {currentView === AppView.DASHBOARD ? 'Dashboard' : 
               currentView === AppView.TRADE_LIFECYCLE ? 'Trade Workspace' :
               currentView === AppView.TRADE_FINANCE ? 'Trade Finance' :
               currentView === AppView.MARKET_INTEL ? 'Market Intelligence' :
               currentView === AppView.COMPLIANCE ? 'Compliance Engine' :
               currentView === AppView.LOGISTICS ? 'Logistics' :
               currentView === AppView.MARKETPLACE ? 'Partner Network' :
               currentView === AppView.LIVE_ASSISTANT ? 'Live Assistant' : 'Marketing Studio'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Localization UI */}
            <div className="hidden md:flex items-center gap-2 mr-4 bg-gray-50 dark:bg-slate-800 rounded-lg p-1">
               <button 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all"
                  title="Switch Language"
               >
                   <Languages className="w-3.5 h-3.5" />
                   {language}
               </button>
               <div className="w-px h-4 bg-gray-200 dark:bg-slate-700" />
               <button 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all"
                  title="Switch Currency"
               >
                   <Coins className="w-3.5 h-3.5" />
                   {currency}
               </button>
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-8 relative">
          {renderView()}
        </div>

        {/* Global AI Co-Pilot Overlay */}
        <CoPilot currentView={currentView} />
      </main>
    </div>
  );
}