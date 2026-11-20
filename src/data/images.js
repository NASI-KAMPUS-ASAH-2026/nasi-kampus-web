// PEMETAAN GAMBAR TERPUSAT — satu-satunya file untuk mengatur lokasi gambar.
// Lihat panduan lengkap di /public/assets/PANDUAN_GAMBAR.md

export const BRAND_LOGO = '/assets/logo/logo-nasi-kampus.png';
export const HERO_IMAGE = '/assets/hero/nasi-kotak-hero.svg';

const NASI_DIR = '/assets/menu/nasi-kotak';
const SNACK_DIR = '/assets/menu/snack-box';

export const PRODUCT_IMAGES = {
  // Paket Nasi Kotak (8 pilihan)
  'paket-1': `${NASI_DIR}/paket-1.jpg`,
  'paket-2': `${NASI_DIR}/paket-2.jpg`,
  'paket-2-ayam-bumbu': `${NASI_DIR}/paket-2-ayam-bumbu.jpg`,
  'paket-3': `${NASI_DIR}/paket-3.jpg`,
  'paket-4': `${NASI_DIR}/paket-4.jpg`,
  'paket-5': `${NASI_DIR}/paket-5.jpg`,
  'paket-spesial': `${NASI_DIR}/paket-spesial.jpg`,
  'paket-bebek': `${NASI_DIR}/paket-bebek.jpg`,

  // Snack Box (6 pilihan)
  'snack-box-1': `${SNACK_DIR}/snack-box-1.jpg`,
  'snack-box-2': `${SNACK_DIR}/snack-box-2.jpg`,
  'snack-box-3': `${SNACK_DIR}/snack-box-3.jpg`,
  'snack-box-4': `${SNACK_DIR}/snack-box-4.jpg`,
  'snack-box-5': `${SNACK_DIR}/snack-box-5.jpg`,
  'snack-premium': `${SNACK_DIR}/snack-premium.jpg`,
};

// true selama foto produk individual masih menggunakan foto dummy sementara
export const IMAGES_ARE_ILLUSTRATIVE = true;
