import { ReferenceId } from "../types/reference-id";

export class RecordResult {
  readonly referenceId: ReferenceId;
  readonly id: string;

  constructor(referenceId: ReferenceId, id?: string) {
    this.referenceId = referenceId;
    this.id = id;
  }
}
