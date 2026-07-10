import { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { updateRfidLogStatus } from '../services/seatService';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatCard from '../components/StatCard';
import { formatTimestamp } from '../utils/formatters';

const AdminRfidLogsPage = () => {
  const { rfidLogs, latestRfidLog, loading, errors } = useDashboardData();
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  const handleMarkProcessed = async (log) => {
    setBusyId(log.id);
    setMessage('');
    try {
      await updateRfidLogStatus(log.id, 'processed');
      setMessage('Log marked processed.');
    } catch (err) {
      setMessage(err.message || 'Unable to update log.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <TopNav title="RFID Logs" subtitle="Live RFID activity and processing" />

          <div className="space-y-6 p-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Total Logs" value={rfidLogs.length} subtitle="Recent activity" tone="cyan" />
              <StatCard title="Latest" value={latestRfidLog ? formatTimestamp(latestRfidLog.timestamp) : '—'} subtitle="Most recent tap" tone="emerald" />
              <StatCard title="Unprocessed" value={rfidLogs.filter(l => l.status !== 'processed').length} subtitle="Needs attention" tone="amber" />
              <StatCard title="Processed" value={rfidLogs.filter(l => l.status === 'processed').length} subtitle="Handled logs" tone="rose" />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {message ? <div className="mb-4 rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-700">{message}</div> : null}

              {loading.rfidLogs ? (
                <p className="text-sm text-slate-500">Loading RFID logs…</p>
              ) : errors.rfidLogs ? (
                <p className="text-sm text-rose-500">{errors.rfidLogs}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="px-3 py-3">Time</th>
                        <th className="px-3 py-3">Student Name</th>
                        <th className="px-3 py-3">Student ID</th>
                        <th className="px-3 py-3">RFID UID</th>
                        <th className="px-3 py-3">Reader Location</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rfidLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 text-slate-600">{formatTimestamp(log.timestamp)}</td>
                          <td className="px-3 py-3 text-slate-700">{log.studentName || 'Unknown'}</td>
                          <td className="px-3 py-3 text-slate-700">{log.studentId || '—'}</td>
                          <td className="px-3 py-3 text-slate-700 font-mono">{log.rfidUid || '—'}</td>
                          <td className="px-3 py-3 text-slate-700">{log.readerLocation || '—'}</td>
                          <td className="px-3 py-3 text-slate-700">{log.status || 'active'}</td>
                          <td className="px-3 py-3">
                            {log.status !== 'processed' ? (
                              <button
                                onClick={() => handleMarkProcessed(log)}
                                disabled={busyId === log.id}
                                className="rounded-2xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
                              >
                                Mark Processed
                              </button>
                            ) : (
                              <span className="text-slate-500">—</span>
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

export default AdminRfidLogsPage;
