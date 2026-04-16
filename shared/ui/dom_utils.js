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
  },

  /**
   * Show skeleton loading placeholder
   * LAW 2 COMPLIANT: Dynamic creation, XSS-safe
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
    
    switch (type) {
      case 'card':
        skeletonWrapper.innerHTML = `
          <div class="skeleton-card">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line-sm"></div>
            <div class="skeleton-line"></div>
          </div>
        `;
        break;
      case 'lines':
        skeletonWrapper.innerHTML = `
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line-lg"></div>
          <div class="skeleton-line skeleton-line-sm"></div>
          <div class="skeleton-line"></div>
        `;
        break;
      case 'circle':
        skeletonWrapper.innerHTML = `
          <div class="skeleton-circle"></div>
        `;
        break;
      case 'result-cards':
        skeletonWrapper.innerHTML = `
          <div class="skeleton-card">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line"></div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line"></div>
          </div>
        `;
        break;
      default:
        skeletonWrapper.innerHTML = `<div class="skeleton" style="height: 100px;"></div>`;
    }
    
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
  }
};

/**
 * PATCH 1 (Phase 5.0): Number Ticker Animation
 * Zählt eine Zahl von start bis end mit easeOutExpo-Easing
 * @param {HTMLElement} element - Das zu animierende Element
 * @param {number} start - Startwert
 * @param {number} end - Zielwert
 * @param {number} duration - Dauer in ms (default: 1500)
 * @param {string} suffix - Optionaler Suffix (z.B. "€", "%")
 * @param {function} formatter - Optional: Format-Funktion für die Zahl
 */
export function animateValue(element, start, end, duration = 1500, suffix = '', formatter = null) {
  // P1 SECURITY: Validate target value (end) for NaN or Infinity
  if (Number.isNaN(end) || !Number.isFinite(end)) {
    console.error(`[animateValue] SECURITY: Invalid target value detected: ${end}. Setting to 0 to prevent UI freeze.`);
    element.textContent = '0' + suffix;
    return () => {}; // Return no-op cleanup
  }

  // P1 SECURITY: Validate start value as well
  const safeStart = Number.isNaN(start) || !Number.isFinite(start) ? 0 : start;

  const startTime = performance.now();
  let rafId = null; // OMEGA FIX: Store rAF ID for cancellation

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);
    const currentValue = safeStart + (end - safeStart) * easedProgress;

    let displayValue = formatter ? formatter(currentValue) : Math.round(currentValue).toLocaleString('de-DE');
    element.textContent = displayValue + suffix;

    if (progress < 1) {
      rafId = requestAnimationFrame(update); // OMEGA FIX: Store ID
    }
  }

  rafId = requestAnimationFrame(update);

  // OMEGA FIX: Return cleanup function to cancel animation
  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

/**
 * PATCH 1 (Phase 5.0): Terminal Loader mit psychologischem Delay
 * Zeigt einen Cyber-Terminal-Loader für eine feste Dauer
 * Respektiert prefers-reduced-motion für Accessibility (Law 2 Compliance)
 * @param {string} containerId - Container für den Loader
 * @param {number} duration - Dauer in ms (default: 1500)
 * @returns {Promise} - Löst sich auf, wenn Loader fertig
 */
export function showTerminalLoader(containerId, duration = 1500) {
  const container = document.getElementById(containerId);
  if (!container) return Promise.resolve();
  
  // LAW 8 COMPLIANT: Respect user motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipLoader = localStorage.getItem('mbrn_skip_loader') === 'true';
  
  if (prefersReducedMotion || skipLoader) {
    // Instant resolve for accessibility or power users
    return Promise.resolve();
  }
  
  const messages = [
    'Syncing MBRN Core...',
    'Decrypting Blueprint...',
    'Calculating Resonance...',
    'Aligning Frequencies...',
    'Rendering Artifact...'
  ];
  
  // LAW 9 COMPLIANT: Build DOM without innerHTML
  const loader = document.createElement('div');
  loader.className = 'terminal-loader';
  
  const line = document.createElement('div');
  line.className = 'terminal-line';
  
  const prompt = document.createElement('span');
  prompt.className = 'terminal-prompt';
  prompt.textContent = '➜';
  
  const text = document.createElement('span');
  text.className = 'terminal-text';
  text.textContent = messages[Math.floor(Math.random() * messages.length)];
  
  const cursor = document.createElement('span');
  cursor.className = 'terminal-cursor';
  cursor.textContent = '_';
  
  // UX Enhancement: Click to skip
  const skipHint = document.createElement('span');
  skipHint.className = 'terminal-skip-hint';
  skipHint.textContent = '(Klick zum Überspringen)';
  skipHint.style.cssText = 'margin-left: 12px; font-size: 11px; color: var(--text-muted); cursor: pointer;';
  
  line.appendChild(prompt);
  line.appendChild(text);
  line.appendChild(cursor);
  line.appendChild(skipHint);
  loader.appendChild(line);
  
  container.appendChild(loader);
  
  return new Promise(resolve => {
    let resolved = false;
    
    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        loader.remove();
        resolve();
      }
    };
    
    // Auto-resolve after duration
    const timer = setTimeout(cleanup, duration);
    
    // Click to skip for power users
    loader.addEventListener('click', () => {
      clearTimeout(timer);
      cleanup();
    });
  });
}

/**
 * PATCH 1 (Phase 5.0): SVG Glow Ring Generator
 * Erzeugt einen SVG-Ring für Score-Visualisierung
 * @param {number} score - Wert 0-100
 * @param {number} size - Größe in px (default: 200)
 * @param {string} color - Akzent-Farbe (default: var(--accent))
 * @returns {SVGSVGElement} - Das generierte SVG
 */
export function createGlowRing(score, size = 200, color = null) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'glow-ring-svg');
  svg.style.width = size + 'px';
  svg.style.height = size + 'px';
  
  // Definitions for glow filter (LAW 2/3 COMPLIANT: No innerHTML)
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'glow');
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');
  
  const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  feGaussianBlur.setAttribute('stdDeviation', '4');
  feGaussianBlur.setAttribute('result', 'coloredBlur');
  filter.appendChild(feGaussianBlur);
  
  const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
  const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  feMergeNode1.setAttribute('in', 'coloredBlur');
  const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  feMergeNode2.setAttribute('in', 'SourceGraphic');
  feMerge.appendChild(feMergeNode1);
  feMerge.appendChild(feMergeNode2);
  filter.appendChild(feMerge);
  
  defs.appendChild(filter);
  svg.appendChild(defs);
  
  // Background circle
  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bgCircle.setAttribute('cx', size / 2);
  bgCircle.setAttribute('cy', size / 2);
  bgCircle.setAttribute('r', radius);
  bgCircle.setAttribute('fill', 'none');
  bgCircle.setAttribute('stroke', 'var(--border)');
  bgCircle.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(bgCircle);
  
  // Progress circle with glow
  const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  progressCircle.setAttribute('cx', size / 2);
  progressCircle.setAttribute('cy', size / 2);
  progressCircle.setAttribute('r', radius);
  progressCircle.setAttribute('fill', 'none');
  progressCircle.setAttribute('stroke', color || 'var(--accent)');
  progressCircle.setAttribute('stroke-width', strokeWidth);
  progressCircle.setAttribute('stroke-linecap', 'round');
  progressCircle.setAttribute('stroke-dasharray', circumference);
  progressCircle.setAttribute('stroke-dashoffset', offset);
  progressCircle.setAttribute('transform', `rotate(-90 ${size/2} ${size/2})`);
  progressCircle.setAttribute('filter', 'url(#glow)');
  progressCircle.style.transition = 'stroke-dashoffset 1.5s ease-out';
  svg.appendChild(progressCircle);
  
  return svg;
}