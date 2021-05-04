import { ReferenceId } from "../types/reference-id";

export class RecordResult {
  readonly referenceId: ReferenceId;

  constructor(id: ReferenceId) {
    this.referenceId = id;
  }
}
