import { getDimensionSurfaceModel } from '../../../shared/application/frontend_os/discoverability_runtime.js';
import { dom } from '../../../shared/ui/dom_utils.js';
import { registry } from '../../../shared/application/registry_bridge.js';
import { widgetRegistry } from '../../../shared/ui/widget_api.js';

function getDimensionStatusLabel(id) {
  const dims = registry.getDimensions();
  const dim = dims.find(d => d.id === id);
  if (!dim) return 'In Vorbereitung';
  
  if (dim.state === 'active') return 'Aktiv';
  if (dim.state === 'provisional') return 'Im Ausbau';
  return 'In Vorbereitung';
}

function getDimensionMeta(model) {
  if (!model) return 'System-Kern';
  const details = [];
  if (model.topicAreas?.length) details.push(`${model.topicAreas.length} Themen`);
  if (model.apps?.length) details.push(`${model.apps.length} Apps`);
  return details.join(' · ') || 'System-Kern';
}

export async function renderDashboardDimensionCards(containerId = 'dashboard-dimension-grid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.replaceChildren();
  
  const dimensions = registry.getDimensions();

  for (const entry of dimensions) {
    const model = getDimensionSurfaceModel(entry.id);
    
    const card = dom.createEl('div', {
      className: 'dashboard-dimension-card',
      attrs: { 'data-dimension': entry.id },
      parent: container
    });

    const header = dom.createEl('div', {
      className: 'dimension-card-header',
      parent: card
    });

    dom.createEl('div', {
      className: 'app-icon',
      text: entry.id.charAt(0).toUpperCase(),
      parent: header
    });

    dom.createEl('span', {
      className: 'dimension-status-badge',
      text: getDimensionStatusLabel(entry.id),
      parent: header
    });

    const link = dom.createEl('a', {
      className: 'dashboard-dimension-title-link',
      attrs: { href: `../dimensions/${entry.id}/index.html` },
      parent: card
    });

    dom.createEl('h4', {
      className: 'dashboard-dimension-title',
      text: entry.id.charAt(0).toUpperCase() + entry.id.slice(1),
      parent: link
    });

    dom.createEl('p', {
      className: 'text-secondary dimension-card-copy',
      text: entry.description || '',
      parent: card
    });

    // WIDGET SLOT
    const widgetSlot = dom.createEl('div', {
      className: 'dimension-widget-slot',
      attrs: { 'id': `widget-slot-${entry.id}` },
      parent: card
    });

    // Try to load widget if primary app exists
    if (entry.primary_app) {
      try {
        const widgetModule = await import(`../../../apps/${entry.primary_app}/widget.js?t=${Date.now()}`).catch(() => null);
        if (widgetModule && widgetModule.Widget) {
          const widget = new widgetModule.Widget(entry.primary_app, entry.id);
          await widget.onMount(widgetSlot);
        }
      } catch (e) {
        // Silent fail for widgets (optional)
        console.debug(`[Dashboard] No widget for ${entry.primary_app}`);
      }
    }

    dom.createEl('p', {
      className: 'text-secondary status-text dimension-card-meta',
      text: getDimensionMeta(model ?? null),
      parent: card
    });
  }
}
