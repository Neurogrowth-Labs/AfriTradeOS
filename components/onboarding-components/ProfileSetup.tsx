import React from 'react';
import { Loader2 } from 'lucide-react';
import { AFRICAN_COUNTRIES } from './constants';
import { ProfileData } from './types';

interface ProfileSetupProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  onFinalize: () => void;
  loading: boolean;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({
  profile,
  setProfile,
  onFinalize,
  loading,
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Organization Profile</h2>
        <p className="text-white/50 text-base">Tell us about your business to optimize the OS.</p>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">
              Your Name
            </label>
            <input
              type="text"
              className="w-full h-14 px-4 rounded-[14px]
                       bg-white/[0.03] border border-white/[0.08]
                       text-white placeholder-white/30 text-sm
                       focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                       transition-all duration-200"
              value={profile.userName}
              onChange={e => setProfile({ ...profile, userName: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">
              Company
            </label>
            <input
              type="text"
              className="w-full h-14 px-4 rounded-[14px]
                       bg-white/[0.03] border border-white/[0.08]
                       text-white placeholder-white/30 text-sm
                       focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                       transition-all duration-200"
              value={profile.companyName}
              onChange={e => setProfile({ ...profile, companyName: e.target.value })}
              placeholder="Trading Co. Ltd"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">
            Country of Operation
          </label>
          <select
            className="w-full h-14 px-4 rounded-[14px]
                     bg-white/[0.03] border border-white/[0.08]
                     text-white text-sm
                     focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                     transition-all duration-200 appearance-none cursor-pointer"
            value={profile.country}
            onChange={e => setProfile({ ...profile, country: e.target.value })}
          >
            {AFRICAN_COUNTRIES.map(c => (
              <option key={c} value={c} className="bg-[#0D2A4D] text-white">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">
              Phone
            </label>
            <input
              type="tel"
              className="w-full h-14 px-4 rounded-[14px]
                       bg-white/[0.03] border border-white/[0.08]
                       text-white placeholder-white/30 text-sm
                       focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                       transition-all duration-200"
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+233..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50 mb-2">
              Size
            </label>
            <select
              className="w-full h-14 px-4 rounded-[14px]
                       bg-white/[0.03] border border-white/[0.08]
                       text-white text-sm
                       focus:outline-none focus:border-[#1D4FFF]/50 focus:bg-white/[0.05]
                       transition-all duration-200 appearance-none cursor-pointer"
              value={profile.size}
              onChange={e => setProfile({ ...profile, size: e.target.value })}
            >
              <option className="bg-[#0D2A4D] text-white">Sole Proprietor</option>
              <option className="bg-[#0D2A4D] text-white">SME</option>
              <option className="bg-[#0D2A4D] text-white">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={onFinalize}
        disabled={loading}
        className="w-full h-16 rounded-[18px]
                 bg-gradient-to-r from-[#0F4CFF] to-[#1A6BFF]
                 text-white font-semibold text-base
                 flex items-center justify-center gap-2
                 shadow-[0_14px_40px_rgba(29,79,255,0.35)]
                 hover:scale-[1.02]
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 transition-all duration-200"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Dashboard'}
      </button>
    </div>
  );
};
