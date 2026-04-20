import { APP_MANIFEST } from '../../../shared/core/registries/app_manifest.js';
import { getDimensionById } from '../../../shared/core/registries/dimension_registry.js';
import { dom } from '../../../shared/ui/dom_utils.js';

export function getDashboardAppEntries() {
  return APP_MANIFEST
    .filter((app) => app.surfaceFlags?.includeInDashboard)
    .map((app) => {
      const dimension = getDimensionById(app.dimensionId);
      return {
        ...app,
        href: `../${app.route.replace(/index\.html$/, '')}`,
        statusText: dimension?.publicLabel || app.label,
        navigationOrder: dimension?.surfaceFlags?.navigationOrder ?? 999
      };
    })
    .sort((left, right) => left.navigationOrder - right.navigationOrder);
}

export function renderDashboardAppCards(containerId = 'dashboard-app-grid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.replaceChildren();

  getDashboardAppEntries().forEach((entry, index) => {
    const card = dom.createEl('a', {
      className: 'glass-card stagger-fade app-card-link',
      attrs: {
        href: entry.href,
        'data-delay': String(index + 1),
        'data-route': entry.id
      },
      parent: container
    });

    dom.createEl('div', {
      className: 'app-icon',
      text: entry.icon,
      parent: card
    });

    dom.createEl('h4', {
      className: 'card-title',
      text: entry.label,
      parent: card
    });

    dom.createEl('p', {
      className: 'text-secondary status-text',
      text: entry.statusText,
      parent: card
    });
  });
}
