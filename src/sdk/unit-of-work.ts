import crypto from "crypto";
import {
  RecordCreate,
  RecordUpdate,
  RecordDelete,
  RecordCreateResult,
  RecordUpdateResult,
  RecordDeleteResult,
} from "./records";
import { ReferenceId } from "./types/reference-id";
import { CompositeRequest } from "./unit-of-work/composite-request";
import { UnitOfWorkResult } from "./unit-of-work/result";
import { JsonMap } from "@salesforce/ts-types";

export { UnitOfWorkResult };

enum Method {
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export class UnitOfWork {
  private apiVersion: string;
  private compositeRequest: CompositeRequest;

  constructor(apiVersion) {
    this.compositeRequest = new CompositeRequest();
    this.apiVersion = apiVersion;
  }

  /**
   * Registers a record create with this UnitOfWork.
   * @param recordCreate
   */
  addRecordCreate(recordCreate: RecordCreate): ReferenceId {
    const referenceId = crypto.randomBytes(16).toString("hex");
    this[referenceId] = new RecordCreateResult(referenceId);
    this.compositeRequest.addSubRequest(
      Method.POST,
      this.apiVersion,
      recordCreate
    );

    return referenceId;
  }

  /**
   * Registers a record update with this UnitOfWork.
   * @param recordUpdate
   */
  addRecordUpdate(recordUpdate: RecordUpdate): ReferenceId {
    const referenceId = crypto.randomBytes(16).toString("hex");
    this[referenceId] = new RecordUpdateResult(referenceId);
    this.compositeRequest.addSubRequest(
      Method.PATCH,
      this.apiVersion,
      recordUpdate
    );

    return referenceId;
  }

  /**
   * Registers a record delete with this UnitOfWork.
   * @param recordDelete
   */
  addRecordDelete(recordDelete: RecordDelete): ReferenceId {
    const referenceId = crypto.randomBytes(16).toString("hex");
    this[referenceId] = new RecordDeleteResult(referenceId);
    this.compositeRequest.addSubRequest(
      Method.DELETE,
      this.apiVersion,
      recordDelete
    );

    return referenceId;
  }

  _getRequestBody(): JsonMap {
    const compositeRequest = this.compositeRequest.getSubRequests();

    return {
      allOrNone: true,
      compositeRequest,
    };
  }

  _commit(reqResult: JsonMap): UnitOfWorkResult {
    const unitOfWorkResult = new UnitOfWorkResult();
    return unitOfWorkResult;
  }
}
