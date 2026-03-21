---
description: Convertir proyecto GRIDBOX maquetado a tema WordPress funcional
---

# Workflow: WP THEMING (conversión a tema WordPress)

Este workflow convierte un proyecto GRIDBOX maquetado en un tema WordPress funcional, **respetando la estructura original** del proyecto. No implica crear un blog, sino un sitio web gestionable desde WordPress.

## Filosofía

- **Conservador**: Solo convertimos lo necesario para que funcione como tema WP
- **Respetar estructura**: Mantenemos la arquitectura de carpetas y archivos existente
- **Bajo demanda**: No creamos archivos adicionales salvo que se solicite explícitamente

---

## 1) Crear `style.css`

Crear en la raíz del proyecto con la cabecera de tema WP:

```css
/*
Theme Name: Nombre del proyecto
Theme URI: https://www.dominio.com/
Author: Nicolás González
Author URI: https://nicolasgonzalez.dev/
Description: Tema WordPress derivado de GRIDBOX.
Version: 1.0.0
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Text Domain: slug_proyecto
*/
```

---

## 2) Crear `screenshot.png`

Crear captura de pantalla del tema según convenciones WordPress:
- **Dimensiones**: 1200x900 píxeles
- **Formato**: PNG
- **Ubicación**: Raíz del tema

---

## 3) Header y Footer (includes)

Mantener la sintaxis de includes simple:

```php
<?php include "header.php" ?>
<!-- contenido -->
<?php include "footer.php" ?>
```

**NO usar** `get_header()` / `get_footer()` — preferimos includes directos para heredar variables.

---

## 4) Adaptar `header.php`

### 4.1) Body class

Sustituir la clase del elemento `<body>` por:

```php
<body <?php body_class("toggler otras-clases-originales") ?>>
```

> Incluir dentro de `body_class()` todas las clases que estaban en el markup original.

### 4.2) wp_head()

Agregar antes del cierre de `</head>`:

```php
<?php wp_head(); ?>
```

---

## 5) Adaptar `footer.php`

Agregar `wp_footer()` **antes** del script `instant.page.js`:

```php
<?php wp_footer(); ?>
<script src="<?= $theme_url ?>/js/instant.page.js" defer></script>
</body>
</html>
```

---

## 6) Variables de rutas

La variable `$base_url` del proyecto debe sustituirse según el contexto:

| Contexto | Antes | Después |
|----------|-------|---------|
| **Enlaces internos** | `$base_url` | `home_url()` |
| **Assets (img, css, js)** | `$base_url` | `$theme_url` |

### 6.1) Definir `$theme_url`

En `inc/wp/global.php`:

```php
<?php
$theme_url = get_stylesheet_directory_uri();
```

### 6.2) Ejemplos de sustitución

**Enlaces:**
```php
// Antes
<a href="<?= $base_url ?>contacto">Contacto</a>

// Después
<a href="<?= home_url('/contacto') ?>">Contacto</a>
```

**Assets:**
```php
// Antes
<img src="<?= $base_url ?>img/logo.svg" alt="Logo">

// Después (notar el "/" después de $theme_url)
<img src="<?= $theme_url ?>/img/logo.svg" alt="Logo">
```

### 6.3) Rutas en componentes de PHP

``` php
// Antes
$img = new Picture('public/img/logos/gbarra-stpeters-logo.webp');
svg('public/img/icons/marker.svg', 'w-5 absolute -left-5');

// Después
$img = new Picture($theme_url . '/img/logos/gbarra-stpeters-logo.webp');
svg( $theme_url . '/img/icons/marker.svg', 'w-5 absolute -left-5');
```

---

## 7) Reglas de includes PHP

### 7.1) Archivos en la raíz del proyecto

Incluir directamente **sin** constantes ni variables:

```php
include 'layout/section/home/hero.php';
include 'inc/tools.php';
```

### 7.2) Archivos un nivel o más profundo

Usar `TEMPLATEPATH`:

```php
<?php include TEMPLATEPATH . "/layout/partials/menu.php" ?>
```

### 7.3) Ejemplo en `functions.php`

```php
<?php
defined('ABSPATH') || exit;

global $post;

include 'inc/tools.php';
include 'inc/wp/deregister.php';
include 'inc/wp/global.php';
```

---

## 8) Adaptar `css.php` y `js.php`

Estos archivos gestionan la carga de CSS y JS. Actualizar las rutas:

**CSS (filesystem path):**
```php
// Antes
$css = 'public/style.css';

// Después
$css = TEMPLATEPATH . '/public/style.css';
```

**JS (URL):**
```php
// Antes
$js = 'public/js/scripts.js';

// Después
$js = $theme_url . '/public/js/scripts.js';
```

---

## 9) Crear `home.php`

Migrar el contenido de `index.php` hacia `home.php`:

```php
<?php include "header.php" ?>

<main>
<?php
    $sections = [
        'home/hero',
        'home/about',
        // ... resto de secciones
    ];

    foreach ($sections as $file) {
        include 'layout/section/' . $file . '.php';
    }
?>
</main>

<?php include "footer.php" ?>
```
Dejando index.php solo con el contenido `<?php /* the silence is golden */ ?>`
El archivo `home.php` se asignará como página de inicio desde el administrador de WordPress.

---

## 10) Convertir páginas en templates

Las páginas PHP en la raíz del proyecto deben convertirse en templates de WordPress agregando al inicio:

```php
<?php 
/*
* Template Name: Nombre de la página 
*/
?>
```

**Ejemplo para `contacto.php`:**

```php
<?php 
/*
* Template Name: Contacto
*/
?>
<?php include "header.php" ?>
<!-- contenido de la página -->
<?php include "footer.php" ?>
```

---

## 11) Variable de cache

Sustituir la variable de cache del proyecto:

```php
// Antes
$cache

// Después
$clear_cache
```

---

## 12) Crear `functions.php`

Crear el archivo con la siguiente estructura de includes:

```php
<?php
defined('ABSPATH') || exit;

global $post;

include 'inc/tools.php';
include 'inc/wp/deregister.php';
include 'inc/wp/global.php';
include 'inc/wp/admin-enqueue.php';
include 'inc/wp/frontend-enqueue.php';
include 'inc/wp/custom-theme.php';
include 'inc/wp/uploads.php';
include 'inc/wp/svg-support.php';
include 'inc/wp/custom-admin.php';
include 'inc/wp/disable-gutenberg.php';
include 'inc/wp/remove-native-post.php';
include 'inc/wp/remove-comments.php';
include 'inc/wp/custom-cf7.php';
include 'inc/wp/list-by-fecha.php';
include 'inc/wp/login-styles.php';
include 'inc/wp/widgets.php';
include 'inc/wp/preview-button.php';
```

> **Nota**: Los archivos en `inc/wp/` se crearán bajo demanda según las necesidades del proyecto.

---

## Checklist de migración

- [ ] `style.css` con cabecera válida de tema WP
- [ ] `screenshot.png` creado (1200x900px)
- [ ] `wp_head()` antes de `</head>`
- [ ] `wp_footer()` antes del script instant.page
- [ ] `body_class()` con clases originales
- [ ] `$base_url` sustituido por `home_url()` o `$theme_url`
- [ ] `$theme_url` definido en `inc/wp/global.php`
- [ ] Includes PHP con sintaxis correcta según nivel
- [ ] `css.php` y `js.php` con rutas actualizadas
- [ ] `home.php` creado desde `index.php`
- [ ] Páginas convertidas en templates WP
- [ ] `$cache` → `$clear_cache`
- [ ] `functions.php` con lista de includes

---

## Errores comunes a evitar

1. Usar `get_header()`/`get_footer()` en lugar de includes directos
2. Olvidar el `/` después de `$theme_url` en assets
3. Usar `$theme_url` para includes PHP (debe ser `TEMPLATEPATH`)
4. Omitir `wp_head()` o `wp_footer()`
5. No incluir clases originales en `body_class()`

---

## Resultado esperado

El proyecto queda convertido en un tema WordPress funcional, **conservando la estructura original** y con rutas/variables migradas para compatibilidad con el ecosistema WP.
