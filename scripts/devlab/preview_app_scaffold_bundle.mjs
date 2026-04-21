import { buildBlueprintGenerationRequest, buildAgentWorkOrder } from '../../pillars/meta_generator/agent_adapters/index.js';
import { buildAppBlueprint } from '../../pillars/meta_generator/blueprints/index.js';
import { buildAppScaffoldBundle } from '../../pillars/meta_generator/modules/index.js';
import { assertMetaGeneratorSubsystem } from '../../pillars/meta_generator/scope_manifest.js';

assertMetaGeneratorSubsystem('blueprints');
assertMetaGeneratorSubsystem('modules');
assertMetaGeneratorSubsystem('agent_adapters');

const blueprint = buildAppBlueprint({
  appId: 'synergy',
  displayName: 'Vibe Check',
  route: 'apps/synergy/index.html',
  dimensionId: 'pattern',
  status: 'provisional'
});

const scaffoldBundle = buildAppScaffoldBundle(blueprint);
const adapterRequest = buildBlueprintGenerationRequest(blueprint);
const workOrder = buildAgentWorkOrder('preview_app_scaffold_bundle', {
  blueprint,
  consumer: 'scripts/devlab/preview_app_scaffold_bundle.mjs'
});

process.stdout.write(`${JSON.stringify({
  generatedAt: new Date().toISOString(),
  blueprint,
  scaffoldBundle,
  adapterRequest,
  workOrder
}, null, 2)}\n`);
