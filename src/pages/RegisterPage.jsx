import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, authError } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const result = await register({
      fullName: form.fullName,
      studentId: form.studentId,
      email: form.email,
      password: form.password,
    });

    if (result?.success) {
      navigate('/student', { replace: true });
      return;
    }

    setMessage(result?.error || authError || 'Registration failed.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Create Account</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-800">Register as a student</h1>
          <p className="mt-2 text-sm text-slate-500">Admin accounts are assigned manually in Firestore.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
              <input
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Student ID</label>
              <input
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
                value={form.studentId}
                onChange={(event) => setForm((prev) => ({ ...prev, studentId: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
            </div>
          </div>

          {message ? <p className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{message}</p> : null}

          <button type="submit" className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700">
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-medium text-cyan-600 hover:text-cyan-700" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
