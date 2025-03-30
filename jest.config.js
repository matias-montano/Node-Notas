export default {
  testEnvironment: 'node',
  transform: {},
  // Remove extensionsToTreatAsEsm: ['.js'] as it's redundant with "type": "module"
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    // Patrones para incluir tests en carpetas "test" y "tests"
    '**/test/**/*.test.js',
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js', 
    '**/?(*.)+(spec|test).js'
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 20000,
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
};