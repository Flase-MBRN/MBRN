import { getApiProductById } from '../api_products/index.js';
import { getPricingByProductId } from '../pricing/index.js';

export function buildCheckoutSessionRequest(productId) {
  const product = getApiProductById(productId);
  const pricing = getPricingByProductId(productId);

  if (!product || !pricing) {
    return null;
  }

  return {
    productId: product.id,
    planId: product.grantsPlanId || null,
    provider: pricing.provider,
    amount: pricing.amount,
    currency: pricing.currency,
    billingPeriod: pricing.billingPeriod,
    mode: pricing.billingPeriod === 'one_time' ? 'payment' : 'subscription',
    availability: product.availability,
    checkoutReady: product.availability === 'checkout_ready'
  };
}

export function resolveBillingState(transaction = null) {
  if (!transaction) {
    return {
      status: 'unpaid',
      isActive: false
    };
  }

  const paidStatuses = ['succeeded', 'complete', 'paid', 'completed'];
  const status = String(transaction.status || '').toLowerCase();

  return {
    status: status || 'unknown',
    isActive: paidStatuses.includes(status),
    productId: transaction.product_id || null,
    planId: transaction.plan_id || null
  };
}
