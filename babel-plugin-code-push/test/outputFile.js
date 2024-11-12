import { SemverVersioning } from "@bravemobile/react-native-code-push/versioning/SemverVersioning.js";
import codePush from "@bravemobile/react-native-code-push";
codePush({
  bundleHost: "bundleHost",
  runtimeVersion: "runtimeVersion",
  versioning: class Versioning extends SemverVersioning {
    constructor() {
      super();
    }
  },
  updateChecker: updateRequest => {
    // ..my Implementation
  }
});
