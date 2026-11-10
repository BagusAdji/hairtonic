import {
  siteConfig,
  products,
  benefitsData,
  usageSteps,
  pricingPackages,
  testimonialsData,
  faqData
} from './config.js';

/**
 * UIController
 * ------------
 * Mengelola render dinamis berbasis konfigurasi tunggal (js/config.js),
 * navigasi anchor, menu mobile, FAQ accordion yang ramah keyboard,
 * integrasi Shopee Official Store, serta media sosial resmi.
 */
export class UIController {
  constructor(options = {}) {
    this.switcher = options.switcher || null;
    this.motion = options.motion || null;
    this.isMobileMenuOpen = false;
  }

  init() {
    this.hydrateFromConfig();
    this.setupNavbar();
    this.setupAnchorLinks();
    this.setupFaqAccordion();
  }

  setControllers({ switcher, motion }) {
    this.switcher = switcher;
    this.motion = motion;
  }

  /**
   * Menyinkronkan seluruh section halaman dengan satu sumber data di js/config.js
   */
  hydrateFromConfig() {
    // 1. Marquee items (gandakan 4x = 2 paruh identik agar bebas jeda kosong di layar lebar)
    const marqueeTrack = document.getElementById('hero-marquee-track');
    if (marqueeTrack && siteConfig.marqueeItems?.length) {
      const half = [...siteConfig.marqueeItems, ...siteConfig.marqueeItems];
      const repeated = [...half, ...half];
      marqueeTrack.innerHTML = repeated
        .map(
          (text) => `
          <span class="marquee-item">
            <span class="marquee-dot" aria-hidden="true"></span>
            <span>${text}</span>
          </span>`
        )
        .join('');
    }

    // 2. Hero Indicator Labels dari array products
    const indicatorBtns = document.querySelectorAll('[data-product-indicator]');
    indicatorBtns.forEach((btn, idx) => {
      const prod = products[idx];
      if (!prod) return;
      btn.dataset.productId = prod.id;
      const codeSpan = btn.querySelector('.indicator-code');
      const nameSpan = btn.querySelector('.indicator-name');
      const priceSpan = btn.querySelector('.indicator-price');
      if (codeSpan) codeSpan.textContent = prod.code;
      if (nameSpan) nameSpan.textContent = prod.name;
      if (priceSpan) priceSpan.textContent = `Mulai ${prod.price}`;
      btn.setAttribute('aria-label', `Tampilkan produk ${prod.code}: ${prod.name} (Mulai ${prod.price})`);
    });

    // 3. Product Information Section (Tepat 2 Produk Utama dengan 2 Varian Ukuran)
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid && products.length) {
      productsGrid.innerHTML = products
        .map(
          (prod, idx) => `
          <article class="product-detail-card" data-variant="${prod.id}">
            <div class="product-card-top">
              <div class="product-card-meta">
                <span class="product-code-pill">PRODUCT ${prod.code}</span>
                <span class="product-positioning-tag">${prod.positioning}</span>
              </div>
              <div class="product-visual-box">
                <img
                  src="${prod.fallbackSvg}"
                  alt="Ilustrasi botol ${prod.name} (${prod.subtitle})"
                  class="product-card-illustration"
                  loading="lazy"
                  width="180"
                  height="260"
                />
                <div class="product-floating-tags">
                  <span class="mini-badge">${prod.leftBadge}</span>
                  <span class="mini-badge">${prod.rightBadge}</span>
                </div>
              </div>
            </div>

            <div class="product-card-body">
              <div class="product-title-row">
                <div>
                  <h3 class="product-card-title">${prod.name}</h3>
                  <p class="product-card-subtitle">${prod.subtitle}</p>
                </div>
                <div class="product-card-price-box">
                  <span class="price-label">Mulai Dari</span>
                  <strong class="product-card-price">${prod.price}</strong>
                </div>
              </div>

              <!-- Pilihan Varian Ukuran & Harga -->
              <div class="product-variant-cards-row">
                <span class="variant-row-label">Pilihan Varian Ukuran:</span>
                <div class="variant-pills-list">
                  ${(prod.variants || [
                    { volume: "60 ml", price: "Rp15.000", note: "Praktis" },
                    { volume: "100 ml", price: "Rp25.000", note: "Reguler" }
                  ])
                    .map(
                      (v) => `
                    <div class="product-variant-tag">
                      <span class="tag-vol">${v.volume}</span>
                      <span class="tag-sep">•</span>
                      <strong class="tag-price">${v.price}</strong>
                    </div>`
                    )
                    .join('')}
                </div>
              </div>

              <p class="product-card-desc">${prod.longDescription || prod.description}</p>

              <div class="product-highlights">
                <h4 class="highlights-heading">Keunggulan Utama:</h4>
                <ul class="highlights-list">
                  ${prod.keyPoints
                    .map(
                      (pt) => `
                    <li>
                      <svg class="check-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>${pt}</span>
                    </li>`
                    )
                    .join('')}
                </ul>
              </div>

              <div class="product-ingredients-box">
                <span class="ingredients-label">Komposisi Utama:</span>
                <p class="ingredients-text">${prod.ingredients}</p>
              </div>

              <div class="product-card-actions">
                <a
                  href="${siteConfig.shopUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-primary product-order-btn btn-shopee"
                  style="width: 100%;"
                >
                  <svg class="shopee-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.78 7.37c-.12-.4-.48-.68-.9-.72l-3.32-.29c-.06-.82-.36-2.48-1.55-3.66C12.87 1.55 11.45 1 9.98 1c-1.47 0-2.89.55-4.03 1.7-1.19 1.18-1.49 2.84-1.55 3.66L1.08 6.65c-.42.04-.78.32-.9.72-.12.4.02.84.34 1.11l2.45 2.05-.72 8.42c-.04.47.16.92.53 1.21.37.29.87.37 1.31.21l5.91-2.12 5.91 2.12c.18.06.37.1.56.1.28 0 .56-.08.8-.24.37-.29.57-.74.53-1.21l-.72-8.42 2.45-2.05c.32-.27.46-.71.34-1.11zM9.98 3.25c.87 0 1.69.32 2.37.99.73.73.96 1.77 1.02 2.41H6.6c.06-.64.29-1.68 1.02-2.41.67-.67 1.5-.99 2.36-.99z"/>
                  </svg>
                  <span>Beli di Shopee — Mulai ${prod.price}</span>
                </a>
              </div>
            </div>
          </article>`
        )
        .join('');
    }

    // 4. Benefits Section
    const benefitsGrid = document.getElementById('benefits-grid');
    if (benefitsGrid && benefitsData.length) {
      benefitsGrid.innerHTML = benefitsData
        .map(
          (item) => `
          <article class="benefit-card">
            <div class="benefit-card-header">
              <span class="benefit-number">${item.number}</span>
              <span class="benefit-icon-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C7.5 3 4 6.5 4 11C4 16.25 12 21 12 21C12 21 20 16.25 20 11C20 6.5 16.5 3 12 3Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 8V14M9 11H15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
                </svg>
              </span>
            </div>
            <h3 class="benefit-title">${item.title}</h3>
            <p class="benefit-desc">${item.description}</p>
          </article>`
        )
        .join('');
    }

    // 5. Cara Penggunaan Section
    const stepsGrid = document.getElementById('steps-grid');
    if (stepsGrid && usageSteps.length) {
      stepsGrid.innerHTML = usageSteps
        .map(
          (step) => `
          <article class="step-card">
            <div class="step-badge-row">
              <span class="step-number-badge">${step.step}</span>
              <span class="step-subtitle-pill">${step.subtitle}</span>
            </div>
            <h3 class="step-title">${step.title}</h3>
            <p class="step-desc">${step.description}</p>
          </article>`
        )
        .join('');
    }

    // 6. Paket / Harga Section (Mengarah ke Shopee)
    const pricingGrid = document.getElementById('pricing-grid');
    if (pricingGrid && pricingPackages.length) {
      pricingGrid.innerHTML = pricingPackages
        .map(
          (pkg) => `
          <article class="pricing-card ${pkg.popular ? 'is-popular' : ''}">
            ${
              pkg.badge
                ? `<div class="popular-ribbon ${pkg.popular ? '' : 'ribbon-subtle'}">${pkg.badge}</div>`
                : ''
            }
            <div class="pricing-card-head">
              <span class="pricing-qty-pill">${pkg.quantity}</span>
              <h3 class="pricing-name">${pkg.name}</h3>
              <p class="pricing-subtitle">${pkg.subtitle}</p>
            </div>

            <div class="pricing-price-block">
              <strong class="pricing-amount">${pkg.price}</strong>
              <span class="pricing-note">${pkg.priceNote}</span>
            </div>

            <ul class="pricing-features">
              ${pkg.features
                .map(
                  (feat) => `
                <li>
                  <svg class="check-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>${feat}</span>
                </li>`
                )
                .join('')}
            </ul>

            <a
              href="${siteConfig.shopUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn ${pkg.popular ? 'btn-primary' : 'btn-outline'} pricing-cta-btn btn-shopee"
            >
              <svg class="shopee-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.78 7.37c-.12-.4-.48-.68-.9-.72l-3.32-.29c-.06-.82-.36-2.48-1.55-3.66C12.87 1.55 11.45 1 9.98 1c-1.47 0-2.89.55-4.03 1.7-1.19 1.18-1.49 2.84-1.55 3.66L1.08 6.65c-.42.04-.78.32-.9.72-.12.4.02.84.34 1.11l2.45 2.05-.72 8.42c-.04.47.16.92.53 1.21.37.29.87.37 1.31.21l5.91-2.12 5.91 2.12c.18.06.37.1.56.1.28 0 .56-.08.8-.24.37-.29.57-.74.53-1.21l-.72-8.42 2.45-2.05c.32-.27.46-.71.34-1.11zM9.98 3.25c.87 0 1.69.32 2.37.99.73.73.96 1.77 1.02 2.41H6.6c.06-.64.29-1.68 1.02-2.41.67-.67 1.5-.99 2.36-.99z"/>
              </svg>
              <span>Beli di Shopee — ${pkg.price}</span>
            </a>
          </article>`
        )
        .join('');
    }

    // 7. Testimoni Section
    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (testimonialsGrid && testimonialsData.length) {
      testimonialsGrid.innerHTML = testimonialsData
        .map(
          (item) => `
          <article class="testimonial-card">
            <div class="testimonial-card-top">
              <span class="testimonial-stars" aria-label="Rating 5 dari 5 bintang">★★★★★</span>
              <span class="testimonial-variant-tag">${item.variant}</span>
            </div>
            <blockquote class="testimonial-quote">"${item.quote}"</blockquote>
            <div class="testimonial-author">
              <div class="author-avatar" aria-hidden="true">${item.name.charAt(0)}</div>
              <div>
                <strong class="author-name">${item.name}</strong>
                <span class="author-role">${item.role}</span>
              </div>
            </div>
          </article>`
        )
        .join('');
    }

    // 8. FAQ Accordion Section
    const faqList = document.getElementById('faq-list');
    if (faqList && faqData.length) {
      faqList.innerHTML = faqData
        .map(
          (faq, idx) => `
          <div class="faq-item ${idx === 0 ? 'is-open' : ''}">
            <h3 class="faq-question-heading">
              <button
                type="button"
                class="faq-trigger"
                id="faq-trigger-${idx}"
                aria-expanded="${idx === 0 ? 'true' : 'false'}"
                aria-controls="faq-panel-${idx}"
              >
                <span class="faq-q-number">0${idx + 1}</span>
                <span class="faq-q-text">${faq.question}</span>
                <span class="faq-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M5 8L10 13L15 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id="faq-panel-${idx}"
              class="faq-panel"
              role="region"
              aria-labelledby="faq-trigger-${idx}"
              aria-hidden="${idx === 0 ? 'false' : 'true'}"
            >
              <div class="faq-panel-inner">
                <p>${faq.answer}</p>
              </div>
            </div>
          </div>`
        )
        .join('');
    }

    // 9. Seluruh Tombol "Beli Sekarang" Mengarah ke Shopee
    document.querySelectorAll('[data-buy-shopee]').forEach((btn) => {
      btn.href = siteConfig.shopUrl;
    });

    // 10. Social Media Links di Footer
    const socialsList = document.getElementById('footer-socials-list');
    if (socialsList && siteConfig.socials?.length) {
      socialsList.innerHTML = siteConfig.socials
        .map(
          (soc) => `
          <li>
            <a href="${soc.url}" target="_blank" rel="noopener noreferrer" class="footer-social-link">
              <span class="social-platform">${soc.name}:</span>
              <span class="social-handle">${soc.handle}</span>
            </a>
          </li>`
        )
        .join('');
    }

    // 11. Online Shop Links di Footer
    const onlineshopList = document.getElementById('footer-onlineshop-list');
    if (onlineshopList && siteConfig.onlineShops?.length) {
      onlineshopList.innerHTML = siteConfig.onlineShops
        .map(
          (shop) => `
          <li>
            <a href="${shop.url}" target="_blank" rel="noopener noreferrer" class="footer-shop-link">
              <span class="shop-badge">${shop.name}</span>
              <span class="shop-title">${shop.label}</span>
            </a>
          </li>`
        )
        .join('');
    }
  }

  setupNavbar() {
    const header = document.getElementById('site-header');
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');

    const updateHeaderScroll = () => {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };

    window.addEventListener('scroll', updateHeaderScroll, { passive: true });
    updateHeaderScroll();

    if (menuToggle && mobileDrawer) {
      menuToggle.addEventListener('click', () => {
        this.toggleMobileMenu(!this.isMobileMenuOpen);
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isMobileMenuOpen) {
          this.toggleMobileMenu(false);
          menuToggle.focus();
        }
      });
    }
  }

  toggleMobileMenu(forceOpen) {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (!menuToggle || !mobileDrawer) return;

    this.isMobileMenuOpen = Boolean(forceOpen);
    menuToggle.classList.toggle('is-active', this.isMobileMenuOpen);
    menuToggle.setAttribute('aria-expanded', this.isMobileMenuOpen ? 'true' : 'false');
    mobileDrawer.classList.toggle('is-open', this.isMobileMenuOpen);
    mobileDrawer.setAttribute('aria-hidden', this.isMobileMenuOpen ? 'false' : 'true');
  }

  setupAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        if (this.isMobileMenuOpen) {
          this.toggleMobileMenu(false);
        }
        if (this.motion) {
          this.motion.scrollToTarget(href);
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  setupFaqAccordion() {
    const triggers = Array.from(document.querySelectorAll('.faq-trigger'));
    if (!triggers.length) return;

    triggers.forEach((trigger, idx) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.faq-item');
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        const isCurrentlyOpen = item?.classList.contains('is-open');

        // Tutup item lain agar rapi dan fokus
        triggers.forEach((otherTrigger) => {
          const otherItem = otherTrigger.closest('.faq-item');
          const otherPanel = document.getElementById(
            otherTrigger.getAttribute('aria-controls')
          );
          if (otherItem && otherItem !== item) {
            otherItem.classList.remove('is-open');
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherPanel?.setAttribute('aria-hidden', 'true');
          }
        });

        if (item && panel) {
          const nextState = !isCurrentlyOpen;
          item.classList.toggle('is-open', nextState);
          trigger.setAttribute('aria-expanded', nextState ? 'true' : 'false');
          panel.setAttribute('aria-hidden', nextState ? 'false' : 'true');
        }
      });

      // Navigasi keyboard antar FAQ (ArrowDown / ArrowUp / Home / End)
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          triggers[(idx + 1) % triggers.length]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          triggers[(idx - 1 + triggers.length) % triggers.length]?.focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          triggers[0]?.focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          triggers[triggers.length - 1]?.focus();
        }
      });
    });
  }
}
