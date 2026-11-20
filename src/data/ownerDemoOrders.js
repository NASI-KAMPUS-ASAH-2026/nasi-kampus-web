// Riwayat data pesanan awal Nasi Kampus Samarinda.
import { products } from './products';
import { shiftISO, todayISO } from '../utils/format';

const SEED = 20261114;
const TOTAL_ORDERS = 84;
const SPAN_DAYS = 30;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CUSTOMER_NAMES = [
  'HIMA Teknik Unmul',
  'BEM FKIP Samarinda',
  'Ibu Sari Wulandari',
  'Bpk. Hendra Wijaya',
  'Panitia Seminar FEB',
  'Kantor Kelurahan Sidodadi',
  'UKM Paduan Suara',
  'Lab Sipil Unmul',
  'Rapat Prodi Manajemen',
  'Ibu Rina Kusuma',
  'Keluarga Bpk. Ahmad',
  'Panitia Diklat Mahasiswa',
  'Klinik Sehat Samarinda',
  'Ibu Maya Putri',
  'Komunitas Masjid Kampus',
  'Bpk. Darmawan',
];

const NOTES = [
  '', '', '', '',
  'Mohon sambal dipisah.',
  'Untuk acara rapat pukul 12.00 WITA.',
  'Tanpa sambal untuk 5 porsi.',
  'Diambil pukul 10.30 WITA.',
];

function pickStatus(rand, ageDays, leadDays) {
  const neededInPast = ageDays - leadDays > 0; // tanggal dibutuhkan sudah lewat
  const r = rand();
  if (neededInPast) return r < 0.88 ? 'Selesai' : 'Dibatalkan';
  if (ageDays <= 1) return r < 0.7 ? 'Menunggu Konfirmasi & DP' : 'DP Diterima & Masuk Antrean';
  if (r < 0.2) return 'Menunggu Konfirmasi & DP';
  if (r < 0.45) return 'DP Diterima & Masuk Antrean';
  if (r < 0.7) return 'Sedang Dipersiapkan';
  if (r < 0.92) return 'Menunggu Jemputan';
  return 'Dibatalkan';
}

function pickPayment(status, rand) {
  if (status === 'Selesai') return rand() < 0.75 ? 'Lunas' : undefined;
  if (status === 'DP Diterima & Masuk Antrean' || status === 'Sedang Dipersiapkan' || status === 'Menunggu Jemputan') {
    return rand() < 0.8 ? 'DP Terverifikasi' : undefined;
  }
  return undefined;
}

export function buildOwnerDemoOrders(today = todayISO()) {
  const rand = mulberry32(SEED);
  const orders = [];
  for (let i = 0; i < TOTAL_ORDERS; i++) {
    const ageDays = Math.min(SPAN_DAYS - 1, Math.floor(Math.pow(rand(), 1.15) * SPAN_DAYS));
    const createdDate = shiftISO(today, -ageDays);
    const leadDays = 1 + Math.floor(rand() * 6);
    const orderDate = shiftISO(createdDate, leadDays);
    const hour = 7 + Math.floor(rand() * 13);
    const minute = Math.floor(rand() * 60);

    const lineCount = 1 + Math.floor(rand() * 3);
    const pool = [...products];
    const lines = [];
    for (let k = 0; k < lineCount && pool.length; k++) {
      const p = pool.splice(Math.floor(rand() * pool.length), 1)[0];
      const qty = [5, 10, 10, 15, 20, 25, 30, 40, 50][Math.floor(rand() * 9)];
      lines.push({ productId: p.id, name: p.name, category: p.category, qty, unitPrice: p.price });
    }
    const status = pickStatus(rand, ageDays, leadDays);
    const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
    const paymentStatus = pickPayment(status, rand);
    orders.push({
      createdAt: `${createdDate}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00`,
      createdDate,
      orderDate,
      status,
      lines,
      total,
      notes: NOTES[Math.floor(rand() * NOTES.length)],
      ...(paymentStatus ? { paymentStatus } : {}),
    });
  }
  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return orders
    .map((o, idx) => ({
      ...o,
      id: `NK-${o.createdDate.slice(0, 7).replace('-', '')}-${String(idx + 1).padStart(3, '0')}`,
      customerAlias: CUSTOMER_NAMES[idx % CUSTOMER_NAMES.length],
    }))
    .reverse(); // terbaru di atas
}
