const PILLAR_STAGE_SEQUENCE = Object.freeze([
  'frontend_os',
  'oracle',
  'monetization',
  'meta_generator'
]);

export function getPillarStageSequence() {
  return [...PILLAR_STAGE_SEQUENCE];
}

export function buildPillarCompletionBlueprint(pillarId) {
  return {
    pillarId,
    outcome: 'real_runtime_substance',
    rules: [
      'clear_responsibility',
      'active_modules',
      'clear_contracts',
      'no_distributed_shadow_logic'
    ]
  };
}
