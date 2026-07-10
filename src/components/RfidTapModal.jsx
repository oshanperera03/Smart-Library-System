import { useState } from 'react';
import { X } from 'lucide-react';
import { occupySeat, reserveSeat, findAvailableSeat } from '../services/seatService';
import { formatTimestamp } from '../utils/formatters';

const parseSeatNumber = (location) => {
  if (!location) return null;
  const normalized = location.toLowerCase();
  const seatMatch = normalized.match(/\b([a-zA-Z]?\d{1,2})\b/);
  return seatMatch ? seatMatch[1].toUpperCase() : null;
};

const isEntranceLocation = (location) => {
  if (!location) return false;
  return location.toLowerCase().includes('entrance');
};

const RfidTapModal = ({ rfidLog, seats, onClose, onAssigned }) => {
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableSeats = seats.filter((seat) => seat.status === 'available');

  const reservedSeat = seats.find(
    (seat) => seat.status === 'reserved' && seat.studentId === rfidLog.studentId
  );

  const currentSeatNumber = parseSeatNumber(rfidLog.readerLocation);
  const currentLocationIsEntrance = isEntranceLocation(rfidLog.readerLocation);
  const currentSeat = seats.find((seat) => seat.seatNumber === currentSeatNumber);

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
    setLoading(true);
    setError('');

    try {
      const autoSeat = await findAvailableSeat(seats);
      if (!autoSeat) {
        setError('No available seats found.');
        setLoading(false);
        return;
      }

      await reserveSeat(autoSeat.id, rfidLog.studentId, rfidLog.studentName);
      onAssigned?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to auto-reserve seat.');
    } finally {
      setLoading(false);
    }
  };

  const handleOccupy = async () => {
    if (!currentSeat) {
      setError('Unable to detect seat location from this reader.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (currentSeat.status === 'reserved' && currentSeat.studentId === rfidLog.studentId) {
        await occupySeat(currentSeat.id, rfidLog.studentId, rfidLog.studentName);
        onAssigned?.();
        onClose();
        return;
      }

      if (reservedSeat) {
        if (currentSeat.seatNumber !== reservedSeat.seatNumber) {
          setError(`This card has a reservation for ${reservedSeat.seatNumber}. Please sit in the reserved seat.`);
        } else {
          setError('This seat cannot be occupied right now.');
        }
      } else if (currentSeat.status === 'reserved') {
        setError('This seat is reserved by another student.');
      } else {
        setError('No reservation found for this student.');
      }
    } catch (err) {
      setError(err.message || 'Failed to occupy seat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl">
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

        <div className="space-y-6 px-6 py-6">
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
              <div>
                <p className="text-xs font-medium text-slate-500">RFID UID</p>
                <p className="text-sm text-slate-600 font-mono">{rfidLog.rfidUid || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Reader Location</p>
                <p className="text-sm text-slate-600">{rfidLog.readerLocation || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Time</p>
                <p className="text-sm text-slate-600">{formatTimestamp(rfidLog.timestamp)}</p>
              </div>
              {reservedSeat ? (
                <div className="rounded-2xl bg-cyan-50 px-3 py-3 text-sm text-cyan-700">
                  Reserved seat: {reservedSeat.seatNumber}
                </div>
              ) : null}
            </div>
          </div>

          {currentLocationIsEntrance ? (
            <div className="space-y-3">
              <label className="block">
                <p className="mb-2 text-sm font-semibold text-slate-700">Select a Seat</p>
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
          ) : (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Seat location detected</p>
              <p className="text-sm text-slate-600">Seat: {currentSeatNumber || 'Unknown'}</p>
              <button
                onClick={handleOccupy}
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Occupancy'}
              </button>
              {error ? <p className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
            </div>
          )}
        </div>

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
