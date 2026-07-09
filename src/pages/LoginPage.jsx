import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, authError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login(form.email, form.password);

    if (result?.success) {
      const route = result.role === 'admin' ? '/admin/dashboard' : '/student';
      navigate(route, { replace: true });
      return;
    }

    setMessage(result?.error || authError || 'Unable to sign in.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Smart Library</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-800">Sign in to your account</h1>
          <p className="mt-2 text-sm text-slate-500">Access the reservation system securely.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 transition focus:border-cyan-500"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 transition focus:border-cyan-500"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </div>

          {message ? <p className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{message}</p> : null}

          <button type="submit" className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700">
            Sign In
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <Link className="font-medium text-cyan-600 hover:text-cyan-700" to="/forgot-password">
            Forgot password?
          </Link>
          <Link className="font-medium text-cyan-600 hover:text-cyan-700" to="/register">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
