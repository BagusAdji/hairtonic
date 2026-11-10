/**
 * CENTRALIZED PRODUCT & SITE CONFIGURATION
 * ----------------------------------------
 * Ubah nama produk, harga, deskripsi, path model 3D, tautan Shopee,
 * media sosial, dan FAQ cukup dari file ini.
 */

export const siteConfig = {
  brand: {
    name: "HANSOME",
    fullName: "Hansome Hair Tonic",
    tagline: "Botanical Scalp & Hair Care Formula",
    logo: "/assets/logo/brand-logo.svg",
    bottlePreview: "/assets/logo/logo.png",
    year: 2026
  },
  // Tautan resmi toko online Shopee
  shopUrl: "https://id.shp.ee/e5fEvsRw",
  contact: {
    whatsappNumber: "6281234567890",
    isPlaceholderNumber: true,
    defaultGreeting: "Halo Tim Hansome Hair Tonic, saya ingin bertanya seputar produk:"
  },
  showcase: {
    autoSwitchMs: 5000,
    pauseOnHover: true,
    transitionDurationSec: 0.65
  },
  socials: [
    {
      name: "Instagram",
      handle: "@hansome.hairtonic",
      url: "https://www.instagram.com/hansome.hairtonic",
      icon: "instagram"
    },
    {
      name: "TikTok",
      handle: "@hansome.hairtonic",
      url: "https://www.tiktok.com/@hansome.hairtonic",
      icon: "tiktok"
    }
  ],
  onlineShops: [
    {
      name: "Shopee",
      label: "Shopee Official Store",
      handle: "hansome.hairtonic",
      url: "https://id.shp.ee/e5fEvsRw",
      badge: "Official Store",
      color: "#ee4d2d"
    }
  ],
  marqueeItems: [
    "BOTANICAL SCALP FORMULA",
    "PAPERMINT & GINSENG EXTRACT",
    "UKURAN 60 ML (RP15.000) & 100 ML (RP25.000)",
    "RINGAN & TIDAK LENGKET",
    "BELI LANGSUNG DI SHOPEE",
    "PERAWATAN KULIT KEPALA & RAMBUT"
  ]
};

export const products = [
  {
    id: "fresh",
    code: "01",
    name: "Hair Tonic Papermint",
    subtitle: "Peppermint Daily Refresh",
    price: "Rp15.000",
    priceRange: "Rp15.000 – Rp25.000",
    volume: "60 ml & 100 ml",
    defaultVolume: "100 ml",
    defaultPrice: "Rp25.000",
    variants: [
      { volume: "60 ml", price: "Rp15.000", rawPrice: 15000, note: "Praktis Bepergian" },
      { volume: "100 ml", price: "Rp25.000", rawPrice: 25000, note: "Ukuran Reguler" }
    ],
    positioning: "Daily / Fresh Hair Care",
    description:
      "Perawatan rambut untuk penggunaan sehari-hari dengan ekstrak Peppermint dan Menthol yang memberi sensasi sejuk menyegarkan serta menjaga kenyamanan kulit kepala.",
    longDescription:
      "Diformulasikan untuk aktivitas harian, Hair Tonic Papermint memadukan ekstrak daun Peppermint, Menthol, Panthenol, dan Niacinamide. Tekstur cairannya ringan seperti air, cepat meresap tanpa rasa lengket, serta membantu menjaga kesegaran kulit kepala sepanjang hari. Tersedia dalam ukuran 60 ml (Rp15.000) dan 100 ml (Rp25.000).",
    model: "/assets/models/hair-tonic-fresh.glb",
    fallbackImage: "/assets/logo/logo.png",
    fallbackSvg: "/assets/images/fallback-fresh.svg",
    leftBadge: "Natural Care",
    leftBadgeDetail: "Peppermint & Vitamin E",
    rightBadge: "Fresh & Light",
    rightBadgeDetail: "Sejuk & Cepat Meresap",
    keyPoints: [
      "Memberi sensasi sejuk & dingin menyegarkan di kulit kepala",
      "Membantu menjaga kebersihan dan kenyamanan kulit kepala",
      "Tekstur ringan, tidak lengket, tidak membuat rambut lepek",
      "Pilihan ukuran: 60 ml (Rp15.000) dan 100 ml (Rp25.000)"
    ],
    ingredients:
      "Ekstrak Peppermint, Menthol, Vitamin E, Vitamin B2, Biotin, Niacinamide, Panthenol, Asam Laktat, dan Kafein.",
    theme: {
      accent: "#2e7d32",
      accentSoft: "rgba(46, 125, 50, 0.14)",
      glow: "rgba(76, 175, 80, 0.28)",
      liquidHex: 0x1b8a2a,
      glassTintHex: 0xdff5e1
    },
    shopeeUrl: "https://id.shp.ee/e5fEvsRw"
  },
  {
    id: "grow",
    code: "02",
    name: "Hair Tonic Gingseng",
    subtitle: "Ginseng Scalp & Root Care",
    price: "Rp15.000",
    priceRange: "Rp15.000 – Rp25.000",
    volume: "60 ml & 100 ml",
    defaultVolume: "100 ml",
    defaultPrice: "Rp25.000",
    variants: [
      { volume: "60 ml", price: "Rp15.000", rawPrice: 15000, note: "Praktis Bepergian" },
      { volume: "100 ml", price: "Rp25.000", rawPrice: 25000, note: "Ukuran Reguler" }
    ],
    positioning: "Scalp / Root Care",
    description:
      "Perawatan kulit kepala dan rambut dengan ekstrak Ginseng, Pro-Vitamin B5, dan Niacinamide untuk membantu merawat kekuatan akar rambut.",
    longDescription:
      "Hair Tonic Gingseng menggabungkan ekstrak akar Ginseng pilihan dengan Vitamin E, Vitamin B5 (Panthenol), Niacinamide, dan Kafein. Dirancang untuk membantu merawat kondisi kulit kepala, menjaga kelembapan alami, dan mendukung perawatan rambut agar tampak sehat dan terawat. Tersedia dalam ukuran 60 ml (Rp15.000) dan 100 ml (Rp25.000).",
    model: "/assets/models/hair-tonic-grow.glb",
    fallbackImage: "/assets/images/fallback-grow.svg",
    fallbackSvg: "/assets/images/fallback-grow.svg",
    leftBadge: "Scalp Care",
    leftBadgeDetail: "Ekstrak Akar Ginseng",
    rightBadge: "Daily Hair Care",
    rightBadgeDetail: "Nutrisi Akar & Helai Rambut",
    keyPoints: [
      "Membantu merawat kesehatan kulit kepala dan akar rambut",
      "Diperkaya ekstrak Ginseng, Panthenol (Vit B5), dan Niacinamide",
      "Membantu menjaga rambut agar tampak sehat dan terawat",
      "Pilihan ukuran: 60 ml (Rp15.000) dan 100 ml (Rp25.000)"
    ],
    ingredients:
      "Ekstrak Ginseng, Vitamin E, Vitamin B5 (Panthenol), Niacinamide, Ekstrak Peppermint, Menthol, dan Kafein.",
    theme: {
      accent: "#b45309",
      accentSoft: "rgba(180, 83, 9, 0.14)",
      glow: "rgba(217, 119, 6, 0.26)",
      liquidHex: 0xb84a14,
      glassTintHex: 0xf7ead9
    },
    shopeeUrl: "https://id.shp.ee/e5fEvsRw"
  }
];

export const benefitsData = [
  {
    id: "natural-care",
    number: "01",
    title: "Natural Care",
    description:
      "Menggunakan kombinasi bahan perawatan berbasis ekstrak tumbuhan seperti Peppermint dan Ginseng yang ramah untuk rutinitas harian."
  },
  {
    id: "fresh-light",
    number: "02",
    title: "Fresh & Light",
    description:
      "Formula berbasis air yang ringan, cepat meresap ke kulit kepala, tidak meninggalkan residu berminyak, dan tidak membuat rambut lepek."
  },
  {
    id: "dua-ukuran",
    number: "03",
    title: "Pilihan 2 Ukuran",
    description:
      "Tersedia ukuran 60 ml (Rp15.000) yang mudah dibawa saat bepergian dan 100 ml (Rp25.000) untuk pemakaian teratur di rumah."
  },
  {
    id: "daily-care",
    number: "04",
    title: "Daily Hair Care",
    description:
      "Dirancang untuk penggunaan rutin setiap hari, baik setelah keramas di pagi hari maupun sebelum beristirahat di malam hari."
  },
  {
    id: "kemasan",
    number: "05",
    title: "Kemasan Spray Halus",
    description:
      "Nozzle spray presisi memudahkan cairan menjangkau kulit kepala secara merata tanpa tumpah dan tanpa repot dibilas."
  },
  {
    id: "terjangkau",
    number: "06",
    title: "Harga Terjangkau",
    description:
      "Perawatan rambut berkualitas karya inovasi kewirausahaan dengan harga mulai Rp15.000 dan dapat langsung dipesan di Shopee."
  }
];

export const usageSteps = [
  {
    step: "01",
    title: "Bersihkan",
    subtitle: "Kondisi Rambut Bersih & Lembap",
    description:
      "Cuci rambut hingga bersih lalu keringkan dengan handuk sampai kondisi setengah basah (lembap) agar kulit kepala siap menerima nutrisi."
  },
  {
    step: "02",
    title: "Aplikasikan",
    subtitle: "Semprotkan Merata ke Kulit Kepala",
    description:
      "Buka tutup pelindung dan semprotkan Hair Tonic secukupnya langsung ke beberapa titik garis belahan kulit kepala."
  },
  {
    step: "03",
    title: "Ratakan",
    subtitle: "Pijat Lembut Tanpa Dibilas",
    description:
      "Pijat lembut kulit kepala menggunakan ujung jari selama 1–2 menit agar cairan meresap sempurna, lalu biarkan kering alami tanpa dibilas."
  }
];

export const pricingPackages = [
  {
    id: "size-60ml",
    name: "Ukuran 60 ml",
    quantity: "1 Botol (60 ml)",
    subtitle: "Praktis di saku atau tas bepergian",
    price: "Rp15.000",
    priceNote: "Tersedia varian Papermint & Gingseng",
    popular: false,
    badge: "HEMAT",
    features: [
      "1 Botol Hair Tonic Spray 60 ml",
      "Pilihan varian: Papermint atau Gingseng",
      "Praktis dibawa kuliah, kantor, atau gym",
      "Pesan cepat via Shopee Official Store"
    ],
    shopeeUrl: "https://id.shp.ee/e5fEvsRw"
  },
  {
    id: "size-100ml",
    name: "Ukuran 100 ml",
    quantity: "1 Botol (100 ml)",
    subtitle: "Ukuran reguler untuk stok harian",
    price: "Rp25.000",
    priceNote: "Ukuran paling diminati pelanggan",
    popular: true,
    badge: "PALING POPULER",
    features: [
      "1 Botol Hair Tonic Spray 100 ml",
      "Pilihan varian: Papermint atau Gingseng",
      "Isi lebih banyak untuk pemakaian 3–4 minggu",
      "Pesan cepat via Shopee Official Store"
    ],
    shopeeUrl: "https://id.shp.ee/e5fEvsRw"
  },
  {
    id: "duo-combo",
    name: "Paket Duo Care",
    quantity: "2 Botol Kombinasi",
    subtitle: "Kombinasi Papermint + Gingseng",
    price: "Rp50.000",
    priceNote: "2 Botol 100 ml lengkap kedua varian",
    popular: false,
    badge: "KOMBINASI LENGKAP",
    features: [
      "2 Botol Hair Tonic 100 ml (1 Papermint + 1 Gingseng)",
      "Sensasi dingin segar + perawatan akar rambut",
      "Bebas tentukan kombinasi varian saat checkout",
      "Pesan cepat via Shopee Official Store"
    ],
    shopeeUrl: "https://id.shp.ee/e5fEvsRw"
  }
];

export const testimonialsData = [
  {
    id: "mockup-1",
    isMockup: true,
    name: "Rizky Pratama",
    role: "Mahasiswa • Pengguna Harian",
    variant: "Hair Tonic Papermint (60 ml)",
    quote:
      "Sensasi dingin papermint-nya terasa segar dipakai sehabis keramas sebelum berangkat kuliah. Ukuran 60 ml pas banget masuk tas kecil."
  },
  {
    id: "mockup-2",
    isMockup: false,
    name: "Nadia Kusuma",
    role: "Pekerja Kantoran • Pengguna Hijab",
    variant: "Hair Tonic Papermint (100 ml)",
    quote:
      "Kemasan spray 100 ml praktis banget dipakai sebelum beraktivitas. Teksturnya ringan dan cepat meresap di kulit kepala tanpa rasa lengket."
  },
  {
    id: "mockup-3",
    isMockup: true,
    name: "Dimas Saputra",
    role: "Freelancer • Rutinitas Malam",
    variant: "Hair Tonic Gingseng (100 ml)",
    quote:
      "Suka dengan varian Gingseng untuk pijat kulit kepala di malam hari. Wanginya menenangkan dan nyaman dipakai rutin."
  }
];

export const faqData = [
  {
    question: "Apakah hair tonic dapat digunakan setiap hari?",
    answer:
      "Ya, baik Hair Tonic Papermint maupun Hair Tonic Gingseng memiliki formula berbahan dasar air yang ringan sehingga nyaman digunakan setiap hari sebagai bagian dari rutinitas perawatan rambut."
  },
  {
    question: "Apa perbedaan ukuran 60 ml dan 100 ml?",
    answer:
      "Keduanya memiliki formula dan kualitas yang sama persis. Ukuran 60 ml (Rp15.000) dirancang praktis untuk dibawa bepergian di saku atau tas, sedangkan ukuran 100 ml (Rp25.000) adalah ukuran reguler yang cocok untuk stok perawatan harian di rumah."
  },
  {
    question: "Berapa kali penggunaan dalam sehari?",
    answer:
      "Disarankan digunakan 1 hingga 2 kali sehari, misalnya pada pagi hari setelah mandi/keramas dan malam hari sebelum beristirahat."
  },
  {
    question: "Apakah cocok untuk semua jenis rambut?",
    answer:
      "Formula ringan kami dirancang agar nyaman untuk berbagai jenis rambut. Pilih varian Papermint bila Anda mengutamakan kesegaran dan sensasi dingin, atau varian Gingseng untuk fokus perawatan kulit kepala dan kekuatan akar rambut."
  },
  {
    question: "Bagaimana cara menyimpan produk?",
    answer:
      "Simpan botol di tempat yang sejuk dan kering pada suhu ruang, pastikan tutup pelindung spray terpasang kembali setelah digunakan, dan hindarkan dari paparan sinar matahari langsung."
  },
  {
    question: "Bagaimana cara melakukan pemesanan?",
    answer:
      "Klik tombol 'Beli Sekarang di Shopee' di website ini untuk langsung diarahkan ke toko resmi kami di Shopee (https://id.shp.ee/e5fEvsRw) dengan jaminan produk asli dan opsi gratis ongkir."
  }
];

/**
 * Mendapatkan tautan pembelian utama (Shopee)
 */
export function getBuyUrl() {
  return siteConfig.shopUrl;
}

/**
 * Tautan WhatsApp alternatif untuk konsultasi / CS
 */
export function buildWhatsAppUrl(customMessage = "") {
  const cleanNumber = (siteConfig.contact.whatsappNumber || "").replace(/[^0-9]/g, "");
  const message = customMessage || siteConfig.contact.defaultGreeting;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}
