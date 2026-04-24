/**
 * MBRN Factory Feed — Nexus Notification Panel
 * Reads nexus_notifications.json and renders the autonomous factory output
 * as a live feed section in the Dashboard.
 *
 * Architecture Note:
 *   - Fetches relative path from dashboard (works with local dev server or file://)
 *   - Gracefully degrades if file is missing or empty
 *   - No external dependencies — pure stdlib DOM
 */

const NOTIFICATIONS_PATH = '../../shared/data/nexus_notifications.json';
const MAX_ENTRIES = 5;

/**
 * Fetch nexus notifications from the local data file.
 * Returns an empty array on any error (graceful degradation).
 * @returns {Promise<Array>}
 */
async function fetchNexusNotifications() {
  try {
    const response = await fetch(NOTIFICATIONS_PATH, {
      cache: 'no-store' // Always fresh — factory runs while dashboard is open
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Format an ISO timestamp to a human-readable relative string.
 * @param {string} isoString
 * @returns {string}
 */
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
    return '—';
  }
}

/**
 * Get a ROI color class based on score.
 * @param {number} roi
 * @returns {string}
 */
function getRoiClass(roi) {
  if (roi >= 95) return 'factory-roi--elite';
  if (roi >= 90) return 'factory-roi--high';
  return 'factory-roi--normal';
}

/**
 * Render a single notification card.
 * @param {Object} n - notification object
 * @returns {string} HTML string
 */
function renderNotificationCard(n) {
  const time = formatRelativeTime(n.created_at);
  const roi = typeof n.roi_score === 'number' ? n.roi_score.toFixed(1) : '—';
  const roiClass = getRoiClass(n.roi_score);
  const heals = typeof n.self_heals === 'number' ? n.self_heals : 0;
  const attempts = typeof n.agent_attempts === 'number' ? n.agent_attempts : 1;
  const repoName = n.repo_name || '—';
  const moduleFile = n.module_file || '—';

  const healBadge = heals > 0
    ? `<span class="factory-badge factory-badge--heal" title="${heals} Self-Heal(s) applied">⟳ ${heals}×</span>`
    : `<span class="factory-badge factory-badge--clean">✓ Clean</span>`;

  return `
    <div class="factory-card" data-id="${n.id || ''}">
      <div class="factory-card__header">
        <span class="factory-card__icon">⚙</span>
        <span class="factory-card__repo">${repoName}</span>
        <span class="factory-card__time">${time}</span>
      </div>
      <div class="factory-card__meta">
        <span class="factory-roi ${roiClass}">ROI ${roi}</span>
        ${healBadge}
        <span class="factory-badge factory-badge--attempts">${attempts} Versuch${attempts !== 1 ? 'e' : ''}</span>
      </div>
      <div class="factory-card__file" title="${moduleFile}">
        <span class="factory-file-icon">📄</span>
        <code class="factory-filename">${moduleFile}</code>
      </div>
    </div>
  `.trim();
}

/**
 * Render the empty state when no notifications exist.
 * @returns {string}
 */
function renderEmptyState() {
  return `
    <div class="factory-empty">
      <span class="factory-empty__icon">🏭</span>
      <p class="factory-empty__text">Noch keine Module gefertigt.</p>
      <p class="factory-empty__hint">Starte Scout + Nexus — erste Ergebnisse erscheinen nach ca. 15 Min.</p>
    </div>
  `.trim();
}

/**
 * Build the complete Factory Feed HTML section.
 * @param {Array} notifications
 * @returns {string}
 */
function buildFactoryFeedHTML(notifications) {
  const entries = notifications.slice(0, MAX_ENTRIES);
  const unread = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  const unreadBadge = unread > 0
    ? `<span class="factory-unread-badge" id="factory-unread-count">${unread}</span>`
    : '';

  const cardsHTML = entries.length > 0
    ? entries.map(renderNotificationCard).join('')
    : renderEmptyState();

  const folderPathWin = 'C:\\DevLab\\MBRN-HUB-V1\\docs\\S3_Data\\outputs\\factory_ready';

  return `
    <section class="factory-feed-section reveal" id="factory-feed-section">
      <div class="factory-feed-header">
        <div class="factory-feed-title-row">
          <span class="factory-feed-icon">🏭</span>
          <h2 class="factory-feed-title">MBRN Factory Feed ${unreadBadge}</h2>
        </div>
        <p class="factory-feed-subtitle">
          Autonom gefertigte Module — Scout → Nexus → Sandbox → Produktion
        </p>
        <div class="factory-feed-stats">
          <span class="factory-stat">
            <span class="factory-stat__value" id="factory-total-count">${totalCount}</span>
            <span class="factory-stat__label">Module heute</span>
          </span>
          <span class="factory-stat">
            <span class="factory-stat__value" id="factory-unread-stat">${unread}</span>
            <span class="factory-stat__label">Neu (ungelesen)</span>
          </span>
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
          title="Öffne den factory_ready Ordner"
        >
          <span>📂</span> Module-Ordner öffnen
        </button>
        <button
          id="factory-refresh-btn"
          class="factory-action-btn factory-action-btn--secondary"
          onclick="window.__refreshFactoryFeed && window.__refreshFactoryFeed()"
          title="Feed aktualisieren"
        >
          <span>↻</span> Aktualisieren
        </button>
      </div>

      <p class="factory-feed-path">
        Ausgabe: <code>docs/S3_Data/outputs/factory_ready/</code>
      </p>
    </section>
  `.trim();
}

/**
 * Main render function — fetches data and injects the Factory Feed
 * into the specified container element.
 *
 * @param {string} containerId - ID of the target DOM element
 */
export async function renderFactoryFeed(containerId = 'factory-feed-root') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('[FactoryFeed] Container not found:', containerId);
    return;
  }

  // Loading state
  container.innerHTML = `
    <div class="factory-loading">
      <span class="factory-loading__dot"></span>
      <span class="factory-loading__dot"></span>
      <span class="factory-loading__dot"></span>
    </div>
  `;

  const notifications = await fetchNexusNotifications();
  container.innerHTML = buildFactoryFeedHTML(notifications);

  // Register global handlers (called from inline onclick — CSP-safe pattern)
  window.__openFactoryFolder = (folderPath) => {
    // In a local HTML context, we can't open native folders directly.
    // We copy the path to clipboard as the best available action.
    if (navigator.clipboard) {
      navigator.clipboard.writeText(folderPath).then(() => {
        _showFactoryToast('Pfad in Zwischenablage kopiert — füge ihn in den Explorer ein.');
      });
    } else {
      _showFactoryToast(`Ordner: ${folderPath}`);
    }
  };

  window.__refreshFactoryFeed = () => {
    renderFactoryFeed(containerId);
  };

  // Auto-refresh every 60 seconds while dashboard is open
  if (!window.__factoryFeedInterval) {
    window.__factoryFeedInterval = setInterval(() => {
      renderFactoryFeed(containerId);
    }, 60_000);
  }

  console.log(`[FactoryFeed] Rendered ${notifications.length} notification(s).`);
}

/**
 * Small toast notification — uses existing MBRN toast system if available,
 * falls back to a minimal inline toast.
 * @param {string} message
 */
function _showFactoryToast(message) {
  // Try existing MBRN toast
  if (window.__mbrnToast) {
    window.__mbrnToast(message);
    return;
  }
  // Minimal fallback
  const toast = document.createElement('div');
  toast.className = 'toast-notification toast-info';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}
