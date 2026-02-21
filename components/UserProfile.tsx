/* eslint-disable react/no-unescaped-entities */

import React, { useState, useEffect, useRef } from 'react';
import {
  User, Building2, Shield, CreditCard, FileText, CheckCircle, AlertTriangle,
  Globe, Smartphone, Mail, Zap, LogOut, Users, Download, HelpCircle, Loader2,
  Key, Save, Plus, Upload, Eye, EyeOff, X, Settings, Bell, Lock, Link2,
  Brain, BarChart3, Clock, Trash2, RefreshCw, Copy, ExternalLink, Check,
  Camera, MapPin, Phone, AtSign, Briefcase, Calendar, Activity, Filter,
  ChevronRight, ChevronDown, AlertCircle, Info, Database, FileCheck,
  CreditCard as CardIcon, Building, Award, TrendingUp, Wallet, Receipt
} from 'lucide-react';
import { UserPersona } from '../types';
import { supabase } from '../services/supabase';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';
import {
  getUserProfile, updateUserProfile, uploadProfilePhoto, verifyEmail,
  getOrganization, updateOrganization, uploadOrganizationLogo,
  getUserPreferences, updateUserPreferences,
  getSecuritySettings, enableTwoFactor, disableTwoFactor, updatePassword,
  getActiveSessions, revokeSession, revokeAllSessions, connectSSO,
  getIntegrations, connectIntegration, disconnectIntegration,
  getAPIKeys, generateAPIKey, revokeAPIKey,
  getAIDataSettings, updateAIDataSettings, exportUserData, requestDataDeletion,
  getBillingInfo, getUsageMetrics, getInvoices, downloadInvoice,
  getAuditLogs, createAuditLog, exportAuditLogs,
  getTeamMembers, inviteTeamMember, updateTeamMember, removeTeamMember,
  getRoles, createRole, updateRole, deleteRole,
  getTradeAssociations, connectTradeAssociation, syncCurrencyRates,
  UserProfile as UserProfileType, Organization, UserPreferences, SecuritySettings,
  Integration, APIKey, AIDataSettings, BillingInfo, AuditLog, TeamMember, Role,
  TradeAssociation, UserSession
} from '../services/settingsService';

type Tab = 'identity' | 'organization' | 'preferences' | 'security' | 'integrations' | 'ai' | 'billing' | 'audit';

interface UserProfileProps {
  profileData?: any;
  userRole?: UserPersona;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profileData, userRole }) => {
  const [activeTab, setActiveTab] = useState<Tab>('identity');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { currency, setCurrency, formatCurrency } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Data states
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [aiSettings, setAISettings] = useState<AIDataSettings | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [associations, setAssociations] = useState<TradeAssociation[]>([]);

  // Form states for editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingOrg, setEditingOrg] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<UserProfileType>>({});
  const [orgForm, setOrgForm] = useState<Partial<Organization>>({});

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  // Password form
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Invite form
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' as 'admin' | 'member' | 'viewer', department: '' });

  // API Key form
  const [apiKeyForm, setApiKeyForm] = useState({ name: '', permissions: ['read:trades'] as string[] });

  // Audit log filters
  const [auditFilters, setAuditFilters] = useState<{
    action?: string;
    entityType?: string;
    status?: 'success' | 'failed';
  }>({});
  const [auditPage, setAuditPage] = useState(0);

  // Get current user ID
  const userId = profileData?.id || 'user-001';
  const organizationId = profile?.organizationId || organization?.id || 'org-001';

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, [userId]);

  // Fetch audit logs when filters change
  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, auditFilters, auditPage]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        profileData,
        preferencesData,
        securityData,
        integrationsData,
        apiKeysData,
        aiSettingsData,
        billingData,
        associationsData
      ] = await Promise.all([
        getUserProfile(userId),
        getUserPreferences(userId),
        getSecuritySettings(userId),
        getIntegrations(userId),
        getAPIKeys(userId),
        getAIDataSettings(userId),
        getBillingInfo(userId),
        getTradeAssociations(userId)
      ]);

      setProfile(profileData);
      setProfileForm(profileData || {});
      setPreferences(preferencesData);
      setSecurity(securityData);
      setIntegrations(integrationsData);
      setApiKeys(apiKeysData);
      setAISettings(aiSettingsData);
      setBillingInfo(billingData);
      setAssociations(associationsData);

      // Fetch organization if user has one
      if (profileData?.organizationId) {
        const orgData = await getOrganization(profileData.organizationId);
        setOrganization(orgData);
        setOrgForm(orgData || {});

        // Fetch team members and roles
        const [membersData, rolesData] = await Promise.all([
          getTeamMembers(profileData.organizationId),
          getRoles(profileData.organizationId)
        ]);
        setTeamMembers(membersData);
        setRoles(rolesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { logs, total } = await getAuditLogs(userId, {
        ...auditFilters,
        limit: 20,
        offset: auditPage * 20
      });
      setAuditLogs(logs);
      setAuditTotal(total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  // Save handlers
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const success = await updateUserProfile(userId, profileForm);
      if (success) {
        setProfile({ ...profile, ...profileForm } as UserProfileType);
        setSaveSuccess(true);
        setEditingProfile(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('Failed to save profile');
      }
    } catch (error) {
      setSaveError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!organizationId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const success = await updateOrganization(organizationId, orgForm);
      if (success) {
        setOrganization({ ...organization, ...orgForm } as Organization);
        setSaveSuccess(true);
        setEditingOrg(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('Failed to save organization');
      }
    } catch (error) {
      setSaveError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async (updates: Partial<UserPreferences>) => {
    setIsSaving(true);
    try {
      const success = await updateUserPreferences(userId, updates);
      if (success) {
        setPreferences({ ...preferences, ...updates } as UserPreferences);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const url = await uploadProfilePhoto(userId, file);
      if (url) {
        setProfile({ ...profile, profilePhotoUrl: url } as UserProfileType);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organizationId) return;

    setIsSaving(true);
    try {
      const url = await uploadOrganizationLogo(organizationId, file);
      if (url) {
        setOrganization({ ...organization, logoUrl: url } as Organization);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setSaveError('Passwords do not match');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const success = await updatePassword(passwordForm.current, passwordForm.new);
      if (success) {
        setShowPasswordModal(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('Failed to update password');
      }
    } catch (error) {
      setSaveError('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    setIsSaving(true);
    try {
      if (security?.twoFactorEnabled) {
        await disableTwoFactor(userId);
        setSecurity({ ...security, twoFactorEnabled: false } as SecuritySettings);
      } else {
        await enableTwoFactor(userId, 'authenticator');
        setSecurity({ ...security, twoFactorEnabled: true } as SecuritySettings);
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(userId, sessionId);
      const sessions = security?.activeSessions.filter(s => s.id !== sessionId) || [];
      setSecurity({ ...security, activeSessions: sessions } as SecuritySettings);
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await revokeAllSessions(userId);
      const currentSession = security?.activeSessions.find(s => s.isCurrent);
      setSecurity({ ...security, activeSessions: currentSession ? [currentSession] : [] } as SecuritySettings);
    } catch (error) {
      console.error('Error revoking sessions:', error);
    }
  };

  const handleInviteTeamMember = async () => {
    if (!organizationId || !inviteForm.email) return;
    setIsSaving(true);
    try {
      const newMember = await inviteTeamMember(organizationId, userId, inviteForm);
      if (newMember) {
        setTeamMembers([...teamMembers, newMember]);
        setShowInviteModal(false);
        setInviteForm({ email: '', role: 'member', department: '' });
      }
    } catch (error) {
      console.error('Error inviting team member:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    try {
      await removeTeamMember(memberId, userId);
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const handleGenerateAPIKey = async () => {
    setIsSaving(true);
    try {
      const result = await generateAPIKey(userId, apiKeyForm.name, apiKeyForm.permissions);
      if (result) {
        setApiKeys([result.apiKey, ...apiKeys]);
        setGeneratedApiKey(result.key);
        setApiKeyForm({ name: '', permissions: ['read:trades'] });
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeAPIKey = async (keyId: string) => {
    try {
      await revokeAPIKey(userId, keyId);
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const handleConnectIntegration = async (integration: Partial<Integration>) => {
    setIsSaving(true);
    try {
      const result = await connectIntegration(userId, integration);
      if (result) {
        setIntegrations([result, ...integrations]);
        setShowIntegrationModal(false);
      }
    } catch (error) {
      console.error('Error connecting integration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    try {
      await disconnectIntegration(userId, integrationId);
      setIntegrations(integrations.map(i =>
        i.id === integrationId ? { ...i, status: 'disconnected' as const } : i
      ));
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  const handleExportData = async () => {
    setIsSaving(true);
    try {
      const url = await exportUserData(userId);
      if (url) {
        // In a real app, trigger download
        alert('Data export initiated. You will receive an email with the download link.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDataRequest = async () => {
    setIsSaving(true);
    try {
      await requestDataDeletion(userId);
      setShowDeleteDataModal(false);
      alert('Data deletion request submitted. Our team will process this within 30 days.');
    } catch (error) {
      console.error('Error requesting data deletion:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportAuditLogs = async (format: 'csv' | 'pdf') => {
    try {
      const url = await exportAuditLogs(userId, format);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs.${format}`;
        link.click();
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  const handleSyncCurrencyRates = async () => {
    setIsSaving(true);
    try {
      await syncCurrencyRates();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error syncing rates:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Tab definitions
  const tabs = [
    { id: 'identity' as Tab, label: 'Identity & Profile', icon: User },
    { id: 'organization' as Tab, label: 'Organization', icon: Building2 },
    { id: 'preferences' as Tab, label: 'Preferences', icon: Settings },
    { id: 'security' as Tab, label: 'Security & Compliance', icon: Shield },
    { id: 'integrations' as Tab, label: 'Integrations', icon: Link2 },
    { id: 'ai' as Tab, label: 'AI & Data Control', icon: Brain },
    { id: 'billing' as Tab, label: 'Billing & Usage', icon: CreditCard },
    { id: 'audit' as Tab, label: 'Audit Logs', icon: FileText }
  ];

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderIdentityTab = () => (
    <div className="space-y-6">
      {/* Profile Photo Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profile?.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile?.fullName?.charAt(0) || 'U'
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 shadow-lg"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile?.fullName || 'Your Name'}</p>
            <p className="text-xs text-gray-500">{profile?.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Upload Photo
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
          {!editingProfile ? (
            <button
              onClick={() => setEditingProfile(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingProfile(false);
                  setProfileForm(profile || {});
                }}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              <User className="w-3 h-3 inline mr-1" /> Full Name
            </label>
            <input
              type="text"
              value={editingProfile ? profileForm.fullName || '' : profile?.fullName || ''}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              disabled={!editingProfile}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              <Briefcase className="w-3 h-3 inline mr-1" /> Title/Position
            </label>
            <input
              type="text"
              value={editingProfile ? profileForm.title || '' : profile?.title || ''}
              onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
              disabled={!editingProfile}
              placeholder="e.g., Trade Manager"
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              <Mail className="w-3 h-3 inline mr-1" /> Email Address
              {profile?.emailVerified && (
                <span className="ml-2 text-green-600 text-xs">
                  <CheckCircle className="w-3 h-3 inline" /> Verified
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white text-sm"
              />
              {!profile?.emailVerified && (
                <button
                  onClick={() => verifyEmail(userId)}
                  className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                >
                  Verify
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              <Phone className="w-3 h-3 inline mr-1" /> Phone Number
              {profile?.phoneVerified && (
                <span className="ml-2 text-green-600 text-xs">
                  <CheckCircle className="w-3 h-3 inline" /> Verified
                </span>
              )}
            </label>
            <input
              type="tel"
              value={editingProfile ? profileForm.phone || '' : profile?.phone || ''}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              disabled={!editingProfile}
              placeholder="+233 20 123 4567"
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              <Globe className="w-3 h-3 inline mr-1" /> Country
            </label>
            <select
              value={editingProfile ? profileForm.country || '' : profile?.country || ''}
              onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
              disabled={!editingProfile}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            >
              <option value="Ghana">Ghana</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
              <option value="Ethiopia">Ethiopia</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Rwanda">Rwanda</option>
              <option value="Uganda">Uganda</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              <Clock className="w-3 h-3 inline mr-1" /> Timezone
            </label>
            <select
              value={editingProfile ? profileForm.timezone || '' : profile?.timezone || ''}
              onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
              disabled={!editingProfile}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            >
              <option value="Africa/Accra">GMT (Accra)</option>
              <option value="Africa/Lagos">WAT (Lagos)</option>
              <option value="Africa/Nairobi">EAT (Nairobi)</option>
              <option value="Africa/Johannesburg">SAST (Johannesburg)</option>
              <option value="Africa/Cairo">EET (Cairo)</option>
            </select>
          </div>
        </div>

        {/* Sync Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <RefreshCw className="w-3 h-3" />
            Profile updates sync across: Invoices, Contracts, Audit Logs, Trade Documents
          </p>
        </div>
      </div>
    </div>
  );

  const renderOrganizationTab = () => (
    <div className="space-y-6">
      {/* Organization Details */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Legal Entity Details</h3>
          {!editingOrg ? (
            <button
              onClick={() => setEditingOrg(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingOrg(false);
                  setOrgForm(organization || {});
                }}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrganization}
                disabled={isSaving}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Organization
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center overflow-hidden">
              {organization?.logoUrl ? (
                <img src={organization.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
            >
              <Upload className="w-3 h-3" />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{organization?.name || 'Your Organization'}</p>
            <p className="text-xs text-gray-500 mt-1">
              {organization?.verificationStatus === 'verified' ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified Organization
                </span>
              ) : (
                <span className="text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {organization?.verificationStatus || 'Pending'} Verification
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Organization Name</label>
            <input
              type="text"
              value={editingOrg ? orgForm.name || '' : organization?.name || ''}
              onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
              disabled={!editingOrg}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Registration Number</label>
            <input
              type="text"
              value={editingOrg ? orgForm.registrationNumber || '' : organization?.registrationNumber || ''}
              onChange={(e) => setOrgForm({ ...orgForm, registrationNumber: e.target.value })}
              disabled={!editingOrg}
              placeholder="GH-BUS-2024-001234"
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Tax/VAT Number</label>
            <input
              type="text"
              value={editingOrg ? orgForm.taxVatNumber || '' : organization?.taxVatNumber || ''}
              onChange={(e) => setOrgForm({ ...orgForm, taxVatNumber: e.target.value })}
              disabled={!editingOrg}
              placeholder="TIN-123456789"
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Default Currency</label>
            <select
              value={editingOrg ? orgForm.defaultCurrency || 'USD' : organization?.defaultCurrency || 'USD'}
              onChange={(e) => setOrgForm({ ...orgForm, defaultCurrency: e.target.value })}
              disabled={!editingOrg}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Address</label>
            <input
              type="text"
              value={editingOrg ? orgForm.address || '' : organization?.address || ''}
              onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
              disabled={!editingOrg}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">City</label>
            <input
              type="text"
              value={editingOrg ? orgForm.city || '' : organization?.city || ''}
              onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
              disabled={!editingOrg}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Country</label>
            <select
              value={editingOrg ? orgForm.country || '' : organization?.country || ''}
              onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })}
              disabled={!editingOrg}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            >
              <option value="Ghana">Ghana</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Website</label>
            <input
              type="url"
              value={editingOrg ? orgForm.website || '' : organization?.website || ''}
              onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
              disabled={!editingOrg}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Timezone</label>
            <select
              value={editingOrg ? orgForm.timezone || '' : organization?.timezone || ''}
              onChange={(e) => setOrgForm({ ...orgForm, timezone: e.target.value })}
              disabled={!editingOrg}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            >
              <option value="Africa/Accra">GMT (Accra)</option>
              <option value="Africa/Lagos">WAT (Lagos)</option>
              <option value="Africa/Nairobi">EAT (Nairobi)</option>
              <option value="Africa/Johannesburg">SAST (Johannesburg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team & Permissions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team & Permissions</h3>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        <div className="space-y-3">
          {teamMembers.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {member.fullName?.charAt(0) || member.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {member.fullName || member.email}
                  </p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  member.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                  member.status === 'invited' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                  'bg-red-100 dark:bg-red-900/30 text-red-600'
                }`}>
                  {member.status}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  member.role === 'owner' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                  member.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                  'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {member.role}
                </span>
                {member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveTeamMember(member.id)}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Associations */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Regional Trade Associations</h3>
        <div className="space-y-3">
          {associations.map(assoc => (
            <div
              key={assoc.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{assoc.name}</p>
                  <p className="text-xs text-gray-500">{assoc.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  assoc.membershipStatus === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                  assoc.membershipStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                  'bg-red-100 dark:bg-red-900/30 text-red-600'
                }`}>
                  {assoc.membershipStatus}
                </span>
                {assoc.membershipStatus !== 'active' && (
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Department</label>
                <input
                  type="text"
                  value={inviteForm.department}
                  onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                  placeholder="e.g., Operations"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Assign Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="admin">Admin - Full access except owner actions</option>
                  <option value="member">Member - Can create and edit trades/docs</option>
                  <option value="viewer">Viewer - Read-only access</option>
                </select>
              </div>
              <button
                onClick={handleInviteTeamMember}
                disabled={!inviteForm.email || isSaving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
            </div>
            <button
              onClick={() => handleSavePreferences({
                notifications: { ...preferences?.notifications, email: !preferences?.notifications?.email }
              } as any)}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences?.notifications?.email ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                preferences?.notifications?.email ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">SMS/WhatsApp</p>
                <p className="text-xs text-gray-500">Receive urgent alerts via SMS</p>
              </div>
            </div>
            <button
              onClick={() => handleSavePreferences({
                notifications: { ...preferences?.notifications, sms: !preferences?.notifications?.sms }
              } as any)}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences?.notifications?.sms ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                preferences?.notifications?.sms ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Notification Types</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'tradeUpdates', label: 'Trade Updates' },
                { key: 'complianceAlerts', label: 'Compliance Alerts' },
                { key: 'marketOpportunities', label: 'Market Opportunities' },
                { key: 'financeReminders', label: 'Finance Reminders' },
                { key: 'contractRenewals', label: 'Contract Renewals' },
                { key: 'shipmentTracking', label: 'Shipment Tracking' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(preferences?.notifications as any)?.[item.key] ?? true}
                    onChange={(e) => handleSavePreferences({
                      notifications: { ...preferences?.notifications, [item.key]: e.target.checked }
                    } as any)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Localization */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Language</label>
            <select
              value={preferences?.language || 'en'}
              onChange={(e) => handleSavePreferences({ language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="pt">Portuguese</option>
              <option value="ar">Arabic</option>
              <option value="sw">Swahili</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Currency Display</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.symbol}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Date Format</label>
            <select
              value={preferences?.dateFormat || 'DD/MM/YYYY'}
              onChange={(e) => handleSavePreferences({ dateFormat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Privacy Controls</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Profile Visibility</label>
            <select
              value={preferences?.privacy?.profileVisibility || 'connections'}
              onChange={(e) => handleSavePreferences({
                privacy: { ...preferences?.privacy, profileVisibility: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="public">Public - Visible to all platform users</option>
              <option value="connections">Connections Only - Visible to trade partners</option>
              <option value="private">Private - Hidden from directory</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Trade History Sharing</p>
              <p className="text-xs text-gray-500">Allow partners to view past trade record</p>
            </div>
            <button
              onClick={() => handleSavePreferences({
                privacy: { ...preferences?.privacy, tradeHistorySharing: !preferences?.privacy?.tradeHistorySharing }
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences?.privacy?.tradeHistorySharing ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                preferences?.privacy?.tradeHistorySharing ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Analytics</p>
              <p className="text-xs text-gray-500">Allow AI to analyze your trade patterns</p>
            </div>
            <button
              onClick={() => handleSavePreferences({
                privacy: { ...preferences?.privacy, aiAnalytics: !preferences?.privacy?.aiAnalytics }
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences?.privacy?.aiAnalytics ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                preferences?.privacy?.aiAnalytics ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* UI Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Display Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Theme</label>
            <select
              value={preferences?.ui?.theme || 'light'}
              onChange={(e) => handleSavePreferences({
                ui: { ...preferences?.ui, theme: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Dashboard Layout</label>
            <select
              value={preferences?.ui?.dashboardLayout || 'default'}
              onChange={(e) => handleSavePreferences({
                ui: { ...preferences?.ui, dashboardLayout: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="expanded">Expanded</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Password Management */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Password</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Last changed: {security?.lastPasswordChange ? new Date(security.lastPasswordChange).toLocaleDateString() : 'Never'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Strong passwords help protect your account</p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
            <p className="text-xs text-gray-500 mt-1">Add an extra layer of security</p>
          </div>
          <button
            onClick={handleToggle2FA}
            disabled={isSaving}
            className={`px-4 py-2 text-sm rounded-lg ${
              security?.twoFactorEnabled
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {security?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
        {security?.twoFactorEnabled && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Two-factor authentication is enabled via {security.twoFactorMethod || 'authenticator'}
            </span>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Sessions</h3>
          <button
            onClick={handleRevokeAllSessions}
            className="text-sm text-red-600 hover:underline"
          >
            Revoke All Sessions
          </button>
        </div>
        <div className="space-y-3">
          {security?.activeSessions.map(session => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${session.isCurrent ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
                  <Activity className={`w-4 h-4 ${session.isCurrent ? 'text-green-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {session.deviceInfo}
                    {session.isCurrent && <span className="ml-2 text-xs text-green-600">(Current)</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.ipAddress} • {session.location} • {new Date(session.lastActiveAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SSO Connections */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Single Sign-On (SSO)</h3>
        <div className="space-y-3">
          {security?.ssoProviders.map(provider => (
            <div
              key={provider.provider}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  {provider.provider === 'google' && <span className="text-lg">G</span>}
                  {provider.provider === 'microsoft' && <span className="text-lg">M</span>}
                  {provider.provider === 'saml' && <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{provider.provider}</p>
                  {provider.email && <p className="text-xs text-gray-500">{provider.email}</p>}
                </div>
              </div>
              <button
                onClick={() => connectSSO(provider.provider as any)}
                className={`px-4 py-1.5 text-sm rounded-lg ${
                  provider.connected
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {provider.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">KYC Verification</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                profile?.emailVerified ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
              }`}>
                {profile?.emailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-gray-500">Identity verification for individual users</p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">KYB Verification</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                organization?.verificationStatus === 'verified' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
              }`}>
                {organization?.verificationStatus || 'Pending'}
              </span>
            </div>
            <p className="text-xs text-gray-500">Business verification for organizations</p>
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Compliance Report
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {saveError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg text-sm">
                {saveError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={!passwordForm.current || !passwordForm.new || !passwordForm.confirm || isSaving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      {/* Connected Integrations */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Connected Services</h3>
          <button
            onClick={() => setShowIntegrationModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Integration
          </button>
        </div>
        <div className="space-y-3">
          {integrations.map(integration => (
            <div
              key={integration.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  integration.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-700'
                }`}>
                  <Link2 className={`w-5 h-5 ${
                    integration.status === 'connected' ? 'text-green-600' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{integration.name}</p>
                  <p className="text-xs text-gray-500">{integration.description}</p>
                  {integration.lastSyncAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  integration.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                  integration.status === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                  'bg-gray-100 dark:bg-slate-700 text-gray-600'
                }`}>
                  {integration.status}
                </span>
                {integration.status === 'connected' ? (
                  <button
                    onClick={() => handleDisconnectIntegration(integration.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button className="text-sm text-blue-600 hover:underline">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
          {integrations.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Link2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No integrations connected</p>
            </div>
          )}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">API Keys</h3>
          <button
            onClick={() => setShowAPIKeyModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            Generate Key
          </button>
        </div>
        <div className="space-y-3">
          {apiKeys.map(key => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{key.name}</p>
                <p className="text-xs font-mono text-gray-500 mt-1">{key.keyPrefix}...{key.keyHash.slice(-6)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Created {new Date(key.createdAt).toLocaleDateString()} • {key.usageCount} calls
                </p>
              </div>
              <div className="flex items-center gap-3">
                {key.expiresAt && new Date(key.expiresAt) < new Date() && (
                  <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600">
                    Expired
                  </span>
                )}
                <button
                  onClick={() => handleRevokeAPIKey(key.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Currency Sync */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Currency Rates</h3>
            <p className="text-xs text-gray-500 mt-1">Sync exchange rates from external sources</p>
          </div>
          <button
            onClick={handleSyncCurrencyRates}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync Rates
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {showAPIKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate API Key</h3>
              <button onClick={() => {
                setShowAPIKeyModal(false);
                setGeneratedApiKey(null);
              }} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {generatedApiKey ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                    Your API key has been generated. Copy it now - you won't be able to see it again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white dark:bg-slate-700 px-3 py-2 rounded border font-mono overflow-x-auto">
                      {generatedApiKey}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedApiKey);
                        alert('Copied to clipboard!');
                      }}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAPIKeyModal(false);
                    setGeneratedApiKey(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={apiKeyForm.name}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                    placeholder="e.g., Production API Key"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['read:trades', 'write:trades', 'read:documents', 'write:documents'].map(perm => (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={apiKeyForm.permissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setApiKeyForm({ ...apiKeyForm, permissions: [...apiKeyForm.permissions, perm] });
                            } else {
                              setApiKeyForm({ ...apiKeyForm, permissions: apiKeyForm.permissions.filter(p => p !== perm) });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleGenerateAPIKey}
                  disabled={!apiKeyForm.name || isSaving}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Generate Key
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-6">
      {/* AI Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">AI & Analytics Settings</h3>
        <div className="space-y-4">
          {[
            { key: 'enableAIInsights', label: 'Enable AI Insights', description: 'Get AI-powered trade recommendations' },
            { key: 'enablePredictions', label: 'Enable Predictions', description: 'Receive predictive analytics for your trades' },
            { key: 'personalizedRecommendations', label: 'Personalized Recommendations', description: 'Get recommendations based on your trade history' },
            { key: 'anonymizedAnalytics', label: 'Anonymized Analytics', description: 'Contribute to platform-wide insights anonymously' }
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <button
                onClick={() => updateAIDataSettings(userId, { [item.key]: !(aiSettings as any)?.[item.key] })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  (aiSettings as any)?.[item.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  (aiSettings as any)?.[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Consent */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Data Consent</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Data Sharing Consent</p>
              <p className="text-xs text-gray-500">Allow sharing anonymized data for research</p>
            </div>
            <button
              onClick={() => updateAIDataSettings(userId, { dataSharingConsent: !aiSettings?.dataSharingConsent })}
              className={`w-12 h-6 rounded-full transition-colors ${
                aiSettings?.dataSharingConsent ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                aiSettings?.dataSharingConsent ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Model Training Opt-in</p>
              <p className="text-xs text-gray-500">Help improve AI models with your data</p>
            </div>
            <button
              onClick={() => updateAIDataSettings(userId, { modelTrainingOptIn: !aiSettings?.modelTrainingOptIn })}
              className={`w-12 h-6 rounded-full transition-colors ${
                aiSettings?.modelTrainingOptIn ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                aiSettings?.modelTrainingOptIn ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Data Retention Period</label>
            <select
              value={aiSettings?.dataRetentionDays || 365}
              onChange={(e) => updateAIDataSettings(userId, { dataRetentionDays: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
              <option value={730}>2 years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Export Your Data</p>
              <p className="text-xs text-gray-500">Download a copy of all your data</p>
            </div>
            <button
              onClick={handleExportData}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export Data
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Delete Account Data</p>
              <p className="text-xs text-red-600 dark:text-red-400">Permanently delete all your data</p>
            </div>
            <button
              onClick={() => setShowDeleteDataModal(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Data
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteDataModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Account Data?</h3>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. All your trades, documents, and account data will be permanently deleted within 30 days.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDataModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDataRequest}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Current Plan</p>
            <h3 className="text-2xl font-bold">{billingInfo?.planName || 'Free Plan'}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Billing Cycle</p>
            <p className="text-lg font-semibold capitalize">{billingInfo?.billingCycle || 'Monthly'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm opacity-80">
            Current period: {billingInfo?.currentPeriodStart ? new Date(billingInfo.currentPeriodStart).toLocaleDateString() : 'N/A'} - {billingInfo?.currentPeriodEnd ? new Date(billingInfo.currentPeriodEnd).toLocaleDateString() : 'N/A'}
          </p>
          <button className="px-4 py-2 bg-white text-blue-600 text-sm rounded-lg hover:bg-blue-50 font-semibold">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Usage Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Trades Created', used: billingInfo?.usageMetrics.tradesCreated || 0, limit: billingInfo?.usageMetrics.tradesLimit || 10, icon: TrendingUp },
            { label: 'Documents', used: billingInfo?.usageMetrics.documentsUploaded || 0, limit: billingInfo?.usageMetrics.documentsLimit || 50, icon: FileText },
            { label: 'API Calls', used: billingInfo?.usageMetrics.apiCalls || 0, limit: billingInfo?.usageMetrics.apiCallsLimit || 1000, icon: Zap },
            { label: 'Storage (MB)', used: billingInfo?.usageMetrics.storageUsedMB || 0, limit: billingInfo?.usageMetrics.storageLimitMB || 100, icon: Database },
            { label: 'Team Members', used: billingInfo?.usageMetrics.teamMembers || 1, limit: billingInfo?.usageMetrics.teamMembersLimit || 1, icon: Users }
          ].map(metric => {
            const percentage = Math.min((metric.used / metric.limit) * 100, 100);
            return (
              <div key={metric.label} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{metric.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{metric.used} / {metric.limit}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      percentage >= 90 ? 'bg-red-500' :
                      percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Methods</h3>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>
        <div className="space-y-3">
          {billingInfo?.paymentMethods.map(method => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <CardIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {method.brand} ending in {method.last4}
                  </p>
                  {method.expiryMonth && method.expiryYear && (
                    <p className="text-xs text-gray-500">Expires {method.expiryMonth}/{method.expiryYear}</p>
                  )}
                </div>
              </div>
              {method.isDefault && (
                <span className="text-xs font-bold px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded">
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Invoices</h3>
        <div className="space-y-3">
          {billingInfo?.invoices.map(invoice => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(invoice.amount)}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                  invoice.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                }`}>
                  {invoice.status}
                </span>
                <button
                  onClick={() => downloadInvoice(invoice.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                >
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Filters:</span>
          </div>
          <select
            value={auditFilters.entityType || ''}
            onChange={(e) => setAuditFilters({ ...auditFilters, entityType: e.target.value || undefined })}
            className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Types</option>
            <option value="profile">Profile</option>
            <option value="auth">Authentication</option>
            <option value="trade">Trades</option>
            <option value="document">Documents</option>
            <option value="integration">Integrations</option>
            <option value="payment">Payments</option>
          </select>
          <select
            value={auditFilters.status || ''}
            onChange={(e) => setAuditFilters({ ...auditFilters, status: e.target.value as any || undefined })}
            className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <div className="flex-1" />
          <button
            onClick={() => handleExportAuditLogs('csv')}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Date/Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Action</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Entity</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">IP Address</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{log.action}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded">
                      {log.entityType}
                    </span>
                    {log.entityId && <span className="text-xs text-gray-500 ml-2">#{log.entityId.slice(0, 8)}</span>}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {log.ipAddress || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      log.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {auditLogs.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No audit logs found</p>
          </div>
        )}

        {/* Pagination */}
        {auditTotal > 20 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-500">
              Showing {auditPage * 20 + 1} - {Math.min((auditPage + 1) * 20, auditTotal)} of {auditTotal}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuditPage(Math.max(0, auditPage - 1))}
                disabled={auditPage === 0}
                className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setAuditPage(auditPage + 1)}
                disabled={(auditPage + 1) * 20 >= auditTotal}
                className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-4 h-4" />
          Changes saved successfully
        </div>
      )}

      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings & Profile</h2>
            <p className="text-xs text-gray-500">Manage your account, organization, and preferences</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'identity' && renderIdentityTab()}
        {activeTab === 'organization' && renderOrganizationTab()}
        {activeTab === 'preferences' && renderPreferencesTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'integrations' && renderIntegrationsTab()}
        {activeTab === 'ai' && renderAITab()}
        {activeTab === 'billing' && renderBillingTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>
    </div>
  );
};
