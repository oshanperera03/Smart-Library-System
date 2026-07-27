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

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="hidden sm:flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <Search className="h-4 w-4" />
          <input className="bg-transparent outline-none" placeholder="Search dashboard" />
        </label>
        <button type="button" className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50">
          <Search className="h-5 w-5 sm:hidden" />
          <Bell className="hidden sm:block h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
