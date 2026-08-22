import { Bell, Search, Menu } from 'lucide-react';

const TopNav = ({ title, subtitle }) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => document.dispatchEvent(new Event('toggle-sidebar'))}
          className="lg:hidden rounded-lg p-2 -ml-2 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.3em] text-cyan-600">Operations Center</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">{title}</h1>
          <p className="hidden sm:block text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
