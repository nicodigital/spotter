import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Split text helper - divide el texto en caracteres envueltos en spans
 */
function splitTextIntoChars(element) {
  const text = element.innerHTML;
  const lines = text.split(/<br\s*\/?>/gi);
  
  element.innerHTML = lines.map((line, lineIndex) => {
    const chars = line.split('').map(char => {
      if (char === ' ') {
        return `<span class="hero-char">&nbsp;</span>`;
      }
      return `<span class="hero-char">${char}</span>`;
    }).join('');
    
    return lineIndex < lines.length - 1 ? chars + '<br>' : chars;
  }).join('');

  return element.querySelectorAll('.hero-char');
}

/**
 * Animación de entrada del título Hero con efecto clip
 */
export function initHeroAnimation() {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  const existingChars = heroTitle.querySelectorAll('.hero-char');
  const chars = existingChars.length ? existingChars : splitTextIntoChars(heroTitle);
  heroTitle.classList.add('gsap-ready');

  gsap.killTweensOf(chars);

  gsap.set(chars, {
    yPercent: 100,
    opacity: 0,
  });

  gsap.to(chars, {
    yPercent: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.03,
    delay: 0.3,
  });
}

/**
 * Clase utilitaria .parallax
 * Atributos data:
 *  - data-speed (default: 0.5) — velocidad del parallax
 *  - data-speed-mobile (default: igual a data-speed) — velocidad en móvil
 *  - data-direction (default: "vertical") — "vertical" | "horizontal"
 */
export function initParallax() {
  const elements = document.querySelectorAll('.parallax');
  const isMobile = window.innerWidth < 768;

  elements.forEach((el) => {
    const speedDesktop = parseFloat(el.dataset.speed) || 0.5;
    const speedMobileRaw = parseFloat(el.dataset.speedMobile);
    const speedMobile = isNaN(speedMobileRaw) ? speedDesktop : speedMobileRaw;
    const speed = isMobile ? speedMobile : speedDesktop;
    const direction = el.dataset.direction || 'vertical';

    const props = direction === 'horizontal' 
      ? { x: () => window.innerWidth * speed * -1 }
      : { y: () => window.innerHeight * speed * -1 };

    gsap.to(el, {
      ...props,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/**
 * Clase utilitaria .anim
 * 
 * Modos (data-mode):
 *  - "scroll" (default): animación sincronizada con scrub
 *  - "trigger": animación se reproduce una vez al entrar en viewport
 *
 * Data-attributes opcionales:
 *  - data-anim="top|bottom|left|right" — dirección de entrada
 *  - data-mode="scroll|trigger"
 *  - data-mobile="false" — deshabilita la animación en móvil
 *  - data-children="true" — anima SOLO los hijos (con stagger), no el padre
 *  - data-children="false" — anima SOLO el padre, no los hijos
 *  - (sin data-children) — comportamiento automático según cantidad de hijos
 *  - data-translate="2" — distancia de traslación en REMs (default: 2)
 *  - data-ease="power2.out" — tipo de easing (default: power2.out)
 *  - data-start (default: "top 85%")
 *  - data-end (default: "top 50%") — solo en modo scroll
 *  - data-scrub (default: 2) — solo en modo scroll
 *  - data-stagger (default: 0.1)
 *  - data-duration (default: 0.8) — solo en modo trigger
 *  - data-delay (default: 0) — solo en modo trigger
 *  - data-toggle (default: "play none none none") — solo en modo trigger
 */
export function initAnimations() {
  const elements = document.querySelectorAll('.anim');
  const isMobile = window.innerWidth < 768;

  elements.forEach((el) => {
    const mobileEnabled = el.dataset.mobile !== 'false';
    
    if (isMobile && !mobileEnabled) return;

    const direction = el.dataset.anim || 'bottom';
    const mode = el.dataset.mode || 'scroll';
    const childrenAttr = el.dataset.children;
    const translate = parseFloat(el.dataset.translate) || 2;
    const ease = el.dataset.ease || 'power2.out';
    const start = el.dataset.start || 'top 85%';
    const end = el.dataset.end || 'top 50%';
    const scrub = parseFloat(el.dataset.scrub) || 2;
    const stagger = parseFloat(el.dataset.stagger) || 0.1;
    const duration = parseFloat(el.dataset.duration) || 0.8;
    const delay = parseFloat(el.dataset.delay) || 0;
    const toggle = el.dataset.toggle || 'play none none none';

    const fromProps = getDirectionProps(direction, translate);

    let targets;
    let useStagger = false;

    if (childrenAttr === 'true') {
      targets = Array.from(el.children);
      useStagger = targets.length > 1;
      gsap.set(el, { opacity: 1 });
      gsap.set(targets, { ...fromProps, opacity: 0 });
    } else if (childrenAttr === 'false') {
      targets = el;
      useStagger = false;
      gsap.set(targets, fromProps);
    } else {
      const hasMultipleChildren = el.children.length > 1;
      targets = hasMultipleChildren ? Array.from(el.children) : el;
      useStagger = hasMultipleChildren;
      if (hasMultipleChildren) {
        gsap.set(el, { opacity: 1 });
        gsap.set(targets, { ...fromProps, opacity: 0 });
      } else {
        gsap.set(targets, fromProps);
      }
    }

    if (mode === 'scroll') {
      gsap.to(targets, {
        x: 0,
        y: 0,
        opacity: 1,
        ease,
        stagger: useStagger ? stagger : 0,
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub,
        },
      });
    } else {
      gsap.to(targets, {
        x: 0,
        y: 0,
        opacity: 1,
        duration,
        delay,
        ease,
        stagger: useStagger ? stagger : 0,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: toggle,
        },
      });
    }
  });
}

/**
 * Obtiene las propiedades de transformación según la dirección
 * @param {string} direction - Dirección de la animación
 * @param {number} translate - Distancia en REMs
 */
function getDirectionProps(direction, translate = 3) {
  const distance = translate * 16;

  switch (direction) {
    case 'top':
      return { y: -distance };
    case 'bottom':
      return { y: distance };
    case 'left':
      return { x: -distance };
    case 'right':
      return { x: distance };
    default:
      return { y: distance };
  }
}

/**
 * Refresh ScrollTrigger para recalcular posiciones
 */
export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

/**
 * Inicializa todas las animaciones GSAP
 */
export function initGSAP( deviceData ) {
  ScrollTrigger.getAll().forEach(t => t.kill());
  initHeroAnimation();
  initParallax();
  initAnimations();
}
