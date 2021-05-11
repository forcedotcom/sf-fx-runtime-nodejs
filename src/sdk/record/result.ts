import {ReferenceId} from "../../sdk-interface-v1";

export class RecordResult {
  readonly referenceId: ReferenceId;
  readonly id: string;

  constructor(referenceId: ReferenceId, id?: string) {
    this.referenceId = referenceId;
    this.id = id;
  }
}
