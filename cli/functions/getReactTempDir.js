/**
 * code based on appcenter-cli
 */

import os from 'os';

/**
 * Return the path of the temporary directory for react-native bundling
 *
 * @return {string}
 */
export function getReactTempDir() {
    return `${os.tmpdir()}/react-*`;
}
