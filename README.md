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

## 5. Business Intelligence & Analytics (Data Science)

Dashboard analitik penjualan, komposisi kategori menu, dan rincian pengeluaran bahan baku terhubung langsung dengan dataset transaksi UMKM menggunakan **Google Looker Studio**.

- **Link Dashboard Interaktif** [Buka Dashboard Bisnis - Nasi Kampus Samarinda](https://datastudio.google.com/reporting/7124f91e-11b9-413e-9b3a-454568050ddb)
- **URL Embed** `https://datastudio.google.com/embed/reporting/7124f91e-11b9-413e-9b3a-454568050ddb/page/XuxDG`
- **Kode Sematan (`<iframe>`) untuk Web**
  ```html
  <iframe width="600" height="450" src="[https://datastudio.google.com/embed/reporting/7124f91e-11b9-413e-9b3a-454568050ddb/page/XuxDG](https://datastudio.google.com/embed/reporting/7124f91e-11b9-413e-9b3a-454568050ddb/page/XuxDG)" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>

Ringkasan Metrik Utama
- Total Omzet Rp 862.940.000 dari 500 transaksi (50.180 porsi terjual)
- Total Pengeluaran Bahan Baku Rp 29.651.000 (pengeluaran tertinggi pada Ayam Potong Broiler dan Beras Premium)
- Proporsi Penjualan Nasi Kotak (67,9%) dan Snack Box (32,1%)

Arsip Data Science
- schema_nasi_kampus.sql — Skema relasional database MySQL (nasi_kampus_db)
- dummy_nasikampus.ipynb — Generator dataset simulasi transaksi berbasis 14 menu
- EDA_Nasi_Kampus_Samarinda.ipynb — Data Wrangling, Exploratory Data Analysis (EDA), dan pembersihan dataset
- dataset_pesanan_clean_for_ai.csv — Dataset bersih beserta fitur label_prioritas_ai untuk pelatihan model klasifikasi AI

## 6. AI Model Development (AI Engineer)

Pengembangan model Machine Learning untuk klasifikasi prioritas pesanan UMKM Nasi Kampus Samarinda menggunakan Python dan Scikit-learn dengan algoritma **Logistic Regression** dan **Random Forest**.

- Model Terpilih: Random Forest Classifier (Accuracy 100% pada data testing).
- Fitur Input: Total Porsi dan Lead Time Hari.
- Kategori Prediksi: Normal, Sedang, dan Tinggi.
- Dataset: 500 data pesanan dari dataset Data Science.
- File Model: random_forest_nasikampus.pkl - Model hasil training yang disimpan.
- File ipynb: AI_Model_Nasi_Kampus_Samarinda.ipynb - Pengembangan model ML, mulai dari data preparation, training, evaluasi, hingga penyimpanan model.
