/**
 * Detecta secciones con data-back="dark" y aplica/quita la clase .back-dark al body
 * usando IntersectionObserver para mejor rendimiento sin dependencias externas
 */
export function initThemeDetect() {
  const darkSections = document.querySelectorAll('[data-back="dark"]');
  if (!darkSections.length) return;

  const body = document.body;

  const checkDarkSections = () => {
    let isAnyDarkVisible = false;

    darkSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      // Consideramos "visible" si está dentro del viewport (con margen de 5%)
      const topVisible = rect.top < window.innerHeight * 0.95;
      const bottomVisible = rect.bottom > window.innerHeight * 0.95;

      if (topVisible && bottomVisible) {
        isAnyDarkVisible = true;
      }
    });

    if (isAnyDarkVisible) {
      body.classList.add('back-dark');
    } else {
      body.classList.remove('back-dark');
    }
  };

  // Check inicial
  checkDarkSections();

  // Usar scroll con throttling para mejor rendimiento
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkDarkSections();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
