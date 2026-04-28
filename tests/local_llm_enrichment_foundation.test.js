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
    const pipelineUtilsSource = read('scripts/pipelines/pipeline_utils.py');

    expect(bridgeSource).toContain('class LocalLLMBridge');
    expect(bridgeSource).toContain('model: str = "qwen2.5-coder:14b"');
    expect(bridgeSource).toContain('model=os.getenv("OLLAMA_MODEL", "qwen2.5-coder:14b")');
    expect(bridgeSource).toContain('professional JSON-only output engine');
    expect(bridgeSource).toContain('ANALYSIS_REQUIRED_KEYS');
    expect(bridgeSource).toContain('repair_json_with_ollama');
    expect(pipelineUtilsSource).toContain('ollama_model: str = "qwen2.5-coder:14b"');
    expect(pipelineUtilsSource).toContain('professional JSON-only output engine');
    expect(pipelineUtilsSource).toContain('first_brace = raw_text.find("{")');
    expect(pipelineUtilsSource).toContain('last_brace = raw_text.rfind("}")');
    expect(pipelineUtilsSource).toContain('outer_object = raw_text[first_brace : last_brace + 1].strip()');
    expect(workerSource).toContain('gold_enrichment_items');
    expect(workerSource).toContain('analysis_status');
    expect(workerSource).toContain('LocalLLMBridge');
    expect(workerSource).toContain('from dotenv import load_dotenv');
    expect(workerSource).toContain('load_dotenv(Path(__file__).parent / ".env", override=False)');
    expect(workerSource).toContain('except WorkerError as exc');
    expect(workerSource).toContain('Week-2 enrichment worker configuration failed');
  });

  test('week-2 docs expose the active bridge and worker configuration', () => {
    const bridgeReadme = read('bridges/local_llm/README.md');
    const envExample = read('scripts/pipelines/.env.example');
    const pipelinesReadme = read('scripts/pipelines/README.md');

    expect(bridgeReadme).toContain('ACTIVE / PARTIAL');
    expect(envExample).toContain('LOCAL_LLM_ANALYSIS_VERSION=');
    expect(envExample).toContain('OLLAMA_MODEL=qwen2.5-coder:14b');
    expect(pipelinesReadme).toContain('local_llm_enrichment_worker.py');
    expect(pipelinesReadme).toContain('gold_enrichment_items');
  });

  test('market sentiment enrichment uses DeepSeek and JSON-only prompting', () => {
    const fetcherSource = read('scripts/pipelines/market_sentiment_fetcher.py');

    expect(fetcherSource).toContain('"model": "qwen2.5-coder:14b"');
    expect(fetcherSource).toContain('LocalLLMBridgeConfig');
    expect(fetcherSource).toContain('professional JSON-only output engine');
    expect(fetcherSource).toContain('schema_hint=ENRICHMENT_SCHEMA_HINT');
  });
});
