/**
 * /shared/ui/primitives/button.js
 * Button Primitive Component
 * LAW: No business logic, pure UI primitive
 */

import { dom } from '../dom/index.js';

/**
 * Button variant definitions
 */
export const BUTTON_VARIANTS = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
  DANGER: 'danger'
});

/**
 * Button sizes
 */
export const BUTTON_SIZES = Object.freeze({
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
});

/**
 * Create a button element
 * @param {Object} options
 * @param {string} options.text - Button text
 * @param {string} [options.variant='primary'] - Button variant
 * @param {string} [options.size='md'] - Button size
 * @param {Function} [options.onClick] - Click handler
 * @param {boolean} [options.disabled=false] - Disabled state
 * @param {string} [options.type='button'] - Button type
 * @param {HTMLElement} [options.parent] - Parent element
 * @returns {HTMLButtonElement}
 */
export function createButton({
  text,
  variant = BUTTON_VARIANTS.PRIMARY,
  size = BUTTON_SIZES.MD,
  onClick = null,
  disabled = false,
  type = 'button',
  parent = null
} = {}) {
  const button = document.createElement('button');
  button.type = type;
  button.textContent = text;
  
  // Base classes
  const baseClasses = ['btn', `btn-${variant}`, `btn-${size}`];
  button.className = baseClasses.join(' ');
  
  // State
  if (disabled) {
    button.disabled = true;
    button.classList.add('btn-disabled');
  }
  
  // Event handler
  if (onClick && typeof onClick === 'function') {
    button.addEventListener('click', onClick);
  }
  
  // Append to parent
  if (parent) {
    parent.appendChild(button);
  }
  
  return button;
}

/**
 * Create a primary CTA button (pill style)
 * @param {Object} options
 * @returns {HTMLButtonElement}
 */
export function createPrimaryButton(options = {}) {
  return createButton({
    ...options,
    variant: BUTTON_VARIANTS.PRIMARY
  });
}

/**
 * Create a secondary button
 * @param {Object} options
 * @returns {HTMLButtonElement}
 */
export function createSecondaryButton(options = {}) {
  return createButton({
    ...options,
    variant: BUTTON_VARIANTS.SECONDARY
  });
}

/**
 * Create an icon button
 * @param {Object} options
 * @param {string} options.icon - Icon character or SVG
 * @returns {HTMLButtonElement}
 */
export function createIconButton({
  icon,
  ariaLabel,
  onClick,
  parent = null
} = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-icon';
  button.setAttribute('aria-label', ariaLabel || 'Icon button');
  button.innerHTML = icon;
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  if (parent) {
    parent.appendChild(button);
  }
  
  return button;
}

export default {
  create: createButton,
  createPrimary: createPrimaryButton,
  createSecondary: createSecondaryButton,
  createIcon: createIconButton,
  VARIANTS: BUTTON_VARIANTS,
  SIZES: BUTTON_SIZES
};
