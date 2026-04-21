import { MBRN_CONFIG } from '../../../shared/core/config/index.js';

const ACCESS_LEVELS = Object.freeze({
  FREE: MBRN_CONFIG.accessLevels?.FREE ?? 0,
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
    id: 'pro',
    label: 'Pro',
    accessLevel: ACCESS_LEVELS.PRO,
    productIds: ['artifact'],
    monthlyPrice: 19,
    availability: 'checkout_ready'
  },
  {
    id: 'business',
    label: 'Business',
    accessLevel: ACCESS_LEVELS.BUSINESS,
    productIds: ['oracle_snapshot', 'api_access'],
    monthlyPrice: null,
    availability: 'catalog_only'
  }
]);

export function getPlanCatalog() {
  return PLAN_CATALOG;
}

export function getPlanById(planId = 'free') {
  return PLAN_CATALOG.find((plan) => plan.id === planId) || PLAN_CATALOG[0];
}

export function resolvePlanByAccessLevel(accessLevel = 0) {
  return PLAN_CATALOG
    .slice()
    .reverse()
    .find((plan) => Number(accessLevel) >= Number(plan.accessLevel)) || PLAN_CATALOG[0];
}
