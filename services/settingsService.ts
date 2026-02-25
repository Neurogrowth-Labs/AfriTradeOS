import { supabase } from './supabase';
import { UserPersona } from '../types';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  title?: string;
  profilePhotoUrl?: string;
  country: string;
  timezone: string;
  language: string;
  role: UserPersona;
  organizationId?: string;
  companyName?: string;
  isSuperAdmin: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  registrationNumber?: string;
  taxVatNumber?: string;
  type: 'buyer' | 'seller' | 'logistics' | 'legal' | 'finance' | 'government' | 'institution';
  address?: string;
  city?: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  brandColors?: {
    primary: string;
    secondary: string;
  };
  defaultCurrency: string;
  timezone: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'suspended' | 'rejected';
  rating: number;
  reviewsCount: number;
  tags: string[];
  description?: string;
  documentTemplates?: DocumentTemplate[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'contract' | 'quote' | 'packing_list' | 'bill_of_lading';
  templateUrl?: string;
  isDefault: boolean;
}

export interface UserPreferences {
  id: string;
  userId: string;
  // Notification Settings
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    tradeUpdates: boolean;
    complianceAlerts: boolean;
    marketOpportunities: boolean;
    financeReminders: boolean;
    contractRenewals: boolean;
    shipmentTracking: boolean;
    criticalAlerts: boolean;
  };
  // Localization
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  // Privacy Controls
  privacy: {
    profileVisibility: 'public' | 'connections' | 'private';
    tradeHistorySharing: boolean;
    aiAnalytics: boolean;
    marketingEmails: boolean;
  };
  // Dashboard & UI
  ui: {
    theme: 'light' | 'dark' | 'system';
    dashboardLayout: 'default' | 'compact' | 'expanded';
    sidebarCollapsed: boolean;
  };
  updatedAt: string;
}

export interface SecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'authenticator' | 'sms' | 'email';
  twoFactorBackupCodes?: string[];
  lastPasswordChange?: string;
  passwordExpiresAt?: string;
  activeSessions: UserSession[];
  trustedDevices: TrustedDevice[];
  ssoProviders: SSOProvider[];
  securityQuestions?: SecurityQuestion[];
}

export interface UserSession {
  id: string;
  deviceInfo: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface TrustedDevice {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  lastUsed: string;
  addedAt: string;
}

export interface SSOProvider {
  provider: 'google' | 'microsoft' | 'saml' | 'oidc';
  connected: boolean;
  email?: string;
  connectedAt?: string;
}

export interface SecurityQuestion {
  question: string;
  answerHash: string;
}

export interface Integration {
  id: string;
  userId: string;
  organizationId?: string;
  type: 'erp' | 'accounting' | 'payment' | 'shipping' | 'customs' | 'banking' | 'insurance' | 'other';
  provider: string;
  name: string;
  description?: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  apiKey?: string;
  apiKeyMasked?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  credentials?: Record<string, any>;
  lastSyncAt?: string;
  syncStatus?: 'success' | 'failed' | 'in_progress';
  errorMessage?: string;
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface APIKey {
  id: string;
  userId: string;
  organizationId?: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  permissions: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  rateLimit: number;
  isActive: boolean;
  createdAt: string;
}

export interface AIDataSettings {
  userId: string;
  enableAIInsights: boolean;
  enablePredictions: boolean;
  dataSharingConsent: boolean;
  modelTrainingOptIn: boolean;
  personalizedRecommendations: boolean;
  anonymizedAnalytics: boolean;
  dataRetentionDays: number;
  lastDataExportAt?: string;
  deleteRequestedAt?: string;
}

export interface BillingInfo {
  userId: string;
  organizationId?: string;
  planType: 'free' | 'starter' | 'professional' | 'enterprise';
  planName: string;
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usageMetrics: UsageMetrics;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  subscriptionStatus: 'active' | 'past_due' | 'cancelled' | 'trialing';
}

export interface UsageMetrics {
  tradesCreated: number;
  tradesLimit: number;
  documentsUploaded: number;
  documentsLimit: number;
  apiCalls: number;
  apiCallsLimit: number;
  storageUsedMB: number;
  storageLimitMB: number;
  teamMembers: number;
  teamMembersLimit: number;
  lastUpdated: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'mobile_money';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  billingAddress?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  downloadUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  department?: string;
  title?: string;
  permissions: string[];
  status: 'active' | 'invited' | 'suspended';
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  lastActiveAt?: string;
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isDefault: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}

export interface TradeAssociation {
  id: string;
  name: string;
  region: string;
  membershipStatus: 'active' | 'pending' | 'expired';
  membershipId?: string;
  benefits: string[];
  connectedAt?: string;
}

// ============================================================================
// DEFAULT VALUES (used when creating new records)
// ============================================================================

const DEFAULT_NOTIFICATIONS = {
  email: true,
  sms: false,
  push: true,
  tradeUpdates: true,
  complianceAlerts: true,
  marketOpportunities: true,
  financeReminders: true,
  contractRenewals: true,
  shipmentTracking: true,
  criticalAlerts: true
};

const DEFAULT_PRIVACY = {
  profileVisibility: 'connections' as const,
  tradeHistorySharing: true,
  aiAnalytics: true,
  marketingEmails: false
};

const DEFAULT_UI = {
  theme: 'light' as const,
  dashboardLayout: 'default' as const,
  sidebarCollapsed: false
};

const DEFAULT_SSO_PROVIDERS: SSOProvider[] = [
  { provider: 'google', connected: false },
  { provider: 'microsoft', connected: false },
  { provider: 'saml', connected: false }
];

// ============================================================================
// SERVICE METHODS
// ============================================================================

// Profile Methods
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone,
      title: data.title,
      profilePhotoUrl: data.profile_photo_url,
      country: data.country,
      timezone: data.timezone || 'Africa/Accra',
      language: data.language || 'en',
      role: data.role,
      organizationId: data.organization_id,
      companyName: data.company_name,
      isSuperAdmin: data.is_super_admin || false,
      emailVerified: data.email_verified || false,
      phoneVerified: data.phone_verified || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Failed to fetch user profile from database:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = {};

    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.profilePhotoUrl !== undefined) dbUpdates.profile_photo_url = updates.profilePhotoUrl;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);

    if (error) throw error;

    // Log the update
    await createAuditLog({
      userId,
      action: 'profile.updated',
      entityType: 'profile',
      entityId: userId,
      newValues: updates,
      status: 'success'
    });

    return true;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return false;
  }
}

export async function uploadProfilePhoto(userId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    await updateUserProfile(userId, { profilePhotoUrl: urlData.publicUrl });

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload profile photo:', error);
    return null;
  }
}

export async function verifyEmail(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: (await getUserProfile(userId))?.email || ''
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

// Organization Methods
export async function getOrganization(orgId: string): Promise<Organization | null> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      registrationNumber: data.registration_number,
      taxVatNumber: data.tax_vat_number,
      type: data.type,
      address: data.address,
      city: data.city,
      country: data.country,
      email: data.email,
      phone: data.phone,
      website: data.website,
      logoUrl: data.logo_url,
      brandColors: data.brand_colors,
      defaultCurrency: data.default_currency || 'USD',
      timezone: data.timezone || 'Africa/Accra',
      verificationStatus: data.verification_status,
      rating: data.rating || 0,
      reviewsCount: data.reviews_count || 0,
      tags: data.tags || [],
      description: data.description,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Failed to fetch organization from database:', error);
    throw error;
  }
}

export async function updateOrganization(orgId: string, updates: Partial<Organization>): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.registrationNumber !== undefined) dbUpdates.registration_number = updates.registrationNumber;
    if (updates.taxVatNumber !== undefined) dbUpdates.tax_vat_number = updates.taxVatNumber;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    if (updates.brandColors !== undefined) dbUpdates.brand_colors = updates.brandColors;
    if (updates.defaultCurrency !== undefined) dbUpdates.default_currency = updates.defaultCurrency;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('organizations')
      .update(dbUpdates)
      .eq('id', orgId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to update organization:', error);
    return false;
  }
}

export async function uploadOrganizationLogo(orgId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${orgId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(fileName);

    await updateOrganization(orgId, { logoUrl: urlData.publicUrl });

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload organization logo:', error);
    return null;
  }
}

// Preferences Methods
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      notifications: data.notifications || DEFAULT_NOTIFICATIONS,
      language: data.language || 'en',
      currency: data.currency || 'USD',
      timezone: data.timezone || 'Africa/Accra',
      dateFormat: data.date_format || 'DD/MM/YYYY',
      numberFormat: data.number_format || '1,234.56',
      privacy: data.privacy || DEFAULT_PRIVACY,
      ui: data.ui || DEFAULT_UI,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Failed to fetch user preferences from database:', error);
    throw error;
  }
}

export async function updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = {
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    if (updates.notifications !== undefined) dbUpdates.notifications = updates.notifications;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
    if (updates.dateFormat !== undefined) dbUpdates.date_format = updates.dateFormat;
    if (updates.numberFormat !== undefined) dbUpdates.number_format = updates.numberFormat;
    if (updates.privacy !== undefined) dbUpdates.privacy = updates.privacy;
    if (updates.ui !== undefined) dbUpdates.ui = updates.ui;

    const { error } = await supabase
      .from('user_preferences')
      .upsert(dbUpdates, { onConflict: 'user_id' });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    return false;
  }
}

// Security Methods
export async function getSecuritySettings(userId: string): Promise<SecuritySettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Get active sessions
    const sessions = await getActiveSessions(userId);

    return {
      userId: data.user_id,
      twoFactorEnabled: data.two_factor_enabled || false,
      twoFactorMethod: data.two_factor_method,
      lastPasswordChange: data.last_password_change,
      passwordExpiresAt: data.password_expires_at,
      activeSessions: sessions,
      trustedDevices: data.trusted_devices || [],
      ssoProviders: data.sso_providers || DEFAULT_SSO_PROVIDERS
    };
  } catch (error) {
    console.error('Failed to fetch security settings from database:', error);
    throw error;
  }
}

export async function enableTwoFactor(userId: string, method: 'authenticator' | 'sms' | 'email'): Promise<{ secret?: string; qrCode?: string } | null> {
  try {
    // In a real implementation, this would generate a TOTP secret
    const secret = 'JBSWY3DPEHPK3PXP'; // Demo secret

    const { error } = await supabase
      .from('user_security')
      .upsert({
        user_id: userId,
        two_factor_enabled: true,
        two_factor_method: method,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'security.2fa_enabled',
      entityType: 'security',
      newValues: { method },
      status: 'success'
    });

    return { secret, qrCode: `otpauth://totp/AfriTradeOS?secret=${secret}` };
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    return null;
  }
}

export async function disableTwoFactor(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_security')
      .update({
        two_factor_enabled: false,
        two_factor_method: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'security.2fa_disabled',
      entityType: 'security',
      status: 'success'
    });

    return true;
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    return false;
  }
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to update password:', error);
    return false;
  }
}

export async function getActiveSessions(userId: string): Promise<UserSession[]> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_active_at', { ascending: false });

    if (error) throw error;

    return data?.map(s => ({
      id: s.id,
      deviceInfo: s.device_info,
      browser: s.browser,
      os: s.os,
      ipAddress: s.ip_address,
      location: s.location,
      createdAt: s.created_at,
      lastActiveAt: s.last_active_at,
      isCurrent: s.is_current
    })) || [];
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return [];
  }
}

export async function revokeSession(userId: string, sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'security.session_revoked',
      entityType: 'session',
      entityId: sessionId,
      status: 'success'
    });

    return true;
  } catch (error) {
    console.error('Failed to revoke session:', error);
    return false;
  }
}

export async function revokeAllSessions(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .neq('is_current', true);

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'security.all_sessions_revoked',
      entityType: 'security',
      status: 'success'
    });

    return true;
  } catch (error) {
    console.error('Failed to revoke all sessions:', error);
    return false;
  }
}

export async function connectSSO(provider: 'google' | 'microsoft'): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'microsoft' ? 'azure' : provider,
      options: { redirectTo: window.location.origin }
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to connect SSO:', error);
    return false;
  }
}

// Integration Methods
export async function getIntegrations(userId: string): Promise<Integration[]> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(i => ({
      id: i.id,
      userId: i.user_id,
      organizationId: i.organization_id,
      type: i.type,
      provider: i.provider,
      name: i.name,
      description: i.description,
      status: i.status,
      apiKeyMasked: i.api_key ? '****' + i.api_key.slice(-4) : undefined,
      webhookUrl: i.webhook_url,
      lastSyncAt: i.last_sync_at,
      syncStatus: i.sync_status,
      errorMessage: i.error_message,
      config: i.config,
      createdAt: i.created_at,
      updatedAt: i.updated_at
    })) || [];
  } catch (error) {
    console.error('Failed to fetch integrations:', error);
    return [];
  }
}

export async function connectIntegration(userId: string, integration: Partial<Integration>): Promise<Integration | null> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .insert({
        user_id: userId,
        type: integration.type,
        provider: integration.provider,
        name: integration.name,
        description: integration.description,
        status: 'connected',
        api_key: integration.apiKey,
        webhook_url: integration.webhookUrl,
        config: integration.config,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'integration.connected',
      entityType: 'integration',
      entityId: data.id,
      newValues: { provider: integration.provider, name: integration.name },
      status: 'success'
    });

    return data;
  } catch (error) {
    console.error('Failed to connect integration:', error);
    return null;
  }
}

export async function disconnectIntegration(userId: string, integrationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('integrations')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId)
      .eq('user_id', userId);

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'integration.disconnected',
      entityType: 'integration',
      entityId: integrationId,
      status: 'success'
    });

    return true;
  } catch (error) {
    console.error('Failed to disconnect integration:', error);
    return false;
  }
}

// API Key Methods
export async function getAPIKeys(userId: string): Promise<APIKey[]> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(k => ({
      id: k.id,
      userId: k.user_id,
      organizationId: k.organization_id,
      name: k.name,
      keyPrefix: k.key_prefix,
      keyHash: '****************************' + k.key_hash.slice(-6),
      permissions: k.permissions || [],
      expiresAt: k.expires_at,
      lastUsedAt: k.last_used_at,
      usageCount: k.usage_count || 0,
      rateLimit: k.rate_limit || 1000,
      isActive: k.is_active,
      createdAt: k.created_at
    })) || [];
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    return [];
  }
}

export async function generateAPIKey(userId: string, name: string, permissions: string[]): Promise<{ key: string; apiKey: APIKey } | null> {
  try {
    // Generate a random API key
    const keyPrefix = 'sk_live_';
    const keyBody = Array.from({ length: 32 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
    ).join('');
    const fullKey = keyPrefix + keyBody;

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        key_prefix: keyPrefix,
        key_hash: fullKey, // In production, this should be hashed
        permissions,
        rate_limit: 1000,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'api_key.generated',
      entityType: 'api_key',
      entityId: data.id,
      newValues: { name },
      status: 'success'
    });

    return {
      key: fullKey,
      apiKey: {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        keyPrefix: data.key_prefix,
        keyHash: '****************************' + fullKey.slice(-6),
        permissions: data.permissions,
        usageCount: 0,
        rateLimit: data.rate_limit,
        isActive: true,
        createdAt: data.created_at
      }
    };
  } catch (error) {
    console.error('Failed to generate API key:', error);
    return null;
  }
}

export async function revokeAPIKey(userId: string, keyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'api_key.revoked',
      entityType: 'api_key',
      entityId: keyId,
      status: 'success'
    });

    return true;
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    return false;
  }
}

// AI & Data Control Methods
export async function getAIDataSettings(userId: string): Promise<AIDataSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_ai_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      userId: data.user_id,
      enableAIInsights: data.enable_ai_insights ?? true,
      enablePredictions: data.enable_predictions ?? true,
      dataSharingConsent: data.data_sharing_consent ?? false,
      modelTrainingOptIn: data.model_training_opt_in ?? false,
      personalizedRecommendations: data.personalized_recommendations ?? true,
      anonymizedAnalytics: data.anonymized_analytics ?? true,
      dataRetentionDays: data.data_retention_days ?? 365,
      lastDataExportAt: data.last_data_export_at,
      deleteRequestedAt: data.delete_requested_at
    };
  } catch (error) {
    console.error('Failed to fetch AI settings:', error);
    throw error;
  }
}

export async function updateAIDataSettings(userId: string, updates: Partial<AIDataSettings>): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = {
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    if (updates.enableAIInsights !== undefined) dbUpdates.enable_ai_insights = updates.enableAIInsights;
    if (updates.enablePredictions !== undefined) dbUpdates.enable_predictions = updates.enablePredictions;
    if (updates.dataSharingConsent !== undefined) dbUpdates.data_sharing_consent = updates.dataSharingConsent;
    if (updates.modelTrainingOptIn !== undefined) dbUpdates.model_training_opt_in = updates.modelTrainingOptIn;
    if (updates.personalizedRecommendations !== undefined) dbUpdates.personalized_recommendations = updates.personalizedRecommendations;
    if (updates.anonymizedAnalytics !== undefined) dbUpdates.anonymized_analytics = updates.anonymizedAnalytics;
    if (updates.dataRetentionDays !== undefined) dbUpdates.data_retention_days = updates.dataRetentionDays;

    const { error } = await supabase
      .from('user_ai_settings')
      .upsert(dbUpdates, { onConflict: 'user_id' });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to update AI settings:', error);
    return false;
  }
}

export async function exportUserData(userId: string): Promise<string | null> {
  try {
    // In a real implementation, this would trigger a data export job
    // and return a download URL

    await supabase
      .from('user_ai_settings')
      .update({ last_data_export_at: new Date().toISOString() })
      .eq('user_id', userId);

    await createAuditLog({
      userId,
      action: 'data.exported',
      entityType: 'user_data',
      status: 'success'
    });

    return '/api/data-export/' + userId;
  } catch (error) {
    console.error('Failed to export data:', error);
    return null;
  }
}

export async function requestDataDeletion(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_ai_settings')
      .update({ delete_requested_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'data.deletion_requested',
      entityType: 'user_data',
      status: 'success'
    });

    return true;
  } catch (error) {
    console.error('Failed to request data deletion:', error);
    return false;
  }
}

// Billing Methods
export async function getBillingInfo(userId: string): Promise<BillingInfo | null> {
  try {
    const { data, error } = await supabase
      .from('billing_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Get usage metrics
    const usageMetrics = await getUsageMetrics(userId);

    // Get invoices
    const invoices = await getInvoices(userId);

    // Get payment methods
    const paymentMethods = await getPaymentMethods(userId);

    return {
      userId: data.user_id,
      organizationId: data.organization_id,
      planType: data.plan_type,
      planName: data.plan_name,
      billingCycle: data.billing_cycle,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      usageMetrics,
      paymentMethods,
      invoices,
      subscriptionStatus: data.subscription_status
    };
  } catch (error) {
    console.error('Failed to fetch billing info:', error);
    throw error;
  }
}

export async function getUsageMetrics(userId: string): Promise<UsageMetrics> {
  try {
    const { data, error } = await supabase
      .from('usage_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      tradesCreated: data.trades_created || 0,
      tradesLimit: data.trades_limit || 100,
      documentsUploaded: data.documents_uploaded || 0,
      documentsLimit: data.documents_limit || 500,
      apiCalls: data.api_calls || 0,
      apiCallsLimit: data.api_calls_limit || 50000,
      storageUsedMB: data.storage_used_mb || 0,
      storageLimitMB: data.storage_limit_mb || 5000,
      teamMembers: data.team_members || 0,
      teamMembersLimit: data.team_members_limit || 10,
      lastUpdated: data.updated_at
    };
  } catch (error) {
    console.error('Failed to fetch usage metrics:', error);
    throw error;
  }
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })
      .limit(12);

    if (error) throw error;

    return data?.map(i => ({
      id: i.id,
      invoiceNumber: i.invoice_number,
      amount: i.amount,
      currency: i.currency,
      status: i.status,
      issuedAt: i.issued_at,
      dueAt: i.due_at,
      paidAt: i.paid_at,
      downloadUrl: i.download_url
    })) || [];
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return [];
  }
}

export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    return data?.map(p => ({
      id: p.id,
      type: p.type,
      brand: p.brand,
      last4: p.last4,
      expiryMonth: p.expiry_month,
      expiryYear: p.expiry_year,
      isDefault: p.is_default
    })) || [];
  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
    return [];
  }
}

export async function downloadInvoice(invoiceId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('download_url')
      .eq('id', invoiceId)
      .single();

    if (error) throw error;

    return data.download_url;
  } catch (error) {
    console.error('Failed to get invoice download URL:', error);
    return null;
  }
}

// Plan upgrade configuration
const PLAN_CONFIGS = {
  pro_monthly: {
    planType: 'professional' as const,
    planName: 'Pro Plan',
    tradesLimit: 999999,
    documentsLimit: 999999,
    apiCallsLimit: 10000,
    storageLimitMB: 5000,
    teamMembersLimit: 5,
    price: 19.00
  },
  enterprise_monthly: {
    planType: 'enterprise' as const,
    planName: 'Enterprise Plan',
    tradesLimit: 999999,
    documentsLimit: 999999,
    apiCallsLimit: 999999,
    storageLimitMB: 50000,
    teamMembersLimit: 999999,
    price: 49.00
  }
};

export interface UpgradeResult {
  success: boolean;
  newPlanName: string;
  newPlanType: string;
  periodStart: string;
  periodEnd: string;
  invoiceId?: string;
  error?: string;
}

export async function upgradePlan(
  userId: string,
  planId: string,
  paypalOrderId: string,
  paypalPayerId?: string
): Promise<UpgradeResult> {
  const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS];

  if (!planConfig) {
    return {
      success: false,
      newPlanName: '',
      newPlanType: '',
      periodStart: '',
      periodEnd: '',
      error: 'Invalid plan selected'
    };
  }

  const now = new Date();
  const periodStart = now.toISOString();
  const periodEnd = new Date(now.setMonth(now.getMonth() + 1)).toISOString();

  try {
    // 1. Update billing_info with new plan
    const { error: billingError } = await supabase
      .from('billing_info')
      .upsert({
        user_id: userId,
        plan_type: planConfig.planType,
        plan_name: planConfig.planName,
        billing_cycle: 'monthly',
        current_period_start: periodStart,
        current_period_end: periodEnd,
        subscription_status: 'active',
        paypal_order_id: paypalOrderId,
        paypal_payer_id: paypalPayerId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (billingError) throw billingError;

    // 2. Update usage limits based on new plan
    const { error: usageError } = await supabase
      .from('usage_metrics')
      .upsert({
        user_id: userId,
        trades_limit: planConfig.tradesLimit,
        documents_limit: planConfig.documentsLimit,
        api_calls_limit: planConfig.apiCallsLimit,
        storage_limit_mb: planConfig.storageLimitMB,
        team_members_limit: planConfig.teamMembersLimit,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (usageError) throw usageError;

    // 3. Create invoice record
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        amount: planConfig.price,
        currency: 'USD',
        status: 'paid',
        issued_at: periodStart,
        due_at: periodStart,
        paid_at: periodStart,
        description: `${planConfig.planName} - Monthly Subscription`,
        paypal_order_id: paypalOrderId
      })
      .select('id')
      .single();

    if (invoiceError) {
      console.warn('Failed to create invoice record:', invoiceError);
    }

    // 4. Create audit log
    await createAuditLog({
      userId,
      action: 'plan_upgraded',
      entityType: 'subscription',
      entityId: paypalOrderId,
      newValues: {
        planType: planConfig.planType,
        planName: planConfig.planName,
        price: planConfig.price,
        paypalOrderId
      },
      status: 'success',
      metadata: { source: 'paypal', planId }
    });

    return {
      success: true,
      newPlanName: planConfig.planName,
      newPlanType: planConfig.planType,
      periodStart,
      periodEnd,
      invoiceId: invoiceData?.id
    };
  } catch (error) {
    console.error('Failed to upgrade plan:', error);

    // Log failed attempt
    await createAuditLog({
      userId,
      action: 'plan_upgrade_failed',
      entityType: 'subscription',
      entityId: paypalOrderId,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      metadata: { source: 'paypal', planId }
    });

    return {
      success: false,
      newPlanName: '',
      newPlanType: '',
      periodStart: '',
      periodEnd: '',
      error: error instanceof Error ? error.message : 'Failed to upgrade plan'
    };
  }
}

// Audit Log Methods
export async function getAuditLogs(userId: string, filters?: {
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  status?: 'success' | 'failed';
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLog[]; total: number }> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*, profiles!user_id(full_name)', { count: 'exact' })
      .eq('user_id', userId);

    if (filters?.action) {
      query = query.ilike('action', `%${filters.action}%`);
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters?.fromDate) {
      query = query.gte('created_at', filters.fromDate);
    }
    if (filters?.toDate) {
      query = query.lte('created_at', filters.toDate);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 50) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const logs = data?.map(log => ({
      id: log.id,
      userId: log.user_id,
      userName: log.profiles?.full_name,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      oldValues: log.old_values,
      newValues: log.new_values,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      location: log.location,
      status: log.status,
      errorMessage: log.error_message,
      metadata: log.metadata,
      createdAt: log.created_at
    })) || [];

    return { logs, total: count || 0 };
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return { logs: [], total: 0 };
  }
}

export async function createAuditLog(log: Partial<AuditLog>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: log.userId,
        action: log.action,
        entity_type: log.entityType,
        entity_id: log.entityId,
        old_values: log.oldValues,
        new_values: log.newValues,
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
        status: log.status || 'success',
        error_message: log.errorMessage,
        metadata: log.metadata,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return false;
  }
}

export async function exportAuditLogs(userId: string, format: 'csv' | 'pdf'): Promise<string | null> {
  try {
    const { logs } = await getAuditLogs(userId, { limit: 1000 });

    if (format === 'csv') {
      const headers = ['Date', 'Action', 'Entity Type', 'Entity ID', 'Status', 'IP Address'];
      const rows = logs.map(log => [
        new Date(log.createdAt).toISOString(),
        log.action,
        log.entityType,
        log.entityId || '',
        log.status,
        log.ipAddress || ''
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      return URL.createObjectURL(blob);
    }

    // For PDF, in a real implementation you'd use a PDF library
    return null;
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    return null;
  }
}

// Team Management Methods
export async function getTeamMembers(organizationId: string): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: false });

    if (error) throw error;

    return data?.map(m => ({
      id: m.id,
      userId: m.user_id,
      organizationId: m.organization_id,
      email: m.email,
      fullName: m.full_name,
      role: m.role,
      department: m.department,
      title: m.title,
      permissions: m.permissions || [],
      status: m.status,
      invitedBy: m.invited_by,
      invitedAt: m.invited_at,
      joinedAt: m.joined_at,
      lastActiveAt: m.last_active_at
    })) || [];
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return [];
  }
}

export async function inviteTeamMember(organizationId: string, invitedBy: string, member: {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  department?: string;
}): Promise<TeamMember | null> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        organization_id: organizationId,
        email: member.email,
        role: member.role,
        department: member.department,
        permissions: getRolePermissions(member.role),
        status: 'invited',
        invited_by: invitedBy,
        invited_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    await createAuditLog({
      userId: invitedBy,
      action: 'team.member_invited',
      entityType: 'team_member',
      entityId: data.id,
      newValues: { email: member.email, role: member.role },
      status: 'success'
    });

    // In a real implementation, send invitation email here

    return data;
  } catch (error) {
    console.error('Failed to invite team member:', error);
    return null;
  }
}

export async function updateTeamMember(memberId: string, updates: Partial<TeamMember>): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = {};

    if (updates.role !== undefined) {
      dbUpdates.role = updates.role;
      dbUpdates.permissions = getRolePermissions(updates.role);
    }
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('team_members')
      .update(dbUpdates)
      .eq('id', memberId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to update team member:', error);
    return false;
  }
}

export async function removeTeamMember(memberId: string, removedBy: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    await createAuditLog({
      userId: removedBy,
      action: 'team.member_removed',
      entityType: 'team_member',
      entityId: memberId,
      status: 'success'
    });

    return true;
  } catch (error) {
    console.error('Failed to remove team member:', error);
    return false;
  }
}

// Role Management Methods
export async function getRoles(organizationId: string): Promise<Role[]> {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;

    return data?.map(r => ({
      id: r.id,
      organizationId: r.organization_id,
      name: r.name,
      description: r.description,
      permissions: r.permissions || [],
      isDefault: r.is_default || false,
      memberCount: r.member_count || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    })) || [];
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return [];
  }
}

export async function createRole(organizationId: string, role: Partial<Role>): Promise<Role | null> {
  try {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        organization_id: organizationId,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        is_default: role.isDefault || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Failed to create role:', error);
    return null;
  }
}

export async function updateRole(roleId: string, updates: Partial<Role>): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.permissions !== undefined) dbUpdates.permissions = updates.permissions;
    if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;

    const { error } = await supabase
      .from('roles')
      .update(dbUpdates)
      .eq('id', roleId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to update role:', error);
    return false;
  }
}

export async function deleteRole(roleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to delete role:', error);
    return false;
  }
}

// Trade Association Methods
export async function getTradeAssociations(userId: string): Promise<TradeAssociation[]> {
  try {
    const { data, error } = await supabase
      .from('user_trade_associations')
      .select('*, trade_associations(*)')
      .eq('user_id', userId);

    if (error) throw error;

    return data?.map(a => ({
      id: a.trade_associations.id,
      name: a.trade_associations.name,
      region: a.trade_associations.region,
      membershipStatus: a.membership_status,
      membershipId: a.membership_id,
      benefits: a.trade_associations.benefits || [],
      connectedAt: a.connected_at
    })) || [];
  } catch (error) {
    console.error('Failed to fetch trade associations:', error);
    return [];
  }
}

export async function connectTradeAssociation(userId: string, associationId: string, membershipId?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_trade_associations')
      .insert({
        user_id: userId,
        association_id: associationId,
        membership_status: membershipId ? 'active' : 'pending',
        membership_id: membershipId,
        connected_at: new Date().toISOString()
      });

    if (error) throw error;

    await createAuditLog({
      userId,
      action: 'association.connected',
      entityType: 'trade_association',
      entityId: associationId,
      status: 'success'
    });

    return true;
  } catch (error) {
    console.error('Failed to connect trade association:', error);
    return false;
  }
}

// Currency Rate Sync
export async function syncCurrencyRates(): Promise<boolean> {
  try {
    // In a real implementation, this would fetch from an FX API
    const rates = [
      { pair: 'USD/GHS', rate: 15.25, change: 0.12, change_percent: 0.8 },
      { pair: 'USD/NGN', rate: 1550.00, change: -5.00, change_percent: -0.32 },
      { pair: 'USD/KES', rate: 153.50, change: 0.25, change_percent: 0.16 },
      { pair: 'USD/ZAR', rate: 18.75, change: 0.08, change_percent: 0.43 },
      { pair: 'EUR/USD', rate: 1.085, change: 0.002, change_percent: 0.18 }
    ];

    for (const rate of rates) {
      await supabase
        .from('fx_rates')
        .upsert({
          pair: rate.pair,
          rate: rate.rate,
          change: rate.change,
          change_percent: rate.change_percent,
          source: 'api',
          updated_at: new Date().toISOString()
        }, { onConflict: 'pair' });
    }

    return true;
  } catch (error) {
    console.error('Failed to sync currency rates:', error);
    return false;
  }
}

// Helper function to get default permissions for a role
function getRolePermissions(role: 'owner' | 'admin' | 'member' | 'viewer'): string[] {
  switch (role) {
    case 'owner':
      return ['*'];
    case 'admin':
      return ['read:*', 'write:trades', 'write:documents', 'write:team'];
    case 'member':
      return ['read:trades', 'read:documents', 'write:trades', 'write:documents'];
    case 'viewer':
      return ['read:trades', 'read:documents'];
    default:
      return ['read:trades'];
  }
}
