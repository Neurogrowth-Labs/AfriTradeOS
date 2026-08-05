import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface OnboardingContainerProps {
  children: React.ReactNode;
  errorMsg: string | null;
  loading: boolean;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
  errorMsg,
  loading,
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#020617] via-[#071126] to-[#0a1628] flex items-center justify-center p-4 md:p-6">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1D4FFF]/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E8B547]/6 rounded-full blur-[120px] pointer-events-none" />

      <div
        className="relative w-full max-w-xl rounded-[28px] overflow-hidden
                    bg-gradient-to-br from-[#071B34]/95 to-[#0D2A4D]/90
                    border border-white/[0.08]
                    shadow-[0_0_60px_rgba(29,79,255,0.12)]
                    backdrop-blur-xl p-8 md:p-10"
      >
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {children}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[#071126]/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-[28px]">
            <Loader2 className="w-10 h-10 text-[#1D4FFF] animate-spin" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};
