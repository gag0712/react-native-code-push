/**
 * @type {BaseVersioning}
 */
export class BaseVersioning {
    constructor() {
        if (this.constructor == BaseVersioning) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    /**
     * find latest release in releaseHistory
     * @param {ReleaseHistoryInterface} releaseHistory
     * @return {[ReleaseVersion, ReleaseInfo]}
     */
    static findLatestRelease(releaseHistory) {
        throw new Error('Method `findLatestRelease` is not implemented')
    }

    /**
     * check if the update is mandatory
     * @param {ReleaseVersion} runtimeVersion
     * @param {ReleaseHist oryInterface} releaseHistory
     * @return {boolean}
     */
    static checkIsMandatory(runtimeVersion, releaseHistory) {
        throw new Error('Method `checkIsMandatory` is not implemented')
    }

    /**
     * determine whether to rollback and execute it
     * @param {ReleaseVersion} runtimeVersion
     * @param {ReleaseVersion} latestReleaseVersion
     * @return {boolean}
     */
    static shouldRollback(runtimeVersion, latestReleaseVersion) {
        throw new Error('Method `shouldRollback` is not implemented')
    }

    /**
     * determine whether to rollback and execute it
     * @param {ReleaseVersion} runtimeVersion
     * @param {ReleaseVersion} latestReleaseVersion
     * @return {boolean}
     */
    static shouldRollbackToLatestMajorVersion(runtimeVersion, latestReleaseVersion) {
        throw new Error('Method `shouldRollbackToLatestMajorVersion` is not implemented')
    }
}
