/**
 * code based on appcenter-cli
 */

import * as fs from 'fs';

/**
 *
 * @param path {string}
 * @return {boolean}
 */
export function isDirectory(path) {
    return fs.statSync(path).isDirectory();
}

/**
 *
 * @param length {number}
 * @return {string}
 */
export function generateRandomFilename(length) {
    let filename = '';
    const validChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        filename += validChar.charAt(Math.floor(Math.random() * validChar.length));
    }

    return filename;
}

/**
 *
 * @param filePath {string}
 * @return {string}
 */
export function normalizePath(filePath) {
    //replace all backslashes coming from cli running on windows machines by slashes
    return filePath.replace(/\\/g, '/');
}
