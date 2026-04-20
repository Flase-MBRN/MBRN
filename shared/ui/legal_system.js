import { LEGAL_LINKS, LEGAL_TEXTS } from '../core/legal_config.js';
import { clearMBRNLocalData } from '../core/legal_storage.js';
import { dom } from './dom_utils.js';

function resolveElement(target) {
  if (!target) return null;
  if (typeof target === 'string') {
    return document.getElementById(target);
  }
  return target;
}

function normalizeBasePath(basePath = '/') {
  if (!basePath) return '/';
  return basePath.endsWith('/') ? basePath : `${basePath}/`;
}

function joinWithBase(basePath, relativePath) {
  return `${normalizeBasePath(basePath)}${relativePath}`;
}

export function renderLegalNotice(container, variant = 'general') {
  const root = resolveElement(container);
  const notice = LEGAL_TEXTS[variant] || LEGAL_TEXTS.general;
  if (!root || !notice) return null;

  const card = dom.createEl('div', {
    className: 'legal-notice legal-card',
    parent: root
  });
  dom.createEl('span', {
    className: 'legal-notice-title',
    text: notice.title,
    parent: card
  });
  dom.createEl('p', {
    className: 'legal-notice-body',
    text: notice.body,
    parent: card
  });
  return card;
}

export function renderPolicyLinks(container, options = {}) {
  const root = resolveElement(container);
  const basePath = options.basePath || '/';
  if (!root) return null;

  const rail = dom.createEl('div', {
    className: `legal-links${options.compact ? ' legal-links-compact' : ''}`,
    parent: root
  });

  [
    { label: 'Impressum', href: joinWithBase(basePath, LEGAL_LINKS.impressum) },
    { label: 'Datenschutz', href: joinWithBase(basePath, LEGAL_LINKS.datenschutz) }
  ].forEach((item) => {
    dom.createEl('a', {
      className: 'legal-link',
      text: item.label,
      attrs: { href: item.href },
      parent: rail
    });
  });

  return rail;
}

export function renderLocalDataReset(container, options = {}) {
  const root = resolveElement(container);
  const basePath = options.basePath || '/';
  if (!root) return null;

  const wrap = dom.createEl('div', { className: 'legal-reset', parent: root });
  const status = dom.createEl('p', {
    className: 'legal-reset-status',
    text: '',
    parent: wrap
  });
  const button = dom.createEl('button', {
    className: 'btn-secondary legal-reset-button',
    text: options.label || 'Lokale Daten löschen',
    parent: wrap
  });

  const handleClick = () => {
    const result = clearMBRNLocalData();
    if (!result.success) {
      status.textContent = 'Löschen gerade nicht möglich.';
      return;
    }

    status.textContent = 'Lokale MBRN-Daten wurden gelöscht.';

    if (typeof options.onSuccess === 'function') {
      options.onSuccess(result);
      return;
    }

    if (options.redirectToHome) {
      window.location.href = joinWithBase(basePath, 'index.html');
      return;
    }

    if (options.reloadOnSuccess) {
      window.location.reload();
    }
  };

  button.addEventListener('click', handleClick);
  return wrap;
}

export function injectLegalBlock(target, options = {}) {
  const root = resolveElement(target);
  if (!root) return null;

  root.replaceChildren();

  const block = dom.createEl('div', {
    className: `legal-inline${options.className ? ` ${options.className}` : ''}`,
    parent: root
  });

  renderLegalNotice(block, options.variant || 'general');

  if (options.includePolicyLinks) {
    renderPolicyLinks(block, {
      basePath: options.basePath || '/',
      compact: options.compactLinks
    });
  }

  if (options.includeReset) {
    renderLocalDataReset(block, {
      basePath: options.basePath || '/',
      label: options.resetLabel,
      onSuccess: options.onResetSuccess,
      redirectToHome: options.redirectToHome,
      reloadOnSuccess: options.reloadOnSuccess
    });
  }

  return block;
}
