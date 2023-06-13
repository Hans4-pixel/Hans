module.exports = {
  collectCoverageFrom: [
    '<rootDir>/app/scripts/constants/error-utils.js',
    '<rootDir>/app/scripts/controllers/network/**/*.js',
    '<rootDir>/app/scripts/controllers/network/**/*.ts',
    '!<rootDir>/app/scripts/controllers/network/**/test/*.ts',
    '<rootDir>/app/scripts/controllers/permissions/**/*.js',
    '<rootDir>/app/scripts/controllers/sign.ts',
    '<rootDir>/app/scripts/controllers/decrypt-message.ts',
    '<rootDir>/app/scripts/flask/**/*.js',
    '<rootDir>/app/scripts/lib/**/*.js',
    '<rootDir>/app/scripts/lib/createRPCMethodTrackingMiddleware.js',
    '<rootDir>/app/scripts/migrations/*.js',
    '<rootDir>/app/scripts/migrations/*.ts',
    '!<rootDir>/app/scripts/migrations/*.test.(js|ts)',
    '<rootDir>/app/scripts/platforms/*.js',
    '<rootDir>/shared/**/*.(js|ts|tsx)',
    '<rootDir>/ui/**/*.(js|ts|tsx)',
    '<rootDir>/development/fitness-functions/**/*.test.(js|ts|tsx)',
  ],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['.stories.*', '.snap'],
  coverageReporters: ['html', 'json'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test/test-results/',
        outputName: 'junit.xml',
      },
    ],
  ],
  // TODO: enable resetMocks
  // resetMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/test/setup.js', '<rootDir>/test/env.js'],
  setupFilesAfterEnv: ['<rootDir>/test/jest/setup.js'],
  testMatch: [
    '<rootDir>/app/scripts/constants/error-utils.test.js',
    '<rootDir>/app/scripts/controllers/app-state.test.js',
    '<rootDir>/app/scripts/controllers/mmi-controller.test.js',
    '<rootDir>/app/scripts/controllers/network/**/*.test.js',
    '<rootDir>/app/scripts/controllers/network/**/*.test.ts',
    '<rootDir>/app/scripts/controllers/permissions/**/*.test.js',
    '<rootDir>/app/scripts/controllers/sign.test.ts',
    '<rootDir>/app/scripts/controllers/decrypt-message.test.ts',
    '<rootDir>/app/scripts/flask/**/*.test.js',
    '<rootDir>/app/scripts/lib/**/*.test.js',
    '<rootDir>/app/scripts/lib/**/*.test.ts',
    '<rootDir>/app/scripts/lib/createRPCMethodTrackingMiddleware.test.js',
    '<rootDir>/app/scripts/migrations/*.test.(js|ts)',
    '<rootDir>/app/scripts/platforms/*.test.js',
    '<rootDir>/shared/**/*.test.(js|ts)',
    '<rootDir>/ui/**/*.test.(js|ts|tsx)',
    '<rootDir>/development/fitness-functions/**/*.test.(js|ts|tsx)',
  ],
  testTimeout: 5500,
  // We have to specify the environment we are running in, which is jsdom. The
  // default is 'node'. This can be modified *per file* using a comment at the
  // head of the file. So it may be worthwhile to switch to 'node' in any
  // background tests.
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  workerIdleMemoryLimit: '500MB',
};
