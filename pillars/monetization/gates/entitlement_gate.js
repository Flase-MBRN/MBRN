import { createEntitlementGateResult } from '../../../shared/core/contracts/entitlement_gate.js';
import { IS_COMMERCIAL_MODE_ACTIVE, MBRN_CONFIG } from '../../../shared/core/config/index.js';
import { getApiProductById } from '../api_products/index.js';
import { resolveEntitlements } from '../entitlements/index.js';

export function resolveCommercialGate(feature, context = {}) {
  if (!IS_COMMERCIAL_MODE_ACTIVE) {
    return createEntitlementGateResult({
      allowed: false,
      feature,
      reason: 'commercial_mode_inactive',
      badge: MBRN_CONFIG.commercial.soonBadgeLabel
    });
  }

  const product = getApiProductById(feature);
  if (!product) {
    return createEntitlementGateResult({
      allowed: false,
      feature,
      reason: 'unknown_product',
      badge: MBRN_CONFIG.commercial.soonBadgeLabel
    });
  }

  const entitlements = resolveEntitlements(context);
  const allowed = context.planId || context.accessLevel != null
    ? entitlements.features.includes(feature)
    : true;

  return createEntitlementGateResult({
    allowed,
    feature,
    reason: allowed ? 'allowed' : 'upgrade_required',
    badge: allowed ? null : MBRN_CONFIG.commercial.soonBadgeLabel
  });
}
