const { program, Option } = require("commander");
const { findAndReadConfigFile } = require("../../utils/fsUtils");
const { createReleaseHistory } = require("./createReleaseHistory");

program.command('create-history')
    .description('Create a new release history for the binary app.')
    .requiredOption('-v, --target-version <string>', 'target app binary version')
    .addOption(new Option('-p, --platform <type>', 'platform').choices(['ios', 'android']).default('ios'))
    .option('-i, --identifier <string>', 'additional characters to identify the release')
    .option('-c, --config <path>', 'set config file name (JS/TS)', 'code-push.config.ts')
    /**
     * @param {Object} options
     * @param {string} options.targetVersion
     * @param {string} options.platform
     * @param {string} options.identifier
     * @param {string} options.config
     * @return {void}
     */
    .action(async (options) => {
        const config = findAndReadConfigFile(process.cwd(), options.config);

        await createReleaseHistory(
            options.targetVersion,
            config.setReleaseHistory,
            options.platform,
            options.identifier
        );
    });
