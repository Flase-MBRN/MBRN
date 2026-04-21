import { renderDimensionViewCard } from './shared.js';

export function renderSignalView(container) {
  return renderDimensionViewCard(container, 'signal', {
    eyebrow: 'Dimension View',
    description: 'Signal zeigt Oracle- und Marktoberflaechen als eigenstaendige Discoverability-Sicht, auch wenn noch keine direkte App haengt.'
  });
}
