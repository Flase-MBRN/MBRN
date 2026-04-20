/**
 * /commerce/stripe/index.js
 * Stripe Module - Barrel Export
 * LAW: No business logic, only technical provider implementation
 */

export {
  initStripe,
  getStripeClient,
  isStripeInitialized,
  resetStripeForTests,
  loadStripeScript
} from './client.js';

export {
  createCheckoutSession,
  createSubscriptionCheckout,
  createPaymentCheckout
} from './checkout.js';

export {
  verifyWebhookSignature,
  handleWebhookEvent,
  WEBHOOK_EVENTS
} from './webhooks.js';

export {
  STRIPE_CONFIG,
  initStripeConfig,
  isStripeConfigured,
  getStripeConfig
} from './config.js';

// Default export for convenience
export { default } from './client.js';
