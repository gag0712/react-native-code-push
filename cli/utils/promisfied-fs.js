/**
 * code based on appcenter-cli
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 *
 * @param dir {string}
 * @return {Promise<string[]>}
 */
export async function walk(dir) {
    const stats = await fs.stat(dir);
    if (stats.isDirectory()) {
        /**
         * @type {string[]}
         */
        let files = [];
        for (const file of await fs.readdir(dir)) {
            files = files.concat(await walk(path.join(dir, file)));
        }
        return files;
    } else {
        return [dir];
    }
}
