import { SemverVersioning } from "@bravemobile/react-native-code-push/versioning/SemverVersioning.js";

class Versioning extends SemverVersioning {
  constructor() {
    super();
  }
}

export default {
  bundleHost: "bundleHost",
  runtimeVersion: "runtimeVersion",
  versioning: Versioning,
  updateChecker: (updateRequest) => {
    // ..my Implementation
  },
};
