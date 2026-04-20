/**
 * /commerce/stripe/checkout.js
 * Stripe Checkout Implementation
 * LAW: No business logic, only technical provider implementation
 */

import { getStripeClient } from './client.js';

/**
 * Create a Stripe Checkout session and redirect
 * @param {Object} options
 * @param {string} options.priceId - Stripe Price ID
 * @param {string} options.successUrl - URL to redirect after successful payment
 * @param {string} options.cancelUrl - URL to redirect if user cancels
 * @param {string} [options.mode='payment'] - 'payment' or 'subscription'
 * @param {string} [options.customerEmail] - Pre-fill customer email
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  mode = 'payment',
  customerEmail = null
}) {
  const stripe = getStripeClient();
  
  if (!stripe) {
    return {
      success: false,
      error: 'Stripe not initialized. Call initStripe() first.'
    };
  }

  if (!priceId || !successUrl || !cancelUrl) {
    return {
      success: false,
      error: 'Missing required parameters: priceId, successUrl, cancelUrl'
    };
  }

  try {
    const sessionConfig = {
      lineItems: [{ price: priceId, quantity: 1 }],
      mode,
      successUrl,
      cancelUrl
    };

    if (customerEmail) {
      sessionConfig.customerEmail = customerEmail;
    }

    const { error } = await stripe.redirectToCheckout(sessionConfig);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Checkout failed'
    };
  }
}

/**
 * Create a checkout session for a subscription
 * @param {Object} options
 * @param {string} options.priceId - Stripe Subscription Price ID
 * @param {string} options.successUrl - Success redirect URL
 * @param {string} options.cancelUrl - Cancel redirect URL
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function createSubscriptionCheckout({ priceId, successUrl, cancelUrl }) {
  return createCheckoutSession({
    priceId,
    successUrl,
    cancelUrl,
    mode: 'subscription'
  });
}

/**
 * Create a checkout session for a one-time payment
 * @param {Object} options
 * @param {string} options.priceId - Stripe Price ID
 * @param {string} options.successUrl - Success redirect URL
 * @param {string} options.cancelUrl - Cancel redirect URL
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function createPaymentCheckout({ priceId, successUrl, cancelUrl }) {
  return createCheckoutSession({
    priceId,
    successUrl,
    cancelUrl,
    mode: 'payment'
  });
}

export default {
  createSession: createCheckoutSession,
  createSubscription: createSubscriptionCheckout,
  createPayment: createPaymentCheckout
};
