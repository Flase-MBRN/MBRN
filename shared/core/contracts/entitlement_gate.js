export function createEntitlementGateResult({
  allowed,
  feature,
  reason,
  badge = null,
  meta = {}
}) {
  return {
    allowed: Boolean(allowed),
    feature,
    reason,
    badge,
    meta
  };
}

export function isEntitlementGateResult(value) {
  return Boolean(value) && typeof value === 'object' &&
    typeof value.allowed === 'boolean' &&
    typeof value.feature === 'string' &&
    typeof value.reason === 'string' &&
    'badge' in value &&
    'meta' in value;
}
