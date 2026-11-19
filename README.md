# Nasi Kampus Samarinda 

Proyek Capstone **Asah 2026 (A26-CS079)**. Aplikasi web pemesanan katering **Nasi Kotak** dan **Snack Box** untuk UMKM **Nasi Kampus Samarinda**, dibangun dengan **React 19 + Vite + React Router 7 + CSS**.

## 1. Cara Menjalankan Proyek

```bash
npm install
npm run dev      # menjalankan server pengembangan lokal
npm run build    # membangun bundle produksi ke folder dist/
npm run preview  # meninjau hasil build produksi
```

## 2. Daftar Menu Resmi yang Sudah Diterapkan

### Paket Nasi Kotak (8 Pilihan)
1. **Paket 1 (Rp 12.000)** — Nasi, Ayam Krispi, Lalapan, Sambel Sachet *(Kemasan: Styrofoam)*
2. **Paket 2 (Rp 15.000) 🔥 Best Seller** — Nasi, Ayam Krispi, Lalapan, Tempe, Sambel, AMDK, Sendok
3. **Paket 2 Ayam Bumbu (Rp 17.000)** — Nasi, Ayam Bumbu, Lalapan, Tempe, Sambel, AMDK, Sendok
4. **Paket 3 (Rp 17.000)** — Nasi, Ayam Serondeng, Lalapan, Tempe, Sambel Ijo, Sendok
5. **Paket 4 (Rp 20.000) 🔥 Best Seller** — Nasi, Ayam Serondeng/Bumbu, Lalapan, Tempe, Sambel Ijo, AMDK, Buah, Kerupuk, Sendok
6. **Paket 5 (Rp 25.000)** — Nasi, Ayam Juragan / Ikan Nila, Lalapan, Sambel Ijo, Tempe, Sendok *(Kemasan: Kotak Motif)*
7. **Paket Spesial (Rp 30.000)** — Nasi, Ayam Juragan, Lalapan, Tempe, Sambel Ijo, Buah, Kerupuk, Sendok, AMDK
8. **Paket Bebek (Rp 33.000)** — Nasi, Bebek Juragan, Lalapan, Tempe, Sambel Ijo, Sendok *(Kemasan: Kotak Motif)*

### Pilihan Snack Box (6 Pilihan)
1. **Snack Box 1 (Rp 5.000)** — Air mineral gelas (AMDK), 2 kue, dan permen
2. **Snack Box 2 (Rp 7.000)** — Air mineral gelas (AMDK), 3 kue, dan permen
3. **Snack Box 3 (Rp 10.000)** — Air mineral gelas (AMDK), 4 kue, permen, dan kotak warna
4. **Snack Box 4 (Rp 12.000)** — Teh kotak (STee), 4 kue, permen, dan kotak warna
5. **Snack Box 5 (Rp 15.000)** — Teh kotak (STee), 5 kue, permen, dan kotak warna
6. **Snack Premium (Rp 25.000)** — Teh Kotak, 3 kue premium, permen, dan kotak warna

## 3. Struktur Folder Gambar (`public/assets/`)

Seluruh aset logo, hero, dan foto menu telah dirapikan ke dalam folder berikut (lihat juga [`public/assets/PANDUAN_GAMBAR.md`](./public/assets/PANDUAN_GAMBAR.md)):

```text
public/assets/
├── logo/
│   └── logo-nasi-kampus.svg          # Logo resmi (dari src/logo nasi kampus.svg)
├── hero/
│   └── nasi-kotak-hero.svg           # Gambar Hero utama (dari src/nasi kotak hero.svg)
└── menu/
    ├── nasi-kotak/                   # 8 foto menu Paket Nasi Kotak
    │   ├── paket-1.jpg
    │   ├── paket-2.jpg
    │   ├── paket-2-ayam-bumbu.jpg
    │   ├── paket-3.jpg
    │   ├── paket-4.jpg
    │   ├── paket-5.jpg
    │   ├── paket-spesial.jpg
    │   └── paket-bebek.jpg
    └── snack-box/                    # 6 foto menu Snack Box
        ├── snack-box-1.jpg
        ├── snack-box-2.jpg
        ├── snack-box-3.jpg
        ├── snack-box-4.jpg
        ├── snack-box-5.jpg
        └── snack-premium.jpg
```

Untuk mengganti foto dummy dengan foto asli: cukup timpa file di dalam `public/assets/menu/nasi-kotak/` atau `public/assets/menu/snack-box/` menggunakan nama file yang sama, atau sesuaikan path di [`src/data/images.js`](./src/data/images.js).

## 4. Kontak Resmi & Konfigurasi

Diatur terpusat di [`src/config.js`](./src/config.js):
- **WhatsApp Admin**: `+62 813-5097-1640` (`6281350971640`)
- **Email**: `nasikampussamarinda@gmail.com`
