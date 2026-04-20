import { createBridgeFailure, createBridgeSuccess } from '../../shared/core/contracts/bridge_result.js';
import { validateOracleSnapshot } from '../../shared/core/contracts/oracle_snapshot.js';

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
