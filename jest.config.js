/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  collectCoverageFrom: [
    'shared/core/logic/**/*.js',
    '!shared/core/logic/**/*.test.js',
    '!shared/core/logic/numerology/pdf/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
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
