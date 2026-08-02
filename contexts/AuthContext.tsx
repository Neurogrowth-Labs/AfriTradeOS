import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPersona } from '../types';
import { supabase } from '../services/supabase';
import { mockDatabase } from '../services/mockDatabase';
import { buildOnboardingProfileState, isOnboardingComplete } from '../services/onboardingService';

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  companyName?: string;
  country?: string;
  phone?: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
  [key: string]: any;
}

interface AuthContextValue {
  isAuthLoading: boolean;
  isOnboarded: boolean;
  userRole: UserPersona;
  userProfile: UserProfile | null;
  showPasswordReset: boolean;
  setShowPasswordReset: (v: boolean) => void;
  setUserRole: (role: UserPersona) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsOnboarded: (v: boolean) => void;
  handleLogout: () => Promise<void>;
  handleOnboardingComplete: (role: UserPersona, profile: any) => void;
  handleAuthProfileLoaded: (profile: any, role?: UserPersona) => void;
  isSimulatedRef: React.MutableRefObject<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Get default route for each role
export const getDefaultRouteForRole = (role: UserPersona): string => {
  switch (role) {
    case UserPersona.CUSTOMS:
      return '/customs';
    case UserPersona.LOGISTICS:
      return '/logistics-provider';
    case UserPersona.GOVERNMENT:
      return '/regulator';
    case UserPersona.ADMIN:
      return '/admin';
    case UserPersona.ANALYST:
      return '/dashboard';
    case UserPersona.BANK:
      return '/bank-dashboard';
    case UserPersona.IMPORTER:
      return '/importer';
    default:
      return '/dashboard';
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userRole, setUserRole] = useState<UserPersona>(UserPersona.EXPORTER_SME);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const isSimulatedRef = useRef(false);

  const fetchProfile = useCallback(async (session: any) => {
    try {
      const dbProfile = await mockDatabase.getUserProfile(session.user.id);
      const meta = session.user.user_metadata || {};

      if (dbProfile) {
        const role = dbProfile.role || UserPersona.EXPORTER_SME;
        const onboarding = buildOnboardingProfileState(dbProfile);
        if (dbProfile.role) setUserRole(role);
        setUserProfile({
          userName: dbProfile.full_name || meta.full_name || '',
          companyName: dbProfile.company_name || '',
          email: dbProfile.email || session.user.email,
          country: dbProfile.country || 'Ghana',
          phone: dbProfile.phone || meta.phone || '',
          id: dbProfile.id,
          onboardingCompleted: onboarding.onboardingCompleted,
          onboardingStep: onboarding.onboardingStep,
          ...meta,
        });
        setIsOnboarded(onboarding.onboardingCompleted);

        if (onboarding.onboardingCompleted) {
          const defaultRoute = getDefaultRouteForRole(role);
          if (location.pathname === '/' || location.pathname === '/dashboard') {
            navigate(defaultRoute);
          }
        } else if (location.pathname !== '/') {
          navigate('/');
        }
      } else {
        console.log("No completed onboarding profile found, redirecting to onboarding...");
        setUserRole(UserPersona.EXPORTER_SME);
        setUserProfile({
          userName: meta.full_name || '',
          email: session.user.email,
          id: session.user.id,
          onboardingCompleted: false,
          onboardingStep: 1,
        });
        setIsOnboarded(false);
        if (location.pathname !== '/') {
          navigate('/');
        }
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      const meta = session.user.user_metadata || {};
      setUserProfile({
        userName: meta.full_name || '',
        email: session.user.email,
        id: session.user.id,
        onboardingCompleted: false,
        onboardingStep: 1,
      });
      setIsOnboarded(false);
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  }, [location.pathname, navigate]);

  const handleAuthProfileLoaded = useCallback((profile: any, role?: UserPersona) => {
    if (role) setUserRole(role);
    setUserProfile(profile);
    const completed = isOnboardingComplete({
      role: role || userRole,
      full_name: profile?.userName,
      email: profile?.email,
      country: profile?.country,
      company_name: profile?.companyName,
      onboarding_completed: profile?.onboardingCompleted,
    });
    setIsOnboarded(completed);
    if (completed) {
      navigate(getDefaultRouteForRole(role || userRole));
    } else {
      navigate('/');
    }
  }, [navigate, userRole]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      isSimulatedRef.current = false;
      setIsOnboarded(false);
      setUserProfile(null);
      setUserRole(UserPersona.EXPORTER_SME);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const handleOnboardingComplete = useCallback((role: UserPersona, profile: any) => {
    if (profile.id && profile.id.startsWith('mock_')) {
      isSimulatedRef.current = true;
    }
    handleAuthProfileLoaded(
      { ...profile, onboardingCompleted: true, onboardingStep: 3 },
      role
    );
  }, [handleAuthProfileLoaded]);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true);
      }

      if (event === 'SIGNED_IN' && session) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('confirmed') === 'true') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        fetchProfile(session);
        return;
      }

      if (session) {
        fetchProfile(session);
      } else {
        if (isSimulatedRef.current) return;
        setIsOnboarded(false);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect unonboarded users
  useEffect(() => {
    if (!isAuthLoading && userProfile && !isOnboarded && location.pathname !== '/') {
      navigate('/');
    }
  }, [isAuthLoading, isOnboarded, location.pathname, navigate, userProfile]);

  const value: AuthContextValue = {
    isAuthLoading,
    isOnboarded,
    userRole,
    userProfile,
    showPasswordReset,
    setShowPasswordReset,
    setUserRole,
    setUserProfile: setUserProfile as (profile: UserProfile | null) => void,
    setIsOnboarded,
    handleLogout,
    handleOnboardingComplete,
    handleAuthProfileLoaded,
    isSimulatedRef,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
