import { BaseVersioning } from "./BaseVersioning.js";

export class IncrementalVersioning extends BaseVersioning {
  constructor(releaseHistory) {
    super(releaseHistory, (v1, v2) => Number(v2) - Number(v1));
  }
}
