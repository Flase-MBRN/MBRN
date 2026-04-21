import { buildAgentAdapterRequest } from '../../pillars/meta_generator/agent_adapters/index.js';
import { buildAssetSpec } from '../../pillars/meta_generator/assets/index.js';
import { buildModuleScaffold } from '../../pillars/meta_generator/modules/index.js';
import { assertMetaGeneratorSubsystem } from '../../pillars/meta_generator/scope_manifest.js';

assertMetaGeneratorSubsystem('modules');
assertMetaGeneratorSubsystem('assets');
assertMetaGeneratorSubsystem('agent_adapters');

const previewBundle = {
  generatedAt: new Date().toISOString(),
  module: buildModuleScaffold({
    moduleName: 'stage_a_seed_bundle',
    description: 'Internal Stage A preview scaffold',
    exports: ['renderSeedBundle']
  }),
  asset: buildAssetSpec({
    id: 'stage-a-seed-bundle',
    kind: 'preview_card'
  }),
  adapterRequest: buildAgentAdapterRequest({
    adapter: 'manual_work_order',
    task: 'preview_seed_bundle',
    payload: { stage: 'A', consumer: 'scripts/devlab/preview_meta_generator_seed_bundle.mjs' }
  })
};

process.stdout.write(`${JSON.stringify(previewBundle, null, 2)}\n`);
