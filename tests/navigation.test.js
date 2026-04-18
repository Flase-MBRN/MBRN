/**
 * /tests/navigation.test.js
 * NAVIGATION TEST SUITE - Phase 10/10 Testing Fortress
 * 
 * Responsibility: Verify navigation lifecycle and cleanup behavior
 * LAW 4 COMPLIANT: All assertions check structured returns
 * 
 * TEST CASES:
 * 1. destroy() called on navigateTo()
 * 2. registerCurrentApp() properly stores app instance
 * 3. Emergency cleanup on popstate
 * 4. Emergency cleanup on beforeunload
 */

import { jest } from '@jest/globals';
import { nav } from '../shared/ui/navigation.js';

// Mock window.location and document for Node environment
const mockLocation = { 
  href: '',
  pathname: '/'
};
Object.defineProperty(global, 'window', {
  value: {
    location: mockLocation,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    innerWidth: 1024
  },
  writable: true
});

Object.defineProperty(global, 'document', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    createElement: jest.fn(() => ({
      setAttribute: jest.fn(),
      classList: { toggle: jest.fn() },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })),
    querySelector: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
    hidden: false,
    body: { 
      contains: jest.fn(() => true),
      appendChild: jest.fn(),
      removeChild: jest.fn()
    }
  },
  writable: true
});

// Mock state module
jest.mock('../shared/core/state.js', () => ({
  state: {
    emit: jest.fn()
  }
}));

// Mock touch_manager
jest.mock('../shared/ui/touch_manager.js', () => ({
  touchManager: {
    init: jest.fn()
  }
}));

// Mock config
jest.mock('../shared/core/config.js', () => ({
  MBRN_ROUTES: {
    home: 'index.html',
    dashboard: 'dashboard/index.html',
    finance: 'apps/finance/index.html'
  }
}));

describe('Navigation - App Lifecycle Cleanup', () => {
  beforeEach(() => {
    // Reset nav state
    nav.destroy(); // Clear any existing handles before test
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  afterEach(() => {
    nav.destroy(); // Cleanup handles after each test
  });

  describe('navigateTo() Cleanup Verification', () => {
    test('destroy() is called on current app before navigation', () => {
      // Create a mock app with destroy method
      const mockDestroy = jest.fn();
      const mockApp = {
        destroy: mockDestroy,
        name: 'TestApp'
      };

      // Register the mock app
      nav.registerCurrentApp(mockApp);
      expect(nav._currentApp).toBe(mockApp);

      // Navigate to a new route
      nav.navigateTo('dashboard');

      // Verify destroy() was called
      expect(mockDestroy).toHaveBeenCalledTimes(1);
      // App reference should be cleared
      expect(nav._currentApp).toBeNull();
    });

    test('navigateTo() works without registered app', () => {
      // Ensure no app is registered
      nav._currentApp = null;

      // Should not throw
      expect(() => nav.navigateTo('home')).not.toThrow();
      // Navigation should still work
      expect(mockLocation.href).toContain('index.html');
    });

    test('navigateTo() handles app without destroy method gracefully', () => {
      // Register app without destroy method
      const mockAppWithoutDestroy = {
        name: 'NoDestroyApp'
        // No destroy method
      };

      nav.registerCurrentApp(mockAppWithoutDestroy);

      // Should not throw when navigating
      expect(() => nav.navigateTo('finance')).not.toThrow();
      // Navigation should still proceed
      expect(mockLocation.href).toContain('finance');
    });

    test('multiple navigateTo() calls clean up properly', () => {
      const destroyCalls = [];
      
      // First app
      const app1 = {
        destroy: jest.fn(() => destroyCalls.push('app1')),
        name: 'App1'
      };
      
      // Second app
      const app2 = {
        destroy: jest.fn(() => destroyCalls.push('app2')),
        name: 'App2'
      };

      // Register first app and navigate
      nav.registerCurrentApp(app1);
      nav.navigateTo('dashboard');
      expect(destroyCalls).toContain('app1');
      expect(nav._currentApp).toBeNull();

      // Register second app and navigate
      nav.registerCurrentApp(app2);
      nav.navigateTo('finance');
      expect(destroyCalls).toContain('app2');
    });

    test('registerCurrentApp() initializes emergency cleanup listeners', () => {
      const mockApp = {
        destroy: jest.fn(),
        name: 'TestApp'
      };

      nav.registerCurrentApp(mockApp);

      // Should attach popstate and beforeunload listeners
      expect(window.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    test('emergency cleanup listeners are only initialized once', () => {
      const mockApp1 = { destroy: jest.fn(), name: 'App1' };
      const mockApp2 = { destroy: jest.fn(), name: 'App2' };

      // Reset state
      nav._cleanupListenersInitialized = false;
      const initialCalls = window.addEventListener.mock.calls.length;

      // Register first app - should add listeners
      nav.registerCurrentApp(mockApp1);
      const afterFirst = window.addEventListener.mock.calls.length;
      expect(afterFirst).toBeGreaterThan(initialCalls); // Listeners were added

      // Register second app - should NOT add more listeners due to idempotency
      nav.registerCurrentApp(mockApp2);
      const afterSecond = window.addEventListener.mock.calls.length;
      
      // Same count - no new listeners added
      expect(afterSecond).toBe(afterFirst);
    });

    test('destroy() is called with correct context', () => {
      const mockDestroy = jest.fn(function() {
        // Verify 'this' context
        return this.name;
      });
      
      const mockApp = {
        destroy: mockDestroy,
        name: 'ContextTestApp'
      };

      nav.registerCurrentApp(mockApp);
      nav.navigateTo('home');

      expect(mockDestroy).toHaveBeenCalled();
      // Verify destroy was called on the correct object
      expect(mockDestroy.mock.instances[0]).toBe(mockApp);
    });
  });

  describe('Navigation State Management', () => {
    test('registerCurrentApp() stores app instance correctly', () => {
      const mockApp = {
        destroy: jest.fn(),
        name: 'StorageTest'
      };

      nav.registerCurrentApp(mockApp);

      expect(nav._currentApp).toBe(mockApp);
      expect(nav._currentApp.name).toBe('StorageTest');
    });

    test('app instance can be replaced', () => {
      const app1 = { destroy: jest.fn(), name: 'App1' };
      const app2 = { destroy: jest.fn(), name: 'App2' };

      nav.registerCurrentApp(app1);
      expect(nav._currentApp).toBe(app1);

      nav.registerCurrentApp(app2);
      expect(nav._currentApp).toBe(app2);
      expect(nav._currentApp.name).toBe('App2');
    });

    test('resetNavigationBinding() allows rebinding', () => {
      // First bind
      nav.bindNavigation();
      expect(nav._navigationBound).toBe(true);

      // Reset
      nav.resetNavigationBinding();
      expect(nav._navigationBound).toBe(false);

      // Can bind again
      nav.bindNavigation();
      expect(nav._navigationBound).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('navigateTo() handles unknown routes gracefully', () => {
      const mockApp = { destroy: jest.fn() };
      nav.registerCurrentApp(mockApp);

      // Unknown route should fall back to home
      nav.navigateTo('nonexistent');
      
      expect(mockLocation.href).toContain('index.html');
      expect(mockApp.destroy).toHaveBeenCalled();
    });

    test('consecutive navigateTo() calls handle cleanup correctly', async () => {
      const destroySpy = jest.fn();
      const mockApp = { destroy: destroySpy };

      nav.registerCurrentApp(mockApp);

      // Multiple rapid navigations
      nav.navigateTo('home');
      nav.navigateTo('dashboard');
      
      // destroy() should only be called once (on first navigation)
      // because app reference is cleared after first navigateTo
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    test('cleanup is idempotent when app is already null', () => {
      nav._currentApp = null;

      // Should not throw
      expect(() => nav.navigateTo('home')).not.toThrow();
      expect(mockLocation.href).toBeTruthy();
    });
  });
});

describe('Navigation - Memory Leak Prevention', () => {
  test('emergency cleanup handles tab visibility changes', () => {
    const mockApp = {
      destroy: jest.fn(),
      name: 'VisibilityTest'
    };

    nav.registerCurrentApp(mockApp);
    
    // Verify visibilitychange listener was added
    expect(document.addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });

  test('orphaned element cleanup is registered via setInterval', () => {
    const mockApp = { destroy: jest.fn() };
    
    // Mock setInterval to verify cleanup scheduling
    const setIntervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue(123);
    
    // Reset state to trigger initialization
    nav._cleanupListenersInitialized = false;
    nav.registerCurrentApp(mockApp);

    // Verify setInterval was called (for orphaned element cleanup and memory pressure check)
    expect(setIntervalSpy).toHaveBeenCalled();
    
    setIntervalSpy.mockRestore();
  });
});
