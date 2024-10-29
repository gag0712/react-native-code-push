import Semver from 'semver'
import { BaseVersioning } from './BaseVersioning';

export class SemverVersioning extends BaseVersioning {
  static findLatestRelease(releaseHistory) {
    const latestReleaseInfo = Object.entries(releaseHistory)
      .filter(([_, bundle]) => bundle.enabled)
      // Sort so that a latest version comes first (1.2.0 > 1.1.0 > 1.0.1 > 1.0.0)
      .sort(([v1], [v2]) => (Semver.gt(v1, v2) ? -1 : 1))
      .at(0);
  
    if (!latestReleaseInfo) {
      throw new Error("There is no latest release.");
    }
  
    return latestReleaseInfo;
  }

  static checkIsMandatory(runtimeVersion, releaseHistory) {
    const sortedMandatoryReleases = Object.entries(releaseHistory)
      .filter(([_, bundle]) => bundle.enabled)
      .sort(([v1], [v2]) => (Semver.gt(v1, v2) ? -1 : 1))
      .filter(([_, bundle]) => bundle.mandatory);
  
    if (sortedMandatoryReleases.length === 0) {
      return false;
    }
  
    // When latest mandatory version >= current version -> mandatory
    const [latestMandatoryVersion, _] = sortedMandatoryReleases[0];
    return Semver.gt(latestMandatoryVersion, runtimeVersion);
  }

  static shouldRollback(runtimeVersion, latestReleaseVersion) {
    // Latest version is less than installed version = Rollback -> mandatory
    return Semver.lt(latestReleaseVersion, runtimeVersion);
  }
}
