/**
 * /shared/ui/widgets/sentiment_widget.js
 * Markt-Vibe ohne Technik-Sprech.
 */

import { getSupabaseClient } from '../../core/supabase_client.js';
import { animateValue, dom } from '../dom_utils.js';

function getVerdictLabel(score) {
  if (score >= 81) return 'Sehr optimistisch';
  if (score >= 61) return 'Optimistisch';
  if (score >= 41) return 'Neutral';
  if (score >= 21) return 'Vorsichtig';
  return 'Sehr vorsichtig';
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
    const card = dom.createEl('div', {
      className: 'glass-card text-center',
      parent: this.container
    });

    dom.createEl('h3', {
      className: 'section-eyebrow-left',
      text: 'Markt-Vibe',
      parent: card
    });

    dom.createEl('p', {
      className: 'text-secondary mb-24',
      text: 'Die aktuelle Marktstimmung auf einen Blick.',
      parent: card
    });

    const sentimentContainer = dom.createEl('div', {
      className: 'sentiment-container',
      parent: card
    });

    const svg = dom.createEl('svg', {
      className: 'sentiment-ring-svg',
      attrs: { viewBox: '0 0 160 160' },
      parent: sentimentContainer
    });

    dom.createEl('circle', {
      attrs: {
        cx: '80',
        cy: '80',
        r: '70',
        fill: 'none',
        stroke: 'var(--border)',
        'stroke-width': '12'
      },
      parent: svg
    });

    dom.createEl('circle', {
      id: 'sentiment-ring',
      attrs: {
        cx: '80',
        cy: '80',
        r: '70',
        fill: 'none',
        stroke: 'var(--accent)',
        'stroke-width': '12',
        'stroke-linecap': 'round',
        'stroke-dasharray': '440',
        'stroke-dashoffset': '220'
      },
      parent: svg
    });

    const scoreCenter = dom.createEl('div', {
      className: 'sentiment-score-center',
      parent: sentimentContainer
    });

    dom.createEl('span', {
      id: 'sentiment-score',
      className: 'value-massive sentiment-score-massive',
      text: '50',
      parent: scoreCenter
    });

    dom.createEl('div', {
      id: 'sentiment-verdict',
      className: 'sentiment-verdict',
      text: 'Neutral',
      parent: card
    });

    dom.createEl('p', {
      className: 'text-sm opacity-70 mt-16',
      text: 'Was bedeutet das? Der Wert zeigt, ob die Masse gerade Panik schiebt und ihr Geld zusammenhält (0), oder ob alle im absoluten Kauf-Modus sind (100).',
      parent: card
    });
  },

  setupRealtime() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

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
    if (score >= 81) return 'var(--accent)';
    if (score >= 61) return 'var(--success)';
    if (score >= 41) return 'var(--text-secondary)';
    if (score >= 21) return 'var(--warning)';
    return 'var(--error)';
  },

  getScoreClass(score) {
    if (score >= 81) return 'sentiment-verdict-extreme-greed';
    if (score >= 61) return 'sentiment-verdict-greed';
    if (score >= 41) return 'sentiment-verdict-neutral';
    if (score >= 21) return 'sentiment-verdict-fear';
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
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
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
