import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const getUserProfile = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const createUserProfile = async (uid, profileData) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    uid,
    role: 'student',
    active: true,
    createdAt: serverTimestamp(),
    ...profileData,
  });
  return getUserProfile(uid);
};
