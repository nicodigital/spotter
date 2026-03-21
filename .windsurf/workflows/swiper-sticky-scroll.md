---
description: Implementar Swiper horizontal controlado por scroll vertical con técnica sticky (sin pin-spacer)
---

# Swiper Sticky Scroll — Skill

Implementa un Swiper horizontal que responde al scroll vertical con una técnica robusta basada en `position: sticky`, evitando `pin: true` de ScrollTrigger y sus problemas de `pin-spacer`.

Esta variante es ideal cuando hay conflictos con Lenis/smooth-scroll o saltos al liberar pin.

---

## Cuándo usar esta técnica

Usá `swiper-sticky-scroll` cuando:

- El pin con ScrollTrigger (`pin: true`) genera saltos al release.
- El `pin-spacer` queda con altura/padding incorrecto o inconsistente entre navegadores.
- Querés movimiento tipo **marquee** (continuo, no por “saltos” de slide).

---

## Dependencias

- [Swiper](https://swiperjs.com/) (`swiper-bundle.min.js`)
- [GSAP](https://gsap.com/) + ScrollTrigger (desde bundle de esbuild)
- `window.deviceData.isDesktop`
- Recomendado: Lenis sincronizado con GSAP ticker

---

## Paso 0 — Pre-requisitos de globals (si usás IIFE fuera del bundle)

Asegurar:

- `window.gsap`
- `window.ScrollTrigger`
- `window.deviceData`

Ejemplo mínimo:

```js
// js/module/gsap.js
window.gsap = gsap
window.ScrollTrigger = ScrollTrigger

// js/global.js
window.deviceData = deviceData
```

Y que `gsap.js` entre al bundle:

```js
// js/functions.js
import './module/gsap.js'
```

---

## Paso 1 — HTML recomendado

Usar un contenedor dedicado para el sticky/swiper:

```html
<section id="management" class="relative bg-black">
  <container class="pb-18">
    <!-- contenido previo -->
  </container>

  <div id="swiperScroll" class="bg-black">
    <div class="swiper swiper-scroll">
      <div class="swiper-wrapper">
        <div class="swiper-slide">...</div>
      </div>
    </div>
  </div>

  <container>
    <!-- contenido posterior -->
  </container>
</section>
```

---

## Paso 2 — Inicialización Swiper (modo marquee)

En `inc/footer/{page}-scripts.php`:

```html
<script src="<?= $base_url ?>/js/module/swiper-bundle.min.js"></script>
<script src="<?= $base_url ?>/js/module/swiperScroll.js"></script>

<script>
  function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

  const swiperManagement = new window.Swiper('.swiper-scroll', {
    spaceBetween: remToPixels(1),
    speed: 750,
    freeMode: {
      enabled: true,
      momentumRatio: 0.3,
      minimumVelocity: 0.01
    },
    breakpoints: {
      280: { slidesPerView: 1.5 },
      992: { slidesPerView: 3.5 }
    }
  })

  window.addEventListener('load', function () {
    window.swiperScroll(swiperManagement, '#swiperScroll')
  })
</script>
```

---

## Paso 3 — Módulo `swiperScroll.js` (sticky + translate continuo)

Guardar en `js/module/swiperScroll.js`:

```js
;(function () {
  'use strict'

  function swiperScroll(swiperInstance, sectionSelector) {
    var stickyEl = document.querySelector(sectionSelector || '#swiperScroll')
    if (!stickyEl || !swiperInstance) return
    if (!window.deviceData || window.deviceData.isDesktop !== true) return
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return

    gsap.registerPlugin(ScrollTrigger)

    var totalSlides = swiperInstance.slides.length
    var visibleSlides = swiperInstance.params.slidesPerView
    var maxIndex = Math.ceil(totalSlides - visibleSlides)
    if (maxIndex <= 0) return

    var maxTranslate = swiperInstance.maxTranslate() // negativo
    var minTranslate = swiperInstance.minTranslate() // 0
    var totalScrollDistance = Math.abs(maxTranslate - minTranslate)

    // Altura correcta del wrapper para sticky:
    // sticky-recorrido = wrapperHeight - viewportHeight
    // => wrapperHeight = viewportHeight + totalScrollDistance
    var wrapper = document.createElement('div')
    wrapper.style.height = (window.innerHeight + totalScrollDistance) + 'px'
    wrapper.style.position = 'relative'
    stickyEl.parentNode.insertBefore(wrapper, stickyEl)
    wrapper.appendChild(stickyEl)

    stickyEl.style.position = 'sticky'
    stickyEl.style.top = '0'

    var trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      scrub: false,
      onUpdate: function (self) {
        var progress = self.progress
        var targetTranslate = minTranslate + progress * (maxTranslate - minTranslate)
        swiperInstance.setTranslate(targetTranslate)
        swiperInstance.updateProgress()
      }
    })

    var resizeTimer
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(function () {
        trigger.kill()
        wrapper.parentNode.insertBefore(stickyEl, wrapper)
        wrapper.parentNode.removeChild(wrapper)
        stickyEl.style.position = ''
        stickyEl.style.top = ''
        swiperScroll(swiperInstance, sectionSelector)
      }, 250)
    }, { once: true })
  }

  window.swiperScroll = swiperScroll
})()
```

---

## Paso 4 — Lenis (recomendado)

Para evitar desfases entre navegadores, sincronizar Lenis con GSAP ticker:

```js
if (window.gsap && window.gsap.ticker) {
  lenis.on('scroll', function () {
    if (window.ScrollTrigger) window.ScrollTrigger.update()
  })

  window.gsap.ticker.add(function (time) {
    lenis.raf(time * 1000)
  })

  window.gsap.ticker.lagSmoothing(0)
}
```

---

## Troubleshooting

### 1) “Se desfixa antes de terminar slides”

Causa típica: altura de wrapper mal calculada.

✅ Usar:

- `totalScrollDistance = Math.abs(maxTranslate - minTranslate)`
- `wrapperHeight = window.innerHeight + totalScrollDistance`

No usar solo `scrollWidth` ni estimaciones por slide.

### 2) “Se siente a saltos, no marquee”

- Activar `freeMode` en Swiper
- Usar `setTranslate` con `progress` continuo (no `slideTo` por índice)

### 3) “Funciona en un navegador y en otro no”

- Verificar sincronización Lenis + GSAP ticker
- Recompilar JS (`pnpm run js`) y hard refresh

---

## Checklist

- [ ] Contenedor dedicado (`#swiperScroll`) separado del resto del contenido
- [ ] `swiperScroll.js` cargado en footer
- [ ] `window.swiperScroll(...)` invocado dentro de `window.load`
- [ ] Swiper con `freeMode` para movimiento continuo
- [ ] Mapeo `progress -> setTranslate(...)`
- [ ] Wrapper sticky con altura `viewport + totalScrollDistance`
- [ ] Cleanup/reinit en resize
- [ ] Lenis sincronizado con GSAP ticker (si aplica)

---

## Nota de arquitectura

Esta técnica evita completamente el `pin-spacer` de ScrollTrigger, por eso es más estable en integraciones con smooth scroll y layouts complejos.
