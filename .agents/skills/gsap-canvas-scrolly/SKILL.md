---
name: gsap-canvas-scrolly
description: Crea fondos dinámicos con secuencias de imágenes en Canvas controladas por GSAP ScrollTrigger, incluyendo un loader de carga premium.
---

# GSAP Canvas Scrolly

Este skill permite implementar un fondo de alto impacto visual utilizando una secuencia de imágenes (frames) renderizadas en un `<canvas>`. La animación se sincroniza con el scroll del usuario mediante GSAP y ScrollTrigger.

## Componentes Principales

1.  **CanvasScrolly.js**: Clase de JavaScript encargada de la lógica de carga, renderizado y scroll.
2.  **scrolly-base.css**: Estilos base para el contenedor, el canvas y el loader.
3.  **Estructura HTML**: El marcado necesario para que el sistema funcione.

## Requisitos

- [GSAP](https://gsap.com/) (con el plugin ScrollTrigger).
- Una secuencia de imágenes numeradas o un array de URLs de imágenes.

## Implementación Paso a Paso

### 1. Preparar el HTML

Copia el siguiente código en tu archivo (e.g., `index.php` o `Component.astro`):

```html
<!-- Loader Screen -->
<div id="scrolly-loader" class="scrolly-loader-container">
  <div class="scrolly-loader-title">MELGAR</div>
  <div class="scrolly-loader-bar-bg">
    <div id="scrolly-progress-bar" class="scrolly-loader-bar-fill"></div>
  </div>
  <div id="scrolly-percentage" class="scrolly-loader-text">0%</div>
</div>

<!-- Background Wrapper -->
<div id="scrolly-wrapper" class="scrolly-wrapper-pinned">
  <canvas id="scrolly-canvas" class="scrolly-canvas-element"></canvas>
</div>

<!-- Trigger Content -->
<!-- Este elemento define la duración del scroll para la animación -->
<div id="scrolly-trigger" style="height: 300vh;">
  <!-- Tu contenido aquí -->
</div>
```

### 2. Estilos CSS

Asegúrate de incluir los estilos base para que el layout se comporte correctamente (pinning y cover behavior).

[Ver scrolly-base.css](file:///c:/PROYECTOS/MELGAR/.agents/skills/gsap-canvas-scrolly/resources/scrolly-base.css)

### 3. Lógica JavaScript

Instancia la clase `CanvasScrolly` pasando la configuración necesaria:

```javascript
import { CanvasScrolly } from './scripts/CanvasScrolly.js';

const frames = [
  'path/to/frame_001.jpg',
  'path/to/frame_002.jpg',
  // ... resto de los frames
];

const scrolly = new CanvasScrolly({
  canvasId: 'scrolly-canvas',
  wrapperId: 'scrolly-wrapper',
  triggerId: 'scrolly-trigger',
  loaderId: 'scrolly-loader',
  frames: frames,
  scrub: 0.5
});

scrolly.init();
```

## Características Especiales

- **Object-Fit Cover**: El canvas se redimensiona automáticamente manteniendo el aspecto de las imágenes, similar al `object-fit: cover` de CSS.
- **DPR Awareness**: Soporte nativo para pantallas de alta densidad (Retina) para máxima nitidez.
- **Loader Integrado**: Gestiona automáticamente la opacidad y el display del loader una vez completada la precarga.
- **Scroll Limit**: La animación de canvas está atada a un "trigger" específico, permitiendo que el resto de la página continúe normalmente después.

## Ejemplo de Integración en PHP

```php
<script type="module">
  import { CanvasScrolly } from './scripts/CanvasScrolly.js';
  
  // En PHP podrías generar el array de frames dinámicamente
  const frames = <?php echo json_encode($image_sequence); ?>;

  const config = {
      canvasId: 'scrolly-canvas',
      wrapperId: 'scrolly-wrapper',
      triggerId: 'scrolly-trigger',
      frames: frames
  };

  new CanvasScrolly(config).init();
</script>
```
