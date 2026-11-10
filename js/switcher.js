import gsap from 'gsap';
import { siteConfig } from './config.js';

/**
 * ProductSwitcher
 * ---------------
 * Mengelola state produk aktif di Hero, auto-switch timer (~5 detik),
 * manual indicator selection, pemilihan ukuran (60 ml / 100 ml),
 * dan sinkronisasi 100% antara Model 3D dan elemen HTML.
 */
export class ProductSwitcher {
  constructor(options = {}) {
    this.products = options.products || [];
    this.scene3d = options.scene3d;
    this.autoSwitchMs = options.autoSwitchMs || 5000;
    this.transitionDuration = options.transitionDuration || 0.62;
    this.pauseOnHover = options.pauseOnHover !== false;
    this.reducedMotion = Boolean(options.reducedMotion);

    this.activeIndex = 0;
    this.selectedSizeIndex = 0; // 0 = 60 ml, 1 = 100 ml
    this.isSwitching = false;
    this.isPaused = false;
    this.timerTween = null;
    this.uiTimeline = null;

    // Referensi DOM Hero yang harus disinkronkan
    this.dom = {
      heroSection: document.getElementById('hero'),
      showcaseInteractive: document.getElementById('hero-showcase-interactive'),
      codeEl: document.getElementById('hero-product-code'),
      positioningEl: document.getElementById('hero-product-positioning'),
      nameEl: document.getElementById('hero-product-name'),
      subtitleEl: document.getElementById('hero-product-subtitle'),
      descEl: document.getElementById('hero-product-description'),
      priceEl: document.getElementById('hero-product-price'),
      volumeEl: document.getElementById('hero-product-volume'),
      leftBadgeTitle: document.getElementById('hero-badge-left-title'),
      leftBadgeDetail: document.getElementById('hero-badge-left-detail'),
      rightBadgeTitle: document.getElementById('hero-badge-right-title'),
      rightBadgeDetail: document.getElementById('hero-badge-right-detail'),
      leftBadgeCard: document.getElementById('hero-badge-left'),
      rightBadgeCard: document.getElementById('hero-badge-right'),
      ctaBtn: document.getElementById('hero-cta-btn'),
      ctaLabel: document.getElementById('hero-cta-label'),
      indicatorsContainer: document.getElementById('hero-indicators'),
      indicatorBtns: Array.from(document.querySelectorAll('[data-product-indicator]')),
      liveRegion: document.getElementById('hero-live-announcer'),
      animatedTextElements: Array.from(document.querySelectorAll('[data-hero-sync]')),
      sizePills: Array.from(document.querySelectorAll('.hero-size-pill'))
    };
  }

  init() {
    if (!this.products.length) return;

    // Render state awal tanpa animasi pergantian
    this.applyProductDataToDOM(this.products[this.activeIndex]);
    this.updateIndicatorStates(this.activeIndex, 0);

    this.bindEvents();
  }

  /**
   * Dipanggil setelah Hero Entrance selesai agar timer mulai berjalan
   */
  startAutoplay() {
    this.restartTimer();
  }

  bindEvents() {
    // Klik manual pada indicator produk
    this.dom.indicatorBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        this.selectProduct(idx, { isManual: true });
      });

      // Navigasi keyboard ArrowLeft / ArrowRight pada indicator
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const nextIdx = (idx + 1) % this.products.length;
          this.dom.indicatorBtns[nextIdx]?.focus();
          this.selectProduct(nextIdx, { isManual: true });
        }
      });
    });

    // Pemilihan ukuran (60 ml / 100 ml) di kartu harga Hero
    if (this.dom.sizePills.length) {
      this.dom.sizePills.forEach((pill, pIdx) => {
        pill.addEventListener('click', () => {
          this.selectedSizeIndex = pIdx;
          this.updateSizeSelection();
        });
      });
    }

    // Pause auto-switch ketika hover atau focus pada area showcase
    if (this.pauseOnHover && this.dom.showcaseInteractive) {
      this.dom.showcaseInteractive.addEventListener('pointerenter', () => {
        this.pauseTimer();
      });
      this.dom.showcaseInteractive.addEventListener('pointerleave', () => {
        this.resumeTimer();
      });
      this.dom.showcaseInteractive.addEventListener('focusin', () => {
        this.pauseTimer();
      });
      this.dom.showcaseInteractive.addEventListener('focusout', (e) => {
        if (!this.dom.showcaseInteractive.contains(e.relatedTarget)) {
          this.resumeTimer();
        }
      });
    }

    // Pause timer saat tab browser tidak aktif
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseTimer();
      } else if (!this.isPaused) {
        this.resumeTimer();
      }
    });
  }

  updateSizeSelection() {
    const curProduct = this.products[this.activeIndex];
    const variants = curProduct?.variants || [
      { volume: "60 ml", price: "Rp15.000" },
      { volume: "100 ml", price: "Rp25.000" }
    ];
    const chosen = variants[this.selectedSizeIndex] || variants[0];

    this.dom.sizePills.forEach((pill, idx) => {
      const isActive = idx === this.selectedSizeIndex;
      pill.classList.toggle('is-active', isActive);
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (this.dom.priceEl) {
      this.dom.priceEl.textContent = chosen.price;
    }
    if (this.dom.volumeEl) {
      this.dom.volumeEl.textContent = chosen.volume;
    }
    if (this.dom.ctaLabel) {
      this.dom.ctaLabel.textContent = `BELI DI SHOPEE — ${chosen.price}`;
    }
  }

  /**
   * Memilih produk berdasarkan index (0 = Papermint, 1 = Gingseng)
   */
  selectProduct(targetIndex, { isManual = false } = {}) {
    if (targetIndex < 0 || targetIndex >= this.products.length) return;

    // Jika mengklik produk yang sedang aktif, cukup reset timer
    if (targetIndex === this.activeIndex && !this.isSwitching) {
      if (isManual) this.restartTimer();
      return;
    }

    // Matikan timer lama agar tidak terjadi double trigger
    this.stopTimer();

    this.activeIndex = targetIndex;
    const targetProduct = this.products[targetIndex];

    // Update status aktif pada tombol indicator segera agar responsif
    this.updateIndicatorStates(targetIndex, 0);

    // Jalankan transisi sinkron antara Model 3D dan HTML
    this.runSynchronizedTransition(targetProduct, isManual);
  }

  runSynchronizedTransition(product, isManual) {
    this.isSwitching = true;

    // Bersihkan timeline UI yang mungkin sedang berjalan
    if (this.uiTimeline) {
      this.uiTimeline.kill();
      this.uiTimeline = null;
    }

    // 1. Trigger transisi 3D pada scene tunggal
    if (this.scene3d) {
      this.scene3d.switchToProduct(product.id, this.transitionDuration);
    }

    // Jika prefers-reduced-motion aktif, langsung ganti konten tanpa gerak berlebihan
    if (this.reducedMotion) {
      this.applyProductDataToDOM(product);
      this.isSwitching = false;
      this.restartTimer();
      return;
    }

    const halfDur = this.transitionDuration * 0.44;
    const inDur = this.transitionDuration * 0.56;

    const badges = [this.dom.leftBadgeCard, this.dom.rightBadgeCard].filter(Boolean);
    const textEls = this.dom.animatedTextElements;

    const tl = gsap.timeline({
      onComplete: () => {
        this.isSwitching = false;
        this.uiTimeline = null;
        this.restartTimer();
      }
    });

    this.uiTimeline = tl;

    // Fase Keluar (Out): teks & badge memudar halus
    tl.to(
      textEls,
      {
        y: -10,
        autoAlpha: 0,
        duration: halfDur,
        stagger: 0.02,
        ease: 'power2.in'
      },
      0
    ).to(
      badges,
      {
        scale: 0.92,
        autoAlpha: 0,
        duration: halfDur,
        ease: 'power2.in'
      },
      0
    );

    // Titik Sinkronisasi: ganti seluruh teks, harga, badge, tema, & link Shopee
    tl.call(() => {
      this.applyProductDataToDOM(product);
    });

    // Fase Masuk (In): teks & badge produk baru muncul sinkron dengan botol 3D baru
    tl.fromTo(
      textEls,
      { y: 12, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: inDur,
        stagger: 0.03,
        ease: 'power3.out'
      }
    ).fromTo(
      badges,
      { scale: 0.92, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: inDur,
        ease: 'back.out(1.4)'
      },
      `<`
    );
  }

  /**
   * Menyuntikkan data produk aktif ke seluruh elemen DOM Hero
   */
  applyProductDataToDOM(product) {
    if (!product) return;

    const variants = product.variants || [
      { volume: "60 ml", price: "Rp15.000" },
      { volume: "100 ml", price: "Rp25.000" }
    ];
    const currentVariant = variants[this.selectedSizeIndex] || variants[0];

    if (this.dom.codeEl) this.dom.codeEl.textContent = `PRODUCT ${product.code}`;
    if (this.dom.positioningEl) this.dom.positioningEl.textContent = product.positioning;
    if (this.dom.nameEl) this.dom.nameEl.textContent = product.name;
    if (this.dom.subtitleEl) this.dom.subtitleEl.textContent = product.subtitle;
    if (this.dom.descEl) this.dom.descEl.textContent = product.description;
    if (this.dom.priceEl) this.dom.priceEl.textContent = currentVariant.price;
    if (this.dom.volumeEl) this.dom.volumeEl.textContent = currentVariant.volume;

    if (this.dom.leftBadgeTitle) this.dom.leftBadgeTitle.textContent = product.leftBadge;
    if (this.dom.leftBadgeDetail) {
      this.dom.leftBadgeDetail.textContent = product.leftBadgeDetail || '';
    }
    if (this.dom.rightBadgeTitle) this.dom.rightBadgeTitle.textContent = product.rightBadge;
    if (this.dom.rightBadgeDetail) {
      this.dom.rightBadgeDetail.textContent = product.rightBadgeDetail || '';
    }

    // Tombol Beli Sekarang mengarah ke toko resmi Shopee
    if (this.dom.ctaBtn) {
      this.dom.ctaBtn.href = siteConfig.shopUrl;
      this.dom.ctaBtn.setAttribute(
        'aria-label',
        `Beli ${product.name} di Shopee Official Store`
      );
    }
    if (this.dom.ctaLabel) {
      this.dom.ctaLabel.textContent = `BELI DI SHOPEE — ${currentVariant.price}`;
    }

    // Update data pada size pills
    this.dom.sizePills.forEach((pill, idx) => {
      const v = variants[idx];
      if (v) {
        const volSpan = pill.querySelector('.size-vol');
        const prSpan = pill.querySelector('.size-pr');
        if (volSpan) volSpan.textContent = v.volume;
        if (prSpan) prSpan.textContent = v.price;
      }
      const isActive = idx === this.selectedSizeIndex;
      pill.classList.toggle('is-active', isActive);
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Update CSS custom properties tema warna pada Hero agar glow latar ikut menyesuaikan
    if (this.dom.heroSection && product.theme) {
      this.dom.heroSection.style.setProperty('--active-accent', product.theme.accent);
      this.dom.heroSection.style.setProperty('--active-accent-soft', product.theme.accentSoft);
      this.dom.heroSection.style.setProperty('--active-glow', product.theme.glow);
      this.dom.heroSection.setAttribute('data-active-product', product.id);
    }

    // Update screen-reader live region
    if (this.dom.liveRegion) {
      this.dom.liveRegion.textContent = `Menampilkan ${product.name}, harga ${currentVariant.price} (${currentVariant.volume}). ${product.description}`;
    }
  }

  /**
   * Memperbarui atribut aria & visual indicator produk aktif
   */
  updateIndicatorStates(activeIndex, progress = 0) {
    this.dom.indicatorBtns.forEach((btn, idx) => {
      const isActive = idx === activeIndex;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');

      const fillBar = btn.querySelector('.indicator-progress-fill');
      if (fillBar) {
        fillBar.style.transform = `scaleX(${isActive ? progress : 0})`;
      }
    });
  }

  /**
   * Memulai ulang timer auto-switch 5 detik dengan visual progress bar
   */
  restartTimer() {
    this.stopTimer();

    const progressState = { value: 0 };
    const durationSec = this.autoSwitchMs / 1000;

    this.timerTween = gsap.to(progressState, {
      value: 1,
      duration: durationSec,
      ease: 'none',
      paused: this.isPaused,
      onUpdate: () => {
        const activeBtn = this.dom.indicatorBtns[this.activeIndex];
        const fillBar = activeBtn?.querySelector('.indicator-progress-fill');
        if (fillBar) {
          fillBar.style.transform = `scaleX(${progressState.value})`;
        }
      },
      onComplete: () => {
        const nextIndex = (this.activeIndex + 1) % this.products.length;
        this.selectProduct(nextIndex, { isManual: false });
      }
    });
  }

  stopTimer() {
    if (this.timerTween) {
      this.timerTween.kill();
      this.timerTween = null;
    }
  }

  pauseTimer() {
    this.isPaused = true;
    if (this.timerTween) {
      this.timerTween.pause();
    }
  }

  resumeTimer() {
    this.isPaused = false;
    if (this.timerTween && !this.isSwitching) {
      this.timerTween.resume();
    }
  }
}
