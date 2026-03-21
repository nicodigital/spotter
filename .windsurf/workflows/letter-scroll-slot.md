---
name: letter-scroll-slot
description: Crea una animación tipo "slot machine" en letras/elementos controlada por scroll con GSAP ScrollTrigger. Soporta tanto SVG paths como elementos HTML de texto.
---

# Letter Scroll Slot — Skill

Implementa una animación tipo "slot machine" donde cada letra/elemento se desplaza verticalmente al hacer scroll, revelando un duplicado que entra desde arriba. El efecto incluye stagger aleatorio entre letras para un cascadeo visual orgánico.

**Referencia visual:** https://www.itsjay.us/ (elemento `ul.letter-scroll`)

---

## Cuándo usar esta técnica

- Logos o títulos que necesitan una animación de entrada dinámica al hacer scroll.
- Efecto "slot machine" donde las letras rotan individualmente.
- Elementos en footer u otras secciones que se revelan progresivamente.

---

## Dependencias

- [GSAP](https://gsap.com/) + ScrollTrigger
- Recomendado: Lenis sincronizado con GSAP ticker

---

## Variante A — SVG Paths

Usa esta variante cuando las letras son `<path>` dentro de un `<svg>`.

### Paso 1 — Markup SVG

```html
<div id="letter-scroll-target" class="relative overflow-hidden">
  <svg viewBox="0 0 [W] [H]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs></defs>
    <!-- Cada letra es un path con class="letter" -->
    <path class="letter" id="L1" d="..." fill="white"/>
    <path class="letter" id="L2" d="..." fill="white"/>
    <path class="letter" id="L3" d="..." fill="white"/>
  </svg>
</div>
```

**Requisitos del markup:**
- El contenedor debe tener `overflow: hidden`.
- El `<svg>` debe tener un `<defs></defs>` vacío (el JS lo usa para clipPaths).
- Cada letra animable debe tener `class="letter"`.

### Paso 2 — CSS

```css
#letter-scroll-target {
  display: flex;
  align-items: center;
  justify-content: center;
}

#letter-scroll-target .letter-group {
  will-change: transform;
}
```

### Paso 3 — JavaScript (módulo ES6)

```js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SVG_NS = 'http://www.w3.org/2000/svg'

export default function letterScrollSlot() {
  const container = document.getElementById('letter-scroll-target')
  if (!container) return

  const svg = container.querySelector('svg')
  const defs = svg.querySelector('defs')
  const letters = svg.querySelectorAll('.letter')

  if (!letters.length) return

  // Gap vertical entre .letter y .letter-dup (en unidades SVG)
  // Calcular proporcionalmente al viewBox. Ejemplo: viewBox height 9038 → gap 440 ≈ 3rem visual
  const gap = 440

  const groupEls = []
  const animTargets = []

  letters.forEach((path, i) => {
    const bbox = path.getBBox()
    const clipId = `clip-letter-${i}`

    // 1. Crear clipPath al tamaño exacto del bbox
    const clipPath = document.createElementNS(SVG_NS, 'clipPath')
    clipPath.setAttribute('id', clipId)
    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('x', bbox.x)
    rect.setAttribute('y', bbox.y)
    rect.setAttribute('width', bbox.width)
    rect.setAttribute('height', bbox.height)
    clipPath.appendChild(rect)
    defs.appendChild(clipPath)

    // 2. Clonar el path y posicionarlo arriba con gap
    const clone = path.cloneNode(true)
    clone.removeAttribute('id')
    clone.classList.remove('letter')
    clone.classList.add('letter-dup')
    clone.setAttribute('transform', `translate(0, -${bbox.height + gap})`)

    // 3. Crear grupos wrapper
    const clipGroup = document.createElementNS(SVG_NS, 'g')
    clipGroup.setAttribute('clip-path', `url(#${clipId})`)

    const letterGroup = document.createElementNS(SVG_NS, 'g')
    letterGroup.classList.add('letter-group')

    // 4. Ensamblar: clipGroup > letterGroup > [original, clone]
    path.parentNode.insertBefore(clipGroup, path)
    letterGroup.appendChild(path)
    letterGroup.appendChild(clone)
    clipGroup.appendChild(letterGroup)

    groupEls.push(letterGroup)
    animTargets.push(bbox.height + gap)
  })

  // 5. Timeline con stagger aleatorio
  const indices = Array.from({ length: groupEls.length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const staggerGap = 0.06

  // Usar un trigger con suficiente recorrido de scroll
  // Si el contenedor está en el footer, usar el footer como trigger
  const trigger = container.closest('footer') || container

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: trigger,
      start: 'top 50%',
      end: 'bottom bottom',
      scrub: 1,
    },
  })

  indices.forEach((idx, order) => {
    tl.to(
      groupEls[idx],
      {
        y: animTargets[idx],
        ease: 'power1.inOut',
        duration: 1,
      },
      order * staggerGap
    )
  })
}
```

---

## Variante B — HTML Text

Usa esta variante cuando las letras son elementos HTML (spans, divs, li, etc).

### Paso 1 — Markup HTML

```html
<div id="letter-scroll-target">
  <ul class="letter-scroll">
    <li class="letter">P</li>
    <li class="letter">I</li>
    <li class="letter">A</li>
    <li class="letter">N</li>
    <li class="letter">O</li>
  </ul>
</div>
```

O con layout libre:

```html
<div id="letter-scroll-target">
  <span class="letter">P</span>
  <span class="letter">I</span>
  <span class="letter">A</span>
  <span class="letter">N</span>
  <span class="letter">O</span>
</div>
```

### Paso 2 — CSS

```css
#letter-scroll-target {
  display: flex;
}

#letter-scroll-target .letter-scroll {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

#letter-scroll-target .letter-wrap {
  overflow: hidden;
  position: relative;
}

#letter-scroll-target .letter-inner {
  display: flex;
  flex-direction: column;
  /* Gap visual entre original y duplicado */
  gap: 3rem;
  will-change: transform;
}
```

### Paso 3 — JavaScript (módulo ES6)

```js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function letterScrollSlot() {
  const container = document.getElementById('letter-scroll-target')
  if (!container) return

  const letters = container.querySelectorAll('.letter')
  if (!letters.length) return

  const innerEls = []

  letters.forEach((el) => {
    // 1. Crear wrapper con overflow hidden
    const wrap = document.createElement('div')
    wrap.classList.add('letter-wrap')

    // 2. Crear contenedor interno (columna vertical)
    const inner = document.createElement('div')
    inner.classList.add('letter-inner')

    // 3. Clonar el elemento
    const clone = el.cloneNode(true)
    clone.classList.remove('letter')
    clone.classList.add('letter-dup')

    // 4. Ensamblar: wrap > inner > [original, clone]
    el.parentNode.insertBefore(wrap, el)
    inner.appendChild(el)
    inner.appendChild(clone)
    wrap.appendChild(inner)

    innerEls.push(inner)
  })

  // 5. Timeline con stagger aleatorio
  const indices = Array.from({ length: innerEls.length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const staggerGap = 0.06
  const trigger = container.closest('footer') || container

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: trigger,
      start: 'top 50%',
      end: 'bottom bottom',
      scrub: 1,
    },
  })

  indices.forEach((idx, order) => {
    tl.to(
      innerEls[idx],
      {
        yPercent: -50,
        ease: 'power1.inOut',
        duration: 1,
      },
      order * staggerGap
    )
  })
}
```

**Nota sobre `yPercent: -50`:** Como `.letter-inner` contiene 2 elementos (original + clone) apilados en columna, mover -50% del contenedor desplaza exactamente una posición de letra. El `gap` en CSS se traduce automáticamente en el espacio visual entre las letras durante la transición.

---

## Parámetros configurables

| Parámetro | SVG | HTML | Descripción |
|-----------|-----|------|-------------|
| `gap` | Unidades SVG (ej: 440) | CSS `gap` en `.letter-inner` (ej: 3rem) | Espacio vertical entre letra original y duplicado |
| `staggerGap` | 0.06 | 0.06 | Desfase temporal entre letras en la timeline |
| `scrub` | 1 | 1 | Suavidad del scrub (mayor = más lag) |
| `start` | 'top 50%' | 'top 50%' | Inicio del ScrollTrigger |
| `end` | 'bottom bottom' | 'bottom bottom' | Fin del ScrollTrigger |
| `ease` | 'power1.inOut' | 'power1.inOut' | Curva de easing por letra |

---

## Diferencias clave entre SVG y HTML

| Aspecto | SVG | HTML |
|---------|-----|------|
| **Clipping** | `<clipPath>` dinámico en `<defs>` | `overflow: hidden` en wrapper |
| **Posición del clone** | `transform: translate(0, -(height+gap))` | Apilado con `flex-direction: column` + `gap` |
| **Animación** | `y: height + gap` (unidades SVG) | `yPercent: -50` (porcentaje del contenedor) |
| **Detección de tamaño** | `getBBox()` automático | Automático via layout CSS |

---

## Troubleshooting

### 1) "La animación no completa al 100%"

**Causa:** El contenedor está cerca del final de la página y no hay suficiente recorrido de scroll.

**Solución:** Usar un ancestro más alto como `trigger` del ScrollTrigger:
```js
const trigger = container.closest('footer') || container.closest('section') || container
```

### 2) "Las letras se ven cortadas durante la animación" (solo SVG)

**Causa:** El `clipPath` no coincide con el `getBBox()`.

**Solución:** Verificar que el SVG esté visible (no `display:none`) al momento de ejecutar el JS, ya que `getBBox()` requiere que el SVG esté renderizado.

### 3) "El gap no se ve"

- **SVG:** Aumentar el valor de `gap` (probar 300–600 según el viewBox).
- **HTML:** Aumentar `gap` en `.letter-inner` (probar 2rem–5rem).

### 4) "El stagger siempre es igual"

El shuffle usa `Math.random()`, así que varía en cada carga. Si necesitás un orden fijo, reemplazar el shuffle por un array estático de índices.

---

## Checklist

- [ ] Contenedor con `id` específico y `overflow: hidden`
- [ ] Cada letra con `class="letter"`
- [ ] **SVG:** `<defs></defs>` vacío presente en el SVG
- [ ] **HTML:** CSS con `.letter-wrap { overflow: hidden }` y `.letter-inner { flex-direction: column; gap }`
- [ ] JS importado y llamado desde `functions.js` o equivalente
- [ ] ScrollTrigger `trigger` apunta a un elemento con suficiente recorrido de scroll
- [ ] Verificar que todas las letras lleguen a 100% al final del scroll
- [ ] Lenis sincronizado con GSAP ticker (si aplica)
