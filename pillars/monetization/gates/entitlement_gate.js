import { createEntitlementGateResult } from '../../../shared/core/contracts/entitlement_gate.js';
import { IS_COMMERCIAL_MODE_ACTIVE, MBRN_CONFIG } from '../../../shared/core/config/index.js';

export function resolveCommercialGate(feature) {
  if (!IS_COMMERCIAL_MODE_ACTIVE) {
    return createEntitlementGateResult({
      allowed: false,
      feature,
      reason: 'commercial_mode_inactive',
      badge: MBRN_CONFIG.commercial.soonBadgeLabel
    });
  }

  return createEntitlementGateResult({
    allowed: true,
    feature,
    reason: 'allowed',
    badge: null
  });
}
