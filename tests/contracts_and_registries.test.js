import { APP_MANIFEST } from '../shared/core/registries/app_manifest.js';
import { DIMENSION_REGISTRY } from '../shared/core/registries/dimension_registry.js';
import { PILLAR_REGISTRY } from '../shared/core/registries/pillar_registry.js';
import {
  createBridgeFailure,
  createBridgeSuccess,
  isBridgeResult
} from '../shared/core/contracts/bridge_result.js';
import {
  createEntitlementGateResult,
  isEntitlementGateResult
} from '../shared/core/contracts/entitlement_gate.js';
import { validateOracleSnapshot } from '../shared/core/contracts/oracle_snapshot.js';

describe('registries and contracts', () => {
  test('pillarRegistry defines the four public pillars and service contracts', () => {
    expect(PILLAR_REGISTRY.map((pillar) => pillar.id)).toEqual([
      'meta_generator',
      'monetization',
      'oracle',
      'frontend_os'
    ]);
    PILLAR_REGISTRY.forEach((pillar) => {
      expect(pillar).toEqual(expect.objectContaining({
        id: expect.any(String),
        label: expect.any(String),
        status: expect.any(String),
        capabilities: expect.any(Array),
        serviceContracts: expect.any(Array)
      }));
    });
  });

  test('dimensionRegistry keeps stable ids decoupled from public labels', () => {
    expect(DIMENSION_REGISTRY.map((dimension) => dimension.id)).toEqual([
      'growth',
      'pattern',
      'time',
      'signal'
    ]);
    DIMENSION_REGISTRY.forEach((dimension) => {
      expect(dimension).toEqual(expect.objectContaining({
        id: expect.any(String),
        publicLabel: expect.any(String),
        description: expect.any(String),
        accessRules: expect.any(Object),
        pillarDependencies: expect.any(Array),
        surfaceFlags: expect.any(Object)
      }));
      expect(typeof dimension.defaultApp === 'string' || dimension.defaultApp === null).toBe(true);
    });
  });

  test('appManifest binds apps to dimensions and keeps synergy provisional', () => {
    expect(APP_MANIFEST.map((app) => app.id)).toEqual([
      'finance',
      'numerology',
      'chronos',
      'synergy'
    ]);
    expect(APP_MANIFEST.find((app) => app.id === 'synergy')).toEqual(expect.objectContaining({
      dimensionId: 'pattern',
      status: 'provisional'
    }));
  });

  test('bridgeResultContract enforces the minimum bridge shape', () => {
    const success = createBridgeSuccess('supabase.profile', { id: 'u1' }, { cached: false });
    const failure = createBridgeFailure('python.oracle.snapshot', 'offline', { retryable: true });

    expect(isBridgeResult(success)).toBe(true);
    expect(isBridgeResult(failure)).toBe(true);
    expect(success).toEqual({
      success: true,
      source: 'supabase.profile',
      data: { id: 'u1' },
      error: null,
      meta: { cached: false }
    });
  });

  test('entitlementGateContract returns UI-safe gate results', () => {
    const gate = createEntitlementGateResult({
      allowed: false,
      feature: 'artifact',
      reason: 'commercial_mode_inactive',
      badge: 'Bald verfügbar'
    });

    expect(isEntitlementGateResult(gate)).toBe(true);
    expect(gate).toEqual(expect.objectContaining({
      allowed: false,
      feature: 'artifact',
      reason: 'commercial_mode_inactive',
      badge: 'Bald verfügbar'
    }));
  });

  test('oracleSnapshotContract validates the stable dashboard snapshot shape', () => {
    const valid = validateOracleSnapshot({
      target_date: '21.04.2026',
      prediction: {
        alignment_score: 63.49,
        confidence: 0.63,
        trading_recommendation: 'Hold',
        reasoning: 'Balanced setup'
      },
      market_context: {},
      backtesting: {}
    });

    const invalid = validateOracleSnapshot({
      prediction: {},
      market_context: {},
      backtesting: {}
    });

    expect(valid).toEqual({ valid: true, error: null });
    expect(invalid.valid).toBe(false);
  });
});
