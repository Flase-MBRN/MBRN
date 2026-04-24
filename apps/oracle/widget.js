import { BaseWidget } from '../../shared/ui/widget_api.js';

export class Widget extends BaseWidget {
  constructor(appId, dimensionId) {
    super(appId, dimensionId);
    const baseUrl = new URL('../../', import.meta.url).href;
    this.reportPath = new URL('AI/models/reports/latest_causal_report.md', baseUrl).href;
    this.refreshInterval = 60000; // 60 seconds
    this.timer = null;
  }

  async onMount(container) {
    await super.onMount(container);
    this.startAutoRefresh();
  }

  onUnmount() {
    super.onUnmount();
    this.stopAutoRefresh();
  }

  startAutoRefresh() {
    this.timer = setInterval(() => this.onUpdate(), this.refreshInterval);
  }

  stopAutoRefresh() {
    if (this.timer) clearInterval(this.timer);
  }

  async render() {
    if (!this.container) return;

    try {
      const response = await fetch(`${this.reportPath}?t=${Date.now()}`);
      if (!response.ok) throw new Error('kein Report');

      const text = await response.text();

      // Compact preview: first non-empty, non-heading line — max 120 chars
      const preview = text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('#'))
        .slice(0, 1)
        .join(' ')
        .slice(0, 120);

      const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

      this.container.innerHTML = `
        <div style="padding:10px 0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="font-size:10px;font-weight:700;letter-spacing:.1em;color:#10b981;text-transform:uppercase;">● Live</span>
            <span style="font-size:11px;color:var(--text-muted);">${time}</span>
          </div>
          <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin:0 0 10px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
            ${preview || 'Oracle-Report verfügbar.'}…
          </p>
          <a href="../dimensions/geld/oracle_signal/index.html"
             style="font-size:11px;font-weight:600;color:var(--accent);text-decoration:none;letter-spacing:.05em;">
            Full Analysis →
          </a>
        </div>
      `;
    } catch {
      this.container.innerHTML = `
        <p style="font-size:12px;color:var(--text-muted);padding:8px 0;">
          Oracle-Report nicht verfügbar.
        </p>
      `;
    }
  }
}
