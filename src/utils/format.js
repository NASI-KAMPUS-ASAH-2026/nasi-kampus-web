const LOCALE = 'id-ID';

export const rupiah = (n) => 'Rp ' + Math.round(Number(n) || 0).toLocaleString(LOCALE);

export const rupiahShort = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return 'Rp ' + (v / 1_000_000).toLocaleString(LOCALE, { maximumFractionDigits: 1 }) + ' jt';
  if (v >= 1_000) return 'Rp ' + Math.round(v / 1_000).toLocaleString(LOCALE) + ' rb';
  return rupiah(v);
};

const pad = (n) => String(n).padStart(2, '0');

/** Tanggal lokal (bukan UTC) dalam format YYYY-MM-DD. */
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayISO = (addDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  return toISODate(d);
};

export const shiftISO = (iso, days) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

export const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(LOCALE, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

export const formatDateShort = (iso) =>
  new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso).toLocaleDateString(LOCALE, {
    day: 'numeric', month: 'short', year: 'numeric',
  });

export const formatDayMonth = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(LOCALE, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export const number = (n) => (Number(n) || 0).toLocaleString(LOCALE);

export const normalizePhone = (raw) => {
  const p = String(raw || '').replace(/[\s.-]/g, '');
  if (p.startsWith('+62')) return p;
  if (p.startsWith('62')) return '+' + p;
  return '+62' + p.slice(1);
};
