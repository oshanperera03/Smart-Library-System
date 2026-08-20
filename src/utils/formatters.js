export const formatTimestamp = (value) => {
  if (!value) return '—';

  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const getTimestampMillis = (value) => {
  if (!value) return 0;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export const normalizeSeatStatus = (status) => String(status || '').trim().toLowerCase();

export const hasFsrPressure = (seat) => Number(seat?.fsrValue) > 0;

export const isUnauthorizedAlert = (seat) => (
  seat?.alert === true
  || normalizeSeatStatus(seat?.status) === 'unauthorized'
  || (normalizeSeatStatus(seat?.status) === 'available' && hasFsrPressure(seat))
);

export const getSeatDisplayStatus = (seat) => (
  isUnauthorizedAlert(seat)
    ? 'unauthorized'
    : (normalizeSeatStatus(seat?.status) === 'verified' && hasFsrPressure(seat) ? 'occupied' : normalizeSeatStatus(seat?.status))
);

export const getStatusLabel = (status) => {
  switch (normalizeSeatStatus(status)) {
    case 'available':
      return 'Available';
    case 'reserved':
      return 'Reserved';
    case 'verified':
      return 'Verified';
    case 'occupied':
      return 'Occupied';
    case 'unauthorized':
      return 'Unauthorized';
    default:
      return 'Unknown';
  }
};

export const getStatusClasses = (status) => {
  switch (normalizeSeatStatus(status)) {
    case 'available':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'reserved':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'verified':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'occupied':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'unauthorized':
      return 'bg-red-200 text-red-800 border-red-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
