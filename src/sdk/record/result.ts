import { ReferenceId } from "../types/reference-id";

export class RecordResult {
  readonly id: ReferenceId;

  constructor(id: string) {
    this.id = id;
  }
}
