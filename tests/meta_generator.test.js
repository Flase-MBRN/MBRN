import { describe, expect, test } from '@jest/globals';
import { execFileSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildAgentAdapterRequest,
  buildAgentWorkOrder,
  buildAssetGenerationRequest,
  buildBlueprintGenerationRequest,
  buildContentExpansionRequest
} from '../pillars/meta_generator/agent_adapters/index.js';
import { buildAssetSpec, buildExportAssetPreset } from '../pillars/meta_generator/assets/index.js';
import {
  buildAppBlueprint,
  buildDimensionBlueprint,
  buildPillarCompletionBlueprint,
  buildSurfaceBlueprint,
  getPillarStageSequence
} from '../pillars/meta_generator/blueprints/index.js';
import {
  buildDimensionContentBundle,
  buildExportCopyBundle,
  buildPostV3RoadmapMarkdown,
  buildSurfaceCopyBundle
} from '../pillars/meta_generator/content/index.js';
import {
  buildAppScaffoldBundle,
  buildFrontendSurfaceScaffold,
  buildModuleScaffold,
  buildSharedLogicScaffold
} from '../pillars/meta_generator/modules/index.js';
import { assertMetaGeneratorSubsystem, META_GENERATOR_SCOPE } from '../pillars/meta_generator/scope_manifest.js';
import {
  getDimensionSurfaceModel,
  getFrontendSurfaceCatalog
} from '../shared/application/frontend_os/discoverability_runtime.js';
import {
  prepareFinanceStoryExport,
  prepareNumerologyShareExport
} from '../shared/application/frontend_os/export_runtime.js';
import { getUnifiedProfile } from '../shared/core/logic/orchestrator.js';

const REPO_ROOT = process.cwd();

describe('meta generator active modules', () => {
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

    expect(buildDimensionBlueprint('pattern')).toEqual(expect.objectContaining({
      id: 'pattern',
      primarySurfaceIds: expect.arrayContaining(['numerology', 'synergy'])
    }));
    expect(buildSurfaceBlueprint('numerology')).toEqual(expect.objectContaining({
      id: 'numerology',
      exportEntrypoints: expect.arrayContaining(['share_export', 'asset_export', 'pdf_export'])
    }));
    expect(buildAppBlueprint({
      appId: 'synergy',
      status: 'provisional',
      requiredCapabilities: ['app_surfaces', 'dimension_views']
    })).toEqual(expect.objectContaining({
      appId: 'synergy',
      dimensionId: 'pattern',
      blueprintVersion: '2.0.0'
    }));
  });

  test('module, asset, content and adapter builders return consumable generator outputs', () => {
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
    expect(buildExportAssetPreset('share_export', { surfaceId: 'numerology' })).toEqual(
      expect.objectContaining({
        id: 'numerology_share_card',
        outputFormat: 'png',
        preferShare: true
      })
    );
    expect(buildDimensionContentBundle('growth')).toEqual(expect.objectContaining({
      dimensionId: 'growth',
      title: 'Wachstum lesen'
    }));
    expect(buildSurfaceCopyBundle('finance')).toEqual(expect.objectContaining({
      surfaceId: 'finance',
      cta: 'Szenario ansehen'
    }));
    expect(buildExportCopyBundle('pdf_export')).toEqual(expect.objectContaining({
      exportId: 'pdf_export',
      title: 'PDF Report'
    }));
    expect(buildFrontendSurfaceScaffold({ appId: 'synergy' })).toEqual(expect.objectContaining({
      path: 'pillars/frontend_os/app_surfaces/synergy_surface.js'
    }));
    expect(buildSharedLogicScaffold({ appId: 'synergy' })).toEqual(expect.objectContaining({
      path: 'shared/application/synergy_runtime.js'
    }));
    expect(buildAppScaffoldBundle(buildAppBlueprint({
      appId: 'synergy',
      status: 'provisional',
      requiredCapabilities: ['app_surfaces']
    }))).toEqual(expect.objectContaining({
      blueprint: expect.objectContaining({ appId: 'synergy' }),
      frontendSurface: expect.objectContaining({
        path: 'pillars/frontend_os/app_surfaces/synergy_surface.js'
      })
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
    expect(buildAgentWorkOrder('generate_surface', { surfaceId: 'numerology' })).toEqual(
      expect.objectContaining({
        kind: 'generate_surface',
        payload: { surfaceId: 'numerology' }
      })
    );
    expect(buildBlueprintGenerationRequest({ appId: 'synergy' })).toEqual(expect.objectContaining({
      adapter: 'local_llm',
      task: 'generate_blueprint',
      payload: { blueprint: { appId: 'synergy' } }
    }));
    expect(buildAssetGenerationRequest({ id: 'numerology_share_card' })).toEqual(expect.objectContaining({
      adapter: 'local_llm',
      task: 'generate_asset',
      payload: { assetPreset: { id: 'numerology_share_card' } }
    }));
    expect(buildContentExpansionRequest({ surfaceId: 'dashboard' })).toEqual(expect.objectContaining({
      adapter: 'local_llm',
      task: 'expand_content_bundle',
      payload: { contentBundle: { surfaceId: 'dashboard' } }
    }));
  });

  test('preview workflow consumes module, asset and adapter generators outside tests', () => {
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

  test('blueprint and scaffold workflows consume blueprints, modules and adapters outside tests', () => {
    const blueprintOutput = execFileSync(
      process.execPath,
      ['scripts/devlab/generate_app_blueprint_bundle.mjs'],
      { cwd: process.cwd(), encoding: 'utf8' }
    );
    const scaffoldOutput = execFileSync(
      process.execPath,
      ['scripts/devlab/preview_app_scaffold_bundle.mjs'],
      { cwd: process.cwd(), encoding: 'utf8' }
    );

    const blueprint = JSON.parse(blueprintOutput);
    const scaffold = JSON.parse(scaffoldOutput);

    expect(blueprint).toEqual(expect.objectContaining({
      appId: 'synergy',
      dimensionId: 'pattern',
      blueprintVersion: '2.0.0'
    }));
    expect(scaffold.scaffoldBundle).toEqual(expect.objectContaining({
      blueprint: expect.objectContaining({ appId: 'synergy' }),
      module: expect.objectContaining({ path: 'synergy/index.js' })
    }));
    expect(scaffold.workOrder).toEqual(expect.objectContaining({
      kind: 'preview_app_scaffold_bundle'
    }));
  });

  test('generator scaffold for synergy is materialized as a real frontend_os surface and consumed by a thin route bootstrap', () => {
    const blueprint = buildAppBlueprint({
      appId: 'synergy',
      displayName: 'Vibe Check',
      route: 'apps/synergy/index.html',
      dimensionId: 'pattern',
      status: 'provisional'
    });
    const scaffoldBundle = buildAppScaffoldBundle(blueprint);
    const generatedSurface = fs.readFileSync(
      path.join(REPO_ROOT, 'pillars', 'frontend_os', 'app_surfaces', 'synergy_surface.js'),
      'utf8'
    );
    const routeBootstrap = fs.readFileSync(
      path.join(REPO_ROOT, 'apps', 'synergy', 'render.js'),
      'utf8'
    ).trim();

    expect(scaffoldBundle.frontendSurface).toEqual(expect.objectContaining({
      path: 'pillars/frontend_os/app_surfaces/synergy_surface.js'
    }));
    expect(generatedSurface).toBe(scaffoldBundle.frontendSurface.contents);
    expect(routeBootstrap).toBe("export { synergySurface } from '../../pillars/frontend_os/app_surfaces/synergy_surface.js';");
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

  test('scope manifest keeps the active pillar inside allowed subsystems only', () => {
    expect(META_GENERATOR_SCOPE).toEqual(expect.objectContaining({
      status: 'active',
      allowedSubsystems: expect.arrayContaining(['blueprints', 'content', 'modules', 'assets', 'agent_adapters']),
      requiredConsumers: expect.objectContaining({
        runtime_consumers: expect.arrayContaining([
          'shared/application/frontend_os/discoverability_runtime.js',
          'shared/application/frontend_os/export_runtime.js'
        ]),
        workflow_consumers: expect.arrayContaining([
          'scripts/devlab/generate_post_v3_roadmap.mjs',
          'scripts/devlab/preview_meta_generator_seed_bundle.mjs',
          'scripts/devlab/generate_app_blueprint_bundle.mjs',
          'scripts/devlab/preview_app_scaffold_bundle.mjs'
        ]),
        ai_adapter_consumers: expect.arrayContaining([
          'scripts/devlab/preview_app_scaffold_bundle.mjs'
        ])
      })
    }));
    expect(assertMetaGeneratorSubsystem('content')).toBe('content');
    expect(() => assertMetaGeneratorSubsystem('prompt_dump')).toThrow(/outside the active scope/);
  });

  test('frontend runtime consumers read meta-generator bundles in product-facing flows', async () => {
    const patternModel = getDimensionSurfaceModel('pattern');
    const surfaceCatalog = getFrontendSurfaceCatalog();
    const unifiedProfileResult = await getUnifiedProfile('Erik Example', '1990-01-01');
    const financeExport = prepareFinanceStoryExport({
      finalBalance: '12.500 EUR',
      totalInterest: '2.500 EUR',
      totalInvested: '10.000 EUR'
    });
    const shareExport = prepareNumerologyShareExport(unifiedProfileResult.data);

    expect(unifiedProfileResult.success).toBe(true);

    expect(patternModel).toEqual(expect.objectContaining({
      id: 'pattern',
      content: expect.objectContaining({ title: 'Muster erkennen' }),
      blueprint: expect.objectContaining({ id: 'pattern' })
    }));
    expect(patternModel.apps.find((app) => app.id === 'numerology')).toEqual(expect.objectContaining({
      copy: expect.objectContaining({ title: 'Muster' }),
      blueprint: expect.objectContaining({ id: 'numerology' })
    }));
    expect(surfaceCatalog.dimensionViews.find((view) => view.id === 'growth')).toEqual(expect.objectContaining({
      content: expect.objectContaining({ dimensionId: 'growth' }),
      blueprint: expect.objectContaining({ id: 'growth' })
    }));
    expect(financeExport).toEqual(expect.objectContaining({
      title: 'Surface Asset',
      assetPreset: expect.objectContaining({ id: 'finance_asset' })
    }));
    expect(shareExport).toEqual(expect.objectContaining({
      title: 'Share Card',
      assetPreset: expect.objectContaining({ id: 'numerology_share_card', preferShare: true }),
      preferShare: true
    }));
  });

  test('active meta generator zones use synchronized README markers instead of NOT_IMPLEMENTED', () => {
    for (const subsystemId of META_GENERATOR_SCOPE.allowedSubsystems) {
      const subsystemPath = path.join(REPO_ROOT, 'pillars', 'meta_generator', subsystemId);
      expect(fs.existsSync(path.join(subsystemPath, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(subsystemPath, 'NOT_IMPLEMENTED.md'))).toBe(false);
    }
  });

  test('app blueprint template is a mirror of the active blueprint contract, not a second truth', () => {
    const template = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'templates', 'app_blueprint.json'), 'utf8')
    );
    const generatedBlueprint = buildAppBlueprint({
      appId: 'synergy',
      status: 'provisional',
      requiredCapabilities: ['app_surfaces', 'dimension_views']
    });

    expect(template).toEqual(expect.objectContaining({
      source_of_truth: 'pillars/meta_generator/blueprints/index.js#buildAppBlueprint',
      blueprint_version: '2.0.0',
      example: expect.objectContaining({
        appId: generatedBlueprint.appId,
        dimensionId: generatedBlueprint.dimensionId,
        blueprintVersion: generatedBlueprint.blueprintVersion
      })
    }));
  });
});
