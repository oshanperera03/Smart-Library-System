import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/authService';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatCard from '../components/StatCard';

const SettingsPage = () => {
  const { currentUser, userProfile, resetPassword, logout } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || userProfile.fullName || '');
      setStudentId(userProfile.studentId || userProfile.studentId || '');
      setEmail(userProfile.email || currentUser?.email || '');
      setDarkMode(!!(userProfile.preferences && userProfile.preferences.darkMode));
    }
  }, [userProfile, currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    setBusy(true);
    setMessage('');
    try {
      const updates = {
        fullName: fullName || null,
        studentId: studentId || null,
        preferences: { darkMode },
      };
      await updateUserProfile(currentUser.uid, updates);
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err.message || 'Unable to save profile.');
    } finally {
      setBusy(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentUser) return;
    if (!newPassword) {
      setMessage('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('New password and confirmation do not match.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      await updatePassword(currentUser, newPassword);
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/requires-recent-login' || (err.message && err.message.toLowerCase().includes('recent'))) {
        // Try reauthentication if current password provided
        if (currentPassword) {
          try {
            const cred = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, cred);
            await updatePassword(currentUser, newPassword);
            setMessage('Password updated after reauthentication.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          } catch (reauthErr) {
            setMessage(reauthErr.message || 'Reauthentication failed. Please login again.');
          }
        } else {
          // Fallback to reset email if no current password provided
          try {
            const res = await resetPassword(email);
            if (res.success) setMessage('Session expired. Sent password reset email.');
            else setMessage(res.error || 'Session expired. Please re-login.');
          } catch (resetErr) {
            setMessage(resetErr.message || 'Session expired. Please re-login.');
          }
        }
      } else {
        setMessage(err.message || 'Unable to change password.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    setMessage('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setMessage(err?.message || 'Logout failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <TopNav title="Settings" subtitle="Manage your profile and preferences" />

          <div className="space-y-6 p-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Account" value={email} subtitle="Primary email" tone="cyan" />
              <StatCard title="Role" value={userProfile?.role || '—'} subtitle="Access level" tone="emerald" />
              <StatCard title="Active" value={userProfile?.active ? 'Yes' : 'No'} subtitle="Account status" tone="amber" />
              <StatCard title="Last Updated" value={userProfile?.updatedAt ? new Date(userProfile.updatedAt.seconds * 1000).toLocaleString() : '—'} subtitle="Profile" tone="rose" />
            </section>

            <section className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {message ? <div className="mb-4 rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-700">{message}</div> : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-600">Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
                </div>

                <div>
                  <label className="text-sm text-slate-600">Student ID</label>
                  <input value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
                </div>

                <div>
                  <label className="text-sm text-slate-600">Email</label>
                  <input value={email} readOnly className="mt-1 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-500" />
                </div>

                <div>
                  <label className="text-sm text-slate-600">Current password (required if session expired)</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Current password (optional)" />
                </div>

                <div>
                  <label className="text-sm text-slate-600">New password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Enter new password" />
                </div>

                <div>
                  <label className="text-sm text-slate-600">Confirm new password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Confirm new password" />
                </div>

              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={handleSave} disabled={busy} className="rounded-2xl bg-cyan-600 px-4 py-2 text-white disabled:opacity-60">Save Profile</button>
                <button onClick={handleChangePassword} disabled={busy} className="rounded-2xl border border-slate-200 px-4 py-2">Change Password</button>
                <button onClick={handleLogout} disabled={busy} className="rounded-2xl border border-rose-200 px-4 py-2 text-rose-600">Logout</button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
