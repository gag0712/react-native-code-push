const { BaseVersioning } = require("./BaseVersioning.js");

class IncrementalVersioning extends BaseVersioning {
  constructor(releaseHistory) {
    super(releaseHistory, (v1, v2) => Number(v2) - Number(v1));
  }
}

module.exports = { IncrementalVersioning };
