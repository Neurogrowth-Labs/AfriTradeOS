import { AppView, UserPersona } from '../types';
import {
  LayoutDashboard,
  Globe,
  Scale,
  Truck,
  Mic,
  Image as ImageIcon,
  Briefcase,
  Landmark,
  Users,
  Settings,
  ShieldAlert,
  Building,
  Activity,
  Key,
  FileText,
  FileSignature,
  TrendingUp,
  Package,
  ClipboardCheck,
  BarChart3,
  Shield,
  LucideIcon
} from 'lucide-react';

export interface MenuItem {
  view: AppView;
  icon: LucideIcon;
  label: string;
  description?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Define menu items for each role
const ROLE_MENUS: Record<UserPersona, MenuSection[]> = {
  // SME Exporter - Focus on trade operations, compliance, finance
  [UserPersona.EXPORTER_SME]: [
    {
      title: 'Operations',
      items: [
        { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
        { view: AppView.TRADE_LIFECYCLE, icon: Briefcase, label: 'My Trades' },
        { view: AppView.TRADE_FINANCE, icon: Landmark, label: 'Trade Finance' },
        { view: AppView.LOGISTICS, icon: Truck, label: 'Shipments' },
      ]
    },
    {
      title: 'Market',
      items: [
        { view: AppView.MARKET_INTEL, icon: Globe, label: 'Market Intelligence' },
        { view: AppView.MARKETPLACE, icon: Users, label: 'Find Partners' },
        { view: AppView.TENDERS, icon: FileText, label: 'Tenders & RFQ' },
        { view: AppView.CONTRACTS, icon: FileSignature, label: 'Contracts' },
      ]
    },
    {
      title: 'Compliance',
      items: [
        { view: AppView.COMPLIANCE, icon: Scale, label: 'Trade Compliance' },
        { view: AppView.KYC_VERIFICATION, icon: Key, label: 'KYC Documents' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { view: AppView.LIVE_ASSISTANT, icon: Mic, label: 'AI Assistant' },
        { view: AppView.MARKETING, icon: ImageIcon, label: 'Marketing Studio' },
      ]
    },
    {
      title: 'Account',
      items: [
        { view: AppView.PROFILE, icon: Settings, label: 'Settings' },
      ]
    }
  ],

  // Enterprise Exporter - Similar to SME but with more analytics
  [UserPersona.EXPORTER_ENTERPRISE]: [
    {
      title: 'Operations',
      items: [
        { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Command Center' },
        { view: AppView.TRADE_LIFECYCLE, icon: Briefcase, label: 'Trade Workspace' },
        { view: AppView.TRADE_FINANCE, icon: Landmark, label: 'Trade Finance' },
        { view: AppView.LOGISTICS, icon: Truck, label: 'Logistics Grid' },
      ]
    },
    {
      title: 'Market',
      items: [
        { view: AppView.MARKET_INTEL, icon: Globe, label: 'Market Intelligence' },
        { view: AppView.MARKETPLACE, icon: Users, label: 'Partner Network' },
        { view: AppView.TENDERS, icon: FileText, label: 'Tenders & RFQ' },
        { view: AppView.CONTRACTS, icon: FileSignature, label: 'Contracts' },
      ]
    },
    {
      title: 'Compliance',
      items: [
        { view: AppView.COMPLIANCE, icon: Scale, label: 'Trade Compliance' },
        { view: AppView.KYC_VERIFICATION, icon: Key, label: 'KYC Verification' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { view: AppView.LIVE_ASSISTANT, icon: Mic, label: 'Voice Assistant' },
        { view: AppView.MARKETING, icon: ImageIcon, label: 'Marketing Studio' },
      ]
    },
    {
      title: 'Account',
      items: [
        { view: AppView.PROFILE, icon: Settings, label: 'Profile & Settings' },
      ]
    }
  ],

  // Importer - Focus on sourcing, suppliers, compliance
  [UserPersona.IMPORTER]: [
    {
      title: 'Operations',
      items: [
        { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
        { view: AppView.TRADE_LIFECYCLE, icon: Package, label: 'Import Orders' },
        { view: AppView.TRADE_FINANCE, icon: Landmark, label: 'Trade Finance' },
        { view: AppView.LOGISTICS, icon: Truck, label: 'Shipment Tracking' },
      ]
    },
    {
      title: 'Sourcing',
      items: [
        { view: AppView.MARKETPLACE, icon: Users, label: 'Find Suppliers' },
        { view: AppView.TENDERS, icon: FileText, label: 'My RFQs' },
        { view: AppView.CONTRACTS, icon: FileSignature, label: 'Contracts' },
        { view: AppView.MARKET_INTEL, icon: Globe, label: 'Market Prices' },
      ]
    },
    {
      title: 'Compliance',
      items: [
        { view: AppView.COMPLIANCE, icon: Scale, label: 'Import Compliance' },
        { view: AppView.KYC_VERIFICATION, icon: Key, label: 'Documents' },
      ]
    },
    {
      title: 'Account',
      items: [
        { view: AppView.PROFILE, icon: Settings, label: 'Settings' },
      ]
    }
  ],

  // Customs Authority - Focus on compliance, verification, oversight
  [UserPersona.CUSTOMS]: [
    {
      title: 'Oversight',
      items: [
        { view: AppView.REGULATOR, icon: Building, label: 'Customs Dashboard', description: 'Overview of trade volumes, compliance rates, and alerts' },
      ]
    },
    {
      title: 'Declarations',
      items: [
        { view: AppView.COMPLIANCE, icon: ClipboardCheck, label: 'Declaration Review', description: 'Review and approve customs declarations' },
        { view: AppView.TRADE_LIFECYCLE, icon: Briefcase, label: 'Trade Verification', description: 'Verify trade documents and certificates' },
      ]
    },
    {
      title: 'Records',
      items: [
        { view: AppView.KYC_VERIFICATION, icon: Key, label: 'Trader Registry', description: 'Registered traders and verification status' },
        { view: AppView.CONTRACTS, icon: FileSignature, label: 'Trade Records', description: 'Historical trade records and audit trail' },
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { view: AppView.MARKET_INTEL, icon: Globe, label: 'Trade Analytics', description: 'Trade patterns and risk analysis' },
        { view: AppView.LOGISTICS, icon: Truck, label: 'Shipment Monitoring', description: 'Real-time cargo tracking' },
      ]
    },
    {
      title: 'Account',
      items: [
        { view: AppView.PROFILE, icon: Settings, label: 'Settings' },
      ]
    }
  ],

  // Logistics Provider - Focus on shipments, routes, tracking
  [UserPersona.LOGISTICS]: [
    {
      title: 'Operations',
      items: [
        { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
        { view: AppView.LOGISTICS, icon: Truck, label: 'Fleet Management' },
        { view: AppView.TRADE_LIFECYCLE, icon: Package, label: 'Active Shipments' },
      ]
    },
    {
      title: 'Business',
      items: [
        { view: AppView.MARKETPLACE, icon: Users, label: 'Find Clients' },
        { view: AppView.TENDERS, icon: FileText, label: 'Logistics Tenders' },
        { view: AppView.TRADE_FINANCE, icon: Landmark, label: 'Invoicing' },
      ]
    },
    {
      title: 'Compliance',
      items: [
        { view: AppView.COMPLIANCE, icon: Scale, label: 'Customs Docs' },
        { view: AppView.KYC_VERIFICATION, icon: Key, label: 'Certifications' },
      ]
    },
    {
      title: 'Account',
      items: [
        { view: AppView.PROFILE, icon: Settings, label: 'Settings' },
      ]
    }
  ],

  // Bank / Insurer - Focus on finance, risk, applications
  [UserPersona.BANK]: [
    {
      title: 'Applications',
      items: [
        { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Finance Dashboard', description: 'Overview of pending applications and portfolio' },
        { view: AppView.TRADE_FINANCE, icon: Landmark, label: 'Finance Applications', description: 'Review and process finance requests' },
      ]
    },
    {
      title: 'Due Diligence',
      items: [
        { view: AppView.KYC_VERIFICATION, icon: Key, label: 'KYC Review', description: 'Verify client identity and documents' },
        { view: AppView.COMPLIANCE, icon: Shield, label: 'AML Screening', description: 'Anti-money laundering checks' },
      ]
    },
    {
      title: 'Risk & Clients',
      items: [
        { view: AppView.MARKET_INTEL, icon: TrendingUp, label: 'Market Risk', description: 'Country and sector risk analysis' },
        { view: AppView.MARKETPLACE, icon: Users, label: 'Client Directory', description: 'Verified business directory' },
      ]
    },
    {
      title: 'Account',
      items: [
        { view: AppView.PROFILE, icon: Settings, label: 'Settings' },
      ]
    }
  ],

  // Government Agency - Focus on policy, oversight, analytics
  [UserPersona.GOVERNMENT]: [
    {
      title: 'Dashboard',
      items: [
        { view: AppView.REGULATOR, icon: Building, label: 'Command Center', description: 'Live trade monitoring, KPIs, risk alerts & AI anomaly detection' },
      ]
    },
    {
      title: 'Policy & Compliance',
      items: [
        { view: AppView.COMPLIANCE, icon: Scale, label: 'Policy & Compliance', description: 'Policy library, enforcement cases & regulatory gap analysis' },
        { view: AppView.CONTRACTS, icon: FileSignature, label: 'Trade Agreements', description: 'AfCFTA, SADC, COMESA — tariffs, RoO & smart calculator' },
      ]
    },
    {
      title: 'Statistics',
      items: [
        { view: AppView.MARKET_INTEL, icon: BarChart3, label: 'Trade Statistics', description: 'Import/export volumes, AI insights & forecasts' },
        { view: AppView.LOGISTICS, icon: Truck, label: 'Trade Flows', description: 'Border crossings, corridors & congestion intelligence' },
      ]
    },
    {
      title: 'Registry',
      items: [
        { view: AppView.KYC_VERIFICATION, icon: Key, label: 'Entity Verification', description: 'Digital KYC, AML screening & trusted trader tiers' },
        { view: AppView.MARKETPLACE, icon: Users, label: 'Business Registry', description: 'Company profiles, ownership & compliance scores' },
      ]
    },
    {
      title: 'Account',
      items: [
        { view: AppView.PROFILE, icon: Settings, label: 'Settings' },
      ]
    }
  ],

  // Trade Analyst - Focus on data, analytics, research
  [UserPersona.ANALYST]: [
    {
      title: 'Analytics',
      items: [
        { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Analytics Hub' },
        { view: AppView.MARKET_INTEL, icon: Globe, label: 'Market Research' },
        { view: AppView.TRADE_LIFECYCLE, icon: TrendingUp, label: 'Trade Trends' },
      ]
    },
    {
      title: 'Data',
      items: [
        { view: AppView.COMPLIANCE, icon: Scale, label: 'Regulatory Data' },
        { view: AppView.LOGISTICS, icon: Truck, label: 'Logistics Data' },
        { view: AppView.TRADE_FINANCE, icon: Landmark, label: 'Finance Metrics' },
      ]
    },
    {
      title: 'Network',
      items: [
        { view: AppView.MARKETPLACE, icon: Users, label: 'Market Players' },
        { view: AppView.TENDERS, icon: FileText, label: 'Tender Analysis' },
      ]
    },
    {
      title: 'Account',
      items: [
        { view: AppView.PROFILE, icon: Settings, label: 'Settings' },
      ]
    }
  ],

  // Platform Admin - Full access
  [UserPersona.ADMIN]: [
    {
      title: 'Administration',
      items: [
        { view: AppView.ADMIN, icon: ShieldAlert, label: 'Admin Console' },
        { view: AppView.REGULATOR, icon: Building, label: 'Oversight Portal' },
        { view: AppView.DIAGNOSTIC, icon: Activity, label: 'System Health' },
      ]
    },
    {
      title: 'Platform',
      items: [
        { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
        { view: AppView.TRADE_LIFECYCLE, icon: Briefcase, label: 'All Trades' },
        { view: AppView.TRADE_FINANCE, icon: Landmark, label: 'Finance' },
        { view: AppView.MARKETPLACE, icon: Users, label: 'Marketplace' },
        { view: AppView.TENDERS, icon: FileText, label: 'Tenders' },
        { view: AppView.CONTRACTS, icon: FileSignature, label: 'Contracts' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { view: AppView.MARKET_INTEL, icon: Globe, label: 'Market Intel' },
        { view: AppView.COMPLIANCE, icon: Scale, label: 'Compliance' },
        { view: AppView.LOGISTICS, icon: Truck, label: 'Logistics' },
        { view: AppView.KYC_VERIFICATION, icon: Key, label: 'KYC Management' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { view: AppView.LIVE_ASSISTANT, icon: Mic, label: 'AI Assistant' },
        { view: AppView.MARKETING, icon: ImageIcon, label: 'Marketing' },
      ]
    },
    {
      title: 'Account',
      items: [
        { view: AppView.PROFILE, icon: Settings, label: 'Settings' },
      ]
    }
  ],
};

export function getMenuForRole(role: UserPersona): MenuSection[] {
  return ROLE_MENUS[role] || ROLE_MENUS[UserPersona.EXPORTER_SME];
}

// Get all allowed views for a role (for route protection)
export function getAllowedViewsForRole(role: UserPersona): AppView[] {
  const menu = getMenuForRole(role);
  const views: AppView[] = [];
  menu.forEach(section => {
    section.items.forEach(item => {
      if (!views.includes(item.view)) {
        views.push(item.view);
      }
    });
  });
  return views;
}

// Check if a role can access a specific view
export function canAccessView(role: UserPersona, view: AppView): boolean {
  const allowedViews = getAllowedViewsForRole(role);
  return allowedViews.includes(view);
}
