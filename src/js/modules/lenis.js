import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis;
let tickerHandler;

export function initLenis() {
  if (lenis) {
    lenis.destroy();
  }

  if (tickerHandler) {
    gsap.ticker.remove(tickerHandler);
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  tickerHandler = (time) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tickerHandler);

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollTo(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, options);
  }
}
