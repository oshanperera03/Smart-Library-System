import { collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc, where } from 'firebase/firestore';
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

export const subscribeToLatestRfidLog = (callback, onError) => {
  const q = query(collection(db, 'rfid_logs'), orderBy('timestamp', 'desc'), limit(1));
  return onSnapshot(
    q,
    async (snapshot) => {
      const logDoc = snapshot.docs[0];
      if (!logDoc) {
        callback(null);
        return;
      }

      const logData = { id: logDoc.id, ...logDoc.data() };

      // If studentName/studentId are already stored, use them directly
      if (logData.studentName && logData.studentId) {
        callback(logData);
        return;
      }

      // Otherwise enrich by looking up the student via rfidUid
      try {
        const student = await lookupStudentByRfidUid(logData.rfidUid);
        if (student) {
          const enriched = {
            ...logData,
            studentId: student.studentId || student.uid,
            studentName: student.fullName || student.displayName || student.name || 'Unknown',
          };

          // Optionally write the enriched data back so future reads are instant
          await updateDoc(doc(db, 'rfid_logs', logDoc.id), {
            studentId: enriched.studentId,
            studentName: enriched.studentName,
          });

          callback(enriched);
        } else {
          // rfidUid not registered — still show the log with unknown student
          callback({ ...logData, studentName: 'Unregistered Card', studentId: null });
        }
      } catch (err) {
        // Fallback: show raw log even if lookup fails
        callback(logData);
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
