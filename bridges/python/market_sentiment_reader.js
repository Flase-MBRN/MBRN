import { createBridgeFailure, createBridgeSuccess } from '../../shared/core/contracts/bridge_result.js';

export async function readMarketSentimentSnapshot(snapshotUrl = '../shared/data/market_sentiment.json') {
  try {
    const response = await fetch(snapshotUrl, { cache: 'no-store' });
    if (!response.ok) {
      return createBridgeFailure('python.market_sentiment.snapshot', `HTTP ${response.status}`, {
        statusCode: response.status
      });
    }

    const payload = await response.json();
    return createBridgeSuccess('python.market_sentiment.snapshot', payload);
  } catch (error) {
    return createBridgeFailure('python.market_sentiment.snapshot', error.message);
  }
}
