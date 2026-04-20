import { describe, expect, test } from '@jest/globals';
import { buildAgentAdapterRequest } from '../pillars/meta_generator/agent_adapters/index.js';
import { buildAssetSpec } from '../pillars/meta_generator/assets/index.js';
import { buildPillarCompletionBlueprint, getPillarStageSequence } from '../pillars/meta_generator/blueprints/index.js';
import { buildPostV3RoadmapMarkdown } from '../pillars/meta_generator/content/index.js';
import { buildModuleScaffold } from '../pillars/meta_generator/modules/index.js';

describe('meta generator seed modules', () => {
  test('blueprints and content produce real internal workflow artifacts', () => {
    expect(getPillarStageSequence()).toEqual([
      'frontend_os',
      'oracle',
      'monetization',
      'meta_generator'
    ]);
    expect(buildPillarCompletionBlueprint('oracle')).toEqual(expect.objectContaining({
      pillarId: 'oracle',
      outcome: 'real_runtime_substance'
    }));

    const roadmap = buildPostV3RoadmapMarkdown();
    expect(roadmap).toContain('# 001 Post-v3 Roadmap');
    expect(roadmap).toContain('Stage A - Pillars Completion');
    expect(roadmap).toContain('frontend_os');
  });

  test('module, asset and adapter builders return consumable generator outputs', () => {
    expect(buildModuleScaffold({
      moduleName: 'oracle_snapshot',
      description: 'Oracle Snapshot module',
      exports: ['buildSnapshot']
    })).toEqual(expect.objectContaining({
      path: 'oracle_snapshot/index.js',
      contents: expect.stringContaining('export function buildSnapshot()')
    }));

    expect(buildAssetSpec({ id: 'oracle-card' })).toEqual(expect.objectContaining({
      id: 'oracle-card',
      outputFormat: 'png'
    }));

    expect(buildAgentAdapterRequest({
      adapter: 'local_llm',
      task: 'generate_blueprint',
      payload: { pillarId: 'oracle' }
    })).toEqual(expect.objectContaining({
      adapter: 'local_llm',
      task: 'generate_blueprint',
      payload: { pillarId: 'oracle' }
    }));
  });
});
