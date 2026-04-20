/**
 * /shared/core/legal_config.js
 * DEPRECATED FACADE - Re-exports from shared/core/legal/config.js
 * This file exists for backward compatibility during migration.
 * TODO: Remove after all imports are updated to use shared/core/legal/config.js
 */

export {
  LEGAL_VERSION,
  LEGAL_LINKS,
  LEGAL_LAUNCH_BLOCKERS,
  LEGAL_TEXTS,
  LEGAL_CLAIM_GUARD
} from './legal/config.js';
