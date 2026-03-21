/**
 * Spotlight.js
 * Utility for tracking mouse movement on elements and updating CSS variables.
 */

export class Spotlight {
  /**
   * Initializes the spotlight effect on all elements matching the selector.
   * @param {string} selector - CSS selector for target elements.
   */
  static init(selector = '.spotlight-card') {
    const cards = document.querySelectorAll(selector);

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
}
