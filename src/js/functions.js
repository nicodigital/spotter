import getDevice from './modules/getDevice.js';
import { initLenis } from './modules/lenis.js';
import { initGSAP, refreshScrollTrigger } from './modules/gsap.js';
import scrollMarkers from './modules/scrollMarkers.js';

/**
 * Inicializa todas las funcionalidades del sitio
 */
function init() {
  const device_data = getDevice();
  window.spotterDeviceData = device_data;
  initLenis();
  initGSAP();
  scrollMarkers(device_data);
  // Refresh ScrollTrigger después de que todo esté listo
  setTimeout(() => {
    refreshScrollTrigger();
  }, 100);
}

document.addEventListener('DOMContentLoaded', init);
