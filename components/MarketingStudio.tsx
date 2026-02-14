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
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
             { name: 'Product Brochure', icon: FileText, desc: 'A4 print-ready', color: 'bg-blue-100 text-blue-600', prompt: 'Professional product brochure layout for African export goods, clean design with product images and specifications' },
             { name: 'Social Media Post', icon: Share2, desc: 'Instagram/Facebook', color: 'bg-pink-100 text-pink-600', prompt: 'Vibrant social media post showcasing African products, modern design with bold colors and engaging visuals' },
             { name: 'Product Catalog', icon: ImageIcon, desc: 'Multi-page PDF', color: 'bg-purple-100 text-purple-600', prompt: 'Product catalog page with multiple items, grid layout, professional photography style' },
             { name: 'Email Campaign', icon: Mail, desc: 'Newsletter template', color: 'bg-green-100 text-green-600', prompt: 'Email newsletter header image for African trade products, professional and inviting' },
           ].map(tpl => (
             <button 
               key={tpl.name} 
               onClick={() => {
                 setSelectedTemplate(tpl.name);
                 setPrompt(tpl.prompt);
               }}
               className={`p-4 rounded-xl border transition-all text-left group ${
                 selectedTemplate === tpl.name 
                   ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-md' 
                   : 'border-gray-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-md'
               }`}
             >
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
           <button 
             onClick={() => setShowAnalytics(true)}
             className="w-full py-2 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg text-xs font-bold transition-colors"
           >
             View Full Analytics Dashboard
           </button>
         </div>
       </div>

       {/* Analytics Modal */}
       {showAnalytics && (
         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
             <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-pink-500" /> Marketing Analytics Dashboard
               </h3>
               <button onClick={() => setShowAnalytics(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                 <span className="text-gray-500 text-xl">&times;</span>
               </button>
             </div>
             <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: 'Total Views', value: '12,438', change: '+18%', color: 'text-blue-600' },
                   { label: 'Engagement Rate', value: '24.8%', change: '+5.2%', color: 'text-green-600' },
                   { label: 'Conversions', value: '142', change: '+9%', color: 'text-purple-600' },
                   { label: 'Revenue Impact', value: '$8,420', change: '+12%', color: 'text-pink-600' },
                 ].map(stat => (
                   <div key={stat.label} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                     <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                     <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                     <span className="text-[10px] font-bold text-green-600">{stat.change}</span>
                   </div>
                 ))}
               </div>

               <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                 <h4 className="font-bold text-gray-800 dark:text-white mb-3">Top Performing Assets</h4>
                 <div className="space-y-2">
                   {[
                     { name: 'Shea Butter Product Shot', views: '3,245', engagement: '32%' },
                     { name: 'Cocoa Export Brochure', views: '2,891', engagement: '28%' },
                     { name: 'Coffee Beans Social Post', views: '2,456', engagement: '25%' },
                   ].map((asset, idx) => (
                     <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                       <div className="flex items-center gap-3">
                         <span className="w-6 h-6 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-xs font-bold text-pink-600">{idx + 1}</span>
                         <span className="text-sm font-medium text-gray-800 dark:text-white">{asset.name}</span>
                       </div>
                       <div className="flex items-center gap-4 text-xs text-gray-500">
                         <span><Eye className="w-3 h-3 inline mr-1" />{asset.views}</span>
                         <span><MousePointer className="w-3 h-3 inline mr-1" />{asset.engagement}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                   <h4 className="font-bold text-gray-800 dark:text-white mb-2">Top Markets</h4>
                   <div className="space-y-2">
                     {['Nigeria (34%)', 'Kenya (22%)', 'Ghana (18%)', 'South Africa (15%)'].map(market => (
                       <div key={market} className="text-sm text-gray-600 dark:text-gray-400">{market}</div>
                     ))}
                   </div>
                 </div>
                 <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                   <h4 className="font-bold text-gray-800 dark:text-white mb-2">Content Types</h4>
                   <div className="space-y-2">
                     {['Product Images (45%)', 'Social Posts (30%)', 'Brochures (15%)', 'Email Headers (10%)'].map(type => (
                       <div key={type} className="text-sm text-gray-600 dark:text-gray-400">{type}</div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};