const semver = require('semver');
const { BuildType } = require('../lib/build-type');
const { BUILD_TARGETS, ENVIRONMENT } = require('./constants');

/**
 * Returns whether the current build is a development build or not.
 *
 * @param {BUILD_TARGETS} buildTarget - The current build target.
 * @returns Whether the current build is a development build.
 */
function isDevBuild(buildTarget) {
  return (
    buildTarget === BUILD_TARGETS.DEV || buildTarget === BUILD_TARGETS.TEST_DEV
  );
}

/**
 * Returns whether the current build is an e2e test build or not.
 *
 * @param {BUILD_TARGETS} buildTarget - The current build target.
 * @returns Whether the current build is an e2e test build.
 */
function isTestBuild(buildTarget) {
  return (
    buildTarget === BUILD_TARGETS.TEST || buildTarget === BUILD_TARGETS.TEST_DEV
  );
}

/**
 * Map the current version to a format that is compatible with each browser.
 *
 * The given version number is assumed to be a SemVer version number. Additionally, if the version
 * has a prerelease component, it is assumed to have the format "<build type>.<build version",
 * where the build version is a positive integer.
 *
 * @param {string[]} platforms - A list of browsers to generate versions for.
 * @param {string} version - The current version.
 * @returns {object} An object with the browser as the key and the browser-specific version object
 * as the value.  For example, the version `9.6.0-beta.1` would return the object
 * `{ firefox: { version: '9.6.0.beta1' }, chrome: { version: '9.6.0.1', version_name: '9.6.0-beta.1' } }`.
 */
function getBrowserVersionMap(platforms, version) {
  const major = semver.major(version);
  const minor = semver.minor(version);
  const patch = semver.patch(version);
  const prerelease = semver.prerelease(version);

  let buildType;
  let buildVersion;
  if (prerelease) {
    if (prerelease.length !== 2) {
      throw new Error(`Invalid prerelease version: '${prerelease.join('.')}'`);
    }
    [buildType, buildVersion] = prerelease;
    if (!String(buildVersion).match(/^\d+$/u)) {
      throw new Error(`Invalid prerelease build version: '${buildVersion}'`);
    } else if (![BuildType.beta, BuildType.flask].includes(buildType)) {
      throw new Error(`Invalid prerelease build type: ${buildType}`);
    }
  }

  return platforms.reduce((platformMap, platform) => {
    const versionParts = [major, minor, patch];
    const browserSpecificVersion = {};
    if (prerelease) {
      if (platform === 'firefox') {
        versionParts[2] = `${versionParts[2]}${buildType}${buildVersion}`;
      } else {
        versionParts.push(buildVersion);
        browserSpecificVersion.version_name = version;
      }
    }
    browserSpecificVersion.version = versionParts.join('.');
    platformMap[platform] = browserSpecificVersion;
    return platformMap;
  }, {});
}

/**
 * Get the environment of the current build.
 *
 * @param {object} options - Build options.
 * @param {BUILD_TARGETS} options.buildTarget - The target of the current build.
 * @returns {ENVIRONMENT} The current build environment.
 */
function getEnvironment({ buildTarget }) {
  // get environment slug
  if (buildTarget === BUILD_TARGETS.PROD) {
    return ENVIRONMENT.PRODUCTION;
  } else if (isDevBuild(buildTarget)) {
    return ENVIRONMENT.DEVELOPMENT;
  } else if (isTestBuild(buildTarget)) {
    return ENVIRONMENT.TESTING;
  } else if (
    /^Version-v(\d+)[.](\d+)[.](\d+)/u.test(process.env.CIRCLE_BRANCH)
  ) {
    return ENVIRONMENT.RELEASE_CANDIDATE;
  } else if (process.env.CIRCLE_BRANCH === 'develop') {
    return ENVIRONMENT.STAGING;
  } else if (process.env.CIRCLE_PULL_REQUEST) {
    return ENVIRONMENT.PULL_REQUEST;
  }
  return ENVIRONMENT.OTHER;
}

/**
 * Log an error to the console.
 *
 * This function includes a workaround for a SES bug that results in errors
 * being printed to the console as `{}`. The workaround is to print the stack
 * instead, which does work correctly.
 *
 * @see {@link https://github.com/endojs/endo/issues/944}
 * @param {Error} error - The error to print
 */
function logError(error) {
  console.error(error.stack || error);
}

function wrapAgainstScuttling(content) {
  return `
(function () {

  const fetch = window.fetch
  fetch.bind = function (b) {
    return Function.prototype.bind.call(this, window)
  }
  fetch.apply = function () {
    const args = [].slice.call(arguments)
    if (args[0] === p) {
      args[0] = window
    }
    return fetch.call(args[0], args[1][0], args[1][1], args[1][2])
  }
  const allowed = {
    navigator,
    location,
    Uint16Array,
    fetch,
    String,
    Math,
    Object,
    Symbol,
    Function,
    Array,
    Boolean,
    Request,
    Date,
    document,
    JSON,
    encodeURIComponent,
    clearTimeout: clearTimeout.bind(window),
    setTimeout: setTimeout.bind(window),
    crypto,
    __SENTRY__: {logger: undefined},
    sentryHooks: 1,
    sentry: 1,
    appState: 1,
    stateHooks: 1,
    extra: {appState: undefined},
  };
  allowed.window = allowed;
  const p = new Proxy(allowed, {
    get: function (a, b, c) {
      return allowed[b] || Reflect.get(a, b)
    },
    set: (a, b, c) => {
      if (allowed[b] || b.startsWith('on')) {
        return allowed[b] = window[b] = c;
      }
    }
  })
  with (p) {
    with ({window: p, self: p}) {
     ${content}
    }
  }
}());
      `;
}

module.exports = {
  getBrowserVersionMap,
  getEnvironment,
  isDevBuild,
  isTestBuild,
  logError,
  wrapAgainstScuttling,
};
