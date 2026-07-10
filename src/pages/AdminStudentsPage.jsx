import { useMemo, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { setStudentActiveStatus } from '../services/studentService';
import { updateUserProfile } from '../services/authService';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatCard from '../components/StatCard';

const AdminStudentsPage = () => {
  const { seats, students, loading, errors } = useDashboardData();
  const [actionMessage, setActionMessage] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editingRfidId, setEditingRfidId] = useState(null);
  const [rfidValue, setRfidValue] = useState('');

  const stats = useMemo(() => ({
    totalStudents: students.length,
    activeStudents: students.filter((student) => student.active !== false).length,
    inactiveStudents: students.filter((student) => student.active === false).length,
    seatsAssigned: seats.filter((seat) => seat.studentId).length,
  }), [seats, students]);

  const handleToggleActive = async (studentId, active) => {
    setBusyId(studentId);
    setActionMessage('');
    try {
      await setStudentActiveStatus(studentId, active);
      setActionMessage(`Student ${active ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      setActionMessage(err.message || 'Unable to update status.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <TopNav title="Admin Students" subtitle="Manage student accounts and status" />

          <div className="space-y-6 p-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Students" value={stats.totalStudents} subtitle="Total registered users" tone="cyan" />
              <StatCard title="Active" value={stats.activeStudents} subtitle="Enabled accounts" tone="emerald" />
              <StatCard title="Inactive" value={stats.inactiveStudents} subtitle="Disabled accounts" tone="rose" />
              <StatCard title="Seats Assigned" value={stats.seatsAssigned} subtitle="Seats linked to students" tone="amber" />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Student Directory</h2>
                  <p className="text-sm text-slate-500">Manage active status for students and review account details.</p>
                </div>
              </div>

              {actionMessage ? <div className="mb-4 rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-700">{actionMessage}</div> : null}

              {loading.students ? (
                <p className="text-sm text-slate-500">Loading students…</p>
              ) : errors.students ? (
                <p className="text-sm text-rose-500">{errors.students}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="px-3 py-3">Student</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">Student ID</th>
                        <th className="px-3 py-3">RFID</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3"></th>
                        <th className="px-3 py-3">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50">
                            <td className="px-3 py-3 font-semibold text-slate-800">{student.fullName || student.name || 'Unknown'}</td>
                            <td className="px-3 py-3 text-slate-700">{student.email}</td>
                            <td className="px-3 py-3 text-slate-700">{student.studentId || '—'}</td>
                            <td className="px-3 py-3 text-slate-700 font-mono">{student.rfidUid || '—'}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                              student.active === false ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {student.active === false ? 'Inactive' : 'Active'}
                            </span>
                          </td>
                            <td className="px-3 py-3">
                              {editingRfidId === student.id ? (
                                <div className="flex items-center gap-2">
                                  <input value={rfidValue} onChange={(e) => setRfidValue(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm" placeholder="RFID UID" />
                                  <button
                                    onClick={async () => {
                                      setBusyId(student.id);
                                      setActionMessage('');
                                      try {
                                        await updateUserProfile(student.id, { rfidUid: rfidValue || null });
                                        setActionMessage('RFID assigned.');
                                        setEditingRfidId(null);
                                        setRfidValue('');
                                      } catch (err) {
                                        setActionMessage(err.message || 'Unable to assign RFID.');
                                      } finally {
                                        setBusyId(null);
                                      }
                                    }}
                                    disabled={busyId === student.id}
                                    className="rounded-2xl bg-cyan-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                  <button onClick={() => { setEditingRfidId(null); setRfidValue(''); }} className="rounded-2xl border border-slate-200 px-2 py-1 text-sm">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => { setEditingRfidId(student.id); setRfidValue(student.rfidUid || ''); setActionMessage(''); }}
                                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                                  >
                                    Assign RFID
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                disabled={busyId === student.id}
                                onClick={() => handleToggleActive(student.id, student.active === false)}
                                className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                                  student.active === false
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-rose-600 text-white hover:bg-rose-700'
                                } disabled:opacity-50`}
                              >
                                {student.active === false ? 'Activate' : 'Deactivate'}
                              </button>
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

export default AdminStudentsPage;
