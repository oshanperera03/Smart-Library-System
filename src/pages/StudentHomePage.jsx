import { useAuth } from '../context/AuthContext';

const StudentHomePage = () => {
  const { userProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Student Portal</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-800">Welcome, {userProfile?.fullName || 'Student'}</h1>
            <p className="mt-2 text-sm text-slate-500">Your seat reservation experience will be available here soon.</p>
          </div>
          <button onClick={logout} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentHomePage;
