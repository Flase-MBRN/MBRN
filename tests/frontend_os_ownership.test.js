import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from '@jest/globals';
import { getDimensionViewIds, resolveDimensionView } from '../pillars/frontend_os/dimension_views/index.js';
import { getSurfaceCatalog } from '../pillars/frontend_os/surface_catalog.js';
import { resolveSurfaceTarget } from '../pillars/frontend_os/surface_router.js';
import { getFrontendProductJourney, getSurfaceJourney } from '../shared/application/frontend_os/discoverability_runtime.js';

const repoRoot = process.cwd();
const JS_EXTENSIONS = new Set(['.js', '.mjs']);
const ALLOWED_NAV_IMPORTERS = new Set([
  'pillars/frontend_os/dimension_views/dimension_surface.js',
  'pillars/frontend_os/ui_states/auth_controller.js',
  'pillars/frontend_os/app_surfaces/chronos_surface.js',
  'pillars/frontend_os/app_surfaces/dashboard_surface.js',
  'pillars/frontend_os/app_surfaces/finance_surface.js',
  'pillars/frontend_os/app_surfaces/numerology_surface.js',
  'pillars/frontend_os/app_surfaces/synergy_surface.js',
  'pillars/frontend_os/shell/flow_rail.js',
  'pillars/frontend_os/shell/render_landing.js',
  'pillars/frontend_os/shell/render_legal_page.js'
]);
const ALLOWED_AUTH_IMPORTERS = new Set([
  'pillars/frontend_os/dimension_views/dimension_surface.js',
  'pillars/frontend_os/app_surfaces/chronos_surface.js',
  'pillars/frontend_os/app_surfaces/dashboard_surface.js',
  'pillars/frontend_os/app_surfaces/finance_surface.js',
  'pillars/frontend_os/app_surfaces/numerology_surface.js',
  'pillars/frontend_os/app_surfaces/synergy_surface.js',
  'pillars/frontend_os/shell/render_landing.js',
  'pillars/frontend_os/shell/render_legal_page.js'
]);
const ALLOWED_LEGAL_IMPORTERS = new Set([
  'pillars/frontend_os/navigation/index.js',
  'pillars/frontend_os/dimension_views/dimension_surface.js',
  'pillars/frontend_os/app_surfaces/chronos_surface.js',
  'pillars/frontend_os/app_surfaces/dashboard_surface.js',
  'pillars/frontend_os/app_surfaces/finance_surface.js',
  'pillars/frontend_os/app_surfaces/numerology_surface.js',
  'pillars/frontend_os/app_surfaces/synergy_surface.js',
  'pillars/frontend_os/shell/render_landing.js'
]);

function collectFiles(rootDir) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'coverage' || entry.name === '.git') {
      continue;
    }

    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }

    if (JS_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function findImporters(pattern) {
  return collectFiles(repoRoot)
    .filter((filePath) => !filePath.includes(`${path.sep}tests${path.sep}`))
    .filter((filePath) => !filePath.endsWith(`${path.sep}pillars${path.sep}meta_generator${path.sep}modules${path.sep}index.js`))
    .filter((filePath) => fs.readFileSync(filePath, 'utf8').includes(pattern))
    .map((filePath) => path.relative(repoRoot, filePath).replace(/\\/g, '/'))
    .sort();
}

describe('frontend_os ownership', () => {
  test('surface composition imports only come from known runtime entrypoints', () => {
    expect(findImporters('renderNavigation')).toEqual([
      'pillars/frontend_os/app_surfaces/chronos_surface.js',
      'pillars/frontend_os/app_surfaces/dashboard_surface.js',
      'pillars/frontend_os/app_surfaces/finance_surface.js',
      'pillars/frontend_os/app_surfaces/numerology_surface.js',
      'pillars/frontend_os/app_surfaces/synergy_surface.js',
      'pillars/frontend_os/dimension_views/dimension_surface.js',
      'pillars/frontend_os/navigation/index.js',
      'pillars/frontend_os/shell/render_landing.js',
      'pillars/frontend_os/shell/render_legal_page.js'
    ]);

    expect(findImporters('renderAuth')).toEqual([
      'pillars/frontend_os/app_surfaces/chronos_surface.js',
      'pillars/frontend_os/app_surfaces/dashboard_surface.js',
      'pillars/frontend_os/app_surfaces/finance_surface.js',
      'pillars/frontend_os/app_surfaces/numerology_surface.js',
      'pillars/frontend_os/app_surfaces/synergy_surface.js',
      'pillars/frontend_os/dimension_views/dimension_surface.js',
      'pillars/frontend_os/shell/render_landing.js',
      'pillars/frontend_os/shell/render_legal_page.js',
      'pillars/frontend_os/ui_states/auth_controller.js'
    ]);

    expect(findImporters('injectLegalBlock')).toEqual([
      'pillars/frontend_os/app_surfaces/chronos_surface.js',
      'pillars/frontend_os/app_surfaces/dashboard_surface.js',
      'pillars/frontend_os/app_surfaces/finance_surface.js',
      'pillars/frontend_os/app_surfaces/numerology_surface.js',
      'pillars/frontend_os/app_surfaces/synergy_surface.js',
      'pillars/frontend_os/dimension_views/dimension_surface.js',
      'pillars/frontend_os/shell/legal_blocks.js',
      'pillars/frontend_os/shell/render_landing.js'
    ]);
  });

  test('only approved runtime entrypoints import frontend_os composition helpers', () => {
    expect(findImporters("from '../../pillars/frontend_os/navigation/index.js'").every((file) => ALLOWED_NAV_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../pillars/frontend_os/navigation/index.js'").every((file) => ALLOWED_NAV_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../navigation/index.js'").every((file) => ALLOWED_NAV_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../../pillars/frontend_os/ui_states/auth_controller.js'").every((file) => ALLOWED_AUTH_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../pillars/frontend_os/ui_states/auth_controller.js'").every((file) => ALLOWED_AUTH_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../ui_states/auth_controller.js'").every((file) => ALLOWED_AUTH_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../../pillars/frontend_os/shell/legal_blocks.js'").every((file) => ALLOWED_LEGAL_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../pillars/frontend_os/shell/legal_blocks.js'").every((file) => ALLOWED_LEGAL_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../shell/legal_blocks.js'").every((file) => ALLOWED_LEGAL_IMPORTERS.has(file))).toBe(true);
  });

  test('public route entrypoints are thin bootstraps, not composition owners', () => {
    [
      'apps/chronos/render.js',
      'apps/finance/render.js',
      'apps/numerology/render.js',
      'apps/synergy/render.js',
      'dashboard/render_dashboard.js',
      'dimensions/render_dimension.js'
    ].forEach((relativePath) => {
      const filePath = path.join(repoRoot, relativePath);
      const source = fs.readFileSync(filePath, 'utf8').trim();

      expect(source).not.toContain('renderNavigation');
      expect(source).not.toContain('renderAuth');
      expect(source).not.toContain('injectLegalBlock');
      expect(source).toMatch(/^export \{ .+ \} from /);
    });
  });

  test('frontend_os active capability zones have README markers and no NOT_IMPLEMENTED remnants', () => {
    [
      'pillars/frontend_os/app_surfaces',
      'pillars/frontend_os/dimension_views',
      'pillars/frontend_os/export_entrypoints'
    ].forEach((relativeDir) => {
      const absoluteDir = path.join(repoRoot, relativeDir);
      expect(fs.existsSync(path.join(absoluteDir, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(absoluteDir, 'NOT_IMPLEMENTED.md'))).toBe(false);
    });
  });

  test('dimension views resolve for every active dimension', () => {
    expect(getDimensionViewIds()).toEqual([
      'zeit',
      'geld',
      'physis',
      'geist',
      'ausdruck',
      'netzwerk',
      'energie',
      'systeme',
      'raum',
      'muster',
      'wachstum'
    ]);

    getDimensionViewIds().forEach((dimensionId) => {
      expect(typeof resolveDimensionView(dimensionId)).toBe('function');
    });
  });

  test('surface catalog and router expose the active frontend_os discoverability model', () => {
    const catalog = getSurfaceCatalog();

    expect(catalog.systemSurfaces.map((item) => item.id)).toEqual(['home', 'dashboard']);
    expect(catalog.dimensionViews.map((item) => item.id)).toEqual([
      'zeit',
      'geld',
      'physis',
      'geist',
      'ausdruck',
      'netzwerk',
      'energie',
      'systeme',
      'raum',
      'muster',
      'wachstum'
    ]);
    expect(catalog.exportEntrypoints.map((item) => item.id)).toEqual(['asset_export', 'pdf_export', 'share_export']);
    expect(catalog.journey).toEqual(expect.objectContaining({
      entrySurface: expect.objectContaining({ id: 'numerology', type: 'app' }),
      hubSurface: expect.objectContaining({ id: 'dashboard', type: 'system' }),
      dashboardNextSurface: expect.objectContaining({ id: 'zeit', type: 'dimension', route: 'dimensions/zeit/index.html' })
    }));

    expect(resolveSurfaceTarget('finance')).toEqual(expect.objectContaining({ id: 'finance', type: 'app' }));
    expect(resolveSurfaceTarget('geld')).toEqual(expect.objectContaining({ id: 'geld', type: 'dimension' }));
    expect(resolveSurfaceTarget('share_export')).toEqual(expect.objectContaining({ id: 'share_export', type: 'export' }));
  });

  test('frontend_os product journey keeps entry, hub and next surface explicit', () => {
    expect(getFrontendProductJourney()).toEqual(expect.objectContaining({
      entrySurface: expect.objectContaining({ id: 'numerology', route: 'apps/numerology/index.html' }),
      hubSurface: expect.objectContaining({ id: 'dashboard', route: 'dashboard/index.html' }),
      dashboardNextSurface: expect.objectContaining({ id: 'zeit', route: 'dimensions/zeit/index.html' })
    }));

    expect(getSurfaceJourney('home')).toEqual(expect.objectContaining({
      primaryTarget: expect.objectContaining({ id: 'numerology' }),
      secondaryTarget: expect.objectContaining({ id: 'dashboard' })
    }));
    expect(getSurfaceJourney('numerology')).toEqual(expect.objectContaining({
      primaryTarget: expect.objectContaining({ id: 'muster', route: 'dimensions/muster/index.html' }),
      secondaryTarget: expect.objectContaining({ id: 'dashboard' })
    }));
    expect(getSurfaceJourney('dashboard')).toEqual(expect.objectContaining({
      primaryTarget: expect.objectContaining({ id: 'zeit' }),
      secondaryTarget: expect.objectContaining({ id: 'numerology' })
    }));
    expect(getSurfaceJourney('geld')).toEqual(expect.objectContaining({
      primaryTarget: expect.objectContaining({ id: 'finance', route: 'apps/finance/index.html' }),
      secondaryTarget: expect.objectContaining({ id: 'dashboard' })
    }));
  });
});
