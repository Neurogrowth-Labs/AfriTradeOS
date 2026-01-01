import React, { useState } from 'react';
import { Image as ImageIcon, Download, Sparkles, Loader2, PlayCircle } from 'lucide-react';
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
    </div>
  );
};