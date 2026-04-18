/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^https://cdn\\.jsdelivr\\.net/npm/@supabase/supabase-js/\\+esm$': '<rootDir>/tests/mocks/supabase-js-esm.js',
    '^https://esm\\.sh/jspdf@latest$': '<rootDir>/tests/mocks/jspdf-esm.js'
  },
  collectCoverageFrom: [
    'shared/core/**/*.js',
    'shared/core/logic/finance.js',
    '!shared/core/**/*.test.js',
    '!shared/core/env.example.js',
    '!shared/core/env.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  modulePathIgnorePatterns: [
    'node_modules',
    '_COLD_STORAGE'
  ]
};
