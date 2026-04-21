import { renderDimensionViewCard } from './shared.js';

export function renderPatternView(container) {
  return renderDimensionViewCard(container, 'pattern', {
    eyebrow: 'Dimension View',
    description: 'Muster gruppiert Profile, Numerologie und provisorische Pattern-Tools in einer gemeinsamen Oberflaeche.'
  });
}
