import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  Settings, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Clock, 
  PlayCircle, 
  PauseCircle,
  Activity,
  Lock,
  Download
} from 'lucide-react';
import { mockDatabase } from '../services/mockDatabase';
import { DbKYCRequest, DbAMLAlert, DbAuditLog } from '../types';

type AdminTab = 'overview' | 'kyc' | 'aml' | 'logs';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [kycRequests, setKycRequests] = useState<DbKYCRequest[]>([]);
  const [amlAlerts, setAmlAlerts] = useState<DbAMLAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<DbAuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [kyc, aml, logs] = await Promise.all([
        mockDatabase.getKYCRequests(),
        mockDatabase.getAMLAlerts(),
        mockDatabase.getAuditLogs()
      ]);
      setKycRequests(kyc);
      setAmlAlerts(aml);
      setAuditLogs(logs);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleKYCAction = (id: string, action: 'Approved' | 'Rejected') => {
    setKycRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
  };

  const handleAMLAction = (id: string, action: 'Investigating' | 'Resolved') => {
    setAmlAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, status: action } : alert));
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-white">Platform Administration</h1>
          <p className="text-sm text-gray-500">System Oversight & Risk Management</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold">
             <Settings className="w-4 h-4" /> Config
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-trade-primary text-white rounded-lg text-sm font-bold">
             <Download className="w-4 h-4" /> Report
           </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'kyc', label: 'KYC / KYB Queue', icon: Users },
          { id: 'aml', label: 'Risk & AML', icon: ShieldAlert },
          { id: 'logs', label: 'Audit Logs', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-trade-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 overflow-y-auto min-h-0">
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                   <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Pending KYC</p>
                   <p className="text-3xl font-black text-trade-primary dark:text-white mt-1">{kycRequests.filter(r => r.status === 'Pending').length}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                   <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Active AML Alerts</p>
                   <p className="text-3xl font-black text-trade-primary dark:text-white mt-1">{amlAlerts.filter(a => a.status === 'Open').length}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                   <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Suspended Trades</p>
                   <p className="text-3xl font-black text-trade-primary dark:text-white mt-1">2</p>
                </div>
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                   <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">System Health</p>
                   <p className="text-xl font-bold text-trade-primary dark:text-white mt-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div> Nominal
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Risk Heatmap Placeholder */}
                 <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Risk Heatmap</h3>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                        <p>Interactive Visualization Component</p>
                    </div>
                 </div>
                 
                 {/* Recent Logs */}
                 <div className="p-0 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 font-bold">Recent System Activity</div>
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                        {auditLogs.slice(0, 5).map(log => (
                          <div key={log.id} className="p-3 flex items-center justify-between text-sm">
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-gray-900 dark:text-white">{log.action}</span>
                             </div>
                             <span className="text-gray-500 text-xs font-mono">{log.timestamp.split(' ')[1]}</span>
                          </div>
                        ))}
                    </div>
                 </div>
             </div>
          </div>
        )}

        {/* TAB: KYC QUEUE */}
        {activeTab === 'kyc' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Verification Queue</h2>
              <div className="flex gap-2">
                 <button className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg"><Filter className="w-4 h-4" /></button>
                 <button className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg"><Search className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-medium border-b border-gray-200 dark:border-slate-700">
                     <tr>
                        <th className="p-4">Entity</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Country</th>
                        <th className="p-4">Risk Level</th>
                        <th className="p-4">Docs</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                     {kycRequests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                           <td className="p-4 font-bold text-gray-900 dark:text-white">
                              {req.entity_name}
                              <span className="block text-xs text-gray-500 font-normal">{req.id}</span>
                           </td>
                           <td className="p-4">{req.entity_type}</td>
                           <td className="p-4">{req.country}</td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                 req.risk_level === 'Low' ? 'bg-green-100 text-green-700' : 
                                 req.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                              }`}>
                                 {req.risk_level}
                              </span>
                           </td>
                           <td className="p-4 text-blue-600 hover:underline cursor-pointer">{req.document_type}</td>
                           <td className="p-4">
                              <span className={`flex items-center gap-1 font-medium ${
                                 req.status === 'Approved' ? 'text-green-600' :
                                 req.status === 'Rejected' ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                 {req.status === 'Pending' && <Clock className="w-3 h-3" />}
                                 {req.status}
                              </span>
                           </td>
                           <td className="p-4 text-right">
                              {req.status === 'Pending' && (
                                <div className="flex justify-end gap-2">
                                   <button 
                                      onClick={() => handleKYCAction(req.id, 'Approved')}
                                      className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200" title="Approve">
                                      <CheckCircle className="w-4 h-4" />
                                   </button>
                                   <button 
                                      onClick={() => handleKYCAction(req.id, 'Rejected')}
                                      className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200" title="Reject">
                                      <XCircle className="w-4 h-4" />
                                   </button>
                                   <button className="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 border border-gray-200" title="View Details">
                                      <Eye className="w-4 h-4" />
                                   </button>
                                </div>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* TAB: AML ALERTS */}
        {activeTab === 'aml' && (
           <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Monitoring</h2>
                <button className="text-sm text-red-600 font-bold hover:underline flex items-center gap-1">
                   <PauseCircle className="w-4 h-4" /> Global Trade Pause
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {amlAlerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-xl border flex items-center justify-between ${
                        alert.severity === 'Critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                    }`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${alert.severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                               <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                  {alert.flag_reason}
                                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                                      alert.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                                  }`}>{alert.severity}</span>
                               </h4>
                               <p className="text-sm text-gray-500 mt-1">Trade ID: <span className="font-mono text-gray-700 dark:text-gray-300">{alert.trade_id}</span> • Detected: {alert.detected_at}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${alert.status === 'Open' ? 'text-red-600' : 'text-green-600'}`}>
                               {alert.status.toUpperCase()}
                            </span>
                            {alert.status === 'Open' && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleAMLAction(alert.id, 'Investigating')}
                                        className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-bold hover:bg-gray-50 text-gray-700"
                                    >
                                        Investigate
                                    </button>
                                    <button className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 shadow-sm flex items-center gap-1">
                                        <PauseCircle className="w-3 h-3" /> Freeze Trade
                                    </button>
                                </div>
                            )}
                            {alert.status === 'Investigating' && (
                                 <button 
                                    onClick={() => handleAMLAction(alert.id, 'Resolved')}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 shadow-sm"
                                >
                                    Resolve
                                </button>
                            )}
                        </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* TAB: AUDIT LOGS */}
        {activeTab === 'logs' && (
           <div className="space-y-4 animate-fade-in">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">System Audit Trail</h2>
               <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                   <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-medium">
                           <tr>
                               <th className="p-4">Timestamp</th>
                               <th className="p-4">Action</th>
                               <th className="p-4">User</th>
                               <th className="p-4">IP Address</th>
                               <th className="p-4">Status</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                           {auditLogs.map(log => (
                               <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                   <td className="p-4 font-mono text-xs text-gray-500">{log.timestamp}</td>
                                   <td className="p-4 font-bold text-gray-900 dark:text-white">{log.action}</td>
                                   <td className="p-4">{log.user}</td>
                                   <td className="p-4 font-mono text-xs">{log.ip}</td>
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
           </div>
        )}

      </div>
    </div>
  );
};