import crypto from "crypto";
import {
  RecordCreate,
  RecordModification,
  RecordDelete,
  RecordCreateResult,
  RecordModificationResult,
  RecordDeleteResult,
} from "./records";
import { ReferenceId } from "./types/reference-id";
import { CompositeRequest } from "./unit-of-work/composite-request";

export class UnitOfWork {
  private compositeRequest: CompositeRequest;

  constructor() {
    this.compositeRequest = new CompositeRequest();
  }

  /**
   * Registers a record create with this UnitOfWork.
   * @param recordCreate
   */
  create(recordCreate: RecordCreate): ReferenceId {
    const referenceId = crypto.randomBytes(16).toString("hex");
    this[referenceId] = new RecordCreateResult(referenceId);

    return referenceId;
  }

  /**
   * Registers a record update with this UnitOfWork.
   * @param recordUpdate
   */
  update(recordUpdate: RecordModification): ReferenceId {
    const referenceId = crypto.randomBytes(16).toString("hex");
    this[referenceId] = new RecordModificationResult(referenceId);

    return referenceId;
  }

  /**
   * Registers a record delete with this UnitOfWork.
   * @param recordDelete
   */
   delete(recordDelete: RecordDelete): ReferenceId {
    const referenceId = crypto.randomBytes(16).toString("hex");
    this[referenceId] = new RecordDeleteResult(referenceId);

    return referenceId;
  }


  commit(): UnitOfWork {
    this.compositeRequest.exec();
    return this;
  }
}
