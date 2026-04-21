/**
 * /commerce/provider_maps/stripe_map.js
 * Stripe Provider Mapping
 * Maps active MBRN product IDs to Stripe technical IDs
 * LAW: No business logic, only provider-technical mappings
 */

import { MBRN_CONFIG } from '../../shared/core/config/index.js';

/**
 * Stripe product to price ID mapping for the active MBRN catalog.
 * catalog_only products stay mirrored here without active checkout IDs.
 */
export const STRIPE_PRODUCT_MAP = Object.freeze({
  artifact: {
    priceId: MBRN_CONFIG.stripe.priceIdArtifact,
    mode: 'payment',
    billingPeriod: 'one_time'
  },
  oracle_snapshot: {
    priceId: null,
    mode: 'subscription',
    billingPeriod: 'monthly'
  },
  api_access: {
    priceId: null,
    mode: 'subscription',
    billingPeriod: 'monthly'
  }
});

/**
 * Resolve Stripe price configuration from product key
 * @param {string} productId - MBRN product id
 * @returns {Object|null} Stripe price configuration or null if not found
 */
export function resolveStripePrice(productId) {
  return STRIPE_PRODUCT_MAP[productId] || null;
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
 * @param {string} productId
 * @returns {boolean}
 */
export function isStripeProduct(productId) {
  return productId in STRIPE_PRODUCT_MAP;
}

/**
 * Get products by type (subscription or payment)
 * @param {string} type - 'subscription' or 'payment'
 * @returns {Array<Object>}
 */
export function getProductsByType(type) {
  return getStripeProducts().filter((product) => product.mode === type);
}

export default {
  PRODUCT_MAP: STRIPE_PRODUCT_MAP,
  resolvePrice: resolveStripePrice,
  getProducts: getStripeProducts,
  isProduct: isStripeProduct,
  getByType: getProductsByType
};
