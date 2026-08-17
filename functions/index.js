import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

initializeApp();

const db = getFirestore();

export const enrichRfidLogOnCreate = onDocumentCreated('rfid_logs/{logId}', async (event) => {
  const snapshot = event.data;

  if (!snapshot) {
    return;
  }

  const logData = snapshot.data();
  const rfidUid = logData?.rfidUid;

  if (!rfidUid) {
    return;
  }

  if (logData.studentName && logData.studentId) {
    return;
  }

  const studentSnapshot = await db.collection('users').where('rfidUid', '==', rfidUid).limit(1).get();

  if (studentSnapshot.empty) {
    await snapshot.ref.set(
      {
        studentName: 'Unregistered Card',
        studentId: null,
      },
      { merge: true }
    );
    return;
  }

  const studentDoc = studentSnapshot.docs[0];
  const studentData = studentDoc.data();
  const studentName = studentData.fullName || studentData.displayName || studentData.name || 'Unknown';
  const studentId = studentData.studentId || studentData.uid || studentDoc.id;

  await snapshot.ref.set(
    {
      studentName,
      studentId,
    },
    { merge: true }
  );
});
