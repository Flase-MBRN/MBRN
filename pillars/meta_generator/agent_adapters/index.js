const PLACEHOLDER_ADAPTER = 'manual_work_order';

export function buildAgentAdapterRequest({
  adapter = PLACEHOLDER_ADAPTER,
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
    adapter: PLACEHOLDER_ADAPTER,
    task: 'generate_blueprint',
    payload: { blueprint }
  });
}

export function buildAssetGenerationRequest(assetPreset) {
  return buildAgentAdapterRequest({
    adapter: PLACEHOLDER_ADAPTER,
    task: 'generate_asset',
    payload: { assetPreset }
  });
}

export function buildContentExpansionRequest(contentBundle) {
  return buildAgentAdapterRequest({
    adapter: PLACEHOLDER_ADAPTER,
    task: 'expand_content_bundle',
    payload: { contentBundle }
  });
}
