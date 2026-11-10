# Hansome Hair Tonic — 3D Product Showcase Landing Page

Website landing page promosi dan penjualan untuk produk kewirausahaan **Hansome Hair Tonic**, menampilkan **Hero 3D Product Showcase** interaktif berbasis model 3D Blender `.glb` untuk dua produk utama:
- **Hair Tonic Papermint** (60 ml: Rp15.000 | 100 ml: Rp25.000)
- **Hair Tonic Gingseng** (60 ml: Rp15.000 | 100 ml: Rp25.000)

Pembelian langsung diarahkan ke **Shopee Official Store** ([id.shp.ee/e5fEvsRw](https://id.shp.ee/e5fEvsRw)).

---

## Fitur Utama

- **Hero 3D Showcase Reaktif**: Single-canvas Three.js WebGL renderer dengan pencahayaan efisien, normalisasi pivot/bounding box otomatis, dan transisi sinkron antara model 3D dan kartu informasi HTML.
- **Auto-Switch & Manual Switch**: Pergantian otomatis ~5 detik atau manual melalui dua indicator tab, dilengkapi selector varian ukuran (60 ml & 100 ml) yang dinamis.
- **Dual Bottle Caching**: Preload dan cache kedua model (`hair-tonic-fresh.glb` dan `hair-tonic-grow.glb`) tanpa duplikasi scene atau render loop.
- **Motion & Scrolling Halus**: GSAP timeline untuk entrance sequence & product switching, GSAP ScrollTrigger untuk scroll reveal, dan Lenis untuk smooth scrolling yang terintegrasi.
- **Aksesibilitas & Fallback**: Mendukung `prefers-reduced-motion`, navigasi keyboard penuh (FAQ accordion & tablist), serta poster image fallback 2D jika WebGL gagal dimuat.
- **Desain Responsif**: Dioptimalkan untuk desktop, tablet, dan mobile tanpa tabrakan badge floating atau horizontal overflow.

---

## Teknologi Utama

- **HTML5 & CSS3 Modular** (`css/base.css`, `css/components.css`, `css/hero.css`, `css/sections.css`, `css/responsive.css`)
- **JavaScript ES Modules** (`js/main.js`, `js/config.js`, `js/scene3d.js`, `js/switcher.js`, `js/motion.js`, `js/ui.js`)
- **Three.js + GLTFLoader** — Satu `Scene`, satu `PerspectiveCamera`, satu `WebGLRenderer`, satu `<canvas>`, dan satu render loop.
- **GSAP + GSAP ScrollTrigger** — Hero entrance sequence, transisi sinkron 3D & HTML, serta scroll reveal.
- **Lenis** — Smooth scrolling yang disinkronkan dengan GSAP ScrollTrigger.
- **Vite** — Build bundler cepat untuk produksi.

---

## Cara Menjalankan Project

Pastikan **Node.js** (v18+) sudah terinstal, lalu jalankan perintah berikut di terminal:

```bash
# 1. Instal dependencies
npm install

# 2. Jalankan development server lokal
npm run dev

# 3. Build bundle untuk produksi
npm run build

# 4. Preview hasil build produksi
npm run preview
```

---

## Konfigurasi Data Produk & Akun Resmi

Seluruh data produk, harga varian, tautan toko daring, media sosial, FAQ, dan testimoni dikelola terpusat di satu file:

- **[`js/config.js`](./js/config.js)**
  - `siteConfig.shopUrl`: Tautan tujuan tombol beli (Shopee Official Store: `https://id.shp.ee/e5fEvsRw`).
  - `siteConfig.socials`: Akun media sosial resmi (Instagram & TikTok `@hansome.hairtonic`).
  - `siteConfig.onlineShops`: Daftar toko daring resmi.
  - `products`: Pengaturan nama varian, deskripsi, badges, dan daftar harga botol (60 ml & 100 ml).
  - `pricingPackages`: Paket komparasi bundling.
  - `testimonialsData`: Ulasan konsumen.
  - `faqData`: Tanya jawab interaktif produk.

