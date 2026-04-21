export function buildAgentAdapterRequest({
  adapter = 'local',
  task = 'generate',
  payload = {}
} = {}) {
  return {
    adapter,
    task,
    payload,
    createdAt: new Date().toISOString()
  };
}

export function buildAgentWorkOrder(kind = 'generate', payload = {}) {
  return {
    kind,
    payload,
    createdAt: new Date().toISOString()
  };
}

export function buildBlueprintGenerationRequest(blueprint) {
  return buildAgentAdapterRequest({
    adapter: 'local_llm',
    task: 'generate_blueprint',
    payload: { blueprint }
  });
}

export function buildAssetGenerationRequest(assetPreset) {
  return buildAgentAdapterRequest({
    adapter: 'local_llm',
    task: 'generate_asset',
    payload: { assetPreset }
  });
}

export function buildContentExpansionRequest(contentBundle) {
  return buildAgentAdapterRequest({
    adapter: 'local_llm',
    task: 'expand_content_bundle',
    payload: { contentBundle }
  });
}
