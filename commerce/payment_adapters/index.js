/**
 * /commerce/payment_adapters/index.js
 * Payment Adapter Registry
 * Barrel export for all payment adapters
 */

// Import existing adapter (will be refactored to use new structure)
import { stripePaymentAdapter } from './stripe_payment_adapter.js';

/**
 * Payment adapter registry
 */
export const PAYMENT_ADAPTERS = Object.freeze({
  stripe: stripePaymentAdapter
  // Future adapters:
  // paypal: paypalAdapter,
  // paddle: paddleAdapter
});

/**
 * Get payment adapter by name
 * @param {string} adapterName
 * @returns {Object|null}
 */
export function getPaymentAdapter(adapterName) {
  return PAYMENT_ADAPTERS[adapterName] || null;
}

/**
 * Get default payment adapter
 * @returns {Object}
 */
export function getDefaultAdapter() {
  return PAYMENT_ADAPTERS.stripe;
}

export default {
  ADAPTERS: PAYMENT_ADAPTERS,
  get: getPaymentAdapter,
  getDefault: getDefaultAdapter
};
