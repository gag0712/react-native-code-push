/**
 * @type {BaseVersioning}
 */
export class BaseVersioning {
  /**
   * @param {ReleaseHistoryInterface} releaseHistory
   * @param {SortingMethod} sortingMethod
   */
  constructor(releaseHistory, sortingMethod) {
    if (this.constructor == BaseVersioning) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    if (releaseHistory == null) {
      throw new Error("param releaseHistory is needed");
    }

    this.sortingMethod = sortingMethod ?? (() => 0);
    this.originalReleaseHistory = releaseHistory;
    this.sortedReleaseHistory = Object.entries(releaseHistory).sort(
      ([a], [b]) => this.sortingMethod(a, b)
    );
  }

  get sortedEnabledReleaseHistory() {
    return this.sortedReleaseHistory.filter(([_, bundle]) => bundle.enabled);
  }

  get sortedMandatoryReleaseHistory() {
    return this.sortedEnabledReleaseHistory.filter(
      ([_, bundle]) => bundle.mandatory
    );
  }

  /**
   * find latest release in releaseHistory
   * @return {[ReleaseVersion, ReleaseInfo]}
   */
  findLatestRelease() {
    const latestReleaseInfo = this.sortedEnabledReleaseHistory.at(0);

    if (!latestReleaseInfo) {
      throw new Error("There is no latest release.");
    }

    return latestReleaseInfo;
  }

  /**
   * check if the update is mandatory
   * @param {ReleaseVersion} runtimeVersion
   * @return {boolean}
   */
  checkIsMandatory(runtimeVersion) {
    if (this.sortedMandatoryReleaseHistory.length === 0) {
      return false;
    }

    const [latestMandatoryVersion, _] = this.sortedMandatoryReleaseHistory[0];
    const [larger] = [latestMandatoryVersion, runtimeVersion].sort(
      this.sortingMethod
    );

    return (
      runtimeVersion !== latestMandatoryVersion &&
      larger === latestMandatoryVersion
    );
  }

  /**
   * determine whether to rollback and execute it
   * @param {ReleaseVersion} runtimeVersion
   * @return {boolean}
   */
  shouldRollback(runtimeVersion) {
    const [latestRelease] = this.findLatestRelease();
    const [larger] = [latestRelease, runtimeVersion].sort(this.sortingMethod);

    return runtimeVersion !== latestRelease && larger === runtimeVersion;
  }

  /**
   * Determine whether to clear the currently running bundle.
   * If it returns true, the CodePush bundle will be erased, and the app will restart.
   * @param {ReleaseVersion} runtimeVersion
   * @return {boolean}
   */
  shouldRollbackToBinary(runtimeVersion) {
    const [latestReleaseVersion] = this.findLatestRelease();
    const [firstMajorRelease] = this.sortedReleaseHistory.at(-1);

    return (
      runtimeVersion !== latestReleaseVersion &&
      this.shouldRollback(runtimeVersion) &&
      latestReleaseVersion === firstMajorRelease
    );
  }
}
