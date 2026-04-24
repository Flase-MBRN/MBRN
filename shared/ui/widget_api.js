/**
 * MBRN Widget API
 * Standard interface for dashboard widgets.
 */

export class BaseWidget {
  constructor(appId, dimensionId) {
    this.appId = appId;
    this.dimensionId = dimensionId;
    this.container = null;
  }

  /**
   * Lifecycle: Called when widget is added to the DOM.
   * @param {HTMLElement} container 
   */
  async onMount(container) {
    this.container = container;
    this.render();
  }

  /**
   * Lifecycle: Called when data updates.
   */
  async onUpdate() {
    this.render();
  }

  /**
   * Lifecycle: Called when widget is removed.
   */
  onUnmount() {
    this.container = null;
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = `<div class="widget-placeholder">Widget: ${this.appId}</div>`;
  }
}

/**
 * Global Widget Registry for the Dashboard Kernel
 */
export const widgetRegistry = {
  widgets: new Map(),

  register(appId, widgetClass) {
    this.widgets.set(appId, widgetClass);
    console.log(`[WidgetAPI] Registered widget for app: ${appId}`);
  },

  get(appId) {
    return this.widgets.get(appId);
  }
};
