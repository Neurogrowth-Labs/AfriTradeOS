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
  User
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (role: UserPersona, profile: any) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserPersona | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    country: 'Ghana',
    partners: 'Kenya, Nigeria',
    products: 'Cocoa, Shea Butter',
    size: 'SME'
  });

  const handleLogin = (method: string) => {
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
        setLoading(false);
        setStep(1);
    }, 800);
  };

  const handleRoleSelect = (role: UserPersona) => {
      setSelectedRole(role);
  };

  const handleNextStep = () => {
      if (step === 1 && selectedRole) setStep(2);
  };

  const handleFinalize = () => {
      if (!selectedRole) return;
      setLoading(true);
      // Simulate profile creation
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

        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 min-h-[600px] flex">
            
            {/* Left Panel: Visual & Messaging */}
            <div className="hidden md:flex w-1/2 bg-trade-primary relative p-10 flex-col justify-between text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-trade-primary/95 to-trade-secondary/95 z-10" />
                <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" alt="Trade" />
                
                <div className="relative z-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-tr from-trade-secondary to-trade-primary border border-trade-accent rounded-xl flex items-center justify-center font-bold font-heading text-white text-2xl shadow-lg">A</div>
                        <span className="text-2xl font-bold font-heading tracking-tight">AfriTradeOS</span>
                    </div>
                    <h1 className="text-4xl font-bold font-heading leading-tight mb-4">
                        Africa’s Unified Digital Trade Infrastructure.
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Powering the AfCFTA with AI-driven compliance, logistics, and market intelligence.
                    </p>
                </div>

                <div className="relative z-20 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-200">
                        <CheckCircle className="w-5 h-5 text-trade-accent" /> 
                        <span>Instant Rules of Origin Compliance</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-200">
                        <CheckCircle className="w-5 h-5 text-trade-accent" /> 
                        <span>Verified Partner Network</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-200">
                        <CheckCircle className="w-5 h-5 text-trade-accent" /> 
                        <span>Access to Trade Finance</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Interactive Flow */}
            <div className="w-full md:w-1/2 p-10 flex flex-col justify-center relative bg-trade-surface">
                
                {/* Step 0: Welcome / Login */}
                {step === 0 && (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h2 className="text-3xl font-bold font-heading text-trade-primary dark:text-white mb-2">Welcome Back</h2>
                            <p className="text-gray-500 dark:text-gray-400">Sign in to access your trade dashboard.</p>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={() => handleLogin('email')}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-medium text-gray-700 dark:text-gray-200"
                            >
                                <User className="w-5 h-5" />
                                Continue with Email
                            </button>
                            <button 
                                onClick={() => handleLogin('google')}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-medium text-gray-700 dark:text-gray-200"
                            >
                                <Globe className="w-5 h-5 text-trade-secondary" />
                                Continue with Google
                            </button>
                            <button 
                                onClick={() => handleLogin('sso')}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-medium text-gray-700 dark:text-gray-200"
                            >
                                <Lock className="w-5 h-5 text-trade-accent" />
                                Government SSO
                            </button>
                        </div>

                        <div className="text-center text-xs text-gray-400">
                            By continuing, you agree to the AfCFTA Digital Trade Protocols.
                        </div>
                    </div>
                )}

                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                             <h2 className="text-2xl font-bold font-heading text-trade-primary dark:text-white mb-2">Select Account Type</h2>
                             <p className="text-gray-500 dark:text-gray-400 text-sm">Your role determines tools, permissions, and insights.</p>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {roles.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => handleRoleSelect(r.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                                        selectedRole === r.id 
                                        ? 'border-trade-accent bg-trade-accent/5 ring-1 ring-trade-accent' 
                                        : 'border-gray-200 dark:border-slate-700 hover:border-trade-secondary/50 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <div className={`p-3 rounded-lg ${selectedRole === r.id ? 'bg-trade-accent text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}>
                                        <r.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${selectedRole === r.id ? 'text-trade-primary dark:text-trade-accent' : 'text-gray-900 dark:text-white'}`}>{r.label}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleNextStep}
                            disabled={!selectedRole}
                            className="w-full py-4 bg-trade-primary hover:bg-trade-secondary text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Continue <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Step 2: Trade Profile */}
                {step === 2 && (
                     <div className="space-y-6 animate-fade-in">
                         <div>
                             <h2 className="text-2xl font-bold font-heading text-trade-primary dark:text-white mb-2">Complete Profile</h2>
                             <p className="text-gray-500 dark:text-gray-400 text-sm">Customize your trade operating system.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country of Operation</label>
                                <select 
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-trade-accent/50"
                                    value={profile.country}
                                    onChange={(e) => setProfile({...profile, country: e.target.value})}
                                >
                                    <option>Ghana</option>
                                    <option>Nigeria</option>
                                    <option>Kenya</option>
                                    <option>South Africa</option>
                                    <option>Egypt</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Products (HS Code Assisted)</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-trade-accent/50"
                                    value={profile.products}
                                    onChange={(e) => setProfile({...profile, products: e.target.value})}
                                    placeholder="e.g. Cocoa, Textiles, Machinery"
                                />
                                <div className="mt-1 flex items-center gap-1 text-xs text-trade-secondary dark:text-blue-400">
                                    <Sparkles className="w-3 h-3 text-trade-accent" />
                                    <span>AI suggests: HS 1806.32 (Cocoa Paste)</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Size</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setProfile({...profile, size: 'SME'})}
                                        className={`p-3 rounded-xl border text-center text-sm font-bold transition-all ${
                                            profile.size === 'SME' 
                                            ? 'bg-trade-accent/10 border-trade-accent text-trade-primary dark:text-trade-accent' 
                                            : 'border-gray-200 dark:border-slate-700 text-gray-500'
                                        }`}
                                    >
                                        SME
                                    </button>
                                    <button 
                                        onClick={() => setProfile({...profile, size: 'Enterprise'})}
                                        className={`p-3 rounded-xl border text-center text-sm font-bold transition-all ${
                                            profile.size === 'Enterprise' 
                                            ? 'bg-trade-accent/10 border-trade-accent text-trade-primary dark:text-trade-accent' 
                                            : 'border-gray-200 dark:border-slate-700 text-gray-500'
                                        }`}
                                    >
                                        Enterprise
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleFinalize}
                            disabled={loading}
                            className="w-full py-4 bg-trade-primary hover:bg-trade-secondary text-white rounded-xl font-bold transition-all shadow-lg shadow-trade-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Dashboard'}
                        </button>
                     </div>
                )}
                
                {loading && step === 0 && (
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

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}