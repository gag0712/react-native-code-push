const { BaseVersioning } = require("./BaseVersioning");
const { SemverVersioning } = require("./SemverVersioning");
const { IncrementalVersioning } = require("./IncrementalVersioning");

module.exports = {
  SemverVersioning,
  BaseVersioning,
  IncrementalVersioning,
};
