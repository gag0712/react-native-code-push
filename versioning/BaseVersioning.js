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
    this.sortedReleaseHistory = Object.entries(releaseHistory)
      .filter(([_, bundle]) => bundle.enabled)
      .sort(this.sortingMethod);
  }

  get sortedMandatoryReleaseHistory() {
    return this.sortedReleaseHistory.filter(([_, bundle]) => bundle.mandatory);
  }

  /**
   * find latest release in releaseHistory
   * @return {[ReleaseVersion, ReleaseInfo]}
   */
  findLatestRelease() {
    const latestReleaseInfo = this.sortedReleaseHistory.at(0);

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
    throw new Error("Method `checkIsMandatory` is not implemented");
  }

  /**
   * determine whether to rollback and execute it
   * @param {ReleaseVersion} runtimeVersion
   * @return {boolean}
   */
  shouldRollback(runtimeVersion) {
    throw new Error("Method `shouldRollback` is not implemented");
  }

  /**
   * Determine whether to clear the currently running bundle.
   * If it returns true, the CodePush bundle will be erased, and the app will restart.
   * @param {ReleaseVersion} runtimeVersion
   * @return {boolean}
   */
  shouldRollbackToBinary(runtimeVersion) {
    const [latestReleaseVersion] = this.findLatestRelease();
    const [firstMajorRelease] = Object.entries(this.originalReleaseHistory)
      .sort(this.sortingMethod)
      .reverse()
      .at(0);

    return (
      runtimeVersion !== latestReleaseVersion &&
      this.shouldRollback(runtimeVersion) &&
      latestReleaseVersion === firstMajorRelease
    );
  }
}
