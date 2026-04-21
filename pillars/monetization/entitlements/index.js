import { getApiProductById } from '../api_products/index.js';
import { getPlanById, resolvePlanByAccessLevel } from '../plans/index.js';
import { getPricingByProductId } from '../pricing/index.js';

function resolveCanPurchase(plan, productId = null) {
  if (!productId) {
    return plan.productIds.some((candidateId) => {
      const product = getApiProductById(candidateId);
      const pricing = getPricingByProductId(candidateId);
      return product?.availability === 'checkout_ready' && Boolean(pricing);
    });
  }

  if (!plan.productIds.includes(productId)) {
    return false;
  }

  const product = getApiProductById(productId);
  const pricing = getPricingByProductId(productId);
  return product?.availability === 'checkout_ready' && Boolean(pricing);
}

export function resolveEntitlements({ planId = null, accessLevel = null, productId = null } = {}) {
  const resolvedPlan = planId
    ? getPlanById(planId)
    : resolvePlanByAccessLevel(accessLevel ?? 0);

  return {
    planId: resolvedPlan.id,
    accessLevel: resolvedPlan.accessLevel,
    features: [...resolvedPlan.productIds],
    canPurchase: resolveCanPurchase(resolvedPlan, productId)
  };
}
