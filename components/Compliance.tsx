import React, { useState } from 'react';
import { Scale, FileCheck, BrainCircuit, Loader2 } from 'lucide-react';
import { analyzeCompliance } from '../services/geminiService';

export const Compliance: React.FC = () => {
  const [scenario, setScenario] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [thinking, setThinking] = useState(false);

  const handleAnalyze = async () => {
    if (!scenario.trim()) return;
    setThinking(true);
    setAnalysis('');
    try {
      const result = await analyzeCompliance(scenario);
      setAnalysis(result || "Could not generate analysis.");
    } catch (e) {
      setAnalysis("Error analyzing compliance scenario. The thinking model may be busy.");
    } finally {
      setThinking(false);
    }
  };

  const prefill = (text: string) => setScenario(text);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AfCFTA Compliance AI</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Gemini 3 Pro (Thinking Mode)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button onClick={() => prefill("I am exporting cotton shirts from Benin to Nigeria. The cotton is 40% sourced from India, 60% from Benin. Buttons are from China. Does this qualify for duty-free access under Rules of Origin?")} className="text-left p-4 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm text-gray-600 dark:text-gray-300">
            <strong>Example 1:</strong> Textiles Rules of Origin (Benin -> Nigeria)
          </button>
          <button onClick={() => prefill("Exporting processed mango juice from Ghana to Kenya. Preservatives (5% value) imported from EU. Packaging made in Ghana. Is Certificate of Origin required?")} className="text-left p-4 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm text-gray-600 dark:text-gray-300">
            <strong>Example 2:</strong> Agro-processing Value Add (Ghana -> Kenya)
          </button>
        </div>

        <textarea
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="Describe your trade scenario including origin, destination, HS codes (if known), and component sourcing..."
          className="w-full h-40 p-4 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none resize-none mb-4"
        />

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={thinking || !scenario}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {thinking ? (
              <>
                <BrainCircuit className="w-5 h-5 animate-pulse" />
                <span>Deep Thinking...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5" />
                <span>Analyze Compliance</span>
              </>
            )}
          </button>
        </div>

        {thinking && (
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 animate-pulse flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">Analyzing regulatory frameworks...</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Consulting AfCFTA Protocols on Trade in Goods</p>
          </div>
        )}

        {analysis && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              Legal Opinion
            </h3>
            <div className="prose prose-indigo dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-6 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm">
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {analysis}
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400 italic text-center">
              Disclaimer: AI analysis is for informational purposes only and does not constitute binding legal advice. Consult national customs authorities for final rulings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};