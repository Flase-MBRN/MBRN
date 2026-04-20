/**
 * /commerce/stripe/client.js
 * Stripe SDK Wrapper
 * LAW: No business logic, only technical provider implementation
 */

let stripeInstance = null;
let stripePromise = null;

/**
 * Initialize Stripe with publishable key
 * @param {string} publishableKey - Stripe publishable key
 * @returns {Object} Stripe instance
 */
export function initStripe(publishableKey) {
  if (!stripeInstance && typeof window !== 'undefined' && window.Stripe) {
    stripeInstance = window.Stripe(publishableKey);
  }
  return stripeInstance;
}

/**
 * Get existing Stripe instance
 * @returns {Object|null} Stripe instance or null if not initialized
 */
export function getStripeClient() {
  return stripeInstance;
}

/**
 * Check if Stripe is initialized
 * @returns {boolean}
 */
export function isStripeInitialized() {
  return stripeInstance !== null;
}

/**
 * Reset Stripe instance (for testing)
 */
export function resetStripeForTests() {
  stripeInstance = null;
  stripePromise = null;
}

/**
 * Load Stripe.js script dynamically
 * @returns {Promise<Object>} Stripe constructor
 */
export function loadStripeScript() {
  if (stripePromise) {
    return stripePromise;
  }

  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Stripe can only be loaded in browser'));
  }

  if (window.Stripe) {
    return Promise.resolve(window.Stripe);
  }

  stripePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => resolve(window.Stripe);
    script.onerror = () => reject(new Error('Failed to load Stripe.js'));
    document.head.appendChild(script);
  });

  return stripePromise;
}

export default {
  init: initStripe,
  get: getStripeClient,
  isInitialized: isStripeInitialized,
  reset: resetStripeForTests,
  loadScript: loadStripeScript
};
