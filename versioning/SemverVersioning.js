import Semver from "semver";
import { BaseVersioning } from "./BaseVersioning";

export class SemverVersioning extends BaseVersioning {
  constructor(releaseHistory) {
    super(releaseHistory, ([v1], [v2]) => (Semver.gt(v1, v2) ? -1 : 1));
  }

  findLatestRelease() {
    const latestReleaseInfo = this.sortedReleaseHistory.at(0);

    if (!latestReleaseInfo) {
      throw new Error("There is no latest release.");
    }

    return latestReleaseInfo;
  }

  checkIsMandatory(runtimeVersion) {
    if (this.sortedMandatoryReleaseHistory.length === 0) {
      return false;
    }

    // When latest mandatory version >= current version -> mandatory
    const [latestMandatoryVersion, _] = this.sortedMandatoryReleaseHistory[0];
    return Semver.gt(latestMandatoryVersion, runtimeVersion);
  }

  shouldRollback(runtimeVersion) {
    // Latest version is less than installed version = Rollback -> mandatory
    const [latestReleaseVersion] = this.findLatestRelease();
    return Semver.lt(latestReleaseVersion, runtimeVersion);
  }
}
