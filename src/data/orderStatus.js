// Status Pesanan Resmi Nasi Kampus Samarinda
// Mengikuti alur operasional: Web -> WhatsApp Handshake -> DP -> Dapur -> Jemput Sendiri (Tanpa Pengiriman Kurir)
export const ORDER_STATUSES = [
  {
    id: 'Menunggu Konfirmasi & DP',
    key: 'pending_dp',
    step: 1,
    short: 'Konfirmasi & DP',
    tone: 'warning',
    description: 'Pesanan telah tercatat di website. Silakan lanjutkan konfirmasi jadwal dan pembayaran DP ke admin WhatsApp.',
  },
  {
    id: 'DP Diterima & Masuk Antrean',
    key: 'dp_verified',
    step: 2,
    short: 'DP Diterima',
    tone: 'info',
    description: 'Pembayaran DP telah diverifikasi oleh admin. Jadwal dan slot dapur Nasi Kampus telah dikunci untuk acara Anda.',
  },
  {
    id: 'Sedang Dipersiapkan',
    key: 'cooking',
    step: 3,
    short: 'Sedang Dimasak',
    tone: 'orange',
    description: 'Bahan baku dan lauk sedang diolah, dimasak segar, dan dikemas higienis oleh tim dapur Nasi Kampus.',
  },
  {
    id: 'Menunggu Jemputan',
    key: 'ready_pickup',
    step: 4,
    short: 'Siap Dijemput',
    tone: 'orange',
    description: 'Paket nasi kotak / snack box sudah selesai dikemas dan siap dijemput di outlet/dapur Nasi Kampus Samarinda.',
  },
  {
    id: 'Selesai',
    key: 'completed',
    step: 5,
    short: 'Selesai',
    tone: 'success',
    description: 'Pesanan telah diambil oleh pemesan di outlet Nasi Kampus dan pelunasan pembayaran telah selesai.',
  },
  {
    id: 'Dibatalkan',
    key: 'cancelled',
    step: 0,
    short: 'Dibatalkan',
    tone: 'error',
    description: 'Pesanan dibatalkan berdasarkan kesepakatan bersama melalui WhatsApp.',
  },
];

// Tahapan berurutan untuk visual tracker / stepper pelanggan
export const TRACKING_STEPS = ORDER_STATUSES.filter((s) => s.step > 0).sort((a, b) => a.step - b.step);

export function statusMeta(id) {
  if (!id) return ORDER_STATUSES[0];
  // Normalisasi legacy fixtures
  const normalized = id === 'Menunggu Konfirmasi' || id === 'Menunggu' ? 'Menunggu Konfirmasi & DP'
    : id === 'Dikonfirmasi' ? 'DP Diterima & Masuk Antrean'
    : id === 'Diproses' ? 'Sedang Dipersiapkan'
    : id === 'Dalam Pengiriman' ? 'Menunggu Jemputan'
    : id;
  return ORDER_STATUSES.find((s) => s.id === normalized || s.key === id) || { id, short: id, tone: 'neutral', step: 1 };
}

