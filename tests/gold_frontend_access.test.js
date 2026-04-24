import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from '@jest/globals';

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('gold frontend access', () => {
  test('canonical state declares oracle_signal as the implemented week-3 gold surface', () => {
    const canonicalState = JSON.parse(read('000_CANONICAL_STATE.json'));

    expect(canonicalState.topic_areas.oracle_signal).toEqual(expect.objectContaining({
      state: 'active',
      maturity: 'implemented',
      dimension: 'geld'
    }));
    expect(canonicalState.systems.gold_oracle_signal_surface).toEqual(expect.objectContaining({
      state: 'experimental',
      maturity: 'implemented',
      location: 'dimensions/geld/oracle_signal/index.html'
    }));
    expect(canonicalState.execution_tracks.autonomy_machine.phases.week_3_secure_frontend).toEqual(expect.objectContaining({
      state: 'active',
      maturity: 'implemented'
    }));
  });

  test('migration exposes only the authenticated gold dashboard view', () => {
    const migration = read('supabase/migrations/18_gold_frontend_access.sql');

    expect(migration).toContain('create or replace view public.gold_dashboard_items');
    expect(migration).toContain('grant select on public.gold_dashboard_items to authenticated');
    expect(migration).toContain('revoke all on public.gold_dashboard_items from anon');
    expect(migration).toContain('revoke all on public.raw_ingest_items from anon, authenticated');
    expect(migration).not.toContain('grant select on public.raw_ingest_items');
  });

  test('oracle_signal is a routed topic-area surface under geld', () => {
    const registry = read('shared/core/registries/topic_area_registry.js');
    const route = read('dimensions/geld/oracle_signal/index.html');
    const surface = read('pillars/frontend_os/dimension_views/oracle_signal_surface.js');

    expect(registry).toContain("id: 'oracle_signal'");
    expect(registry).toContain("route: 'dimensions/geld/oracle_signal/index.html'");
    expect(route).toContain('../../render_dimension.js');
    expect(surface).toContain('readGoldDashboardItems');
    expect(surface).toContain('Gold-Signale');
  });
});
