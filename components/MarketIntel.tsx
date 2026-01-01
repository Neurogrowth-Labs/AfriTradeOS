import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { getMarketIntelligence } from '../services/geminiService';

export const MarketIntel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await getMarketIntelligence(`Provide a detailed market analysis for: ${query}. Focus on African markets, import/export demand, and recent price trends.`);
      
      const sources: any[] = [];
      data.groundingChunks?.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });

      setResult({
        text: data.text || "No analysis available.",
        sources: sources
      });
    } catch (err) {
      console.error(err);
      setResult({ text: "Error fetching market intelligence. Please try again.", sources: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Market Intelligence Engine</h2>
        </div>
        
        <p className="text-gray-600 mb-8">
          Leverage real-time search grounding to analyze demand, pricing, and opportunities across the continent.
        </p>

        <form onSubmit={handleSearch} className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., Demand for processed cocoa in Egypt vs South Africa..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
          </button>
        </form>

        {result && (
          <div className="space-y-6 animate-fade-in">
            <div className="prose prose-blue max-w-none bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Analysis</h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {result.text}
              </div>
            </div>

            {result.sources.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Verified Sources</h4>
                <div className="grid gap-3">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate">{source.title || source.uri}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};