import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await resetPassword(email);

    if (result?.success) {
      setMessage('Password reset email sent. Please check your inbox.');
      return;
    }

    setMessage(result?.error || 'Unable to send reset email.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Reset Password</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-800">Recover your account</h1>
          <p className="mt-2 text-sm text-slate-500">We will send a recovery link to your email.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {message ? <p className="rounded-2xl bg-cyan-50 px-3 py-2 text-sm text-cyan-700">{message}</p> : null}

          <button type="submit" className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700">
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Back to{' '}
          <Link className="font-medium text-cyan-600 hover:text-cyan-700" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
