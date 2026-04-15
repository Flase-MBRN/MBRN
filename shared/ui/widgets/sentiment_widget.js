/**
 * PATCH 5.1.4-C: Realtime Market Sentiment Widget
 * 
 * Live Fear & Greed Index mit Supabase Realtime
 * Hört auf 'market_sentiment' Channel für neue Inserts
 */

import { supabase } from '../../core/supabase_client.js';
import { animateValue } from '../dom_utils.js';
import { MBRN_CONFIG } from '../../core/config.js';

export const sentimentWidget = {
  channel: null,
  currentScore: 50,
  
  /**
   * Initialize Sentiment Widget with Realtime
   */
  init(containerId = 'sentiment-widget') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('[Sentiment Widget] Container not found:', containerId);
      return;
    }
    
    this.render();
    this.setupRealtime();
    this.fetchInitialData();
  },
  
  /**
   * LAW 3 COMPLIANT: Render Widget Structure
   * Uses static HTML template with centralized CSS classes
   */
  render() {
    // Static template - no user input interpolation (XSS-safe)
    const template = `
      <div class="glass-card text-center">
        <h3 class="section-eyebrow-left">
          ◉ Market Sentiment
        </h3>
        
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
        
        <div id="sentiment-verdict" class="sentiment-verdict">
          Neutral
        </div>
        
        <div class="sentiment-meta">
          <span id="sentiment-source">—</span>
          <span id="sentiment-time">—</span>
        </div>
        
        <div id="sentiment-status" class="sentiment-status">
          <span class="status-dot"></span>
          <span class="status-text">Connecting...</span>
        </div>
      </div>
    `;
    
    // LAW 3: Use textContent-safe insertion for static template
    this.container.insertAdjacentHTML('beforeend', template);
  },
  
  /**
   * PATCH 5.1.4-C: Setup Supabase Realtime Channel
   */
  setupRealtime() {
    // Guard: Graceful degradation if Supabase not initialized
    if (!api.client) {
      console.log('[Sentiment Widget] Supabase offline — realtime disabled.');
      return;
    }
    
    // Create channel for market_sentiment table changes
    this.channel = supabase
      .channel('market_sentiment')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_sentiment'
        },
        (payload) => {
          console.log('[Sentiment Widget] Realtime update received:', payload);
          this.handleNewData(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('[Sentiment Widget] Realtime status:', status);
        this.updateStatusIndicator(status);
      });
  },
  
  /**
   * Handle new realtime data
   */
  handleNewData(data) {
    if (!data || typeof data.sentiment_score !== 'number') return;
    
    const newScore = Math.round(data.sentiment_score);
    const verdict = data.verdict || this.getVerdictLabel(newScore);
    const source = data.source || 'Unknown';
    const timestamp = data.created_at || new Date().toISOString();
    
    // Animate value change
    const scoreEl = document.getElementById('sentiment-score');
    if (scoreEl) {
      animateValue(scoreEl, this.currentScore, newScore, 1500, '', (v) => Math.round(v));
    }
    
    // Update ring visualization
    this.updateRing(newScore);
    
    // Update text elements
    const verdictEl = document.getElementById('sentiment-verdict');
    if (verdictEl) {
      verdictEl.textContent = verdict;
      verdictEl.style.color = this.getScoreColor(newScore);
    }
    
    const sourceEl = document.getElementById('sentiment-source');
    if (sourceEl) sourceEl.textContent = `Source: ${source}`;
    
    const timeEl = document.getElementById('sentiment-time');
    if (timeEl) {
      const date = new Date(timestamp);
      timeEl.textContent = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Pulse animation on card
    const card = this.container.querySelector('.glass-card');
    if (card) {
      card.style.animation = 'pulseGlow 0.6s ease';
      setTimeout(() => { card.style.animation = ''; }, 600);
    }
    
    this.currentScore = newScore;
  },
  
  /**
   * Update ring stroke based on score
   */
  updateRing(score) {
    const ring = document.getElementById('sentiment-ring');
    if (!ring) return;
    
    // Calculate stroke-dashoffset (440 is full circumference)
    const circumference = 440;
    const offset = circumference - (score / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    
    // Color based on sentiment
    ring.style.stroke = this.getScoreColor(score);
  },
  
  /**
   * Get color based on sentiment score (Law 8: Uses MBRN_CONFIG thresholds)
   */
  getScoreColor(score) {
    const { EXTREME_GREED, GREED, NEUTRAL, FEAR } = MBRN_CONFIG.sentiment.thresholds;
    if (score >= EXTREME_GREED) return 'var(--accent)';    // Extreme Greed - Purple
    if (score >= GREED) return 'var(--success)';           // Greed - Green
    if (score >= NEUTRAL) return 'var(--warning)';         // Neutral - Yellow
    if (score >= FEAR) return 'var(--error)';             // Fear - Orange/Red
    return '#ef4444';                                     // Extreme Fear - Red
  },
  
  /**
   * Get verdict label (Law 8: Uses MBRN_CONFIG thresholds)
   */
  getVerdictLabel(score) {
    const { EXTREME_GREED, GREED, NEUTRAL, FEAR } = MBRN_CONFIG.sentiment.thresholds;
    if (score >= EXTREME_GREED) return 'Extreme Greed';
    if (score >= GREED) return 'Greed';
    if (score >= NEUTRAL) return 'Neutral';
    if (score >= FEAR) return 'Fear';
    return 'Extreme Fear';
  },
  
  /**
   * Update connection status indicator
   */
  updateStatusIndicator(status) {
    const dot = this.container?.querySelector('.status-dot');
    const text = this.container?.querySelector('.status-text');
    if (!dot || !text) return;
    
    if (status === 'SUBSCRIBED') {
      dot.style.background = 'var(--success)';
      dot.style.boxShadow = '0 0 8px var(--success)';
      text.textContent = 'Live';
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      dot.style.background = 'var(--error)';
      text.textContent = 'Offline';
    } else {
      dot.style.background = 'var(--warning)';
      text.textContent = 'Connecting...';
    }
  },
  
  /**
   * Fetch initial data from DB with cache warming
   * LAW 9 COMPLIANT: No false "Neutral" display when data exists
   */
  async fetchInitialData() {
    try {
      const { data, error } = await supabase
        .from('market_sentiment')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      if (data) {
        this.handleNewData(data);
        this.log('CACHE', 'Warmed with live data from DB');
      }
    } catch (err) {
      console.warn('[Sentiment Widget] Initial fetch failed:', err);
      // Only show Neutral if NO data available (not while loading)
      // Keep "Connecting..." state until data arrives via Realtime
      this.updateStatusIndicator('CONNECTING');
    }
  },
  
  /**
   * Internal logging helper
   */
  log(level, message) {
    console.log(`[Sentiment Widget] [${level}] ${message}`);
  },
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
};
