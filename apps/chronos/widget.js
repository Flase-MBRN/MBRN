import { BaseWidget } from '../../shared/ui/widget_api.js';
import { dom } from '../../shared/ui/dom_utils.js';

export class Widget extends BaseWidget {
  constructor(appId, dimensionId) {
    super(appId, dimensionId);
  }

  async render() {
    if (!this.container) return;

    this.container.replaceChildren();
    
    const wrapper = dom.createEl('div', {
      className: 'chronos-dashboard-widget',
      parent: this.container
    });

    dom.createEl('div', {
      className: 'widget-status-row',
      parent: wrapper
    });

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    dom.createEl('div', {
      className: 'chronos-time-display',
      text: `Aktuelle Fokuszeit: ${time}`,
      parent: wrapper
    });

    dom.createEl('div', {
      className: 'chronos-quality-indicator',
      text: 'Zeit-Qualität: Hoch (Flow-Phase)',
      parent: wrapper
    });
  }
}
