import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from '@jest/globals';

const repoRoot = process.cwd();
const JS_EXTENSIONS = new Set(['.js', '.mjs']);
const ALLOWED_NAV_IMPORTERS = new Set([
  'apps/chronos/render.js',
  'apps/finance/render.js',
  'apps/numerology/render.js',
  'dashboard/render_dashboard.js',
  'pillars/frontend_os/shell/render_landing.js',
  'pillars/frontend_os/shell/render_legal_page.js'
]);
const ALLOWED_AUTH_IMPORTERS = new Set([
  'apps/chronos/render.js',
  'apps/finance/render.js',
  'apps/numerology/render.js',
  'dashboard/render_dashboard.js',
  'pillars/frontend_os/shell/render_landing.js',
  'pillars/frontend_os/shell/render_legal_page.js'
]);
const ALLOWED_LEGAL_IMPORTERS = new Set([
  'apps/chronos/render.js',
  'apps/finance/render.js',
  'apps/numerology/render.js',
  'dashboard/render_dashboard.js',
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
    .filter((filePath) => fs.readFileSync(filePath, 'utf8').includes(pattern))
    .map((filePath) => path.relative(repoRoot, filePath).replace(/\\/g, '/'))
    .sort();
}

describe('frontend_os ownership', () => {
  test('surface composition imports only come from known runtime entrypoints', () => {
    expect(findImporters('renderNavigation')).toEqual([
      'apps/chronos/render.js',
      'apps/finance/render.js',
      'apps/numerology/render.js',
      'dashboard/render_dashboard.js',
      'pillars/frontend_os/navigation/index.js',
      'pillars/frontend_os/shell/render_landing.js',
      'pillars/frontend_os/shell/render_legal_page.js'
    ]);

    expect(findImporters('renderAuth')).toEqual([
      'apps/chronos/render.js',
      'apps/finance/render.js',
      'apps/numerology/render.js',
      'dashboard/render_dashboard.js',
      'pillars/frontend_os/shell/render_landing.js',
      'pillars/frontend_os/shell/render_legal_page.js',
      'pillars/frontend_os/ui_states/auth_controller.js'
    ]);

    expect(findImporters('injectLegalBlock')).toEqual([
      'apps/chronos/render.js',
      'apps/finance/render.js',
      'apps/numerology/render.js',
      'dashboard/render_dashboard.js',
      'pillars/frontend_os/shell/legal_blocks.js',
      'pillars/frontend_os/shell/render_landing.js'
    ]);
  });

  test('only approved runtime entrypoints import frontend_os composition helpers', () => {
    expect(findImporters("from '../../pillars/frontend_os/navigation/index.js'").every((file) => ALLOWED_NAV_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../pillars/frontend_os/navigation/index.js'").every((file) => ALLOWED_NAV_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../../pillars/frontend_os/ui_states/auth_controller.js'").every((file) => ALLOWED_AUTH_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../pillars/frontend_os/ui_states/auth_controller.js'").every((file) => ALLOWED_AUTH_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../../pillars/frontend_os/shell/legal_blocks.js'").every((file) => ALLOWED_LEGAL_IMPORTERS.has(file))).toBe(true);
    expect(findImporters("from '../pillars/frontend_os/shell/legal_blocks.js'").every((file) => ALLOWED_LEGAL_IMPORTERS.has(file))).toBe(true);
  });
});
