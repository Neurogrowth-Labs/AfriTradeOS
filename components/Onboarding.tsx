
import React, { useState, useEffect } from 'react';
import { UserPersona } from '../types';
import { supabase } from '../services/supabase';
import {
  ArrowRight,
  Briefcase,
  Truck,
  ShieldCheck,
  TrendingUp,
  CheckCircle,
  Loader2,
  Lock,
  Landmark,
  User,
  Mail,
  Key,
  AlertCircle,
  ArrowLeft,
  Inbox,
  Eye,
  EyeOff
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

type AuthView = 'LOGIN' | 'SIGNUP' | 'ROLE_SELECT' | 'PROFILE_SETUP' | 'FORGOT_PASSWORD' | 'EMAIL_VERIFICATION';

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserPersona | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

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

  // Check if session already exists (e.g. from SQL Trigger creating a skeleton user)
  useEffect(() => {
    const checkExistingSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && (view === 'LOGIN' || view === 'SIGNUP')) {
            // User is authenticated but incomplete (App.tsx passed them here)
            // Skip auth screens
            setProfile(prev => ({
                ...prev,
                email: session.user.email || '',
                userName: session.user.user_metadata?.full_name || ''
            }));
            setView('ROLE_SELECT');
        }
    };
    checkExistingSession();
  }, []);

  // Password Strength Calculator
  useEffect(() => {
    if (!signupPassword) {
      setPasswordStrength(0);
      return;
    }
    let score = 0;
    if (signupPassword.length > 5) score += 1;
    if (signupPassword.length > 8) score += 1;
    if (/[0-9]/.test(signupPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(signupPassword)) score += 1;
    setPasswordStrength(score);
  }, [signupPassword]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to login with Google");
      setLoading(false);
    }
  };


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
          if (error.message.includes("Invalid login credentials")) {
              throw new Error("Incorrect email or password. Please try again.");
          }
          throw error;
      }

      // Extract profile from metadata
      const meta = data.user?.user_metadata || {};
      
      onComplete(meta.role || UserPersona.EXPORTER_SME, {
          userName: meta.full_name || 'User',
          companyName: meta.companyName || 'My Company',
          email: data.user?.email || loginEmail,
          country: meta.country || 'Ghana',
          role: meta.role || UserPersona.EXPORTER_SME,
          phone: meta.phone || ''
      });

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Enhanced Validation
    if (!signupName || !signupEmail || !signupPassword) {
        setErrorMsg("Please fill in all fields.");
        return;
    }
    if (signupPassword !== signupConfirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
    }
    if (passwordStrength < 2) {
        setErrorMsg("Password is too weak. Please use a stronger password.");
        return;
    }
    if (!termsAccepted) {
        setErrorMsg("You must accept the Terms of Service to continue.");
        return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      });

      console.log(signupEmail);
      console.log(signupPassword);
      console.log(error);

      if (error) {
        // If Supabase signup fails, use simulation mode
        console.warn('Supabase signup failed, using simulation mode:', error.message);
        
        // Create mock user data
        const mockUser = {
          id: `mock_user_${Date.now()}`,
          email: signupEmail,
          user_metadata: { full_name: signupName }
        };
        
        // Prepare profile and proceed to role selection
        setProfile(prev => ({ ...prev, userName: signupName, email: signupEmail }));
        setView('ROLE_SELECT');
        setLoading(false);
        return;
      }

      // Profile will be created later in handleFinalize after role selection
      // Prepare profile data
      setProfile(prev => ({ ...prev, userName: signupName, email: signupEmail }));

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setView('EMAIL_VERIFICATION');
      } else if (data.session) {
        // Auto-confirmed, proceed to role selection
        setView('ROLE_SELECT');
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    
    setLoading(true);
    setErrorMsg(null);
    setForgotSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin, 
      });

      if (error) {
        console.error("Reset Password Error:", error);
        if (error.status === 429) {
             setErrorMsg("Too many requests. Please try again in a few minutes.");
             setLoading(false);
             return;
        }
        throw error;
      }
      
      setForgotSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: UserPersona) => {
      setSelectedRole(role);
  };

  const handleRoleNext = () => {
      if (selectedRole) setView('PROFILE_SETUP');
  };

  const handleFinalize = async () => {
      if (!selectedRole) return;
      setLoading(true);
      setErrorMsg(null);
      
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        // --- SIMULATION CHECK ---
        // If there is no real Supabase session, create a mock profile
        if (!userData.user) {
            await new Promise(resolve => setTimeout(resolve, 800));
            onComplete(selectedRole, {
                ...profile,
                id: `mock_user_${Date.now()}`, // Identifiable mock ID
                role: selectedRole,
                email: profile.email || 'simulation@afritrade.os',
                isSimulated: true
            });
            return;
        }

        // Real Session Sync
        // Using UPSERT to ensure row exists even if the initial trigger failed silently
        const { error: dbError } = await supabase
            .from('profiles')
            .upsert({
                id: userData.user.id,
                email: userData.user.email,
                full_name: profile.userName, 
                role: selectedRole,
                company_name: profile.companyName,
                country: profile.country,
                phone: profile.phone,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (dbError) {
            console.error("DB Profile Sync Failed:", dbError);
            // Continue anyway - profile sync is not critical for login
        }

        onComplete(selectedRole, {
            ...profile,
            id: userData.user.id,
            role: selectedRole
        });
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Failed to update profile");
      } finally {
        setLoading(false);
      }
  };

  const roles = [
      { id: UserPersona.EXPORTER_SME, icon: Briefcase, label: 'Exporter / Importer', desc: 'Trade goods across borders' },
      { id: UserPersona.LOGISTICS, icon: Truck, label: 'Logistics Provider', desc: 'Move cargo & manage fleets' },
      { id: UserPersona.BANK, icon: Landmark, label: 'Bank / Insurer', desc: 'Finance & risk management' },
      { id: UserPersona.CUSTOMS, icon: ShieldCheck, label: 'Customs / Gov', desc: 'Regulatory oversight' },
      { id: UserPersona.ANALYST, icon: TrendingUp, label: 'Trade Analyst', desc: 'Market data & insights' },
  ];

  const getStrengthColor = (score: number) => {
      if (score === 0) return 'bg-gray-200 dark:bg-gray-700';
      if (score < 2) return 'bg-red-500';
      if (score < 4) return 'bg-yellow-500';
      return 'bg-green-500';
  };

  const getStrengthLabel = (score: number) => {
      if (score === 0) return '';
      if (score < 2) return 'Weak';
      if (score < 4) return 'Medium';
      return 'Strong';
  };

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
                        {view === 'LOGIN' ? 'Welcome Back.' : 
                         view === 'FORGOT_PASSWORD' ? 'Secure Reset.' : 
                         view === 'EMAIL_VERIFICATION' ? 'Verify Email.' :
                         view === 'SIGNUP' ? 'Simulation Mode.' :
                         'Setup Profile.'}
                    </h1>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {view === 'LOGIN' || view === 'FORGOT_PASSWORD'
                            ? 'Securely access your trade dashboard, monitor live shipments, and manage compliance from one unified operating system.'
                            : view === 'EMAIL_VERIFICATION' 
                            ? 'We’ve sent a welcome email to your registered address. Please verify your account to continue.'
                            : 'Experience the power of AfriTradeOS with our instant simulation mode. No backend required.'
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
                
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> <span className="flex-1">{errorMsg}</span>
                    </div>
                )}

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
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-trade-primary transition-colors" />
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
                                    <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-trade-secondary dark:text-blue-400 hover:underline normal-case font-medium">Forgot?</button>
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-trade-primary transition-colors" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-2 focus:ring-trade-primary/10 focus:border-trade-primary transition-all"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={e => setLoginPassword(e.target.value)}
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
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

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-xs font-bold text-trade-primary dark:text-white">Continue with Google</span>
                        </button>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Don't have an account? <button type="button" onClick={() => setView('SIGNUP')} className="text-trade-primary dark:text-white font-bold hover:underline">Sign up</button>
                        </p>
                    </form>
                )}

                {/* 2. FORGOT PASSWORD VIEW */}
                {view === 'FORGOT_PASSWORD' && (
                    <div className="space-y-6 animate-fade-in max-w-sm mx-auto w-full">
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => setView('LOGIN')}
                                className="group flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-trade-primary dark:hover:text-white transition-colors"
                            >
                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-slate-700 flex items-center justify-center transition-colors">
                                    <ArrowLeft className="w-3 h-3" />
                                </div>
                                <span>Back to Login</span>
                            </button>
                        </div>

                        <div>
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800">
                                <ShieldCheck className="w-6 h-6 text-trade-primary dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold font-heading text-trade-primary dark:text-white mb-2">Forgot Password?</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                Enter the email address associated with your account and we'll send you a secure link to reset your password.
                            </p>
                        </div>

                        {forgotSuccess ? (
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center animate-fade-in">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                    <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-green-800 dark:text-green-300 font-bold mb-2">Check your email</h3>
                                <p className="text-sm text-green-700 dark:text-green-400 mb-6">
                                    If an account exists for <span className="font-bold block mt-1">{forgotEmail}</span>, you will receive a reset link shortly.
                                </p>
                                <button 
                                    type="button"
                                    onClick={() => setView('LOGIN')}
                                    className="w-full py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-trade-primary dark:text-gray-400 uppercase mb-1.5 ml-1">Work Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-trade-primary transition-colors" />
                                        <input 
                                            type="email" 
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-2 focus:ring-trade-primary/10 focus:border-trade-primary transition-all placeholder:text-gray-400"
                                            placeholder="name@company.com"
                                            value={forgotEmail}
                                            onChange={e => setForgotEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading || !forgotEmail}
                                    className="w-full py-3 bg-trade-primary hover:bg-trade-secondary text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-trade-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            Send Reset Link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* 3. EMAIL VERIFICATION VIEW */}
                {view === 'EMAIL_VERIFICATION' && (
                    <div className="space-y-6 animate-fade-in max-w-sm mx-auto w-full text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-800 shadow-sm relative">
                            <Inbox className="w-8 h-8 text-trade-primary dark:text-blue-400" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-trade-accent rounded-full flex items-center justify-center shadow-md animate-bounce">
                                <Mail className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-heading text-trade-primary dark:text-white mb-2">Check your inbox</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                We've sent a welcome email to <span className="font-bold text-trade-primary dark:text-white">{signupEmail}</span> with a verification link.
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                Please click the link in the email to activate your account and access the platform.
                            </p>
                        </div>
                        <div className="pt-4 space-y-3">
                            <button
                                onClick={() => setView('LOGIN')}
                                className="w-full py-3 bg-trade-primary hover:bg-trade-secondary text-white rounded-lg font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                Go to Sign In
                            </button>
                            <p className="text-xs text-gray-400 mt-2">
                                Didn't receive it? Check spam or <button className="text-trade-primary hover:underline" onClick={() => setView('SIGNUP')}>try another email</button>.
                            </p>
                        </div>
                    </div>
                )}

                {/* 4. SIGN UP VIEW (Enhanced) */}
                {view === 'SIGNUP' && (
                    <form onSubmit={handleSignupSubmit} className="space-y-6 animate-fade-in max-w-sm mx-auto w-full">
                        <div>
                            <h2 className="text-2xl font-bold font-heading text-trade-primary dark:text-white mb-1">Create Account</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Start your AfCFTA journey securely.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-trade-primary dark:text-gray-400 uppercase mb-1.5">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-trade-primary transition-colors" />
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
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-trade-primary transition-colors" />
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
                            
                            {/* Password Field */}
                            <div>
                                <label className="block text-xs font-bold text-trade-primary dark:text-gray-400 uppercase mb-1.5">Password</label>
                                <div className="relative group">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-trade-primary transition-colors" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-2 focus:ring-trade-primary/10 focus:border-trade-primary transition-all"
                                        placeholder="Create a strong password"
                                        value={signupPassword}
                                        onChange={e => setSignupPassword(e.target.value)}
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {/* Strength Meter */}
                                {signupPassword && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`} 
                                                style={{ width: `${(passwordStrength / 4) * 100}%` }} 
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500">{getStrengthLabel(passwordStrength)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-xs font-bold text-trade-primary dark:text-gray-400 uppercase mb-1.5">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-trade-primary transition-colors" />
                                    <input 
                                        type="password" 
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-trade-primary dark:text-white text-sm outline-none focus:ring-2 focus:ring-trade-primary/10 focus:border-trade-primary transition-all"
                                        placeholder="Repeat your password"
                                        value={signupConfirmPassword}
                                        onChange={e => setSignupConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-2 pt-2">
                                <div className="relative flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-trade-primary focus:ring-trade-primary/20"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                    />
                                </div>
                                <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                                    I agree to the <a href="#" className="text-trade-primary dark:text-white font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-trade-primary dark:text-white font-bold hover:underline">Privacy Policy</a>.
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || !termsAccepted || !signupName || !signupEmail || !signupPassword}
                            className="w-full py-3 bg-trade-primary hover:bg-trade-secondary text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-trade-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start with AfriTradeOS'}
                        </button>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Already have an account? <button type="button" onClick={() => setView('LOGIN')} className="text-trade-primary dark:text-white font-bold hover:underline">Sign in</button>
                        </p>
                    </form>
                )}

                {/* 5. ROLE SELECTION (Onboarding Step 1) */}
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

                {/* 6. PROFILE SETUP (Onboarding Step 2) */}
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
                
                {/* Global Loading Overlay */}
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
