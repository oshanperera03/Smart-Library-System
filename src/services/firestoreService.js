import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const subscribeToSeats = (callback, onError) => {
  const q = query(collection(db, 'seats'), orderBy('seatNumber'));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => onError?.(error)
  );
};

export const subscribeToStudents = (callback, onError) => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'student'),
    orderBy('fullName')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => onError?.(error)
  );
};

export const subscribeToRfidLogs = (callback, onError) => {
  const q = query(collection(db, 'rfid_logs'), orderBy('timestamp', 'desc'), limit(20));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => onError?.(error)
  );
};

export const subscribeToLatestRfidLog = (callback, onError) => {
  const q = query(collection(db, 'rfid_logs'), orderBy('timestamp', 'desc'), limit(1));
  return onSnapshot(
    q,
    (snapshot) => {
      const doc = snapshot.docs[0];
      callback(doc ? { id: doc.id, ...doc.data() } : null);
    },
    (error) => onError?.(error)
  );
};

export const subscribeToReservations = (callback, onError) => {
  const q = query(collection(db, 'reservations'), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => onError?.(error)
  );
};
