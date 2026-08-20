import { useEffect, useMemo, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { AlertTriangle, CalendarDays, CircleDollarSign, MonitorCheck, Users2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatCard from '../components/StatCard';
import RfidTapModal from '../components/RfidTapModal';
import { formatTimestamp, getSeatDisplayStatus, getStatusClasses, getStatusLabel, getTimestampMillis, isUnauthorizedAlert, normalizeSeatStatus } from '../utils/formatters';
import { setSeatAvailable, verifySeat } from '../services/seatService';
import 'react-toastify/dist/ReactToastify.css';

const DashboardPage = () => {
  const { seats, rfidLogs, latestRfidLog, reservations, loading, errors } = useDashboardData();
  const [showRfidModal, setShowRfidModal] = useState(false);
  const [mismatchDetails, setMismatchDetails] = useState(null);
  const notifiedUnauthorizedSeats = useRef(new Set());

  const unauthorizedSeats = useMemo(
    () => seats.filter((seat) => isUnauthorizedAlert(seat)),
    [seats]
  );

  const stats = useMemo(() => {
    const total = seats.length;
    const available = seats.filter((seat) => normalizeSeatStatus(seat.status) === 'available').length;
    const reserved = seats.filter((seat) => normalizeSeatStatus(seat.status) === 'reserved').length;
    const occupied = seats.filter((seat) => getSeatDisplayStatus(seat) === 'occupied').length;

    return { total, available, reserved, occupied, unauthorized: unauthorizedSeats.length };
  }, [seats, unauthorizedSeats]);

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
    { name: 'Verified', value: seats.filter((seat) => getSeatDisplayStatus(seat) === 'verified').length, color: '#eab308' },
    { name: 'Occupied', value: stats.occupied, color: '#ef4444' },
    { name: 'Unauthorized', value: stats.unauthorized, color: '#b91c1c' },
  ], [seats, stats]);

  useEffect(() => {
    const activeIds = new Set(unauthorizedSeats.map((seat) => seat.id));

    unauthorizedSeats.forEach((seat) => {
      if (!notifiedUnauthorizedSeats.current.has(seat.id)) {
        toast.error(`Unauthorized occupancy detected at ${seat.seatNumber}.`);
        notifiedUnauthorizedSeats.current.add(seat.id);
      }
    });

    notifiedUnauthorizedSeats.current.forEach((seatId) => {
      if (!activeIds.has(seatId)) notifiedUnauthorizedSeats.current.delete(seatId);
    });
  }, [unauthorizedSeats]);

  useEffect(() => {
    const releaseTimers = seats
      .filter((seat) => normalizeSeatStatus(seat.status) === 'verified' && seat.verificationExpiresAt)
      .map((seat) => {
        const remainingMs = getTimestampMillis(seat.verificationExpiresAt) - Date.now();
        return window.setTimeout(() => {
          setSeatAvailable(seat.id).catch(() => {});
        }, Math.max(remainingMs, 0));
      });

    return () => releaseTimers.forEach((timerId) => window.clearTimeout(timerId));
  }, [seats]);

  useEffect(() => {
    if (latestRfidLog) {
      const lastSeenId = sessionStorage.getItem('lastSeenRfidLogId');
      if (latestRfidLog.id !== lastSeenId) {
        sessionStorage.setItem('lastSeenRfidLogId', latestRfidLog.id);
        
        const location = latestRfidLog.readerLocation || '';
        const isEntrance = location.toLowerCase().includes('entrance') || location.trim() === '';
        
        // Check if the tap location matches a seat's seatNumber
        const tappedSeat = seats.find((s) => s.seatNumber === location);

        if (isEntrance) {
          setShowRfidModal(true);
        } else if (tappedSeat) {
          // It's a tap at a specific seat
          const studentReservedSeat = seats.find(
            (s) => normalizeSeatStatus(s.status) === 'reserved' && s.studentId === latestRfidLog.studentId
          );

          if (studentReservedSeat) {
            if (studentReservedSeat.id === tappedSeat.id) {
              verifySeat(tappedSeat.id, latestRfidLog.studentId, latestRfidLog.studentName)
                .then(() => toast.success(`Seat ${tappedSeat.seatNumber} verified successfully.`))
                .catch(() => toast.error('Failed to verify seat.'));
            } else {
              toast.error(`Wrong seat alert: you tapped ${tappedSeat.seatNumber}, but your reserved seat is ${studentReservedSeat.seatNumber}.`);
              setMismatchDetails({
                studentName: latestRfidLog.studentName || 'Unknown',
                studentId: latestRfidLog.studentId || 'Unknown',
                rfidUid: latestRfidLog.rfidUid || 'Unknown',
                readerLocation: latestRfidLog.readerLocation || 'Unknown',
                reservedSeat: {
                  id: studentReservedSeat.id,
                  seatNumber: studentReservedSeat.seatNumber,
                  status: studentReservedSeat.status,
                  studentName: studentReservedSeat.studentName || 'Unknown',
                  studentId: studentReservedSeat.studentId || 'Unknown',
                },
                tappedSeat: {
                  id: tappedSeat.id,
                  seatNumber: tappedSeat.seatNumber,
                  status: tappedSeat.status,
                  studentName: tappedSeat.studentName || 'Unknown',
                  studentId: tappedSeat.studentId || 'Unknown',
                },
              });
            }
          } else {
            toast.info(`Student ${latestRfidLog.studentName} tapped at ${tappedSeat.seatNumber} but has no reserved seat.`);
          }
        } else {
          // If the location is not entrance and not a recognized seat, default to showing modal
          setShowRfidModal(true);
        }
      }
    }
  }, [latestRfidLog, seats]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <TopNav title="Dashboard Overview" subtitle="Live seat and RFID activity from Firestore" />

          <div className="space-y-6 p-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard title="Total Seats" value={stats.total} subtitle="Across the library" icon={MonitorCheck} tone="cyan" />
              <StatCard title="Available Seats" value={stats.available} subtitle="Ready for booking" icon={CircleDollarSign} tone="emerald" />
              <StatCard title="Reserved Seats" value={stats.reserved} subtitle="Pending occupancy" icon={CalendarDays} tone="amber" />
              <StatCard title="Occupied Seats" value={stats.occupied} subtitle="Currently active" icon={Users2} tone="rose" />
              <StatCard title="Unauthorized Alerts" value={stats.unauthorized} subtitle="Active occupancy warnings" icon={AlertTriangle} tone="rose" />
            </section>

            {unauthorizedSeats.length > 0 ? (
              <section className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-700" />
                  <div>
                    <h2 className="text-lg font-semibold text-red-800">Unauthorized Occupancy</h2>
                    <p className="text-sm text-red-700">Active seats detected without a reservation.</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {unauthorizedSeats.map((seat) => (
                    <div key={seat.id} className="rounded-2xl border border-red-200 bg-white p-4">
                      <p className="font-semibold text-red-800">Seat {seat.seatNumber}</p>
                      <p className="mt-1 text-sm text-red-700">{seat.alertMessage || 'Pressure detected at an available seat. Verify the student before assigning it.'}</p>
                      {seat.fsrValue !== undefined ? <p className="mt-2 text-xs text-red-600">FSR value: {seat.fsrValue}</p> : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

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
                      <div key={seat.id} className={`rounded-2xl border p-4 shadow-sm ${getStatusClasses(getSeatDisplayStatus(seat))}`}>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold">{seat.seatNumber}</p>
                          <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                            {getStatusLabel(getSeatDisplayStatus(seat))}
                          </span>
                        </div>
                        <p className="mt-3 text-sm">
                          {isUnauthorizedAlert(seat)
                            ? (seat.alertMessage || 'Someone is sitting without a reservation.')
                            : (seat.studentName || seat.studentId ? `Assigned: ${seat.studentName || seat.studentId}` : 'No student assigned')}
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
      {mismatchDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Seat Mismatch</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-800">RFID mismatch detected</h3>
              </div>
              <button
                onClick={() => setMismatchDetails(null)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-lg font-semibold text-slate-800">Student details</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-medium text-slate-500">Name:</span> {mismatchDetails.studentName}</p>
                  <p><span className="font-medium text-slate-500">Student ID:</span> {mismatchDetails.studentId}</p>
                  <p><span className="font-medium text-slate-500">RFID UID:</span> {mismatchDetails.rfidUid}</p>
                  <p><span className="font-medium text-slate-500">Reader:</span> {mismatchDetails.readerLocation}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-lg font-semibold text-slate-800">Seat details</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-medium text-slate-500">Reserved seat:</span> {mismatchDetails.reservedSeat.seatNumber}</p>
                  <p><span className="font-medium text-slate-500">Reserved student:</span> {mismatchDetails.reservedSeat.studentName}</p>
                  <p><span className="font-medium text-slate-500">Tapped seat:</span> {mismatchDetails.tappedSeat.seatNumber}</p>
                  <p><span className="font-medium text-slate-500">Tapped seat status:</span> {mismatchDetails.tappedSeat.status}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              The card was scanned at the wrong seat. The reserved seat and the tapped seat do not match.
            </div>
          </div>
        </div>
      ) : null}
      {showRfidModal && latestRfidLog ? (
        <RfidTapModal
          rfidLog={latestRfidLog}
          seats={seats}
          onClose={() => setShowRfidModal(false)}
          onAssigned={() => {
            toast.success('Seat assigned successfully!');
            setShowRfidModal(false);
          }}
        />
      ) : null}
    </div>
  );
};

export default DashboardPage;
