# Panduan Menaruh Gambar — Nasi Kampus Samarinda

Seluruh file gambar aset disimpan di dalam folder `public/assets/` dengan struktur yang sudah dirapikan berdasarkan jenisnya. Anda cukup **menimpa (replace)** file dengan nama yang sama, atau mengubah path di `src/data/images.js`.

## Struktur Folder Gambar

```text
public/assets/
├── logo/
│   └── logo-nasi-kampus.svg          # Logo resmi Nasi Kampus Samarinda (diambil dari src/logo nasi kampus.svg)
├── hero/
│   └── nasi-kotak-hero.svg           # Gambar utama bagian Hero beranda (diambil dari src/nasi kotak hero.svg)
└── menu/
    ├── nasi-kotak/                   # Folder foto menu Paket Nasi Kotak (8 menu)
    │   ├── paket-1.jpg               # Paket 1 (Rp12.000) — Styrofoam
    │   ├── paket-2.jpg               # Paket 2 (Rp15.000) — Best Seller
    │   ├── paket-2-ayam-bumbu.jpg    # Paket 2 Ayam Bumbu (Rp17.000)
    │   ├── paket-3.jpg               # Paket 3 (Rp17.000)
    │   ├── paket-4.jpg               # Paket 4 (Rp20.000) — Best Seller
    │   ├── paket-5.jpg               # Paket 5 (Rp25.000) — Kotak Motif
    │   ├── paket-spesial.jpg         # Paket Spesial (Rp30.000)
    │   └── paket-bebek.jpg           # Paket Bebek (Rp33.000) — Kotak Motif
    └── snack-box/                    # Folder foto menu Snack Box (6 menu)
        ├── snack-box-1.jpg           # Snack Box 1 (Rp5.000)
        ├── snack-box-2.jpg           # Snack Box 2 (Rp7.000)
        ├── snack-box-3.jpg           # Snack Box 3 (Rp10.000)
        ├── snack-box-4.jpg           # Snack Box 4 (Rp12.000)
        ├── snack-box-5.jpg           # Snack Box 5 (Rp15.000)
        └── snack-premium.jpg         # Snack Premium (Rp25.000)
```

## Cara Mengganti Foto Menu Nanti
1. Siapkan foto menu (disarankan rasio **4:3** atau **1:1**, format `.jpg`, `.png`, atau `.webp`).
2. Jika menggunakan format `.jpg` dan nama file sesuai tabel di atas, langsung timpa file di dalam `public/assets/menu/nasi-kotak/` atau `public/assets/menu/snack-box/`.
3. Jika menggunakan ekstensi lain (misalnya `.png` atau `.webp`), sesuaikan nama ekstensinya di file `src/data/images.js`.
