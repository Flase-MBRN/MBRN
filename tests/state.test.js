import { jest } from '@jest/globals';
import { state } from '../shared/core/state/index.js';

describe('state', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    state.state = {};
    state.subscribers = new Map();
    state._emitDepths = new Map();
    state.errorHandlers = undefined;
  });

  test('subscribe returns an unsubscribe function that removes the callback', () => {
    const handler = jest.fn();
    const unsubscribe = state.subscribe('profileUpdated', handler);

    state.emit('profileUpdated', { streak: 3 });
    unsubscribe();
    state.emit('profileUpdated', { streak: 4 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ streak: 3 });
  });

  test('set delegates to emit and stores the latest event payload', () => {
    const handler = jest.fn();
    state.subscribe('dashboardReady', handler);

    state.set('dashboardReady', { ready: true });

    expect(state.get('dashboardReady')).toEqual({ ready: true });
    expect(handler).toHaveBeenCalledWith({ ready: true });
  });

  test('manual reserved emits are blocked and reported as system errors', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    state.emit('userAuthChanged', { id: 'blocked-user' });

    expect(state.get('userAuthChanged')).toBeUndefined();
    expect(state.get('systemError')).toEqual(
      expect.objectContaining({
        error: 'Unauthorized emit attempt for reserved event: userAuthChanged',
        context: expect.objectContaining({
          event: 'userAuthChanged',
          data: { id: 'blocked-user' }
        }),
        type: 'state_error',
        timestamp: expect.any(Number)
      })
    );
  });

  test('authorized emits can publish reserved events', () => {
    const handler = jest.fn();
    state.subscribe('systemInitialized', handler);

    state._authorizedEmit('systemInitialized', { streak: 1 });

    expect(state.get('systemInitialized')).toEqual({ streak: 1 });
    expect(handler).toHaveBeenCalledWith({ streak: 1 });
  });

  test('subscriber crashes are isolated and forwarded to error handlers', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorHandler = jest.fn();
    const healthySubscriber = jest.fn();

    state.subscribeToErrors(errorHandler);
    state.subscribe('calcDone', () => {
      throw new Error('subscriber failed');
    });
    state.subscribe('calcDone', healthySubscriber);

    state.emit('calcDone', { ok: true });

    expect(healthySubscriber).toHaveBeenCalledWith({ ok: true });
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'subscriber failed' }),
      expect.objectContaining({
        event: 'calcDone',
        data: { ok: true },
        subscriber: 'anonymous'
      })
    );
  });

  test('recursion guard reports runaway emit loops and cleans up depth tracking', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorHandler = jest.fn();

    state.subscribeToErrors(errorHandler);
    state.subscribe('loop', (payload) => {
      if ((payload.depth || 0) < 6) {
        state.emit('loop', { depth: (payload.depth || 0) + 1 });
      }
    });

    state.emit('loop', { depth: 0 });

    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Event 'loop' exceeded max depth")
      }),
      expect.objectContaining({
        event: 'loop',
        depth: 5
      })
    );
    expect(state._emitDepths.size).toBe(0);
  });

  test('subscriber crashes are isolated and do not break the chain', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorHandler = jest.fn();
    state.subscribeToErrors(errorHandler);

    const healthySubscriber1 = jest.fn();
    const crashingSubscriber = jest.fn(() => {
      throw new Error('subscriber exploded');
    });
    const healthySubscriber2 = jest.fn();

    state.subscribe('testEvent', healthySubscriber1);
    state.subscribe('testEvent', crashingSubscriber);
    state.subscribe('testEvent', healthySubscriber2);

    state.emit('testEvent', { data: 'test' });

    expect(healthySubscriber1).toHaveBeenCalledWith({ data: 'test' });
    expect(crashingSubscriber).toHaveBeenCalledWith({ data: 'test' });
    expect(healthySubscriber2).toHaveBeenCalledWith({ data: 'test' });
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'subscriber exploded' }),
      expect.objectContaining({ event: 'testEvent', data: { data: 'test' } })
    );
  });

  test('emit depth is cleaned up correctly after nested emissions', () => {
    const outerHandler = jest.fn();
    const innerHandler = jest.fn();

    state.subscribe('outer', outerHandler);
    state.subscribe('inner', innerHandler);

    state.emit('outer', { value: 1 });

    expect(outerHandler).toHaveBeenCalledTimes(1);
    expect(state._emitDepths.has('outer')).toBe(false);
    expect(state._emitDepths.size).toBe(0);
  });

  test('subscribeToErrors can unsubscribe handlers and isolates failing handlers', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const failingHandler = jest.fn(() => {
      throw new Error('handler failed');
    });
    const healthyHandler = jest.fn();
    const unsubscribe = state.subscribeToErrors(failingHandler);
    state.subscribeToErrors(healthyHandler);

    state._reportError(new Error('first error'), { source: 'first' });
    unsubscribe();
    state._reportError(new Error('second error'), { source: 'second' });

    expect(failingHandler).toHaveBeenCalledTimes(1);
    expect(healthyHandler).toHaveBeenCalledTimes(2);
    expect(healthyHandler).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ message: 'first error' }),
      { source: 'first' }
    );
    expect(healthyHandler).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ message: 'second error' }),
      { source: 'second' }
    );
  });

  test('_authorizedEmit delegates non-reserved events to normal emit', () => {
    const handler = jest.fn();
    state.subscribe('customEvent', handler);

    state._authorizedEmit('customEvent', { data: 'test' });

    expect(handler).toHaveBeenCalledWith({ data: 'test' });
    expect(state.get('customEvent')).toEqual({ data: 'test' });
  });

  test('_authorizedEmit passes authorized flag for reserved events', () => {
    const handler = jest.fn();
    state.subscribe('userAuthChanged', handler);

    state._authorizedEmit('userAuthChanged', { id: 'user-123' });

    expect(handler).toHaveBeenCalledWith({ id: 'user-123' });
    expect(state.get('userAuthChanged')).toEqual({ id: 'user-123' });
  });
});
