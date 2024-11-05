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

    this.originalReleaseHistory = releaseHistory;
    this.sortedReleaseHistory = Object.entries(releaseHistory).filter(
      ([_, bundle]) => bundle.enabled
    );

    if (sortingMethod && typeof sortingMethod === "function") {
      this.sortedReleaseHistory.sort(sortingMethod);
    }
  }

  get sortedMandatoryReleaseHistory() {
    return this.sortedReleaseHistory.filter(([_, bundle]) => bundle.mandatory);
  }

  /**
   * find latest release in releaseHistory
   * @return {[ReleaseVersion, ReleaseInfo]}
   */
  findLatestRelease() {
    throw new Error("Method `findLatestRelease` is not implemented");
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
   * determine whether to rollback and execute it
   * @param {ReleaseVersion} runtimeVersion
   * @return {boolean}
   */
  shouldRollbackToLatestMajorVersion(runtimeVersion) {
    throw new Error(
      "Method `shouldRollbackToLatestMajorVersion` is not implemented"
    );
  }
}
