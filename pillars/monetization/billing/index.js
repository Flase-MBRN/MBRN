import { getApiProductById } from '../api_products/index.js';
import { getPricingByProductId } from '../pricing/index.js';

export function buildCheckoutSessionRequest(productId) {
  const product = getApiProductById(productId);
  const pricing = getPricingByProductId(productId);

  if (!product || !pricing || !pricing.priceId) {
    return null;
  }

  return {
    productId: product.id,
    provider: pricing.provider,
    priceId: pricing.priceId,
    amount: pricing.amount,
    currency: pricing.currency,
    billingPeriod: pricing.billingPeriod
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
    productId: transaction.product_id || null
  };
}
