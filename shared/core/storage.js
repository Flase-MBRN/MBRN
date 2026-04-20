/**
 * /shared/core/storage.js
 * DEPRECATED FACADE - Re-exports from shared/core/storage/index.js
 * This file exists for backward compatibility during migration.
 * TODO: Remove after all imports are updated to use shared/core/storage/index.js
 */

export {
  STORAGE_PREFIX,
  getStorageBackend,
  storage
} from './storage/index.js';
