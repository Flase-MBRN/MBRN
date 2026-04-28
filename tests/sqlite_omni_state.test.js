import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, test } from '@jest/globals';

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function runPython(code, env = {}) {
  return execFileSync('python', ['-c', code], {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    encoding: 'utf8'
  });
}

describe('v5 omni sqlite state foundation', () => {
  test('canonical state declares the omni track and concrete implemented systems', () => {
    const canonicalState = JSON.parse(read('000_CANONICAL_STATE.json'));

    expect(canonicalState.execution_tracks.omni_v5).toEqual(expect.objectContaining({
      state: 'active',
      maturity: 'partial',
      document: 'MBRN_V5_OMNI_ROADMAP.md'
    }));
    expect(canonicalState.systems.mbrn_sqlite_state_layer).toEqual(expect.objectContaining({
      maturity: 'implemented',
      location: 'shared/core/db.py',
      data_path: 'shared/data/mbrn_state.db'
    }));
    expect(canonicalState.systems.mbrn_bridge_agent).toEqual(expect.objectContaining({
      maturity: 'implemented',
      location: 'scripts/pipelines/mbrn_bridge_agent.py'
    }));
  });

  test('db schema initializes in a temp database and exposes required tables', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mbrn-state-'));
    const dbPath = path.join(tempDir, 'mbrn_state.db');
    const output = runPython(`
from shared.core.db import init_db, get_db
init_db()
with get_db() as conn:
    rows = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print(",".join(sorted(row["name"] for row in rows)))
`, { MBRN_STATE_DB_PATH: dbPath });

    for (const table of [
      'scout_alphas',
      'notifications',
      'factory_control',
      'factory_modules',
      'factory_memory',
      'seen_repos',
      'tool_requests',
      'evolution_entries'
    ]) {
      expect(output).toContain(table);
    }
  });

  test('parallel SQLite writes complete without database lock failures', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mbrn-race-'));
    const dbPath = path.join(tempDir, 'mbrn_state.db');
    const output = runPython(`
from concurrent.futures import ThreadPoolExecutor
from shared.core.db import init_db, insert_notification, get_db
init_db()
def write(i):
    insert_notification("race", f"notification {i}", dimension="systeme", module_name=f"m{i}")
with ThreadPoolExecutor(max_workers=8) as pool:
    list(pool.map(write, range(40)))
with get_db() as conn:
    count = conn.execute("SELECT COUNT(*) AS cnt FROM notifications").fetchone()["cnt"]
print(count)
`, { MBRN_STATE_DB_PATH: dbPath });

    expect(output.trim()).toBe('40');
  });

  test('scout, nexus, bridge and dashboard use the v5 state path', () => {
    const scout = read('scripts/pipelines/mbrn_horizon_scout.py');
    const nexus = read('scripts/pipelines/mbrn_nexus_bridge.py');
    const prime = read('scripts/pipelines/mbrn_prime_director.py');
    const bridge = read('scripts/pipelines/mbrn_bridge_agent.py');
    const feed = read('pillars/frontend_os/dashboard/factory_feed.js');

    expect(scout).toContain('DIMENSION_QUERIES');
    expect(scout).toContain('def get_priority_dimension()');
    expect(scout).toContain('upsert_scout_alpha(');
    expect(nexus).toContain('list_scout_alphas(statuses=("pending", "approved")');
    expect(nexus).toContain('upsert_factory_module(');
    expect(prime).toContain('def is_factory_paused()');
    expect(prime).toContain('save_db_factory_control');
    expect(bridge).toContain('OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5-coder:14b")');
    expect(bridge).toContain('OLLAMA_TIMEOUT_SECONDS = int(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "300"))');
    expect(bridge).toContain('MIN_HTML_CHARS = 500');
    expect(bridge).toContain('def run_bridge_batch(');
    expect(bridge).toContain('def run_bridge_until_empty(');
    expect(bridge).toContain('parser.add_argument("--batch-count"');
    expect(bridge).toContain('parser.add_argument("--all-ready"');
    expect(feed).toContain('factory_feed_snapshot.json');
    expect(feed).toContain('MBRN_FACTORY_CONTROL_URL');
  });

  test('bridge strips markdown fences and exposes a dependency-free env loader', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mbrn-env-'));
    const envPath = path.join(tempDir, '.env');
    fs.writeFileSync(envPath, 'MBRN_TEST_ENV_LOADER=ok\\n', 'utf8');

    const output = runPython(`
import importlib.util
import os
from pathlib import Path
spec = importlib.util.spec_from_file_location("bridge", Path("scripts/pipelines/mbrn_bridge_agent.py"))
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)
bridge.load_pipeline_env(Path(${JSON.stringify(envPath)}))
print(os.environ.get("MBRN_TEST_ENV_LOADER"))
print(bridge.strip_markdown_fences("""\`\`\`html
<!DOCTYPE html>
<html></html>
\`\`\`"""))
`);

    expect(output).toContain('ok');
    expect(output).toContain('<!DOCTYPE html>');
    expect(output).not.toContain('```');
  });
});
