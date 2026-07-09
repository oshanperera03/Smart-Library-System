import { useEffect, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { CalendarDays, CircleDollarSign, MonitorCheck, Users2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatCard from '../components/StatCard';
import { formatTimestamp, getStatusClasses, getStatusLabel } from '../utils/formatters';
import 'react-toastify/dist/ReactToastify.css';

const DashboardPage = () => {
  const { seats, rfidLogs, latestRfidLog, reservations, loading, errors } = useDashboardData();

  const stats = useMemo(() => {
    const total = seats.length;
    const available = seats.filter((seat) => seat.status === 'available').length;
    const reserved = seats.filter((seat) => seat.status === 'reserved').length;
    const occupied = seats.filter((seat) => seat.status === 'occupied').length;

    return { total, available, reserved, occupied };
  }, [seats]);

  const reservationSeries = useMemo(() => {
    const counts = reservations.reduce((acc, reservation) => {
      const day = reservation?.day || reservation?.date || reservation?.timestamp?.toDate?.()?.toLocaleDateString?.() || 'Unknown';
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reservations]);

  const seatChartData = useMemo(() => [
    { name: 'Available', value: stats.available, color: '#10b981' },
    { name: 'Reserved', value: stats.reserved, color: '#f59e0b' },
    { name: 'Occupied', value: stats.occupied, color: '#ef4444' },
  ], [stats]);

  useEffect(() => {
    if (!latestRfidLog) return;

    const seatLabel = latestRfidLog.seatNumber || latestRfidLog.seat || 'Unknown';
    toast.success(`RFID Card Detected\nStudent: ${latestRfidLog.studentName || latestRfidLog.studentId || 'Unknown'}\nSeat: ${seatLabel}\nTime: ${formatTimestamp(latestRfidLog.timestamp)}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, [latestRfidLog]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <TopNav title="Dashboard Overview" subtitle="Live seat and RFID activity from Firestore" />

          <div className="space-y-6 p-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Total Seats" value={stats.total} subtitle="Across the library" icon={MonitorCheck} tone="cyan" />
              <StatCard title="Available Seats" value={stats.available} subtitle="Ready for booking" icon={CircleDollarSign} tone="emerald" />
              <StatCard title="Reserved Seats" value={stats.reserved} subtitle="Pending occupancy" icon={CalendarDays} tone="amber" />
              <StatCard title="Occupied Seats" value={stats.occupied} subtitle="Currently active" icon={Users2} tone="rose" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Seat Layout</h2>
                    <p className="text-sm text-slate-500">Live seat state updates from Firestore</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {loading.seats ? (
                    <p className="text-sm text-slate-500">Loading seats…</p>
                  ) : errors.seats ? (
                    <p className="text-sm text-rose-500">{errors.seats}</p>
                  ) : (
                    seats.map((seat) => (
                      <div key={seat.id} className={`rounded-2xl border p-4 shadow-sm ${getStatusClasses(seat.status)}`}>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold">{seat.seatNumber}</p>
                          <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                            {getStatusLabel(seat.status)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm">
                          {seat.studentName || seat.studentId ? `Assigned: ${seat.studentName || seat.studentId}` : 'No student assigned'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">Latest RFID Tap</h2>
                <p className="mt-1 text-sm text-slate-500">Newest event from the library readers</p>
                {loading.rfidLogs ? (
                  <p className="mt-6 text-sm text-slate-500">Loading latest activity…</p>
                ) : errors.rfidLogs ? (
                  <p className="mt-6 text-sm text-rose-500">{errors.rfidLogs}</p>
                ) : latestRfidLog ? (
                  <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Student Name</p>
                      <p className="text-lg font-semibold text-slate-800">{latestRfidLog.studentName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Student ID</p>
                      <p className="text-lg font-semibold text-slate-800">{latestRfidLog.studentId || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">RFID UID</p>
                      <p className="text-lg font-semibold text-slate-800">{latestRfidLog.rfidUid || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Timestamp</p>
                      <p className="text-sm text-slate-700">{formatTimestamp(latestRfidLog.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Reader Location</p>
                      <p className="text-sm text-slate-700">{latestRfidLog.readerLocation || 'Unknown'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">No RFID activity yet.</p>
                )}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">Seat Distribution</h2>
                <p className="mt-1 text-sm text-slate-500">Current seat status at a glance</p>
                <div className="mt-6 flex justify-center">
                  <div className="h-64 w-full max-w-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={seatChartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                          {seatChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">Reservations by Day</h2>
                <p className="mt-1 text-sm text-slate-500">Auto-updating trend from Firestore</p>
                <div className="mt-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reservationSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Recent RFID Logs</h2>
                  <p className="text-sm text-slate-500">Newest scans appear as they are recorded</p>
                </div>
              </div>
              {loading.rfidLogs ? (
                <p className="text-sm text-slate-500">Loading log table…</p>
              ) : errors.rfidLogs ? (
                <p className="text-sm text-rose-500">{errors.rfidLogs}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Student Name</th>
                        <th className="px-3 py-2">Student ID</th>
                        <th className="px-3 py-2">RFID UID</th>
                        <th className="px-3 py-2">Reader Location</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rfidLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 text-slate-600">{formatTimestamp(log.timestamp)}</td>
                          <td className="px-3 py-3 text-slate-700">{log.studentName || 'Unknown'}</td>
                          <td className="px-3 py-3 text-slate-700">{log.studentId || 'Unknown'}</td>
                          <td className="px-3 py-3 text-slate-700">{log.rfidUid || 'Unknown'}</td>
                          <td className="px-3 py-3 text-slate-700">{log.readerLocation || 'Unknown'}</td>
                          <td className="px-3 py-3">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {log.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DashboardPage;
