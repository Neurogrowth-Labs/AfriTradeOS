import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  Scale, 
  Truck, 
  Mic, 
  Image as ImageIcon,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { AppView } from './types';
import { Dashboard } from './components/Dashboard';
import { MarketIntel } from './components/MarketIntel';
import { Compliance } from './components/Compliance';
import { Logistics } from './components/Logistics';
import { LiveAssistant } from './components/LiveAssistant';
import { MarketingStudio } from './components/MarketingStudio';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard />;
      case AppView.MARKET_INTEL: return <MarketIntel />;
      case AppView.COMPLIANCE: return <Compliance />;
      case AppView.LOGISTICS: return <Logistics />;
      case AppView.LIVE_ASSISTANT: return <LiveAssistant />;
      case AppView.MARKETING: return <MarketingStudio />;
      default: return <Dashboard />;
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-lg flex items-center justify-center font-bold text-white text-xl">A</div>
            <span className="text-xl font-bold tracking-tight">AfriTradeOS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1 mt-4">
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</div>
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Command Center" />
          <NavItem view={AppView.MARKET_INTEL} icon={Globe} label="Market Intelligence" />
          <NavItem view={AppView.COMPLIANCE} icon={Scale} label="Trade Compliance" />
          <NavItem view={AppView.LOGISTICS} icon={Truck} label="Logistics Grid" />
          
          <div className="px-4 py-2 mt-6 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Tools</div>
          <NavItem view={AppView.LIVE_ASSISTANT} icon={Mic} label="Voice Assistant" />
          <NavItem view={AppView.MARKETING} icon={ImageIcon} label="Marketing Studio" />
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/40/40" alt="User" className="w-8 h-8 rounded-full ring-2 ring-slate-700" />
            <div>
              <p className="text-sm font-medium">Kofi Mensah</p>
              <p className="text-xs text-slate-400">Cocoa Exporters Ltd</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {currentView === AppView.DASHBOARD ? 'Dashboard' : 
               currentView === AppView.MARKET_INTEL ? 'Market Intelligence' :
               currentView === AppView.COMPLIANCE ? 'Compliance Engine' :
               currentView === AppView.LOGISTICS ? 'Logistics' :
               currentView === AppView.LIVE_ASSISTANT ? 'Live Assistant' : 'Marketing Studio'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}