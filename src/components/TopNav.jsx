import { Bell, Search } from 'lucide-react';

const TopNav = ({ title, subtitle }) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-600">Operations Center</p>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <Search className="h-4 w-4" />
          <input className="bg-transparent outline-none" placeholder="Search dashboard" />
        </label>
        <button type="button" className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
