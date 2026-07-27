import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { CalendarDays, CircleDollarSign, MonitorCheck, Users2, LogOut, User, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import { getStatusClasses, getStatusLabel } from '../utils/formatters';

const StudentHomePage = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { seats, loading, errors } = useDashboardData();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = useMemo(() => {
    const total = seats.length;
    const available = seats.filter((seat) => seat.status === 'available').length;
    const reserved = seats.filter((seat) => seat.status === 'reserved').length;
    const occupied = seats.filter((seat) => seat.status === 'occupied').length;

    return { total, available, reserved, occupied };
  }, [seats]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Student Portal</p>
              <h1 className="mt-2 text-xl sm:text-3xl font-semibold text-slate-800">Welcome, {userProfile?.fullName || 'Student'}</h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-500">View real-time library seat availability.</p>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 transition hover:bg-slate-200"
              >
                <User className="h-5 w-5" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-lg z-10">
                  <div className="px-4 py-3 text-sm text-slate-800 border-b border-slate-100 mb-1">
                    <p className="font-semibold truncate">{userProfile?.fullName || 'Student'}</p>
                    <p className="text-xs text-slate-500 truncate">{userProfile?.email || 'Student ID: ' + (userProfile?.studentId || 'N/A')}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/student/profile')}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button 
                    onClick={() => navigate('/student/activity')}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <Activity className="h-4 w-4" />
                    My Activity
                  </button>
                  <div className="my-1 border-t border-slate-100"></div>
                  <button 
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Seats" value={stats.total} subtitle="Across the library" icon={MonitorCheck} tone="cyan" />
          <StatCard title="Available" value={stats.available} subtitle="Ready for booking" icon={CircleDollarSign} tone="emerald" />
          <StatCard title="Reserved" value={stats.reserved} subtitle="Pending occupancy" icon={CalendarDays} tone="amber" />
          <StatCard title="Occupied" value={stats.occupied} subtitle="Currently active" icon={Users2} tone="rose" />
        </section>

        {/* Seat Layout Section */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Live Seat Layout</h2>
            <p className="text-xs sm:text-sm text-slate-500">Current availability of seats in the library</p>
          </div>
          
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {loading.seats ? (
              <p className="col-span-full text-center text-sm text-slate-500 py-10">Loading seat map…</p>
            ) : errors.seats ? (
              <p className="col-span-full text-center text-sm text-rose-500 py-10">{errors.seats}</p>
            ) : seats.length === 0 ? (
              <p className="col-span-full text-center text-sm text-slate-500 py-10">No seats found.</p>
            ) : (
              seats.map((seat) => (
                <div key={seat.id} className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-transform hover:-translate-y-1 flex flex-col items-center justify-center gap-2 sm:gap-3 text-center min-h-[100px] sm:min-h-[120px] ${getStatusClasses(seat.status)}`}>
                  <p className="text-xl sm:text-2xl font-bold">{seat.seatNumber}</p>
                  <span className="rounded-full bg-white/80 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    {getStatusLabel(seat.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default StudentHomePage;
