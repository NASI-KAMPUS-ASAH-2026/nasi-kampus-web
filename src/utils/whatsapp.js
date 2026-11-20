import { CONFIG, isWhatsAppReady } from '../config';
import { formatDate, rupiah } from './format';

export function buildOrderMessage(order) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return [
    `Halo admin ${CONFIG.brand}, saya ingin mengonfirmasi pesanan dengan kode ${order.id}.`,
    `Nama Pemesan: ${order.customer?.name || order.customerAlias || 'Pelanggan'}`,
    `Tanggal Dibutuhkan: ${formatDate(order.orderDate)}`,
    'Metode: Ambil Sendiri (Jemputan) di Outlet Nasi Kampus Samarinda',
    'Daftar Menu:',
    ...order.lines.map((l) => `- ${l.qty} porsi x ${l.name}`),
    `Estimasi Total: ${rupiah(order.total)}`,
    order.notes ? `Catatan: ${order.notes}` : null,
    'Mohon info ketersediaan slot dapur dan nomor rekening untuk transfer DP. Terima kasih.',
    origin ? `Pantau status pesanan: ${origin}/lacak-pesanan?kode=${order.id}` : null,
  ].filter(Boolean).join('\n');
}

/** Mengembalikan URL wa.me HANYA jika nomor resmi sudah dikonfigurasi; selain itu null. */
export function buildWhatsAppUrl(message) {
  if (!isWhatsAppReady()) return null;
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
