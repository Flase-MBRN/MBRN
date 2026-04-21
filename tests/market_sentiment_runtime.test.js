import { jest } from '@jest/globals';

async function loadMarketSentimentModule() {
  jest.resetModules();

  const maybeSingleMock = jest.fn();
  const limitMock = jest.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = jest.fn(() => ({ limit: limitMock }));
  const selectMock = jest.fn(() => ({ order: orderMock }));
  const channelSubscribeMock = jest.fn(() => ({ unsubscribe: jest.fn() }));
  const channelOnMock = jest.fn(() => ({ subscribe: channelSubscribeMock }));
  const channelMock = jest.fn(() => ({ on: channelOnMock }));
  const getSupabaseClientMock = jest.fn(() => ({
    from: jest.fn(() => ({ select: selectMock })),
    channel: channelMock
  }));
  const readMarketSentimentSnapshotMock = jest.fn(async () => ({
    success: true,
    data: {
      sentiment_score: 44,
      sentiment_label: 'Neutral',
      confidence: 0.72,
      analysis: 'Snapshot mode',
      recommendation: 'hold',
      crypto_bias: 'neutral',
      news_bias: 'neutral',
      market_data: [],
      timestamp_utc: '2026-04-21T16:00:00.000Z'
    }
  }));

  await jest.unstable_mockModule('../bridges/supabase/client.js', () => ({
    getSupabaseClient: getSupabaseClientMock
  }));

  await jest.unstable_mockModule('../bridges/python/market_sentiment_reader.js', () => ({
    readMarketSentimentSnapshot: readMarketSentimentSnapshotMock
  }));

  const marketSentimentModule = await import('../shared/application/read_models/market_sentiment.js');

  return {
    ...marketSentimentModule,
    getSupabaseClientMock,
    readMarketSentimentSnapshotMock,
    maybeSingleMock,
    channelMock,
    channelOnMock,
    channelSubscribeMock
  };
}

describe('market sentiment runtime gating', () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }

    if (originalNavigator === undefined) {
      delete globalThis.navigator;
    } else {
      globalThis.navigator = originalNavigator;
    }
  });

  test('GitHub Pages uses the local snapshot and skips Supabase realtime', async () => {
    globalThis.window = {
      location: {
        origin: 'https://flase-mbrn.github.io',
        href: 'https://flase-mbrn.github.io/MBRN/dashboard/index.html'
      }
    };
    globalThis.navigator = { onLine: true, language: 'de-DE', userAgent: 'Firefox' };

    const context = await loadMarketSentimentModule();

    await expect(context.readLatestMarketSentiment()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        sentiment_score: 44,
        verdict: 'Neutral'
      }),
      source: 'local_snapshot'
    });

    const unsubscribe = context.subscribeMarketSentiment(jest.fn());
    unsubscribe();

    expect(context.getSupabaseClientMock).not.toHaveBeenCalled();
    expect(context.readMarketSentimentSnapshotMock).toHaveBeenCalledTimes(1);
    expect(context.channelMock).not.toHaveBeenCalled();
  });

  test('non-GitHub runtimes keep the Supabase live path active', async () => {
    globalThis.window = {
      location: {
        origin: 'https://mbrn.app',
        href: 'https://mbrn.app/dashboard/index.html'
      }
    };
    globalThis.navigator = { onLine: true, language: 'de-DE', userAgent: 'Firefox' };

    const context = await loadMarketSentimentModule();
    context.maybeSingleMock.mockResolvedValue({
      data: {
        sentiment_score: 68,
        sentiment_label: 'Greed',
        confidence: 0.81,
        analysis: 'Live path',
        recommendation: 'buy',
        crypto_bias: 'bullish',
        news_bias: 'positive',
        market_data: [],
        created_at: '2026-04-21T16:10:00.000Z'
      },
      error: null
    });

    await expect(context.readLatestMarketSentiment()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        sentiment_score: 68,
        verdict: 'Greed'
      }),
      source: 'supabase'
    });

    const unsubscribe = context.subscribeMarketSentiment(jest.fn());
    expect(typeof unsubscribe).toBe('function');

    expect(context.getSupabaseClientMock).toHaveBeenCalledTimes(2);
    expect(context.maybeSingleMock).toHaveBeenCalledTimes(1);
    expect(context.channelMock).toHaveBeenCalledWith('market_sentiment');
    expect(context.channelOnMock).toHaveBeenCalledTimes(1);
    expect(context.channelSubscribeMock).toHaveBeenCalledTimes(1);
    expect(context.readMarketSentimentSnapshotMock).not.toHaveBeenCalled();
  });
});
