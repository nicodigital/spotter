# Swiper Scroll — Skill

Implementa un Swiper slider horizontal controlado por scroll vertical usando GSAP ScrollTrigger. Al llegar al viewport, la sección se "pinea" y el scroll del usuario avanza o retrocede los slides. Al completar todos los slides, el scroll normal se reanuda.

---

## Dependencias

- [Swiper](https://swiperjs.com/) (`swiper-bundle.min.js`)
- [GSAP](https://gsap.com/) (`gsap.min.js` + `ScrollTrigger.min.js`)
- El módulo `swiperScroll.js` (ver paso 3)
- `window.deviceData.isDesktop` — booleano que indica si es escritorio (el pin solo actúa en desktop)
- Opcional: `window.lenisInstance` — si usás Lenis como smooth scroll, se sincroniza automáticamente

---

## Paso 1 — HTML

Añadir la estructura `.swiper-scroll` en la sección deseada. El wrapper padre debe tener un `id` único (usado en el JS para el pin).

```html
<div id="mi-seccion" class="pt-20 z-20">
  <div class="swiper swiper-scroll w-full">
    <div class="swiper-wrapper">
      <!-- repetir por cada slide -->
      <div class="swiper-slide">
        <!-- contenido del slide -->
      </div>
    </div>
  </div>
</div>
```

---

## Paso 2 — CSS

Crear o añadir en el CSS del proyecto. El archivo de referencia en AIP es `css/components/swiper-products.css` (actualmente vacío; los breakpoints de altura se manejan via clases Tailwind en el HTML).

Si se necesitan alturas fijas por breakpoint, agregarlas en el CSS del componente:

```css
/* Ejemplo de alturas para el slider */
@media (min-width: 1280px) {
  .swiper-scroll {
    height: 65rem;
  }
}
@media (min-width: 1920px) {
  .swiper-scroll {
    height: 75rem;
  }
}
```

---

## Paso 3 — JS: módulo `swiperScroll.js`

Guardar como `js/module/swiperScroll.js`. Este módulo es **genérico**: recibe cualquier instancia de Swiper y el selector del contenedor a pinear.

```js
/**
 * swiperScroll
 *
 * Pinea la sección indicada cuando llega al top del viewport.
 * Mientras está pineada, el scroll vertical controla el Swiper horizontalmente.
 * Se libera al llegar al último slide (bajando) o al primero (subiendo).
 *
 * Requiere: gsap + ScrollTrigger cargados globalmente antes de este script.
 *
 * @param {Object} swiperInstance  - Instancia de Swiper ya inicializada
 * @param {string} [sectionSelector='#products'] - Selector CSS del contenedor a pinear
 */
;(function () {
  'use strict'

  function swiperScroll(swiperInstance, sectionSelector) {
    var section = document.querySelector(sectionSelector || '#products')
    if (!section || !swiperInstance) return
    if (!window.deviceData || window.deviceData.isDesktop !== true) return
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('swiperScroll: gsap o ScrollTrigger no están disponibles.')
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    var totalSlides = swiperInstance.slides.length
    var visibleSlides = swiperInstance.params.slidesPerView
    var maxIndex = Math.ceil(totalSlides - visibleSlides)

    if (maxIndex <= 0) return

    // Cada slide equivale a 0.6vh de scroll → ritmo cómodo
    var scrollPerSlide = window.innerHeight * 0.6
    var totalPinDistance = maxIndex * scrollPerSlide

    var isAnimating = false

    var trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=' + totalPinDistance,
      pin: true,
      scrub: false,
      anticipatePin: 1,
      onUpdate: function (self) {
        if (isAnimating) return

        var progress = self.progress
        var targetIndex = Math.round(progress * maxIndex)

        if (targetIndex !== swiperInstance.activeIndex) {
          isAnimating = true
          swiperInstance.slideTo(targetIndex, 750)

          setTimeout(function () {
            isAnimating = false
          }, 200)
        }
      }
    })

    // Sincronizar Lenis con ScrollTrigger si está disponible
    if (window.lenisInstance) {
      window.lenisInstance.on('scroll', ScrollTrigger.update)
    }

    // Recalcular en resize (debounced)
    var resizeTimer
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(function () {
        trigger.kill()
        swiperScroll(swiperInstance, sectionSelector)
      }, 250)
    }, { once: true })
  }

  window.swiperScroll = swiperScroll
})()
```

---

## Paso 4 — JS: inicialización del Swiper + activación del scroll

Cargar los scripts en el footer y luego inicializar. Ajustar `slidesPerView` y `spaceBetween` según el diseño.

```html
<script src="/js/module/swiper-bundle.min.js"></script>
<script src="/js/module/gsap.min.js"></script>
<script src="/js/module/ScrollTrigger.min.js"></script>
<script src="/js/module/swiperScroll.js"></script>
<script type="module">
  function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

  const swiperScroll = new window.Swiper('.swiper-scroll', {
    spaceBetween: remToPixels(2),
    speed: 750,
    breakpoints: {
      280: { slidesPerView: 1.5 },
      992: { slidesPerView: 3.5 }
    }
  })

  // Activar scroll controlado — pasar el id del contenedor a pinear
  window.swiperScroll(swiperScroll, '#mi-seccion')
</script>
```

> **Nota:** el segundo argumento de `window.swiperScroll()` es el selector del contenedor padre del swiper (el que se pinea). En AIP se usa `'#products'` por defecto; en otros proyectos cambiarlo según corresponda.

---

## Checklist de integración

- [ ] Incluir `swiper-bundle.min.js`, `gsap.min.js`, `ScrollTrigger.min.js` y `swiperScroll.js` antes del script de inicialización
- [ ] El contenedor padre del swiper tiene un `id` único
- [ ] `window.deviceData.isDesktop` está definido antes de que corra `swiperScroll`
- [ ] Los `slidesPerView` en los breakpoints reflejan el diseño real (el pin no actúa si `maxIndex <= 0`)
- [ ] Si se usa Lenis: `window.lenisInstance` debe estar disponible al momento de la inicialización
