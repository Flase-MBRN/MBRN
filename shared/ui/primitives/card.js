/**
 * /shared/ui/primitives/card.js
 * Card Primitive Component
 * LAW: No business logic, pure UI primitive
 */

/**
 * Card variants
 */
export const CARD_VARIANTS = Object.freeze({
  DEFAULT: 'default',
  GLASS: 'glass',
  ELEVATED: 'elevated',
  OUTLINE: 'outline'
});

/**
 * Create a card element
 * @param {Object} options
 * @param {string} [options.variant='default'] - Card variant
 * @param {string} [options.padding='lg'] - Padding size (sm, md, lg)
 * @param {HTMLElement} [options.children] - Child elements to append
 * @param {HTMLElement} [options.parent] - Parent element
 * @returns {HTMLElement} Card element
 */
export function createCard({
  variant = CARD_VARIANTS.DEFAULT,
  padding = 'lg',
  children = [],
  parent = null
} = {}) {
  const card = document.createElement('div');
  card.className = `card card-${variant} card-padding-${padding}`;
  
  // Append children
  if (Array.isArray(children)) {
    children.forEach(child => {
      if (child instanceof HTMLElement) {
        card.appendChild(child);
      }
    });
  } else if (children instanceof HTMLElement) {
    card.appendChild(children);
  }
  
  // Append to parent
  if (parent) {
    parent.appendChild(card);
  }
  
  return card;
}

/**
 * Create a card with header, body, and footer
 * @param {Object} options
 * @param {string} [options.title] - Card title
 * @param {string} [options.subtitle] - Card subtitle
 * @param {HTMLElement[]} [options.body] - Body content
 * @param {HTMLElement[]} [options.footer] - Footer content
 * @param {HTMLElement} [options.parent] - Parent element
 * @returns {Object} { card, header, body, footer }
 */
export function createCardLayout({
  title = '',
  subtitle = '',
  body = [],
  footer = [],
  variant = CARD_VARIANTS.DEFAULT,
  parent = null
} = {}) {
  const card = document.createElement('div');
  card.className = `card card-${variant}`;
  
  let headerEl = null;
  let bodyEl = null;
  let footerEl = null;
  
  // Header
  if (title || subtitle) {
    headerEl = document.createElement('div');
    headerEl.className = 'card-header';
    
    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'card-title';
      titleEl.textContent = title;
      headerEl.appendChild(titleEl);
    }
    
    if (subtitle) {
      const subtitleEl = document.createElement('p');
      subtitleEl.className = 'card-subtitle';
      subtitleEl.textContent = subtitle;
      headerEl.appendChild(subtitleEl);
    }
    
    card.appendChild(headerEl);
  }
  
  // Body
  if (body.length > 0) {
    bodyEl = document.createElement('div');
    bodyEl.className = 'card-body';
    
    body.forEach(child => {
      if (child instanceof HTMLElement) {
        bodyEl.appendChild(child);
      }
    });
    
    card.appendChild(bodyEl);
  }
  
  // Footer
  if (footer.length > 0) {
    footerEl = document.createElement('div');
    footerEl.className = 'card-footer';
    
    footer.forEach(child => {
      if (child instanceof HTMLElement) {
        footerEl.appendChild(child);
      }
    });
    
    card.appendChild(footerEl);
  }
  
  // Append to parent
  if (parent) {
    parent.appendChild(card);
  }
  
  return { card, header: headerEl, body: bodyEl, footer: footerEl };
}

/**
 * Create a glass morphism card
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function createGlassCard(options = {}) {
  return createCard({
    ...options,
    variant: CARD_VARIANTS.GLASS
  });
}

/**
 * Create a stat/card widget
 * @param {Object} options
 * @param {string} options.label - Stat label
 * @param {string} options.value - Stat value
 * @param {string} [options.trend] - Trend indicator (+5%, -2%, etc.)
 * @param {HTMLElement} [options.parent]
 * @returns {HTMLElement}
 */
export function createStatCard({
  label,
  value,
  trend = '',
  parent = null
} = {}) {
  const card = document.createElement('div');
  card.className = 'card card-stat';
  
  const labelEl = document.createElement('span');
  labelEl.className = 'stat-label';
  labelEl.textContent = label;
  
  const valueEl = document.createElement('span');
  valueEl.className = 'stat-value';
  valueEl.textContent = value;
  
  card.appendChild(labelEl);
  card.appendChild(valueEl);
  
  if (trend) {
    const trendEl = document.createElement('span');
    trendEl.className = `stat-trend ${trend.startsWith('+') ? 'trend-up' : 'trend-down'}`;
    trendEl.textContent = trend;
    card.appendChild(trendEl);
  }
  
  if (parent) {
    parent.appendChild(card);
  }
  
  return card;
}

export default {
  create: createCard,
  createLayout: createCardLayout,
  createGlass: createGlassCard,
  createStat: createStatCard,
  VARIANTS: CARD_VARIANTS
};
