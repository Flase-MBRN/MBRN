import { readGoldDashboardItems } from '../../../shared/application/read_models/gold_enrichment.js';
import { dom } from '../../../shared/ui/dom_utils.js';

function formatPercent(value) {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${Math.round(numericValue * 100)}%`;
}

function formatDate(value) {
  if (!value) return 'Zeitpunkt offen';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Zeitpunkt offen';
  return parsed.toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function renderAuthRequired(root) {
  const panel = dom.createEl('div', {
    className: 'dimension-surface-placeholder mt-24',
    parent: root
  });
  dom.createEl('div', {
    className: 'section-eyebrow-left',
    text: 'Login erforderlich',
    parent: panel
  });
  dom.createEl('p', {
    className: 'text-secondary',
    text: 'Gold-Signale sind geschuetzt. Melde dich an, um die veredelten Markt- und News-Signale zu sehen.',
    parent: panel
  });
  const button = dom.createEl('button', {
    className: 'btn-primary mt-16',
    text: 'Zum Login',
    parent: panel
  });
  button.addEventListener('click', () => {
    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function renderEmpty(root) {
  const panel = dom.createEl('div', {
    className: 'dimension-surface-placeholder mt-24',
    parent: root
  });
  dom.createEl('div', {
    className: 'section-eyebrow-left',
    text: 'Noch keine Gold-Signale',
    parent: panel
  });
  dom.createEl('p', {
    className: 'text-secondary',
    text: 'Die Surface ist bereit. Sobald Woche-2-Veredelungen vorliegen, erscheinen sie hier.',
    parent: panel
  });
}

function renderGoldCard(parent, item) {
  const card = dom.createEl('article', {
    className: 'dimension-surface-card gold-signal-card is-static',
    parent
  });

  const header = dom.createEl('div', {
    className: 'gold-signal-card-header',
    parent: card
  });
  dom.createEl('span', {
    className: 'dimension-status-badge',
    text: item.recommendedAction.toUpperCase(),
    parent: header
  });
  dom.createEl('span', {
    className: 'dimension-surface-card-meta',
    text: formatDate(item.createdAt),
    parent: header
  });

  dom.createEl('h4', {
    className: 'dimension-surface-card-title',
    text: item.summary || 'Gold-Signal ohne Zusammenfassung',
    parent: card
  });

  const stats = dom.createEl('div', {
    className: 'data-grid compact mt-16',
    parent: card
  });
  dom.createEl('div', {
    className: 'card-grid-item-sm',
    text: `Score ${item.score}/100`,
    parent: stats
  });
  dom.createEl('div', {
    className: 'card-grid-item-sm',
    text: `Vertrauen ${formatPercent(item.confidence)}`,
    parent: stats
  });
  dom.createEl('div', {
    className: 'card-grid-item-sm',
    text: `${item.modelName} | ${item.analysisVersion}`,
    parent: stats
  });

  if (item.tags.length) {
    const tags = dom.createEl('div', {
      className: 'gold-signal-tags',
      parent: card
    });
    item.tags.forEach((tag) => {
      dom.createEl('span', {
        className: 'gold-signal-tag',
        text: tag,
        parent: tags
      });
    });
  }
}

export async function renderOracleSignalSurface(container) {
  container.replaceChildren();

  const root = dom.createEl('section', {
    className: 'glass-card dimension-view-card oracle-signal-surface',
    parent: container
  });

  dom.createEl('div', {
    className: 'section-eyebrow-left',
    text: 'Geld / Oracle & Signal',
    parent: root
  });
  dom.createEl('h3', {
    className: 'value-massive text-size-lg',
    text: 'Gold-Signale',
    parent: root
  });
  dom.createEl('p', {
    className: 'text-secondary mb-16',
    text: 'Veredelte Markt- und News-Signale aus der lokalen Llama-Schicht. Rohdaten bleiben intern.',
    parent: root
  });

  const loading = dom.createEl('p', {
    className: 'text-secondary mt-16',
    text: 'Gold-Signale werden geladen.',
    parent: root
  });
  const result = await readGoldDashboardItems({ limit: 12, sourceFamily: 'markets_news' });
  loading.remove();

  if (!result.success && result.status === 'auth_required') {
    renderAuthRequired(root);
    return { root, status: result.status };
  }

  if (!result.success) {
    const errorPanel = dom.createEl('div', {
      className: 'dimension-surface-placeholder mt-24',
      parent: root
    });
    dom.createEl('div', {
      className: 'section-eyebrow-left',
      text: 'Signal nicht verfuegbar',
      parent: errorPanel
    });
    dom.createEl('p', {
      className: 'text-secondary',
      text: result.error || 'Die Gold-Schicht konnte gerade nicht gelesen werden.',
      parent: errorPanel
    });
    return { root, status: result.status };
  }

  if (!result.data.length) {
    renderEmpty(root);
    return { root, status: result.status };
  }

  const grid = dom.createEl('div', {
    className: 'dimension-surface-grid mt-24',
    parent: root
  });
  result.data.forEach((item) => renderGoldCard(grid, item));
  return { root, status: result.status, count: result.data.length };
}
