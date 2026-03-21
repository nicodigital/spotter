---
name: interactive-spotlight
description: Crea un efecto de brillo (spotlight) que sigue el movimiento del mouse sobre elementos como tarjetas o contenedores.
---

# Interactive Spotlight Skill

Este skill permite implementar un efecto visual de "foco" o "resplandor" interactivo que sigue el puntero del mouse sobre elementos seleccionados. Es ideal para tarjetas de beneficios, secciones de características o cualquier contenedor que requiera un toque premium e interactivo.

## Componentes Principales

1.  **Spotlight.js**: Utilidad para rastrear el mouse y actualizar las variables CSS en tiempo real.
2.  **spotlight.css**: Estilos base para definir el gradiente y el comportamiento del resplandor.
3.  **Estructura HTML**: Uso de clases CSS para activar el efecto.

## Implementación Paso a Paso

### 1. Preparar el HTML

Añade la clase `spotlight-card` a cualquier elemento que desees que tenga el efecto:

```html
<div class="spotlight-card">
  <h3>Título del Pilar</h3>
  <p>Descripción del contenido con un toque interactivo.</p>
</div>
```

### 2. Estilos CSS

El efecto utiliza un pseudo-elemento `::before` con un `radial-gradient` que depende de las variables CSS `--mouse-x` y `--mouse-y`.

[Ver spotlight.css](file:///c:/PROYECTOS/MELGAR/.agents/skills/interactive-spotlight/resources/spotlight.css)

### 3. Lógica JavaScript

Inicializa el rastreador de mouse para los elementos deseados:

```javascript
import { Spotlight } from './scripts/Spotlight.js';

// Inicializa en todos los elementos con la clase .spotlight-card
Spotlight.init('.spotlight-card');
```

## Características Especiales

- **Hardware Accelerated**: Utiliza variables CSS y transformaciones para un rendimiento fluido.
- **Auto-calculado**: El script calcula automáticamente la posición relativa del mouse respecto a cada tarjeta individualmente.
- **Altamente configurable**: Puedes ajustar el tamaño, color y opacidad del brillo directamente en el CSS.

## Ejemplo de Integración en PHP / HTML

```html
<!-- Incluye el CSS -->
<link rel="stylesheet" href="path/to/spotlight.css">

<div class="container">
    <div class="spotlight-card">Tarjeta 1</div>
    <div class="spotlight-card">Tarjeta 2</div>
</div>

<!-- Incluye el JS y ejecuta -->
<script type="module">
    import { Spotlight } from './scripts/Spotlight.js';
    Spotlight.init('.spotlight-card');
</script>
```
