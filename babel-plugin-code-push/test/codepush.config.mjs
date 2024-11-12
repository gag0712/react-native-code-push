import { SemverVersioning } from "@bravemobile/react-native-code-push/versioning/SemverVersioning.js";

class CustomVersioning extends SemverVersioning {
  constructor() {
    super();
  }
}

export default {
  bundleHost: "bundleHost",
  runtimeVersion: "runtimeVersion",
  versioning: CustomVersioning,
  updateChecker: (updateRequest) => {
    // ..my Implementation
  },
};
