import { jest } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePrice } from '../commerce/provider_maps/index.js';
import { getApiProductCatalog, getApiProductById } from '../pillars/monetization/api_products/index.js';
import { buildCheckoutSessionRequest, resolveBillingState } from '../pillars/monetization/billing/index.js';
import { resolveEntitlements } from '../pillars/monetization/entitlements/index.js';
import { resolveMonetizationFlow } from '../pillars/monetization/index.js';
import { getPlanCatalog, resolvePlanByAccessLevel } from '../pillars/monetization/plans/index.js';
import { getPricingByProductId } from '../pillars/monetization/pricing/index.js';

const REPO_ROOT = process.cwd();

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

async function loadMonetizationFlowWithCommercialMode(commercialActive) {
  jest.resetModules();

  await jest.unstable_mockModule('../shared/core/config/index.js', () => ({
    IS_COMMERCIAL_MODE_ACTIVE: commercialActive,
    MBRN_CONFIG: {
      commercial: {
        isActive: commercialActive,
        soonBadgeLabel: 'Bald verfuegbar'
      },
      stripe: {
        priceIdArtifact: 'price_REPLACE_WITH_YOUR_PRICE_ID'
      },
      accessLevels: {
        FREE: 0,
        PRO: 10,
        BUSINESS: 20
      }
    }
  }));

  const module = await import('../pillars/monetization/index.js');
  return module.resolveMonetizationFlow;
}

describe('monetization pillar modules', () => {
  test('plan, pricing, entitlement and billing modules expose minimal business substance', () => {
    expect(getPlanCatalog().map((plan) => plan.id)).toEqual(['free', 'pro', 'business']);
    expect(resolvePlanByAccessLevel(10).id).toBe('pro');
    expect(resolvePlanByAccessLevel(20).id).toBe('business');
    expect(getApiProductCatalog().map((product) => product.id)).toContain('artifact');
    expect(getApiProductCatalog().map((product) => product.id)).toContain('business');
    expect(getApiProductById('artifact')).toEqual(expect.objectContaining({ provider: 'stripe' }));
    expect(getApiProductById('business')).toEqual(expect.objectContaining({
      provider: 'stripe',
      grantsPlanId: 'business'
    }));
    expect(getPricingByProductId('artifact')).toEqual(expect.objectContaining({
      provider: 'stripe',
      amount: 19
    }));
    expect(getPricingByProductId('business')).toEqual(expect.objectContaining({
      provider: 'stripe',
      amount: 49,
      billingPeriod: 'monthly'
    }));
    expect(resolveEntitlements({ accessLevel: 10, productId: 'artifact' })).toEqual(expect.objectContaining({
      planId: 'pro',
      features: expect.arrayContaining(['artifact']),
      canPurchase: true
    }));
    expect(resolveEntitlements({ planId: 'business', productId: 'business' })).toEqual(expect.objectContaining({
      planId: 'business',
      features: expect.arrayContaining(['artifact', 'business', 'oracle_snapshot', 'api_access']),
      canPurchase: true
    }));
    expect(buildCheckoutSessionRequest('artifact')).toEqual(expect.objectContaining({
      productId: 'artifact',
      planId: 'pro',
      provider: 'stripe',
      mode: 'payment',
      availability: 'checkout_ready',
      checkoutReady: true
    }));
    expect(buildCheckoutSessionRequest('business')).toEqual(expect.objectContaining({
      productId: 'business',
      planId: 'business',
      provider: 'stripe',
      mode: 'subscription',
      availability: 'checkout_ready',
      checkoutReady: true
    }));
    expect(resolveBillingState({ status: 'paid', product_id: 'artifact' })).toEqual({
      status: 'paid',
      isActive: true,
      productId: 'artifact',
      planId: null
    });
    expect(getApiProductById('artifact')).toEqual(expect.objectContaining({
      availability: 'checkout_ready'
    }));
    expect(resolvePrice('artifact', 'stripe')).toEqual(expect.objectContaining({
      priceId: expect.any(String),
      mode: 'payment'
    }));
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
      reason: 'upgrade_required',
      meta: expect.objectContaining({ canPurchase: false })
    }));
    expect(active.resolveCommercialGate('business', { planId: 'free' })).toEqual(expect.objectContaining({
      allowed: false,
      reason: 'upgrade_required',
      meta: expect.objectContaining({ canPurchase: false })
    }));
    expect(active.resolveCommercialGate('oracle_snapshot', { planId: 'business' })).toEqual(expect.objectContaining({
      allowed: true,
      meta: expect.objectContaining({ canPurchase: false })
    }));
  });

  test('monetization flow resolves the full business chain consistently', async () => {
    const artifactFlow = resolveMonetizationFlow({
      productId: 'artifact',
      planId: 'pro',
      transaction: { status: 'paid', product_id: 'artifact' }
    });

    expect(artifactFlow).toEqual(expect.objectContaining({
      availability: 'checkout_ready',
      checkoutReady: true,
      policyState: 'active_subscription',
      plan: expect.objectContaining({ id: 'pro' }),
      pricing: expect.objectContaining({ productId: 'artifact' }),
      entitlements: expect.objectContaining({
        planId: 'pro',
        features: expect.arrayContaining(['artifact'])
      }),
      billing: expect.objectContaining({
        isActive: true,
        productId: 'artifact'
      }),
      gate: expect.objectContaining({ feature: 'artifact' })
    }));

    const resolveFlow = await loadMonetizationFlowWithCommercialMode(true);
    const catalogOnlyFlow = resolveFlow({
      productId: 'oracle_snapshot',
      planId: 'business'
    });

    expect(catalogOnlyFlow).toEqual(expect.objectContaining({
      availability: 'catalog_only',
      checkoutReady: false,
      policyState: 'catalog_only',
      plan: expect.objectContaining({ id: 'business' }),
      gate: expect.objectContaining({ allowed: true })
    }));

    const businessFlow = resolveFlow({
      productId: 'business',
      planId: 'business'
    });

    expect(businessFlow).toEqual(expect.objectContaining({
      availability: 'checkout_ready',
      checkoutReady: true,
      policyState: 'checkout_ready',
      plan: expect.objectContaining({ id: 'business' }),
      pricing: expect.objectContaining({ productId: 'business', billingPeriod: 'monthly' })
    }));
  });

  test('monetization flow exposes policy-grade states for checkout and unknown products', () => {
    const checkoutReadyFlow = resolveMonetizationFlow({
      productId: 'artifact',
      planId: 'pro'
    });
    expect(checkoutReadyFlow).toEqual(expect.objectContaining({
      availability: 'checkout_ready',
      checkoutReady: true,
      policyState: 'commercial_mode_inactive'
    }));
  });

  test('monetization flow exposes checkout-ready and unknown-product states when commercial mode is active', async () => {
    const resolveFlow = await loadMonetizationFlowWithCommercialMode(true);
    const checkoutReadyFlow = resolveFlow({
      productId: 'artifact',
      planId: 'pro'
    });
    expect(checkoutReadyFlow).toEqual(expect.objectContaining({
      availability: 'checkout_ready',
      checkoutReady: true,
      policyState: 'checkout_ready'
    }));

    const unknownFlow = resolveFlow({
      productId: 'missing-product',
      planId: 'free'
    });
    expect(unknownFlow).toEqual(expect.objectContaining({
      availability: 'unknown',
      checkoutReady: false,
      policyState: 'unknown_product',
      gate: expect.objectContaining({
        allowed: false,
        reason: expect.stringMatching(/unknown_product|commercial_mode_inactive/)
      })
    }));
  });

  test('provider map mirrors the active monetization catalog and no longer exposes legacy product keys', () => {
    expect(resolvePrice('artifact', 'stripe')).toEqual(expect.objectContaining({
      priceId: expect.any(String)
    }));
    expect(resolvePrice('business', 'stripe')).toEqual(expect.objectContaining({
      priceId: expect.any(String),
      billingPeriod: 'monthly'
    }));
    expect(resolvePrice('oracle_snapshot', 'stripe')).toBeNull();
    expect(resolvePrice('api_access', 'stripe')).toBeNull();
    expect(resolvePrice('premium_monthly', 'stripe')).toBeNull();
    expect(resolvePrice('oracle_credits_10', 'stripe')).toBeNull();
  });

  test('active monetization zones use synchronized README markers instead of NOT_IMPLEMENTED', () => {
    ['api_products', 'billing', 'entitlements', 'plans', 'pricing'].forEach((zoneId) => {
      const zoneDir = path.join(REPO_ROOT, 'pillars', 'monetization', zoneId);
      expect(fs.existsSync(path.join(zoneDir, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(zoneDir, 'NOT_IMPLEMENTED.md'))).toBe(false);
    });
  });

  test('repo-wide monetization truth removes legacy labels from active config and supabase paths', () => {
    const productiveFiles = [
      path.join(REPO_ROOT, 'shared', 'core', 'config', 'index.js'),
      path.join(REPO_ROOT, 'supabase', 'functions', 'stripe-webhook', 'index.ts'),
      path.join(REPO_ROOT, 'supabase', 'migrations', '00_full_system_init.sql'),
      path.join(REPO_ROOT, 'supabase', 'migrations', '11_payment_schema.sql')
    ];

    productiveFiles.forEach((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      expect(source).not.toMatch(/\bPAID_PRO\b|\bSpark\b|premium_monthly|oracle_credits_/);
    });
  });

  test('stripe checkout and webhook functions carry canonical product and plan metadata', () => {
    const checkoutSource = fs.readFileSync(
      path.join(REPO_ROOT, 'supabase', 'functions', 'stripe-checkout', 'index.ts'),
      'utf8'
    );
    const webhookSource = fs.readFileSync(
      path.join(REPO_ROOT, 'supabase', 'functions', 'stripe-webhook', 'index.ts'),
      'utf8'
    );

    expect(checkoutSource).toContain('product_id');
    expect(checkoutSource).toContain('plan_id');
    expect(checkoutSource).toContain('access_level');
    expect(webhookSource).toContain('plan_id');
    expect(webhookSource).toContain('product_id');
    expect(webhookSource).toContain('access_level');
  });
});
