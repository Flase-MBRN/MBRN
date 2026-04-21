export const META_GENERATOR_SCOPE = Object.freeze({
  status: 'active',
  allowedSubsystems: Object.freeze([
    'blueprints',
    'content',
    'modules',
    'assets',
    'agent_adapters'
  ]),
  requiredConsumers: Object.freeze({
    runtime_consumers: Object.freeze([
      'shared/application/frontend_os/discoverability_runtime.js',
      'shared/application/frontend_os/export_runtime.js'
    ]),
    workflow_consumers: Object.freeze([
      'scripts/devlab/generate_post_v3_roadmap.mjs',
      'scripts/devlab/preview_meta_generator_seed_bundle.mjs',
      'scripts/devlab/generate_app_blueprint_bundle.mjs',
      'scripts/devlab/preview_app_scaffold_bundle.mjs'
    ]),
    ai_adapter_consumers: Object.freeze([
      'scripts/devlab/preview_app_scaffold_bundle.mjs'
    ])
  }),
  disallowedPatterns: Object.freeze([
    'prompt_dump',
    'orphan_experiment',
    'business_logic'
  ])
});

export function assertMetaGeneratorSubsystem(subsystemId) {
  if (!META_GENERATOR_SCOPE.allowedSubsystems.includes(subsystemId)) {
    throw new Error(`Meta Generator subsystem '${subsystemId}' is outside the active scope.`);
  }

  return subsystemId;
}
