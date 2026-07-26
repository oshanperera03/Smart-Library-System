import { useDashboardData } from '../hooks/useDashboardData';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatCard from '../components/StatCard';
import { formatTimestamp } from '../utils/formatters';

const AdminRfidLogsPage = () => {
  const { rfidLogs, latestRfidLog, loading, errors } = useDashboardData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <TopNav title="RFID Logs" subtitle="Live RFID activity" />

          <div className="space-y-6 p-6">
            <section className="grid gap-4 md:grid-cols-2">
              <StatCard title="Total Logs" value={rfidLogs.length} subtitle="Recent activity" tone="cyan" />
              <StatCard title="Latest" value={latestRfidLog ? formatTimestamp(latestRfidLog.timestamp) : '—'} subtitle="Most recent tap" tone="emerald" />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

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
