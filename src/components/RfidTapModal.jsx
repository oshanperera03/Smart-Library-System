import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { reserveSeat, findAvailableSeat } from '../services/seatService';
import { normalizeSeatStatus } from '../utils/formatters';

const AUTO_ASSIGN_DELAY_MS = 10000;

const RfidTapModal = ({ rfidLog, seats, onClose, onAssigned }) => {
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(10);

  const availableSeats = seats.filter((seat) => normalizeSeatStatus(seat.status) === 'available');

  const reservedSeat = seats.find(
    (seat) => normalizeSeatStatus(seat.status) === 'reserved' && seat.studentId === rfidLog.studentId
  );

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    const autoAssignTimeout = setTimeout(() => {
      if (!loading) {
        handleAutoReserve();
      }
    }, AUTO_ASSIGN_DELAY_MS);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(autoAssignTimeout);
    };
  }, []);

  const handleReserve = async () => {
    if (!selectedSeatId) {
      setError('Please select a seat.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reserveSeat(selectedSeatId, rfidLog.studentId, rfidLog.studentName);
      onAssigned?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reserve seat.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoReserve = async () => {
    const seatIdToUse = selectedSeatId || (await findAvailableSeat(seats))?.id;

    if (!seatIdToUse) {
      setError('No available seats found.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reserveSeat(seatIdToUse, rfidLog.studentId, rfidLog.studentName);
      onAssigned?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to auto-reserve seat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">RFID Card Detected</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          {/* Student details card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Student Details</h3>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-500">Name</p>
                <p className="text-lg font-semibold text-slate-800">{rfidLog.studentName || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Student ID</p>
                <p className="text-lg font-semibold text-slate-800">{rfidLog.studentId || 'Unknown'}</p>
              </div>
              {reservedSeat ? (
                <div className="rounded-2xl bg-cyan-50 px-3 py-3 text-sm text-cyan-700">
                  Already has a reservation: <span className="font-semibold">{reservedSeat.seatNumber}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Reserve Seat section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <span>Auto-assignment in {countdown}s if no seat is assigned.</span>
            </div>
            <p className="text-sm font-semibold text-slate-700">Reserve a Seat</p>
            <label className="block">
              <select
                value={selectedSeatId}
                onChange={(e) => setSelectedSeatId(e.target.value)}
                disabled={loading || availableSeats.length === 0}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500 disabled:opacity-50"
              >
                <option value="">Choose a seat ({availableSeats.length} available)</option>
                {availableSeats.map((seat) => (
                  <option key={seat.id} value={seat.id}>
                    {seat.seatNumber}
                  </option>
                ))}
              </select>
            </label>

            {error ? <p className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}

            <div className="flex gap-3">
              <button
                onClick={handleReserve}
                disabled={loading || !selectedSeatId}
                className="flex-1 rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
              >
                {loading ? 'Reserving...' : 'Reserve Selected Seat'}
              </button>
              <button
                onClick={handleAutoReserve}
                disabled={loading || availableSeats.length === 0}
                className="flex-1 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:opacity-50"
              >
                {loading ? 'Reserving...' : 'Auto-Reserve'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RfidTapModal;
