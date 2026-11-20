import { useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';
import { flyToCart } from '../utils/flyToCart';
import { CONFIG } from '../config';

/** Tambah ke keranjang + umpan balik (toast teraksesibel & animasi ke ikon keranjang). */
export function useAddToCart() {
  const { add, qtyOf } = useCart();
  const { show } = useToast();
  return useCallback((product, qty = 1, sourceEl) => {
    const current = qtyOf(product.id);
    const max = CONFIG.order.maxQtyPerItem;
    if (current >= max) {
      show(`Jumlah ${product.name} sudah maksimal (${max} porsi).`, { tone: 'error' });
      return false;
    }
    const added = Math.min(qty, max - current);
    add(product.id, added);
    flyToCart(sourceEl, product.image);
    show(`${added} × ${product.name} masuk keranjang`, { action: { to: '/cart', label: 'Lihat' } });
    return true;
  }, [add, qtyOf, show]);
}
