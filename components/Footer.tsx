import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-t divider-soft py-4 px-6 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center text-xs text-trade-primary dark:text-gray-400 gap-4">
        <div className="flex gap-4 sm:gap-6 font-semibold">
          <a href="#" className="hover:text-trade-accent transition-colors">About Us</a>
          <a href="#" className="hover:text-trade-accent transition-colors">Our Services</a>
          <a href="#" className="hover:text-trade-accent transition-colors">Our Partners</a>
        </div>
        <div className="flex gap-4 sm:gap-6 font-semibold">
          <a href="#" className="hover:text-trade-accent transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-trade-accent transition-colors">Service Policy</a>
        </div>
        <div className="type-caption opacity-80 font-medium">
          &copy; {new Date().getFullYear()} AfriTradeOS. All rights reserved.
        </div>
      </div>
    </footer>
  );
};