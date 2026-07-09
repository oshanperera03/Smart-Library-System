import { useEffect, useState } from 'react';
import {
  subscribeToReservations,
  subscribeToRfidLogs,
  subscribeToSeats,
  subscribeToStudents,
  subscribeToLatestRfidLog,
} from '../services/firestoreService';

export const useDashboardData = () => {
  const [seats, setSeats] = useState([]);
  const [students, setStudents] = useState([]);
  const [rfidLogs, setRfidLogs] = useState([]);
  const [latestRfidLog, setLatestRfidLog] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState({
    seats: true,
    students: true,
    rfidLogs: true,
    reservations: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribers = [];

    const handleSubscription = (key, callback, onError) => {
      setLoading((prev) => ({ ...prev, [key]: true }));
      const unsub = callback((data) => {
        setLoading((prev) => ({ ...prev, [key]: false }));
        setErrors((prev) => ({ ...prev, [key]: null }));
        return data;
      }, onError);
      unsubscribers.push(unsub);
    };

    const seatUnsub = subscribeToSeats((data) => {
      setSeats(data);
      setLoading((prev) => ({ ...prev, seats: false }));
      setErrors((prev) => ({ ...prev, seats: null }));
    }, (error) => {
      setLoading((prev) => ({ ...prev, seats: false }));
      setErrors((prev) => ({ ...prev, seats: error.message }));
    });
    unsubscribers.push(seatUnsub);

    const studentUnsub = subscribeToStudents((data) => {
      setStudents(data);
      setLoading((prev) => ({ ...prev, students: false }));
      setErrors((prev) => ({ ...prev, students: null }));
    }, (error) => {
      setLoading((prev) => ({ ...prev, students: false }));
      setErrors((prev) => ({ ...prev, students: error.message }));
    });
    unsubscribers.push(studentUnsub);

    const rfidUnsub = subscribeToRfidLogs((data) => {
      setRfidLogs(data);
      setLoading((prev) => ({ ...prev, rfidLogs: false }));
      setErrors((prev) => ({ ...prev, rfidLogs: null }));
    }, (error) => {
      setLoading((prev) => ({ ...prev, rfidLogs: false }));
      setErrors((prev) => ({ ...prev, rfidLogs: error.message }));
    });
    unsubscribers.push(rfidUnsub);

    const latestRfidUnsub = subscribeToLatestRfidLog((data) => {
      setLatestRfidLog(data);
    }, (error) => {
      setErrors((prev) => ({ ...prev, latestRfidLog: error.message }));
    });
    unsubscribers.push(latestRfidUnsub);

    const reservationUnsub = subscribeToReservations((data) => {
      setReservations(data);
      setLoading((prev) => ({ ...prev, reservations: false }));
      setErrors((prev) => ({ ...prev, reservations: null }));
    }, (error) => {
      setLoading((prev) => ({ ...prev, reservations: false }));
      setErrors((prev) => ({ ...prev, reservations: error.message }));
    });
    unsubscribers.push(reservationUnsub);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  return {
    seats,
    students,
    rfidLogs,
    latestRfidLog,
    reservations,
    loading,
    errors,
    isLoading: Object.values(loading).some(Boolean),
  };
};
