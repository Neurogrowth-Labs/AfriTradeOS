import React, { useState } from 'react';
import { MapPin, Navigation, Truck, Loader2, ExternalLink } from 'lucide-react';
import { getLogisticsInfo } from '../services/geminiService';

export const Logistics: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; maps: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  // Hardcoded for demo, normally from navigator.geolocation
  const userLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await getLogisticsInfo(query, userLocation);
      
      const mapSources: any[] = [];
      data.groundingChunks?.forEach((chunk: any) => {
        if (chunk.maps?.uri) {
            mapSources.push({
            title: chunk.maps.title,
            uri: chunk.maps.uri,
            address: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]?.text // Attempt to grab snippet or address
          });
        }
      });

      setResult({
        text: data.text || "No logistics data found.",
        maps: mapSources
      });
    } catch (err) {
      console.error(err);
      setResult({ text: "Error fetching logistics data.", maps: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Truck className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Logistics Pathfinder</h2>
        </div>
        
        <p className="text-gray-600 mb-8">
          Find bonded warehouses, freight forwarders, and optimal routes using Google Maps real-time data.
        </p>

        <form onSubmit={handleSearch} className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., Bonded warehouses near Mombasa port..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-gray-900"
          />
          <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find'}
          </button>
        </form>

        {result && (
          <div className="space-y-6">
            <div className="prose prose-teal max-w-none bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {result.text}
              </div>
            </div>

            {result.maps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Map Locations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.maps.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-400 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <MapPin className="w-5 h-5 text-teal-500" />
                        <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-teal-500" />
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-1 truncate">{source.title || "Location"}</h5>
                      {source.address && <p className="text-sm text-gray-500 line-clamp-2">{source.address}</p>}
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