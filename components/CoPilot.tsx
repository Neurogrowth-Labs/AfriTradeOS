import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  Sparkles, 
  Keyboard, 
  ChevronRight,
  Maximize2,
  Minimize2,
  Zap,
  HelpCircle
} from 'lucide-react';
import { fastChatResponse } from '../services/geminiService';

interface CoPilotProps {
  currentView: string;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  isExplanation?: boolean;
}

export const CoPilot: React.FC<CoPilotProps> = ({ currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Hello! I'm your Trade Co-Pilot. I see you're in the ${currentView} module. How can I assist you today?` }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Listen for global open/explain events
  useEffect(() => {
    const handleTrigger = (e: CustomEvent) => {
      if (!isOpen) setIsOpen(true);
      if (isMinimized) setIsMinimized(false);
      
      const text = e.detail?.message;
      if (text) {
        handleSend(text, true);
      }
    };

    window.addEventListener('open-copilot' as any, handleTrigger);
    
    // Keyboard Shortcut: Ctrl/Cmd + K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-copilot' as any, handleTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isMinimized]);

  const handleSend = async (text: string = input, isSystemTrigger = false) => {
    if (!text.trim() && !isSystemTrigger) return;
    
    const newMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fastChatResponse(text, currentView);
      setMessages(prev => [...prev, { role: 'ai', text: response || "I'm having trouble connecting right now." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Service temporarily unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-trade-primary hover:bg-trade-secondary text-white rounded-full shadow-xl shadow-trade-primary/30 transition-all transform hover:scale-105 z-50 group flex items-center gap-2"
        aria-label="Open AI Co-Pilot"
      >
        <Sparkles className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold">
          Co-Pilot (Cmd+K)
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed right-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-2xl transition-all duration-300 z-50 flex flex-col overflow-hidden ${
        isMinimized 
        ? 'bottom-6 w-72 h-14 rounded-full cursor-pointer' 
        : 'bottom-6 w-[90vw] md:w-96 h-[600px] max-h-[80vh] rounded-2xl'
      }`}
    >
      {/* Header */}
      <div 
        className="bg-trade-primary p-4 flex items-center justify-between text-white shrink-0 cursor-pointer"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-trade-accent" />
          <h3 className="font-bold font-heading">Trade Co-Pilot</h3>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950 font-sans">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-trade-secondary text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                   {msg.role === 'ai' && <Zap className="w-3 h-3 text-trade-accent mb-1" />}
                   {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-slate-700 flex gap-1">
                  <div className="w-2 h-2 bg-trade-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-trade-primary rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-trade-primary rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>

          {/* Contextual Suggestions (Module-Aware) */}
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700">
             <div className="flex gap-2 overflow-x-auto custom-scrollbar mb-2">
               {((): string[] => {
                 const moduleMap: Record<string, string[]> = {
                   'Dashboard': ['Summarize my KPIs', 'Show trade opportunities', 'Export performance report'],
                   'Trade Lifecycle': ['Check compliance status', 'Draft commercial invoice', 'Estimate shipping cost'],
                   'Trade Finance': ['Compare financing options', 'Calculate duties for my trade', 'Draft L/C application'],
                   'Logistics': ['Optimize my route', 'Track shipment delays', 'Pre-fill customs form'],
                   'Market Intelligence': ['Analyze market trends', 'Find emerging markets', 'Compare AfCFTA tariffs'],
                   'Marketplace': ['Find matching partners', 'Draft RFQ message', 'Verify partner KYC'],
                   'Compliance': ['Check my compliance gaps', 'Explain AfCFTA rules of origin', 'Draft certificate of origin'],
                   'Contracts': ['Review contract risks', 'Draft trade contract', 'Check AfCFTA compliance'],
                 };
                 return moduleMap[currentView] || ['Explain this view', 'Summarize risks', 'Draft a document'];
               })().map(s => (
                 <button 
                   key={s}
                   onClick={() => handleSend(s)}
                   className="whitespace-nowrap px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-trade-primary/5 dark:hover:bg-trade-primary/20 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-full transition-colors border border-transparent hover:border-trade-primary/20"
                 >
                   {s}
                 </button>
               ))}
             </div>
             {/* Document Drafting Quick Actions */}
             <div className="flex gap-1.5">
               {[
                 { label: 'Invoice', action: 'Draft a commercial invoice for my latest trade' },
                 { label: 'Contract', action: 'Generate a standard trade contract template' },
                 { label: 'Letter', action: 'Draft a formal trade inquiry letter' },
               ].map(doc => (
                 <button
                   key={doc.label}
                   onClick={() => handleSend(doc.action)}
                   className="flex items-center gap-1 px-2 py-1 bg-trade-primary/5 dark:bg-trade-primary/10 hover:bg-trade-primary/10 dark:hover:bg-trade-primary/20 text-[10px] font-bold text-trade-primary rounded-lg transition-colors"
                 >
                   <HelpCircle className="w-2.5 h-2.5" />
                   {doc.label}
                 </button>
               ))}
             </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Co-Pilot..."
              className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-trade-primary/20"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-trade-primary hover:bg-trade-secondary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};