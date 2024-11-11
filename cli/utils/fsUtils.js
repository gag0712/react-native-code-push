const fs = require("fs");
const path = require("path");
const { configFileName } = require("../constant");

function findAndReadConfigFile(startDir) {
  let dir = startDir;

  while (dir !== path.parse(dir).root) {
    const configPath = path.join(dir, configFileName);
    if (fs.existsSync(configPath)) {
      const config = require(configPath);
      return config;
    }
    dir = path.dirname(dir);
  }

  console.error(`${configFileName} not found.`);
  return null;
}

module.exports = { findAndReadConfigFile };
