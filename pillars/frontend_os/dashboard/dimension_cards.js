import { DIMENSION_REGISTRY } from '../../../shared/core/registries/dimension_registry.js';
import { getDimensionSurfaceModel } from '../../../shared/application/frontend_os/discoverability_runtime.js';
import { dom } from '../../../shared/ui/dom_utils.js';

function getDimensionStatus(model) {
  const hasStableApp = model.apps.some((app) => app.status === 'stable');
  const hasAnySurface = model.apps.length > 0 || model.topicAreas.length > 0;

  if (hasStableApp) return 'Aktiv';
  if (hasAnySurface) return 'Im Ausbau';
  return 'In Vorbereitung';
}

function getDimensionMeta(model) {
  const details = [];

  if (model.topicAreas.length) {
    details.push(`${model.topicAreas.length} Themenbereiche`);
  }
  if (model.standaloneApps.length) {
    details.push(`${model.standaloneApps.length} Direktzugriffe`);
  }
  if (model.defaultApp) {
    const primaryApp = model.apps.find((app) => app.id === model.defaultApp);
    details.push(`Primaer: ${primaryApp?.label || model.defaultApp}`);
  }

  return details.join(' · ') || 'Noch keine direkte Surface';
}

export function getDashboardDimensionEntries() {
  return DIMENSION_REGISTRY
    .filter((dimension) => dimension.surfaceFlags?.includeInDashboard)
    .map((dimension) => {
      const model = getDimensionSurfaceModel(dimension.id);

      return {
        id: dimension.id,
        label: dimension.publicLabel,
        icon: dimension.publicLabel.charAt(0).toUpperCase(),
        description: dimension.description,
        statusText: getDimensionStatus(model),
        metaText: getDimensionMeta(model)
      };
    })
    .sort((left, right) => {
      const leftOrder = DIMENSION_REGISTRY.find((dimension) => dimension.id === left.id)?.surfaceFlags?.navigationOrder ?? 999;
      const rightOrder = DIMENSION_REGISTRY.find((dimension) => dimension.id === right.id)?.surfaceFlags?.navigationOrder ?? 999;
      return leftOrder - rightOrder;
    });
}

export function renderDashboardDimensionCards(containerId = 'dashboard-dimension-grid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.replaceChildren();

  getDashboardDimensionEntries().forEach((entry, index) => {
    const card = dom.createEl('a', {
      className: 'glass-card stagger-fade dimension-card-link dashboard-card-link',
      attrs: {
        href: `../dimensions/${entry.id}/index.html`,
        'data-delay': String(index + 1),
        'data-route': entry.id
      },
      parent: container
    });

    const header = dom.createEl('div', {
      className: 'dimension-card-header',
      parent: card
    });

    dom.createEl('div', {
      className: 'app-icon',
      text: entry.icon,
      parent: header
    });

    dom.createEl('span', {
      className: 'dimension-status-badge',
      text: entry.statusText,
      parent: header
    });

    dom.createEl('h4', {
      className: 'card-title',
      text: entry.label,
      parent: card
    });

    dom.createEl('p', {
      className: 'text-secondary dimension-card-copy',
      text: entry.description,
      parent: card
    });

    dom.createEl('p', {
      className: 'text-secondary status-text dimension-card-meta',
      text: entry.metaText,
      parent: card
    });
  });
}
