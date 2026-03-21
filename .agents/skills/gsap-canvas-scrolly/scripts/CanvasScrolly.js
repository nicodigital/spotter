/**
 * CanvasScrolly.js
 * Encapsula la lógica de precarga de imágenes, renderizado en canvas y sincronización con scroll vía GSAP.
 */

export class CanvasScrolly {
  constructor(config) {
    this.canvas = document.getElementById(config.canvasId);
    this.context = this.canvas ? this.canvas.getContext('2d') : null;
    this.wrapper = document.getElementById(config.wrapperId);
    this.trigger = document.getElementById(config.triggerId);
    this.loader = document.getElementById(config.loaderId);
    this.progressBar = document.getElementById(config.progressBarId || 'scrolly-progress-bar');
    this.percentageText = document.getElementById(config.percentageId || 'scrolly-percentage');

    this.frames = config.frames || [];
    this.totalFrames = this.frames.length;
    this.images = [];
    this.loadedCount = 0;
    this.animConfig = { frameIndex: 0 };
    this.scrub = config.scrub !== undefined ? config.scrub : 0.5;
  }

  init() {
    if (!this.canvas || !this.context || !this.trigger) {
      console.error('CanvasScrolly: Elementos requeridos no encontrados.');
      return;
    }

    this.preloadImages();
    this.setupResizeListener();
  }

  preloadImages() {
    if (this.totalFrames === 0) return;

    this.frames.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        this.loadedCount++;
        this.updateLoader();

        if (this.loadedCount === this.totalFrames) {
          this.onPreloadComplete();
        }
      };
      this.images.push(img);
    });
  }

  updateLoader() {
    const percent = Math.floor((this.loadedCount / this.totalFrames) * 100);

    if (this.progressBar) {
      this.progressBar.style.width = `${percent}%`;
    }
    if (this.percentageText) {
      this.percentageText.innerText = `${percent}%`;
    }
  }

  onPreloadComplete() {
    // Pequeño delay para que la barra llegue al 100% visualmente
    setTimeout(() => {
      if (this.loader) {
        this.loader.style.opacity = '0';
        setTimeout(() => {
          this.loader.style.display = 'none';

          // Renderizar primer frame y configurar ScrollTrigger
          this.renderFrame(0);
          this.setupScroll();

          // Despachar evento para que otros scripts sepan que la carga terminó
          window.dispatchEvent(new CustomEvent('scrolly:complete'));
        }, 1000);
      } else {
        this.renderFrame(0);
        this.setupScroll();
      }
    }, 500);
  }

  renderFrame(index) {
    const img = this.images[index];
    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    // Ajustar resolución del canvas al DPR
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.context.scale(dpr, dpr);
    this.context.clearRect(0, 0, rect.width, rect.height);

    // Lógica de "Cover" (similar a background-size: cover)
    const hRatio = rect.width / img.width;
    const vRatio = rect.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const centerShift_x = (rect.width - img.width * ratio) / 2;
    const centerShift_y = (rect.height - img.height * ratio) / 2;

    this.context.drawImage(
      img,
      0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
    );
  }

  setupScroll() {
    // Necesita GSAP y ScrollTrigger registrados afuera o globalmente
    if (typeof gsap === 'undefined' || !gsap.utils.toArray) {
      console.warn('CanvasScrolly: GSAP no encontrado. Asegúrate de cargarlo.');
      return;
    }

    // Pinning del contenedor del canvas
    if (this.wrapper) {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.create({
        trigger: this.trigger,
        start: 'top top',
        end: 'bottom bottom',
        pin: this.wrapper,
        pinSpacing: false
      });

      // Animación de los frames
      gsap.to(this.animConfig, {
        frameIndex: this.totalFrames - 1,
        snap: 'frameIndex',
        ease: 'none',
        scrollTrigger: {
          trigger: this.trigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: this.scrub,
          onUpdate: () => this.renderFrame(this.animConfig.frameIndex)
        }
      });
    }
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      // Solo renderizar si el loader ya se fue
      if (!this.loader || this.loader.style.display === 'none') {
        this.renderFrame(this.animConfig.frameIndex);
      }
    });
  }
}
