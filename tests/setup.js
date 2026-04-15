/**
 * Test Utilities and Mocks
 */

/**
 * Mock Date for deterministic temporal tests
 * @param {string} isoDate - ISO date string to mock
 */
export function mockDate(isoDate) {
  const RealDate = Date;
  global.Date = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(isoDate);
      } else {
        super(...args);
      }
    }
  };
  return () => {
    global.Date = RealDate;
  };
}

/**
 * Restore original Date
 */
export function restoreDate() {
  // Implementation depends on mockDate usage
}

/**
 * Create a mock DOM element
 */
export function createMockElement(tag = 'div', attributes = {}) {
  return {
    tagName: tag.toUpperCase(),
    className: '',
    textContent: '',
    innerHTML: '',
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn()
    },
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    ...attributes
  };
}
