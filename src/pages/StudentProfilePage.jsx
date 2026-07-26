import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/authService';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { LogOut, ArrowLeft, User } from 'lucide-react';

const StudentProfilePage = () => {
  const { currentUser, userProfile, resetPassword, logout } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setStudentId(userProfile.studentId || '');
      setEmail(userProfile.email || currentUser?.email || '');
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
      };
      await updateUserProfile(currentUser.uid, updates);
      setMessage('Profile updated successfully.');
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Header Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button 
                onClick={() => navigate('/student')} 
                className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-cyan-600 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-semibold text-slate-800">My Profile</h1>
              <p className="mt-2 text-sm text-slate-500">Manage your personal details and account security.</p>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {message && (
            <div className={`mb-6 rounded-2xl px-4 py-3 text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {message}
            </div>
          )}
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Personal Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="h-5 w-5 text-cyan-600" />
                Personal Details
              </h2>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <input 
                  type="text"
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-cyan-500 transition" 
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Student ID</label>
                <input 
                  type="text"
                  value={studentId} 
                  onChange={(e) => setStudentId(e.target.value)} 
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-cyan-500 transition" 
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Email Address (Read-only)</label>
                <input 
                  type="email"
                  value={email} 
                  readOnly 
                  className="mt-1.5 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-slate-500" 
                />
              </div>

              <button 
                onClick={handleSave} 
                disabled={busy} 
                className="w-full mt-4 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
              >
                Save Profile Changes
              </button>
            </div>

            {/* Security Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security Settings
              </h2>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-cyan-500 transition" 
                  placeholder="Enter current password (if needed)" 
                />
                <p className="mt-1 text-xs text-slate-400">Required if your login session has expired.</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-cyan-500 transition" 
                  placeholder="Enter new password" 
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-cyan-500 transition" 
                  placeholder="Confirm new password" 
                />
              </div>

              <button 
                onClick={handleChangePassword} 
                disabled={busy} 
                className="w-full mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentProfilePage;
