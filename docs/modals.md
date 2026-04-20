# Modales (uso rápido)

Este proyecto usa un sistema de modales centralizado en `src/components/Modals.astro`.

## 1) Crear un modal

Cada modal debe ser un `<dialog>` con el identificador por `data-modal` y estado inicial `off`.

```astro
<dialog data-modal="contact-form" data-show="off">
  <!-- contenido -->
</dialog>
```

### Requisitos recomendados

- Agregar `aria-labelledby` apuntando al título del modal.
- Incluir un botón con `data-close-modal` para cierre explícito.
- Usar clases de Tailwind en el markup como primera opción.

## 2) Crear un trigger de apertura

Cualquier elemento que abra un modal debe tener:

- clase `.open-modal`
- atributo `data-modal="nombre-del-modal"`

Ejemplo:

```astro
<a href="#" class="open-modal" data-modal="contact-form">Cotizar</a>
```

También funciona con el componente `Button.astro`:

```astro
<Button href="#" class="open-modal" data-modal="contact-form">
  Cotizar
</Button>
```

## 3) Comportamiento implementado

`Modals.astro` ya resuelve:

- Apertura por trigger (`.open-modal[data-modal]`).
- Cierre por botón (`[data-close-modal]`).
- Cierre al clickear fuera del panel (backdrop).
- Cierre con tecla `Escape`.
- Bloqueo de scroll del body con clase `modal-open`.
- View Transitions cuando el navegador soporta `document.startViewTransition`.

## 4) Agregar nuevos modales

1. Crear el componente en `src/components/modals/`.
2. Importarlo y renderizarlo dentro de `src/components/Modals.astro`.
3. Usar un trigger con el mismo `data-modal` en cualquier sección (header, footer, etc.).
