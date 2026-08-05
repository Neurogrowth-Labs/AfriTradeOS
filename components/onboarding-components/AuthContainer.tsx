import React from 'react';
import { User, ShieldCheck, TrendingUp, Lock } from 'lucide-react';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full z-[100] flex">
      {/* LEFT PANEL - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden bg-gradient-to-br from-[#020617] via-[#071126] to-[#0a1628]">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071126]/95 via-[#071126]/80 to-[#0a1628]/90" />

        {/* Ambient Light Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1D4FFF]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E8B547]/8 rounded-full blur-[120px] pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full p-10 lg:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E8B547] to-[#D4A43A] flex items-center justify-center shadow-lg shadow-[#E8B547]/25">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#071126]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">AfriTradeOS</span>
          </div>

          {/* Hero Content - Centered */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            {/* Quote/Tagline */}
            <blockquote className="mb-8">
              <p className="text-2xl lg:text-3xl font-light text-white/90 leading-relaxed italic">
                "Unlock seamless cross-border trade across Africa with intelligent compliance and
                real-time logistics."
              </p>
            </blockquote>

            {/* Stats Row */}
            <div className="flex items-center gap-6 mb-10">
              {/* Trust Avatars */}
              <div className="flex -space-x-3">
                {[
                  'bg-gradient-to-br from-[#E8B547] to-[#D4A43A]',
                  'bg-gradient-to-br from-[#1D4FFF] to-[#3D6FFF]',
                  'bg-gradient-to-br from-[#10B981] to-[#059669]',
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${bg} border-2 border-[#071126] flex items-center justify-center`}
                  >
                    <User className="w-5 h-5 text-white/90" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-semibold">
                  Trusted by <span className="text-[#E8B547]">5,000+</span> businesses
                </p>
                <p className="text-white/50 text-sm">across 54 African nations</p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, text: 'AfCFTA Compliant' },
                { icon: TrendingUp, text: 'Real-time Analytics' },
                { icon: Lock, text: 'Bank-grade Security' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full
                           bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <item.icon className="w-4 h-4 text-[#E8B547]" />
                  <span className="text-sm text-white/80 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 flex items-center justify-between text-sm text-white/40">
            <p>© 2026 AfriTradeOS. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-white/60 transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-white/60 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Auth Forms */}
      <div className="w-full lg:w-1/2 relative flex flex-col bg-[#030712] min-h-screen">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 p-6 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8B547] to-[#D4A43A] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#071126]" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">AfriTradeOS</span>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 max-w-lg mx-auto w-full">
          {children}
        </div>

        {/* Footer for mobile */}
        <div className="lg:hidden mt-auto pt-8 pb-6 px-6 sm:px-12 text-center text-sm text-white/40">
          <div className="flex items-center justify-center gap-4 mb-2">
            <a href="/privacy" className="hover:text-white/60 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-white/60 transition-colors">
              Terms
            </a>
          </div>
          <p>© 2026 AfriTradeOS. All rights reserved.</p>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
