import { createBridgeFailure, createBridgeSuccess } from '../../../shared/core/contracts/bridge_result.js';

function roundPercent(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

export function summarizeOracleBacktest(payload = {}) {
  const history = Array.isArray(payload.history) ? payload.history : [];
  const evaluatedCount = history.length;
  const correctCount = history.filter((entry) => entry?.was_correct).length;
  const accuracyPct = Number.isFinite(Number(payload.accuracy_pct))
    ? Number(payload.accuracy_pct)
    : evaluatedCount > 0
      ? roundPercent((correctCount / evaluatedCount) * 100)
      : 0;

  return {
    updatedAt: payload.updated_at || null,
    evaluatedCount,
    correctCount,
    accuracyPct,
    latestEvaluation: history[0] || null
  };
}

export async function readOracleBacktest(backtestUrl = '../../shared/data/oracle_backtest.json') {
  try {
    const response = await fetch(`${backtestUrl}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      return createBridgeFailure('oracle.backtesting.summary', `HTTP ${response.status}`, {
        statusCode: response.status
      });
    }

    const payload = await response.json();
    return createBridgeSuccess('oracle.backtesting.summary', payload, {
      summary: summarizeOracleBacktest(payload)
    });
  } catch (error) {
    return createBridgeFailure('oracle.backtesting.summary', error.message);
  }
}
