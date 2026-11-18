# Toko Frozen Food — Website E-Commerce B2C

Website toko frozen food yang **berfungsi penuh**: katalog dengan foto makanan nyata, pencarian &
filter, halaman detail produk, keranjang persisten, checkout melalui WhatsApp, microblog, serta
dashboard administrator dengan CRUD produk, kategori, artikel, manajemen stok, dan pengaturan toko.

Seluruh data demo tersimpan di peramban (localStorage + IndexedDB), sehingga proyek dapat dijalankan
tanpa backend — dan struktur penyimpanannya dibuat modular agar mudah diganti dengan API/database
sungguhan.

---

## 1. Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 (design token di `src/index.css`) |
| Routing | React Router v7 (SPA) |
| Animasi | Three.js — WebGPU (`three/webgpu`) dengan fallback WebGL |
| Ikon | lucide-react |
| Penyimpanan data | localStorage (produk, kategori, artikel, pengaturan, keranjang) |
| Penyimpanan foto | IndexedDB (foto unggahan admin), aset WebP untuk katalog contoh |
| Package manager | npm (lockfile `package-lock.json`) |

Tidak ada database eksternal, tidak ada layanan pihak ketiga yang wajib dikonfigurasi.

---

## 2. Struktur direktori

```
.
├── index.html                      # HTML entry, font Inter + Playfair Display
├── vite.config.ts                  # dev server 0.0.0.0:3000, alias @, Tailwind plugin
├── tsconfig.json
├── package.json
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── products/               # 20 foto produk (WebP, 4:3, 1200px)
│       ├── articles/               # 5 foto artikel (WebP, 16:9, 1600px)
│       ├── editorial/              # foto suasana toko
│       └── credits.json            # metadata sumber & lisensi setiap foto
├── docs/
│   └── IMAGE_CREDITS.md            # tabel kredit foto
└── src/
    ├── App.tsx                     # definisi seluruh route publik & admin
    ├── main.tsx                    # provider: Toast → AppData → Cart → Router
    ├── index.css                   # token warna, tipografi, komponen (btn, field, card)
    ├── types.ts                    # tipe domain (Product, Category, Article, Settings, Cart)
    ├── data/seed.ts                # data contoh: 20 produk, 8 kategori, 5 artikel, testimoni
    ├── lib/
    │   ├── format.ts               # rupiah, tanggal, slug, WhatsApp message builder
    │   ├── storage.ts              # wrapper localStorage (nama key + versi)
    │   ├── imageStore.ts           # IndexedDB untuk foto unggahan + validasi berkas
    │   └── adminAuth.ts            # sesi admin demo
    ├── store/
    │   ├── AppDataContext.tsx      # state + CRUD + persistensi seluruh data toko
    │   ├── CartContext.tsx         # keranjang + validasi stok + persistensi
    │   └── ToastContext.tsx        # notifikasi (aria-live)
    ├── hooks/
    │   └── useImageSrc.ts          # resolve aset / foto IndexedDB → object URL
    ├── components/
    │   ├── Brand.tsx               # logo (dapat diganti dari pengaturan)
    │   ├── public/                 # Header, Footer, ProductCard, FrostScene, layout
    │   ├── admin/                  # AdminLayout, ProductForm, ArticleForm, ImageUploader
    │   └── ui/                     # ProductImage, Reveal, ConfirmDialog, SectionHeading
    └── pages/
        ├── public/                 # Home, Catalog, ProductDetail, Category, Cart, About,
        │                           # Blog, BlogDetail, NotFound
        └── admin/                  # Login, Overview, Products, Categories, Articles,
                                    # Stock, Settings
```

---

## 3. Instalasi & menjalankan (development)

Prasyarat: **Node.js 20+** dan npm (proyek ini diuji pada Node 26).

```bash
# 1. Install dependensi (mengikuti package-lock.json)
npm ci

# 2. Jalankan dev server
npm run dev
```

Dev server berjalan di `http://localhost:3000` dan sudah membuka host `0.0.0.0` agar bisa
diakses dari perangkat lain / preview cloud.

Jika memakai Bun:

```bash
bun install
bun run dev
```

---

## 4. Build production & menjalankan hasil build

```bash
npm run build      # typecheck (tsc -b) + build ke folder dist/
npm run preview    # menyajikan dist/ di http://localhost:4173
```

Hasil build adalah **static site** murni (HTML + JS + CSS + gambar) di folder `dist/`.

---

## 5. Deployment

Karena aplikasi memakai client-side routing, hosting harus mengarahkan semua path ke `index.html`.

**Netlify** — buat `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** — framework preset: Vite; build command `npm run build`; output `dist`.
Tambahkan rewrite SPA (`vercel.json`):

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Cloudflare Pages** — build command `npm run build`, output `dist`.
Aturan `/* → /index.html (200)` melalui file `_redirects` di `public/` bila diperlukan.

**Nginx**

```nginx
server {
  listen 80;
  root /var/www/toko-frozen-food/dist;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
}
```

**Catatan:** seluruh data disimpan di peramban pengunjung. Untuk toko produksi, ganti lapisan
`src/lib/storage.ts` + `src/store/AppDataContext.tsx` dengan API backend dan pindahkan foto ke
object storage (S3/R2/Cloudinary). Antarmuka komponen tidak perlu diubah karena semua akses data
melewati context tersebut.

---

## 6. Login administrator (demo)

1. Buka `/admin/login` (atau klik **Login Admin** di footer).
2. Username: `admin` — Password: `admin`.
3. Setelah login Anda masuk ke `/admin` (Ringkasan). Tombol **Keluar** ada di sidebar.

> **Peringatan keamanan.** Autentikasi ini hanya demonstrasi di sisi browser (localStorage) dan
> **bukan sistem keamanan produksi**. Untuk website publik dibutuhkan backend autentikasi,
> password hashing (bcrypt/argon2), session management yang aman, rate limiting, serta kontrol
> akses di server.

---

## 7. Mengelola konten (dashboard)

| Menu | Fungsi |
| --- | --- |
| **Ringkasan** | Statistik produk/kategori/artikel, stok menipis & habis, nilai persediaan, aktivitas. |
| **Produk** | CRUD: nama, kategori, deskripsi, harga, harga diskon, berat, stok, status, label Best Seller/New, foto. Dilengkapi pencarian, filter kategori/status, dan pengurutan. |
| **Kategori** | CRUD kategori. Kategori yang masih dipakai produk **tidak dapat dihapus**. |
| **Microblog** | CRUD artikel + status Draft/Published dan tanggal publikasi. Artikel draf tidak tampil di publik. |
| **Manajemen Stok** | Ubah stok cepat (+/− atau input angka), filter stok menipis (≤10) dan habis. |
| **Pengaturan Toko** | Nama, tagline, deskripsi, logo, nomor WhatsApp, alamat, jam operasional, email, media sosial, catatan pengiriman, serta **Reset data demonstrasi**. |

Semua perubahan langsung tercermin pada halaman publik (state + localStorage diperbarui saat itu).

---

## 8. Mengganti foto produk

### a. Melalui dashboard (disarankan)

1. Masuk `/admin/produk` → **Tambah produk** atau **Edit** pada produk yang ada.
2. Klik area foto → pilih berkas. Pratinjau langsung tampil.
3. Format yang diterima: **JPG, PNG, WebP, AVIF**, maksimal **4 MB**.
4. Klik **Simpan produk**. Foto disimpan sebagai Blob di **IndexedDB**, bukan localStorage.
5. Tombol **Ganti** untuk mengganti foto, ikon tempat sampah untuk menghapusnya.

Foto yang hilang/gagal dimuat akan menampilkan status **“Foto belum tersedia”** — tidak pernah
diganti dengan ilustrasi atau gambar sintetis.

### b. Mengganti aset katalog contoh

Foto contoh berada di `public/images/products/<slug>.webp`. Ganti berkas dengan nama yang sama
(rasio 4:3, lebar ±1200 px, WebP) agar produk terkait otomatis memakai foto baru. Untuk produk
baru, unggah melalui dashboard.

Semua foto pada katalog ini adalah fotografi makanan nyata — daftar sumber dan lisensinya ada di
[`docs/IMAGE_CREDITS.md`](docs/IMAGE_CREDITS.md) dan `public/images/credits.json`.

---

## 9. Checkout via WhatsApp

1. Pelanggan menambahkan produk ke keranjang (jumlah dibatasi stok).
2. Di `/keranjang`, isi nama, nomor WhatsApp, alamat, dan catatan.
3. Tombol **Checkout via WhatsApp** membuka `https://wa.me/<nomor>?text=<pesan terenkode>`.
4. Pesan berisi: daftar produk, jumlah, harga satuan, subtotal per produk, total belanja, data
   pelanggan, dan catatan.

Nomor tujuan diambil dari **Pengaturan Toko** (dinormalisasi otomatis ke format `62…`), sehingga
dapat diubah tanpa menyentuh kode. Website tidak pernah mengklaim pesanan sudah dibayar/diterima —
konfirmasi dilakukan admin melalui WhatsApp.

---

## 10. Penyimpanan data & reset

| Key | Isi |
| --- | --- |
| `tff.v1.products` | Daftar produk |
| `tff.v1.categories` | Daftar kategori |
| `tff.v1.articles` | Daftar artikel |
| `tff.v1.settings` | Pengaturan toko |
| `tff.v1.cart` | Keranjang belanja |
| `tff.v1.admin-session` | Sesi admin demo |
| IndexedDB `tff-images` | Berkas foto unggahan (Blob) |

- Data contoh otomatis ditanam saat pertama kali dibuka.
- Jika kuota localStorage penuh, muncul peringatan di UI (bukan crash).
- **Reset data demonstrasi:** Pengaturan Toko → *Reset data demonstrasi* (menghapus juga seluruh
  foto unggahan di IndexedDB, lalu menanam ulang data contoh).

---

## 11. Animasi & performa

- `FrostScene` (hero) memakai Three.js dengan **WebGPU** bila perangkat mendukung, dan otomatis
  fallback ke **WebGL**. Jika keduanya tidak tersedia, latar gradasi CSS tetap tampil.
- Satu `InstancedMesh` untuk seluruh objek kristal (1 draw call), DPR dibatasi 1.6, animasi
  dihentikan saat tab tidak aktif atau canvas di luar viewport.
- Seluruh animasi menghormati `prefers-reduced-motion` (termasuk reveal on-scroll).
- Gambar memakai `loading="lazy"`, `decoding="async"`, dan format WebP; chunk Three.js dimuat
  terpisah (dynamic import) sehingga tidak memperlambat first paint.

---

## 12. Checklist fitur

- [x] Halaman publik: Beranda, Tentang Kami, Katalog, Kategori, Detail Produk, Keranjang, Microblog, Detail Artikel, 404
- [x] Header sticky, navigasi mobile, indikator jumlah keranjang
- [x] Pencarian, filter kategori, filter stok, filter promo, pengurutan harga/popularitas/terbaru/diskon
- [x] Detail produk: foto besar, harga & diskon, berat, stok, qty, tambah keranjang, pesan WhatsApp, produk terkait
- [x] Keranjang persisten + validasi stok + subtotal otomatis + empty state
- [x] Checkout WhatsApp dengan format pesan lengkap & validasi form
- [x] Login admin demo + logout + proteksi route
- [x] CRUD produk, kategori, artikel; manajemen stok; pengaturan toko; upload foto (IndexedDB)
- [x] Testimoni dengan keterangan konten demonstrasi
- [x] Loading, empty, error, success, confirmation dialog, validasi form, fallback gambar
- [x] Responsif mobile-first, semantic HTML, label form, fokus keyboard terlihat, alt text
- [x] Animasi WebGPU/WebGL + reduced motion

---

## 13. Lisensi & kredit

Kode proyek bebas dipakai dan dikembangkan. Foto katalog berasal dari Wikimedia Commons
(termasuk impor Unsplash/Pixabay/Pexels) dengan lisensi CC0, CC BY, atau CC BY-SA — lihat
[`docs/IMAGE_CREDITS.md`](docs/IMAGE_CREDITS.md) untuk atribusi lengkap sebelum publikasi komersial.
