import { EXCLUDE_E2E_TESTS_REGEX, JS_REGEX } from './constants';

describe('Regular Expressions used in Fitness Functions', (): void => {
  describe(`EXCLUDE_E2E_TESTS_REGEX "${EXCLUDE_E2E_TESTS_REGEX}"`, (): void => {
    const PATHS_IT_SHOULD_MATCH = [
      'file.js',
      'path/file.js',
      'much/longer/path/file.js',
      'file.ts',
      'path/file.ts',
      'much/longer/path/file.ts',
      'file.jsx',
      'path/file.jsx',
      'much/longer/path/file.jsx',
    ];

    const PATHS_IT_SHOULD_NOT_MATCH = [
      // any without JS, TS, JSX or TSX extension
      'file',
      'file.extension',
      'path/file.extension',
      'much/longer/path/file.extension',
      // any in the test/e2e directory
      'test/e2e/file',
      'test/e2e/file.extension',
      'test/e2e/path/file.extension',
      'test/e2e/much/longer/path/file.extension',
      'test/e2e/file.js',
      'test/e2e/path/file.ts',
      'test/e2e/much/longer/path/file.jsx',
      'test/e2e/much/longer/path/file.tsx',
      // any in the development/fitness-functions directory
      'development/fitness-functions/file',
      'development/fitness-functions/file.extension',
      'development/fitness-functions/path/file.extension',
      'development/fitness-functions/much/longer/path/file.extension',
      'development/fitness-functions/file.js',
      'development/fitness-functions/path/file.ts',
      'development/fitness-functions/much/longer/path/file.jsx',
      'development/fitness-functions/much/longer/path/file.tsx',
    ];

    describe('included paths', (): void => {
      PATHS_IT_SHOULD_MATCH.forEach((path: string): void => {
        it(`should match "${path}"`, (): void => {
          const result = EXCLUDE_E2E_TESTS_REGEX.test(path);
          expect(result).toStrictEqual(true);
        });
      });
    });

    describe('excluded paths', (): void => {
      PATHS_IT_SHOULD_NOT_MATCH.forEach((path: string): void => {
        it(`should not match "${path}"`, (): void => {
          const result = EXCLUDE_E2E_TESTS_REGEX.test(path);
          expect(result).toStrictEqual(false);
        });
      });
    });
  });

  describe(`JS_REGEX "${JS_REGEX}"`, (): void => {
    const PATHS_IT_SHOULD_MATCH = [
      'file.js',
      'webpack/path/file.js',
      'development/much/longer/path/file.js',
      'test/file.jsx',
      'lib/path/file.jsx',
      'app/much/longer/path/file.jsx',
    ];

    const PATHS_IT_SHOULD_NOT_MATCH = [
      // any without JS or JSX extension
      'file',
      'file.extension',
      'path/file.extension',
      'much/longer/path/file.extension',
      'file.ts',
      'path/file.ts',
      'much/longer/path/file.tsx',
    ];

    describe('included paths', (): void => {
      PATHS_IT_SHOULD_MATCH.forEach((path: string): void => {
        it(`should match "${path}"`, (): void => {
          const result = JS_REGEX.test(path);
          expect(result).toStrictEqual(true);
        });
      });
    });

    describe('excluded paths', (): void => {
      PATHS_IT_SHOULD_NOT_MATCH.forEach((path: string): void => {
        it(`should not match "${path}"`, (): void => {
          const result = JS_REGEX.test(path);
          expect(result).toStrictEqual(false);
        });
      });
    });
  });
});
