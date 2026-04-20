import { MBRN_CONFIG } from '../../../shared/core/config/index.js';

const ACCESS_LEVELS = MBRN_CONFIG.accessLevels || {
  FREE: 0,
  PAID_PRO: 10
};

export const PLAN_CATALOG = Object.freeze([
  {
    id: 'free',
    label: 'Free',
    accessLevel: ACCESS_LEVELS.FREE,
    productIds: [],
    monthlyPrice: 0
  },
  {
    id: 'pro',
    label: 'Pro',
    accessLevel: ACCESS_LEVELS.PAID_PRO,
    productIds: ['artifact', 'oracle_snapshot', 'api_access'],
    monthlyPrice: 19
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
