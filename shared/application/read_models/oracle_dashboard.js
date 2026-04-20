import { readOracleBacktest } from '../../../pillars/oracle/backtesting/index.js';
import { readOracleSnapshot } from '../../../pillars/oracle/browser_read/index.js';
import { createOracleDashboardSnapshot } from '../../../pillars/oracle/snapshots/index.js';

export function normalizeOracleDashboardSnapshot(snapshot = {}, backtestPayload = {}) {
  return createOracleDashboardSnapshot(snapshot, backtestPayload);
}

export async function readOracleDashboardSnapshot() {
  const [snapshotResult, backtestResult] = await Promise.all([
    readOracleSnapshot(),
    readOracleBacktest()
  ]);

  if (!snapshotResult.success) {
    return snapshotResult;
  }

  return {
    success: true,
    data: normalizeOracleDashboardSnapshot(
      snapshotResult.data,
      backtestResult.success ? backtestResult.data : {}
    )
  };
}
