import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from '@jest/globals';

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('day zero autopilot', () => {
  test('canonical state declares week 4 as pure local automation', () => {
    const canonicalState = JSON.parse(read('000_CANONICAL_STATE.json'));

    expect(canonicalState.systems.day_zero_autopilot).toEqual(expect.objectContaining({
      state: 'experimental',
      maturity: 'implemented',
      location: 'scripts/pipelines/day_zero_autopilot.ps1',
      owner_domain: 'oracle'
    }));
    expect(canonicalState.systems.day_zero_autopilot.note).toContain('No Stripe');
    expect(canonicalState.execution_tracks.autonomy_machine.phases.week_4_day_zero).toEqual(expect.objectContaining({
      state: 'active',
      maturity: 'implemented',
      owner_domains: ['oracle'],
      primary_locations: ['scripts/pipelines/']
    }));
  });

  test('autopilot runs collector before local llm worker and handles exit codes', () => {
    const source = read('scripts/pipelines/day_zero_autopilot.ps1');
    const collectorIndex = source.indexOf('raw_market_news_collector.py');
    const workerIndex = source.indexOf('local_llm_enrichment_worker.py');

    expect(collectorIndex).toBeGreaterThan(-1);
    expect(workerIndex).toBeGreaterThan(collectorIndex);
    expect(source).toContain('$collectorExit -ne 0 -and $collectorExit -ne 2');
    expect(source).toContain('DAY_ZERO_LLM_LIMIT');
    expect(source).toContain('day_zero_autopilot_$RunStamp.log');
    expect(source).toContain('"--infinite"');
    expect(source).not.toContain('"--loop"');
    expect(source).toContain('exit 2');
    expect(source).toContain('exit 1');
  });

  test('startup shortcut installer creates the expected visible login autostart without secrets', () => {
    const source = read('scripts/pipelines/create_startup_shortcut.ps1');

    expect(source).toContain('$ShortcutName = "MBRN_Autopilot.lnk"');
    expect(source).toContain('Start Menu\\Programs\\Startup');
    expect(source).toContain('WScript.Shell');
    expect(source).toContain('$shortcut.TargetPath = "powershell.exe"');
    expect(source).toContain('-WindowStyle Minimized');
    expect(source).toContain('$shortcut.WindowStyle = 7');
    expect(source).toContain('day_zero_autopilot.ps1');
    expect(source).not.toContain('SUPABASE_SERVICE_ROLE_KEY=');
    expect(source).not.toContain('DATA_ARB_API_KEY=');
    expect(source).not.toContain('New-ScheduledTaskTrigger');
    expect(source).not.toContain('Register-ScheduledTask');
  });

  test('week 4 does not add commerce or paywall semantics to the automation scripts', () => {
    const combined = [
      read('scripts/pipelines/day_zero_autopilot.ps1'),
      read('scripts/pipelines/create_startup_shortcut.ps1')
    ].join('\n');

    expect(combined).not.toMatch(/stripe-checkout|stripe-webhook|premium|paywall|blur|plan_id|access_level/i);
  });
});
