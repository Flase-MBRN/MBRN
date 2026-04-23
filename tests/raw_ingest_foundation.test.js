import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from '@jest/globals';

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('raw ingest foundation', () => {
  test('canonical state declares the week-1 raw ingest foundation as implemented', () => {
    const canonicalState = JSON.parse(read('000_CANONICAL_STATE.json'));

    expect(canonicalState.systems.raw_ingest_foundation).toEqual(expect.objectContaining({
      state: 'experimental',
      maturity: 'implemented',
      location: 'scripts/pipelines/raw_market_news_collector.py'
    }));

    expect(canonicalState.execution_tracks.autonomy_machine.phases.week_1_data_pipeline).toEqual(expect.objectContaining({
      state: 'active',
      maturity: 'implemented'
    }));
  });

  test('raw ingest migration creates the generic run and item tables', () => {
    const migration = read('supabase/migrations/16_raw_ingest_foundation.sql');

    expect(migration).toContain('create table if not exists public.raw_ingest_runs');
    expect(migration).toContain('create table if not exists public.raw_ingest_items');
    expect(migration).toContain('uq_raw_ingest_items_payload_hash');
    expect(migration).toContain('uq_raw_ingest_items_source_item');
  });

  test('raw ingest edge function validates and persists the generic batch contract', () => {
    const source = read('supabase/functions/raw-ingest/index.ts');

    expect(source).toContain('raw_ingest_runs');
    expect(source).toContain('raw_ingest_items');
    expect(source).toContain('verifyBearerToken');
    expect(source).toContain('received_count');
    expect(source).toContain('deduped_count');
  });

  test('pipeline env example and README expose the new collector path', () => {
    const envExample = read('scripts/pipelines/.env.example');
    const pipelinesReadme = read('scripts/pipelines/README.md');

    expect(envExample).toContain('RAW_INGEST_EDGE_URL=');
    expect(pipelinesReadme).toContain('raw_market_news_collector.py');
    expect(pipelinesReadme).toContain('raw_ingest_runs');
    expect(pipelinesReadme).toContain('raw_ingest_items');
  });
});
