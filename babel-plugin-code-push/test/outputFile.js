import { SemverVersioning } from "@bravemobile/react-native-code-push/versioning/SemverVersioning.js";
import codePush from "@bravemobile/react-native-code-push";
codePush({
  bundleHost: "bundleHost",
  runtimeVersion: "runtimeVersion",
  versioning: class CustomVersioning extends SemverVersioning {
    constructor() {
      super();
    }
  },
  updateChecker: updateRequest => {
    // ..my Implementation
  }
});
