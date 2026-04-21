export const PRICING_TABLE = Object.freeze([
  {
    productId: 'artifact',
    provider: 'stripe',
    amount: 19,
    currency: 'eur',
    billingPeriod: 'one_time'
  },
  {
    productId: 'business',
    provider: 'stripe',
    amount: 49,
    currency: 'eur',
    billingPeriod: 'monthly'
  }
]);

export function getPricingTable() {
  return PRICING_TABLE;
}

export function getPricingByProductId(productId) {
  return PRICING_TABLE.find((entry) => entry.productId === productId) || null;
}
