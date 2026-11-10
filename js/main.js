import { siteConfig, products } from './config.js';
import { Hero3DScene } from './scene3d.js';
import { ProductSwitcher } from './switcher.js';
import { MotionController } from './motion.js';
import { UIController } from './ui.js';

/**
 * Bootstrap Aplikasi Landing Page 3D Hair Tonic
 */
async function bootstrapApp() {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = reducedMotionQuery.matches;

  // 1. Inisialisasi UI & Konten dari satu sumber konfigurasi
  const ui = new UIController();
  ui.init();

  // 2. Siapkan instance reusable Three.js Scene untuk Hero
  const scene3d = new Hero3DScene({
    container: document.getElementById('hero-stage'),
    canvas: document.getElementById('hero-canvas'),
    loadingEl: document.getElementById('hero-loading'),
    fallbackEl: document.getElementById('hero-fallback'),
    fallbackImgEl: document.getElementById('hero-fallback-img'),
    products,
    reducedMotion
  });

  // 3. Siapkan Product Switcher (Sinkronisasi 3D + HTML + Timer 5 Detik)
  const switcher = new ProductSwitcher({
    products,
    scene3d,
    autoSwitchMs: siteConfig.showcase.autoSwitchMs,
    transitionDuration: siteConfig.showcase.transitionDurationSec,
    pauseOnHover: siteConfig.showcase.pauseOnHover,
    reducedMotion
  });
  switcher.init();

  // 4. Siapkan Motion Controller (Lenis + GSAP ScrollTrigger + Entrance)
  const motion = new MotionController({
    reducedMotion,
    scene3d
  });
  motion.init();

  // Hubungkan referensi antar controller
  ui.setControllers({ switcher, motion });

  // Safety guard: pastikan entrance tetap berjalan bila jaringan lambat
  let entranceTriggered = false;
  const triggerEntranceOnce = () => {
    if (entranceTriggered) return;
    entranceTriggered = true;
    motion.playHeroEntrance(() => {
      switcher.startAutoplay();
    });
  };

  const safetyEntranceTimeout = window.setTimeout(triggerEntranceOnce, 2200);

  // 5. Muat model 3D pertama dan jalankan Hero Entrance segera setelah siap
  await scene3d.init();
  window.clearTimeout(safetyEntranceTimeout);
  triggerEntranceOnce();

  // Dengarkan perubahan preferensi reduced-motion secara dinamis
  reducedMotionQuery.addEventListener('change', (e) => {
    scene3d.reducedMotion = e.matches;
    switcher.reducedMotion = e.matches;
    motion.reducedMotion = e.matches;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}

