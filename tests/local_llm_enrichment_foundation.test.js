import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from '@jest/globals';

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('local llm enrichment foundation', () => {
  test('canonical state declares the week-2 bridge and enrichment worker as active', () => {
    const canonicalState = JSON.parse(read('000_CANONICAL_STATE.json'));

    expect(canonicalState.bridges.local_llm).toEqual(expect.objectContaining({
      state: 'active',
      maturity: 'partial',
    }));

    expect(canonicalState.systems.local_llm_enrichment_worker).toEqual(expect.objectContaining({
      state: 'experimental',
      maturity: 'implemented',
      location: 'scripts/pipelines/local_llm_enrichment_worker.py',
    }));

    expect(canonicalState.execution_tracks.autonomy_machine.phases.week_2_local_enrichment).toEqual(expect.objectContaining({
      state: 'active',
      maturity: 'implemented',
    }));
  });

  test('week-2 migration adds raw analysis tracking and a separate gold table', () => {
    const migration = read('supabase/migrations/17_local_enrichment_foundation.sql');

    expect(migration).toContain('alter table public.raw_ingest_items');
    expect(migration).toContain('analysis_status');
    expect(migration).toContain('create table if not exists public.gold_enrichment_items');
    expect(migration).toContain('uq_gold_enrichment_items_raw_item_version');
  });

  test('local llm bridge and worker formalize the structured json enrichment path', () => {
    const bridgeSource = read('bridges/local_llm/bridge.py');
    const workerSource = read('scripts/pipelines/local_llm_enrichment_worker.py');

    expect(bridgeSource).toContain('class LocalLLMBridge');
    expect(bridgeSource).toContain('ANALYSIS_REQUIRED_KEYS');
    expect(bridgeSource).toContain('repair_json_with_ollama');
    expect(workerSource).toContain('gold_enrichment_items');
    expect(workerSource).toContain('analysis_status');
    expect(workerSource).toContain('LocalLLMBridge');
  });

  test('week-2 docs expose the active bridge and worker configuration', () => {
    const bridgeReadme = read('bridges/local_llm/README.md');
    const envExample = read('scripts/pipelines/.env.example');
    const pipelinesReadme = read('scripts/pipelines/README.md');

    expect(bridgeReadme).toContain('ACTIVE / PARTIAL');
    expect(envExample).toContain('LOCAL_LLM_ANALYSIS_VERSION=');
    expect(envExample).toContain('OLLAMA_MODEL=');
    expect(pipelinesReadme).toContain('local_llm_enrichment_worker.py');
    expect(pipelinesReadme).toContain('gold_enrichment_items');
  });
});
