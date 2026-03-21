---
description: Implementar filtrado AJAX de custom post types con taxonomías, ViewTransitions API, IntersectionObserver y paginación en WordPress
---

# WP Filter AJAX

Patrón completo para filtrar custom post types por taxonomía vía AJAX en WordPress, con animaciones (IntersectionObserver), ViewTransitions API y paginación.

---

## Arquitectura de archivos

```
├── {template-page}.php           # Template principal con query, grid, filtros y config JS
├── js/module/{cpt}-filter.js     # Módulo ES6: fetch AJAX, ViewTransitions, IntersectionObserver
├── inc/footer/{page}-scripts.php # Script tag que importa el módulo JS
├── inc/wp/ajax.php               # Handler AJAX (wp_ajax_ hooks)
├── layout/partials/filter-{cpt}.php   # Botones de filtro por taxonomía
├── layout/partials/card-{cpt}.php     # Card partial (usado en template Y en AJAX)
├── layout/partials/pagination.php     # Paginación reutilizable
├── css/components/animations.css      # Reglas de animación con .anim-on y .active
```

---

## Paso 1: Template principal (PHP)

Archivo: `{slug-pagina}.php`

```php
<?php
/*
* Template Name: {Nombre de Página}
*/
global $template_dir, $theme_url, $svgLoad;
include 'header.php';

$currPaged = get_query_var('paged') ? get_query_var('paged') : 1;
$posts_per_page = 9;

$args = [
  'post_type' => '{cpt_slug}',
  'posts_per_page' => $posts_per_page,
  'paged' => $currPaged,
  'orderby' => 'date',
  'order' => 'DESC'
];

$main_query = new WP_Query($args);

// Obtener términos de la taxonomía para los filtros
$terms = get_terms([
  'taxonomy' => '{taxonomy_slug}',
  'hide_empty' => true,
  'orderby' => 'name',
  'order' => 'ASC'
]);

$total_pages = $main_query->max_num_pages;
$showing_count = min($posts_per_page, $main_query->found_posts - (($currPaged - 1) * $posts_per_page));
?>

<!-- Filtros -->
<?php include $template_dir . '/layout/partials/filter-{cpt}.php'; ?>

<!-- Grid de cards -->
<grid id="{cpt}-grid" class="xg:grid-cols-3 gap-2 group">
  <?php
  if ($main_query->have_posts()):
    $index = 0;
    while ($main_query->have_posts()):
      $main_query->the_post();
      $item = $post;
      include $template_dir . '/layout/partials/card-{cpt}.php';
      $index++;
    endwhile;
    wp_reset_postdata();
  endif;
  ?>
</grid>

<!-- Paginación -->
<div id="{cpt}-pagination" class="flex justify-center py-6 xg:pb-0 xg:pt-10">
  <?php
  $posts_query = $main_query;
  include $template_dir . '/layout/partials/pagination.php';
  ?>
</div>

<!-- Config JS para el módulo de filtros -->
<script>
window.matosFilter = {
  ajaxUrl: '<?= admin_url('admin-ajax.php') ?>',
  currentPage: <?= $currPaged ?>,
  totalPages: <?= $total_pages ?>,
  currentCategory: 'all'
};
</script>

<?php include 'footer.php';
```

**Puntos clave:**
- `window.matosFilter` expone `ajaxUrl`, `currentPage`, `totalPages` y `currentCategory` al JS
- El `id` del grid y la paginación deben coincidir con los IDs del módulo JS
- `$index` se usa para delays escalonados en las animaciones de las cards

---

## Paso 2: Partial de filtros (PHP)

Archivo: `layout/partials/filter-{cpt}.php`

```php
<div class="flex flex-col items-center gap-2 pb-2">
  <div id="filter" class="flex flex-wrap gap-1">
    <button type="button" class="cat-tag active" data-category="all">
      Todos
    </button>
    <?php foreach ($terms as $term) : ?>
      <button type="button" class="cat-tag" data-category="<?= esc_attr($term->slug) ?>">
        <?= esc_html($term->name) ?>
      </button>
    <?php endforeach; ?>
  </div>
  <p class="text-gray-500">
    Página <span id="current-page"><?= $currPaged ?></span> de <span id="total-pages"><?= $total_pages ?></span>
    — <span id="showing-count"><?= $showing_count ?></span> de <span id="total-posts"><?= $main_query->found_posts ?></span> items
  </p>
</div>
```

**Puntos clave:**
- `id="filter"` es el contenedor donde JS escucha clicks por delegación
- Cada botón tiene `data-category="{slug}"`, el valor `"all"` es el default
- `.cat-tag.active` marca el filtro activo visualmente
- Los `<span>` con IDs se actualizan dinámicamente desde JS tras cada AJAX

---

## Paso 3: Handler AJAX (PHP)

Archivo: `inc/wp/ajax.php` — Agregar al final:

```php
add_action('wp_ajax_nopriv_matos_filter_{cpt}', 'matos_filter_{cpt}');
add_action('wp_ajax_matos_filter_{cpt}', 'matos_filter_{cpt}');

function matos_filter_{cpt}() {
  $category = isset($_POST['category']) ? sanitize_text_field($_POST['category']) : 'all';
  $currPaged = isset($_POST['paged']) ? intval($_POST['paged']) : 1;
  $posts_per_page = 9;

  $args = [
    'post_type' => '{cpt_slug}',
    'posts_per_page' => $posts_per_page,
    'paged' => $currPaged,
    'orderby' => 'date',
    'order' => 'DESC'
  ];

  // Filtro por taxonomía (si no es "all")
  if ($category !== 'all') {
    $args['tax_query'] = [
      [
        'taxonomy' => '{taxonomy_slug}',
        'field' => 'slug',
        'terms' => $category
      ]
    ];
  }

  $query = new WP_Query($args);
  $template_dir = get_template_directory();
  $theme_url = get_template_directory_uri();
  global $svgLoad;

  // Capturar HTML de cards
  ob_start();
  $index = 0;
  if ($query->have_posts()) {
    while ($query->have_posts()) {
      $query->the_post();
      global $post;
      $item = $post;
      // Incluir card partial O renderizar inline
      include $template_dir . '/layout/partials/card-{cpt}.php';
      $index++;
    }
  }
  $cards = ob_get_clean();
  wp_reset_postdata();

  // Capturar HTML de paginación
  ob_start();
  $posts_query = $query;
  include $template_dir . '/layout/partials/pagination.php';
  $pagination = ob_get_clean();

  $showing_count = min($posts_per_page, $query->found_posts - (($currPaged - 1) * $posts_per_page));

  wp_send_json_success([
    'cards' => $cards,
    'pagination' => $pagination,
    'current_page' => $currPaged,
    'total_pages' => $query->max_num_pages,
    'found_posts' => $query->found_posts,
    'showing_count' => $showing_count
  ]);
}
```

**Puntos clave:**
- Registrar hooks para `wp_ajax_` y `wp_ajax_nopriv_` (usuarios logueados y no logueados)
- `sanitize_text_field()` para el category, `intval()` para paged
- `ob_start()` / `ob_get_clean()` para capturar HTML de cards y paginación
- `wp_send_json_success()` devuelve JSON estructurado con `success: true`
- Si el card partial usa clases como `Picture` o `$svgLoad`, asegurar que estén disponibles en contexto AJAX (globales o autoload)
- **IMPORTANTE**: Si el card partial usa clases/helpers que no están disponibles en AJAX, renderizar el HTML inline en el handler

---

## Paso 4: Módulo JavaScript (ES6)

Archivo: `js/module/{cpt}-filter.js`

```javascript
function cptFilter() {
  const grid = document.getElementById('{cpt}-grid');
  const pagination = document.getElementById('{cpt}-pagination');
  const filterContainer = document.getElementById('filter');
  const currentPageEl = document.getElementById('current-page');
  const totalPagesEl = document.getElementById('total-pages');
  const showingCountEl = document.getElementById('showing-count');
  const totalPostsEl = document.getElementById('total-posts');

  if (!grid || !filterContainer) return;

  let isLoading = false;

  async function fetchItems(category = 'all', page = 1) {
    if (isLoading) return;
    isLoading = true;

    const formData = new FormData();
    formData.append('action', 'matos_filter_{cpt}');
    formData.append('category', category);
    formData.append('paged', page);

    try {
      const response = await fetch(window.matosFilter.ajaxUrl, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        window.matosFilter.currentPage = data.data.current_page;
        window.matosFilter.totalPages = data.data.total_pages;
        window.matosFilter.currentCategory = category;

        const updateDOM = () => {
          grid.innerHTML = data.data.cards;
          pagination.innerHTML = data.data.pagination;

          // Fix: marcar cards AJAX como activas para evitar opacity:0 de [data-anim]
          const ajaxAnimElements = grid.querySelectorAll('.anim[data-anim]');
          ajaxAnimElements.forEach((el) => el.classList.add('active'));

          if (currentPageEl) currentPageEl.textContent = data.data.current_page;
          if (totalPagesEl) totalPagesEl.textContent = data.data.total_pages;
          if (totalPostsEl) totalPostsEl.textContent = data.data.found_posts;
          if (showingCountEl) showingCountEl.textContent = data.data.showing_count;

          initAnimations();
        };

        // ViewTransitions API: transición suave si el navegador lo soporta
        if (document.startViewTransition) {
          document.startViewTransition(() => updateDOM());
        } else {
          updateDOM();
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      isLoading = false;
    }
  }

  // Delegación de eventos en filtros
  filterContainer.addEventListener('click', (e) => {
    const button = e.target.closest('.cat-tag');
    if (!button || button.classList.contains('active')) return;

    const category = button.dataset.category;
    filterContainer.querySelector('.cat-tag.active')?.classList.remove('active');
    button.classList.add('active');

    fetchItems(category, 1);
  });

  // Delegación de eventos en paginación
  pagination.addEventListener('click', (e) => {
    e.preventDefault();
    const pageLink = e.target.closest('.facetwp-page[data-page]');
    if (!pageLink || pageLink.classList.contains('active') || pageLink.classList.contains('dots')) return;

    const page = parseInt(pageLink.dataset.page, 10);
    fetchItems(window.matosFilter.currentCategory, page);

    document.getElementById('top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Re-inicializar animaciones en cards inyectadas por AJAX
  function initAnimations() {
    const animElements = grid.querySelectorAll('.anim[data-anim]');
    if ('IntersectionObserver' in window) {
      const animObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-on');
            entry.target.classList.add('active');
            animObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      animElements.forEach((el) => animObserver.observe(el));
    } else {
      animElements.forEach((el) => {
        el.classList.add('anim-on');
        el.classList.add('active');
      });
    }
  }
}

export default cptFilter
```

**Puntos clave:**
- `isLoading` previene requests duplicados
- `FormData` con `action`, `category` y `paged`
- `updateDOM()` se ejecuta dentro de `document.startViewTransition()` si está disponible
- **Fix de visibilidad**: se añade `.active` inmediatamente a las cards AJAX para que no queden `opacity: 0`
- `initAnimations()` usa `IntersectionObserver` para animar cards al entrar en viewport
- Las clases de animación son `.anim-on` (dispara keyframes) y `.active` (fallback `opacity: 1`)
- Paginación usa event delegation con `.facetwp-page[data-page]`

---

## Paso 5: Script de carga del módulo

Archivo: `inc/footer/{page}-scripts.php`

```php
<script type="module">
  import cptFilter from '<?= $theme_url ?>/js/module/{cpt}-filter.js';
  cptFilter();
</script>
```

Este archivo se incluye condicionalmente desde `inc/footer-scripts.php` cuando se detecta el template.

---

## Paso 6: CSS de animaciones

Archivo: `css/components/animations.css` — Asegurar estas reglas:

```css
/* Base: elementos con data-anim arrancan invisibles */
[data-anim]{
  opacity: 0;
  transition: all 1s ease;
}

/* Cuando IntersectionObserver los activa */
.anim-on{
  opacity: 1;
}

/* Fix para cards AJAX: visibilidad inmediata como fallback */
[data-anim].active{
  opacity: 1;
}

/* Animaciones por dirección */
[data-anim="bottom"].anim-on{ animation-name: AnimBottom; }
[data-anim="top"].anim-on{ animation-name: AnimTop; }
[data-anim="left"].anim-on{ animation-name: AnimLeft; }
[data-anim="right"].anim-on{ animation-name: AnimRight; }
[data-anim="fade"].anim-on{ animation-name: AnimFade; }
```

**Puntos clave:**
- `[data-anim]` → `opacity: 0` oculta los elementos hasta que se animen
- `.anim-on` → `opacity: 1` + keyframes de animación
- `[data-anim].active` → `opacity: 1` como **fix defensivo** para cards AJAX donde el observer puede no dispararse inmediatamente
- Sin `.active`, cards inyectadas por AJAX pueden quedar invisibles

---

## Paso 7: Paginación reutilizable

Archivo: `layout/partials/pagination.php`

```php
<?php
if (isset($posts_query) && $posts_query->max_num_pages > 1) {
  $query = $posts_query;
} else {
  global $wp_query;
  $query = $wp_query;
}

if ($query->max_num_pages > 1) {
  $big = 999999999;
  $pagination_links = paginate_links(array(
    'base'      => str_replace($big, '%#%', esc_url(get_pagenum_link($big))),
    'format'    => '?paged=%#%',
    'current'   => max(1, get_query_var('paged')),
    'total'     => $query->max_num_pages,
    'type'      => 'array',
    'prev_text' => '←',
    'next_text' => '→',
  ));
  if ($pagination_links) {
    echo '<div class="facetwp-pager"><div class="facetwp-pager">';
    foreach ($pagination_links as $link) {
      $link = str_replace('page-numbers', 'facetwp-page', $link);
      $link = str_replace('current', 'active', $link);
      echo $link;
    }
    echo '</div></div>';
  }
}
?>
```

**Puntos clave:**
- Convierte clases de WP (`page-numbers`, `current`) a clases propias (`facetwp-page`, `active`)
- Se añade `data-page` automáticamente por `paginate_links()` en los `<a>` generados
- En JS se busca `.facetwp-page[data-page]` para delegación de eventos

---

## Checklist de implementación

1. [ ] Crear template PHP con WP_Query, grid, filtros y `window.matosFilter`
2. [ ] Crear partial de filtros con botones `data-category`
3. [ ] Crear partial de card (reutilizable en template y AJAX)
4. [ ] Registrar handler AJAX en `inc/wp/ajax.php` (wp_ajax_ + wp_ajax_nopriv_)
5. [ ] Crear módulo JS con fetch, ViewTransitions, IntersectionObserver
6. [ ] Crear script loader en `inc/footer/{page}-scripts.php`
7. [ ] Verificar CSS: `[data-anim]` opacity:0, `.anim-on` opacity:1, `[data-anim].active` opacity:1
8. [ ] Compilar JS y CSS: `npm start`
9. [ ] Probar: filtros cambian cards, paginación funciona, animaciones se disparan

---

## Errores comunes y soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| Cards AJAX invisibles | `[data-anim]` tiene `opacity:0` y nunca recibe `.anim-on` | Añadir `.active` inmediatamente + CSS `[data-anim].active { opacity:1 }` |
| AJAX devuelve 0 o error | Handler no registrado o nombre de action incorrecto | Verificar que `add_action('wp_ajax_...')` coincida con `formData.append('action', '...')` |
| Card partial falla en AJAX | Clases/helpers no disponibles en contexto AJAX | Usar `global $svgLoad` o renderizar HTML inline en el handler |
| Paginación no funciona tras AJAX | Links no tienen `data-page` o clase incorrecta | Verificar que `paginate_links()` genera atributos correctos y JS busca el selector correcto |
| ViewTransition no se aplica | Navegador no soporta la API | El fallback `else { updateDOM() }` se ejecuta automáticamente |
