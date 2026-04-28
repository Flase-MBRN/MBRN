import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from '@jest/globals';

const repoRoot = process.cwd();

describe('Hub Observer Registry Consistency', () => {
  test('PM2_PROCESSES in hub_observer matches reality', () => {
    const observerPath = path.join(repoRoot, 'scripts/pipelines/mbrn_hub_observer.py');
    const observerSource = fs.readFileSync(observerPath, 'utf8');
    
    // Extract PM2_PROCESSES list using regex
    const match = observerSource.match(/PM2_PROCESSES = \[(.*?)\]/s);
    expect(match).toBeDefined();
    
    const processesRaw = match[1];
    const processes = processesRaw
      .split('\n')
      .map(line => line.trim().replace(/["',]/g, ''))
      .filter(line => line.length > 0);
      
    const expectedProcesses = [
      "sentinel-daemon",
      "horizon-scout",
      "nexus-bridge",
      "value-router",
      "ouroboros-agent",
      "bridge-agent",
      "live-monitor",
      "logic-auditor",
      "prime-director",
      "cockpit-server",
      "cockpit-sync"
    ];
    
    // Check that all expected processes are present
    for (const expected of expectedProcesses) {
      expect(processes).toContain(expected);
    }
    
    expect(processes.length).toBe(expectedProcesses.length);
  });

  test('hub_state.json total_processes matches registry length', () => {
    const statePath = path.join(repoRoot, 'shared/data/hub_state.json');
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      const observerPath = path.join(repoRoot, 'scripts/pipelines/mbrn_hub_observer.py');
      const observerSource = fs.readFileSync(observerPath, 'utf8');
      
      const match = observerSource.match(/PM2_PROCESSES = \[(.*?)\]/s);
      const processesRaw = match[1];
      const processes = processesRaw
        .split('\n')
        .map(line => line.trim().replace(/["',]/g, ''))
        .filter(line => line.length > 0);
        
      expect(state.system.total_processes).toBe(processes.length);
    }
  });
});
