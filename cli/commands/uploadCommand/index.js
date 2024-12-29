const { program } = require("commander");
const { findAndReadConfigFile } = require("../../utils/fsUtils");
const { upload } = require("./upload");

// NOTE: development purpose only
program.command('upload')
    .requiredOption('-s, --source-file-path <string>', 'path to the file to upload')
    .requiredOption('-t, --target <string>', 'upload target')
    .option('-c, --config <path>', 'set config file name (JS/TS)', 'codepush.config.ts')
    .option('-p, --preserve-file', 'do not delete uploaded file after upload')
    /**
     * @param {Object} options
     * @param {string} options.sourceFilePath
     * @param {string} options.target
     * @param {string} options.preserveFile
     * @param {string} options.config
     * @return {void}
     */
    .action((options) => {
        const config = findAndReadConfigFile(process.cwd(), options.config);

        upload(options.sourceFilePath, options.target,config.fileUploader, {
            deleteAfterUpload: !options.preserveFile,
        })
    });
