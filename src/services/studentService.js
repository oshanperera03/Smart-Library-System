import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const setStudentActiveStatus = async (studentId, active) => {
  const studentRef = doc(db, 'users', studentId);
  await updateDoc(studentRef, { active });
};
