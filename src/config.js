// Pengaturan bisnis & kontak resmi Nasi Kampus Samarinda.
// Semua nilai di file ini AMAN untuk bundle klien (tidak ada kunci API / kredensial rahasia).
export const CONFIG = {
  brand: 'Nasi Kampus Samarinda',
  city: 'Samarinda, Kalimantan Timur',
  email: 'nasikampussamarinda@gmail.com',

  demoMode: false,

  // Nomor WhatsApp resmi admin (+62 813-5097-1640)
  whatsappNumber: '6281350971640',
  whatsappDisplay: '+62 813-5097-1640',
  whatsappIsPlaceholder: false,

  mock: {
    latencyMs: 0,
    submitLatencyMs: 120,
  },

  order: {
    minLeadDays: 0,
    minTotalQty: 0,
    maxQtyPerItem: 99,
    notesMaxLength: 300,
    askAddress: false,
    askPickupMethod: false,
  },
};

export const isWhatsAppReady = () =>
  !CONFIG.whatsappIsPlaceholder && /^628[1-9][0-9]{7,11}$/.test(CONFIG.whatsappNumber);
