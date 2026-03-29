# AGENTS.md — Spotter

## Project Overview

Single-page marketing/landing website for Spotter (security/surveillance company), built with **Astro 6**, **Tailwind CSS v4**, **GSAP + ScrollTrigger**, **Lenis** (smooth scroll), and **Swiper** (carousels). Deployed to **Netlify**. UI language is **Spanish**.

- Node >= 22.12.0 required
- ESM throughout (`"type": "module"`)

## Build & Development Commands

```bash
npm run dev        # Start Astro dev server
npm run build      # Production build (outputs to dist/)
npm run preview    # Preview production build locally
```

### Lint / Format / Test

**No linter, formatter, or test runner is configured.** There are no ESLint, Prettier, Vitest, or similar dev dependencies. If adding tests in the future, use Vitest (Astro's recommended test runner).

## Directory Structure

```
src/
  pages/index.astro              # Single page entry point
  layouts/Layout.astro           # HTML shell (<head>, fonts, global styles)
  components/                    # Reusable Astro components (PascalCase)
    sections/                    # Page sections (Hero, Faq, CTA, etc.)
  js/                            # Vanilla JS modules
    modules/                     # gsap.js, lenis.js, getDevice.js, scrollMarkers.js
    functions.js                 # DOM helper functions
    menuMobile.js                # Mobile menu logic
  styles/
    global.css                   # Imports all CSS modules
    modules/                     # theme.css, typography.css, layout.css, menu.css,
                                  # gradients.css, tools.css, animations.css
  assets/                        # SVGs and images imported via Astro
public/
  fonts/                         # Self-hosted woff2 fonts (Sora, Public Sans)
  img/                           # Static images
  video/                         # Video assets
```

## Tech Stack Details

| Concern       | Tool                          |
|---------------|-------------------------------|
| Framework     | Astro 6 (static/hybrid)       |
| Styling       | Tailwind CSS v4 via Vite plugin |
| Animations    | GSAP + ScrollTrigger          |
| Smooth scroll | Lenis (synced with GSAP ticker) |
| Carousels     | Swiper                        |
| Hosting       | Netlify (`@astrojs/netlify`)  |
| TypeScript    | Config extends `astro/tsconfigs/strict` but **no .ts source files exist** — all JS |

## Code Style Guidelines

### Astro Components

- **Props**: Define a `Props` interface in the frontmatter block. Always include `class?: string` for composability.
- **Destructure with defaults**: `const { variant = "primary", size = "md", class: className = "" } = Astro.props;`
- **Alias `class`** to `className` to avoid the JS reserved word.
- **Dynamic tag rendering**: Use `const Tag = href ? "a" : "button"` pattern for polymorphic elements.
- **Scoped styles**: Use `<style>` blocks for component-specific CSS. Use `:global()` for body/data-attribute selectors.

```astro
---
interface Props {
  variant?: "primary" | "secondary";
  href?: string;
  class?: string;
}
const { variant = "primary", href, class: className = "" } = Astro.props;
---
```

### JavaScript

- **ES module syntax** only (`import`/`export`), never CommonJS.
- **Named exports** for public API functions: `export function initGSAP() { ... }`
- **Default exports** for single-function modules: `export default getDevice`
- **No TypeScript** in JS files despite tsconfig being present.
- **Early returns** for missing DOM elements: `if (!heroTitle) return;`
- **Data attributes** for configuration — use `data-*` attributes on HTML elements to configure JS behavior from markup (e.g., `data-speed`, `data-anim`, `data-mode`, `data-children`).
- **Parse data attributes** with fallbacks: `parseFloat(el.dataset.speed) || 0.5`
- **Comments** can be in Spanish or English; existing code mixes both.

### CSS / Tailwind

- **Tailwind v4** with `@import "tailwindcss"` at top of `global.css`.
- **`@theme` block** in `theme.css` defines custom design tokens (colors, fonts, sizes, breakpoints).
- **Custom breakpoint `xg`** (992px) is used extensively — not a standard Tailwind breakpoint.
- **CSS modules pattern**: Separate files in `styles/modules/` for each concern.
- **`@utility`** directive for custom utility classes.
- **`@apply`** used within style blocks for Tailwind composition.
- **Fluid typography**: Root font-size scales across breakpoints (7.5px–15px); all text sizes in `rem`.
- **CSS custom properties** for theming (`--color-primary`, `--font-sora`, etc.).
- **Experimental CSS**: `corner-shape: squircle`, `color-mix()` are used in production.
- **Class naming**: kebab-case for CSS classes (`big-title`, `hero-char`, `faq-container`).

### Naming Conventions

| Type               | Convention       | Example                          |
|--------------------|------------------|----------------------------------|
| Astro components   | PascalCase       | `FeatureCard.astro`, `Hero.astro` |
| Section components | PascalCase       | `ComoFunciona.astro`, `CTA.astro` |
| JS modules         | camelCase        | `getDevice.js`, `scrollMarkers.js` |
| CSS modules        | kebab-case       | `typography.css`, `animations.css` |
| CSS classes        | kebab-case       | `.hero-title`, `.tech-grid-bg`   |
| Data attributes    | kebab-case       | `data-scroll`, `data-speed-mobile` |
| Section names      | Spanish          | `Conocenos`, `ComoFunciona`, `Servicios` |

### Import Order

1. Astro layout / framework imports
2. Component imports (sections first, then shared components)
3. JS module imports
4. CSS/style imports

### Error Handling

- Use **early returns / null guards** for DOM queries: `if (!element) return;`
- No try/catch patterns exist in the codebase — keep it simple.
- GSAP animations degrade gracefully (elements just won't animate if selectors fail).

## GSAP Patterns

GSAP is the primary animation library. Follow these conventions:

- **Register plugins** at module top level: `gsap.registerPlugin(ScrollTrigger);`
- **Utility classes** drive animations from HTML: `.anim` for entrance animations, `.parallax` for parallax effects.
- **Config via data attributes** — never hardcode animation params in JS when they can vary per element.
- **Mobile handling**: Check `window.innerWidth < 768` and respect `data-mobile="false"` to disable animations on mobile.
- **`initGSAP()`** is the main entry point that calls all sub-initializers.

## Key Dependencies

- `gsap` — animations and scroll triggers
- `lenis` — smooth scrolling (integrated with GSAP ticker)
- `swiper` — carousel/slider functionality
- `@justinribeiro/lite-youtube` — lazy-loaded YouTube embeds
- `@netlify/blobs` — Netlify blob storage

## Things to Avoid

- Do NOT introduce TypeScript files — the project uses vanilla JS.
- Do NOT add ESLint/Prettier without discussing first — none is configured.
- Do NOT use CommonJS (`require`, `module.exports`) — use ESM only.
- Do NOT hardcode animation values in JS — use data attributes on HTML elements.
- Do NOT install new CSS frameworks — Tailwind v4 is the sole styling system.
