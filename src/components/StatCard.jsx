const StatCard = ({ title, value, subtitle, icon: Icon, tone }) => {
  const tones = {
    cyan: 'from-cyan-500 to-sky-500',
    emerald: 'from-emerald-500 to-lime-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
  };

  const isCompactValue = typeof value === 'string' && (value.includes('@') || value.length > 22);
  const valueClassName = `mt-2 font-semibold text-slate-800 ${isCompactValue ? 'text-base md:text-lg' : 'text-3xl'}`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="max-w-[16rem]">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`${valueClassName} break-words whitespace-normal`}>{value}</p>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className={`rounded-2xl bg-linear-to-br p-3 text-white ${tones[tone] || tones.cyan}`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
