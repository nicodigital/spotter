import getDevice from './modules/getDevice.js';
import { initLenis } from './modules/lenis.js';
import { initGSAP, refreshScrollTrigger } from './modules/gsap.js';
import scrollMarkers from './modules/scrollMarkers.js';
import menuMobile from './modules/menuMobile.js';
import { initThemeDetect } from './themeDetect.js';

/**
 * Inicializa todas las funcionalidades del sitio
 */
function init() {
  const deviceData = getDevice();
  window.spotterDeviceData = deviceData;
  initLenis();
  menuMobile(deviceData);
  initGSAP(deviceData);
  initThemeDetect();
  scrollMarkers(deviceData);
  // Refresh ScrollTrigger después de que todo esté listo
  setTimeout(() => {
    refreshScrollTrigger();
  }, 100);
}

document.addEventListener('DOMContentLoaded', init);
