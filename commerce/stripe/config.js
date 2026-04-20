/**
 * /commerce/stripe/config.js
 * Stripe Configuration
 * LAW: No business logic, only technical provider configuration
 */

/**
 * Stripe configuration object
 * In production, these should come from environment variables
 */
export const STRIPE_CONFIG = Object.freeze({
  // Publishable key for client-side Stripe.js
  publishableKey: null, // Set at runtime from MBRN_CONFIG or env
  
  // Secret key (server-side only - never expose to client!)
  secretKey: null, // Server-side only
  
  // Webhook signing secret
  webhookSecret: null,
  
  // API version
  apiVersion: '2023-10-16',
  
  // Redirect URLs
  successUrl: '/payment/success.html',
  cancelUrl: '/payment/cancel.html',
  
  // Feature flags
  features: {
    allowPromoCodes: true,
    collectTaxId: false,
    phoneNumberCollection: false
  }
});

/**
 * Initialize Stripe configuration
 * @param {Object} options
 * @param {string} options.publishableKey
 * @param {string} [options.secretKey] - Server-side only
 * @param {string} [options.webhookSecret]
 */
export function initStripeConfig(options = {}) {
  if (options.publishableKey) {
    STRIPE_CONFIG.publishableKey = options.publishableKey;
  }
  if (options.secretKey) {
    STRIPE_CONFIG.secretKey = options.secretKey;
  }
  if (options.webhookSecret) {
    STRIPE_CONFIG.webhookSecret = options.webhookSecret;
  }
}

/**
 * Check if Stripe is configured
 * @returns {boolean}
 */
export function isStripeConfigured() {
  return !!STRIPE_CONFIG.publishableKey;
}

/**
 * Get Stripe configuration
 * @returns {Object} Stripe config (without secret key for safety)
 */
export function getStripeConfig() {
  return {
    ...STRIPE_CONFIG,
    secretKey: null // Never expose secret key
  };
}

export default {
  CONFIG: STRIPE_CONFIG,
  init: initStripeConfig,
  isConfigured: isStripeConfigured,
  get: getStripeConfig
};
