import { createEntitlementGateResult } from '../../../shared/core/contracts/entitlement_gate.js';
import { IS_COMMERCIAL_MODE_ACTIVE, MBRN_CONFIG } from '../../../shared/core/config/index.js';
import { getApiProductById } from '../api_products/index.js';
import { resolveEntitlements } from '../entitlements/index.js';

export function resolveCommercialGate(feature, context = {}) {
  const product = getApiProductById(feature);
  if (!product) {
    return createEntitlementGateResult({
      allowed: false,
      feature,
      reason: 'unknown_product',
      badge: MBRN_CONFIG.commercial.soonBadgeLabel
    });
  }

  const hasAccessContext = Boolean(context.planId) || context.accessLevel != null;
  if (!hasAccessContext) {
    return createEntitlementGateResult({
      allowed: false,
      feature,
      reason: 'missing_context',
      badge: null,
      meta: {
        planId: null,
        canPurchase: false,
        commercialModeActive: IS_COMMERCIAL_MODE_ACTIVE
      }
    });
  }

  const entitlements = resolveEntitlements({ ...context, productId: feature });
  const allowed = entitlements.features.includes(feature);
  const commercialModeActive = Boolean(IS_COMMERCIAL_MODE_ACTIVE);
  const reason = allowed
    ? 'allowed'
    : commercialModeActive
      ? 'upgrade_required'
      : 'internal_access_required';

  return createEntitlementGateResult({
    allowed,
    feature,
    reason,
    badge: allowed || !commercialModeActive ? null : MBRN_CONFIG.commercial.soonBadgeLabel,
    meta: {
      planId: entitlements.planId,
      canPurchase: commercialModeActive && entitlements.canPurchase,
      commercialModeActive
    }
  });
}
