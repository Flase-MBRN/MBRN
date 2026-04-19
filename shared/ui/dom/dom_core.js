// /shared/ui/dom/dom_core.js

import { normalizeGermanText } from './text_normalizer.js';

export const dom = {
  /**
   * 100% XSS-Safe. Ersetzt innerHTML für reine Text-Updates.
   */
  setText: (elementId, text) => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = normalizeGermanText(text);
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
      el.textContent = normalizeGermanText(options.text);  // XSS-safe: auto-escapes HTML
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
        const normalizedValue =
          typeof val === 'string' &&
          ['placeholder', 'title', 'aria-label', 'aria-description', 'alt', 'value'].includes(key)
            ? normalizeGermanText(val)
            : val;
        el.setAttribute(key, normalizedValue);
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
  },

  _createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    
    const title = document.createElement('div');
    title.className = 'skeleton skeleton-title';
    card.appendChild(title);
    
    const line1 = document.createElement('div');
    line1.className = 'skeleton-line';
    card.appendChild(line1);
    
    const line2 = document.createElement('div');
    line2.className = 'skeleton-line skeleton-line-sm';
    card.appendChild(line2);
    
    const line3 = document.createElement('div');
    line3.className = 'skeleton-line';
    card.appendChild(line3);
    
    return card;
  },

  _createSkeletonLines() {
    const container = document.createElement('div');
    
    const classes = ['', 'skeleton-line-lg', 'skeleton-line-sm', ''];
    classes.forEach(cls => {
      const line = document.createElement('div');
      line.className = cls ? `skeleton-line ${cls}` : 'skeleton-line';
      container.appendChild(line);
    });
    
    return container;
  },

  _createSkeletonCircle() {
    const circle = document.createElement('div');
    circle.className = 'skeleton-circle';
    return circle;
  },

  _createSkeletonResultCards() {
    const container = document.createElement('div');
    
    for (let i = 0; i < 2; i++) {
      const card = document.createElement('div');
      card.className = 'skeleton-card';
      
      const title = document.createElement('div');
      title.className = 'skeleton-line skeleton-title';
      card.appendChild(title);
      
      const line = document.createElement('div');
      line.className = 'skeleton-line';
      card.appendChild(line);
      
      container.appendChild(card);
    }
    
    return container;
  },

  _createSkeletonDefault() {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton';
    skeleton.style.height = '100px';
    return skeleton;
  },

  /**
   * Show skeleton loading placeholder
   * LAW 2 COMPLIANT: Dynamic creation, XSS-safe
   * LAW 3 COMPLIANT: No innerHTML - uses document.createElement
   * LAW 5 COMPLIANT: Idempotent - no duplicate skeletons
   * 
   * @param {string} containerId - Container element ID
   * @param {string} type - 'card', 'lines', 'circle', 'custom'
   * @returns {Function} Cleanup function to remove skeleton
   */
  showSkeleton: (containerId, type = 'card') => {
    const container = document.getElementById(containerId);
    if (!container) return () => {};

    // LAW 5: Idempotency check - remove any existing skeletons first
    const existingSkeletons = container.querySelectorAll('[data-skeleton="true"]');
    existingSkeletons.forEach(el => el.remove());

    // Clear existing content only if no skeleton was present
    if (existingSkeletons.length === 0) {
      container.replaceChildren();
    }
    
    const skeletonWrapper = document.createElement('div');
    skeletonWrapper.className = 'skeleton-container';
    skeletonWrapper.dataset.skeleton = 'true';
    
    // LAW 3: Use helper methods that create elements safely
    let skeletonContent;
    switch (type) {
      case 'card':
        skeletonContent = dom._createSkeletonCard();
        break;
      case 'lines':
        skeletonContent = dom._createSkeletonLines();
        break;
      case 'circle':
        skeletonContent = dom._createSkeletonCircle();
        break;
      case 'result-cards':
        skeletonContent = dom._createSkeletonResultCards();
        break;
      default:
        skeletonContent = dom._createSkeletonDefault();
    }
    
    skeletonWrapper.appendChild(skeletonContent);
    container.appendChild(skeletonWrapper);
    
    // Return cleanup function
    return () => {
      if (skeletonWrapper.parentNode) {
        skeletonWrapper.remove();
      }
    };
  },

  /**
   * Remove all skeletons from a container
   * @param {string} containerId - Container element ID
   */
  removeSkeleton: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const skeletons = container.querySelectorAll('[data-skeleton="true"]');
    skeletons.forEach(el => el.remove());
  },

  /**
   * Initialize IntersectionObserver for scroll reveal animations.
   * LAW 2 & 9 COMPLIANT: Single source for all scroll animations.
   * 
   * @param {string} selector - CSS selector for elements to observe (default: '.reveal')
   * @param {number} threshold - Intersection threshold 0-1 (default: 0.1)
   * @param {string} visibleClass - Class to add when visible (default: 'visible')
   */
  initScrollReveal: (selector = '.reveal', threshold = 0.1, visibleClass = 'visible') => {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll(selector).forEach(el => el.classList.add(visibleClass));
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(visibleClass);
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold
    });
    
    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  },

  /**
   * Normalisiert statische DOM-Texte (HTML + Attribute), damit Umlaute global
   * konsistent dargestellt werden.
   */
  normalizeDocumentText: (root = document.body) => {
    if (
      typeof document === 'undefined' ||
      !root ||
      typeof document.createTreeWalker !== 'function' ||
      typeof NodeFilter === 'undefined'
    ) {
      return;
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node?.parentElement) return NodeFilter.FILTER_REJECT;
          const tagName = node.parentElement.tagName;
          if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      const normalized = normalizeGermanText(currentNode.nodeValue);
      if (normalized !== currentNode.nodeValue) {
        currentNode.nodeValue = normalized;
      }
      currentNode = walker.nextNode();
    }

    const attrKeys = ['placeholder', 'title', 'aria-label', 'aria-description', 'alt', 'value'];
    attrKeys.forEach((attr) => {
      root.querySelectorAll(`[${attr}]`).forEach((el) => {
        const rawValue = el.getAttribute(attr);
        const normalized = normalizeGermanText(rawValue);
        if (normalized !== rawValue) {
          el.setAttribute(attr, normalized);
        }
      });
    });
  }
};
