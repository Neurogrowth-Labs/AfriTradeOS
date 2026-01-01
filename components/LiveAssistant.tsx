import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Radio, Volume2, Loader2, UserCircle } from 'lucide-react';
import { connectLiveSession, LiveEvent } from '../services/geminiService';
import { UserPersona } from '../types';

export const LiveAssistant: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [transcript, setTranscript] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [persona, setPersona] = useState<UserPersona>(UserPersona.EXPORTER_SME);
  
  const disconnectRef = useRef<(() => Promise<void>) | null>(null);
  const setMuteRef = useRef<((mute: boolean) => void) | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Status helper
  const updateStatus = (text: string) => setStatus(text);

  const handleToggle = async () => {
    if (active) {
      if (disconnectRef.current) {
        await disconnectRef.current();
        disconnectRef.current = null;
        setMuteRef.current = null;
      }
      setActive(false);
      updateStatus('Disconnected');
      setVolume(0);
      setIsMuted(false);
    } else {
      updateStatus('Connecting...');
      const session = await connectLiveSession(
        (event: LiveEvent) => {
          if (event.type === 'user' && event.text) {
             setTranscript(prev => [...prev.slice(-4), { role: 'user', text: event.text! }]);
             updateStatus('Processing audio...');
          }
          if (event.type === 'model' && event.text) {
             setTranscript(prev => [...prev.slice(-4), { role: 'model', text: event.text! }]);
          }
          if (event.type === 'audio' && event.audio && audioContextRef.current) {
             updateStatus('Speaking...');
             
             // Play Audio
             const ctx = audioContextRef.current;
             const source = ctx.createBufferSource();
             source.buffer = event.audio;
             source.connect(ctx.destination);
             
             // Schedule
             const currentTime = ctx.currentTime;
             if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
             }
             
             source.start(nextStartTimeRef.current);
             nextStartTimeRef.current += event.audio.duration;

             source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                    updateStatus('Listening...');
                }
             };
             sourcesRef.current.add(source);
             
             // Fake volume viz
             setVolume(Math.random() * 100);
             setTimeout(() => {
                 if (sourcesRef.current.size === 0) setVolume(0);
             }, event.audio.duration * 1000);
          }
        },
        () => {
          setActive(false);
          updateStatus('Disconnected');
        },
        persona // Pass the selected persona
      );

      if (session) {
        disconnectRef.current = session.disconnect;
        setMuteRef.current = session.setMute;
        audioContextRef.current = session.outputAudioContext;
        setActive(true);
        updateStatus('Listening...');
      } else {
        updateStatus('Connection Failed');
      }
    }
  };

  const toggleMute = () => {
    if (!active || !setMuteRef.current) return;
    const newState = !isMuted;
    setIsMuted(newState);
    setMuteRef.current(newState);
    if (newState) {
        updateStatus('Microphone muted');
        setVolume(0);
    } else {
        updateStatus('Listening...');
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
       if (disconnectRef.current) disconnectRef.current();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10">
        <div className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${active ? 'bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-lg'}`}>
            
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                {/* Visualizer Circle */}
                <div className={`relative mb-8 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-indigo-500/10' : 'bg-gray-100 dark:bg-slate-700'}`}>
                   {active && !isMuted && (
                       <>
                        <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-[ping_2s_ease-in-out_infinite]" />
                        <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-[ping_3s_ease-in-out_infinite_delay-200]" />
                       </>
                   )}
                   <div 
                     className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${active ? (isMuted ? 'bg-slate-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50') : 'bg-gray-200 dark:bg-slate-600'}`}
                     style={{ transform: (active && !isMuted) ? `scale(${1 + volume / 200})` : 'scale(1)' }}
                   >
                        {active ? (
                            isMuted ? <MicOff className="w-10 h-10 text-slate-400" /> : <Radio className="w-10 h-10 text-white animate-pulse" />
                        ) : (
                            <MicOff className="w-10 h-10 text-gray-400 dark:text-gray-300" />
                        )}
                   </div>
                </div>

                <h2 className={`text-2xl font-bold mb-2 ${active ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {active ? 'AfriTrade Assistant' : 'AfriTrade Voice Assistant'}
                </h2>
                
                {/* Persona Selector (Only when inactive) */}
                {!active && (
                  <div className="mb-6 w-full max-w-xs relative animate-fade-in">
                    <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 text-center">Select Your Persona</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select 
                        value={persona}
                        onChange={(e) => setPersona(e.target.value as UserPersona)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-400 outline-none appearance-none cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-800"
                      >
                        {Object.values(UserPersona).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Granular Status Indicator */}
                <div className="h-8 mb-6 flex items-center justify-center">
                    {active && (
                        <span className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                            status === 'Listening...' ? 'bg-indigo-500/20 text-indigo-300' :
                            status === 'Speaking...' ? 'bg-green-500/20 text-green-300' :
                            status === 'Processing audio...' ? 'bg-yellow-500/20 text-yellow-300' :
                            status === 'Microphone muted' ? 'bg-red-500/20 text-red-300' :
                            'bg-slate-700 text-slate-300'
                        }`}>
                            {status === 'Processing audio...' && <Loader2 className="w-3 h-3 animate-spin" />}
                            {status}
                        </span>
                    )}
                    {!active && <p className="text-gray-500 dark:text-gray-400">{status}</p>}
                </div>

                <div className="flex items-center gap-4">
                    {active && (
                        <button
                            onClick={toggleMute}
                            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                    )}

                    <button
                        onClick={handleToggle}
                        className={`px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 ${
                            active 
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                        }`}
                    >
                        {active ? (
                            <>
                                <MicOff className="w-5 h-5" />
                                End Session
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5" />
                                Start Conversation
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Live Transcript Area */}
            <div className={`border-t p-6 ${active ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-700'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <Volume2 className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-gray-400'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${active ? 'text-indigo-400' : 'text-gray-400'}`}>Live Transcript</span>
                </div>
                <div className="space-y-2 h-32 overflow-y-auto custom-scrollbar">
                    {transcript.length === 0 && <p className={`text-sm italic ${active ? 'text-slate-500' : 'text-gray-400 dark:text-gray-500'}`}>Transcript will appear here...</p>}
                    {transcript.map((msg, i) => (
                        <p key={i} className={`text-sm ${msg.role === 'user' ? 'text-slate-500' : (active ? 'text-slate-200' : 'text-gray-800 dark:text-gray-200')}`}>
                            <span className="font-bold opacity-50">{msg.role === 'user' ? 'You' : 'AI'}:</span> {msg.text}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};