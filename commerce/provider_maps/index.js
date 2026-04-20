/**
 * /commerce/provider_maps/index.js
 * Provider Registry
 * Central registry for all payment providers
 * LAW: No business logic, only provider-technical registry
 */

import { resolveStripePrice, getStripeProducts, isStripeProduct } from './stripe_map.js';

/**
 * Provider registry
 * Each provider must expose: name, resolvePrice function, capabilities
 */
export const PROVIDER_REGISTRY = Object.freeze({
  stripe: {
    name: 'Stripe',
    resolvePrice: resolveStripePrice,
    isProduct: isStripeProduct,
    getProducts: getStripeProducts,
    capabilities: ['subscriptions', 'one_time', 'webhooks', 'invoicing'],
    currencies: ['eur', 'usd'],
    isDefault: true
  }
  // Future providers can be added here:
  // paypal: { ... }
  // paddle: { ... }
});

/**
 * Get provider configuration by name
 * @param {string} providerName - Provider identifier
 * @returns {Object|null} Provider configuration or null
 */
export function getProvider(providerName) {
  return PROVIDER_REGISTRY[providerName] || null;
}

/**
 * Get default provider
 * @returns {Object|null}
 */
export function getDefaultProvider() {
  return Object.values(PROVIDER_REGISTRY).find(p => p.isDefault) || null;
}

/**
 * List all available providers
 * @returns {Array<string>} Provider names
 */
export function listProviders() {
  return Object.keys(PROVIDER_REGISTRY);
}

/**
 * Check if provider exists
 * @param {string} providerName
 * @returns {boolean}
 */
export function hasProvider(providerName) {
  return providerName in PROVIDER_REGISTRY;
}

/**
 * Resolve price for a product across all providers
 * @param {string} productKey
 * @param {string} [providerName] - Optional: specific provider
 * @returns {Object|null} Price configuration
 */
export function resolvePrice(productKey, providerName = null) {
  if (providerName) {
    const provider = getProvider(providerName);
    return provider?.resolvePrice?.(productKey) || null;
  }
  
  // Try all providers
  for (const provider of Object.values(PROVIDER_REGISTRY)) {
    const price = provider.resolvePrice?.(productKey);
    if (price) return price;
  }
  
  return null;
}

export default {
  REGISTRY: PROVIDER_REGISTRY,
  get: getProvider,
  getDefault: getDefaultProvider,
  list: listProviders,
  has: hasProvider,
  resolvePrice
};
