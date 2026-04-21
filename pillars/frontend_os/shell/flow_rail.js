import { dom } from '../../../shared/ui/dom_utils.js';
import { getSurfaceJourney } from '../../../shared/application/frontend_os/discoverability_runtime.js';
import { getRepoRoot, nav } from '../navigation/index.js';

function createSurfaceLink(parent, surface, label, className) {
  if (!surface) return null;

  const link = dom.createEl('a', {
    className,
    text: label,
    attrs: {
      href: `${getRepoRoot()}${surface.route}`,
      'data-route': surface.id
    },
    style: {
      display: 'inline-flex',
      textDecoration: 'none'
    },
    parent
  });

  link.addEventListener('click', (event) => {
    event.preventDefault();
    nav.navigateTo(surface.id);
  });

  return link;
}

export function renderSurfaceFlowRail(containerId, surfaceId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const journey = getSurfaceJourney(surfaceId);
  if (!journey) {
    container.replaceChildren();
    return null;
  }

  container.replaceChildren();

  const card = dom.createEl('div', {
    className: 'glass-card text-center',
    parent: container
  });

  dom.createEl('div', {
    className: 'section-eyebrow-left',
    text: 'Produktfluss',
    parent: card
  });
  dom.createEl('h3', {
    className: 'card-title mb-16',
    text: journey.currentSurface.label,
    parent: card
  });
  dom.createEl('p', {
    className: 'text-secondary mb-20',
    text: journey.summary,
    parent: card
  });

  const actions = dom.createEl('div', {
    className: 'share-action-group__buttons',
    parent: card
  });

  createSurfaceLink(
    actions,
    journey.primaryTarget,
    journey.primaryTarget ? `Weiter: ${journey.primaryTarget.label}` : 'Weiter',
    'btn-primary share-action-group__primary'
  );
  createSurfaceLink(
    actions,
    journey.secondaryTarget,
    journey.secondaryTarget ? `Auch sinnvoll: ${journey.secondaryTarget.label}` : 'Alternative',
    'btn-secondary share-action-group__secondary'
  );

  return journey;
}
