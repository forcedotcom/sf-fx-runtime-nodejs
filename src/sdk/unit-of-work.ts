import {
  RecordCreate,
  RecordModification,
  RecordCreateResult,
  RecordModificationResult,
  RecordDeleteResult,
} from "./records";
import { ReferenceId } from "./types/reference-id";

export interface UnitOfWorkResult {
  [key: string]:
    | RecordCreateResult
    | RecordModificationResult
    | RecordDeleteResult;
}

export class UnitOfWork {
  private records?:
    | RecordCreateResult[]
    | RecordModificationResult[]
    | RecordDeleteResult[];

  constructor() {
    this.records = [];
  }

  /**
   * Registers a record insert with this UnitOfWork.
   * @param recordInsert
   */
  insert(recordInsert: RecordCreate): ReferenceId {
    // Not implemented!
    return "reference-id";
  }

  /**
   * Registers a record update with this UnitOfWork.
   * @param recordUpdate
   */
  update(recordUpdate: RecordModification): ReferenceId {
    // Not implemented!
    return "reference-id";
  }
}
