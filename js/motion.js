import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/**
 * MotionController
 * ----------------
 * Mengintegrasikan Lenis Smooth Scroll, GSAP ScrollTrigger,
 * urutan Hero Entrance satu kali saat siap, dan Scroll Reveal seluruh section.
 */
export class MotionController {
  constructor(options = {}) {
    this.reducedMotion = Boolean(options.reducedMotion);
    this.scene3d = options.scene3d || null;
    this.lenis = null;
    this.hasPlayedEntrance = false;
  }

  init() {
    this.initSmoothScroll();
    this.initHeroScrollParallax();
    this.initSectionReveals();
  }

  initSmoothScroll() {
    if (this.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
      return;
    }

    try {
      this.lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5
      });

      this.lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } catch (err) {
      console.warn('[MotionController] Gagal menginisialisasi Lenis, menggunakan native scroll:', err);
    }
  }

  /**
   * Helper untuk navigasi anchor yang terintegrasi dengan Lenis
   */
  scrollToTarget(targetSelector) {
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    const navbarHeight = document.getElementById('site-header')?.offsetHeight || 76;

    if (this.lenis && !this.reducedMotion) {
      this.lenis.scrollTo(targetEl, {
        offset: -navbarHeight + 4,
        duration: 1.1
      });
    } else {
      const top =
        targetEl.getBoundingClientRect().top + window.pageYOffset - navbarHeight + 4;
      window.scrollTo({ top, behavior: this.reducedMotion ? 'auto' : 'smooth' });
    }
  }

  /**
   * Urutan Hero Entrance sesuai PRD:
   * 1. Navbar -> 2. Badges -> 3. Scene/Model -> 4. Product Info -> 5. CTA -> 6. Indicators
   * Berjalan tepat satu kali ketika halaman/hero siap.
   */
  playHeroEntrance(onComplete) {
    if (this.hasPlayedEntrance) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }
    this.hasPlayedEntrance = true;

    const navbar = document.getElementById('site-header');
    const badges = gsap.utils.toArray('.hero-floating-badge');
    const stage = document.getElementById('hero-stage');
    const infoItems = gsap.utils.toArray('[data-entrance="info"]');
    const ctaGroup = document.getElementById('hero-cta-group');
    const indicators = document.getElementById('hero-indicators');

    if (this.reducedMotion) {
      gsap.set([navbar, ...badges, stage, ...infoItems, ctaGroup, indicators], {
        clearProps: 'all',
        autoAlpha: 1
      });
      if (this.scene3d) this.scene3d.playInitialModelEntrance();
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        if (typeof onComplete === 'function') onComplete();
      }
    });

    // 1. Navbar
    if (navbar) {
      tl.fromTo(
        navbar,
        { y: -28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55 }
      );
    }

    // 2. Floating Badges kiri & kanan
    if (badges.length) {
      tl.fromTo(
        badges,
        { scale: 0.86, y: 14, autoAlpha: 0 },
        {
          scale: 1,
          y: 0,
          autoAlpha: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: 'back.out(1.4)'
        },
        '-=0.28'
      );
    }

    // 3. Three.js Scene / Model 3D Entrance
    if (stage) {
      tl.fromTo(
        stage,
        { scale: 0.94, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.65,
          onStart: () => {
            if (this.scene3d) this.scene3d.playInitialModelEntrance();
          }
        },
        '-=0.35'
      );
    }

    // 4. Product Info (NOW SHOWING, Nama, Deskripsi, Harga)
    if (infoItems.length) {
      tl.fromTo(
        infoItems,
        { y: 18, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.52,
          stagger: 0.06
        },
        '-=0.35'
      );
    }

    // 5. CTA Pembelian
    if (ctaGroup) {
      tl.fromTo(
        ctaGroup,
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45 },
        '-=0.25'
      );
    }

    // 6. Product Indicators
    if (indicators) {
      tl.fromTo(
        indicators,
        { y: 12, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45 },
        '-=0.25'
      );
    }
  }

  /**
   * ScrollTrigger pada Hero untuk rotasi/translasi ringan model 3D & parallax badge
   */
  initHeroScrollParallax() {
    if (this.reducedMotion) return;

    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        if (this.scene3d) {
          this.scene3d.setScrollProgress(self.progress);
        }
      }
    });

    const leftBadge = document.getElementById('hero-badge-left');
    const rightBadge = document.getElementById('hero-badge-right');

    if (leftBadge && window.innerWidth >= 1024) {
      gsap.to(leftBadge, {
        yPercent: -24,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    if (rightBadge && window.innerWidth >= 1024) {
      gsap.to(rightBadge, {
        yPercent: -32,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  /**
   * Scroll reveal untuk seluruh section konten di bawah Hero
   */
  initSectionReveals() {
    if (this.reducedMotion) return;

    // Reveal header setiap section
    gsap.utils.toArray('.section-header').forEach((header) => {
      gsap.fromTo(
        header,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 86%',
            once: true
          }
        }
      );
    });

    // Reveal grup kartu per section
    const cardGroups = [
      { container: '#products-grid', items: '.product-detail-card' },
      { container: '#benefits-grid', items: '.benefit-card' },
      { container: '#steps-grid', items: '.step-card' },
      { container: '#pricing-grid', items: '.pricing-card' },
      { container: '#testimonials-grid', items: '.testimonial-card' },
      { container: '#faq-list', items: '.faq-item' }
    ];

    cardGroups.forEach(({ container, items }) => {
      const wrap = document.querySelector(container);
      if (!wrap) return;
      const elements = wrap.querySelectorAll(items);
      if (!elements.length) return;

      gsap.fromTo(
        elements,
        { y: 32, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wrap,
            start: 'top 84%',
            once: true
          }
        }
      );
    });

    // Animasi garis penghubung pada Cara Penggunaan
    const connectorFill = document.querySelector('.steps-connector-fill');
    const stepsSection = document.getElementById('cara-penggunaan');
    if (connectorFill && stepsSection) {
      gsap.fromTo(
        connectorFill,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stepsSection,
            start: 'top 72%',
            once: true
          }
        }
      );
    }

    // Reveal Final CTA Banner
    const ctaBanner = document.querySelector('.cta-banner-card');
    if (ctaBanner) {
      gsap.fromTo(
        ctaBanner,
        { y: 32, scale: 0.98, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaBanner,
            start: 'top 85%',
            once: true
          }
        }
      );
    }
  }
}

