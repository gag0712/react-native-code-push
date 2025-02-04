const { prepareToBundleJS } = require('../../functions/prepareToBundleJS');
const { runReactNativeBundleCommand } = require('../../functions/runReactNativeBundleCommand');
const { getReactTempDir } = require('../../functions/getReactTempDir');
const { runHermesEmitBinaryCommand } = require('../../functions/runHermesEmitBinaryCommand');
const { makeCodePushBundle } = require('../../functions/makeCodePushBundle');

/**
 * @param platform {string} 'ios' | 'android'
 * @param outputRootPath {string}
 * @param entryFile {string}
 * @param bundleName {string|undefined}
 * @return {Promise<{bundleFileName: string, packageHash: string}>}
 */
async function bundleCodePush(
  platform = 'ios',
  outputRootPath = 'build',
  entryFile = 'index.ts',
  bundleName,
) {
    const OUTPUT_CONTENT_PATH = `${outputRootPath}/CodePush`;
    const BUNDLE_NAME_DEFAULT = platform === 'ios' ? 'main.jsbundle' : 'index.android.bundle';
    const _bundleName = bundleName ? bundleName : BUNDLE_NAME_DEFAULT;
    const SOURCEMAP_OUTPUT = `${outputRootPath}/${_bundleName}.map`;

    prepareToBundleJS({ deleteDirs: [outputRootPath, getReactTempDir()], makeDir: OUTPUT_CONTENT_PATH });

    runReactNativeBundleCommand(
      _bundleName,
      OUTPUT_CONTENT_PATH,
      platform,
      SOURCEMAP_OUTPUT,
      entryFile,
    );
    console.log('log: JS bundling complete');

    await runHermesEmitBinaryCommand(
      _bundleName,
      OUTPUT_CONTENT_PATH,
      SOURCEMAP_OUTPUT,
    );
    console.log('log: Hermes compilation complete');

    const { bundleFileName, packageHash } = await makeCodePushBundle(OUTPUT_CONTENT_PATH);
    console.log(`log: CodePush bundle created (file name: ${bundleFileName})`);

    return { bundleFileName, packageHash }; // returns for release command implementation
}

module.exports = { bundleCodePush: bundleCodePush };
