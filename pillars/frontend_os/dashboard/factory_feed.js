/**
 * MBRN Factory Feed - SQLite/Supabase hybrid panel.
 * Supabase Edge is the browser path; local JSON is a read-only snapshot fallback.
 */

const SNAPSHOT_PATH = '../../shared/data/factory_feed_snapshot.json';
const LEGACY_NOTIFICATIONS_PATH = '../../shared/data/nexus_notifications.json';
const FACTORY_FEED_EDGE_URL = window.MBRN_FACTORY_FEED_URL || '';
const FACTORY_CONTROL_EDGE_URL = window.MBRN_FACTORY_CONTROL_URL || '';
const FACTORY_CONTROL_ADMIN_TOKEN = window.MBRN_FACTORY_ADMIN_TOKEN || '';
const MAX_ENTRIES = 5;

function normalizeFeedItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    id: item.id || item.name || item.module_name || item.module_file,
    repo_name: item.repo_name || item.name || item.module_name || 'factory-module',
    module_file: item.module_file || item.frontend_file || item.module_name || item.name || 'index.html',
    roi_score: typeof item.roi_score === 'number' ? item.roi_score : Number(item.quality_score || 0),
    agent_attempts: item.agent_attempts || 1,
    self_heals: item.self_heals || 0,
    read: Boolean(item.read),
    created_at: item.created_at || new Date().toISOString()
  }));
}

async function fetchJsonList(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    return normalizeFeedItems(Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}

async function fetchNexusNotifications() {
  if (FACTORY_FEED_EDGE_URL) {
    const edgeItems = await fetchJsonList(FACTORY_FEED_EDGE_URL);
    if (edgeItems.length) return edgeItems;
  }
  const snapshotItems = await fetchJsonList(SNAPSHOT_PATH);
  if (snapshotItems.length) return snapshotItems;
  return fetchJsonList(LEGACY_NOTIFICATIONS_PATH);
}

async function fetchFactoryPausedState() {
  if (!FACTORY_CONTROL_EDGE_URL) return null;
  try {
    const response = await fetch(FACTORY_CONTROL_EDGE_URL, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return Boolean(data.factory_paused);
  } catch {
    return null;
  }
}

async function setFactoryPausedState(paused) {
  if (!FACTORY_CONTROL_EDGE_URL) return null;
  const headers = { 'Content-Type': 'application/json' };
  if (FACTORY_CONTROL_ADMIN_TOKEN) {
    headers['x-mbrn-admin-token'] = FACTORY_CONTROL_ADMIN_TOKEN;
  }
  const response = await fetch(FACTORY_CONTROL_EDGE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ factory_paused: paused })
  });
  if (!response.ok) throw new Error('factory-control request failed');
  const data = await response.json();
  return Boolean(data.factory_paused);
}

function formatRelativeTime(isoString) {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'gerade eben';
    if (mins < 60) return `vor ${mins} Min.`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    return `vor ${Math.floor(hours / 24)} Tag(en)`;
  } catch {
    return '-';
  }
}

function getRoiClass(roi) {
  if (roi >= 95) return 'factory-roi--elite';
  if (roi >= 90) return 'factory-roi--high';
  return 'factory-roi--normal';
}

function renderNotificationCard(n) {
  const time = formatRelativeTime(n.created_at);
  const roi = typeof n.roi_score === 'number' && n.roi_score > 0 ? n.roi_score.toFixed(1) : '-';
  const roiClass = getRoiClass(n.roi_score);
  const heals = typeof n.self_heals === 'number' ? n.self_heals : 0;
  const attempts = typeof n.agent_attempts === 'number' ? n.agent_attempts : 1;
  const repoName = n.repo_name || '-';
  const moduleFile = n.module_file || '-';
  const healBadge = heals > 0
    ? `<span class="factory-badge factory-badge--heal" title="${heals} Self-Heal(s) applied">${heals}x Heal</span>`
    : `<span class="factory-badge factory-badge--clean">Clean</span>`;

  return `
    <div class="factory-card" data-id="${n.id || ''}">
      <div class="factory-card__header">
        <span class="factory-card__icon">Factory</span>
        <span class="factory-card__repo">${repoName}</span>
        <span class="factory-card__time">${time}</span>
      </div>
      <div class="factory-card__meta">
        <span class="factory-roi ${roiClass}">ROI ${roi}</span>
        ${healBadge}
        <span class="factory-badge factory-badge--attempts">${attempts} Versuch${attempts !== 1 ? 'e' : ''}</span>
      </div>
      <div class="factory-card__file" title="${moduleFile}">
        <span class="factory-file-icon">File</span>
        <code class="factory-filename">${moduleFile}</code>
      </div>
    </div>
  `.trim();
}

function renderEmptyState() {
  return `
    <div class="factory-empty">
      <span class="factory-empty__icon">Factory</span>
      <p class="factory-empty__text">Noch keine Module gefertigt.</p>
      <p class="factory-empty__hint">Scout, Nexus und Bridge schreiben zuerst in SQLite.</p>
    </div>
  `.trim();
}

function buildFactoryFeedHTML(notifications, controlState = null) {
  const entries = notifications.slice(0, MAX_ENTRIES);
  const unread = notifications.filter((n) => !n.read).length;
  const totalCount = notifications.length;
  const unreadBadge = unread > 0
    ? `<span class="factory-unread-badge" id="factory-unread-count">${unread}</span>`
    : '';
  const cardsHTML = entries.length > 0
    ? entries.map(renderNotificationCard).join('')
    : renderEmptyState();
  const folderPathWin = 'C:\\DevLab\\MBRN-HUB-V1\\docs\\S3_Data\\outputs\\factory_ready';
  const controlLabel = controlState === true ? 'Factory pausiert' : 'Factory aktiv';
  const controlDisabled = FACTORY_CONTROL_EDGE_URL ? '' : 'disabled';
  const controlChecked = controlState === true ? 'checked' : '';

  return `
    <section class="factory-feed-section reveal" id="factory-feed-section">
      <div class="factory-feed-header">
        <div class="factory-feed-title-row">
          <span class="factory-feed-icon">Factory</span>
          <h2 class="factory-feed-title">MBRN Factory Feed ${unreadBadge}</h2>
        </div>
        <p class="factory-feed-subtitle">
          Autonom gefertigte Module - Scout -> Nexus -> SQLite -> Bridge -> Frontend
        </p>
        <div class="factory-feed-stats">
          <span class="factory-stat">
            <span class="factory-stat__value" id="factory-total-count">${totalCount}</span>
            <span class="factory-stat__label">Module heute</span>
          </span>
          <span class="factory-stat">
            <span class="factory-stat__value" id="factory-unread-stat">${unread}</span>
            <span class="factory-stat__label">Neu</span>
          </span>
          <label class="factory-stat" title="Remote Kill-Switch">
            <input
              id="factory-paused-toggle"
              type="checkbox"
              ${controlChecked}
              ${controlDisabled}
              onchange="window.__setFactoryPaused && window.__setFactoryPaused(this.checked)"
            >
            <span class="factory-stat__label">${controlLabel}</span>
          </label>
        </div>
      </div>

      <div class="factory-cards-grid" id="factory-cards-grid">
        ${cardsHTML}
      </div>

      <div class="factory-feed-actions">
        <button
          id="factory-open-folder-btn"
          class="factory-action-btn factory-action-btn--primary"
          data-folder="${folderPathWin}"
          onclick="window.__openFactoryFolder && window.__openFactoryFolder(this.dataset.folder)"
          title="Oeffne den factory_ready Ordner"
        >
          Module-Ordner oeffnen
        </button>
        <button
          id="factory-refresh-btn"
          class="factory-action-btn factory-action-btn--secondary"
          onclick="window.__refreshFactoryFeed && window.__refreshFactoryFeed()"
          title="Feed aktualisieren"
        >
          Aktualisieren
        </button>
      </div>

      <p class="factory-feed-path">
        Ausgabe: <code>shared/data/mbrn_state.db</code> + <code>shared/data/factory_feed_snapshot.json</code>
      </p>
    </section>
  `.trim();
}

export async function renderFactoryFeed(containerId = 'factory-feed-root') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('[FactoryFeed] Container not found:', containerId);
    return;
  }

  container.innerHTML = `
    <div class="factory-loading">
      <span class="factory-loading__dot"></span>
      <span class="factory-loading__dot"></span>
      <span class="factory-loading__dot"></span>
    </div>
  `;

  const [notifications, controlState] = await Promise.all([
    fetchNexusNotifications(),
    fetchFactoryPausedState()
  ]);
  container.innerHTML = buildFactoryFeedHTML(notifications, controlState);

  window.__openFactoryFolder = (folderPath) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(folderPath).then(() => {
        _showFactoryToast('Pfad in Zwischenablage kopiert.');
      });
    } else {
      _showFactoryToast(`Ordner: ${folderPath}`);
    }
  };

  window.__refreshFactoryFeed = () => {
    renderFactoryFeed(containerId);
  };

  window.__setFactoryPaused = async (paused) => {
    try {
      await setFactoryPausedState(paused);
      _showFactoryToast(paused ? 'Factory pausiert.' : 'Factory aktiviert.');
      renderFactoryFeed(containerId);
    } catch {
      _showFactoryToast('Factory-Control ist nicht erreichbar.');
      renderFactoryFeed(containerId);
    }
  };

  if (!window.__factoryFeedInterval) {
    window.__factoryFeedInterval = setInterval(() => {
      renderFactoryFeed(containerId);
    }, 60_000);
  }

  console.log(`[FactoryFeed] Rendered ${notifications.length} notification(s).`);
}

function _showFactoryToast(message) {
  if (window.__mbrnToast) {
    window.__mbrnToast(message);
    return;
  }
  const toast = document.createElement('div');
  toast.className = 'toast-notification toast-info';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

