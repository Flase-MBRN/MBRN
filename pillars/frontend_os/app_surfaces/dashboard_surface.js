/**
 * Dashboard surface.
 * Clean orientation layer only: global navigation, product flow, dimensions.
 */

import { dom } from '../../../shared/ui/dom_utils.js';
import { nav, renderNavigation } from '../navigation/index.js';
import { renderAuth } from '../ui_states/auth_controller.js';
import { errorBoundary } from '../../../shared/ui/base_components/error_boundary.js';
import { renderSurfaceFlowRail } from '../shell/flow_rail.js';
import { renderDashboardDimensionCards } from '../dashboard/dimension_cards.js';
import { renderFactoryFeed } from '../dashboard/factory_feed.js';
import { registry } from '../../../shared/application/registry_bridge.js';
import { widgetRegistry } from '../../../shared/ui/widget_api.js';

export const dashboardRender = {
  async init() {
    try {
      dom.initScrollReveal();
      errorBoundary.init();

      // Load canonical registry first
      await registry.load();

      renderNavigation('nav-menu');
      nav.bindNavigation();
      nav.registerCurrentApp(this);
      await renderAuth.init();

      renderSurfaceFlowRail('dashboard-flow-rail', 'dashboard');
      await renderDashboardDimensionCards();

      // Factory Feed — autonomous production monitor
      await renderFactoryFeed('factory-feed-root');
      
      console.log('[Dashboard] OS Kernel initialized.');
    } catch (err) {
      console.error('Dashboard Init Error:', err);
      document.body.textContent = 'Dashboard konnte nicht geladen werden. Bitte Seite neu laden.';
    }
  },

  destroy() {}
};

dashboardRender.init();
