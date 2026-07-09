const LoadingScreen = ({ message = 'Loading…' }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        <p className="text-lg font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
