import {
  RecordCreateResult,
  RecordUpdateResult,
  RecordDeleteResult
} from "../records";
import { ReferenceId } from "../types/reference-id";

export class UnitOfWorkResult {
  private results: {
    [key: string]: RecordCreateResult | RecordUpdateResult | RecordDeleteResult
  }

  getRecord(id: ReferenceId): any {
    return this.results[id];
  }
}
