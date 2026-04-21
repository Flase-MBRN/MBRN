import { renderDimensionViewCard } from './shared.js';

export function renderGrowthView(container) {
  return renderDimensionViewCard(container, 'growth', {
    eyebrow: 'Dimension View',
    description: 'Wachstum ordnet Kapital, Fortschritt und konkrete Entwicklung in einem Surface-Kontext.'
  });
}
