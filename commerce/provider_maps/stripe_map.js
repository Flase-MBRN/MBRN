/**
 * /commerce/provider_maps/stripe_map.js
 * Stripe Provider Mapping
 * Maps MBRN product concepts to Stripe technical IDs
 * LAW: No business logic, only provider-technical mappings
 */

/**
 * Stripe product to price ID mapping
 * These should match the Price IDs created in Stripe Dashboard
 */
export const STRIPE_PRODUCT_MAP = Object.freeze({
  // Subscription products
  'premium_monthly': {
    priceId: 'price_premium_monthly',
    mode: 'subscription',
    tier: 'premium',
    interval: 'month'
  },
  'premium_yearly': {
    priceId: 'price_premium_yearly',
    mode: 'subscription',
    tier: 'premium',
    interval: 'year'
  },
  
  // One-time purchases
  'oracle_credits_10': {
    priceId: 'price_credits_10',
    mode: 'payment',
    type: 'credits',
    amount: 10
  },
  'oracle_credits_50': {
    priceId: 'price_credits_50',
    mode: 'payment',
    type: 'credits',
    amount: 50
  },
  'oracle_credits_100': {
    priceId: 'price_credits_100',
    mode: 'payment',
    type: 'credits',
    amount: 100
  }
});

/**
 * Resolve Stripe price configuration from product key
 * @param {string} productKey - MBRN product key
 * @returns {Object|null} Stripe price configuration or null if not found
 */
export function resolveStripePrice(productKey) {
  return STRIPE_PRODUCT_MAP[productKey] || null;
}

/**
 * Get all available Stripe products
 * @returns {Array<Object>} Array of product configurations
 */
export function getStripeProducts() {
  return Object.entries(STRIPE_PRODUCT_MAP).map(([key, config]) => ({
    key,
    ...config
  }));
}

/**
 * Check if a product key exists in Stripe mapping
 * @param {string} productKey
 * @returns {boolean}
 */
export function isStripeProduct(productKey) {
  return productKey in STRIPE_PRODUCT_MAP;
}

/**
 * Get products by type (subscription or payment)
 * @param {string} type - 'subscription' or 'payment'
 * @returns {Array<Object>}
 */
export function getProductsByType(type) {
  return getStripeProducts().filter(p => p.mode === type);
}

export default {
  PRODUCT_MAP: STRIPE_PRODUCT_MAP,
  resolvePrice: resolveStripePrice,
  getProducts: getStripeProducts,
  isProduct: isStripeProduct,
  getByType: getProductsByType
};
