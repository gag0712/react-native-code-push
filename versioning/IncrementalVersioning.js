import { BaseVersioning } from "./BaseVersioning";

export class IncrementalVersioning extends BaseVersioning {
  constructor(releaseHistory) {
    super(releaseHistory, ([v1], [v2]) => Number(v2) - Number(v1));

    // console.debug(releaseHistory, this.sortedReleaseHistory);
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
    return Number(latestMandatoryVersion) > Number(runtimeVersion);
  }

  shouldRollback(runtimeVersion) {
    // Latest version is less than installed version = Rollback -> mandatory
    const [latestReleaseVersion] = this.findLatestRelease();
    return Number(latestReleaseVersion) < Number(runtimeVersion);
  }

  shouldRollbackToLatestMajorVersion(runtimeVersion, latestReleaseVersion) {}
}
