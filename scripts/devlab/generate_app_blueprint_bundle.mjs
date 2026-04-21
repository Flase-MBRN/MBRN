import { buildAppBlueprint } from '../../pillars/meta_generator/blueprints/index.js';
import { assertMetaGeneratorSubsystem } from '../../pillars/meta_generator/scope_manifest.js';

assertMetaGeneratorSubsystem('blueprints');

const blueprint = buildAppBlueprint({
  appId: 'synergy',
  displayName: 'Vibe Check',
  route: 'apps/synergy/index.html',
  dimensionId: 'pattern',
  status: 'provisional'
});

process.stdout.write(`${JSON.stringify(blueprint, null, 2)}\n`);
