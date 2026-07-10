import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const reserveSeat = async (seatId, studentId, studentName) => {
  const seatRef = doc(db, 'seats', seatId);
  await updateDoc(seatRef, {
    status: 'reserved',
    studentId,
    studentName,
  });
};

export const occupySeat = async (seatId, studentId, studentName) => {
  const seatRef = doc(db, 'seats', seatId);
  await updateDoc(seatRef, {
    status: 'occupied',
    studentId,
    studentName,
  });
};

export const findAvailableSeat = async (seats) => {
  return seats.find((seat) => seat.status === 'available');
};

export const setSeatAvailable = async (seatId) => {
  const seatRef = doc(db, 'seats', seatId);
  await updateDoc(seatRef, {
    status: 'available',
    studentId: '',
    studentName: '',
  });
};

export const updateRfidLogStatus = async (logId, status) => {
  const logRef = doc(db, 'rfid_logs', logId);
  await updateDoc(logRef, { processedAt: new Date(), status });
};
