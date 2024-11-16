import { randomUUID } from 'crypto';
import path from 'path';
import shell from 'shelljs';
import zip from '../utils/zip';
import {generatePackageHashFromDirectory} from '../utils/hash-utils';

/**
 * Create a CodePush bundle file and return the information.
 *
 * @param contentsPath {string} The directory path containing the contents to be made into a CodePush bundle (usually the 'build/CodePush' directory))
 * @return {Promise<{ bundleFileName: string, packageHash: string }>}
 */
export async function makeCodePushBundle(contentsPath) {
    const updateContentsZipPath = await zip(contentsPath);

    const bundleFileName = randomUUID();
    shell.mv(updateContentsZipPath, `./${bundleFileName}`);

    const packageHash = await generatePackageHashFromDirectory(contentsPath, path.join(contentsPath, '..'));

    return {
        bundleFileName: bundleFileName,
        packageHash: packageHash,
    };
}
