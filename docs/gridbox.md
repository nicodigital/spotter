## 1. Custom CSS Grid System

### 1.1 Core Concept

GRIDBOX uses a **12-column CSS Grid** system built with native `grid-column` and registered as Tailwind `@utility` directives.

- **12 columns** produce **13 grid lines** (numbered 1 through 13)
- Grid lines define where content starts and ends
- The class pattern is `col-[start]-[end]` where start/end are grid line numbers

**File:** `css/layout/grid.css`

### 1.2 Row Container

A grid row is created with the `.row` class or the `<row>` custom HTML element:

```css
.row, row {
  display: grid;
  gap: 1rem;                              /* gap-1, increases to gap-2 at md: */
  grid-template-columns: repeat(12, 1fr);
  width: 100%;
}
```

**Rules:**
- Every `col-*` class **must** be a direct child of `.row` or `<row>`
- Without a `col-*` class, children span all 12 columns by default
- `<row>` is a valid custom HTML element used throughout the project (not a typo)

### 1.3 Column Classes

Pattern: `col-[start_line]-[end_line]`

Each class maps to `grid-column: [start] / [end]`:

| Class | Grid Lines | Columns Spanned | Width |
|-------|-----------|-----------------|-------|
| `col-1-13` | 1 to 13 | 12 | 100% |
| `col-1-7` | 1 to 7 | 6 | 50% |
| `col-7-13` | 7 to 13 | 6 | 50% |
| `col-1-5` | 1 to 5 | 4 | 33.3% |
| `col-5-9` | 5 to 9 | 4 | 33.3% |
| `col-9-13` | 9 to 13 | 4 | 33.3% |
| `col-1-4` | 1 to 4 | 3 | 25% |
| `col-3-11` | 3 to 11 | 8 | 66.6% |
| `col-2-12` | 2 to 12 | 10 | 83.3% |

All valid combinations from `col-1-2` through `col-12-13` are defined. The start must always be less than the end.

### 1.4 Responsive Grid

Column classes are **responsive** via Tailwind breakpoint prefixes. The primary layout breakpoint is `xg:` (992px).

**Mobile-first pattern:**
- Mobile: children stack full-width (no `col-*` class needed)
- Desktop: apply `xg:col-[start]-[end]` for multi-column layouts

```html
<row>
  <!-- Mobile: stacked. Desktop: 50/50 -->
  <div class="xg:col-1-7">Left column</div>
  <div class="xg:col-7-13">Right column</div>
</row>
```

**Multi-breakpoint example:**
```html
<row>
  <!-- Mobile: full. Tablet: 50%. Desktop: 33% -->
  <div class="md:col-1-7 xg:col-1-5">Column 1</div>
  <div class="md:col-7-13 xg:col-5-9">Column 2</div>
  <div class="md:col-1-7 xg:col-9-13">Column 3</div>
</row>
```

### 1.5 Container System

The `.container` class (or `<container>` element) provides responsive horizontal padding:

```css
.container, container {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding-left: var(--container-gap);
  padding-right: var(--container-gap);
}
```

`--container-gap` scales responsively:

| Breakpoint | Gap |
|-----------|-----|
| < 375px | 1rem |
| 375px (xs) | 1.5rem |
| 640px (sm) | 2rem |
| 768px (md) | 4rem |
| 992px (xg) | 5rem |
| 1024px (lg) | 12rem |
| 1280px (xl) | 12rem |
| 1440px (2xl) | 13rem |
| 1680px (3xl) | 15rem |
| 2560px (5xl) | 12rem |

**Container padding utilities** (defined in `css/layout/container-padding.css`):

| Utility | CSS |
|---------|-----|
| `ctr-p` | `padding: var(--container-gap)` |
| `ctr-px` | `padding-left` + `padding-right` |
| `ctr-py` | `padding-top` + `padding-bottom` |
| `ctr-pl` | `padding-left` |
| `ctr-pr` | `padding-right` |
| `ctr-pt` | `padding-top` |
| `ctr-pb` | `padding-bottom` |

### 1.6 Breakpoints Reference

Defined in `css/tailwind/theme.css`:

| Prefix | Width | Usage |
|--------|-------|-------|
| `xs:` | 375px | Small phones |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| **`xg:`** | **992px** | **Primary layout breakpoint** |
| `lg:` | 1024px | Small desktops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1440px | Large desktops |
| `3xl:` | 1680px | Wide screens |
| `4xl:` | 1920px | Full HD |
| `5xl:` | 2560px | Ultra-wide |

> **Important:** `xg:` (992px) is the custom breakpoint used as the primary desktop/mobile split in this project. It sits between `md:` (768px) and `lg:` (1024px).

### 1.7 Layout Patterns from the Codebase

**Header (4-column layout):**
```html
<header class="container">
  <div class="row">
    <div class="xg:col-1-3">Brand</div>
    <div class="xg:col-4-9">Navigation</div>
    <div class="xg:col-9-11">Search</div>
    <div class="xg:col-11-13">CTA</div>
  </div>
</header>
```

**Footer (mixed layouts):**
```html
<footer class="container">
  <row>
    <div class="xg:col-1-6">Heading</div>
    <div class="xg:col-7-9">Subtitle</div>
    <div class="xg:col-10-13">CTA</div>
  </row>
  <row>
    <div class="xg:col-1-5">Logo</div>
    <div class="col-1-5 xg:col-5-7">Label</div>
    <div class="col-5-13 xg:col-7-9">Content</div>
    <div class="col-1-5 xg:col-10-11">Label</div>
    <div class="col-5-13 xg:col-11-13">Content</div>
  </row>
</footer>
```

> Note: `col-*` without a breakpoint prefix applies at **all** screen sizes. Use this for mobile-specific column layouts that differ from the default full-width stacking.

### 1.8 Theme Variables

Defined in `css/tailwind/theme.css`:

```css
@theme {
  /* Colors */
  --color-blue-light: #0E1A49;
  --color-blue: #081134;
  --color-green: #3C7A3C;
  --color-green-dark: #2B4A2D;
  --color-green-light: #4f984f;
  --color-orange: #FF6701;
  --color-orange-dark: #D64F14;
  --color-orange-light: #F28F67;
  --color-ivory: #D9E1E9;

  /* Typography */
  --font-sans: "Montserrat", system-ui, sans-serif;
  --text-html: 10px;
  --text-h1: 2.5rem;
  --text-h2: 2.2rem;
  --text-h3: 1.8rem;
  --text-h4: 1.8rem;
  --text-h5: 1.6rem;
  --text-body: 1.6rem;
  --text-small: 1.4rem;
  --text-tiny: 1.2rem;

  /* Spacing */
  --spacing: 1rem;

  /* Shadows */
  --shadow-light: rgba(149, 157, 165, 0.1) 0px 8px 24px;
  --shadow-medium: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}
```
