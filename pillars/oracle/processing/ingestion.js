import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_MARKET_SENTIMENT_PATH = 'shared/data/market_sentiment.json';
const DEFAULT_NUMEROLOGY_HISTORY_PATH = 'shared/data/numerology_history.json';

function normalizeMarketSentimentSnapshot(snapshot = {}) {
  const marketData = Array.isArray(snapshot.market_data) ? snapshot.market_data : [];
  const newsFeed = Array.isArray(snapshot.news_feed) ? snapshot.news_feed : [];
  const cryptoSnapshot = marketData
    .filter((entry) => ['BTC-USD', 'ETH-USD'].includes(entry?.ticker))
    .reduce((acc, entry) => {
      acc[entry.ticker] = {
        price: Number(entry.price || 0),
        change_percent: Number(entry.change_percent || 0),
        volume: Number(entry.volume || 0)
      };
      return acc;
    }, {});

  return {
    timestampUtc: snapshot.timestamp_utc || null,
    source: snapshot.source || 'market_sentiment_pipeline',
    sentimentScore: Number(snapshot.sentiment_score || 50),
    sentimentLabel: snapshot.sentiment_label || 'Neutral',
    confidence: Number(snapshot.confidence || 0),
    analysis: snapshot.analysis || '',
    recommendation: snapshot.recommendation || 'hold',
    cryptoBias: snapshot.crypto_bias || 'neutral',
    newsBias: snapshot.news_bias || 'neutral',
    newsImpact: Number(snapshot.news_impact || 0),
    keyTheme: snapshot.key_theme || '',
    marketData,
    newsFeed,
    cryptoSnapshot
  };
}

function normalizeNumerologyHistory(history = []) {
  return (Array.isArray(history) ? history : []).map((entry) => ({
    date: entry.date,
    dateUtc: entry.date_utc,
    dayNumber: Number(entry.day_number),
    isMaster: Boolean(entry.is_master),
    description: entry.description || ''
  }));
}

async function readJsonArtifact(relativePath) {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const source = await fs.readFile(absolutePath, 'utf8');
  return JSON.parse(source);
}

export async function buildOracleMergedInputs(options = {}) {
  const marketSentimentSnapshot = options.marketSentimentSnapshot
    || await readJsonArtifact(options.marketSentimentPath || DEFAULT_MARKET_SENTIMENT_PATH);
  const numerologyHistory = options.numerologyHistory
    || await readJsonArtifact(options.numerologyHistoryPath || DEFAULT_NUMEROLOGY_HISTORY_PATH);

  const normalizedMarketSentiment = normalizeMarketSentimentSnapshot(marketSentimentSnapshot);
  const normalizedNumerologyHistory = normalizeNumerologyHistory(numerologyHistory);
  const numerologyByDate = normalizedNumerologyHistory.reduce((acc, entry) => {
    acc[entry.date] = entry;
    return acc;
  }, {});

  return {
    mergedAt: new Date().toISOString(),
    marketSentiment: normalizedMarketSentiment,
    numerologyHistory: normalizedNumerologyHistory,
    numerologyByDate
  };
}
