import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const toSeatSortKey = (seat) => {
  const rawSeatNumber = seat.seatNumber ?? seat.seatNo ?? seat.seat_number ?? seat.number ?? seat.name ?? seat.id;
  const seatLabel = String(rawSeatNumber ?? '').trim();
  const numericValue = Number(seatLabel.replace(/[^0-9]/g, ''));

  return {
    seatLabel,
    numericValue: Number.isFinite(numericValue) ? numericValue : Number.POSITIVE_INFINITY,
  };
};

const normalizeSeat = (seat) => {
  const { seatLabel } = toSeatSortKey(seat);
  return {
    ...seat,
    seatNumber: seatLabel || seat.id,
    status: seat.status || 'available',
  };
};

const sortSeats = (seats) => (
  [...seats].sort((a, b) => {
    const aKey = toSeatSortKey(a);
    const bKey = toSeatSortKey(b);

    if (aKey.numericValue !== bKey.numericValue) {
      return aKey.numericValue - bKey.numericValue;
    }

    return aKey.seatLabel.localeCompare(bKey.seatLabel, undefined, { numeric: true, sensitivity: 'base' });
  })
);

export const subscribeToSeats = (callback, onError) => {
  const q = query(collection(db, 'seats'));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs
        .map((doc) => normalizeSeat({ id: doc.id, ...doc.data() }));
      callback(sortSeats(data));
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

// Look up a student in 'users' collection by their rfidUid field
const lookupStudentByRfidUid = async (rfidUid) => {
  if (!rfidUid) return null;
  const q = query(
    collection(db, 'users'),
    where('rfidUid', '==', rfidUid),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const userDoc = snapshot.docs[0];
  return { uid: userDoc.id, ...userDoc.data() };
};

const normalizeRfidLog = (log) => {
  const rawReaderLocation = log.readerLocation
    ?? log.reader_location
    ?? log.location
    ?? log.reader
    ?? log.readerName
    ?? log.reader_name
    ?? '';

  const readerLocation = String(rawReaderLocation ?? '').trim();

  return {
    ...log,
    readerLocation,
  };
};

const enrichRfidLog = async (logDoc) => {
  const logData = normalizeRfidLog({ id: logDoc.id, ...logDoc.data() });

  if (logData.studentName && logData.studentId) {
    return logData;
  }

  try {
    const student = await lookupStudentByRfidUid(logData.rfidUid);

    if (student) {
      const studentName = student.fullName || student.displayName || student.name || 'Unknown';
      const studentId = student.studentId || student.uid || null;

      return {
        ...logData,
        studentName,
        studentId,
      };
    }

    return {
      ...logData,
      studentName: 'Unregistered Card',
      studentId: null,
    };
  } catch (err) {
    return {
      ...logData,
      studentName: logData.studentName || 'Unknown',
      studentId: logData.studentId || null,
    };
  }
};

export const subscribeToLatestRfidLog = (callback, onError) => {
  const q = query(collection(db, 'rfid_logs'), orderBy('timestamp', 'desc'), limit(1));
  let latestRequestId = 0;

  return onSnapshot(
    q,
    async (snapshot) => {
      const requestId = ++latestRequestId;
      const logDoc = snapshot.docs[0];
      if (!logDoc) {
        if (requestId === latestRequestId) {
          callback(null);
        }
        return;
      }

      const enrichedLog = await enrichRfidLog(logDoc);
      if (requestId !== latestRequestId) {
        return;
      }

      callback(enrichedLog);
    },
    (error) => onError?.(error)
  );
};

export const subscribeToRfidLogs = (callback, onError) => {
  const q = query(collection(db, 'rfid_logs'), orderBy('timestamp', 'desc'), limit(20));
  let latestRequestId = 0;

  return onSnapshot(
    q,
    async (snapshot) => {
      const requestId = ++latestRequestId;

      try {
        const data = await Promise.all(snapshot.docs.map((logDoc) => enrichRfidLog(logDoc)));
        if (requestId !== latestRequestId) {
          return;
        }
        callback(data);
      } catch (error) {
        if (requestId !== latestRequestId) {
          return;
        }
        onError?.(error);
      }
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
