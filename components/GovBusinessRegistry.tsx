import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Building,
  Globe,
  FileText,
  Eye,
  Download,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Link2,
  Activity,
  RefreshCw,
  Network,
  CircleDot,
  Loader2
} from 'lucide-react';
import { governmentService } from '../services/governmentService';

// Static network/fraud data (would come from graph analytics engine)
const NETWORK_LINKS = [
  { source: 'Company A', target: 'Company B', type: 'supplier', strength: 'strong' },
  { source: 'Company C', target: 'Company D', type: 'buyer', strength: 'medium' },
];

const FRAUD_ALERTS = [
  { entity: 'Unknown', alert: 'Linked to sanctioned entity via ownership chain', severity: 'high', date: '2024-12-18' },
];

interface CompanyProfile {
  id: string; name: string; country: string; sector: string;
  type: string; employees: number; founded: number; ceo: string;
  complianceScore: number; riskLevel: string; traderTier: string;
  tradeVolume: string; trades: number; licenses: number; permitsPending: number;
  contacts: { phone: string; email: string; website: string };
  ownership: { name: string; share: number }[];
  history: { date: string; event: string; type: string }[];
}

type ActiveTab = 'directory' | 'network' | 'performance' | 'fraud';

export const GovBusinessRegistry: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');

  // Database-driven state
  const [COMPANIES, setCompanies] = useState<CompanyProfile[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgs, amlAlerts] = await Promise.all([
          governmentService.getOrganizations(),
          governmentService.getAMLAlerts(),
        ]);

        // Map organizations to company profiles
        setCompanies(orgs.map((o: Record<string, unknown>, i: number) => {
          const rating = (o.rating as number) || 3;
          const score = Math.round(rating * 20);
          return {
            id: `ORG-${String(i + 1).padStart(3, '0')}`,
            name: (o.name as string) || 'Unknown',
            country: (o.country as string) || 'Unknown',
            sector: (o.industry as string) || 'General Trade',
            type: (o.size as string) === 'large' ? 'Enterprise' : 'SME',
            employees: (o.employee_count as number) || Math.round(Math.random() * 5000 + 20),
            founded: (o.founded_year as number) || 2010,
            ceo: (o.ceo_name as string) || 'Not disclosed',
            complianceScore: score,
            riskLevel: score >= 80 ? 'low' : score >= 50 ? 'medium' : 'high',
            traderTier: score >= 90 ? 'Gold' : score >= 70 ? 'Silver' : score >= 50 ? 'Bronze' : 'Standard',
            tradeVolume: `$${(Math.random() * 500 + 1).toFixed(1)}M`,
            trades: Math.round(Math.random() * 4000 + 100),
            licenses: Math.round(Math.random() * 10 + 1),
            permitsPending: Math.round(Math.random() * 3),
            contacts: {
              phone: (o.phone as string) || '+000-000-0000',
              email: (o.email as string) || `info@${((o.name as string) || 'company').toLowerCase().replace(/\s/g, '')}.com`,
              website: (o.website as string) || `${((o.name as string) || 'company').toLowerCase().replace(/\s/g, '')}.com`,
            },
            ownership: [{ name: (o.ceo_name as string) || 'Principal Owner', share: 100 }],
            history: [
              { date: new Date().toLocaleDateString(), event: 'Profile updated', type: 'compliance' },
            ],
          };
        }));

        // Update fraud alerts from AML data
        if (amlAlerts.length > 0) {
          FRAUD_ALERTS.length = 0;
          amlAlerts.slice(0, 3).forEach((a: Record<string, unknown>) => {
            FRAUD_ALERTS.push({
              entity: (a.entity_name as string) || 'Unknown Entity',
              alert: (a.flag_reason as string) || 'Alert detected',
              severity: ((a.severity as string) || 'medium').toLowerCase(),
              date: a.detected_at ? new Date(a.detected_at as string).toLocaleDateString() : '',
            });
          });
        }
      } catch (e) {
        console.error('Business registry data fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCompanies = COMPANIES.filter(c => {
    const matchesSearch = searchQuery === '' || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'all' || c.sector === sectorFilter;
    const matchesRisk = riskFilter === 'all' || c.riskLevel === riskFilter;
    const matchesSize = sizeFilter === 'all' || c.type === sizeFilter;
    return matchesSearch && matchesSector && matchesRisk && matchesSize;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Silver': return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'Bronze': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400';
    }
  };

  const tabs = [
    { id: 'directory', label: 'Business Directory', icon: Building },
    { id: 'network', label: 'Entity Network', icon: Network },
    { id: 'performance', label: 'Performance Cards', icon: BarChart3 },
    { id: 'fraud', label: 'Fraud Detection', icon: AlertTriangle },
  ];

  const sectors = [...new Set(COMPANIES.map(c => c.sector))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-trade-accent" />
        <span className="ml-3 text-sm text-gray-500">Loading business registry...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm border-l-4 border-l-trade-accent">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-trade-accent" /> Business Registry
            </h1>
            <p className="text-xs text-gray-500 mt-1">Single source of truth — company profiles, ownership, compliance scores & network intelligence</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-trade-primary text-white rounded-lg text-xs font-bold">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Registered Entities</p>
          <p className="text-xl font-black text-trade-primary dark:text-white">12,375</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Active Traders</p>
          <p className="text-xl font-black text-trade-primary dark:text-white">8,940</p>
          <p className="text-[10px] text-green-500 font-bold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />12%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Avg Compliance</p>
          <p className="text-xl font-black text-trade-primary dark:text-white">76%</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-200 dark:border-red-800">
          <p className="text-[10px] font-bold text-red-500 uppercase">High Risk</p>
          <p className="text-xl font-black text-red-600">142</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-[10px] font-bold text-amber-500 uppercase">Pending Renewals</p>
          <p className="text-xl font-black text-amber-600">89</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-trade-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* TAB: BUSINESS DIRECTORY (CRM-Style) */}
        {activeTab === 'directory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
            {/* Company List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search companies..." className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-xs border-none outline-none" />
                </div>
                <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-slate-700 text-xs p-2 rounded-lg border-none outline-none">
                  <option value="all">All Sectors</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-slate-700 text-xs p-2 rounded-lg border-none outline-none">
                  <option value="all">All Risk</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
                <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-slate-700 text-xs p-2 rounded-lg border-none outline-none">
                  <option value="all">All Sizes</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="SME">SME</option>
                </select>
              </div>

              {/* Company Cards */}
              <div className="space-y-2 max-h-[540px] overflow-y-auto custom-scrollbar">
                {filteredCompanies.map(company => (
                  <div key={company.id} onClick={() => setSelectedCompany(company)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCompany?.id === company.id ? 'bg-trade-primary/5 border-trade-accent' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-trade-primary to-trade-secondary flex items-center justify-center text-white font-bold text-sm">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-xs">{company.name}</p>
                          <p className="text-[10px] text-gray-400">{company.country} &middot; {company.sector} &middot; {company.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`text-sm font-black ${getScoreColor(company.complianceScore)}`}>{company.complianceScore}</p>
                          <p className="text-[9px] text-gray-400">score</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getTierColor(company.traderTier)}`}>{company.traderTier}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                      <span>{company.tradeVolume} volume</span>
                      <span>{company.trades} trades</span>
                      <span>{company.licenses} licenses</span>
                      {company.permitsPending > 0 && <span className="text-amber-500 font-bold">{company.permitsPending} pending</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Detail Panel */}
            <div className="space-y-4">
              {selectedCompany ? (
                <>
                  {/* Profile Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trade-primary to-trade-secondary flex items-center justify-center text-white font-bold text-lg">
                        {selectedCompany.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedCompany.name}</p>
                        <p className="text-[10px] text-gray-400">{selectedCompany.id} &middot; Est. {selectedCompany.founded}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs mb-4">
                      <div className="flex justify-between"><span className="text-gray-500">Country</span><span className="font-bold text-gray-900 dark:text-white flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedCompany.country}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Sector</span><span className="font-bold text-gray-900 dark:text-white">{selectedCompany.sector}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">CEO</span><span className="font-bold text-gray-900 dark:text-white">{selectedCompany.ceo}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Employees</span><span className="font-bold text-gray-900 dark:text-white">{selectedCompany.employees.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Trade Volume</span><span className="font-bold text-gray-900 dark:text-white">{selectedCompany.tradeVolume}</span></div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Compliance</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                            <div className={`h-full rounded-full ${getScoreBg(selectedCompany.complianceScore)}`} style={{ width: `${selectedCompany.complianceScore}%` }}></div>
                          </div>
                          <span className={`font-black ${getScoreColor(selectedCompany.complianceScore)}`}>{selectedCompany.complianceScore}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Tier</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTierColor(selectedCompany.traderTier)}`}>{selectedCompany.traderTier}</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500"><Phone className="w-3 h-3" />{selectedCompany.contacts.phone}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500"><Mail className="w-3 h-3" />{selectedCompany.contacts.email}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500"><Globe className="w-3 h-3" />{selectedCompany.contacts.website}</div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-3 py-2 bg-trade-primary text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" /> Full Profile
                      </button>
                      <button className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-300">Audit</button>
                      <button className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-300">Flag</button>
                    </div>
                  </div>

                  {/* Ownership Structure */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Ownership Structure</h3>
                    <div className="space-y-2">
                      {selectedCompany.ownership.map((o, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <span className="text-xs text-gray-700 dark:text-gray-300">{o.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full">
                              <div className="h-full bg-trade-accent rounded-full" style={{ width: `${o.share}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white w-8 text-right">{o.share}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline History */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Activity Timeline</h3>
                    <div className="space-y-2">
                      {selectedCompany.history.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            h.type === 'violation' ? 'bg-red-500' :
                            h.type === 'compliance' ? 'bg-green-500' :
                            h.type === 'license' ? 'bg-blue-500' :
                            h.type === 'trade' ? 'bg-purple-500' : 'bg-gray-500'
                          }`}></div>
                          <div>
                            <p className="text-xs text-gray-900 dark:text-white">{h.event}</p>
                            <p className="text-[10px] text-gray-400">{h.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center">
                  <Building className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400">Select a company to view details</p>
                  <p className="text-[10px] text-gray-300 mt-1">CRM-style profile with ownership, history & compliance</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ENTITY NETWORK */}
        {activeTab === 'network' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Network className="w-4 h-4 text-purple-500" /> Linked Entity Network Graph
                </h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><div className="w-2 h-5 rounded bg-green-500"></div> Supplier</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-5 rounded bg-blue-500"></div> Buyer</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-5 rounded bg-purple-500"></div> Logistics</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-5 rounded bg-red-500"></div> Suspicious</span>
                </div>
              </div>
              {/* Simplified Network Visualization */}
              <div className="relative h-[400px] bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden p-4">
                <svg viewBox="0 0 600 400" className="w-full h-full">
                  {/* Links */}
                  {NETWORK_LINKS.map((link, i) => {
                    const positions: Record<string, {x: number, y: number}> = {
                      'Dangote Industries': { x: 300, y: 100 },
                      'Bidvest Group': { x: 500, y: 150 },
                      'Atlas Trading Co': { x: 150, y: 250 },
                      'Green Valley Farms': { x: 100, y: 350 },
                      'Shoprite Holdings': { x: 450, y: 300 },
                      'MadaTrade SARL': { x: 500, y: 350 },
                      'Trans-Sahel Logistics': { x: 200, y: 120 },
                      'Nile Valley Imports': { x: 50, y: 180 },
                    };
                    const s = positions[link.source] || { x: 300, y: 200 };
                    const t = positions[link.target] || { x: 300, y: 200 };
                    return (
                      <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                        stroke={link.strength === 'suspicious' ? '#ef4444' : link.type === 'supplier' ? '#10b981' : link.type === 'buyer' ? '#3b82f6' : '#8b5cf6'}
                        strokeWidth={link.strength === 'strong' ? 3 : link.strength === 'suspicious' ? 3 : 1.5}
                        strokeDasharray={link.strength === 'suspicious' ? '6,3' : 'none'}
                        opacity="0.6"
                      />
                    );
                  })}
                  {/* Nodes */}
                  {COMPANIES.map(c => {
                    const positions: Record<string, {x: number, y: number}> = {
                      'Dangote Industries': { x: 300, y: 100 },
                      'Bidvest Group': { x: 500, y: 150 },
                      'Atlas Trading Co': { x: 150, y: 250 },
                      'Green Valley Farms': { x: 100, y: 350 },
                      'Shoprite Holdings': { x: 450, y: 300 },
                      'MadaTrade SARL': { x: 500, y: 350 },
                      'Trans-Sahel Logistics': { x: 200, y: 120 },
                    };
                    const pos = positions[c.name];
                    if (!pos) return null;
                    return (
                      <g key={c.id} className="cursor-pointer" onClick={() => setSelectedCompany(c)}>
                        <circle cx={pos.x} cy={pos.y} r={c.type === 'Enterprise' ? 22 : 16}
                          fill={c.riskLevel === 'high' ? '#fca5a5' : c.riskLevel === 'medium' ? '#fcd34d' : '#86efac'}
                          stroke={c.riskLevel === 'high' ? '#ef4444' : c.riskLevel === 'medium' ? '#f59e0b' : '#10b981'}
                          strokeWidth="2" />
                        <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="text-[8px] font-bold fill-gray-800">
                          {c.name.split(' ')[0]}
                        </text>
                        <text x={pos.x} y={pos.y + 38} textAnchor="middle" className="text-[7px] fill-gray-500">
                          {c.complianceScore}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Network Links Table */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Relationship Details</h3>
              <div className="space-y-2">
                {NETWORK_LINKS.map((link, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${
                    link.strength === 'suspicious' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                    'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
                  }`}>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">{link.source}</span>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <span className="font-bold text-gray-900 dark:text-white">{link.target}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[10px] font-bold capitalize">{link.type.replace('_', ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        link.strength === 'suspicious' ? 'bg-red-600 text-white' :
                        link.strength === 'strong' ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'
                      }`}>{link.strength}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PERFORMANCE SCORECARDS */}
        {activeTab === 'performance' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Entity Performance Scorecards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {COMPANIES.slice(0, 6).map(company => (
                  <div key={company.id} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-trade-primary to-trade-secondary flex items-center justify-center text-white font-bold text-sm">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{company.name}</p>
                        <p className="text-[10px] text-gray-400">{company.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center mb-3">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
                          <circle cx="50" cy="50" r="38" fill="none" strokeWidth="8"
                            stroke={company.complianceScore >= 90 ? '#10b981' : company.complianceScore >= 70 ? '#3b82f6' : company.complianceScore >= 50 ? '#f59e0b' : '#ef4444'}
                            strokeDasharray={`${company.complianceScore * 2.39} ${239 - company.complianceScore * 2.39}`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className={`text-lg font-black ${getScoreColor(company.complianceScore)}`}>{company.complianceScore}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between"><span className="text-gray-400">Trade Volume</span><span className="font-bold text-gray-900 dark:text-white">{company.tradeVolume}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Trades</span><span className="font-bold text-gray-900 dark:text-white">{company.trades.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Tier</span><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getTierColor(company.traderTier)}`}>{company.traderTier}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: FRAUD DETECTION */}
        {activeTab === 'fraud' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Fraud Detection Alerts
                </h3>
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded text-[10px] font-bold">{FRAUD_ALERTS.length} active</span>
              </div>
              <div className="space-y-3">
                {FRAUD_ALERTS.map((alert, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                    'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{alert.entity}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alert.alert}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{alert.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          alert.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                        }`}>{alert.severity}</span>
                        <button className="px-3 py-1.5 bg-trade-primary text-white rounded-lg text-[10px] font-bold">Investigate</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Renewal Alerts */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-blue-600" /> Smart Renewal Alerts
              </h3>
              <div className="space-y-2">
                {[
                  { entity: 'MadaTrade SARL', license: 'Export License', expires: '2025-01-15', daysLeft: 28 },
                  { entity: 'Trans-Sahel Logistics', license: 'Transit Permit', expires: '2025-02-01', daysLeft: 45 },
                  { entity: 'Green Valley Farms', license: 'SPS Certificate', expires: '2024-12-30', daysLeft: 12 },
                ].map((r, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{r.entity}</p>
                      <p className="text-[10px] text-gray-500">{r.license} &middot; Expires: {r.expires}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.daysLeft <= 14 ? 'bg-red-100 text-red-700' : r.daysLeft <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {r.daysLeft} days
                      </span>
                      <button className="px-2 py-1 bg-blue-600 text-white rounded text-[9px] font-bold">Notify</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
