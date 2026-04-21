import { dom } from '../../../shared/ui/dom_utils.js';
import { getDimensionSurfaceModel } from '../../../shared/application/frontend_os/discoverability_runtime.js';

export function renderDimensionViewCard(container, dimensionId, options = {}) {
  const model = getDimensionSurfaceModel(dimensionId);
  if (!model) {
    throw new Error(`Unknown dimension model: ${dimensionId}`);
  }

  container.replaceChildren();

  const root = dom.createEl('section', {
    className: 'glass-card dimension-view-card',
    parent: container
  });

  dom.createEl('div', {
    className: 'section-eyebrow-left',
    text: options.eyebrow || 'Dimension',
    parent: root
  });
  dom.createEl('h3', {
    className: 'value-massive text-size-lg',
    text: model.publicLabel,
    parent: root
  });
  dom.createEl('p', {
    className: 'text-secondary mb-16',
    text: options.description || model.description,
    parent: root
  });

  const meta = dom.createEl('div', {
    className: 'data-grid compact',
    parent: root
  });
  dom.createEl('div', {
    className: 'card-grid-item-sm',
    text: `Default App: ${model.defaultApp || 'Keine direkte App'}`,
    parent: meta
  });
  dom.createEl('div', {
    className: 'card-grid-item-sm',
    text: `Aktive Einstiege: ${model.visibleApps.length}`,
    parent: meta
  });

  const list = dom.createEl('div', {
    className: 'dimension-view-app-list mt-16',
    parent: root
  });

  (model.apps.length ? model.apps : [{ label: 'Noch keine App-Zuordnung', route: '-', status: 'inactive' }])
    .forEach((app) => {
      const item = dom.createEl('div', { className: 'card-grid-item-sm', parent: list });
      dom.createEl('span', {
        className: 'value-label',
        text: `${app.label}${app.status ? ` (${app.status})` : ''}`,
        parent: item
      });
      dom.createEl('span', {
        className: 'text-sm opacity-70',
        text: app.route || 'Kein Route-Einstieg',
        parent: item
      });
    });

  return { root, model };
}
