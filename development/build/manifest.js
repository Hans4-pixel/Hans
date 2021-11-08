const { promises: fs } = require('fs');
const path = require('path');
const { mergeWith, cloneDeep } = require('lodash');

const baseManifest = require('../../app/manifest/_base.json');
const betaManifestModifications = require('../../app/manifest/_beta_modifications.json');
const flaskManifestModifications = require('../../app/manifest/_flask_modifications.json');

const { createTask, composeSeries } = require('./task');
const { BuildType } = require('./utils');

module.exports = createManifestTasks;

function createManifestTasks({
  browserPlatforms,
  browserVersionMap,
  buildType,
}) {
  // merge base manifest with per-platform manifests
  const prepPlatforms = async () => {
    return Promise.all(
      browserPlatforms.map(async (platform) => {
        const platformModifications = await readJson(
          path.join(
            __dirname,
            '..',
            '..',
            'app',
            'manifest',
            `${platform}.json`,
          ),
        );
        const result = mergeWith(
          cloneDeep(baseManifest),
          platformModifications,
          browserVersionMap[platform],
          getBuildModifications(buildType),
          customArrayMerge,
        );
        const dir = path.join('.', 'dist', platform);
        await fs.mkdir(dir, { recursive: true });
        await writeJson(result, path.join(dir, 'manifest.json'));
      }),
    );
  };

  // dev: add perms
  const envDev = createTaskForModifyManifestForEnvironment((manifest) => {
    manifest.permissions = [...manifest.permissions, 'webRequestBlocking'];
  });

  // testDev: add perms
  const envTestDev = createTaskForModifyManifestForEnvironment((manifest) => {
    manifest.permissions = [
      ...manifest.permissions,
      'webRequestBlocking',
      'http://localhost/*',
    ];
  });

  // test: add permissions
  const envTest = createTaskForModifyManifestForEnvironment((manifest) => {
    manifest.permissions = [
      ...manifest.permissions,
      'webRequestBlocking',
      'http://localhost/*',
    ];
  });

  // high level manifest tasks
  const dev = createTask('manifest:dev', composeSeries(prepPlatforms, envDev));

  const testDev = createTask(
    'manifest:testDev',
    composeSeries(prepPlatforms, envTestDev),
  );

  const test = createTask(
    'manifest:test',
    composeSeries(prepPlatforms, envTest),
  );

  const prod = createTask('manifest:prod', prepPlatforms);

  return { prod, dev, testDev, test };

  // helper for modifying each platform's manifest.json in place
  function createTaskForModifyManifestForEnvironment(transformFn) {
    return () => {
      return Promise.all(
        browserPlatforms.map(async (platform) => {
          const manifestPath = path.join(
            '.',
            'dist',
            platform,
            'manifest.json',
          );
          const manifest = await readJson(manifestPath);
          transformFn(manifest);
          await writeJson(manifest, manifestPath);
        }),
      );
    };
  }

  // helper for merging obj value
  function customArrayMerge(objValue, srcValue) {
    if (Array.isArray(objValue)) {
      return [...new Set([...objValue, ...srcValue])];
    }
    return undefined;
  }
}

// helper for reading and deserializing json from fs
async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

// helper for serializing and writing json to fs
async function writeJson(obj, file) {
  return fs.writeFile(file, JSON.stringify(obj, null, 2));
}

function getBuildModifications(buildType) {
  const buildModifications = {};
  if (buildType === BuildType.beta) {
    Object.assign(buildModifications, betaManifestModifications);
  } else if (buildType === BuildType.flask) {
    Object.assign(buildModifications, flaskManifestModifications);
  }
  return buildModifications;
}
