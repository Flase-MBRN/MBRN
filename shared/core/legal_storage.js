/**
 * /shared/core/legal_storage.js
 * DEPRECATED FACADE - Re-exports from shared/core/legal/storage.js
 * This file exists for backward compatibility during migration.
 * TODO: Remove after all imports are updated to use shared/core/legal/storage.js
 */

export {
  listMBRNKeys,
  clearMBRNLocalData
} from './legal/storage.js';
