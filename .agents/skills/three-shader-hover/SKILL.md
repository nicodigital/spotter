# Skill: Three.js Shader Hover Effect (GRIDBOX 3.0 — Vanilla JS)

**Description:** Implementa efectos de distorsión WebGL (shaders GLSL) sobre imágenes al hacer hover, usando Three.js puro y la arquitectura modular de GRIDBOX 3.0 (PHP vanilla + JS vanilla + esbuild). Crea impacto visual de nivel creativo sin dependencias de React/Vue.

**Argument-hint:** `[js/module/shader-hover.js]`
**Non-interactive:** true

---

## Phase 1 — Instalación de Three.js

Three.js se instala como dependencia local (offline-first, coherente con GRIDBOX):

```bash
pnpm add three
```

Se importa directamente en el módulo JS. esbuild lo resuelve y lo incluye en el bundle compilado (`public/js/main.js`). **No usar CDN.**

---

## Phase 2 — Módulo JS: `js/module/shader-hover.js`

Crear el módulo siguiendo la convención de GRIDBOX (`js/module/*.js`, export default función):

```js
// js/module/shader-hover.js
import * as THREE from 'three'

/**
 * Shader Hover Effect
 * Aplica distorsión WebGL a imágenes con clase .shader-img al hacer hover.
 * Opciones configurables vía atributos data-*.
 */

// ─── Shaders GLSL ───────────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Efectos disponibles: wave, liquid, chromatic
const fragmentShaders = {
  wave: `
    uniform sampler2D uTexture;
    uniform float uHover;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      uv.y += sin(uv.x * 10.0 + uTime) * uIntensity * uHover;
      gl_FragColor = texture2D(uTexture, uv);
    }
  `,
  liquid: `
    uniform sampler2D uTexture;
    uniform float uHover;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      uv += uIntensity * uHover * vec2(
        sin(uv.y * 8.0 + uTime),
        cos(uv.x * 8.0 + uTime)
      );
      gl_FragColor = texture2D(uTexture, uv);
    }
  `,
  chromatic: `
    uniform sampler2D uTexture;
    uniform float uHover;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      float offset = uIntensity * uHover * 0.01;
      float r = texture2D(uTexture, uv + vec2(offset, 0.0)).r;
      float g = texture2D(uTexture, uv).g;
      float b = texture2D(uTexture, uv - vec2(offset, 0.0)).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
}

// ─── Shared Renderer (evita "Too many active WebGL contexts") ──
let sharedRenderer = null

function getSharedRenderer() {
  if (!sharedRenderer) {
    sharedRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    sharedRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  return sharedRenderer
}

// ─── Clase por instancia ────────────────────────────────────
class ShaderImage {
  constructor(container) {
    this.container = container
    this.img = container.querySelector('img')
    if (!this.img) return

    // Leer opciones desde data-attributes
    this.effect = container.dataset.shaderEffect || 'wave'
    this.intensity = parseFloat(container.dataset.shaderIntensity) || 0.3
    this.speed = parseFloat(container.dataset.shaderSpeed) || 1.0

    this.hoverValue = { current: 0, target: 0 }
    this.clock = new THREE.Clock()
    this.isVisible = false

    this._init()
  }

  _init() {
    if (this.img.complete) {
      this._setup()
    } else {
      this.img.addEventListener('load', () => this._setup(), { once: true })
    }
  }

  _setup() {
    const { width, height } = this.container.getBoundingClientRect()

    // Scene & Camera
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    this.camera.position.z = 1

    // Texture
    const loader = new THREE.TextureLoader()
    this.texture = loader.load(this.img.src)

    // Material con shader seleccionado
    const fragCode = fragmentShaders[this.effect] || fragmentShaders.wave
    this.uniforms = {
      uTexture: { value: this.texture },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uIntensity: { value: this.intensity }
    }

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: fragCode,
      uniforms: this.uniforms,
      transparent: true
    })

    // Mesh
    const geometry = new THREE.PlaneGeometry(1, 1)
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.scene.add(this.mesh)

    // Canvas — se superpone a la imagen
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity 0.3s'
    this.container.style.position = 'relative'
    this.container.appendChild(this.canvas)

    this._resize(width, height)
    this._addEvents()
    this._observe()
  }

  _resize(w, h) {
    this.width = w
    this.height = h
    this.canvas.width = w * Math.min(window.devicePixelRatio, 2)
    this.canvas.height = h * Math.min(window.devicePixelRatio, 2)
  }

  _addEvents() {
    this.container.addEventListener('mouseenter', () => {
      this.hoverValue.target = 1
      this.canvas.style.opacity = '1'
      this.img.style.opacity = '0'
    })
    this.container.addEventListener('mouseleave', () => {
      this.hoverValue.target = 0
      this.canvas.style.opacity = '0'
      this.img.style.opacity = '1'
    })

    window.addEventListener('resize', () => {
      const { width, height } = this.container.getBoundingClientRect()
      this._resize(width, height)
    })
  }

  _observe() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        this.isVisible = entry.isIntersecting
        if (this.isVisible) this._animate()
      },
      { threshold: 0.1 }
    )
    observer.observe(this.container)
  }

  _animate() {
    if (!this.isVisible) return
    requestAnimationFrame(() => this._animate())

    // Lerp hover
    this.hoverValue.current += (this.hoverValue.target - this.hoverValue.current) * 0.07
    this.uniforms.uHover.value = this.hoverValue.current
    this.uniforms.uTime.value = this.clock.getElapsedTime() * this.speed

    // Render con Shared Renderer
    const renderer = getSharedRenderer()
    renderer.setSize(this.width, this.height)
    renderer.render(this.scene, this.camera)

    // Copiar resultado al canvas de esta instancia
    const ctx = this.canvas.getContext('2d')
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.drawImage(renderer.domElement, 0, 0, this.canvas.width, this.canvas.height)
  }
}

// ─── Init ───────────────────────────────────────────────────
export default function shaderHover() {
  const containers = document.querySelectorAll('.shader-img')
  if (!containers.length) return
  containers.forEach(el => new ShaderImage(el))
}
```

---

## Phase 3 — Markup HTML/PHP

El componente se activa con la clase `.shader-img` en un contenedor. Opciones vía `data-*`:

| Atributo | Valores | Default | Descripción |
|---|---|---|---|
| `data-shader-effect` | `wave`, `liquid`, `chromatic` | `wave` | Tipo de distorsión |
| `data-shader-intensity` | `0.1` — `1.0` | `0.3` | Fuerza del efecto |
| `data-shader-speed` | `0.5` — `3.0` | `1.0` | Velocidad de animación |

### Ejemplo en PHP (layout o componente GRIDBOX):

```php
<!-- Ejemplo básico -->
<div class="shader-img" data-shader-effect="wave" data-shader-intensity="0.4">
  <?php
    $img = new Picture('images/portfolio/project-01.jpg');
    $img->set('alt', 'Proyecto 01')->set('webp', true);
    echo $img->generate();
  ?>
</div>

<!-- Grid de portfolio con diferentes efectos -->
<row>
  <div class="xg:col-1-5 shader-img" data-shader-effect="liquid" data-shader-intensity="0.5">
    <img src="images/work-1.jpg" alt="Work 1">
  </div>
  <div class="xg:col-5-9 shader-img" data-shader-effect="chromatic" data-shader-intensity="0.3">
    <img src="images/work-2.jpg" alt="Work 2">
  </div>
  <div class="xg:col-9-13 shader-img" data-shader-effect="wave" data-shader-speed="2.0">
    <img src="images/work-3.jpg" alt="Work 3">
  </div>
</row>
```

### CSS mínimo recomendado (`css/components/shader-hover.css`):

```css
.shader-img {
  position: relative;
  overflow: hidden;
}

.shader-img img {
  display: block;
  width: 100%;
  height: auto;
  transition: opacity 0.3s ease;
}
```

Importar en `css/global.css`:
```css
@import './components/shader-hover.css';
```

---

## Phase 4 — Integración en GRIDBOX

### 4.1 Registrar en `js/functions.js`

```js
import shaderHover from './module/shaderHover.js'

function functions(deviceData) {
  // ... otros módulos
  if (deviceData.isDesktop) shaderHover() // Solo en desktop (requiere hover)
}
```

> **Nota:** Se condiciona a `deviceData.isDesktop` porque el efecto requiere hover con mouse. En móviles no tiene sentido y ahorra recursos WebGL.

### 4.2 Si se usa Barba.js (SPA transitions)

Para reinicializar en cada transición de página, usar la firma con `container`:

```js
function functions(container = document, deviceData) {
  // ...
  if (deviceData.isDesktop) shaderHover()
}
```

No se requiere cleanup porque el `IntersectionObserver` deja de disparar el render cuando los elementos salen del viewport.

---

## Phase 5 — Optimización y Performance

- **Shared Renderer:** Un solo `WebGLRenderer` compartido entre todas las instancias. Evita el error `Too many active WebGL contexts` (límite ~8-16 en la mayoría de navegadores). Cada instancia copia el frame a su propio `<canvas>` 2D.
- **IntersectionObserver:** Solo las imágenes visibles ejecutan `requestAnimationFrame` → zero GPU cost fuera de viewport.
- **Pixel Ratio:** Limitado a `Math.min(devicePixelRatio, 2)` para evitar renders excesivos en pantallas 3x/4x.
- **Lazy-compatible:** Funciona con el sistema `lazyLoader` de GRIDBOX. Si se usa lazy loading, inicializar `shaderHover()` después de que las imágenes estén cargadas.

---

## Phase 6 — Archivos generados

| Archivo | Ubicación | Propósito |
|---|---|---|
| `shaderHover.js` | `js/module/shaderHover.js` | Módulo principal con clase y shaders |
| `shader-hover.css` | `css/components/shader-hover.css` | Estilos base del contenedor |

Three.js se resuelve vía `node_modules` y esbuild lo incluye en el bundle. **No se generan archivos adicionales.**

---

## Resumen de implementación

1. `pnpm add three`
2. Crear `js/module/shaderHover.js` con el código de Phase 2
3. Crear `css/components/shader-hover.css` e importar en `css/global.css`
4. Importar y llamar `shaderHover()` en `js/functions.js` (condicionado a desktop)
5. Agregar clase `.shader-img` + atributos `data-*` en el markup PHP deseado
6. Ejecutar `pnpm dev` — esbuild compila todo en el bundle
