/**
 * ⚠️ DEPRECATED - MOVED TO pillars/oracle/browser_read/
 *
 * Diese Datei wurde verschoben nach:
 * /pillars/oracle/browser_read/snapshot_reader.js
 *
 * Migration:
 * - Alter Import: from '../../bridges/python/oracle_snapshot_reader.js'
 * - Neuer Import: from '../../pillars/oracle/browser_read/snapshot_reader.js'
 *
 * Diese Datei wird in einer zukünftigen Version entfernt.
 * Bitte migriere alle Verwendungen zur neuen Location.
 */

import { createBridgeFailure, createBridgeSuccess } from '../../shared/core/contracts/bridge_result.js';
import { validateOracleSnapshot } from '../../shared/core/contracts/oracle_snapshot.js';

// Re-export from new location for backward compatibility
export { readOracleSnapshot } from '../../pillars/oracle/browser_read/snapshot_reader.js';

// Deprecated legacy implementation - will be removed
export async function readOracleSnapshot(snapshotUrl = '../shared/data/oracle_prediction.json') {
  try {
    const response = await fetch(`${snapshotUrl}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      return createBridgeFailure('python.oracle.snapshot', `HTTP ${response.status}`, {
        statusCode: response.status
      });
    }

    const payload = await response.json();
    const validation = validateOracleSnapshot(payload);
    if (!validation.valid) {
      return createBridgeFailure('python.oracle.snapshot', validation.error);
    }

    return createBridgeSuccess('python.oracle.snapshot', payload);
  } catch (error) {
    return createBridgeFailure('python.oracle.snapshot', error.message);
  }
}
