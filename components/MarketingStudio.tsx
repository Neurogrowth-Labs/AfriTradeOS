import React, { useState } from 'react';
import { Image as ImageIcon, Download, Sparkles, Loader2, PlayCircle, FileText, Mail, Share2, BarChart3, TrendingUp, Eye, MousePointer, Zap } from 'lucide-react';
import { generateMarketingImage, generateSpeech } from '../services/geminiService';
import { decodeAudioData, decode } from '../services/audioUtils';

export const MarketingStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [descAudio, setDescAudio] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setImage(null);
    try {
      const b64 = await generateMarketingImage(prompt, aspectRatio);
      if (b64) setImage(b64);
      else alert("No image generated.");
    } catch (e) {
      alert("Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  const playDescription = async () => {
    if (!prompt) return;
    setDescAudio(true);
    let ctx: AudioContext | null = null;
    try {
        const audioB64 = await generateSpeech(`Here is a concept for: ${prompt}`);
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await decodeAudioData(decode(audioB64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
        source.onended = () => {
            ctx?.close();
        };
    } catch(e) {
        console.error(e);
        ctx?.close();
    } finally {
        setDescAudio(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <ImageIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Studio</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate professional product shots with Gemini 3 Pro</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Description</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A luxury jar of artisanal Shea Butter on a rustic wooden table with soft sunlight, 4k resolution..."
                        className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-900 outline-none"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aspect Ratio</label>
                    <select 
                        value={aspectRatio} 
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white"
                    >
                        {['1:1', '3:4', '4:3', '16:9', '9:16'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt}
                        className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        Generate Asset
                    </button>
                    <button 
                        onClick={playDescription}
                        disabled={!prompt || descAudio}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg"
                        title="Read prompt with TTS"
                    >
                        {descAudio ? <Loader2 className="animate-spin w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center min-h-[300px] overflow-hidden relative group">
                {image ? (
                    <>
                        <img src={image} alt="Generated" className="w-full h-full object-contain" />
                        <a 
                            href={image} 
                            download="marketing-asset.png"
                            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                            <Download className="w-5 h-5 text-gray-700" />
                        </a>
                    </>
                ) : (
                    <div className="text-center p-8">
                        <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 dark:text-gray-500">Preview Area</p>
                    </div>
                )}
            </div>
         </div>
       </div>

       {/* Marketing Templates */}
       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <FileText className="w-5 h-5 text-pink-500" />
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Templates</h3>
           </div>
           <span className="text-xs text-gray-500">Quick start with pre-built designs</span>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { name: 'Product Brochure', icon: FileText, desc: 'A4 print-ready', color: 'bg-blue-100 text-blue-600' },
             { name: 'Social Media Post', icon: Share2, desc: 'Instagram/Facebook', color: 'bg-pink-100 text-pink-600' },
             { name: 'Product Catalog', icon: ImageIcon, desc: 'Multi-page PDF', color: 'bg-purple-100 text-purple-600' },
             { name: 'Email Campaign', icon: Mail, desc: 'Newsletter template', color: 'bg-green-100 text-green-600' },
           ].map(tpl => (
             <button key={tpl.name} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-md transition-all text-left group">
               <div className={`p-2.5 rounded-lg ${tpl.color} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                 <tpl.icon className="w-5 h-5" />
               </div>
               <p className="text-sm font-bold text-gray-900 dark:text-white">{tpl.name}</p>
               <p className="text-[10px] text-gray-500 mt-0.5">{tpl.desc}</p>
             </button>
           ))}
         </div>
       </div>

       {/* AI Content Suggestions & Analytics */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* AI Content Suggestions */}
         <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-6 rounded-xl text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8" />
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-3">
               <Zap className="w-5 h-5" />
               <h3 className="font-bold">AI Content Suggestions</h3>
             </div>
             <p className="text-sm opacity-90 mb-4">Based on your target markets in West Africa, here are content ideas:</p>
             <div className="space-y-2">
               {[
                 'Highlight AfCFTA duty-free benefits in product descriptions',
                 'Create "Made in Africa" brand story for Shea Butter line',
                 'Design infographic comparing local vs import prices',
               ].map((suggestion, idx) => (
                 <div key={idx} className="flex items-start gap-2 bg-white/10 rounded-lg p-2.5 backdrop-blur-sm">
                   <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                   <p className="text-xs leading-relaxed">{suggestion}</p>
                 </div>
               ))}
             </div>
           </div>
         </div>

         {/* Campaign Analytics */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
           <div className="flex items-center gap-2 mb-4">
             <BarChart3 className="w-5 h-5 text-pink-500" />
             <h3 className="font-bold text-gray-900 dark:text-white">Campaign Analytics</h3>
           </div>
           <div className="grid grid-cols-2 gap-4 mb-4">
             {[
               { label: 'Total Views', value: '12.4K', change: '+18%', icon: Eye },
               { label: 'Engagement', value: '3.2K', change: '+24%', icon: MousePointer },
               { label: 'Conversions', value: '142', change: '+9%', icon: TrendingUp },
               { label: 'Assets Created', value: '28', change: '+5', icon: ImageIcon },
             ].map(stat => (
               <div key={stat.label} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                 <div className="flex items-center justify-between mb-1">
                   <stat.icon className="w-3.5 h-3.5 text-gray-400" />
                   <span className="text-[10px] font-bold text-green-600">{stat.change}</span>
                 </div>
                 <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                 <p className="text-[10px] text-gray-500">{stat.label}</p>
               </div>
             ))}
           </div>
           <button className="w-full py-2 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg text-xs font-bold transition-colors">
             View Full Analytics Dashboard
           </button>
         </div>
       </div>
    </div>
  );
};