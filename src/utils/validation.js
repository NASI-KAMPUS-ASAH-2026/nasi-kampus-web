import { CONFIG } from '../config';
import { formatDate, todayISO } from './format';

const rules = CONFIG.order;
const PHONE_RE = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;

export const cleanPhone = (raw) => String(raw || '').replace(/[\s.-]/g, '');

export const isValidIndoPhone = (raw) => PHONE_RE.test(cleanPhone(raw));

/** Normalisasi ke format +62xxxxxxxxxx. Hanya dipanggil setelah valid. */
export const normalizePhone = (raw) => {
  const p = cleanPhone(raw);
  if (p.startsWith('+62')) return p;
  if (p.startsWith('62')) return '+' + p;
  return '+62' + p.slice(1);
};

export const minOrderDate = () => todayISO(rules.minLeadDays);

export function validateCheckout(v, { count = 0 } = {}) {
  const e = {};
  const name = v.name.trim();
  if (name.length < 2) e.name = 'Nama wajib diisi, minimal 2 karakter.';
  else if (name.length > 60) e.name = 'Nama maksimal 60 karakter.';

  if (!cleanPhone(v.phone)) e.phone = 'Nomor WhatsApp wajib diisi.';
  else if (!isValidIndoPhone(v.phone)) e.phone = 'Masukkan nomor WhatsApp Indonesia yang valid, contoh 081234567890.';

  const min = minOrderDate();
  if (!v.date) e.date = 'Tanggal dibutuhkan wajib diisi.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) e.date = 'Format tanggal tidak valid.';
  else if (v.date < min) e.date = `Tanggal tidak boleh lewat. Paling cepat ${formatDate(min)}.`;

  if (v.notes.length > rules.notesMaxLength) e.notes = `Catatan maksimal ${rules.notesMaxLength} karakter.`;
  if (rules.askAddress && v.address.trim().length < 5) e.address = 'Alamat wajib diisi.';
  if (count < 1) e.cart = 'Keranjang masih kosong.';
  return e;
}
