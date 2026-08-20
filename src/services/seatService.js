import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const VERIFICATION_WINDOW_MS = 5 * 60 * 1000;

export const reserveSeat = async (seatId, studentId, studentName) => {
  const seatRef = doc(db, 'seats', seatId);
  await updateDoc(seatRef, {
    status: 'reserved',
    studentId,
    studentName,
    verificationExpiresAt: null,
    extensionRequested: false,
  });
};

export const verifySeat = async (seatId, studentId, studentName) => {
  const seatRef = doc(db, 'seats', seatId);
  await updateDoc(seatRef, {
    status: 'verified',
    studentId,
    studentName,
    verifiedAt: serverTimestamp(),
    verificationExpiresAt: new Date(Date.now() + VERIFICATION_WINDOW_MS),
    extensionRequested: false,
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
    fsrValue: 0,
    verifiedAt: null,
    verificationExpiresAt: null,
    extensionRequested: false,
  });
};

export const requestSeatExtension = async (seatId) => {
  const seatRef = doc(db, 'seats', seatId);
  await updateDoc(seatRef, {
    extensionRequested: true,
    extensionRequestedAt: serverTimestamp(),
  });
};

export const extendSeatTime = async (seatId, minutes = 5) => {
  const seatRef = doc(db, 'seats', seatId);
  await updateDoc(seatRef, {
    verificationExpiresAt: new Date(Date.now() + minutes * 60 * 1000),
    extensionRequested: false,
    extensionGrantedAt: serverTimestamp(),
  });
};

export const updateRfidLogStatus = async (logId, status) => {
  const logRef = doc(db, 'rfid_logs', logId);
  await updateDoc(logRef, { processedAt: new Date(), status });
};
