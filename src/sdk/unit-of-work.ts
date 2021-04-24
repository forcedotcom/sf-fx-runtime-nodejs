import { RecordCreate, RecordModification } from "./records";
import { ReferenceId } from "./types/reference-id";

/**
 * @interface UnitOfWork
 */
export interface UnitOfWork {
  /**
   * Registers a record insert with this UnitOfWork.
   * @param recordInsert
   */
  insert(recordInsert: RecordCreate): ReferenceId;

  /**
   * Registers a record update with this UnitOfWork.
   * @param recordUpdate
   */
  update(recordUpdate: RecordModification): ReferenceId;
}
