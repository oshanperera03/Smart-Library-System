import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../firebase';
import { createUserProfile, getUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const syncProfile = async (user) => {
    if (!user) {
      setCurrentUser(null);
      setUserProfile(null);
      setUserRole(null);
      return;
    }

    const profile = await getUserProfile(user.uid);
    setCurrentUser(user);
    setUserProfile(profile);
    setUserRole(profile?.role || null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setAuthError('');

      if (!user) {
        setCurrentUser(null);
        setUserProfile(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        await syncProfile(user);
      } catch (error) {
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(credential.user.uid);

      if (!profile || profile.active === false) {
        await firebaseSignOut(auth);
        setCurrentUser(null);
        setUserProfile(null);
        setUserRole(null);
        setAuthError('This account is inactive or access has been denied.');
        setLoading(false);
        return { success: false, reason: 'inactive' };
      }

      setCurrentUser(credential.user);
      setUserProfile(profile);
      setUserRole(profile.role || null);
      setLoading(false);
      return { success: true, role: profile.role };
    } catch (error) {
      const message = error.message || 'Unable to sign in. Please try again.';
      setAuthError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const register = async ({ fullName, studentId, email, password }) => {
    setLoading(true);
    setAuthError('');

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const profile = await createUserProfile(credential.user.uid, {
        fullName,
        studentId,
        email,
      });

      setCurrentUser(credential.user);
      setUserProfile(profile);
      setUserRole(profile.role || 'student');
      setLoading(false);
      return { success: true, user: credential.user };
    } catch (error) {
      const message = error.message || 'Registration failed.';
      setAuthError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    setLoading(true);
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setUserRole(null);
    setLoading(false);
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      userProfile,
      userRole,
      loading,
      authError,
      login,
      register,
      logout,
      resetPassword,
    }),
    [currentUser, userProfile, userRole, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
