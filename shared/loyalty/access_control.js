import { state } from '../core/state/index.js';
import { resolveEntitlements } from '../../pillars/monetization/entitlements/index.js';
import { getPlanById, resolvePlanByAccessLevel } from '../../pillars/monetization/plans/index.js';

function getCurrentProfile() {
  return state.get('systemInitialized') || { access_level: 0, unlocked_tools: [], features: {} };
}

function resolveProfilePlan(profile = {}) {
  if (profile.plan_id) {
    return getPlanById(profile.plan_id);
  }

  return resolvePlanByAccessLevel(profile.access_level ?? 0);
}

function resolveProfileEntitlements(profile = {}) {
  const plan = resolveProfilePlan(profile);
  return resolveEntitlements({
    planId: plan.id,
    accessLevel: plan.accessLevel
  });
}

export function hasAccessTo(toolName) {
  const profile = getCurrentProfile();
  const entitlements = resolveProfileEntitlements(profile);

  if (profile.unlocked_tools && profile.unlocked_tools.includes(toolName)) {
    return true;
  }

  return entitlements.features.includes(toolName);
}

export function hasFeature(featureName) {
  const profile = getCurrentProfile();
  const entitlements = resolveProfileEntitlements(profile);

  if (profile.features && profile.features[featureName]) {
    return true;
  }

  return entitlements.features.includes(featureName);
}
