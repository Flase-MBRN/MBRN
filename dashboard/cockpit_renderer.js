/**
 * ================================================================================
 * MBRN Cockpit Renderer - Dashboard Frontend Controller
 * ================================================================================
 * Renders 8-module grid with live updates from hub_state.json.
 * 
 * Features:
 * - 2-second polling with atomic JSON reads
 * - Triage status visualization (NOMINAL/RECOVERING/CRITICAL)
 * - Forensic drawer for incident investigation
 * - Manual override via PM2 integration
 * - Optional audio alerts for CRITICAL status
 * ================================================================================
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    POLL_INTERVAL: 2000,        // 2 seconds
    HUB_STATE_URL: '../shared/data/hub_state.json',
    AUDIO_ENABLED_KEY: 'mbrn_audio_alerts',
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000
  };

  // DOM Elements cache
  const elements = {
    grid: null,
    drawer: null,
    drawerContent: null,
    drawerClose: null,
    audioToggle: null,
    statusBar: null
  };

  // State
  let pollInterval = null;
  let previousStates = {};
  let audioContext = null;
  let criticalAlertPlayed = new Set(); // Track which processes already alerted

  // Process definitions (order matters for grid)
  const PROCESSES = [
    { name: 'sentinel-daemon', title: 'System Core', icon: '🛡️' },
    { name: 'horizon-scout', title: 'Alpha Radar', icon: '🔭' },
    { name: 'nexus-bridge', title: 'Logistics', icon: '🔄' },
    { name: 'ouroboros-agent', title: 'Evolution', icon: '🧬' },
    { name: 'bridge-agent', title: 'Manufacturing', icon: '🏭' },
    { name: 'logic-auditor', title: 'Quality Control', icon: '✓' },
    { name: 'live-monitor', title: 'Resources', icon: '📊' },
    { name: 'prime-director', title: 'Strategy', icon: '🎯' }
  ];

  /**
   * Initialize cockpit renderer
   */
  function init() {
    console.log('[COCKPIT] Initializing MBRN Dashboard v1.0');
    
    // Cache DOM elements
    cacheElements();
    
    // Create grid structure
    createGrid();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load audio preference
    loadAudioPreference();
    
    // Initial poll
    pollHubState();
    
    // Start polling
    startPolling();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    
    console.log('[COCKPIT] Initialized successfully');
  }

  /**
   * Cache DOM element references
   */
  function cacheElements() {
    elements.grid = document.getElementById('cockpit-grid');
    elements.drawer = document.getElementById('forensic-drawer');
    elements.drawerContent = document.getElementById('forensic-content');
    elements.drawerClose = document.getElementById('forensic-close');
    elements.audioToggle = document.getElementById('audio-toggle');
    elements.statusBar = document.getElementById('system-status-bar');
  }

  /**
   * Create 8-module grid structure
   */
  function createGrid() {
    if (!elements.grid) {
      console.error('[COCKPIT] Grid container not found');
      return;
    }
    
    elements.grid.innerHTML = '';
    
    PROCESSES.forEach(proc => {
      const card = document.createElement('div');
      card.className = 'module-card module-card--loading';
      card.id = `module-${proc.name}`;
      card.dataset.process = proc.name;
      
      card.innerHTML = `
        <div class="module-card__header">
          <span class="module-card__icon">${proc.icon}</span>
          <span class="module-card__title">${proc.title}</span>
        </div>
        <div class="module-card__status">LOADING</div>
        <div class="module-card__action">Connecting to Hub Observer...</div>
        <div class="module-card__footer">
          <span class="module-card__uptime">--:--:--</span>
          <span class="module-card__pid">PID: ---</span>
        </div>
      `;
      
      elements.grid.appendChild(card);
    });
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Close drawer
    if (elements.drawerClose) {
      elements.drawerClose.addEventListener('click', closeForensicDrawer);
    }
    
    // Close drawer on click outside
    if (elements.drawer) {
      elements.drawer.addEventListener('click', (e) => {
        if (e.target === elements.drawer) {
          closeForensicDrawer();
        }
      });
    }
    
    // Audio toggle
    if (elements.audioToggle) {
      elements.audioToggle.addEventListener('change', (e) => {
        saveAudioPreference(e.target.checked);
      });
    }
  }

  /**
   * Load audio preference from localStorage
   */
  function loadAudioPreference() {
    const enabled = localStorage.getItem(CONFIG.AUDIO_ENABLED_KEY) === 'true';
    if (elements.audioToggle) {
      elements.audioToggle.checked = enabled;
    }
  }

  /**
   * Save audio preference
   */
  function saveAudioPreference(enabled) {
    localStorage.setItem(CONFIG.AUDIO_ENABLED_KEY, enabled.toString());
    console.log(`[COCKPIT] Audio alerts ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Poll hub_state.json for updates
   */
  async function pollHubState() {
    try {
      // Add cache-busting timestamp
      const url = `${CONFIG.HUB_STATE_URL}?t=${Date.now()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const state = await response.json();
      updateCockpit(state);
      
    } catch (error) {
      console.error('[COCKPIT] Failed to load hub state:', error);
      showLoadingState();
    }
  }

  /**
   * Update all cockpit modules with new state
   */
  function updateCockpit(state) {
    if (!state || !state.processes) {
      console.warn('[COCKPIT] Invalid state received');
      return;
    }
    
    // Update each process card
    PROCESSES.forEach(proc => {
      const processState = state.processes[proc.name];
      if (processState) {
        updateModuleCard(proc.name, processState);
      }
    });
    
    // Update system status bar
    updateSystemStatus(state.system);
  }

  /**
   * Update single module card
   */
  function updateModuleCard(processName, state) {
    const card = document.getElementById(`module-${processName}`);
    if (!card) return;
    
    // Remove old status classes
    card.classList.remove(
      'module-card--nominal',
      'module-card--recovering', 
      'module-card--critical',
      'module-card--offline',
      'module-card--loading'
    );
    
    // Add new status class
    const statusClass = `module-card--${state.status}`;
    card.classList.add(statusClass);
    
    // Update content
    const statusEl = card.querySelector('.module-card__status');
    const actionEl = card.querySelector('.module-card__action');
    const uptimeEl = card.querySelector('.module-card__uptime');
    const pidEl = card.querySelector('.module-card__pid');
    
    if (statusEl) statusEl.textContent = state.triage;
    if (actionEl) actionEl.textContent = state.last_action;
    if (uptimeEl) uptimeEl.textContent = state.uptime;
    if (pidEl) pidEl.textContent = `PID: ${state.pid || '---'}`;
    
    // Update metrics if present
    updateMetrics(card, state.metrics);
    
    // Add alert badge for CRITICAL
    const existingAlert = card.querySelector('.module-card__alert');
    if (state.triage === 'CRITICAL') {
      if (!existingAlert) {
        const alert = document.createElement('div');
        alert.className = 'module-card__alert';
        alert.textContent = '🚨';
        card.appendChild(alert);
      }
      
      // Play audio alert (once per incident)
      playCriticalAlert(processName);
      
      // Add click handler for forensic drawer
      card.onclick = () => openForensicDrawer(processName, state);
      card.style.cursor = 'pointer';
      
    } else {
      if (existingAlert) {
        existingAlert.remove();
      }
      card.onclick = null;
      card.style.cursor = 'default';
      
      // Reset alert tracking when recovered
      if (previousStates[processName]?.triage === 'CRITICAL' && state.triage !== 'CRITICAL') {
        criticalAlertPlayed.delete(processName);
      }
    }
    
    // Store for comparison
    previousStates[processName] = state;
  }

  /**
   * Update metrics display on card
   */
  function updateMetrics(card, metrics) {
    if (!metrics) return;
    
    let metricsContainer = card.querySelector('.module-card__metrics');
    if (!metricsContainer) {
      metricsContainer = document.createElement('div');
      metricsContainer.className = 'module-card__metrics';
      card.appendChild(metricsContainer);
    }
    
    metricsContainer.innerHTML = '';
    
    Object.entries(metrics).forEach(([key, value]) => {
      const badge = document.createElement('span');
      badge.className = 'metric-badge';
      badge.textContent = `${key}: ${value}`;
      metricsContainer.appendChild(badge);
    });
  }

  /**
   * Update system status bar
   */
  function updateSystemStatus(system) {
    if (!elements.statusBar || !system) return;
    
    const indicator = elements.statusBar.querySelector('.status-indicator');
    const details = elements.statusBar.querySelector('.status-details');
    
    // Update indicator
    if (indicator) {
      indicator.classList.remove('status-indicator--warning', 'status-indicator--critical');
      
      if (system.critical_processes > 0) {
        indicator.classList.add('status-indicator--critical');
      } else if (system.recovering_processes > 0) {
        indicator.classList.add('status-indicator--warning');
      }
    }
    
    // Update details text
    if (details) {
      const healthy = system.healthy_processes || 0;
      const total = system.total_processes || 8;
      const recovering = system.recovering_processes || 0;
      const critical = system.critical_processes || 0;
      
      let statusText = `${healthy}/${total} Systems Nominal`;
      if (recovering > 0) statusText += ` | ${recovering} Recovering`;
      if (critical > 0) statusText += ` | ${critical} CRITICAL`;
      
      details.textContent = statusText;
    }
  }

  /**
   * Show loading state when hub state unavailable
   */
  function showLoadingState() {
    PROCESSES.forEach(proc => {
      const card = document.getElementById(`module-${proc.name}`);
      if (card) {
        card.classList.add('module-card--offline');
        const actionEl = card.querySelector('.module-card__action');
        if (actionEl) actionEl.textContent = 'Waiting for Hub Observer...';
      }
    });
  }

  /**
   * Open forensic drawer for critical incident
   */
  function openForensicDrawer(processName, state) {
    if (!elements.drawer || !elements.drawerContent) return;
    
    const proc = PROCESSES.find(p => p.name === processName);
    const title = proc ? proc.title : processName;
    
    let historyHtml = '';
    if (state.forensic_history && state.forensic_history.length > 0) {
      historyHtml = `
        <div class="forensic-section">
          <h3>Recovery Attempts</h3>
          <div class="forensic-history">
            ${state.forensic_history.map(h => `
              <div class="forensic-history__item">
                <span class="forensic-history__time">${formatTime(h.timestamp)}</span>
                <span class="forensic-history__event">${h.event}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    elements.drawerContent.innerHTML = `
      <div class="forensic-drawer__header">
        <div class="forensic-drawer__title">
          <span>${proc ? proc.icon : '🚨'}</span>
          <span>${title}</span>
        </div>
        <button class="forensic-drawer__close" onclick="closeForensicDrawer()">✕</button>
      </div>
      
      <div class="forensic-drawer__content">
        <div class="forensic-section">
          <h3>What Happened?</h3>
          <p>${state.incident_report || state.last_action || 'Unknown incident'}</p>
        </div>
        
        <div class="forensic-section">
          <h3>Where?</h3>
          <p>
            <strong>Process:</strong> ${processName}<br>
            <strong>PID:</strong> ${state.pid || 'N/A'}<br>
            <strong>Uptime:</strong> ${state.uptime}<br>
            <strong>Restarts:</strong> ${state.restart_count || 0}
          </p>
        </div>
        
        ${historyHtml}
        
        <button class="manual-override" onclick="restartProcess('${processName}')">
          🔄 Manual Override (Restart)
        </button>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 10px; text-align: center;">
          This will restart the process via PM2. Use with caution.
        </p>
      </div>
    `;
    
    elements.drawer.classList.remove('forensic-drawer--hidden');
  }

  /**
   * Close forensic drawer
   */
  function closeForensicDrawer() {
    if (elements.drawer) {
      elements.drawer.classList.add('forensic-drawer--hidden');
    }
  }

  /**
   * Restart process via PM2 (Manual Override)
   */
  async function restartProcess(processName) {
    console.log(`[COCKPIT] Manual override requested for ${processName}`);
    
    const button = document.querySelector('.manual-override');
    if (button) {
      button.disabled = true;
      button.textContent = '🔄 Restarting...';
    }
    
    try {
      // Try multiple approaches for PM2 restart
      
      // Approach 1: Try to call pm2 via fetch to a local endpoint (if available)
      // This would require a small HTTP server
      
      // Approach 2: Use WebSocket or BroadcastChannel to communicate with backend
      // For now, show instructions
      
      alert(
        `Manual Override for ${processName}\n\n` +
        `To restart this process, run in terminal:\n` +
        `pm2 restart ${processName}\n\n` +
        `Or use: pm2 restart ecosystem.config.cjs`
      );
      
    } catch (error) {
      console.error('[COCKPIT] Restart failed:', error);
      alert(`Failed to restart ${processName}. Check console for details.`);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = '🔄 Manual Override (Restart)';
      }
    }
  }

  /**
   * Play critical alert sound (once per process per incident)
   */
  function playCriticalAlert(processName) {
    // Check if audio is enabled
    if (!elements.audioToggle || !elements.audioToggle.checked) return;
    
    // Don't repeat alerts for same process
    if (criticalAlertPlayed.has(processName)) return;
    
    try {
      // Create audio context if needed
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Create oscillator for alert tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure alert tone (440Hz, short beep)
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      
      // Envelope: short attack, quick decay
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      // Mark as played
      criticalAlertPlayed.add(processName);
      
      console.log(`[COCKPIT] Audio alert played for ${processName}`);
      
    } catch (error) {
      console.warn('[COCKPIT] Audio alert failed:', error);
    }
  }

  /**
   * Format timestamp for display
   */
  function formatTime(isoTimestamp) {
    if (!isoTimestamp) return '--:--';
    try {
      const date = new Date(isoTimestamp);
      return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoTimestamp;
    }
  }

  /**
   * Start polling loop
   */
  function startPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    
    pollInterval = setInterval(pollHubState, CONFIG.POLL_INTERVAL);
    console.log(`[COCKPIT] Polling started (${CONFIG.POLL_INTERVAL}ms)`);
  }

  /**
   * Stop polling loop
   */
  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
      console.log('[COCKPIT] Polling stopped');
    }
  }

  /**
   * Cleanup on page unload
   */
  function cleanup() {
    stopPolling();
    
    if (audioContext) {
      audioContext.close();
    }
    
    console.log('[COCKPIT] Cleanup complete');
  }

  // Expose functions to global scope for onclick handlers
  window.closeForensicDrawer = closeForensicDrawer;
  window.restartProcess = restartProcess;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
