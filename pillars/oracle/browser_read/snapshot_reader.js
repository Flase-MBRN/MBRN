import { createBridgeFailure, createBridgeSuccess } from '../../../shared/core/contracts/bridge_result.js';
import { validateOracleSnapshot } from '../../../shared/core/contracts/oracle_snapshot.js';

/**
 * Oracle Snapshot Reader
 *
 * Liest Oracle-Vorhersagen aus lokalen JSON-Snapshots.
 * Teil des Oracle-Pillars: Browser-Read-Layer.
 *
 * Architektur:
 * - Python-Pipeline (RX 7700 XT) schreibt Snapshots
 * - Diese Funktion liest im Browser via fetch()
 * - BridgeResultContract für konsistente Fehlerbehandlung
 */
export async function readOracleSnapshot(snapshotUrl = '../../shared/data/oracle_prediction.json') {
  try {
    const response = await fetch(`${snapshotUrl}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      return createBridgeFailure('oracle.browser_read.snapshot', `HTTP ${response.status}`, {
        statusCode: response.status
      });
    }

    const payload = await response.json();
    const validation = validateOracleSnapshot(payload);
    if (!validation.valid) {
      return createBridgeFailure('oracle.browser_read.snapshot', validation.error);
    }

    return createBridgeSuccess('oracle.browser_read.snapshot', payload);
  } catch (error) {
    return createBridgeFailure('oracle.browser_read.snapshot', error.message);
  }
}
