#!/usr/bin/env node

const { program } = require("commander");
const shell = require("shelljs");
const { showLogo } = require("./utils/showLogo");
const { findAndReadConfigFile } = require("./utils/fsUtils");

shell.set("-e");
shell.set("-v");

program
  .name("@bravemobile/react-native-code-push CLI")
  .description("Command line interface for @bravemobile/react-native-code-push")
  .version("1.0.0")
  .action(async () => {
    showLogo();
    const config = findAndReadConfigFile(process.cwd());
  });

program.parse();
