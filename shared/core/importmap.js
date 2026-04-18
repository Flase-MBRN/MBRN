/**
 * MBRN Import Map Configuration
 * Anti-Kill-Vector 2: No-Build Policy Trap
 * 
 * Provides centralized module resolution to eliminate relative path hell.
 * All modules resolve through bare specifiers (@mbrn/*) instead of ../../ paths.
 * 
 * Usage: Import this module first, then use bare specifiers:
 *   import { state } from '@mbrn/core/state';
 *   import { dom } from '@mbrn/ui/dom_utils';
 */

// Dynamic import map injection for No-Build environments
const MBRN_IMPORT_MAP = {
  // Core State & Actions
  '@mbrn/core/state': './shared/core/state.js',
  '@mbrn/core/actions': './shared/core/actions.js',
  '@mbrn/core/storage': './shared/core/storage.js',
  '@mbrn/core/api': './shared/core/api.js',
  '@mbrn/core/config': './shared/core/config.js',
  '@mbrn/core/i18n': './shared/core/i18n.js',
  '@mbrn/core/validators': './shared/core/validators.js',
  
  // Logic Modules (Pillar 2)
  '@mbrn/logic/finance': './shared/core/logic/finance.js',
  '@mbrn/logic/orchestrator': './shared/core/logic/orchestrator.js',
  '@mbrn/logic/synergy': './shared/core/logic/synergy.js',
  '@mbrn/logic/chronos': './shared/core/logic/chronos.js',
  '@mbrn/logic/frequency': './shared/core/logic/frequency.js',
  
  // UI Components (Pillar 4)
  '@mbrn/ui/dom_utils': './shared/ui/dom_utils.js',
  '@mbrn/ui/navigation': './shared/ui/navigation.js',
  '@mbrn/ui/render_auth': './shared/ui/render_auth.js',
  '@mbrn/ui/error_boundary': './shared/ui/error_boundary.js',
  '@mbrn/ui/touch_manager': './shared/ui/touch_manager.js',
  
  // Loyalty & Access
  '@mbrn/loyalty/access': './shared/loyalty/access_control.js',
  '@mbrn/loyalty/streak': './shared/loyalty/streak_manager.js',
};

/**
 * Injects import map into document head if not already present.
 * Called automatically by all entry points.
 */
export function injectImportMap() {
  if (document.querySelector('script[type="importmap"]')) {
    return; // Already injected
  }
  
  const script = document.createElement('script');
  script.type = 'importmap';
  script.textContent = JSON.stringify({ imports: resolvePaths() }, null, 2);
  document.head.appendChild(script);
}

/**
 * Resolves relative paths based on current location.
 * Handles both root and nested app paths.
 */
function resolvePaths() {
  const path = window.location.pathname;
  const depth = (path.match(/\//g) || []).length - 1;
  
  // Calculate base path: ../../ for /apps/finance/, ./ for /index.html
  const basePrefix = depth > 0 
    ? Array(depth).fill('..').join('/') + '/'
    : './';
  
  const resolved = {};
  for (const [key, value] of Object.entries(MBRN_IMPORT_MAP)) {
    // Remove leading ./ from value before prepending base
    const cleanValue = value.startsWith('./') ? value.slice(2) : value;
    resolved[key] = basePrefix + cleanValue;
  }
  
  return resolved;
}

/**
 * Legacy path resolver for gradual migration.
 * Returns relative path for a module specifier.
 */
export function resolveModule(specifier) {
  const map = resolvePaths();
  return map[specifier] || specifier;
}

// Auto-inject on module load (for entries that import this first)
if (typeof document !== 'undefined') {
  injectImportMap();
}
