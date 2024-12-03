#!/usr/bin/env node

const { program, Option } = require("commander");
const shell = require("shelljs");
const { showLogo } = require("./utils/showLogo");
const { findAndReadConfigFile } = require("./utils/fsUtils");
const { runBundleCodePush } = require('./commands/bundleCodePush')

shell.set("-e");
shell.set("-v");

program
  .name("@bravemobile/react-native-code-push CLI")
  .description("Command line interface for @bravemobile/react-native-code-push")
  .version("1.0.0")
  .action(async () => {
    showLogo();
    const config = findAndReadConfigFile(process.cwd());

    // TODO: implement interactive mode
  });

program.command('bundle')
  .description('Creating CodePush bundle file. (assumes that Hermes is enabled.)')
  .addOption(new Option('-p, --platform <type>', 'platform').choices(['ios', 'android']).default('ios'))
  .option('-o, --output-path <string>', 'path to output root directory', 'build')
  .option('-e, --entry-file <string>', 'path to JS/TS entry file', 'index.ts')
  .option('-b, --bundle-name <string>', 'bundle file name (default-ios: "main.jsbundle" / default-android: "index.android.bundle")')
  /**
   * @param {Object} options
   * @param {string} options.platform
   * @param {string} options.outputPath
   * @param {string} options.entryFile
   * @param {string} options.bundleName
   * @return {void}
   */
  .action((options) => {
    runBundleCodePush(
      options.platform,
      options.outputPath,
      options.entryFile,
      options.bundleName,
    )
  });

program.parse();
