/* eslint-disable react/no-unescaped-entities */

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Building2,
  Shield,
  CreditCard,
  FileText,
  CheckCircle,
  AlertTriangle,
  Globe,
  Smartphone,
  Mail,
  Zap,
  LogOut,
  Users,
  Download,
  HelpCircle,
  Loader2,
  Key,
  Save,
  Plus,
  Upload,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { mockDatabase } from '../services/mockDatabase';
import { DbAuditLog, UserPersona } from '../types';
import { supabase } from '../services/supabase';

type Tab = 'general' | 'organization' | 'security' | 'ai' | 'billing' | 'audit' | 'integrations' | 'preferences';

interface UserProfileProps {
  profileData?: any;
  userRole?: UserPersona;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profileData, userRole }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [logs, setLogs] = useState<DbAuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security & Compliance state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [kycVerifying, setKycVerifying] = useState(false);
  const [uploadType, setUploadType] = useState<'kyc' | 'tax' | 'kyb'>('kyc');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Database-driven stats
  const [stats, setStats] = useState({
    tradesCount: 0,
    completedTrades: 0,
    trustScore: 0,
    kycVerified: false,
    kybVerified: false
  });

  // Initialize state from props or defaults
  const [personalInfo, setPersonalInfo] = useState({
    name: profileData?.userName || '',
    email: profileData?.email || '',
    phone: profileData?.phone || '',
    role: userRole || UserPersona.EXPORTER_SME,
    country: profileData?.country || '',
    companyName: profileData?.companyName || '',
    language: 'English',
    timezone: 'GMT (Accra)'
  });

  const [toggles, setToggles] = useState({
    twoFactor: false,
    emailNotifs: true,
    smsNotifs: false,
    aiDataShare: true,
    aiExplain: true
  });

  // Sync state if props update
  useEffect(() => {
    if (profileData) {
      setPersonalInfo(prev => ({
        ...prev,
        name: profileData.userName || prev.name,
        email: profileData.email || prev.email,
        phone: profileData.phone || prev.phone,
        role: userRole || prev.role,
        country: profileData.country || prev.country,
        companyName: profileData.companyName || prev.companyName
      }));
    }
  }, [profileData, userRole]);

  // Fetch stats from database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const trades = await mockDatabase.getTrades();
        const kycReqs = await mockDatabase.getKYCRequests();
        
        const completedTrades = trades.filter(t => t.status === 'completed').length;
        const kycApproved = kycReqs.some(k => k.status === 'Approved');
        
        // Calculate trust score based on real data
        let trustScore = 50; // Base score
        if (trades.length > 0) trustScore += 10;
        if (completedTrades > 0) trustScore += completedTrades * 5;
        if (kycApproved) trustScore += 20;
        if (profileData?.companyName) trustScore += 10;
        trustScore = Math.min(100, trustScore);
        
        setStats({
          tradesCount: trades.length,
          completedTrades,
          trustScore,
          kycVerified: kycApproved,
          kybVerified: !!profileData?.companyName
        });
      } catch (e) {
        console.error('Failed to fetch profile stats:', e);
      }
    };
    fetchStats();
  }, [profileData]);

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

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      window.location.href = '/';
  };

  const handleSaveProfile = async () => {
    if (!profileData?.id) return;
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
        const success = await mockDatabase.updateUserProfile(profileData.id, {
            full_name: personalInfo.name,
            phone: personalInfo.phone,
            company_name: personalInfo.companyName,
            country: personalInfo.country
        });
        if (success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } else {
            alert("Failed to save profile. Please try again.");
        }
    } catch(e) {
        console.error(e);
        alert("An unexpected error occurred while saving.");
    } finally {
        setIsSaving(false);
    }
  };

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle KYC Verification
  const handleKYCVerify = async () => {
    setKycVerifying(true);
    try {
      // Create KYC request in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('kyc_requests').insert({
          user_id: user.id,
          status: 'pending',
          verification_type: 'identity',
          created_at: new Date().toISOString()
        });
      }
      setUploadType('kyc');
      setShowUploadModal(true);
    } catch (e) {
      console.error('KYC verification error:', e);
      alert('Failed to start KYC verification. Please try again.');
    } finally {
      setKycVerifying(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match.');
      return;
    }
    if (passwordData.new.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      alert('Password updated successfully.');
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (e: any) {
      console.error('Password change error:', e);
      alert(e.message || 'Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle document upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please log in to upload documents.');
      return;
    }

    try {
      // Upload to Supabase storage
      const fileName = `${user.id}/${uploadType}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      await supabase.from('documents').insert({
        user_id: user.id,
        document_type: uploadType,
        file_name: file.name,
        file_path: fileName,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      alert('Document uploaded successfully. It will be reviewed shortly.');
      setShowUploadModal(false);
    } catch (e: any) {
      console.error('Upload error:', e);
      alert(e.message || 'Failed to upload document. Please try again.');
    }
  };

  // Handle SSO connection
  const handleSSOConnect = async (provider: 'google' | 'microsoft' | 'saml') => {
    try {
      if (provider === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin }
        });
        if (error) throw error;
      } else if (provider === 'microsoft') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'azure',
          options: { redirectTo: window.location.origin }
        });
        if (error) throw error;
      } else {
        alert('SAML/OIDC configuration requires enterprise setup. Contact support.');
      }
    } catch (e: any) {
      console.error('SSO connection error:', e);
      alert(e.message || 'Failed to connect SSO provider.');
    }
  };

  const navItems = [
    { id: 'general', label: 'Identity & Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security & Compliance', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'ai', label: 'AI & Data Control', icon: Zap },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      
      {/* 1. Header & Trust Hub */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center gap-3 md:gap-6">
         <div className="relative">
             <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-lg">
                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(personalInfo.name)}&background=0B1F33&color=fff&size=200`} alt="Profile" className="w-full h-full object-cover" />
             </div>
             <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 md:p-1.5 rounded-full border-2 border-white dark:border-slate-800" title="Verified ID">
                 <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
             </div>
         </div>
         
         <div className="flex-1 text-center md:text-left">
             <h1 className="text-base md:text-2xl font-bold font-heading text-trade-primary dark:text-white mb-0.5 md:mb-1">{personalInfo.name}</h1>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-4">
                 <span className="flex items-center gap-1"><Building2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> {personalInfo.companyName}</span>
                 <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                 <span className="flex items-center gap-1"><Globe className="w-3 h-3 md:w-3.5 md:h-3.5" /> {personalInfo.country}</span>
             </div>
             <div className="flex flex-wrap justify-center md:justify-start gap-1.5 md:gap-2">
                 <span className="px-2 md:px-3 py-0.5 md:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">{personalInfo.role}</span>
                 {stats.kycVerified ? (
                   <span className="px-2 md:px-3 py-0.5 md:py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                       <Shield className="w-2.5 h-2.5 md:w-3 md:h-3" /> Verified
                   </span>
                 ) : (
                   <span className="px-2 md:px-3 py-0.5 md:py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                       <AlertTriangle className="w-2.5 h-2.5 md:w-3 md:h-3" /> Pending Verification
                   </span>
                 )}
             </div>
         </div>

         {/* Trust Score */}
         <div className="bg-gray-50 dark:bg-slate-900 p-2.5 md:p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center min-w-[120px] md:min-w-[160px]">
             <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">Trade Trust Score</span>
             <div className="text-xl md:text-3xl font-black text-trade-primary dark:text-white font-mono">{stats.trustScore}<span className="text-[10px] md:text-sm text-gray-400 font-medium">/100</span></div>
             <p className={`text-[9px] md:text-[10px] font-bold mt-0.5 md:mt-1 ${stats.trustScore >= 80 ? 'text-green-600' : stats.trustScore >= 60 ? 'text-amber-600' : 'text-gray-500'}`}>
               {stats.trustScore >= 80 ? 'High Credibility' : stats.trustScore >= 60 ? 'Good Standing' : 'Building Trust'}
             </p>
         </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  activeTab === item.id
                    ? 'bg-trade-primary text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 bg-red-50 dark:bg-red-900/20 text-red-600"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
         
         {/* 2. Sidebar Navigation — Desktop only */}
         <div className="hidden lg:block lg:col-span-3">
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
                     <button onClick={handleSignOut} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-bold w-full">
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
                     <div className="flex justify-between items-center">
                         <div>
                             <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-2">Identity & Personal Information</h2>
                             <p className="text-sm text-gray-500">Your profile represents your trade credibility across the AfriTradeOS network.</p>
                         </div>
                         <button 
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-trade-primary hover:bg-trade-secondary text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                         >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saveSuccess ? 'Saved!' : 'Save Changes'}
                         </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-trade-primary dark:text-gray-400 uppercase">Full Legal Name</label>
                             <input 
                                type="text" 
                                value={personalInfo.name} 
                                onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})}
                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-trade-primary dark:text-white outline-none focus:ring-2 focus:ring-trade-primary/10 transition-all" 
                             />
                             <p className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified by Govt ID</p>
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-trade-primary dark:text-gray-400 uppercase">Email Address</label>
                             <input type="email" value={personalInfo.email} className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-trade-primary dark:text-white" readOnly />
                             <p className="text-[10px] text-gray-400">Email cannot be changed.</p>
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-trade-primary dark:text-gray-400 uppercase">Phone Number</label>
                             <input 
                                type="tel" 
                                value={personalInfo.phone} 
                                onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-trade-primary dark:text-white outline-none focus:ring-2 focus:ring-trade-primary/10 transition-all" 
                             />
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-trade-primary dark:text-gray-400 uppercase">Primary Language</label>
                             <select className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-trade-primary dark:text-white">
                                 <option>English</option>
                                 <option>French</option>
                                 <option>Portuguese</option>
                                 <option>Arabic</option>
                             </select>
                         </div>
                         <div className="space-y-1 md:col-span-2">
                             <label className="text-xs font-bold text-trade-primary dark:text-gray-400 uppercase">Account Type / Role</label>
                             <select 
                                value={personalInfo.role}
                                onChange={async (e) => {
                                  const newRole = e.target.value as UserPersona;
                                  setPersonalInfo({...personalInfo, role: newRole});
                                  // Save to database
                                  if (profileData?.id) {
                                    await mockDatabase.updateUserProfile(profileData.id, { role: newRole });
                                    // Reload page to apply new role to sidebar
                                    window.location.reload();
                                  }
                                }}
                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-trade-primary dark:text-white outline-none focus:ring-2 focus:ring-trade-primary/10 transition-all"
                             >
                                 {Object.values(UserPersona).map(role => (
                                   <option key={role} value={role}>{role}</option>
                                 ))}
                             </select>
                             <p className="text-[10px] text-amber-600 flex items-center gap-1">
                               <AlertTriangle className="w-3 h-3" /> Changing role will update your dashboard and available features
                             </p>
                         </div>
                     </div>

                     <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                         <h3 className="font-bold text-trade-primary dark:text-white mb-4">Notification Preferences</h3>
                         <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <Mail className="w-5 h-5 text-gray-400" />
                                     <div>
                                         <p className="text-sm font-medium text-trade-primary dark:text-white">Email Notifications</p>
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
                                         <p className="text-sm font-medium text-trade-primary dark:text-white">SMS / WhatsApp Alerts</p>
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

             {/* --- PREFERENCES TAB --- */}
             {activeTab === 'preferences' && (
                 <div className="space-y-8 animate-fade-in">
                     <div>
                         <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-2">Preferences</h2>
                         <p className="text-sm text-gray-500">Notification, privacy, language, currency, and access control settings.</p>
                     </div>

                     {/* Notification Settings */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
                         <h3 className="text-base font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
                           <Mail className="w-4 h-4" /> Notification Settings
                         </h3>
                         <div className="space-y-4">
                           {[
                             { key: 'tradeUpdates', label: 'Trade Status Updates', desc: 'Get notified when trade status changes', default: true },
                             { key: 'complianceAlerts', label: 'Compliance Alerts', desc: 'Regulatory changes and deadline reminders', default: true },
                             { key: 'marketOpportunities', label: 'Market Opportunities', desc: 'AI-detected market trends and partner matches', default: true },
                             { key: 'financeReminders', label: 'Finance Reminders', desc: 'Payment deadlines and repayment schedules', default: true },
                             { key: 'contractRenewals', label: 'Contract Renewals', desc: 'Expiring contracts and milestone notifications', default: false },
                             { key: 'shipmentTracking', label: 'Shipment Tracking', desc: 'Real-time delivery and customs updates', default: true },
                           ].map(notif => (
                             <div key={notif.key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                               <div>
                                 <p className="text-sm font-medium text-gray-800 dark:text-white">{notif.label}</p>
                                 <p className="text-[10px] text-gray-500">{notif.desc}</p>
                               </div>
                               <label className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" defaultChecked={notif.default} className="sr-only peer" />
                                 <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-trade-primary"></div>
                               </label>
                             </div>
                           ))}
                         </div>
                     </div>

                     {/* Language, Currency & Region */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
                         <h3 className="text-base font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
                           <Globe className="w-4 h-4" /> Localization
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1.5">Language</label>
                             <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none">
                               <option>English</option>
                               <option>French (Français)</option>
                               <option>Arabic (العربية)</option>
                               <option>Portuguese (Português)</option>
                             </select>
                           </div>
                           <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1.5">Currency</label>
                             <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none">
                               <option>USD ($)</option>
                               <option>EUR (€)</option>
                               <option>GBP (£)</option>
                               <option>NGN (₦)</option>
                               <option>KES (KSh)</option>
                               <option>ZAR (R)</option>
                               <option>GHS (GH₵)</option>
                               <option>EGP (E£)</option>
                             </select>
                           </div>
                           <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1.5">Timezone</label>
                             <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none">
                               <option>GMT (Accra)</option>
                               <option>GMT+1 (Lagos, Douala)</option>
                               <option>GMT+2 (Cairo, Johannesburg)</option>
                               <option>GMT+3 (Nairobi, Addis Ababa)</option>
                             </select>
                           </div>
                         </div>
                     </div>

                     {/* Privacy Controls */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
                         <h3 className="text-base font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
                           <Shield className="w-4 h-4" /> Privacy Controls
                         </h3>
                         <div className="space-y-4">
                           {[
                             { key: 'profileVisibility', label: 'Profile Visibility', desc: 'Allow verified partners to view your company profile', default: true },
                             { key: 'tradeHistory', label: 'Trade History Sharing', desc: 'Share trade volume and reliability metrics with potential partners', default: false },
                             { key: 'aiAnalytics', label: 'AI Analytics', desc: 'Allow AI to analyze your trade data for personalized recommendations', default: true },
                           ].map(priv => (
                             <div key={priv.key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                               <div>
                                 <p className="text-sm font-medium text-gray-800 dark:text-white">{priv.label}</p>
                                 <p className="text-[10px] text-gray-500">{priv.desc}</p>
                               </div>
                               <label className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" defaultChecked={priv.default} className="sr-only peer" />
                                 <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-trade-primary"></div>
                               </label>
                             </div>
                           ))}
                         </div>
                     </div>

                     {/* Multi-Tier Access Control */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
                         <h3 className="text-base font-bold text-trade-primary dark:text-white mb-4 flex items-center gap-2">
                           <Users className="w-4 h-4" /> Multi-Tier Access Control
                         </h3>
                         <p className="text-xs text-gray-500 mb-4">Manage team access levels for SMEs with multiple users.</p>
                         <div className="space-y-3">
                           {[
                             { name: personalInfo.name, email: personalInfo.email, role: 'Admin', access: 'Full Access', color: 'bg-red-100 text-red-700' },
                             { name: 'Finance Manager', email: 'finance@company.com', role: 'Finance', access: 'Finance & Billing', color: 'bg-blue-100 text-blue-700' },
                             { name: 'Trade Operations', email: 'ops@company.com', role: 'Operations', access: 'Trades & Logistics', color: 'bg-green-100 text-green-700' },
                           ].map((member, idx) => (
                             <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                   {member.name.charAt(0)}
                                 </div>
                                 <div>
                                   <p className="text-sm font-medium text-gray-800 dark:text-white">{member.name}</p>
                                   <p className="text-[10px] text-gray-500">{member.email}</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${member.color}`}>{member.role}</span>
                                 <span className="text-[10px] text-gray-500">{member.access}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                         <button className="mt-3 w-full py-2 bg-trade-primary/10 hover:bg-trade-primary/20 text-trade-primary rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                           <Plus className="w-3.5 h-3.5" /> Invite Team Member
                         </button>
                     </div>

                     {/* Regional Trade Association Links */}
                     <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 flex items-start gap-3">
                       <Globe className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                       <div>
                         <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Link with Trade Associations & AfCFTA</p>
                         <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">Connect your account with regional trade associations and AfCFTA portals for streamlined compliance and market access.</p>
                         <button className="mt-2 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors">Connect Now</button>
                       </div>
                     </div>
                 </div>
             )}

             {/* --- ORGANIZATION TAB --- */}
             {activeTab === 'organization' && (
                 <div className="space-y-8 animate-fade-in">
                     <div className="flex justify-between items-start">
                         <div>
                             <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-2">Organization Profile</h2>
                             <p className="text-sm text-gray-500">Manage business details and team permissions.</p>
                         </div>
                         <button 
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-trade-primary hover:bg-trade-secondary text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                         >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saveSuccess ? 'Saved!' : 'Save Changes'}
                         </button>
                     </div>

                     <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                         <div className="flex items-start gap-4">
                             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-700">
                                 <Building2 className="w-8 h-8 text-trade-primary" />
                             </div>
                             <div className="flex-1">
                                 <input 
                                    type="text" 
                                    value={personalInfo.companyName}
                                    onChange={e => setPersonalInfo({...personalInfo, companyName: e.target.value})}
                                    className="text-lg font-bold text-trade-primary dark:text-white bg-transparent border-b border-dashed border-gray-300 focus:border-trade-primary outline-none w-full mb-1"
                                 />
                                 <p className="text-sm text-gray-500 mb-2">Registration No: GH-2023-88291 • Tax ID: C00088219</p>
                                 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">KYB Verified</span>
                             </div>
                         </div>
                     </div>

                     <div>
                         <h3 className="font-bold text-trade-primary dark:text-white mb-4">Team & Permissions</h3>
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
                                         <td className="p-4 font-medium text-trade-primary dark:text-white">{personalInfo.name || 'You'} (You)</td>
                                         <td className="p-4">Admin</td>
                                         <td className="p-4 text-gray-500">Full Access</td>
                                         <td className="p-4 text-right text-gray-400">Owner</td>
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
                             <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-2">Security Settings</h2>
                             <p className="text-sm text-gray-500 mb-6">Manage how you access your account.</p>
                             
                             <div className="space-y-4">
                                 <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                     <div>
                                         <p className="font-bold text-trade-primary dark:text-white">Two-Factor Authentication</p>
                                         <p className="text-xs text-gray-500">Secure your account with SMS or Authenticator.</p>
                                     </div>
                                     <button onClick={() => toggle('twoFactor')} className={`w-12 h-6 rounded-full p-1 transition-colors ${toggles.twoFactor ? 'bg-green-500' : 'bg-gray-300'}`}>
                                         <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${toggles.twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
                                     </button>
                                 </div>
                                 <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                     <div>
                                         <p className="font-bold text-trade-primary dark:text-white">Password</p>
                                         <p className="text-xs text-gray-500">Last changed 3 months ago.</p>
                                     </div>
                                     <button
                                       onClick={() => setShowPasswordModal(true)}
                                       className="text-sm text-blue-600 hover:underline font-bold"
                                     >
                                       Update
                                     </button>
                                 </div>

                                 {/* SSO Settings */}
                                 <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                     <div className="flex items-center justify-between mb-3">
                                         <div>
                                             <p className="font-bold text-trade-primary dark:text-white">Single Sign-On (SSO)</p>
                                             <p className="text-xs text-gray-500">Link institutional identity providers.</p>
                                         </div>
                                     </div>
                                     <div className="space-y-2">
                                         <button
                                           onClick={() => handleSSOConnect('google')}
                                           className="w-full flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                         >
                                             <div className="flex items-center gap-2">
                                                 <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 text-xs font-bold text-slate-800">G</div>
                                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Workspace</span>
                                             </div>
                                             <span className="text-xs text-blue-600 font-bold">Link</span>
                                         </button>
                                         <button
                                           onClick={() => handleSSOConnect('microsoft')}
                                           className="w-full flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                         >
                                             <div className="flex items-center gap-2">
                                                 <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">M</div>
                                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Microsoft Entra ID</span>
                                             </div>
                                             <span className="text-xs text-blue-600 font-bold">Link</span>
                                         </button>
                                         <button
                                           onClick={() => handleSSOConnect('saml')}
                                           className="w-full flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                         >
                                             <div className="flex items-center gap-2">
                                                 <div className="w-6 h-6 rounded-full bg-trade-primary flex items-center justify-center text-white text-xs font-bold"><Key className="w-3 h-3" /></div>
                                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SAML / OIDC Custom</span>
                                             </div>
                                             <span className="text-xs text-blue-600 font-bold">Configure</span>
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <div>
                             <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-2">Compliance Center</h2>
                             <p className="text-sm text-gray-500 mb-6">Status of your regulatory requirements.</p>

                             <div className="space-y-3">
                                 {stats.kycVerified ? (
                                   <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-800">
                                       <CheckCircle className="w-5 h-5 text-green-600" />
                                       <div className="flex-1">
                                           <p className="text-sm font-bold text-green-800 dark:text-green-300">KYC Verification</p>
                                           <p className="text-xs text-green-700 dark:text-green-400">Identity confirmed.</p>
                                       </div>
                                   </div>
                                 ) : (
                                   <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center gap-3 border border-amber-100 dark:border-amber-800">
                                       <AlertTriangle className="w-5 h-5 text-amber-600" />
                                       <div className="flex-1">
                                           <p className="text-sm font-bold text-amber-800 dark:text-amber-300">KYC Verification</p>
                                           <p className="text-xs text-amber-700 dark:text-amber-400">Identity verification pending.</p>
                                       </div>
                                       <button
                                         onClick={handleKYCVerify}
                                         disabled={kycVerifying}
                                         className="text-xs bg-white text-amber-700 px-2 py-1 rounded shadow-sm border border-amber-200 hover:bg-amber-50 transition-colors flex items-center gap-1"
                                       >
                                         {kycVerifying ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                         Verify
                                       </button>
                                   </div>
                                 )}
                                 {stats.kybVerified ? (
                                   <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-800">
                                       <CheckCircle className="w-5 h-5 text-green-600" />
                                       <div className="flex-1">
                                           <p className="text-sm font-bold text-green-800 dark:text-green-300">KYB Verification</p>
                                           <p className="text-xs text-green-700 dark:text-green-400">Business registration verified.</p>
                                       </div>
                                   </div>
                                 ) : (
                                   <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center gap-3 border border-amber-100 dark:border-amber-800">
                                       <AlertTriangle className="w-5 h-5 text-amber-600" />
                                       <div className="flex-1">
                                           <p className="text-sm font-bold text-amber-800 dark:text-amber-300">KYB Verification</p>
                                           <p className="text-xs text-amber-700 dark:text-amber-400">Business verification pending.</p>
                                       </div>
                                       <button
                                         onClick={() => { setUploadType('kyb'); setShowUploadModal(true); }}
                                         className="text-xs bg-white text-amber-700 px-2 py-1 rounded shadow-sm border border-amber-200 hover:bg-amber-50 transition-colors"
                                       >
                                         Verify
                                       </button>
                                   </div>
                                 )}
                                 <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg flex items-center gap-3 border border-gray-200 dark:border-slate-700">
                                     <FileText className="w-5 h-5 text-gray-400" />
                                     <div className="flex-1">
                                         <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Tax Clearance</p>
                                         <p className="text-xs text-gray-500 dark:text-gray-400">Upload tax clearance certificate.</p>
                                     </div>
                                     <button
                                       onClick={() => { setUploadType('tax'); setShowUploadModal(true); }}
                                       className="text-xs bg-white dark:bg-slate-800 text-gray-600 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-slate-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
                                     >
                                       <Upload className="w-3 h-3" /> Upload
                                     </button>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* --- AI & DATA --- */}
             {activeTab === 'ai' && (
                 <div className="space-y-8 animate-fade-in">
                     <div>
                         <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-2">AI & Data Control</h2>
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
                                 <p className="font-bold text-trade-primary dark:text-white">Ecosystem Data Sharing</p>
                                 <p className="text-xs text-gray-500 max-w-md">Allow anonymized trade flow data to contribute to the Market Intelligence demand heatmap. Helps improve regional forecasting.</p>
                             </div>
                             <button onClick={() => toggle('aiDataShare')} className={`w-12 h-6 rounded-full p-1 transition-colors ${toggles.aiDataShare ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                 <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${toggles.aiDataShare ? 'translate-x-6' : 'translate-x-0'}`} />
                             </button>
                         </div>

                         <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                             <div>
                                 <p className="font-bold text-trade-primary dark:text-white">AI Explainability Mode</p>
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
                         <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-2">Audit Logs</h2>
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

             {/* --- INTEGRATIONS --- */}
             {activeTab === 'integrations' && (
                 <div className="space-y-8 animate-fade-in">
                     <div>
                         <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-2">Integration Management</h2>
                         <p className="text-sm text-gray-500">Connect your import operations with external systems and services.</p>
                     </div>

                     <div className="space-y-4">
                       {[
                         { name: 'Customs Single Window', description: 'Auto-submit import declarations to national customs systems', status: 'connected', icon: '🏛️' },
                         { name: 'ERP System (SAP/Oracle)', description: 'Sync purchase orders, invoices, and inventory with your ERP', status: 'available', icon: '📊' },
                         { name: 'Logistics Providers API', description: 'Real-time shipment tracking from Maersk, DHL, and Bolloré', status: 'connected', icon: '🚢' },
                         { name: 'Banking & Payments', description: 'Connect bank accounts for L/C issuance and payment processing', status: 'available', icon: '🏦' },
                         { name: 'Warehouse Management', description: 'Sync incoming inventory with your warehouse system', status: 'available', icon: '📦' },
                         { name: 'AfCFTA Trade Portal', description: 'Direct certificate of origin verification and tariff lookups', status: 'connected', icon: '🌍' },
                       ].map(integration => (
                         <div key={integration.name} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                               {integration.icon}
                             </div>
                             <div>
                               <h4 className="font-bold text-gray-900 dark:text-white">{integration.name}</h4>
                               <p className="text-xs text-gray-500">{integration.description}</p>
                             </div>
                           </div>
                           {integration.status === 'connected' ? (
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center gap-1">
                                 <CheckCircle className="w-3 h-3" /> Connected
                               </span>
                               <button className="text-xs text-gray-500 hover:text-red-500 font-medium">Disconnect</button>
                             </div>
                           ) : (
                             <button className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">
                               Connect
                             </button>
                           )}
                         </div>
                       ))}
                     </div>

                     <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-xl p-5">
                       <div className="flex items-start gap-3">
                         <Zap className="w-5 h-5 text-indigo-600 mt-0.5" />
                         <div>
                           <h4 className="font-bold text-indigo-800 dark:text-indigo-300">API Access</h4>
                           <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">Build custom integrations with the AfriTradeOS API. Available on Pro and Enterprise plans.</p>
                           <button className="mt-2 text-xs font-bold text-indigo-600 hover:underline">View API Documentation →</button>
                         </div>
                       </div>
                     </div>
                 </div>
             )}

             {/* --- BILLING --- */}
             {activeTab === 'billing' && (
                 <div className="space-y-8 animate-fade-in">
                      <div>
                         <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-2">Billing & Subscription</h2>
                         <p className="text-sm text-gray-500">Manage your plan and payment methods.</p>
                     </div>

                     {/* Current Plan */}
                     <div className="bg-gradient-to-r from-trade-primary to-trade-secondary text-white p-6 rounded-xl">
                         <div className="flex justify-between items-start">
                           <div>
                               <p className="text-sm text-blue-200 uppercase font-bold tracking-wider mb-1">Current Plan</p>
                               <h3 className="text-3xl font-bold font-heading">Starter</h3>
                               <p className="text-sm opacity-80 mt-1">Free plan - No billing</p>
                           </div>
                           <div className="text-right">
                               <p className="text-2xl font-bold">$0<span className="text-sm font-normal">/mo</span></p>
                               <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-200 text-xs font-bold rounded-full">Active</span>
                           </div>
                         </div>
                     </div>

                     {/* Available Plans */}
                     <div>
                         <h4 className="font-bold text-trade-primary dark:text-white mb-4">Available Plans</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {/* Starter */}
                           <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-gray-50 dark:bg-slate-800/50">
                             <h5 className="font-bold text-lg text-trade-primary dark:text-white">Starter</h5>
                             <p className="text-2xl font-bold mt-2">$0<span className="text-sm font-normal text-gray-500">/mo</span></p>
                             <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Basic trade tracking</li>
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Up to 5 trades/month</li>
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Email support</li>
                             </ul>
                             <button disabled className="mt-4 w-full py-2 bg-gray-200 dark:bg-slate-700 text-gray-500 rounded-lg text-sm font-bold cursor-not-allowed">
                               Current Plan
                             </button>
                           </div>
                           
                           {/* Pro */}
                           <div className="border-2 border-trade-accent rounded-xl p-5 bg-white dark:bg-slate-800 relative">
                             <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-trade-accent text-white text-xs font-bold rounded-full">Recommended</span>
                             <h5 className="font-bold text-lg text-trade-primary dark:text-white">Pro Exporter</h5>
                             <p className="text-2xl font-bold mt-2">$49<span className="text-sm font-normal text-gray-500">/mo</span></p>
                             <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited trades</li>
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> AI market intelligence</li>
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Trade finance access</li>
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Priority support</li>
                             </ul>
                             <button 
                               onClick={() => alert('Stripe checkout coming soon! This will redirect to payment.')}
                               className="mt-4 w-full py-2 bg-trade-accent hover:bg-trade-accent/90 text-white rounded-lg text-sm font-bold transition-colors"
                             >
                               Upgrade to Pro
                             </button>
                           </div>
                           
                           {/* Enterprise */}
                           <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800">
                             <h5 className="font-bold text-lg text-trade-primary dark:text-white">Enterprise</h5>
                             <p className="text-2xl font-bold mt-2">$199<span className="text-sm font-normal text-gray-500">/mo</span></p>
                             <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Everything in Pro</li>
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Multi-user accounts</li>
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Custom integrations</li>
                               <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Dedicated manager</li>
                             </ul>
                             <button 
                               onClick={() => alert('Contact sales for Enterprise pricing.')}
                               className="mt-4 w-full py-2 bg-trade-primary hover:bg-trade-primary/90 text-white rounded-lg text-sm font-bold transition-colors"
                             >
                               Contact Sales
                             </button>
                           </div>
                         </div>
                     </div>

                     {/* Payment Method */}
                     <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                         <div className="flex items-center justify-between mb-4">
                           <h4 className="font-bold text-trade-primary dark:text-white">Payment Methods</h4>
                           <button 
                             onClick={() => alert('Stripe payment method setup coming soon!')}
                             className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                           >
                             <Plus className="w-4 h-4" /> Add Method
                           </button>
                         </div>
                         <div className="text-center py-8 text-gray-400">
                           <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                           <p className="text-sm">No payment methods added yet.</p>
                           <p className="text-xs mt-1">Add a card or PayPal to upgrade your plan.</p>
                         </div>
                     </div>

                     {/* Billing History */}
                     <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                         <h4 className="font-bold text-trade-primary dark:text-white mb-4">Billing History</h4>
                         <div className="text-center py-6 text-gray-400">
                           <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                           <p className="text-sm">No invoices yet.</p>
                         </div>
                     </div>
                 </div>
             )}

         </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-trade-primary dark:text-white">Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={!passwordData.current || !passwordData.new || !passwordData.confirm || isChangingPassword}
                className="w-full flex items-center justify-center gap-2 py-3 bg-trade-primary hover:bg-trade-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-trade-primary dark:text-white">
                  {uploadType === 'kyc' ? 'KYC Verification' : uploadType === 'kyb' ? 'Business Verification' : 'Tax Clearance'}
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {uploadType === 'kyc'
                    ? 'Please upload a government-issued ID (passport, national ID, or driver\'s license).'
                    : uploadType === 'kyb'
                    ? 'Please upload your business registration certificate or incorporation documents.'
                    : 'Please upload your tax clearance certificate from the relevant tax authority.'}
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-trade-primary hover:bg-trade-primary/5 transition-colors"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, or PNG (max 10MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />

              <p className="text-xs text-gray-500 text-center">
                Your documents will be reviewed within 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
