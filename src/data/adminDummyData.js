// Data dummy Admin Dashboard — pisahkan dari komponen UI agar mudah diintegrasikan backend.
// Tidak ada integrasi database; semua state dikelola di React lokal.

export const ADMIN_DUMMY_ORDERS = [
  {
    id: 'NK-202611-001',
    customerName: 'HIMA Teknik Unmul',
    customerPhone: '0812-3456-7890',
    orderDate: '2026-11-23',
    pickupDate: '2026-11-25',
    pickupTime: '10:00',
    items: [
      { menuName: 'Nasi Kampus Ayam', qty: 50, unitPrice: 18000, subtotal: 900000 },
      { menuName: 'Es Teh Manis', qty: 50, unitPrice: 5000, subtotal: 250000 },
    ],
    total: 1150000,
    notes: 'Mohon sambal dipisah untuk 20 porsi.',
    status: 'Menunggu Konfirmasi',
    paymentStatus: 'Belum Dibayar',
    totalPaid: 0,
    payments: [],
    editHistory: [],
  },
  {
    id: 'NK-202611-002',
    customerName: 'BEM FKIP Samarinda',
    customerPhone: '0813-2345-6789',
    orderDate: '2026-11-22',
    pickupDate: '2026-11-24',
    pickupTime: '11:00',
    items: [
      { menuName: 'Nasi Kampus Ikan', qty: 30, unitPrice: 17000, subtotal: 510000 },
    ],
    total: 510000,
    notes: '',
    status: 'Dikonfirmasi',
    paymentStatus: 'DP',
    totalPaid: 255000,
    payments: [
      { date: '2026-11-22', amount: 255000, method: 'Transfer Bank', recordedBy: 'Admin', notes: 'DP 50%' },
    ],
    editHistory: [],
  },
  {
    id: 'NK-202611-003',
    customerName: 'Panitia Seminar FEB',
    customerPhone: '0811-9876-5432',
    orderDate: '2026-11-21',
    pickupDate: '2026-11-23',
    pickupTime: '09:00',
    items: [
      { menuName: 'Snack Box 4', qty: 100, unitPrice: 25000, subtotal: 2500000 },
    ],
    total: 2500000,
    notes: 'Untuk acara seminar pukul 10.00 WITA.',
    status: 'Sedang Dipersiapkan',
    paymentStatus: 'DP',
    totalPaid: 1250000,
    payments: [
      { date: '2026-11-21', amount: 1250000, method: 'Transfer Bank', recordedBy: 'Admin', notes: 'DP 50%' },
    ],
    editHistory: [],
  },
  {
    id: 'NK-202611-004',
    customerName: 'Kantor Kelurahan Sidodadi',
    customerPhone: '0812-1111-2222',
    orderDate: '2026-11-20',
    pickupDate: '2026-11-22',
    pickupTime: '12:00',
    items: [
      { menuName: 'Nasi Kampus Ayam', qty: 25, unitPrice: 18000, subtotal: 450000 },
      { menuName: 'Air Mineral Botol', qty: 25, unitPrice: 4000, subtotal: 100000 },
    ],
    total: 550000,
    notes: '',
    status: 'Siap Dijemput',
    paymentStatus: 'DP',
    totalPaid: 275000,
    payments: [
      { date: '2026-11-20', amount: 275000, method: 'Tunai', recordedBy: 'Admin', notes: '' },
    ],
    editHistory: [],
  },
  {
    id: 'NK-202611-005',
    customerName: 'UKM Paduan Suara',
    customerPhone: '0813-3333-4444',
    orderDate: '2026-11-19',
    pickupDate: '2026-11-21',
    pickupTime: '10:00',
    items: [
      { menuName: 'Nasi Kampus Ikan', qty: 20, unitPrice: 17000, subtotal: 340000 },
    ],
    total: 340000,
    notes: '',
    status: 'Selesai',
    paymentStatus: 'Lunas',
    totalPaid: 340000,
    payments: [
      { date: '2026-11-19', amount: 170000, method: 'Transfer Bank', recordedBy: 'Admin', notes: 'DP' },
      { date: '2026-11-21', amount: 170000, method: 'Tunai', recordedBy: 'Admin', notes: 'Pelunasan' },
    ],
    editHistory: [],
  },
  {
    id: 'NK-202611-006',
    customerName: 'Lab Sipil Unmul',
    customerPhone: '0812-5555-6666',
    orderDate: '2026-11-23',
    pickupDate: '2026-11-26',
    pickupTime: '11:30',
    items: [
      { menuName: 'Snack Box 2', qty: 40, unitPrice: 20000, subtotal: 800000 },
    ],
    total: 800000,
    notes: 'Tanpa kacang untuk 5 porsi.',
    status: 'Menunggu Konfirmasi',
    paymentStatus: 'Belum Dibayar',
    totalPaid: 0,
    payments: [],
    editHistory: [],
  },
  {
    id: 'NK-202611-007',
    customerName: 'Rapat Prodi Manajemen',
    customerPhone: '0811-7777-8888',
    orderDate: '2026-11-22',
    pickupDate: '2026-11-25',
    pickupTime: '08:00',
    items: [
      { menuName: 'Nasi Kampus Ayam', qty: 15, unitPrice: 18000, subtotal: 270000 },
      { menuName: 'Snack Box 1', qty: 15, unitPrice: 15000, subtotal: 225000 },
    ],
    total: 495000,
    notes: '',
    status: 'Dikonfirmasi',
    paymentStatus: 'DP',
    totalPaid: 247500,
    payments: [
      { date: '2026-11-22', amount: 247500, method: 'Transfer Bank', recordedBy: 'Admin', notes: 'DP 50%' },
    ],
    editHistory: [],
  },
  {
    id: 'NK-202611-008',
    customerName: 'Ibu Rina Kusuma',
    customerPhone: '0812-9999-0000',
    orderDate: '2026-11-21',
    pickupDate: '2026-11-24',
    pickupTime: '14:00',
    items: [
      { menuName: 'Nasi Kampus Ayam', qty: 10, unitPrice: 18000, subtotal: 180000 },
    ],
    total: 180000,
    notes: 'Diambil pukul 14.00 WITA tepat.',
    status: 'Dikonfirmasi',
    paymentStatus: 'Belum Dibayar',
    totalPaid: 0,
    payments: [],
    editHistory: [],
  },
  {
    id: 'NK-202611-009',
    customerName: 'Keluarga Bpk. Ahmad',
    customerPhone: '0813-1234-5678',
    orderDate: '2026-11-20',
    pickupDate: '2026-11-22',
    pickupTime: '10:30',
    items: [
      { menuName: 'Snack Box 4', qty: 60, unitPrice: 25000, subtotal: 1500000 },
    ],
    total: 1500000,
    notes: '',
    status: 'Selesai',
    paymentStatus: 'Lunas',
    totalPaid: 1500000,
    payments: [
      { date: '2026-11-20', amount: 750000, method: 'Transfer Bank', recordedBy: 'Admin', notes: 'DP' },
      { date: '2026-11-22', amount: 750000, method: 'Transfer Bank', recordedBy: 'Admin', notes: 'Pelunasan' },
    ],
    editHistory: [],
  },
  {
    id: 'NK-202611-010',
    customerName: 'Panitia Diklat Mahasiswa',
    customerPhone: '0812-4444-5555',
    orderDate: '2026-11-23',
    pickupDate: '2026-11-27',
    pickupTime: '09:30',
    items: [
      { menuName: 'Nasi Kampus Ayam', qty: 80, unitPrice: 18000, subtotal: 1440000 },
      { menuName: 'Es Teh Manis', qty: 80, unitPrice: 5000, subtotal: 400000 },
    ],
    total: 1840000,
    notes: 'Acara diklat 2 hari, pengambilan hari pertama.',
    status: 'Menunggu Konfirmasi',
    paymentStatus: 'Belum Dibayar',
    totalPaid: 0,
    payments: [],
    editHistory: [],
  },
  {
    id: 'NK-202611-011',
    customerName: 'Komunitas Masjid Kampus',
    customerPhone: '0811-2345-6789',
    orderDate: '2026-11-18',
    pickupDate: '2026-11-20',
    pickupTime: '11:00',
    items: [
      { menuName: 'Nasi Kampus Ikan', qty: 35, unitPrice: 17000, subtotal: 595000 },
    ],
    total: 595000,
    notes: '',
    status: 'Selesai',
    paymentStatus: 'Lunas',
    totalPaid: 595000,
    payments: [
      { date: '2026-11-18', amount: 300000, method: 'Tunai', recordedBy: 'Admin', notes: 'DP' },
      { date: '2026-11-20', amount: 295000, method: 'Tunai', recordedBy: 'Admin', notes: 'Pelunasan' },
    ],
    editHistory: [],
  },
  {
    id: 'NK-202611-012',
    customerName: 'Bpk. Darmawan',
    customerPhone: '0813-6789-0123',
    orderDate: '2026-11-22',
    pickupDate: '2026-11-24',
    pickupTime: '13:00',
    items: [
      { menuName: 'Snack Box 2', qty: 20, unitPrice: 20000, subtotal: 400000 },
    ],
    total: 400000,
    notes: '',
    status: 'Ditolak',
    paymentStatus: 'Belum Dibayar',
    totalPaid: 0,
    payments: [],
    editHistory: [
      { changedAt: '2026-11-22T14:00:00', description: 'Pesanan ditolak: stok menu tidak tersedia untuk tanggal tersebut.' },
    ],
  },
  {
    id: 'NK-202611-013',
    customerName: 'Ibu Maya Putri',
    customerPhone: '0812-8888-9999',
    orderDate: '2026-11-21',
    pickupDate: '2026-11-23',
    pickupTime: '10:00',
    items: [
      { menuName: 'Nasi Kampus Ayam', qty: 12, unitPrice: 18000, subtotal: 216000 },
    ],
    total: 216000,
    notes: 'Mohon dikemas rapi.',
    status: 'Siap Dijemput',
    paymentStatus: 'DP',
    totalPaid: 108000,
    payments: [
      { date: '2026-11-21', amount: 108000, method: 'Transfer Bank', recordedBy: 'Admin', notes: 'DP 50%' },
    ],
    editHistory: [],
  },
  {
    id: 'NK-202611-014',
    customerName: 'Klinik Sehat Samarinda',
    customerPhone: '0812-6666-7777',
    orderDate: '2026-11-17',
    pickupDate: '2026-11-19',
    pickupTime: '12:00',
    items: [
      { menuName: 'Snack Box 3', qty: 45, unitPrice: 22000, subtotal: 990000 },
    ],
    total: 990000,
    notes: '',
    status: 'Selesai',
    paymentStatus: 'Lunas',
    totalPaid: 990000,
    payments: [
      { date: '2026-11-17', amount: 495000, method: 'Transfer Bank', recordedBy: 'Admin', notes: 'DP' },
      { date: '2026-11-19', amount: 495000, method: 'Transfer Bank', recordedBy: 'Admin', notes: 'Pelunasan' },
    ],
    editHistory: [],
  },
  {
    id: 'NK-202611-015',
    customerName: 'Ibu Sari Wulandari',
    customerPhone: '0813-5555-6666',
    orderDate: '2026-11-23',
    pickupDate: '2026-11-28',
    pickupTime: '09:00',
    items: [
      { menuName: 'Nasi Kampus Ayam', qty: 25, unitPrice: 18000, subtotal: 450000 },
      { menuName: 'Air Mineral Botol', qty: 25, unitPrice: 4000, subtotal: 100000 },
    ],
    total: 550000,
    notes: 'Untuk arisan bulanan.',
    status: 'Menunggu Konfirmasi',
    paymentStatus: 'Belum Dibayar',
    totalPaid: 0,
    payments: [],
    editHistory: [],
  },
];

// Daftar pelanggan — diturunkan dari data pesanan
export function buildAdminCustomers(orders) {
  const map = new Map();
  for (const o of orders) {
    if (!map.has(o.customerPhone)) {
      map.set(o.customerPhone, {
        name: o.customerName,
        phone: o.customerPhone,
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: '',
      });
    }
    const c = map.get(o.customerPhone);
    c.orderCount += 1;
    if (o.paymentStatus === 'Lunas') c.totalSpent += o.total;
    if (!c.lastOrderDate || o.orderDate > c.lastOrderDate) c.lastOrderDate = o.orderDate;
  }
  return Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount);
}

// Status pesanan Admin
export const ADMIN_ORDER_STATUSES = [
  'Menunggu Konfirmasi',
  'Dikonfirmasi',
  'Ditolak',
  'Sedang Dipersiapkan',
  'Siap Dijemput',
  'Selesai',
];

// Status pembayaran Admin
export const ADMIN_PAYMENT_STATUSES = ['Belum Dibayar', 'DP', 'Lunas'];

// Metode pembayaran
export const PAYMENT_METHODS = ['Transfer Bank', 'QRIS', 'Tunai'];
