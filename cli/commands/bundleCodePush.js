import { prepareToBundleJS } from '../functions/prepareToBundleJS';
import { runReactNativeBundleCommand } from '../functions/runReactNativeBundleCommand';
import { getReactTempDir } from '../functions/getReactTempDir';
import { runHermesEmitBinaryCommand } from '../functions/runHermesEmitBinaryCommand';
import { makeCodePushBundle } from '../functions/makeCodePushBundle';

const platform = 'ios' ;

async function runBundleCodePush() {

    // TODO: Make it configurable via command line arguments
    const OUTPUT_PATH = 'build' ;
    const CONTENTS_PATH = `${OUTPUT_PATH}/CodePush` ;
    const BUNDLE_NAME = platform === 'ios' ? 'main.jsbundle' : 'index.android.bundle';
    const SOURCEMAP_OUTPUT = `${OUTPUT_PATH}/${BUNDLE_NAME}.map` ;

    prepareToBundleJS({ deleteDirs: [OUTPUT_PATH, getReactTempDir()], makeDir: CONTENTS_PATH });

    runReactNativeBundleCommand(
      BUNDLE_NAME,
      CONTENTS_PATH,
      platform,
      SOURCEMAP_OUTPUT,
    );
    console.log('log: JS bundling complete');

    await runHermesEmitBinaryCommand(
      BUNDLE_NAME,
      CONTENTS_PATH,
      SOURCEMAP_OUTPUT,
    );
    console.log('log: Hermes compilation complete');

    const { bundleFileName, packageHash } = await makeCodePushBundle(CONTENTS_PATH);
    console.log(`log: CodePush bundle created (file name: ${bundleFileName})`);


    // TODO: Output packageHash and file name - Required when creating ReleaseHistoryInterface data
}
