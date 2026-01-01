export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRADE_LIFECYCLE = 'TRADE_LIFECYCLE', // New Workspace
  MARKET_INTEL = 'MARKET_INTEL', // Search Grounding
  COMPLIANCE = 'COMPLIANCE', // Thinking Mode
  LOGISTICS = 'LOGISTICS', // Maps Grounding
  LIVE_ASSISTANT = 'LIVE_ASSISTANT', // Live API
  MARKETING = 'MARKETING', // Image Gen
  READINESS = 'READINESS', // Fast responses
}

export interface ChartData {
  name: string;
  value: number;
  secondary?: number;
}

export interface TradeRoute {
  origin: string;
  destination: string;
  commodity: string;
  status: 'active' | 'pending' | 'blocked';
}

export enum UserPersona {
  EXPORTER_SME = 'Exporting SME',
  IMPORTER_SME = 'Importing SME',
  CUSTOMS = 'Customs Authority',
  LOGISTICS = 'Logistics Provider',
  BANK = 'Bank / Insurer',
  AGENCY = 'Trade Promotion Agency'
}