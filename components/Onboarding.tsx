import React, { useState } from 'react';
import { UserPersona } from '../types';
import { 
  ArrowRight, 
  Briefcase, 
  Building2, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  CheckCircle,
  Loader2,
  Lock,
  Landmark,
  User,
  Mail,
  Phone,
  Key
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (role: UserPersona, profile: any) => void;
}

const AFRICAN_COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", 
  "Cameroon", "Central African Republic", "Chad", "Comoros", "DR Congo", "Republic of Congo", 
  "Cote d'Ivoire", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", 
  "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", 
  "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", 
  "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", 
  "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", 
  "Tunisia", "Uganda", "Zambia", "Zimbabwe"
];

type AuthView = 'LOGIN' | 'SIGNUP' | 'ROLE_SELECT' | 'PROFILE_SETUP';

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserPersona | null>(null);
  const [loading, setLoading] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Profile State
  const [profile, setProfile] = useState({
    country: 'Ghana',
    companyName: '',
    userName: '',
    email: '',
    phone: '',
    products: 'Cocoa, Shea Butter',
    size: 'SME'
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate Login API
    setTimeout(() => {
        setLoading(false);
        // Existing user bypasses onboarding
        onComplete(UserPersona.EXPORTER_SME, {
            userName: 'Kofi Mensah',
            companyName: 'Golden Cocoa Ltd',
            email: loginEmail || 'kofi@example.com',
            country: 'Ghana',
            role: UserPersona.EXPORTER_SME,
            phone: '+233 54 123 4567'
        });
    }, 1500);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) return;
    
    setLoading(true);
    // Simulate Signup API
    setTimeout(() => {
        setLoading(false);
        setProfile(prev => ({ ...prev, userName: signupName, email: signupEmail }));
        setView('ROLE_SELECT');
    }, 1000);
  };

  const handleRoleSelect = (role: UserPersona) => {
      setSelectedRole(role);
  };

  const handleRoleNext = () => {
      if (selectedRole) setView('PROFILE_SETUP');
  };

  const handleFinalize = () => {
      if (!selectedRole) return;
      setLoading(true);
      // Simulate Profile Update API
      setTimeout(() => {
          setLoading(false);
          onComplete(selectedRole, profile);
      }, 1500);
  };

  const roles = [
      { id: UserPersona.EXPORTER_SME, icon: Briefcase, label: 'Exporter / Importer', desc: 'Trade goods across borders' },
      { id: UserPersona.LOGISTICS, icon: Truck, label: 'Logistics Provider', desc: 'Move cargo & manage fleets' },
      { id: UserPersona.BANK, icon: Landmark, label: 'Bank / Insurer', desc: 'Finance & risk management' },
      { id: UserPersona.CUSTOMS, icon: ShieldCheck, label: 'Customs / Gov', desc: 'Regulatory oversight' },
      { id: UserPersona.ANALYST, icon: TrendingUp, label: 'Trade Analyst', desc: 'Market data & insights' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-trade-bg dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500 font-sans">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-trade-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-trade-accent/10 rounded-full blur-3xl" />

        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 min-h-[550px] flex">
            
            {/* Left Panel: Visual & Messaging */}
            <div className="hidden md:flex w-5/12 bg-trade-primary relative p-8 flex-col justify-between text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-trade-primary/95 to-trade-secondary/95 z-10" />
                <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" alt="Trade" />
                
                <div className="relative z-20">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-tr from-trade-secondary to-trade-primary border border-trade-accent rounded-lg flex items-center justify-center font-bold font-heading text-white text-lg shadow-lg">A</div>
                        <span className="text-xl font-bold font-heading tracking-tight">AfriTradeOS</span>
                    </div>
                    <h1 className="text-3xl font-bold font-heading leading-tight mb-3">
                        {view === 'LOGIN' ? 'Welcome Back.' : 'Join the Network.'}
                    </h1>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {view === 'LOGIN' 
                            ? 'Securely access your trade dashboard, monitor live shipments, and manage compliance from one unified operating system.'
                            : 'Powering the AfCFTA with AI-driven compliance, logistics, and market intelligence. Start your journey today.'
                        }
                    </p>
                </div>

                <div className="relative z-20 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-gray-200">
                        <CheckCircle className="w-4 h-4 text-trade-accent" /> 
                        <span>Instant Rules of Origin Compliance</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-200">
                        <CheckCircle className="w-4 h-4 text-trade-accent" /> 
                        <span>Verified Partner Network</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-200">
                        <CheckCircle className="w-4 h-4 text-trade-accent" /> 
                        <span>Access to Trade Finance</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Interactive Flow */}
            <div className="w-full md:w-7/12 p-8 flex flex-col justify-center relative bg-white dark:bg-slate-900 transition-all">
                
                {/* 1. LOGIN VIEW */}
                {view === 'LOGIN' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fade-in max-w-sm mx-auto w-full">
                        <div>
                            <h2 className="text-2xl font-bold font-heading text-trade-primary dark:text-white mb-1">Sign In</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Access your AfriTradeOS account.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-trade-primary dark:text-gray-400 uppercase mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-2 focus:ring-trade-primary/10 focus:border-trade-primary transition-all"
                                        placeholder="name@company.com"
                                        value={loginEmail}
                                        onChange={e => setLoginEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-trade-primary dark:text-gray-400 uppercase mb-1.5 flex justify-between">
                                    Password
                                    <a href="#" className="text-trade-secondary dark:text-blue-400 hover:underline normal-case font-medium">Forgot?</a>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="password" 
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-2 focus:ring-trade-primary/10 focus:border-trade-primary transition-all"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={e => setLoginPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-trade-primary hover:bg-trade-secondary text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-trade-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-slate-800"></div></div>
                            <div className="relative flex justify-center text-xs"><span className="px-2 bg-white dark:bg-slate-900 text-gray-400">Or continue with</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                                <Globe className="w-4 h-4 text-trade-primary dark:text-white" />
                                <span className="text-xs font-bold text-trade-primary dark:text-white">Google</span>
                            </button>
                            <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                                <Lock className="w-4 h-4 text-trade-accent" />
                                <span className="text-xs font-bold text-trade-primary dark:text-white">SSO</span>
                            </button>
                        </div>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Don't have an account? <button type="button" onClick={() => setView('SIGNUP')} className="text-trade-primary dark:text-white font-bold hover:underline">Sign up</button>
                        </p>
                    </form>
                )}

                {/* 2. SIGN UP VIEW */}
                {view === 'SIGNUP' && (
                    <form onSubmit={handleSignupSubmit} className="space-y-6 animate-fade-in max-w-sm mx-auto w-full">
                        <div>
                            <h2 className="text-2xl font-bold font-heading text-trade-primary dark:text-white mb-1">Create Account</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Start your AfCFTA journey today.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-trade-primary dark:text-gray-400 uppercase mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-2 focus:ring-trade-primary/10 focus:border-trade-primary transition-all"
                                        placeholder="Kofi Mensah"
                                        value={signupName}
                                        onChange={e => setSignupName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-trade-primary dark:text-gray-400 uppercase mb-1.5">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-2 focus:ring-trade-primary/10 focus:border-trade-primary transition-all"
                                        placeholder="name@company.com"
                                        value={signupEmail}
                                        onChange={e => setSignupEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-trade-primary dark:text-gray-400 uppercase mb-1.5">Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="password" 
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-2 focus:ring-trade-primary/10 focus:border-trade-primary transition-all"
                                        placeholder="Create a strong password"
                                        value={signupPassword}
                                        onChange={e => setSignupPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-trade-primary hover:bg-trade-secondary text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-trade-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                        </button>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Already have an account? <button type="button" onClick={() => setView('LOGIN')} className="text-trade-primary dark:text-white font-bold hover:underline">Sign in</button>
                        </p>
                    </form>
                )}

                {/* 3. ROLE SELECTION (Onboarding Step 1) */}
                {view === 'ROLE_SELECT' && (
                    <div className="space-y-6 animate-fade-in max-w-sm mx-auto w-full">
                        <div>
                             <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-1">Select Account Type</h2>
                             <p className="text-gray-500 dark:text-gray-400 text-xs">Your role determines tools, permissions, and insights.</p>
                        </div>

                        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                            {roles.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => handleRoleSelect(r.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                        selectedRole === r.id 
                                        ? 'border-trade-accent bg-trade-accent/5 ring-1 ring-trade-accent' 
                                        : 'border-gray-200 dark:border-slate-700 hover:border-trade-secondary/50 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <div className={`p-2 rounded-md ${selectedRole === r.id ? 'bg-trade-accent text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}>
                                        <r.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className={`text-sm font-bold ${selectedRole === r.id ? 'text-trade-primary dark:text-trade-accent' : 'text-trade-primary dark:text-white'}`}>{r.label}</h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{r.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleRoleNext}
                            disabled={!selectedRole}
                            className="w-full py-3 bg-trade-primary hover:bg-trade-secondary text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* 4. PROFILE SETUP (Onboarding Step 2) */}
                {view === 'PROFILE_SETUP' && (
                     <div className="space-y-5 animate-fade-in max-w-sm mx-auto w-full">
                         <div>
                             <h2 className="text-xl font-bold font-heading text-trade-primary dark:text-white mb-1">Organization Profile</h2>
                             <p className="text-gray-500 dark:text-gray-400 text-xs">Tell us about your business to optimize the OS.</p>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-trade-primary dark:text-gray-400 uppercase mb-1">Your Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-1 focus:ring-trade-accent/50"
                                        value={profile.userName}
                                        onChange={(e) => setProfile({...profile, userName: e.target.value})}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-trade-primary dark:text-gray-400 uppercase mb-1">Company</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-1 focus:ring-trade-accent/50"
                                        value={profile.companyName}
                                        onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                                        placeholder="Trading Co. Ltd"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-trade-primary dark:text-gray-400 uppercase mb-1">Country of Operation</label>
                                <select 
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-1 focus:ring-trade-accent/50"
                                    value={profile.country}
                                    onChange={(e) => setProfile({...profile, country: e.target.value})}
                                >
                                    {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-trade-primary dark:text-gray-400 uppercase mb-1">Phone</label>
                                    <input 
                                        type="tel" 
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-1 focus:ring-trade-accent/50"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                        placeholder="+233..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-trade-primary dark:text-gray-400 uppercase mb-1">Size</label>
                                    <select 
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-1 focus:ring-trade-accent/50"
                                        value={profile.size}
                                        onChange={(e) => setProfile({...profile, size: e.target.value})}
                                    >
                                        <option>Sole Proprietor</option>
                                        <option>SME</option>
                                        <option>Enterprise</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleFinalize}
                            disabled={loading}
                            className="w-full py-3 bg-trade-primary hover:bg-trade-secondary text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-trade-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Launch Dashboard'}
                        </button>
                     </div>
                )}
                
                {/* Global Loading Overlay (if needed) */}
                {loading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-50">
                        <Loader2 className="w-10 h-10 text-trade-primary animate-spin" />
                    </div>
                )}
            </div>
        </div>

        {/* CSS for custom animations */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 4px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #475569;
          }
        `}</style>
    </div>
  );
};