import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, NotebookPen, Users, Radio, CalendarClock, Settings, Sparkles } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Seats', icon: NotebookPen, to: '/admin/seats' },
  { label: 'Students', icon: Users, to: '/admin/students' },
  { label: 'RFID Logs', icon: Radio, to: '/admin/rfid-logs' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-slate-200 bg-slate-950/95 p-6 text-slate-100 lg:flex">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-500/20 p-2 text-cyan-300">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-semibold">Smart Library</p>
          <p className="text-sm text-slate-400">Seat Reservation Hub</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {navItems.map(({ label, icon: Icon, to }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={label}
              to={to}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-4">
        <p className="text-sm font-semibold text-cyan-200">Esp32 Integration Ready</p>
        <p className="mt-2 text-sm text-slate-300">The dashboard is prepared for live hardware events and seat updates.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
