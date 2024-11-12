const {
  SemverVersioning,
} = require("@bravemobile/react-native-code-push/versioning");

class CustomVersioning extends SemverVersioning {
  constructor() {
    super();
  }
}

module.exports = {
  bundleHost: "bundleHost",
  runtimeVersion: "runtimeVersion",
  versioning: CustomVersioning,
  updateChecker: (updateRequest) => {
    // ..my Implementation
  },
};
