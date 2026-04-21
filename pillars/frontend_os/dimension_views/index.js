import { renderGrowthView } from './growth_view.js';
import { renderPatternView } from './pattern_view.js';
import { renderTimeView } from './time_view.js';
import { renderSignalView } from './signal_view.js';

const DIMENSION_VIEW_RESOLVER = Object.freeze({
  growth: renderGrowthView,
  pattern: renderPatternView,
  time: renderTimeView,
  signal: renderSignalView
});

export function getDimensionViewIds() {
  return Object.keys(DIMENSION_VIEW_RESOLVER);
}

export function resolveDimensionView(dimensionId) {
  return DIMENSION_VIEW_RESOLVER[dimensionId] || null;
}

export function renderDimensionView(dimensionId, container) {
  const renderer = resolveDimensionView(dimensionId);
  if (!renderer) {
    throw new Error(`Unknown dimension view: ${dimensionId}`);
  }
  return renderer(container);
}
