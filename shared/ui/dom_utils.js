// /shared/ui/dom_utils.js

export const dom = {
  /**
   * 100% XSS-Safe. Ersetzt innerHTML für reine Text-Updates.
   */
  setText: (elementId, text) => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
  },

  /**
   * Klont ein <template> Tag sicher in den Ziel-Container.
   */
  renderTemplate: (templateId, targetId, dataMapperCallback) => {
    const template = document.getElementById(templateId);
    const target = document.getElementById(targetId);
    if (!template || !target) return;

    const clone = template.content.cloneNode(true);
    if (dataMapperCallback) dataMapperCallback(clone);
    target.appendChild(clone);
  },

  /**
   * Leert einen Container extrem performant und sauber.
   */
  clear: (elementId) => {
    const el = document.getElementById(elementId);
    if (el) el.replaceChildren();
  },

  /**
   * XSS-Safe Element Creation
   * Erstellt ein Element mit textContent (escaped) statt innerHTML
   * 
   * @param {string} tag - HTML Tag name
   * @param {Object} options - { text, className, id, style, parent, attrs }
   * @returns {HTMLElement} - Created element
   */
  createEl: (tag, options = {}) => {
    const el = document.createElement(tag);
    
    if (options.text !== undefined) {
      el.textContent = options.text;  // XSS-safe: auto-escapes HTML
    }
    if (options.className) {
      el.className = options.className;
    }
    if (options.id) {
      el.id = options.id;
    }
    if (options.style) {
      Object.assign(el.style, options.style);
    }
    if (options.attrs) {
      Object.entries(options.attrs).forEach(([key, val]) => {
        el.setAttribute(key, val);
      });
    }
    if (options.parent) {
      options.parent.appendChild(el);
    }
    
    return el;
  },

  /**
   * Toggelt eine CSS-Klasse für UI-Feedback.
   */
  toggleClass: (elementId, className, condition) => {
    const el = document.getElementById(elementId);
    if (el) el.classList.toggle(className, condition);
  }
};