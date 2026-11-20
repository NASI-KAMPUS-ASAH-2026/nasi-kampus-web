import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { findProduct } from '../data/products';
import { CONFIG } from '../config';

const KEY = 'nk_cart_v1'; // hanya menyimpan id + jumlah, TANPA data pelanggan
const MAX = CONFIG.order.maxQtyPerItem;
const Ctx = createContext(null);

const clamp = (n) => Math.min(MAX, Math.max(1, Math.floor(Number(n) || 0)));

/** Membaca & membersihkan keranjang tersimpan: hanya produk valid, jumlah bulat 1..MAX, tanpa duplikat. */
const load = () => {
  try {
    const a = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(a)) return [];
    const seen = new Set();
    return a
      .filter((i) => i && typeof i.id === 'string' && Number(i.qty) >= 1 && findProduct(i.id) && !seen.has(i.id) && seen.add(i.id))
      .slice(0, 50)
      .map((i) => ({ id: i.id, qty: clamp(i.qty) }));
  } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* penyimpanan penuh/nonaktif */ }
  }, [items]);

  // Sinkron antar-tab.
  useEffect(() => {
    const on = (e) => { if (e.key === KEY) setItems(load()); };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);

  const value = useMemo(() => {
    const lines = items.map((i) => ({ ...findProduct(i.id), qty: i.qty })).filter((l) => l.id);
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.price * l.qty, 0),
      qtyOf: (id) => items.find((i) => i.id === id)?.qty || 0,
      add: (id, qty = 1) => {
        if (!findProduct(id)) return;
        setItems((c) => c.some((i) => i.id === id)
          ? c.map((i) => (i.id === id ? { ...i, qty: clamp(i.qty + qty) } : i))
          : [...c, { id, qty: clamp(qty) }]);
      },
      setQty: (id, qty) => setItems((c) => (Number(qty) < 1
        ? c.filter((i) => i.id !== id)
        : c.map((i) => (i.id === id ? { ...i, qty: clamp(qty) } : i)))),
      remove: (id) => setItems((c) => c.filter((i) => i.id !== id)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);
