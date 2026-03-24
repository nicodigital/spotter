import { initLenis } from './lenis.js';
import { initGSAP, refreshScrollTrigger } from './gsap.js';

/**
 * Inicializa todas las funcionalidades del sitio
 */
function init() {
  initLenis();
  initGSAP();
  
  // Refresh ScrollTrigger después de que todo esté listo
  setTimeout(() => {
    refreshScrollTrigger();
  }, 100);
}

document.addEventListener('DOMContentLoaded', init);
