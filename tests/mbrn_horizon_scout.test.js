import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from '@jest/globals';

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('mbrn horizon scout alpha vault', () => {
  test('canonical state declares horizon scout and alpha vault', () => {
    const canonicalState = JSON.parse(read('000_CANONICAL_STATE.json'));

    expect(canonicalState.systems.mbrn_horizon_scout).toEqual(expect.objectContaining({
      state: 'experimental',
      maturity: 'implemented',
      location: 'scripts/pipelines/mbrn_horizon_scout.py',
    }));

    expect(canonicalState.systems.alpha_vault).toEqual(expect.objectContaining({
      state: 'experimental',
      maturity: 'implemented',
      location: 'shared/alphas/',
    }));

    expect(canonicalState.paths.alpha_vault_root).toBe('shared/alphas/');
  });

  test('scout search and prompt cover god-mode alpha criteria', () => {
    const source = read('scripts/pipelines/mbrn_horizon_scout.py');

    expect(source).toContain('vanilla-js-ui');
    expect(source).toContain('modern-dashboard-components');
    expect(source).toContain('passive-income-automation');
    expect(source).toContain('micro-saas-templates');
    expect(source).toContain('ai-agent-frameworks');
    expect(source).toContain('Frontend-Upgrade');
    expect(source).toContain('Core-Power');
    expect(source).toContain('Market-Gap');
    expect(source).toContain('recommended_evolution');
  });

  test('alpha vault writes approved category paths and snippets', () => {
    const source = read('scripts/pipelines/mbrn_horizon_scout.py');

    expect(source).toContain('ALPHA_VAULT_CATEGORIES = ("frontend", "core_logic", "passive_income")');
    expect(source).toContain('"alpha_vault_root": _PROJECT_ROOT / "shared" / "alphas"');
    expect(source).toContain('integration_guide.md');
    expect(source).toContain('ready_snippet.');
    expect(fs.existsSync(path.join(repoRoot, 'shared/alphas/frontend/.gitkeep'))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, 'shared/alphas/core_logic/.gitkeep'))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, 'shared/alphas/passive_income/.gitkeep'))).toBe(true);
  });

  test('high roi reporting uses exact required console format', () => {
    const source = read('scripts/pipelines/mbrn_horizon_scout.py');

    expect(source).toContain('*** SYNERGY ALPHA >95% FOUND: {tool_name} ***');
    expect(source).toContain('Log: {reason} | Integration: {duration}');
    expect(source).toContain('if roi_score > 95:');
    expect(source).toContain('if roi_score > 90:');
  });
});
