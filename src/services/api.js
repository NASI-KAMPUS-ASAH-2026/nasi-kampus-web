// Lapisan layanan pesanan terpadu (Lacak Pesanan & Dasbor Pemilik).
import { products, findProduct } from '../data/products';
import { buildOwnerDemoOrders } from '../data/ownerDemoOrders';
import { CONFIG } from '../config';
import { shiftISO, todayISO } from '../utils/format';
import { statusMeta } from '../data/orderStatus';

const wait = (ms = CONFIG.mock.latencyMs) => new Promise((r) => setTimeout(r, ms));
const STORE_KEY = 'nk_orders_store_v2';

function loadAllOrders() {
  const today = todayISO();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const initial = buildOwnerDemoOrders(today);
  saveAllOrders(initial);
  return initial;
}

function saveAllOrders(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    // Pemicu event kustom untuk pembaruan reaktif lintas komponen
    window.dispatchEvent(new CustomEvent('nk_orders_updated', { detail: { count: list.length } }));
  } catch {}
}

/* ------------------------------ Pelanggan ------------------------------ */

export async function getProducts() {
  await wait();
  return products.filter((p) => p.available);
}

export async function getProduct(id) {
  await wait();
  return findProduct(id);
}

let submitting = false;

/**
 * Kirim pesanan baru dari checkout pelanggan.
 * Disimpan ke penyimpanan lokal agar dapat dipantau di halaman Lacak Pesanan dan Dasbor Pemilik.
 */
export async function submitOrder({ customer, items, orderDate, notes }) {
  if (submitting) throw new Error('Pesanan sedang dikirim. Mohon tunggu.');
  submitting = true;
  try {
    await wait(CONFIG.mock.submitLatencyMs);

    const lines = items
      .map((i) => ({ p: findProduct(i.id), qty: Math.min(CONFIG.order.maxQtyPerItem, Math.max(1, Math.floor(i.qty))) }))
      .filter((x) => x.p)
      .map(({ p, qty }) => ({
        productId: p.id,
        name: p.name,
        category: p.category,
        unitPrice: p.price,
        qty,
      }));

    if (!lines.length) throw new Error('Keranjang kosong atau berisi produk yang tidak valid.');

    const now = new Date();
    const randomHex = Math.random().toString(36).slice(2, 6).toUpperCase();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const id = `NK-${yearMonth}-${randomHex}`;
    const total = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);

    const order = {
      id,
      createdAt: now.toISOString(),
      createdDate: todayISO(),
      orderDate,
      customer: {
        name: customer?.name || 'Pelanggan Nasi Kampus',
        phone: customer?.phone || '',
      },
      customerAlias: customer?.name || 'Pelanggan Nasi Kampus',
      status: 'Menunggu Konfirmasi & DP',
      pickup: 'Ambil Sendiri di Dapur / Outlet Nasi Kampus Samarinda',
      dpAmount: null,
      dpNotes: '',
      lines,
      total,
      notes: (notes || '').slice(0, CONFIG.order.notesMaxLength),
      history: [
        {
          status: 'Menunggu Konfirmasi & DP',
          at: now.toISOString(),
          note: 'Pesanan dibuat di website. Menunggu konfirmasi ketersediaan & pembayaran DP melalui WhatsApp.',
        },
      ],
    };

    const current = loadAllOrders();
    const updated = [order, ...current];
    saveAllOrders(updated);

    try {
      localStorage.setItem('nk_last_order_id', order.id);
    } catch {}

    return order;
  } finally {
    submitting = false;
  }
}

/** Ambil pesanan berdasarkan ID untuk halaman OrderSuccess & Detail */
export async function getOrder(id) {
  await wait();
  const all = loadAllOrders();
  return all.find((o) => o.id === id) || null;
}

/**
 * Lacak pesanan berdasarkan Kode Pesanan atau Nomor WhatsApp.
 * Mengembalikan daftar pesanan yang cocok (terurut dari yang terbaru).
 */
export async function trackOrder(query) {
  await wait();
  const term = (query || '').trim().toUpperCase();
  if (!term) return [];
  const digits = term.replace(/\D/g, '');
  const all = loadAllOrders();

  return all.filter((o) => {
    const idMatch = o.id.toUpperCase().includes(term);
    const phoneMatch = digits.length >= 4 && o.customer?.phone && o.customer.phone.includes(digits);
    return idMatch || phoneMatch;
  });
}

/** Dapatkan ID pesanan terakhir yang dibuat di browser ini */
export function getLastOrderId() {
  try {
    return localStorage.getItem('nk_last_order_id') || null;
  } catch {
    return null;
  }
}

/* ------------------------------ Pemilik (Monitoring & Update Status) ------------------------------ */

export const PERIODS = [
  { id: '7', label: '7 hari', days: 7 },
  { id: '30', label: '30 hari', days: 30 },
];

const inPeriod = (o, days, today) => o.createdDate > shiftISO(today, -days) && o.createdDate <= today;

/** Filter pesanan dasbor pemilik: { q, status, from, to } */
export async function getOwnerOrders(filter = {}) {
  await wait();
  const q = (filter.q || '').trim().toUpperCase();
  const all = loadAllOrders();

  return all.filter((o) => {
    const qMatch = !q || o.id.includes(q) || (o.customerAlias && o.customerAlias.toUpperCase().includes(q)) || (o.customer?.phone && o.customer.phone.includes(q));
    const statusMatch = !filter.status || filter.status === 'all' || o.status === filter.status;
    const fromMatch = !filter.from || o.createdDate >= filter.from;
    const toMatch = !filter.to || o.createdDate <= filter.to;
    return qMatch && statusMatch && fromMatch && toMatch;
  });
}

export async function getOwnerOrder(id) {
  await wait();
  const all = loadAllOrders();
  return all.find((o) => o.id === id) || null;
}

/**
 * Perbarui status pesanan oleh admin / pemilik (Live Monitoring).
 * Perubahan status akan langsung tercermin di halaman Lacak Pesanan pelanggan.
 */
export async function updateOrderStatus(id, newStatus, { dpAmount, dpNotes } = {}) {
  await wait(120);
  const all = loadAllOrders();
  const index = all.findIndex((o) => o.id === id);
  if (index === -1) throw new Error(`Pesanan dengan kode "${id}" tidak ditemukan.`);

  const current = all[index];
  const now = new Date().toISOString();
  const history = Array.isArray(current.history) ? [...current.history] : [];

  history.push({
    status: newStatus,
    at: now,
    note: dpNotes || `Status diperbarui menjadi "${newStatus}" oleh admin.`,
  });

  const updatedOrder = {
    ...current,
    status: newStatus,
    ...(dpAmount != null && dpAmount !== '' ? { dpAmount: Number(dpAmount) } : {}),
    ...(dpNotes ? { dpNotes } : {}),
    history,
    updatedAt: now,
  };

  all[index] = updatedOrder;
  saveAllOrders(all);
  return updatedOrder;
}

/**
 * Ringkasan Dasbor Pemilik
 */
export async function getOwnerSummary(days = 7) {
  await wait();
  const today = todayISO();
  const all = loadAllOrders();
  const list = all.filter((o) => inPeriod(o, days, today));
  const active = list.filter((o) => o.status !== 'Dibatalkan');

  const byStatus = {};
  list.forEach((o) => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });

  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftISO(today, -i);
    const dayOrders = list.filter((o) => o.createdDate === date);
    daily.push({
      date,
      orders: dayOrders.length,
      value: dayOrders.filter((o) => o.status !== 'Dibatalkan').reduce((s, o) => s + o.total, 0),
    });
  }

  const byCategory = { 'nasi-box': { qty: 0, value: 0 }, 'snack-box': { qty: 0, value: 0 } };
  const byProduct = {};
  active.forEach((o) => (o.lines || []).forEach((l) => {
    const c = byCategory[l.category] || (byCategory[l.category] = { qty: 0, value: 0 });
    c.qty += l.qty; c.value += l.qty * l.unitPrice;
    const p = byProduct[l.productId] || (byProduct[l.productId] = { productId: l.productId, name: l.name, qty: 0, value: 0 });
    p.qty += l.qty; p.value += l.qty * l.unitPrice;
  }));

  const estimatedValue = active.reduce((s, o) => s + o.total, 0);
  return {
    days,
    from: shiftISO(today, -(days - 1)),
    to: today,
    totalOrders: list.length,
    pending: byStatus['Menunggu Konfirmasi & DP'] || 0,
    inProgress: (byStatus['DP Diterima & Masuk Antrean'] || 0) + (byStatus['Sedang Dipersiapkan'] || 0) + (byStatus['Menunggu Jemputan'] || 0),
    completed: byStatus['Selesai'] || 0,
    cancelled: byStatus['Dibatalkan'] || 0,
    estimatedValue,
    averageValue: active.length ? Math.round(estimatedValue / active.length) : 0,
    totalPortions: active.reduce((s, o) => s + (o.lines || []).reduce((a, l) => a + l.qty, 0), 0),
    receivedRevenue: null,
    byStatus,
    daily,
    byCategory,
    topProducts: Object.values(byProduct).sort((a, b) => b.qty - a.qty).slice(0, 5),
    latest: list.slice(0, 6),
  };
}

/* ------------------------------ Tim Dapur (Produksi & Masak) ------------------------------ */

// Status yang valid dan relevan untuk dapur (HANYA pesanan yang sudah dikonfirmasi admin)
export const KITCHEN_ACTIVE_STATUSES = [
  'DP Diterima & Masuk Antrean',
  'Sedang Dipersiapkan',
  'Menunggu Jemputan',
];

/**
 * Filter pesanan untuk Dasbor Tim Dapur.
 * Hanya memuat pesanan yang SUDAH dikonfirmasi oleh Admin (status minimal "DP Diterima & Masuk Antrean").
 * Pesanan "Menunggu Konfirmasi & DP" secara tegas tidak akan pernah masuk ke dapur.
 */
export async function getKitchenOrders(filter = {}) {
  await wait();
  const q = (filter.q || '').trim().toUpperCase();
  const statusFilter = filter.status || 'active'; // 'active' | 'all' | nama status tertentu
  const dateFilter = filter.date || ''; // filter berdasarkan orderDate (tanggal dibutuhkan)
  const all = loadAllOrders();

  const filteredOrders = all.filter((o) => {
    const statusId = statusMeta(o.status).id;
    // 1. KETENTUAN UTAMA: Abaikan pesanan yang belum dikonfirmasi atau dibatalkan
    if (statusId === 'Menunggu Konfirmasi & DP' || statusId === 'Dibatalkan') {
      return false;
    }

    // 2. Filter Status Dapur
    if (statusFilter === 'active') {
      // Menampilkan seluruh pesanan aktif yang perlu ditangani dapur
      if (!KITCHEN_ACTIVE_STATUSES.includes(statusId)) return false;
    } else if (statusFilter !== 'all') {
      if (statusId !== statusFilter) return false;
    }

    // 3. Filter Tanggal Dibutuhkan (orderDate)
    if (dateFilter && o.orderDate !== dateFilter) {
      return false;
    }

    // 4. Filter Pencarian Teks
    if (q) {
      const idMatch = o.id.toUpperCase().includes(q);
      const nameMatch = o.customerAlias && o.customerAlias.toUpperCase().includes(q);
      const lineMatch = (o.lines || []).some((l) => l.name.toUpperCase().includes(q));
      if (!idMatch && !nameMatch && !lineMatch) return false;
    }

    return true;
  });

  // Pengurutan Prioritas Pesanan: Jadwal dibutuhkan paling awal ditaruh paling atas
  filteredOrders.sort((a, b) => {
    const timeA = new Date(a.orderDate ? a.orderDate + 'T00:00:00' : 0).getTime();
    const timeB = new Date(b.orderDate ? b.orderDate + 'T00:00:00' : 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    const createdA = new Date(a.createdAt || 0).getTime();
    const createdB = new Date(b.createdAt || 0).getTime();
    return createdA - createdB;
  });

  return filteredOrders;
}

/**
 * Ringkasan Metrik untuk Dasbor Tim Dapur
 */
export async function getKitchenSummary() {
  await wait();
  const all = loadAllOrders();

  // Pesanan yang relevan untuk dapur (terkonfirmasi & bukan batal)
  const confirmed = all.filter((o) => o.status !== 'Menunggu Konfirmasi & DP' && o.status !== 'Dibatalkan');

  let queueCount = 0;
  let cookingCount = 0;
  let waitingPickupCount = 0;
  let totalActivePortions = 0;

  confirmed.forEach((o) => {
    const statusId = statusMeta(o.status).id;
    if (statusId === 'DP Diterima & Masuk Antrean') queueCount++;
    if (statusId === 'Sedang Dipersiapkan') cookingCount++;
    if (statusId === 'Menunggu Jemputan') waitingPickupCount++;

    if (KITCHEN_ACTIVE_STATUSES.includes(statusId)) {
      const portions = (o.lines || []).reduce((acc, l) => acc + (l.qty || 0), 0);
      totalActivePortions += portions;
    }
  });

  return {
    totalIncoming: queueCount + cookingCount + waitingPickupCount,
    cooking: cookingCount,
    waitingPickup: waitingPickupCount,
    waitingQueue: queueCount,
    totalPortions: totalActivePortions,
  };
}

/**
 * Pembaruan status pesanan khusus Tim Dapur.
 * Hanya mengizinkan:
 * 1. 'Sedang Dipersiapkan' (Mulai Masak)
 * 2. 'Menunggu Jemputan' (Selesai Disiapkan)
 * Perubahan tersimpan ke store & memicu sinkronisasi ke Admin & Pelacak Pesanan.
 */
export async function updateKitchenStatus(id, newStatus) {
  const ALLOWED = ['Sedang Dipersiapkan', 'Menunggu Jemputan'];
  if (!ALLOWED.includes(newStatus)) {
    throw new Error(`Tim Dapur tidak memiliki kewenangan untuk mengubah status ke "${newStatus}".`);
  }

  const defaultNote = newStatus === 'Sedang Dipersiapkan'
    ? 'Pesanan mulai diproses dan dimasak oleh Tim Dapur.'
    : 'Pesanan selesai disiapkan dan siap dijemput di outlet Nasi Kampus.';

  return updateOrderStatus(id, newStatus, { dpNotes: defaultNote });
}

/* ------------------------------ Bahan & Pengelolaan Stok ------------------------------ */
export * from './stockApi';
