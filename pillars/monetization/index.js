import { getApiProductById } from './api_products/index.js';
import { resolveBillingState } from './billing/index.js';
import { resolveEntitlements } from './entitlements/index.js';
import { resolveCommercialGate } from './gates/entitlement_gate.js';
import { getPlanById, resolvePlanByAccessLevel } from './plans/index.js';
import { getPricingByProductId } from './pricing/index.js';

function resolvePolicyState({ product, pricing, gate, billing }) {
  if (!product) return 'unknown_product';
  if (billing.isActive) return 'active_subscription';
  if (gate.reason === 'missing_context') return 'access_context_required';
  if (gate.reason === 'internal_access_required') return 'commercial_mode_inactive';
  if (product.availability === 'catalog_only') return 'catalog_only';
  if (!gate.allowed && gate.reason === 'upgrade_required') return 'upgrade_required';
  if (!gate.meta?.commercialModeActive && gate.allowed) return 'allowed';
  if (product.availability === 'checkout_ready' && pricing) return 'checkout_ready';
  if (gate.allowed) return 'allowed';
  return 'blocked';
}

export function resolveMonetizationFlow({
  productId,
  planId = null,
  accessLevel = null,
  transaction = null
} = {}) {
  const product = getApiProductById(productId);
  const pricing = getPricingByProductId(productId);
  const plan = planId ? getPlanById(planId) : resolvePlanByAccessLevel(accessLevel ?? 0);
  const entitlements = resolveEntitlements({
    planId: plan.id,
    accessLevel: plan.accessLevel,
    productId
  });
  const billing = resolveBillingState(transaction);
  const gate = resolveCommercialGate(productId, {
    planId: plan.id,
    accessLevel: plan.accessLevel
  });
  const availability = product?.availability || 'unknown';
  const checkoutReady = availability === 'checkout_ready' && Boolean(pricing);
  const policyState = resolvePolicyState({ product, pricing, gate, billing });

  return {
    product,
    pricing,
    plan,
    entitlements,
    billing,
    gate,
    availability,
    checkoutReady,
    policyState
  };
}
