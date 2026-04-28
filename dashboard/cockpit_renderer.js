/**
 * ================================================================================
 * MBRN COCKPIT RENDERER v2.5 - Decision-Aware (Prime Director v2)
 * ================================================================================
 */

(function() {
  'use strict';

  const CONFIG = {
    POLL_INTERVAL: 2000,
    DIAMONDS_URL: './diamonds.json',
    DECISIONS_URL: '../docs/S3_Data/outputs/prime_decisions.json',
    HUB_STATE_URL: '../shared/data/hub_state.json'
  };

  const PROCESSES = [
    { id: 'sentinel-daemon', name: 'Sentinel', icon: '🛡️' },
    { id: 'horizon-scout', name: 'Scout', icon: '🔭' },
    { id: 'nexus-bridge', name: 'Nexus', icon: '🔄' },
    { id: 'prime-director', name: 'Director', icon: '🧠' },
    { id: 'bridge-agent', name: 'Bridge', icon: '🏭' },
    { id: 'logic-auditor', name: 'Auditor', icon: '✓' },
    { id: 'live-monitor', name: 'Monitor', icon: '📊' },
    { id: 'prime-director', name: 'Director', icon: '🎯' } // Fallback/Director logic
  ];

  const elements = {
    topDiamondName: document.getElementById('top-diamond-name'),
    diamondFeed: document.getElementById('diamond-feed'),
    feedCount: document.getElementById('feed-count'),
    systemGrid: document.getElementById('system-grid'),
    actionCenter: document.querySelector('.action-stack')
  };

  let topDiamond = null;
  let currentDecisions = {};

  async function fetchJSON(url) {
    try {
      const response = await fetch(`${url}?t=${Date.now()}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) { return null; }
  }

  function initGrid() {
    elements.systemGrid.innerHTML = '';
    PROCESSES.forEach(proc => {
      if (document.getElementById(`proc-${proc.id}`)) return; // Avoid duplicates
      const card = document.createElement('div');
      card.className = 'proc-card';
      card.id = `proc-${proc.id}`;
      card.innerHTML = `
        <div class="proc-header">
          <span class="proc-name">${proc.icon} ${proc.name}</span>
          <div class="proc-status-dot" id="dot-${proc.id}"></div>
        </div>
        <div class="proc-action" id="action-${proc.id}">Connecting...</div>
        <div class="proc-footer">
          <span id="uptime-${proc.id}">00:00:00</span>
          <span id="pid-${proc.id}">PID: ---</span>
        </div>
      `;
      elements.systemGrid.appendChild(card);
    });
  }

  function updateGrid(hubState) {
    if (!hubState || !hubState.processes) return;
    PROCESSES.forEach(proc => {
      const state = hubState.processes[proc.id];
      const dot = document.getElementById(`dot-${proc.id}`);
      const action = document.getElementById(`action-${proc.id}`);
      const uptime = document.getElementById(`uptime-${proc.id}`);
      const pid = document.getElementById(`pid-${proc.id}`);

      if (state && dot) {
        const isOnline = state.status === 'nominal' || state.pm2_status === 'online';
        dot.className = 'proc-status-dot ' + (isOnline ? 'online' : 'offline');
        if (action) action.textContent = (state.last_action || 'Idle').replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
        if (uptime) uptime.textContent = state.uptime || '00:00:00';
        if (pid) pid.textContent = `PID: ${state.pid || '---'}`;
      }
    });
  }

  function renderFeed(diamonds, decisions) {
    if (!diamonds) return;
    
    const list = Array.isArray(diamonds) ? diamonds : [diamonds];
    const modules = list.filter(d => d && d.name);

    // Map decisions
    const decMap = {};
    if (Array.isArray(decisions)) {
      decisions.forEach(d => decMap[d.module] = d);
    }
    currentDecisions = decMap;

    elements.feedCount.textContent = `(${modules.length} VERIFIED)`;

    if (modules.length > 0) {
      topDiamond = modules[0];
      const verdict = decMap[topDiamond.name]?.decision || 'evaluating';
      elements.topDiamondName.innerHTML = `${topDiamond.name.replace('_module.py', '').replace(/_/g, ' ')} <br><span style="font-size: 0.9rem; color: var(--neon-gold)">VERDICT: ${verdict.toUpperCase()}</span>`;
    } else {
      elements.topDiamondName.textContent = "WAITING FOR VERIFIED ALPHA...";
    }

    elements.diamondFeed.innerHTML = '';
    modules.slice(0, 10).forEach(mod => {
      const dec = decMap[mod.name];
      const verdictClass = dec ? `verdict-${dec.decision}` : 'verdict-none';
      const verdictText = dec ? dec.decision.replace('_', ' ').toUpperCase() : 'EVALUATING';
      
      const combinedScore = mod.score || 0;
      const moneyScore = mod.money_score || 0;
      const roiScore = mod.roi_score || 0;
      const risk = mod.risk || 'low';
      const suggestedUse = mod.suggested_use || 'General utility.';
      const reason = mod.reason || 'High potential.';
      
      // Badges
      let extraBadges = '';
      if (mod.is_test) extraBadges += '<span class="verdict-badge verdict-reject">TEST</span> ';
      if (moneyScore >= 60) extraBadges += '<span class="verdict-badge verdict-prepare">MONEY</span> ';
      if (combinedScore >= 75) extraBadges += '<span class="verdict-badge verdict-prepare">TOP</span> ';
      if (risk === 'medium') extraBadges += '<span class="verdict-badge verdict-needs_review">MED-RISK</span> ';
      if (risk === 'high') extraBadges += '<span class="verdict-badge verdict-reject">HIGH-RISK</span> ';

      const card = document.createElement('div');
      card.className = 'diamond-card fade-in';
      card.innerHTML = `
        <div class="card-info">
          <div class="score-circle" title="Combined Score">${combinedScore}%</div>
          <div class="card-meta">
            <h3>${mod.name.replace('_module.py', '').replace('GH: ', '').replace('SEED: ', '')}</h3>
            <div class="badge-row">
              <span class="verdict-badge ${verdictClass}">${verdictText}</span>
              ${extraBadges}
            </div>
            <div class="score-row" style="font-size: 0.75rem; color: var(--neon-silver); margin-top: 4px;">
              <span>ROI: ${roiScore}%</span> | <span>MONEY: ${moneyScore}%</span> | <span>${mod.app.toUpperCase()}</span>
            </div>
            <p style="font-size: 0.8rem; margin-top: 6px; color: var(--neon-gold)">${suggestedUse.substring(0, 80)}${suggestedUse.length > 80 ? '...' : ''}</p>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-premium" onclick="window.open('../${mod.file_path}', '_blank')">Öffnen</button>
          ${dec && dec.decision === 'prepare_integration' ? `<button class="btn-premium gold" onclick="window.openPlan('${mod.name}')">Plan</button>` : ''}
        </div>
      `;
      elements.diamondFeed.appendChild(card);
    });
  }

  async function updateCycle() {
    const diamonds = await fetchJSON(CONFIG.DIAMONDS_URL);
    const hubState = await fetchJSON(CONFIG.HUB_STATE_URL);
    const decisions = await fetchJSON(CONFIG.DECISIONS_URL);
    renderFeed(diamonds, decisions);
    updateGrid(hubState);
  }

  window.openTopModule = function() {
    if (topDiamond) {
      window.open(`../${topDiamond.file_path}`, '_blank');
    } else {
      alert("No verified module in queue.");
    }
  };

  window.openPlan = function(moduleName) {
    window.open(`../docs/S3_Data/outputs/integration_plans/${moduleName}.md`, '_blank');
  };

  window.convertToTool = function() {
    if (topDiamond) {
      alert(`Converting ${topDiamond.name} to core MBRN tool...`);
    } else {
      alert("No target available.");
    }
  };

  function init() {
    console.log('🧬 MBRN Cockpit v2.5 (Decision-Aware) Initializing...');
    initGrid();
    updateCycle();
    setInterval(updateCycle, CONFIG.POLL_INTERVAL);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
