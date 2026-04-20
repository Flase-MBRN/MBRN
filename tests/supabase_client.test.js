import { jest } from '@jest/globals';

const apiMock = {
  client: null,
  init: jest.fn(),
  checkConnection: jest.fn()
};

await jest.unstable_mockModule('../bridges/supabase/api.js', () => ({
  api: apiMock
}));

const { getSupabaseClient, default: defaultExport } = await import('../bridges/supabase/client.js');

describe('supabase_client', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock.client = null;
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  test('exports the client getter as default', () => {
    expect(defaultExport).toBe(getSupabaseClient);
  });

  test('returns an existing client without re-initializing', () => {
    const client = { channel: jest.fn() };
    apiMock.client = client;

    expect(getSupabaseClient()).toBe(client);
    expect(apiMock.init).not.toHaveBeenCalled();
  });

  test('initializes lazily in browser context when no client exists', () => {
    globalThis.window = { location: { hostname: 'mbrn.test' } };
    const client = { from: jest.fn() };
    apiMock.init.mockImplementation(() => {
      apiMock.client = client;
      return true;
    });

    expect(getSupabaseClient()).toBe(client);
    expect(apiMock.init).toHaveBeenCalledTimes(1);
  });

  test('stays a no-op outside the browser when no client exists', () => {
    delete globalThis.window;

    expect(getSupabaseClient()).toBeNull();
    expect(apiMock.init).not.toHaveBeenCalled();
  });
});
