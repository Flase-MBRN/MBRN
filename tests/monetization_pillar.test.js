import { jest } from '@jest/globals';
import { getApiProductCatalog, getApiProductById } from '../pillars/monetization/api_products/index.js';
import { buildCheckoutSessionRequest, resolveBillingState } from '../pillars/monetization/billing/index.js';
import { resolveEntitlements } from '../pillars/monetization/entitlements/index.js';
import { getPlanCatalog, resolvePlanByAccessLevel } from '../pillars/monetization/plans/index.js';
import { getPricingByProductId } from '../pillars/monetization/pricing/index.js';

async function loadGateWithCommercialMode(commercialActive) {
  jest.resetModules();

  await jest.unstable_mockModule('../shared/core/config/index.js', () => ({
    IS_COMMERCIAL_MODE_ACTIVE: commercialActive,
    MBRN_CONFIG: {
      commercial: {
        isActive: commercialActive,
        soonBadgeLabel: 'Bald verfuegbar'
      }
    }
  }));

  return import('../pillars/monetization/gates/entitlement_gate.js');
}

describe('monetization pillar modules', () => {
  test('plan, pricing, entitlement and billing modules expose minimal business substance', () => {
    expect(getPlanCatalog().map((plan) => plan.id)).toEqual(['free', 'pro']);
    expect(resolvePlanByAccessLevel(10).id).toBe('pro');
    expect(getApiProductCatalog().map((product) => product.id)).toContain('artifact');
    expect(getApiProductById('artifact')).toEqual(expect.objectContaining({ provider: 'stripe' }));
    expect(getPricingByProductId('artifact')).toEqual(expect.objectContaining({
      provider: 'stripe',
      priceId: expect.any(String)
    }));
    expect(resolveEntitlements({ accessLevel: 10 })).toEqual(expect.objectContaining({
      planId: 'pro',
      features: expect.arrayContaining(['artifact'])
    }));
    expect(buildCheckoutSessionRequest('artifact')).toEqual(expect.objectContaining({
      productId: 'artifact',
      provider: 'stripe',
      priceId: expect.any(String)
    }));
    expect(resolveBillingState({ status: 'paid', product_id: 'artifact' })).toEqual({
      status: 'paid',
      isActive: true,
      productId: 'artifact'
    });
  });

  test('commercial gate stays UI-safe in inactive and active modes', async () => {
    const inactive = await loadGateWithCommercialMode(false);
    expect(inactive.resolveCommercialGate('artifact')).toEqual(expect.objectContaining({
      allowed: false,
      reason: 'commercial_mode_inactive'
    }));

    const active = await loadGateWithCommercialMode(true);
    expect(active.resolveCommercialGate('artifact')).toEqual(expect.objectContaining({
      allowed: true,
      reason: 'allowed'
    }));
    expect(active.resolveCommercialGate('artifact', { planId: 'free' })).toEqual(expect.objectContaining({
      allowed: false,
      reason: 'upgrade_required'
    }));
  });
});
