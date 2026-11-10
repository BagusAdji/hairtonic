import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';

/**
 * Hero3DScene
 * -----------
 * Mengelola SATU Scene, SATU PerspectiveCamera, SATU WebGLRenderer,
 * SATU Canvas, dan SATU Render Loop untuk seluruh lifecycle Hero Showcase.
 */
export class Hero3DScene {
  constructor(options = {}) {
    this.container = options.container;
    this.canvas = options.canvas;
    this.loadingEl = options.loadingEl;
    this.fallbackEl = options.fallbackEl;
    this.fallbackImgEl = options.fallbackImgEl;
    this.products = options.products || [];
    this.reducedMotion = Boolean(options.reducedMotion);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.pmremGenerator = null;
    this.gltfLoader = null;

    // Grup hierarki:
    // masterPivot -> menerima idle float, pointer micro-tilt, & scroll parallax
    // modelSlots[id] -> menerima animasi scale/rotation/position saat switch produk
    this.masterPivot = new THREE.Group();
    this.shadowMesh = null;
    this.modelSlots = new Map();
    this.loadedStatus = new Map();

    this.activeProductId = this.products[0]?.id || 'fresh';
    this.isFallbackMode = false;
    this.isRunning = false;
    this.isHeroVisible = true;
    this.isTabVisible = !document.hidden;
    this.rafId = null;
    this.clock = new THREE.Clock();

    // Pointer & Scroll state
    this.pointerTarget = { x: 0, y: 0 };
    this.pointerCurrent = { x: 0, y: 0 };
    this.scrollProgress = 0;
    this.activeTransitionTl = null;

    // Bind handlers agar dapat dibersihkan bila diperlukan
    this._onResize = this.handleResize.bind(this);
    this._onPointerMove = this.handlePointerMove.bind(this);
    this._onPointerLeave = this.handlePointerLeave.bind(this);
    this._onVisibilityChange = this.handleVisibilityChange.bind(this);
    this._tick = this.tick.bind(this);
  }

  /**
   * Deteksi dukungan WebGL di browser
   */
  checkWebGLSupport() {
    try {
      const testCanvas = document.createElement('canvas');
      return Boolean(
        window.WebGLRenderingContext &&
          (testCanvas.getContext('webgl2') ||
            testCanvas.getContext('webgl') ||
            testCanvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Inisialisasi scene, muat model pertama, dan jalankan background preload model kedua
   */
  async init() {
    if (!this.container || !this.canvas) {
      this.enableFallback(this.activeProductId);
      return false;
    }

    if (!this.checkWebGLSupport()) {
      console.warn('[Hero3DScene] WebGL tidak tersedia, mengaktifkan poster fallback.');
      this.enableFallback(this.activeProductId);
      return false;
    }

    try {
      this.setupScene();
      this.setupCamera();
      this.setupRenderer();
      this.setupLightingAndEnvironment();
      this.setupContactShadow();
      this.setupEvents();

      this.gltfLoader = new GLTFLoader();

      // Mulai render loop tunggal
      this.startLoop();

      // Strategi Progressive Preload:
      // 1. Muat produk pertama (Fresh) terlebih dahulu agar Hero cepat siap
      const firstProduct = this.products[0];
      const secondProduct = this.products[1];

      if (firstProduct) {
        await this.loadAndPrepareModel(firstProduct, true);
        this.hideLoadingState();
      }

      // 2. Muat & cache produk kedua (Grow) di background tanpa memblokir entrance
      if (secondProduct) {
        this.loadAndPrepareModel(secondProduct, false)
          .then(() => {
            this.precompileShaders();
          })
          .catch((err) => {
            console.warn('[Hero3DScene] Background load model kedua gagal:', err);
          });
      }

      return true;
    } catch (error) {
      console.error('[Hero3DScene] Gagal menginisialisasi 3D scene:', error);
      this.enableFallback(this.activeProductId);
      return false;
    }
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.add(this.masterPivot);
  }

  setupCamera() {
    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 560;
    const aspect = width / Math.max(height, 1);

    // FOV 34 derajat memberikan proporsi kosmetik/botol yang bebas distorsi
    this.camera = new THREE.PerspectiveCamera(34, aspect, 0.1, 50);
    this.updateCameraFraming();
  }

  updateCameraFraming() {
    if (!this.camera) return;
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    if (isMobile) {
      this.camera.position.set(0, 0.02, 5.05);
    } else if (isTablet) {
      this.camera.position.set(0, 0.02, 4.85);
    } else {
      this.camera.position.set(0, 0.02, 4.7);
    }
    this.camera.lookAt(0, 0.02, 0);
  }

  setupRenderer() {
    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 560;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    // Batasi pixelRatio maksimal 2 untuk menjaga FPS tinggi di layar Retina/4K
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
  }

  setupLightingAndEnvironment() {
    // Studio Environment untuk pantulan realistis pada kaca botol & tutup spray
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = this.pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();

    // Ambient / Hemisphere Light bernuansa botanical
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1b3022, 1.05);
    this.scene.add(hemiLight);

    // Key Light utama (kanan depan atas)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
    keyLight.position.set(2.8, 4.2, 4.2);
    this.scene.add(keyLight);

    // Fill Light lembut (kiri depan)
    const fillLight = new THREE.DirectionalLight(0xf1f8e9, 1.1);
    fillLight.position.set(-3.4, 1.6, 3.0);
    this.scene.add(fillLight);

    // Rim / Back Light untuk mempertegas siluet bahu botol kaca
    const rimLight = new THREE.DirectionalLight(0xfff8e1, 1.25);
    rimLight.position.set(0.3, 3.6, -3.5);
    this.scene.add(rimLight);
  }

  setupContactShadow() {
    const size = 128;
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = size;
    shadowCanvas.height = size;
    const ctx = shadowCanvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.06,
      size / 2,
      size / 2,
      size * 0.48
    );
    gradient.addColorStop(0, 'rgba(14, 31, 21, 0.36)');
    gradient.addColorStop(0.55, 'rgba(14, 31, 21, 0.14)');
    gradient.addColorStop(1, 'rgba(14, 31, 21, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(1.42, 1.42);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85
    });

    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, -1.42, 0);
    this.scene.add(this.shadowMesh);
  }

  /**
   * Memuat, menormalisasi skala/orientasi/origin, dan menyimpan model ke dalam cache scene
   */
  loadAndPrepareModel(product, isInitialActive = false) {
    return new Promise((resolve, reject) => {
      if (this.modelSlots.has(product.id)) {
        resolve(this.modelSlots.get(product.id));
        return;
      }

      this.gltfLoader.load(
        product.model,
        (gltf) => {
          const rawRoot = gltf.scene;

          // 1. Bersihkan plane referensi Blender ('Empty.001' / material 'Empty')
          //    agar tidak memotong botol dan tidak mengacaukan perhitungan Box3
          const nodesToRemove = [];
          rawRoot.traverse((child) => {
            if (
              child.name === 'Empty.001' ||
              child.name.startsWith('Empty') ||
              (child.isMesh && child.material && child.material.name === 'Empty')
            ) {
              nodesToRemove.push(child);
            }
          });
          nodesToRemove.forEach((node) => {
            if (node.parent) node.parent.remove(node);
          });

          // 2. Kalibrasi material PBR botol, cairan, tutup, dan label luar
          const maxAnisotropy = this.renderer
            ? Math.min(this.renderer.capabilities.getMaxAnisotropy(), 8)
            : 4;

          const isFresh = product.id === 'fresh';
          const liquidColor = new THREE.Color(isFresh ? 0x228b22 : 0xb85210);
          const glassColor = new THREE.Color(isFresh ? 0x389c3e : 0xc96918);

          rawRoot.traverse((child) => {
            if (!child.isMesh || !child.material) return;

            const oldMat = child.material;
            const matName = oldMat.name || '';

            if (matName === 'KING_Mat_Label') {
              // Label ditempel di bagian LUAR kaca botol:
              // Gunakan MeshStandardMaterial non-transmissive agar teks "HANSOME HAIR TONIC"
              // dan ilustrasi Peppermint/Ginseng tampil tajam dengan kontras penuh
              const labelTex = oldMat.map;
              if (labelTex) {
                labelTex.colorSpace = THREE.SRGBColorSpace;
                labelTex.anisotropy = maxAnisotropy;
                labelTex.needsUpdate = true;
              }
              child.material = new THREE.MeshStandardMaterial({
                name: 'KING_Mat_Label_Optimized',
                map: labelTex,
                roughness: 0.36,
                metalness: 0.0,
                envMapIntensity: 0.25,
                transparent: true,
                alphaTest: 0.25,
                depthWrite: true,
                side: THREE.FrontSide
              });
              // Dorong silinder label sedikit keluar (1.5%) agar tidak tertutup dinding kaca botol
              child.scale.x *= 1.016;
              child.scale.z *= 1.016;
              child.renderOrder = 6;
            } else if (matName === 'KING_Mat_Liquid_DarkAmber') {
              // Cairan di dalam botol (Hijau Peppermint untuk Fresh, Amber Ginseng untuk Grow)
              child.material = new THREE.MeshPhysicalMaterial({
                name: 'KING_Mat_Liquid_Optimized',
                color: liquidColor,
                emissive: liquidColor,
                emissiveIntensity: 0.16,
                roughness: 0.12,
                metalness: 0.02,
                transmission: 0,
                transparent: true,
                opacity: 0.86,
                depthWrite: true,
                envMapIntensity: 0.7,
                side: THREE.FrontSide
              });
              child.renderOrder = 2;
            } else if (matName === 'KING_Mat_Body_AmberGlass') {
              // Dinding kaca botol luar: transparan mengilap di bahu atas & dasar bawah botol
              // tanpa menutupi label di bagian luar (renderOrder 4 < label renderOrder 6)
              child.material = new THREE.MeshPhysicalMaterial({
                name: 'KING_Mat_Body_Glass_Optimized',
                color: glassColor,
                roughness: 0.05,
                metalness: 0.04,
                clearcoat: 1.0,
                clearcoatRoughness: 0.04,
                reflectivity: 0.9,
                transmission: 0,
                transparent: true,
                opacity: 0.42,
                depthWrite: false,
                envMapIntensity: 0.95,
                side: THREE.FrontSide
              });
              child.renderOrder = 4;
            } else if (matName === 'KING_Mat_DipTube_Clear') {
              // Selang penyemprot di bagian dalam cairan
              child.material = new THREE.MeshStandardMaterial({
                name: 'KING_Mat_DipTube_Optimized',
                color: 0xe8f5e9,
                roughness: 0.2,
                transparent: true,
                opacity: 0.55,
                depthWrite: false
              });
              child.renderOrder = 1;
            } else if (
              matName === 'KING_Mat_Cap_PaleYellowGreen' ||
              matName === 'KING_Mat_Pump_PalePlastic'
            ) {
              // Tutup ulir & pompa spray: plastik putih gading satin yang solid
              child.material = new THREE.MeshStandardMaterial({
                name: matName + '_Optimized',
                color: isFresh ? 0xf2f7f2 : 0xf7f4ee,
                roughness: 0.26,
                metalness: 0.02,
                envMapIntensity: 0.55,
                transparent: false,
                depthWrite: true
              });
              child.renderOrder = 3;
            } else if (matName === 'KING_Mat_SprayCover_TranslucentGreen') {
              // Tudung pelindung spray transparan di bagian paling atas
              child.material = new THREE.MeshPhysicalMaterial({
                name: 'KING_Mat_SprayCover_Optimized',
                color: 0xf8fbf8,
                roughness: 0.06,
                metalness: 0.0,
                clearcoat: 1.0,
                transmission: 0,
                transparent: true,
                opacity: 0.26,
                depthWrite: false,
                envMapIntensity: 0.9,
                side: THREE.FrontSide
              });
              child.renderOrder = 7;
            } else {
              child.material = oldMat.clone();
            }
          });

          // 3. Normalisasi ukuran & pusatkan origin tepat di tengah-tengah botol
          rawRoot.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(rawRoot);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          const targetHeight = 2.74; // Tinggi standar seragam di ruang kamera
          const scaleFactor = size.y > 0.0001 ? targetHeight / size.y : 1;

          // Wrapper untuk mengatur orientasi depan label (rotasi Y +70.8 derajat / 1.236 rad)
          const orientationGroup = new THREE.Group();
          rawRoot.scale.setScalar(scaleFactor);
          rawRoot.position.set(
            -center.x * scaleFactor,
            -center.y * scaleFactor,
            -center.z * scaleFactor
          );
          orientationGroup.add(rawRoot);

          // Kalibrasi orientasi agar bagian depan label "HANSOME HAIR TONIC" menghadap +Z (kamera)
          orientationGroup.rotation.y = 1.236;

          // Slot group untuk animasi product switching
          const slotGroup = new THREE.Group();
          slotGroup.name = `product-slot-${product.id}`;
          slotGroup.add(orientationGroup);

          slotGroup.visible = isInitialActive;
          if (!isInitialActive) {
            slotGroup.scale.setScalar(0.84);
            slotGroup.position.y = -0.15;
          }

          this.masterPivot.add(slotGroup);
          this.modelSlots.set(product.id, slotGroup);
          this.loadedStatus.set(product.id, true);

          resolve(slotGroup);
        },
        undefined,
        (err) => {
          this.loadedStatus.set(product.id, false);
          if (isInitialActive) {
            console.error(`[Hero3DScene] Gagal memuat model utama (${product.model}):`, err);
            this.enableFallback(product.id);
          }
          reject(err);
        }
      );
    });
  }

  /**
   * Pre-compile shader untuk seluruh model di dalam scene agar switch pertama bebas lag
   */
  precompileShaders() {
    if (!this.renderer || !this.scene || !this.camera) return;
    try {
      const states = [];
      this.modelSlots.forEach((slot) => {
        states.push({ slot, visible: slot.visible });
        slot.visible = true;
      });
      this.renderer.compile(this.scene, this.camera);
      states.forEach(({ slot, visible }) => {
        slot.visible = visible;
      });
    } catch {
      // Abaikan jika browser membatasi precompile
    }
  }

  hideLoadingState() {
    if (!this.loadingEl) return;
    this.loadingEl.classList.add('is-hidden');
    this.loadingEl.setAttribute('aria-hidden', 'true');
    this.loadingEl.hidden = true;
  }

  /**
   * Mengaktifkan mode fallback gambar poster bila WebGL tidak didukung atau GLB gagal
   */
  enableFallback(productId) {
    this.isFallbackMode = true;
    this.stopLoop();
    this.hideLoadingState();

    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    if (this.fallbackEl) {
      this.fallbackEl.hidden = false;
      this.fallbackEl.classList.add('is-active');
    }
    this.updateFallbackPoster(productId);
  }

  updateFallbackPoster(productId) {
    const product = this.products.find((p) => p.id === productId) || this.products[0];
    if (!product || !this.fallbackImgEl) return;
    this.fallbackImgEl.src = product.fallbackImage || product.fallbackSvg;
    this.fallbackImgEl.alt = `${product.name} - ${product.subtitle}`;
  }

  /**
   * Animasi Entrance Model 3D saat halaman siap (hanya sekali saat load)
   */
  playInitialModelEntrance() {
    if (this.isFallbackMode) return;
    const activeSlot = this.modelSlots.get(this.activeProductId);
    if (!activeSlot) return;

    if (this.reducedMotion) {
      activeSlot.visible = true;
      activeSlot.scale.setScalar(1);
      activeSlot.position.set(0, 0, 0);
      activeSlot.rotation.set(0, 0, 0);
      return;
    }

    activeSlot.visible = true;
    gsap.fromTo(
      activeSlot.scale,
      { x: 0.78, y: 0.78, z: 0.78 },
      { x: 1, y: 1, z: 1, duration: 1.05, ease: 'expo.out' }
    );
    gsap.fromTo(
      activeSlot.position,
      { y: -0.28 },
      { y: 0, duration: 1.05, ease: 'expo.out' }
    );
    gsap.fromTo(
      activeSlot.rotation,
      { y: -0.55 },
      { y: 0, duration: 1.15, ease: 'power3.out' }
    );
  }

  /**
   * Transisi 3D saat berganti produk (tanpa membuat scene/canvas/loop baru)
   */
  async switchToProduct(nextProductId, duration = 0.62) {
    const prevProductId = this.activeProductId;
    this.activeProductId = nextProductId;

    if (this.isFallbackMode) {
      this.updateFallbackPoster(nextProductId);
      return;
    }

    // Pastikan model tujuan sudah ter-load di cache
    if (!this.modelSlots.has(nextProductId)) {
      const targetProd = this.products.find((p) => p.id === nextProductId);
      if (targetProd) {
        try {
          await this.loadAndPrepareModel(targetProd, false);
        } catch {
          this.enableFallback(nextProductId);
          return;
        }
      }
    }

    const outgoingSlot = this.modelSlots.get(prevProductId);
    const incomingSlot = this.modelSlots.get(nextProductId);

    if (!incomingSlot) return;

    // Hentikan timeline transisi sebelumnya jika masih berjalan (mencegah race condition)
    if (this.activeTransitionTl) {
      this.activeTransitionTl.kill();
      this.activeTransitionTl = null;
    }

    // Pastikan semua slot selain outgoing dan incoming disembunyikan
    this.modelSlots.forEach((slot, id) => {
      if (id !== prevProductId && id !== nextProductId) {
        slot.visible = false;
      }
    });

    if (outgoingSlot === incomingSlot) {
      incomingSlot.visible = true;
      incomingSlot.scale.setScalar(1);
      incomingSlot.position.set(0, 0, 0);
      incomingSlot.rotation.set(0, 0, 0);
      return;
    }

    if (this.reducedMotion) {
      this.modelSlots.forEach((slot, id) => {
        slot.visible = id === nextProductId;
        slot.scale.setScalar(1);
        slot.position.set(0, 0, 0);
        slot.rotation.set(0, 0, 0);
      });
      return;
    }

    const outDuration = duration * 0.42;
    const inDuration = duration * 0.68;

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Pastikan hanya model target yang visible setelah transisi selesai
          this.modelSlots.forEach((slot, id) => {
            slot.visible = id === nextProductId;
            if (id !== nextProductId) {
              slot.rotation.y = 0;
            }
          });
          this.activeTransitionTl = null;
          resolve();
        }
      });

      this.activeTransitionTl = tl;

      if (outgoingSlot && outgoingSlot.visible) {
        tl.to(
          outgoingSlot.scale,
          {
            x: 0.82,
            y: 0.82,
            z: 0.82,
            duration: outDuration,
            ease: 'power2.in'
          },
          0
        )
          .to(
            outgoingSlot.position,
            {
              y: -0.18,
              duration: outDuration,
              ease: 'power2.in'
            },
            0
          )
          .to(
            outgoingSlot.rotation,
            {
              y: 0.48,
              duration: outDuration,
              ease: 'power2.in',
              onComplete: () => {
                outgoingSlot.visible = false;
                outgoingSlot.rotation.y = 0;
              }
            },
            0
          );
      }

      // Persiapkan incoming model
      tl.call(
        () => {
          if (outgoingSlot) outgoingSlot.visible = false;
          incomingSlot.visible = true;
          incomingSlot.scale.setScalar(0.82);
          incomingSlot.position.set(0, 0.16, 0);
          incomingSlot.rotation.set(0, -0.48, 0);
        },
        null,
        outDuration * 0.72
      );

      tl.to(
        incomingSlot.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: inDuration,
          ease: 'back.out(1.35)'
        },
        outDuration * 0.72
      )
        .to(
          incomingSlot.position,
          {
            y: 0,
            duration: inDuration,
            ease: 'power3.out'
          },
          outDuration * 0.72
        )
        .to(
          incomingSlot.rotation,
          {
            y: 0,
            duration: inDuration,
            ease: 'power3.out'
          },
          outDuration * 0.72
        );
    });
  }

  /**
   * Update nilai scroll progress dari GSAP ScrollTrigger (0 s.d. 1)
   */
  setScrollProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress));
  }

  setupEvents() {
    window.addEventListener('resize', this._onResize, { passive: true });
    document.addEventListener('visibilitychange', this._onVisibilityChange);

    // Pointer micro-interaction pada area hero
    const heroSection = document.getElementById('hero') || this.container;
    heroSection.addEventListener('pointermove', this._onPointerMove, { passive: true });
    heroSection.addEventListener('pointerleave', this._onPointerLeave, { passive: true });

    // IntersectionObserver agar render loop berhenti saat Hero tidak tampak di layar
    if ('IntersectionObserver' in window && heroSection) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isHeroVisible = entry.isIntersecting;
            this.evaluateLoopState();
          });
        },
        { threshold: 0.02 }
      );
      this.intersectionObserver.observe(heroSection);
    }
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera || this.isFallbackMode) return;
    const width = this.container.clientWidth || 320;
    const height = this.container.clientHeight || 380;

    this.camera.aspect = width / Math.max(height, 1);
    this.updateCameraFraming();
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
  }

  handlePointerMove(e) {
    if (this.reducedMotion || window.innerWidth < 768) {
      this.pointerTarget.x = 0;
      this.pointerTarget.y = 0;
      return;
    }

    const rect = this.container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth * 0.45)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight * 0.45)));

    this.pointerTarget.x = normX;
    this.pointerTarget.y = normY;
  }

  handlePointerLeave() {
    this.pointerTarget.x = 0;
    this.pointerTarget.y = 0;
  }

  handleVisibilityChange() {
    this.isTabVisible = !document.hidden;
    this.evaluateLoopState();
  }

  evaluateLoopState() {
    if (this.isFallbackMode) return;
    const shouldRun = this.isHeroVisible && this.isTabVisible;
    if (shouldRun && !this.isRunning) {
      this.startLoop();
    } else if (!shouldRun && this.isRunning) {
      this.stopLoop();
    }
  }

  startLoop() {
    if (this.isRunning || this.isFallbackMode) return;
    this.isRunning = true;
    this.clock.getDelta();
    this.rafId = requestAnimationFrame(this._tick);
  }

  stopLoop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * SATU Render Loop tunggal untuk seluruh kebutuhan 3D Hero
   */
  tick() {
    if (!this.isRunning) return;
    this.rafId = requestAnimationFrame(this._tick);

    const elapsed = this.clock.getElapsedTime();

    // Smooth damping untuk pointer micro-interaction
    this.pointerCurrent.x += (this.pointerTarget.x - this.pointerCurrent.x) * 0.065;
    this.pointerCurrent.y += (this.pointerTarget.y - this.pointerCurrent.y) * 0.065;

    if (!this.reducedMotion) {
      // Idle motion: floating Y sangat halus + rotasi Y lembut
      const floatY = Math.sin(elapsed * 1.55) * 0.052;
      const idleRotY = Math.sin(elapsed * 0.72) * 0.085;
      const scrollYOffset = -this.scrollProgress * 0.18;
      const scrollRotY = this.scrollProgress * 0.28;

      this.masterPivot.position.y = floatY + scrollYOffset;
      this.masterPivot.rotation.y =
        idleRotY + this.pointerCurrent.x * 0.16 + scrollRotY;
      this.masterPivot.rotation.x =
        this.pointerCurrent.y * 0.06 + this.scrollProgress * 0.05;
      this.masterPivot.rotation.z = -this.pointerCurrent.x * 0.025;

      // Sinkronkan skala bayangan kontak dengan tinggi botol
      if (this.shadowMesh) {
        const shadowScale = 1 - floatY * 0.9;
        this.shadowMesh.scale.set(shadowScale, shadowScale, 1);
        this.shadowMesh.material.opacity = Math.max(0.25, 0.78 - this.scrollProgress * 0.4);
      }
    } else {
      this.masterPivot.position.set(0, 0, 0);
      this.masterPivot.rotation.set(0, 0, 0);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    this.stopLoop();
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
