// Layanan Pengelolaan Master Bahan & Transaksi Pembelian Bahan
// Memenuhi aturan hak akses Owner vs Tim Dapur, akumulasi stok, dan koreksi delta stok.

import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  INITIAL_INGREDIENTS,
  INITIAL_PURCHASES,
} from '../data/ingredientsData.js';
import { shiftISO, todayISO } from '../utils/format.js';

export { INGREDIENT_CATEGORIES, INGREDIENT_UNITS };

const INGREDIENTS_KEY = 'nk_ingredients_store_v1';
const PURCHASES_KEY = 'nk_purchases_store_v1';

const wait = (ms = 100) => new Promise((r) => setTimeout(r, ms));

const memoryStore = {};
function getLocalItem(key) {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
  } catch {}
  return memoryStore[key] || null;
}

function setLocalItem(key, val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
      return;
    }
  } catch {}
  memoryStore[key] = val;
}

function dispatchEventSafe(name, detail) {
  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  } catch {}
}

/* ----------------- Pemuatan & Penyimpanan Data Lokal ----------------- */

function loadAllIngredients() {
  try {
    const raw = getLocalItem(INGREDIENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveAllIngredients(INITIAL_INGREDIENTS);
  return INITIAL_INGREDIENTS;
}

function saveAllIngredients(list) {
  try {
    setLocalItem(INGREDIENTS_KEY, JSON.stringify(list));
    dispatchEventSafe('nk_stock_updated', { count: list.length });
  } catch {}
}

function loadAllPurchases() {
  try {
    const raw = getLocalItem(PURCHASES_KEY);
    if (raw) {
      let parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalisasi kode transaksi yang sebelumnya memiliki huruf acak (misal PB-202611-KPWW)
        let changed = false;
        let counter = 5;
        parsed = parsed.map((p) => {
          if (p.id && !/^PB-\d{6}-\d{3}$/.test(p.id)) {
            const ym = p.purchaseDate ? p.purchaseDate.slice(0, 7).replace('-', '') : '202611';
            const newId = `PB-${ym}-${String(counter++).padStart(3, '0')}`;
            changed = true;
            return { ...p, id: newId };
          }
          return p;
        });
        if (changed) saveAllPurchases(parsed);
        return parsed;
      }
    }
  } catch {}
  saveAllPurchases(INITIAL_PURCHASES);
  return INITIAL_PURCHASES;
}

function saveAllPurchases(list) {
  try {
    setLocalItem(PURCHASES_KEY, JSON.stringify(list));
    dispatchEventSafe('nk_purchases_updated', { count: list.length });
  } catch {}
}

/* ----------------- Master Bahan (Owner CRUD, Kitchen Read-Only) ----------------- */

export async function getIngredients(filter = {}) {
  await wait();
  const q = (filter.q || '').trim().toLowerCase();
  const category = filter.category || 'all';
  const lowStockOnly = Boolean(filter.lowStockOnly);

  const all = loadAllIngredients();

  return all.filter((item) => {
    const qMatch = !q || item.name.toLowerCase().includes(q);
    const catMatch = category === 'all' || item.category === category;
    const lowMatch = !lowStockOnly || Number(item.currentStock) <= Number(item.minStock);
    return qMatch && catMatch && lowMatch;
  }).sort((a, b) => a.name.localeCompare(b.name, 'id'));
}

export async function getIngredient(id) {
  await wait();
  const all = loadAllIngredients();
  return all.find((i) => i.id === id) || null;
}

export async function createIngredient({ name, category, unit, initialStock = 0, minStock = 0 }) {
  await wait(150);
  const trimmedName = (name || '').trim();
  if (!trimmedName) throw new Error('Nama bahan tidak boleh kosong.');

  if (!INGREDIENT_CATEGORIES.includes(category)) {
    throw new Error('Kategori bahan yang dipilih tidak valid.');
  }

  const trimmedUnit = (unit || '').trim();
  if (!trimmedUnit) throw new Error('Satuan bahan wajib ditentukan.');

  const all = loadAllIngredients();
  const duplicate = all.some((i) => i.name.toLowerCase() === trimmedName.toLowerCase());
  if (duplicate) {
    throw new Error(`Bahan dengan nama "${trimmedName}" sudah terdaftar.`);
  }

  // Tentukan ID baru
  const maxNum = all.reduce((max, item) => {
    const num = parseInt(item.id.replace(/\D/g, ''), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);
  const newId = `ING-${String(maxNum + 1).padStart(3, '0')}`;

  const currentStock = Math.max(0, Number(initialStock) || 0);
  const validMinStock = Math.max(0, Number(minStock) || 0);
  const now = new Date().toISOString();

  const newIngredient = {
    id: newId,
    name: trimmedName,
    category,
    unit: trimmedUnit,
    currentStock,
    minStock: validMinStock,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [...all, newIngredient];
  saveAllIngredients(updatedList);
  return newIngredient;
}

export async function updateIngredient(id, { name, category, unit, minStock }) {
  await wait(150);
  const all = loadAllIngredients();
  const index = all.findIndex((i) => i.id === id);
  if (index === -1) throw new Error(`Bahan dengan ID "${id}" tidak ditemukan.`);

  const trimmedName = (name || '').trim();
  if (!trimmedName) throw new Error('Nama bahan tidak boleh kosong.');

  if (category && !INGREDIENT_CATEGORIES.includes(category)) {
    throw new Error('Kategori bahan tidak valid.');
  }

  // Cek duplikasi nama dengan item lain
  const duplicate = all.some(
    (i) => i.id !== id && i.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (duplicate) {
    throw new Error(`Bahan dengan nama "${trimmedName}" sudah digunakan.`);
  }

  const now = new Date().toISOString();
  const current = all[index];

  const updatedIngredient = {
    ...current,
    name: trimmedName,
    category: category || current.category,
    unit: (unit || current.unit).trim(),
    minStock: minStock !== undefined ? Math.max(0, Number(minStock) || 0) : current.minStock,
    updatedAt: now,
  };

  all[index] = updatedIngredient;
  saveAllIngredients(all);
  return updatedIngredient;
}

export async function deleteIngredient(id) {
  await wait(150);
  const all = loadAllIngredients();
  const target = all.find((i) => i.id === id);
  if (!target) throw new Error(`Bahan dengan ID "${id}" tidak ditemukan.`);

  // Aturan Wajib: Cegah penghapusan jika bahan sudah pernah digunakan dalam transaksi pembelian
  const purchases = loadAllPurchases();
  const isUsed = purchases.some((p) =>
    (p.items || []).some((item) => item.ingredientId === id)
  );

  if (isUsed) {
    throw new Error(
      `Bahan "${target.name}" sudah memiliki riwayat transaksi pembelian dan tidak boleh dihapus agar data transaksi tetap konsisten.`
    );
  }

  const remaining = all.filter((i) => i.id !== id);
  saveAllIngredients(remaining);
  return { success: true, id };
}

/* ----------------- Transaksi Pembelian Bahan (Owner & Tim Dapur) ----------------- */

/**
 * Filter daftar pembelian bahan.
 * - Tim Dapur HANYA dapat melihat transaksi miliknya (role 'kitchen').
 * - Owner dapat melihat seluruh transaksi (Owner + Tim Dapur).
 */
export async function getPurchases(filter = {}, currentUser = { role: 'owner' }) {
  await wait();
  const q = (filter.q || '').trim().toLowerCase();
  const from = filter.from || '';
  const to = filter.to || '';
  const role = currentUser?.role || 'owner';

  const all = loadAllPurchases();

  return all
    .filter((p) => {
      // 1. Pembatasan Hak Akses: Tim Dapur hanya melihat transaksi buatannya
      if (role === 'kitchen' && p.createdBy?.role !== 'kitchen') {
        return false;
      }

      // 2. Filter Rentang Tanggal Pembelian
      if (from && p.purchaseDate < from) return false;
      if (to && p.purchaseDate > to) return false;

      // 3. Pencarian Teks (Kode, Toko/Supplier, Nama Bahan, Pembuat)
      if (q) {
        const idMatch = p.id.toLowerCase().includes(q);
        const supMatch = (p.supplier || '').toLowerCase().includes(q);
        const notesMatch = (p.notes || '').toLowerCase().includes(q);
        const userMatch = (p.createdBy?.name || '').toLowerCase().includes(q);
        const itemMatch = (p.items || []).some((it) =>
          it.ingredientName.toLowerCase().includes(q)
        );
        if (!idMatch && !supMatch && !notesMatch && !userMatch && !itemMatch) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Urutkan tanggal pembelian terbaru di atas
      if (a.purchaseDate !== b.purchaseDate) {
        return b.purchaseDate.localeCompare(a.purchaseDate);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
}

export async function getPurchase(id) {
  await wait();
  const all = loadAllPurchases();
  return all.find((p) => p.id === id) || null;
}

/**
 * Buat transaksi pembelian baru multi-item.
 * Otomatis menambahkan stok ke setiap master bahan yang dibeli.
 */
export async function createPurchase({
  purchaseDate,
  supplier,
  items,
  notes = '',
  currentUser = { role: 'kitchen', name: 'Tim Dapur', userId: 2 },
}) {
  await wait(180);

  if (!purchaseDate) throw new Error('Tanggal pembelian wajib diisi.');
  const trimmedSupplier = (supplier || '').trim();
  if (!trimmedSupplier) throw new Error('Nama toko atau pemasok wajib diisi.');

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Minimal satu baris bahan harus ditambahkan ke transaksi.');
  }

  // Validasi duplikasi bahan dalam satu transaksi
  const ingIds = items.map((i) => i.ingredientId).filter(Boolean);
  const uniqueIngIds = new Set(ingIds);
  if (uniqueIngIds.size !== ingIds.length) {
    throw new Error(
      'Terdapat bahan yang sama dipilih lebih dari sekali. Gabungkan kuantitasnya dalam satu baris.'
    );
  }

  const allIngredients = loadAllIngredients();
  const ingMap = new Map(allIngredients.map((i) => [i.id, i]));

  const validatedItems = items.map((item, idx) => {
    const ing = ingMap.get(item.ingredientId);
    if (!ing) throw new Error(`Bahan pada baris ke-${idx + 1} tidak valid.`);

    const qty = Number(item.qty);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Jumlah untuk bahan "${ing.name}" harus lebih besar dari 0.`);
    }

    const unitPrice = Number(item.unitPrice);
    if (isNaN(unitPrice) || unitPrice < 0) {
      throw new Error(`Harga satuan untuk bahan "${ing.name}" tidak boleh negatif.`);
    }

    const subtotal = Math.round(qty * unitPrice);

    return {
      ingredientId: ing.id,
      ingredientName: ing.name,
      category: ing.category,
      unit: ing.unit,
      qty,
      unitPrice,
      subtotal,
    };
  });

  const total = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Buat kode transaksi berurutan: PB-YYYYMM-XXX (angka 3 digit konsisten)
  const now = new Date();
  const ym = purchaseDate
    ? purchaseDate.slice(0, 7).replace('-', '')
    : `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const purchases = loadAllPurchases();
  const monthPurchases = purchases.filter((p) => p.id && p.id.startsWith(`PB-${ym}-`));
  let maxNum = 0;
  monthPurchases.forEach((p) => {
    const parts = p.id.split('-');
    const num = parseInt(parts[2], 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });
  const id = `PB-${ym}-${String(maxNum + 1).padStart(3, '0')}`;

  const nowIso = now.toISOString();
  const newPurchase = {
    id,
    purchaseDate,
    supplier: trimmedSupplier,
    items: validatedItems,
    total,
    notes: (notes || '').trim(),
    createdBy: {
      role: currentUser.role || 'kitchen',
      name: currentUser.name || (currentUser.role === 'owner' ? 'Bapak Bayu (Owner)' : 'Tim Dapur'),
      userId: currentUser.userId || (currentUser.role === 'owner' ? 1 : 2),
    },
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // PEMBARUAN STOK OTOMATIS:
  // Tambahkan stok pada master bahan sesuai kuantitas pembelian
  validatedItems.forEach((item) => {
    const ing = ingMap.get(item.ingredientId);
    if (ing) {
      ing.currentStock = Math.round((Number(ing.currentStock) + item.qty) * 100) / 100;
      ing.updatedAt = nowIso;
    }
  });

  // Simpan pembaruan stok dan transaksi baru
  saveAllIngredients(Array.from(ingMap.values()));
  const allPurchases = loadAllPurchases();
  saveAllPurchases([newPurchase, ...allPurchases]);

  return newPurchase;
}

/**
 * Edit transaksi pembelian dengan koreksi delta stok otomatis.
 * Mengembalikan stok pembelian lama lalu menerapkan kuantitas pembelian baru.
 */
export async function updatePurchase(
  id,
  { purchaseDate, supplier, items, notes },
  currentUser = { role: 'kitchen', name: 'Tim Dapur', userId: 2 }
) {
  await wait(200);
  const allPurchases = loadAllPurchases();
  const txIndex = allPurchases.findIndex((p) => p.id === id);
  if (txIndex === -1) throw new Error(`Transaksi pembelian "${id}" tidak ditemukan.`);

  const oldTx = allPurchases[txIndex];

  // Batasan Hak Akses: Tim Dapur hanya boleh mengedit transaksi miliknya
  if (currentUser.role === 'kitchen' && oldTx.createdBy?.role !== 'kitchen') {
    throw new Error('Tim Dapur hanya berwenang mengedit transaksi pembelian yang dibuatnya sendiri.');
  }

  if (!purchaseDate) throw new Error('Tanggal pembelian wajib diisi.');
  const trimmedSupplier = (supplier || '').trim();
  if (!trimmedSupplier) throw new Error('Nama toko atau pemasok wajib diisi.');

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Minimal satu baris bahan harus ada dalam transaksi.');
  }

  // Validasi duplikasi bahan
  const ingIds = items.map((i) => i.ingredientId).filter(Boolean);
  const uniqueIngIds = new Set(ingIds);
  if (uniqueIngIds.size !== ingIds.length) {
    throw new Error(
      'Terdapat bahan duplikat dalam satu transaksi. Gabungkan jumlahnya ke dalam satu baris.'
    );
  }

  const allIngredients = loadAllIngredients();
  const ingMap = new Map(allIngredients.map((i) => [i.id, i]));

  const validatedItems = items.map((item, idx) => {
    const ing = ingMap.get(item.ingredientId);
    if (!ing) throw new Error(`Bahan pada baris ke-${idx + 1} tidak valid.`);

    const qty = Number(item.qty);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Jumlah untuk bahan "${ing.name}" harus lebih besar dari 0.`);
    }

    const unitPrice = Number(item.unitPrice);
    if (isNaN(unitPrice) || unitPrice < 0) {
      throw new Error(`Harga satuan untuk bahan "${ing.name}" tidak boleh negatif.`);
    }

    const subtotal = Math.round(qty * unitPrice);

    return {
      ingredientId: ing.id,
      ingredientName: ing.name,
      category: ing.category,
      unit: ing.unit,
      qty,
      unitPrice,
      subtotal,
    };
  });

  const total = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const nowIso = new Date().toISOString();

  // KOREKSI STOK (KONSISTENSI DELTA):
  // 1. Tarik kembali (reverse) kuantitas dari item transaksi LAMA
  (oldTx.items || []).forEach((oldItem) => {
    const ing = ingMap.get(oldItem.ingredientId);
    if (ing) {
      ing.currentStock = Math.max(0, Math.round((Number(ing.currentStock) - oldItem.qty) * 100) / 100);
    }
  });

  // 2. Terapkan kuantitas dari item transaksi BARU
  validatedItems.forEach((newItem) => {
    const ing = ingMap.get(newItem.ingredientId);
    if (ing) {
      ing.currentStock = Math.round((Number(ing.currentStock) + newItem.qty) * 100) / 100;
      ing.updatedAt = nowIso;
    }
  });

  const updatedPurchase = {
    ...oldTx,
    purchaseDate,
    supplier: trimmedSupplier,
    items: validatedItems,
    total,
    notes: (notes || '').trim(),
    updatedAt: nowIso,
  };

  allPurchases[txIndex] = updatedPurchase;

  // Simpan keduanya secara konsisten
  saveAllIngredients(Array.from(ingMap.values()));
  saveAllPurchases(allPurchases);

  return updatedPurchase;
}

/* ----------------- Ringkasan & Laporan Pembelian & Stok ----------------- */

export async function getStockSummary() {
  await wait();
  const all = loadAllIngredients();

  const lowStockList = all.filter((i) => Number(i.currentStock) <= Number(i.minStock));

  const byCategory = {};
  INGREDIENT_CATEGORIES.forEach((cat) => {
    byCategory[cat] = { count: 0, items: [] };
  });

  all.forEach((i) => {
    if (!byCategory[i.category]) {
      byCategory[i.category] = { count: 0, items: [] };
    }
    byCategory[i.category].count += 1;
    byCategory[i.category].items.push(i);
  });

  return {
    totalIngredients: all.length,
    lowStockCount: lowStockList.length,
    lowStockList,
    byCategory,
  };
}

export async function getPurchaseSummary(days = 30) {
  await wait();
  const today = todayISO();
  const from = shiftISO(today, -days);

  const all = loadAllPurchases();
  const inRange = all.filter((p) => p.purchaseDate >= from && p.purchaseDate <= today);

  const totalSpent = inRange.reduce((sum, p) => sum + p.total, 0);
  const txCount = inRange.length;

  // Pengeluaran berdasarkan kategori bahan
  const byCategory = {};
  INGREDIENT_CATEGORIES.forEach((cat) => {
    byCategory[cat] = { amount: 0, count: 0 };
  });

  // Rekap per bahan teratas
  const byIngredient = {};

  inRange.forEach((p) => {
    (p.items || []).forEach((item) => {
      const cat = item.category || 'Lainnya';
      if (!byCategory[cat]) byCategory[cat] = { amount: 0, count: 0 };
      byCategory[cat].amount += item.subtotal;
      byCategory[cat].count += item.qty;

      if (!byIngredient[item.ingredientId]) {
        byIngredient[item.ingredientId] = {
          id: item.ingredientId,
          name: item.ingredientName,
          category: cat,
          unit: item.unit,
          qty: 0,
          amount: 0,
        };
      }
      byIngredient[item.ingredientId].qty += item.qty;
      byIngredient[item.ingredientId].amount += item.subtotal;
    });
  });

  // Tren harian
  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = shiftISO(today, -i);
    const dayTxs = inRange.filter((p) => p.purchaseDate === d);
    daily.push({
      date: d,
      count: dayTxs.length,
      amount: dayTxs.reduce((sum, p) => sum + p.total, 0),
    });
  }

  const topIngredients = Object.values(byIngredient)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    days,
    from,
    to: today,
    totalSpent,
    txCount,
    byCategory,
    daily,
    topIngredients,
    recentPurchases: inRange.slice(0, 5),
  };
}
