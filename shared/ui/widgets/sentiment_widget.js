/**
 * /shared/ui/widgets/sentiment_widget.js
 * Markt-Vibe ohne Technik-Sprech.
 */

import { supabase } from '../../core/supabase_client.js';
import { api } from '../../core/api.js';
import { animateValue, dom } from '../dom_utils.js';
import { MBRN_CONFIG } from '../../core/config.js';

function getVerdictLabel(score) {
  const { EXTREME_GREED, GREED, NEUTRAL, FEAR } = MBRN_CONFIG.sentiment.thresholds;
  if (score >= EXTREME_GREED) return 'Sehr aufgedreht';
  if (score >= GREED) return 'Mutig';
  if (score >= NEUTRAL) return 'Neutral';
  if (score >= FEAR) return 'Vorsichtig';
  return 'Unruhig';
}

export const sentimentWidget = {
  channel: null,
  currentScore: 50,
  dataSource: 'cloud',
  _timers: [],

  init(containerId = 'sentiment-widget') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.setupRealtime();
    this.fetchInitialData();
  },

  render() {
    const template = `
      <div class="glass-card text-center">
        <h3 class="section-eyebrow-left">Markt-Vibe</h3>
        <p class="text-secondary mb-24">Das zeigt grob, wie entspannt oder nervoes die Welt gerade unterwegs ist.</p>

        <div class="sentiment-container">
          <svg class="sentiment-ring-svg" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" stroke-width="12"/>
            <circle id="sentiment-ring" cx="80" cy="80" r="70" fill="none"
                    stroke="var(--accent)" stroke-width="12" stroke-linecap="round"
                    stroke-dasharray="440" stroke-dashoffset="220"/>
          </svg>

          <div class="sentiment-score-center">
            <span id="sentiment-score" class="value-massive sentiment-score-massive">50</span>
          </div>
        </div>

        <div id="sentiment-verdict" class="sentiment-verdict">Neutral</div>
      </div>
    `;

    this.container.insertAdjacentHTML('beforeend', template);
  },

  setupRealtime() {
    if (!api.client) return;

    this.channel = supabase
      .channel('market_sentiment')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'market_sentiment' },
        (payload) => {
          this.handleNewData(payload.new);
        }
      )
      .subscribe();
  },

  handleNewData(data) {
    if (!data || typeof data.sentiment_score !== 'number') return;

    const newScore = Math.round(data.sentiment_score);
    const verdict = data.verdict || getVerdictLabel(newScore);

    const scoreEl = document.getElementById('sentiment-score');
    if (scoreEl) {
      animateValue(scoreEl, this.currentScore, newScore, 1500, '', (value) => Math.round(value));
    }

    this.updateRing(newScore);

    const verdictEl = document.getElementById('sentiment-verdict');
    if (verdictEl) {
      verdictEl.textContent = `${newScore} - ${verdict}`;
      verdictEl.className = 'sentiment-verdict ' + this.getScoreClass(newScore);
    }

    const card = this.container.querySelector('.glass-card');
    if (card) {
      card.classList.add('pulse-glow');
      const timerId = setTimeout(() => card.classList.remove('pulse-glow'), 600);
      this._timers.push(timerId);
    }

    this.currentScore = newScore;
  },

  updateRing(score) {
    const ring = document.getElementById('sentiment-ring');
    if (!ring) return;

    const circumference = 440;
    const offset = circumference - (score / 100) * circumference;
    ring.style.setProperty('--ring-offset', offset);
    ring.setAttribute('stroke', this.getScoreColor(score));
  },

  getScoreColor(score) {
    const { EXTREME_GREED, GREED, NEUTRAL, FEAR } = MBRN_CONFIG.sentiment.thresholds;
    if (score >= EXTREME_GREED) return 'var(--accent)';
    if (score >= GREED) return 'var(--success)';
    if (score >= NEUTRAL) return 'var(--text-secondary)';
    if (score >= FEAR) return 'var(--warning)';
    return 'var(--error)';
  },

  getScoreClass(score) {
    const { EXTREME_GREED, GREED, NEUTRAL, FEAR } = MBRN_CONFIG.sentiment.thresholds;
    if (score >= EXTREME_GREED) return 'sentiment-verdict-extreme-greed';
    if (score >= GREED) return 'sentiment-verdict-greed';
    if (score >= NEUTRAL) return 'sentiment-verdict-neutral';
    if (score >= FEAR) return 'sentiment-verdict-fear';
    return 'sentiment-verdict-extreme-fear';
  },

  async fetchInitialData() {
    const CLOUD_TIMEOUT = 2000;
    const supabasePromise = this.fetchFromSupabase();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), CLOUD_TIMEOUT));

    try {
      const cloudData = await Promise.race([supabasePromise, timeoutPromise]);
      if (cloudData) {
        this.dataSource = 'cloud';
        this.handleNewData(cloudData);
        return;
      }
    } catch (error) {
      this.log('CLOUD', `Fallback aktiv: ${error.message}`);
    }

    const localData = await this.fetchFromLocal();
    if (localData) {
      this.dataSource = 'local';
      this.handleNewData(localData);
    }
  },

  async fetchFromSupabase() {
    if (!api.client) return null;
    const { data, error } = await api.client
      .from('market_sentiment')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async fetchFromLocal() {
    try {
      const response = await fetch('../shared/data/market_sentiment.json');
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  log(scope, message) {
    console.log(`[Markt-Vibe:${scope}] ${message}`);
  }
};
