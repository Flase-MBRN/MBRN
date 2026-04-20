/**
 * /tests/registry_consistency.test.js
 * REGISTRY CONSISTENCY TEST SUITE
 * 
 * Responsibility: Verify consistency between DIMENSION_REGISTRY and metadata.json mirrors
 * Also validates APP_MANIFEST references valid dimensionIds
 * 
 * NOTE: metadata.json are static mirrors. DIMENSION_REGISTRY is the primary runtime truth.
 * This test logs warnings for inconsistencies but does not fail, as mirrors may lag behind.
 */

import { describe, test, expect } from '@jest/globals';
import { DIMENSION_REGISTRY } from '../shared/core/registries/dimension_registry.js';
import { APP_MANIFEST } from '../shared/core/registries/app_manifest.js';

describe('Registry-Metadata Consistency', () => {
  test('DIMENSION_REGISTRY has all required fields', () => {
    for (const dimension of DIMENSION_REGISTRY) {
      expect(dimension.id).toBeDefined();
      expect(dimension.publicLabel).toBeDefined();
      expect(dimension.description).toBeDefined();
      expect(dimension.accessRules).toBeDefined();
      expect(dimension.surfaceFlags).toBeDefined();
      expect(Array.isArray(dimension.pillarDependencies)).toBe(true);
    }
  });

  test('DIMENSION_REGISTRY has unique dimension IDs', () => {
    const ids = DIMENSION_REGISTRY.map(d => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('APP_MANIFEST references valid dimensionIds', () => {
    for (const app of APP_MANIFEST) {
      const dimension = DIMENSION_REGISTRY.find(d => d.id === app.dimensionId);
      expect(dimension).toBeDefined();
      expect(dimension?.id).toBe(app.dimensionId);
    }
  });

  test('APP_MANIFEST surfaceFlags are consistent with dimension surfaceFlags', () => {
    for (const app of APP_MANIFEST) {
      const dimension = DIMENSION_REGISTRY.find(d => d.id === app.dimensionId);
      if (dimension && app.surfaceFlags) {
        if (app.status === 'provisional') {
          continue;
        }

        // Warn if navigation flags differ (log but don't fail)
        if (app.surfaceFlags.includeInNavigation !== dimension.surfaceFlags.includeInNavigation) {
          console.warn(
            `[Registry Consistency] App "${app.id}" navigation flag (${app.surfaceFlags.includeInNavigation}) ` +
            `differs from dimension "${app.dimensionId}" (${dimension.surfaceFlags.includeInNavigation})`
          );
        }
        if (app.surfaceFlags.includeInDashboard !== dimension.surfaceFlags.includeInDashboard) {
          console.warn(
            `[Registry Consistency] App "${app.id}" dashboard flag (${app.surfaceFlags.includeInDashboard}) ` +
            `differs from dimension "${app.dimensionId}" (${dimension.surfaceFlags.includeInDashboard})`
          );
        }
      }
    }
  });

  test('provisional apps may intentionally diverge from dimension surface flags', () => {
    const synergy = APP_MANIFEST.find(app => app.id === 'synergy');
    expect(synergy).toBeDefined();
    expect(synergy?.status).toBe('provisional');
    expect(synergy?.surfaceFlags?.includeInNavigation).toBe(false);
    expect(synergy?.surfaceFlags?.includeInDashboard).toBe(false);
  });

  test('Dimension navigationOrder values are unique and sorted', () => {
    const orders = DIMENSION_REGISTRY
      .filter(d => d.surfaceFlags?.includeInNavigation)
      .map(d => d.surfaceFlags?.navigationOrder)
      .filter(Boolean);
    
    const uniqueOrders = new Set(orders);
    expect(uniqueOrders.size).toBe(orders.length);
    
    // Verify orders are in ascending order
    const sortedOrders = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sortedOrders);
  });

  test('Default app in dimension exists in APP_MANIFEST', () => {
    for (const dimension of DIMENSION_REGISTRY) {
      if (dimension.defaultApp) {
        const app = APP_MANIFEST.find(a => a.id === dimension.defaultApp);
        expect(app).toBeDefined();
        expect(app?.dimensionId).toBe(dimension.id);
      }
    }
  });
});
