import { dom } from '../../../shared/ui/dom_utils.js';
import { getDimensionSurfaceModel } from '../../../shared/application/frontend_os/discoverability_runtime.js';

function createSurfaceCard(parent, options) {
  const {
    title,
    body,
    meta,
    surfaceId = null,
    route = null,
    interactive = false,
    basePath = '',
    onNavigate = null
  } = options;

  const tagName = interactive ? 'a' : 'div';
  const card = dom.createEl(tagName, {
    className: `dimension-surface-card${interactive ? ' is-link' : ' is-static'}`,
    attrs: interactive
      ? {
          href: `${basePath}${route}`,
          'data-route': surfaceId
        }
      : {},
    parent
  });

  dom.createEl('h4', {
    className: 'dimension-surface-card-title',
    text: title,
    parent: card
  });
  dom.createEl('p', {
    className: 'text-secondary dimension-surface-card-copy',
    text: body,
    parent: card
  });
  dom.createEl('span', {
    className: 'dimension-surface-card-meta',
    text: meta,
    parent: card
  });

  if (interactive) {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      onNavigate?.(surfaceId);
    });
  }

  return card;
}

export function renderDimensionViewCard(container, dimensionId, options = {}) {
  const model = getDimensionSurfaceModel(dimensionId);
  if (!model) {
    throw new Error(`Unknown dimension model: ${dimensionId}`);
  }

  const basePath = options.basePath || '';
  const onNavigate = typeof options.onNavigate === 'function' ? options.onNavigate : null;

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
    className: 'data-grid compact dimension-view-meta',
    parent: root
  });
  dom.createEl('div', {
    className: 'card-grid-item-sm',
    text: `Primaer: ${model.defaultApp || 'Keine direkte App'}`,
    parent: meta
  });
  dom.createEl('div', {
    className: 'card-grid-item-sm',
    text: `Themenbereiche: ${model.topicAreas.length}`,
    parent: meta
  });
  dom.createEl('div', {
    className: 'card-grid-item-sm',
    text: `Direkte Apps: ${model.standaloneApps.length}`,
    parent: meta
  });

  if (model.topicAreas.length) {
    const topicAreaSection = dom.createEl('section', {
      className: 'dimension-surface-section mt-24',
      parent: root
    });
    dom.createEl('div', {
      className: 'section-eyebrow-left',
      text: 'Themenbereiche',
      parent: topicAreaSection
    });

    const topicAreaGrid = dom.createEl('div', {
      className: 'dimension-surface-grid',
      parent: topicAreaSection
    });

    model.topicAreas.forEach((topicArea) => {
      const targetApp = topicArea.apps.find((app) => app.id === topicArea.defaultSurfaceId) || topicArea.apps[0] || null;

      createSurfaceCard(topicAreaGrid, {
        title: topicArea.publicLabel,
        body: topicArea.description,
        meta: targetApp ? `Oeffnet: ${targetApp.label}` : 'In Vorbereitung',
        surfaceId: targetApp?.id || null,
        route: targetApp?.route || null,
        interactive: Boolean(targetApp),
        basePath,
        onNavigate
      });
    });
  }

  if (model.standaloneApps.length) {
    const appSection = dom.createEl('section', {
      className: 'dimension-surface-section mt-24',
      parent: root
    });
    dom.createEl('div', {
      className: 'section-eyebrow-left',
      text: 'Direkte Apps',
      parent: appSection
    });

    const appGrid = dom.createEl('div', {
      className: 'dimension-surface-grid',
      parent: appSection
    });

    model.standaloneApps.forEach((app) => {
      createSurfaceCard(appGrid, {
        title: app.label,
        body: app.copy?.subtitle || app.blueprint?.narrativeTone || 'Direkte Surface dieser Dimension.',
        meta: app.status === 'stable' ? 'Aktiv' : 'Im Ausbau',
        surfaceId: app.id,
        route: app.route,
        interactive: true,
        basePath,
        onNavigate
      });
    });
  }

  if (!model.topicAreas.length && !model.standaloneApps.length) {
    const placeholder = dom.createEl('div', {
      className: 'dimension-surface-placeholder mt-24',
      parent: root
    });

    dom.createEl('div', {
      className: 'section-eyebrow-left',
      text: 'In Vorbereitung',
      parent: placeholder
    });
    dom.createEl('p', {
      className: 'text-secondary',
      text: 'Diese Dimension ist kanonisch sichtbar, aber hat noch keine direkte Surface. Der Hub bleibt bereits als stabiler Einstieg vorbereitet.',
      parent: placeholder
    });
  }

  return { root, model };
}
