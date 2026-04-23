import { DIMENSION_REGISTRY } from '../../../shared/core/registries/dimension_registry.js';
import { renderDimensionViewCard } from './shared.js';

function createDimensionViewRenderer(dimensionId) {
  return (container) => renderDimensionViewCard(container, dimensionId, {
    eyebrow: 'Dimension View'
  });
}

export function getDimensionViewIds() {
  return DIMENSION_REGISTRY.map((dimension) => dimension.id);
}

export function resolveDimensionView(dimensionId) {
  return getDimensionViewIds().includes(dimensionId)
    ? createDimensionViewRenderer(dimensionId)
    : null;
}

export function renderDimensionView(dimensionId, container) {
  const renderer = resolveDimensionView(dimensionId);
  if (!renderer) {
    throw new Error(`Unknown dimension view: ${dimensionId}`);
  }
  return renderer(container);
}
