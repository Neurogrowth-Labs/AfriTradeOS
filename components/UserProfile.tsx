import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Shield, 
  Settings, 
  CreditCard, 
  FileText, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Smartphone, 
  Mail, 
  Bell, 
  Zap, 
  LogOut, 
  LayoutGrid, 
  Users, 
  Activity, 
  Clock, 
  Download,
  HelpCircle,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { mockDatabase } from '../services/mockDatabase';
import { DbAuditLog, UserPersona } from '../types';

type Tab = 'general' | 'organization' | 'security' | 'ai' | 'billing' | 'audit';

export const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [logs, setLogs] = useState<DbAuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Mock State for Form Data
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Kofi Mensah',
    email: 'kofi.m@afrotrade.com',
    phone: '+233 54 123 4567',
    role: UserPersona.EXPORTER_SME,
    country: 'Ghana',
    language: 'English',
    timezone: 'GMT (Accra)'
  });

  const [toggles, setToggles] = useState({
    twoFactor: true,
    emailNotifs: true,
    smsNotifs: false,
    aiDataShare: true,
    aiExplain: true
  });

  useEffect(() => {
    if (activeTab === 'audit') {
      const fetchLogs = async () => {
        setLoadingLogs(true);
        const data = await mockDatabase.getAuditLogs();
        setLogs(data);
        setLoadingLogs(false);
      };
      fetchLogs();
    }
  }, [activeTab]);

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navItems = [
    { id: 'general', label: 'Identity & Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'security', label: 'Security & Compliance', icon: Shield },
    { id: 'ai', label: 'AI & Data Control', icon: Zap },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      
      {/* 1. Header & Trust Hub */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center gap-6">
         <div className="relative">
             <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-lg">
                 <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
             </div>
             <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800" title="Verified ID">
                 <CheckCircle className="w-4 h-4" />
             </div>
         </div>
         
         <div className="flex-1 text-center md:text-left">
             <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-1">{personalInfo.name}</h1>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                 <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Golden Cocoa Ltd.</span>
                 <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                 <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {personalInfo.country}</span>
             </div>
             <div className="flex flex-wrap justify-center md:justify-start gap-2">
                 <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">{personalInfo.role}</span>
                 <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                     <Shield className="w-3 h-3" /> Fully Verified
                 </span>
             </div>
         </div>

         {/* Trust Score */}
         <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center min-w-[160px]">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Trade Trust Score</span>
             <div className="text-3xl font-black text-trade-primary dark:text-white font-mono">92<span className="text-sm text-gray-400 font-medium">/100</span></div>
             <p className="text-[10px] text-green-600 font-bold mt-1">High Credibility</p>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
         
         {/* 2. Sidebar Navigation */}
         <div className="lg:col-span-3">
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                 {navItems.map(item => (
                     <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as Tab)}
                        className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all border-l-4 ${
                            activeTab === item.id
                            ? 'bg-blue-50 dark:bg-blue-900/10 text-trade-primary dark:text-blue-400 border-trade-primary'
                            : 'bg-transparent text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                     >
                         <item.icon className="w-5 h-5" />
                         {item.label}
                     </button>
                 ))}
                 <div className="p-5 mt-4 border-t border-gray-100 dark:border-slate-700">
                     <button className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-bold w-full">
                         <LogOut className="w-4 h-4" /> Sign Out
                     </button>
                 </div>
             </div>
             
             {/* Support Card */}
             <div className="mt-6 bg-trade-primary text-white p-5 rounded-xl text-center">
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                     <HelpCircle className="w-6 h-6" />
                 </div>
                 <h4 className="font-bold mb-1">Need Help?</h4>
                 <p className="text-xs text-gray-300 mb-3">Our support team is available 24/7 for Enterprise users.</p>
                 <button className="text-xs font-bold bg-white text-trade-primary px-4 py-2 rounded-lg w-full">Contact Support</button>
             </div>
         </div>

         {/* 3. Content Area */}
         <div className="lg:col-span-9 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-8 overflow-y-auto">
             
             {/* --- GENERAL TAB --- */}
             {activeTab === 'general' && (
                 <div className="space-y-8 animate-fade-in">
                     <div>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Identity & Personal Information</h2>
                         <p className="text-sm text-gray-500">Your profile represents your trade credibility across the AfriTradeOS network.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase">Full Legal Name</label>
                             <input type="text" value={personalInfo.name} className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white" readOnly />
                             <p className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified by Govt ID</p>
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                             <input type="email" value={personalInfo.email} className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white" />
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                             <input type="tel" value={personalInfo.phone} className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white" />
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase">Primary Language</label>
                             <select className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white">
                                 <option>English</option>
                                 <option>French</option>
                                 <option>Portuguese</option>
                                 <option>Arabic</option>
                             </select>
                         </div>
                     </div>

                     <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                         <h3 className="font-bold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                         <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <Mail className="w-5 h-5 text-gray-400" />
                                     <div>
                                         <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                                         <p className="text-xs text-gray-500">Weekly digests and critical alerts</p>
                                     </div>
                                 </div>
                                 <button onClick={() => toggle('emailNotifs')} className={`w-12 h-6 rounded-full p-1 transition-colors ${toggles.emailNotifs ? 'bg-green-500' : 'bg-gray-300'}`}>
                                     <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${toggles.emailNotifs ? 'translate-x-6' : 'translate-x-0'}`} />
                                 </button>
                             </div>
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <Smartphone className="w-5 h-5 text-gray-400" />
                                     <div>
                                         <p className="text-sm font-medium text-gray-900 dark:text-white">SMS / WhatsApp Alerts</p>
                                         <p className="text-xs text-gray-500">Real-time trade status updates</p>
                                     </div>
                                 </div>
                                 <button onClick={() => toggle('smsNotifs')} className={`w-12 h-6 rounded-full p-1 transition-colors ${toggles.smsNotifs ? 'bg-green-500' : 'bg-gray-300'}`}>
                                     <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${toggles.smsNotifs ? 'translate-x-6' : 'translate-x-0'}`} />
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* --- ORGANIZATION TAB --- */}
             {activeTab === 'organization' && (
                 <div className="space-y-8 animate-fade-in">
                     <div className="flex justify-between items-start">
                         <div>
                             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Organization Profile</h2>
                             <p className="text-sm text-gray-500">Manage business details and team permissions.</p>
                         </div>
                         <button className="text-xs font-bold bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-900 dark:text-white px-3 py-2 rounded-lg flex items-center gap-2">
                             <LayoutGrid className="w-4 h-4" /> View Public Profile
                         </button>
                     </div>

                     <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                         <div className="flex items-start gap-4">
                             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-700">
                                 <Building2 className="w-8 h-8 text-trade-primary" />
                             </div>
                             <div>
                                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Golden Cocoa Producers Ltd.</h3>
                                 <p className="text-sm text-gray-500 mb-2">Registration No: GH-2023-88291 • Tax ID: C00088219</p>
                                 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">KYB Verified</span>
                             </div>
                         </div>
                     </div>

                     <div>
                         <h3 className="font-bold text-gray-900 dark:text-white mb-4">Team & Permissions</h3>
                         <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                             <table className="w-full text-sm text-left">
                                 <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-medium">
                                     <tr>
                                         <th className="p-4">User</th>
                                         <th className="p-4">Role</th>
                                         <th className="p-4">Access Level</th>
                                         <th className="p-4 text-right">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                     <tr>
                                         <td className="p-4 font-medium text-gray-900 dark:text-white">Kofi Mensah (You)</td>
                                         <td className="p-4">Admin</td>
                                         <td className="p-4 text-gray-500">Full Access</td>
                                         <td className="p-4 text-right text-gray-400">Owner</td>
                                     </tr>
                                     <tr>
                                         <td className="p-4 font-medium text-gray-900 dark:text-white">Sarah Osei</td>
                                         <td className="p-4">Logistics Mgr</td>
                                         <td className="p-4 text-gray-500">Trades, Shipments</td>
                                         <td className="p-4 text-right"><button className="text-blue-600 hover:underline">Edit</button></td>
                                     </tr>
                                     <tr>
                                         <td className="p-4 font-medium text-gray-900 dark:text-white">Emmanuel K.</td>
                                         <td className="p-4">Finance</td>
                                         <td className="p-4 text-gray-500">Invoices, Banking</td>
                                         <td className="p-4 text-right"><button className="text-blue-600 hover:underline">Edit</button></td>
                                     </tr>
                                 </tbody>
                             </table>
                             <div className="p-3 bg-gray-50 dark:bg-slate-900 text-center border-t border-gray-200 dark:border-slate-700">
                                 <button className="text-sm font-bold text-trade-primary dark:text-blue-400 flex items-center justify-center gap-2">
                                     <Users className="w-4 h-4" /> Invite New Member
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* --- SECURITY & COMPLIANCE --- */}
             {activeTab === 'security' && (
                 <div className="space-y-8 animate-fade-in">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Security Settings</h2>
                             <p className="text-sm text-gray-500 mb-6">Manage how you access your account.</p>
                             
                             <div className="space-y-4">
                                 <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                     <div>
                                         <p className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                                         <p className="text-xs text-gray-500">Secure your account with SMS or Authenticator.</p>
                                     </div>
                                     <button onClick={() => toggle('twoFactor')} className={`w-12 h-6 rounded-full p-1 transition-colors ${toggles.twoFactor ? 'bg-green-500' : 'bg-gray-300'}`}>
                                         <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${toggles.twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
                                     </button>
                                 </div>
                                 <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                     <div>
                                         <p className="font-bold text-gray-900 dark:text-white">Password</p>
                                         <p className="text-xs text-gray-500">Last changed 3 months ago.</p>
                                     </div>
                                     <button className="text-sm text-blue-600 hover:underline font-bold">Update</button>
                                 </div>
                             </div>
                         </div>

                         <div>
                             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Compliance Center</h2>
                             <p className="text-sm text-gray-500 mb-6">Status of your regulatory requirements.</p>

                             <div className="space-y-3">
                                 <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-800">
                                     <CheckCircle className="w-5 h-5 text-green-600" />
                                     <div className="flex-1">
                                         <p className="text-sm font-bold text-green-800 dark:text-green-300">KYC Verification</p>
                                         <p className="text-xs text-green-700 dark:text-green-400">Identity confirmed via National ID.</p>
                                     </div>
                                 </div>
                                 <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-800">
                                     <CheckCircle className="w-5 h-5 text-green-600" />
                                     <div className="flex-1">
                                         <p className="text-sm font-bold text-green-800 dark:text-green-300">KYB Verification</p>
                                         <p className="text-xs text-green-700 dark:text-green-400">Business registration verified.</p>
                                     </div>
                                 </div>
                                 <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center gap-3 border border-amber-100 dark:border-amber-800">
                                     <AlertTriangle className="w-5 h-5 text-amber-600" />
                                     <div className="flex-1">
                                         <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Tax Clearance</p>
                                         <p className="text-xs text-amber-700 dark:text-amber-400">Renewal required in 30 days.</p>
                                     </div>
                                     <button className="text-xs bg-white text-amber-700 px-2 py-1 rounded shadow-sm border border-amber-200">Update</button>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                         <h3 className="font-bold text-gray-900 dark:text-white mb-4">Active Sessions</h3>
                         <div className="space-y-2">
                             <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                                 <div className="flex items-center gap-3">
                                     <Globe className="w-5 h-5 text-gray-400" />
                                     <div>
                                         <p className="text-sm font-bold text-gray-900 dark:text-white">Chrome on MacOS</p>
                                         <p className="text-xs text-gray-500">Accra, Ghana • Active Now</p>
                                     </div>
                                 </div>
                                 <span className="text-xs font-bold text-green-600">Current</span>
                             </div>
                             <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                                 <div className="flex items-center gap-3">
                                     <Smartphone className="w-5 h-5 text-gray-400" />
                                     <div>
                                         <p className="text-sm font-bold text-gray-900 dark:text-white">AfriTrade App on iPhone 13</p>
                                         <p className="text-xs text-gray-500">Accra, Ghana • 2 hours ago</p>
                                     </div>
                                 </div>
                                 <button className="text-xs text-red-500 font-bold hover:underline">Revoke</button>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* --- AI & DATA --- */}
             {activeTab === 'ai' && (
                 <div className="space-y-8 animate-fade-in">
                     <div>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI & Data Control</h2>
                         <p className="text-sm text-gray-500">You control how your data contributes to Africa’s trade intelligence.</p>
                     </div>

                     <div className="bg-purple-50 dark:bg-slate-900 p-6 rounded-xl border border-purple-100 dark:border-slate-700 flex items-start gap-4">
                         <Zap className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                         <div>
                             <h4 className="font-bold text-gray-900 dark:text-white">Gemini 3 Pro Integration</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                 AfriTradeOS uses advanced AI for compliance reasoning and logistics optimization. Your data is encrypted and anonymized.
                             </p>
                         </div>
                     </div>

                     <div className="space-y-6">
                         <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                             <div>
                                 <p className="font-bold text-gray-900 dark:text-white">Ecosystem Data Sharing</p>
                                 <p className="text-xs text-gray-500 max-w-md">Allow anonymized trade flow data to contribute to the Market Intelligence demand heatmap. Helps improve regional forecasting.</p>
                             </div>
                             <button onClick={() => toggle('aiDataShare')} className={`w-12 h-6 rounded-full p-1 transition-colors ${toggles.aiDataShare ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                 <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${toggles.aiDataShare ? 'translate-x-6' : 'translate-x-0'}`} />
                             </button>
                         </div>

                         <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                             <div>
                                 <p className="font-bold text-gray-900 dark:text-white">AI Explainability Mode</p>
                                 <p className="text-xs text-gray-500">Always show "Reasoning" and "Citations" for AI compliance decisions.</p>
                             </div>
                             <button onClick={() => toggle('aiExplain')} className={`w-12 h-6 rounded-full p-1 transition-colors ${toggles.aiExplain ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                 <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${toggles.aiExplain ? 'translate-x-6' : 'translate-x-0'}`} />
                             </button>
                         </div>
                     </div>
                 </div>
             )}

             {/* --- AUDIT LOGS --- */}
             {activeTab === 'audit' && (
                 <div className="space-y-6 animate-fade-in">
                     <div>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Audit Logs</h2>
                         <p className="text-sm text-gray-500">Security trail of all actions taken on your account.</p>
                     </div>

                     <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                         <table className="w-full text-sm text-left">
                             <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-medium">
                                 <tr>
                                     <th className="p-4">Action</th>
                                     <th className="p-4">User</th>
                                     <th className="p-4">Date & Time</th>
                                     <th className="p-4">IP Address</th>
                                     <th className="p-4">Status</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                 {loadingLogs ? (
                                     <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin w-6 h-6 mx-auto text-gray-400" /></td></tr>
                                 ) : logs.map(log => (
                                     <tr key={log.id}>
                                         <td className="p-4 font-medium text-gray-900 dark:text-white">{log.action}</td>
                                         <td className="p-4 text-gray-500">{log.user}</td>
                                         <td className="p-4 text-gray-500 font-mono text-xs">{log.timestamp}</td>
                                         <td className="p-4 text-gray-500 font-mono text-xs">{log.ip}</td>
                                         <td className="p-4">
                                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                 log.status === 'Success' ? 'bg-green-100 text-green-700' :
                                                 log.status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                                                 'bg-red-100 text-red-700'
                                             }`}>
                                                 {log.status}
                                             </span>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                     <div className="text-center">
                         <button className="text-sm font-bold text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto">
                             <Download className="w-4 h-4" /> Export CSV
                         </button>
                     </div>
                 </div>
             )}

             {/* --- BILLING --- */}
             {activeTab === 'billing' && (
                 <div className="space-y-8 animate-fade-in">
                      <div>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Billing & Subscription</h2>
                         <p className="text-sm text-gray-500">Manage your plan and payment methods.</p>
                     </div>

                     <div className="bg-gradient-to-r from-trade-primary to-trade-secondary text-white p-6 rounded-xl flex justify-between items-center">
                         <div>
                             <p className="text-sm text-blue-200 uppercase font-bold tracking-wider mb-1">Current Plan</p>
                             <h3 className="text-3xl font-bold font-heading">Pro Exporter</h3>
                             <p className="text-sm opacity-80 mt-1">Next billing date: Dec 1, 2024</p>
                         </div>
                         <div className="text-right">
                             <p className="text-2xl font-bold">$49<span className="text-sm font-normal">/mo</span></p>
                             <button className="mt-2 bg-white text-trade-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                                 Upgrade Plan
                             </button>
                         </div>
                     </div>

                     <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                         <h4 className="font-bold text-gray-900 dark:text-white mb-4">Payment Method</h4>
                         <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center">
                                     <CreditCard className="w-5 h-5 text-gray-600" />
                                 </div>
                                 <div>
                                     <p className="font-medium text-gray-900 dark:text-white">Visa ending in 4242</p>
                                     <p className="text-xs text-gray-500">Expires 12/26</p>
                                 </div>
                             </div>
                             <button className="text-sm text-blue-600 font-bold hover:underline">Edit</button>
                         </div>
                     </div>
                 </div>
             )}

         </div>
      </div>
    </div>
  );
};