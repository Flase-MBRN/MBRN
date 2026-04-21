import { MBRN_CONFIG } from '../../../shared/core/config/index.js';

const ACCESS_LEVELS = Object.freeze({
  FREE: MBRN_CONFIG.accessLevels?.FREE ?? 0,
  CHRONOS: MBRN_CONFIG.accessLevels?.CHRONOS ?? 5,
  PRO: MBRN_CONFIG.accessLevels?.PRO ?? 10,
  BUSINESS: MBRN_CONFIG.accessLevels?.BUSINESS ?? 20
});

export const PLAN_CATALOG = Object.freeze([
  {
    id: 'free',
    label: 'Free',
    accessLevel: ACCESS_LEVELS.FREE,
    productIds: [],
    monthlyPrice: 0,
    availability: 'included'
  },
  {
    id: 'chronos',
    label: 'Chronos',
    accessLevel: ACCESS_LEVELS.CHRONOS,
    productIds: ['chronos'],
    monthlyPrice: 0,
    availability: 'internal'
  },
  {
    id: 'pro',
    label: 'Pro',
    accessLevel: ACCESS_LEVELS.PRO,
    productIds: ['chronos', 'artifact'],
    billingPeriod: 'one_time',
    availability: 'checkout_ready'
  },
  {
    id: 'business',
    label: 'Business',
    accessLevel: ACCESS_LEVELS.BUSINESS,
    productIds: ['chronos', 'artifact', 'business', 'oracle_snapshot', 'api_access'],
    billingPeriod: 'monthly',
    availability: 'checkout_ready'
  }
]);

export function getPlanCatalog() {
  return PLAN_CATALOG;
}

export function getPlanById(planId = 'free') {
  return PLAN_CATALOG.find((plan) => plan.id === planId) || PLAN_CATALOG[0];
}

export function getPlanAccessLevel(planId = 'free') {
  return getPlanById(planId).accessLevel;
}

export function resolvePlanByAccessLevel(accessLevel = 0) {
  return PLAN_CATALOG
    .slice()
    .reverse()
    .find((plan) => Number(accessLevel) >= Number(plan.accessLevel)) || PLAN_CATALOG[0];
}

export function resolvePlanIdentity({ planId = null, accessLevel = null } = {}) {
  if (planId) {
    return getPlanById(planId);
  }

  return resolvePlanByAccessLevel(accessLevel ?? 0);
}
