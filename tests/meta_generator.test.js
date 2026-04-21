import { describe, expect, test } from '@jest/globals';
import { execFileSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';
import { buildAgentAdapterRequest } from '../pillars/meta_generator/agent_adapters/index.js';
import { buildAssetSpec } from '../pillars/meta_generator/assets/index.js';
import { buildPillarCompletionBlueprint, getPillarStageSequence } from '../pillars/meta_generator/blueprints/index.js';
import { buildPostV3RoadmapMarkdown } from '../pillars/meta_generator/content/index.js';
import { buildModuleScaffold } from '../pillars/meta_generator/modules/index.js';
import { assertMetaGeneratorSubsystem, META_GENERATOR_SCOPE } from '../pillars/meta_generator/scope_manifest.js';

const REPO_ROOT = process.cwd();

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

  test('seed preview workflow consumes module, asset and adapter generators outside tests', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/devlab/preview_meta_generator_seed_bundle.mjs'],
      { cwd: process.cwd(), encoding: 'utf8' }
    );
    const parsed = JSON.parse(output);

    expect(parsed.module).toEqual(expect.objectContaining({
      path: 'stage_a_seed_bundle/index.js'
    }));
    expect(parsed.asset).toEqual(expect.objectContaining({
      id: 'stage-a-seed-bundle',
      outputFormat: 'png'
    }));
    expect(parsed.adapterRequest).toEqual(expect.objectContaining({
      adapter: 'local_llm',
      task: 'preview_seed_bundle'
    }));
  });

  test('roadmap generator workflow consumes scoped seed modules outside tests', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/devlab/generate_post_v3_roadmap.mjs'],
      { cwd: process.cwd(), encoding: 'utf8' }
    );

    expect(output).toContain('Generated');
    expect(buildPostV3RoadmapMarkdown()).toContain('# 001 Post-v3 Roadmap');
  });

  test('scope manifest keeps the seed pillar inside allowed subsystems only', () => {
    expect(META_GENERATOR_SCOPE).toEqual(expect.objectContaining({
      status: 'seed',
      allowedSubsystems: expect.arrayContaining(['blueprints', 'content', 'modules', 'assets', 'agent_adapters'])
    }));
    expect(assertMetaGeneratorSubsystem('content')).toBe('content');
    expect(() => assertMetaGeneratorSubsystem('prompt_dump')).toThrow(/outside the seed scope/);
  });

  test('active meta generator seed zones use synchronized README markers instead of NOT_IMPLEMENTED', () => {
    for (const subsystemId of META_GENERATOR_SCOPE.allowedSubsystems) {
      const subsystemPath = path.join(REPO_ROOT, 'pillars', 'meta_generator', subsystemId);
      expect(fs.existsSync(path.join(subsystemPath, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(subsystemPath, 'NOT_IMPLEMENTED.md'))).toBe(false);
    }
  });
});
