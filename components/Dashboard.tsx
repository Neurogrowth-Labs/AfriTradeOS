import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowUpRight, ShieldCheck, Truck, Users, Activity } from 'lucide-react';
import { fastChatResponse } from '../services/geminiService';

const mockData = [
  { name: 'Jan', volume: 4000, compliance: 2400 },
  { name: 'Feb', volume: 3000, compliance: 1398 },
  { name: 'Mar', volume: 2000, compliance: 9800 },
  { name: 'Apr', volume: 2780, compliance: 3908 },
  { name: 'May', volume: 1890, compliance: 4800 },
  { name: 'Jun', volume: 2390, compliance: 3800 },
];

const mockCorridors = [
  { name: 'Lagos-Accra', volume: 85, efficiency: 90 },
  { name: 'Nairobi-Kampala', volume: 92, efficiency: 75 },
  { name: 'Cairo-Khartoum', volume: 60, efficiency: 50 },
  { name: 'Joburg-Maputo', volume: 78, efficiency: 82 },
];

export const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState("Loading AI trade insights...");

  useEffect(() => {
    // Generate a quick daily insight using the fast Lite model
    const fetchInsight = async () => {
      try {
        const text = await fastChatResponse("Give me a 1-sentence strategic insight about intra-African trade opportunities today.");
        setInsight(text);
      } catch (e) {
        setInsight("System operational. AI Insights offline.");
      }
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Trade Volume', value: '$4.2M', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Compliance Rate', value: '98.5%', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Active Shipments', value: '142', icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'SME Partners', value: '1,204', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-xl text-white shadow-lg flex items-start gap-4">
        <div className="p-2 bg-white/10 rounded-lg">
          <Activity className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">Daily AI Trade Briefing</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Cross-Border Transaction Flow</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip />
                <Area type="monotone" dataKey="volume" stroke="#2563eb" fillOpacity={1} fill="url(#colorVol)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Priority Corridors</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCorridors} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fill: '#475569', fontSize: 12}} />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={20} name="Volume %" />
                <Bar dataKey="efficiency" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={20} name="Efficiency Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};