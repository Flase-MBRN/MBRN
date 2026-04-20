import { getPlanById, resolvePlanByAccessLevel } from '../plans/index.js';

export function resolveEntitlements({ planId = null, accessLevel = null } = {}) {
  const resolvedPlan = planId
    ? getPlanById(planId)
    : resolvePlanByAccessLevel(accessLevel ?? 0);

  return {
    planId: resolvedPlan.id,
    accessLevel: resolvedPlan.accessLevel,
    features: [...resolvedPlan.productIds],
    canPurchase: true
  };
}
