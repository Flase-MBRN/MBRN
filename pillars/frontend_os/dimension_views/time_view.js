import { renderDimensionViewCard } from './shared.js';

export function renderTimeView(container) {
  return renderDimensionViewCard(container, 'time', {
    eyebrow: 'Dimension View',
    description: 'Zeit ordnet Phasen, Zyklen und timing-nahe Einstiege als eigene Frontend-OS-Sicht.'
  });
}
