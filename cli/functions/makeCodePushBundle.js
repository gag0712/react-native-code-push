const { randomUUID } = require('crypto');
const path = require('path');
const shell = require('shelljs');
const zip = require('../utils/zip');
const {generatePackageHashFromDirectory} = require('../utils/hash-utils');

/**
 * Create a CodePush bundle file and return the information.
 *
 * @param contentsPath {string} The directory path containing the contents to be made into a CodePush bundle (usually the 'build/CodePush' directory))
 * @return {Promise<{ bundleFileName: string, packageHash: string }>}
 */
async function makeCodePushBundle(contentsPath) {
    const updateContentsZipPath = await zip(contentsPath);

    const bundleFileName = randomUUID();
    shell.mv(updateContentsZipPath, `./${bundleFileName}`);

    const packageHash = await generatePackageHashFromDirectory(contentsPath, path.join(contentsPath, '..'));

    return {
        bundleFileName: bundleFileName,
        packageHash: packageHash,
    };
}

module.exports = { makeCodePushBundle };
