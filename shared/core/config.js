/**
 * /shared/core/config.js
 * DEPRECATED FACADE - Re-exports from shared/core/config/index.js
 * This file exists for backward compatibility during migration.
 * TODO: Remove after all imports are updated to use shared/core/config/index.js
 */

export {
  MBRN_CONFIG,
  IS_COMMERCIAL_MODE_ACTIVE,
  MASTER_NUMBERS,
  MBRN_ROUTES,
  MBRN_ROUTE_META
} from './config/index.js';
