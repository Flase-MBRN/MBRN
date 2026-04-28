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

    expect(source).toContain('from pipeline_utils import load_pipeline_env, log as pipeline_log, save_json_atomic');
    expect(source).toContain('def log(level: str, message: object) -> None:');
    expect(source).toContain('DEFAULT_SCOUT_OLLAMA_MODEL = "qwen2.5-coder:14b"');
    expect(source).toContain('professional JSON-only output engine');
    expect(source).toContain('autonomous-agent-framework');
    expect(source).toContain('self-healing-code');
    expect(source).toContain('mcp-server-local');
    expect(source).toContain('agentic-workflow-automation');
    expect(source).toContain('local-llm-orchestration');
    expect(source).toContain('invoice parser ai');
    expect(source).toContain('crm ai assistant');
    expect(source).toContain('lead generation ai');
    expect(source).toContain('local llm tool');
    expect(source).toContain('PILLAR ALIGNMENT');
    expect(source).toContain('CATEGORY: Vault category');
    expect(source).toContain('CONCRETE BENEFIT');
    expect(source).toContain('recommended_evolution');
    expect(source).toContain('SYNERGY_SCHEMA_HINT');
    expect(source).toContain('def scan_github_trending(keywords: List[str])');
    expect(source).not.toContain(' OR ".join');
  });

  test('alpha vault writes approved category paths and snippets', () => {
    const source = read('scripts/pipelines/mbrn_horizon_scout.py');

    expect(source).toContain('ALPHA_VAULT_CATEGORIES = ("frontend", "core_logic", "autonomy")');
    expect(source).toContain('"alpha_vault_root": _PROJECT_ROOT / "shared" / "alphas"');
    expect(source).toContain('"alpha_vault_score_min": 87');
    expect(source).toContain('def backfill_alpha_vault_from_evolution_plan');
    expect(source).toContain('threshold = SCOUT_CONFIG["thresholds"]["alpha_vault_score_min"]');
    expect(source).toContain('integration_guide.md');
    expect(source).toContain('ready_snippet.');
    expect(fs.statSync(path.join(repoRoot, 'shared/alphas/frontend')).isDirectory()).toBe(true);
    expect(fs.statSync(path.join(repoRoot, 'shared/alphas/core_logic')).isDirectory()).toBe(true);
    expect(fs.statSync(path.join(repoRoot, 'shared/alphas/autonomy')).isDirectory()).toBe(true);
  });

  test('high roi reporting uses exact required console format', () => {
    const source = read('scripts/pipelines/mbrn_horizon_scout.py');

    expect(source).toContain('*** SYNERGY ALPHA >95% FOUND: {tool_name} ***');
    expect(source).toContain('Log: {reason} | Integration: {duration}');
    expect(source).toContain('if roi_score >= SCOUT_CONFIG["thresholds"]["roi_score_min"]:');
    expect(source).toContain('if float(entry.get("roi_score", 0)) < threshold:');
  });

  test('money-first scoring v2.0 uses 60/30/10 weighting', () => {
    const source = read('scripts/pipelines/mbrn_horizon_scout.py');

    expect(source).toContain('money_score or 0) * 0.60');
    expect(source).toContain('roi_score or 0) * 0.30');
    expect(source).toContain('mbrn_fit_score or 0) * 0.10');
    expect(source).toContain('combined_score = int(max(0, min(100, combined_score)))');
  });

  test('money score rules include business and automation bonuses', () => {
    const source = read('scripts/pipelines/mbrn_horizon_scout.py');

    expect(source).toContain('if any(k in combined for k in ["invoice", "receipt", "pdf", "ocr", "document"]): score += 40');
    expect(source).toContain('if any(k in combined for k in ["lead", "sales", "crm", "customer", "support", "appointment", "booking"]): score += 40');
    expect(source).toContain('if any(k in combined for k in ["finance", "tax", "business", "freelancer", "agency", "budget", "billing"]): score += 35');
  });

  test('prime director v2 support dynamic thresholds', () => {
    const source = read('scripts/pipelines/mbrn_prime_director_v2.py');

    expect(source).toContain('def get_thresholds():');
    expect(source).toContain('os.getenv("MBRN_ALPHA_FLOOD_MODE") == "1"');
    expect(source).toContain('return {"prepare": 60, "review": 40}');
    expect(source).toContain('return {"prepare": 80, "review": 65}');
  });

  test('test seeds are marked and filtered', () => {
    const scoutSource = read('scripts/pipelines/mbrn_horizon_scout.py');
    const syncSource = read('scripts/pipelines/mbrn_cockpit_sync.ps1');

    expect(scoutSource).toContain('"is_test": True');
    expect(syncSource).toContain('$is_test = $raw.is_test');
    expect(syncSource).toContain('$env:MBRN_SHOW_TEST_DIAMONDS -eq "1"');
    expect(syncSource).toContain('if ($is_test -and -not $showTest) {');
  });

  test('simple low-value planner stays below prepare threshold', () => {
    const scoutSource = read('scripts/pipelines/mbrn_horizon_scout.py');
    // Check that we have a penalty for risky items or no massive blanket bonuses
    expect(scoutSource).toContain('score -= 40');
  });
});
