import { useMemo, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { reserveSeat, occupySeat, setSeatAvailable } from '../services/seatService';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatCard from '../components/StatCard';
import { getStatusClasses } from '../utils/formatters';

const AdminSeatsPage = () => {
  const { seats, students, loading, errors } = useDashboardData();
  const [assignments, setAssignments] = useState({});
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [busySeat, setBusySeat] = useState(null);

  const stats = useMemo(() => {
    const total = seats.length;
    const available = seats.filter((seat) => seat.status === 'available').length;
    const reserved = seats.filter((seat) => seat.status === 'reserved').length;
    const occupied = seats.filter((seat) => seat.status === 'occupied').length;
    return { total, available, reserved, occupied };
  }, [seats]);

  const availableStudents = students.filter((student) => student.active !== false);

  const handleSelectStudent = (seatId, studentId) => {
    setAssignments((prev) => ({ ...prev, [seatId]: studentId }));
  };

  const performAction = async (seat, action) => {
    setActionError('');
    setActionSuccess('');
    setBusySeat(seat.id);

    try {
      if (action === 'reserve') {
        const studentId = assignments[seat.id];
        if (!studentId) {
          throw new Error('Choose a student before reserving.');
        }
        const student = students.find((entry) => entry.id === studentId);
        await reserveSeat(seat.id, student.studentId || student.id, student.fullName || student.name);
        setActionSuccess(`Seat ${seat.seatNumber} reserved for ${student.fullName}.`);
      }

      if (action === 'occupy') {
        const studentId = seat.studentId || assignments[seat.id];
        const studentName = seat.studentName || 'Assigned student';
        await occupySeat(seat.id, studentId, studentName);
        setActionSuccess(`Seat ${seat.seatNumber} is now occupied.`);
      }

      if (action === 'release') {
        await setSeatAvailable(seat.id);
        setActionSuccess(`Seat ${seat.seatNumber} is now available.`);
      }
    } catch (err) {
      setActionError(err.message || 'Action failed.');
    } finally {
      setBusySeat(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <TopNav title="Admin Seats" subtitle="Manage seat reservations and occupancy" />

          <div className="space-y-6 p-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Total Seats" value={stats.total} subtitle="All configured seats" tone="cyan" />
              <StatCard title="Available" value={stats.available} subtitle="Seats ready to reserve" tone="emerald" />
              <StatCard title="Reserved" value={stats.reserved} subtitle="Reserved for students" tone="amber" />
              <StatCard title="Occupied" value={stats.occupied} subtitle="Currently in use" tone="rose" />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Seats Management</h2>
                  <p className="text-sm text-slate-500">View and update seat assignments in real time.</p>
                </div>
              </div>

              {actionError ? <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div> : null}
              {actionSuccess ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionSuccess}</div> : null}

              {loading.seats ? (
                <p className="text-sm text-slate-500">Loading seats…</p>
              ) : errors.seats ? (
                <p className="text-sm text-rose-500">{errors.seats}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="px-3 py-3">Seat</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Assigned Student</th>
                        <th className="px-3 py-3">Action</th>
                        <th className="px-3 py-3">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {seats.map((seat) => (
                        <tr key={seat.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 font-semibold text-slate-800">{seat.seatNumber}</td>
                          <td className="px-3 py-3">
                            <span className={`${getStatusClasses(seat.status)} inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]`}>
                              {seat.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-700">{seat.studentName || '—'}</td>
                          <td className="px-3 py-3">
                            {seat.status === 'available' ? (
                              <select
                                value={assignments[seat.id] || ''}
                                onChange={(e) => handleSelectStudent(seat.id, e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
                              >
                                <option value="">Assign student</option>
                                {availableStudents.map((student) => (
                                  <option key={student.id} value={student.id}>
                                    {student.fullName} ({student.studentId || student.id})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-slate-500">{seat.studentId || 'No ID'}</span>
                            )}
                          </td>
                          <td className="px-3 py-3 space-y-2">
                            {seat.status === 'available' ? (
                              <button
                                type="button"
                                disabled={busySeat === seat.id}
                                onClick={() => performAction(seat, 'reserve')}
                                className="w-full rounded-2xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
                              >
                                Reserve
                              </button>
                            ) : seat.status === 'reserved' ? (
                              <button
                                type="button"
                                disabled={busySeat === seat.id}
                                onClick={() => performAction(seat, 'occupy')}
                                className="w-full rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Occupy
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busySeat === seat.id}
                                onClick={() => performAction(seat, 'release')}
                                className="w-full rounded-2xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
                              >
                                Release
                              </button>
                            )}
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
    </div>
  );
};

export default AdminSeatsPage;
