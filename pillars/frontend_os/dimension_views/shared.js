import { dom } from '../../../shared/ui/dom_utils.js';
import { getDimensionSurfaceModel } from '../../../shared/application/frontend_os/discoverability_runtime.js';

/**
 * Robustly determine the repository root path (e.g., / or /MBRN/)
 */
function getLocalRepoRoot() {
  const currentPath = window.location.pathname;
  const mbrnPrefix = '/MBRN/';
  if (currentPath.startsWith(mbrnPrefix)) return mbrnPrefix;
  
  // Fallback for subfolder deployments or local testing
  const parts = currentPath.split('/');
  const dimensionsIndex = parts.indexOf('dimensions');
  if (dimensionsIndex !== -1) {
    return parts.slice(0, dimensionsIndex).join('/') + '/';
  }
  const dashboardIndex = parts.indexOf('dashboard');
  if (dashboardIndex !== -1) {
    return parts.slice(0, dashboardIndex).join('/') + '/';
  }
  
  return '/';
}

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

function getSnapshotPath() {
  const path = window.location.pathname;
  const parts = path.split('/').filter(p => p);
  
  // Check if we're in MBRN subfolder deployment
  const mbrnIndex = parts.indexOf('MBRN');
  const dimensionsIndex = parts.indexOf('dimensions');
  
  let depth = 0;
  
  if (dimensionsIndex !== -1) {
    // We are inside dimensions/X/ - count segments after dimensions (excluding filename)
    // e.g., MBRN/dimensions/systeme/index.html -> parts after dimensions = ['systeme', 'index.html']
    // We need to go up: systeme (1) + dimensions (1) = 2 levels to reach MBRN/
    const segmentsAfterDimensions = parts.length - dimensionsIndex - 1;
    // Exclude filename if present (ends with .html)
    const hasFilename = parts[parts.length - 1]?.includes('.');
    const folderLevels = hasFilename ? segmentsAfterDimensions - 1 : segmentsAfterDimensions;
    // +1 to also exit the dimensions/ folder itself
    depth = folderLevels + 1;
  } else if (mbrnIndex !== -1) {
    // We're somewhere inside MBRN but not in dimensions
    depth = parts.length - mbrnIndex - 1;
  }
  
  // Build relative path: need to go up to root, then into shared/data/
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  const snapshotPath = `${prefix}shared/data/factory_feed_snapshot.json`;
  
  console.log('[discoverability] Path:', path, '| Parts:', parts, '| depth:', depth);
  console.log('[discoverability] Calculated snapshot path:', snapshotPath);
  return snapshotPath;
}

async function fetchDynamicFactoryApps() {
  const snapshotPath = getSnapshotPath();
  console.log('[discoverability] Fetching apps from:', snapshotPath);
  try {
    const response = await fetch(snapshotPath, { cache: 'no-store' });
    if (!response.ok) {
      console.warn('[discoverability] Snapshot not found or error:', response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    console.log('[discoverability] Loaded', data.length, 'apps from snapshot');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('[discoverability] Failed to fetch dynamic apps:', err);
    return [];
  }
}

export async function renderDimensionViewCard(container, dimensionId, options = {}) {
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
    text: `Primär: ${model.defaultApp || 'Keine direkte App'}`,
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
      const topicSurfaceId = targetApp?.id || topicArea.defaultSurfaceId || topicArea.id;
      const topicRoute = targetApp?.route || topicArea.route || null;

      createSurfaceCard(topicAreaGrid, {
        title: topicArea.publicLabel,
        body: topicArea.description,
        meta: targetApp ? `Öffnet: ${targetApp.label}` : (topicRoute ? 'Öffnet Topic-Surface' : 'In Vorbereitung'),
        surfaceId: topicSurfaceId,
        route: topicRoute,
        interactive: Boolean(topicRoute),
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

  // --- START: Dynamic Factory Apps Section ---
  const dynamicApps = await fetchDynamicFactoryApps();
  console.log('[discoverability] Total apps loaded:', dynamicApps.length);
  console.log('[discoverability] Current dimension:', dimensionId);
  console.log('[discoverability] Sample app dimensions:', dynamicApps.slice(0, 3).map(a => a.dimension));
  
  // Aggressive filtering by dimension - CASE SENSITIVE!
  const dimensionApps = dynamicApps.filter((app) => app.dimension === dimensionId);
  console.log('[discoverability] Filtered apps for this dimension:', dimensionApps.length);

  if (dimensionApps.length > 0) {
    const factorySectionId = `factory-section-${dimensionId}`;
    let factorySection = root.querySelector(`#${factorySectionId}`);
    
    if (!factorySection) {
      factorySection = dom.createEl('section', {
        id: factorySectionId,
        className: 'dimension-surface-section mt-32',
        parent: root
      });

      dom.createEl('div', {
        className: 'section-eyebrow-left text-accent',
        text: 'Autonom gefertigte Apps (v5.3 Logic Enforcement)',
        parent: factorySection
      });
    }

    const factoryGrid = dom.createEl('div', {
      className: 'dimension-surface-grid mt-16',
      parent: factorySection
    });

    dimensionApps.forEach((app) => {
      const appTitle = app.name || app.module_name || 'Unbekanntes Modul';
      const cleanTitle = appTitle.replace(/^\d{8}_\d{6}_/, '').replace(/_module$/, '').replace(/_/g, ' ').toUpperCase();
      const rootPath = getLocalRepoRoot();

      createSurfaceCard(factoryGrid, {
        title: cleanTitle,
        body: 'Eigens für diese Dimension gefertigte Logik-Surface mit v5.3 Härtung.',
        meta: `Status: Deployed | Dimension: ${app.dimension}`,
        surfaceId: app.id,
        route: app.frontend_file,
        interactive: true,
        basePath: rootPath,
        onNavigate: (id) => {
          const target = `${rootPath}${app.frontend_file}`;
          window.location.href = target;
        }
      });
    });
  }
  // --- END: Dynamic Factory Apps Section ---

  return { root, model };
}
