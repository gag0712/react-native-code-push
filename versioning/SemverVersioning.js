import Semver from "semver";
import { BaseVersioning } from "./BaseVersioning";

export class SemverVersioning extends BaseVersioning {
  constructor(releaseHistory) {
    super(releaseHistory, (v1, v2) => (Semver.gt(v1, v2) ? -1 : 1));
  }
}
