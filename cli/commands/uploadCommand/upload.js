/**
 * Uploads the file to the target path using the configured uploader function.
 *
 * @param sourceFilePath {string}
 * @param targetPath {string}
 * @param uploader {function(source: string, target: string): Promise<void>}
 * @param options {{deleteAfterUpload: boolean}}
 * @returns {Promise<void>}
 */
async function upload(
    sourceFilePath,
    targetPath,
    uploader,
    options = {},
) {
    const { deleteAfterUpload = true } = options;

    if (!uploader) {
        console.error('Please implement `fileUploader` function in your config file');
        process.exit(1);
    }

    const codePushBundleFileName = sourceFilePath.split('/').pop();
    if (!codePushBundleFileName) {
        console.error('Please provide a valid path to the file');
        process.exit(1);
    }

    try {
        await uploader(sourceFilePath, targetPath);
    } catch (error) {
        console.error('Error occurred while uploading:', error);
        process.exit(1)
    }

    if (deleteAfterUpload) {
        const fs = require('fs');
        fs.unlinkSync(sourceFilePath);
        console.log(`log: local ${codePushBundleFileName} file deleted after upload.`);
    }
}

module.exports = { upload: upload };
