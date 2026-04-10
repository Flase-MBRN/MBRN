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
   * Toggelt eine CSS-Klasse für UI-Feedback.
   */
  toggleClass: (elementId, className, condition) => {
    const el = document.getElementById(elementId);
    if (el) el.classList.toggle(className, condition);
  }
};