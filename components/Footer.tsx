import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const linkClass =
    'hover:text-trade-accent transition-colors cursor-pointer';

  return (
    <footer className="w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-t divider-soft py-4 px-6 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center text-xs text-trade-primary dark:text-gray-400 gap-4">
        <div className="flex gap-4 sm:gap-6 font-semibold">
          <span onClick={() => navigate('/dashboard')} className={linkClass}>
            About Us
          </span>
          <span onClick={() => navigate('/dashboard')} className={linkClass}>
            Our Services
          </span>
          <span onClick={() => navigate('/marketplace')} className={linkClass}>
            Our Partners
          </span>
        </div>
        <div className="flex gap-4 sm:gap-6 font-semibold">
          <span onClick={() => navigate('/privacy')} className={linkClass}>
            Privacy Policy
          </span>
          <span onClick={() => navigate('/terms')} className={linkClass}>
            Terms of Service
          </span>
        </div>
        <div className="type-caption opacity-80 font-medium">
          &copy; {new Date().getFullYear()} AfriTradeOS. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
