export const META_GENERATOR_SCOPE = Object.freeze({
  status: 'seed',
  allowedSubsystems: Object.freeze([
    'blueprints',
    'content',
    'modules',
    'assets',
    'agent_adapters'
  ]),
  disallowedPatterns: Object.freeze([
    'prompt_dump',
    'orphan_experiment',
    'business_logic'
  ])
});

export function assertMetaGeneratorSubsystem(subsystemId) {
  if (!META_GENERATOR_SCOPE.allowedSubsystems.includes(subsystemId)) {
    throw new Error(`Meta Generator subsystem '${subsystemId}' is outside the seed scope.`);
  }

  return subsystemId;
}
