import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { UserPersona } from '../../types';
import { ROLES } from './constants';

interface RoleSelectProps {
  selectedRole: UserPersona | null;
  setSelectedRole: (role: UserPersona) => void;
  onNext: () => void;
  loading: boolean;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({
  selectedRole,
  setSelectedRole,
  onNext,
  loading,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Select Account Type</h2>
        <p className="text-white/50 text-base">
          Your role determines tools, permissions, and insights.
        </p>
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
        {ROLES.map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedRole(r.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
              selectedRole === r.id
                ? 'border-[#E8B547]/50 bg-[#E8B547]/10 shadow-[0_0_30px_rgba(232,181,71,0.15)]'
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div
              className={`p-3 rounded-xl ${selectedRole === r.id ? 'bg-[#E8B547] text-[#071126]' : 'bg-white/10 text-white/60'}`}
            >
              <r.icon className="w-5 h-5" />
            </div>
            <div>
              <h3
                className={`text-base font-semibold ${selectedRole === r.id ? 'text-[#E8B547]' : 'text-white'}`}
              >
                {r.label}
              </h3>
              <p className="text-sm text-white/50">{r.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selectedRole || loading}
        className="w-full h-16 rounded-[18px]
                 bg-gradient-to-r from-[#0F4CFF] to-[#1A6BFF]
                 text-white font-semibold text-base
                 flex items-center justify-center gap-2
                 shadow-[0_14px_40px_rgba(29,79,255,0.35)]
                 hover:scale-[1.02]
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 transition-all duration-200"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Continue <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
};
