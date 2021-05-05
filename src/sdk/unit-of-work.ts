import * as crypto from "crypto";
import {
  RecordCreate,
  RecordUpdate,
  RecordDelete,
  RecordCreateResult,
  RecordUpdateResult,
  RecordDeleteResult,
  RecordQueryResult,
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

  constructor(apiVersion: string) {
    this.compositeRequest = new CompositeRequest();
    this.apiVersion = apiVersion;
  }

  private generateReferenceId() {
    return crypto.randomBytes(16).toString("hex");
  }

  /**
   * Registers a record create with this UnitOfWork.
   * @param recordCreate
   */
  addRecordCreate(recordCreate: RecordCreate): ReferenceId {
    const referenceId = this.generateReferenceId();
    const url = `services/data/v${this.apiVersion}/sobjects/${recordCreate.type}`;

    this[referenceId] = new RecordCreateResult(referenceId);

    this.compositeRequest.addSubRequest(
      Method.POST,
      url,
      recordCreate,
      referenceId
    );

    return referenceId;
  }

  /**
   * Registers a record update with this UnitOfWork.
   * @param recordUpdate
   */
  addRecordUpdate(recordUpdate: RecordUpdate): ReferenceId {
    const referenceId = this.generateReferenceId();
    const rowId = recordUpdate.id;
    const url = `services/data/v${this.apiVersion}/sobjects/${recordUpdate.type}/${rowId}`;

    this[referenceId] = new RecordUpdateResult(referenceId, recordUpdate.id);

    this.compositeRequest.addSubRequest(
      Method.PATCH,
      url,
      recordUpdate,
      referenceId
    );

    return referenceId;
  }

  /**
   * Registers a record delete with this UnitOfWork.
   * @param recordDelete
   */
  addRecordDelete(recordDelete: RecordDelete): ReferenceId {
    const referenceId = this.generateReferenceId();
    const rowId = recordDelete.id;
    const url = `services/data/v${this.apiVersion}/sobjects/${recordDelete.type}/${rowId}`;

    this[referenceId] = new RecordDeleteResult(referenceId);

    this.compositeRequest.addSubRequest(
      Method.DELETE,
      url,
      recordDelete,
      referenceId
    );

    return referenceId;
  }

  getRecord(
    referenceId: ReferenceId
  ):
    | RecordCreateResult
    | RecordUpdateResult
    | RecordQueryResult
    | RecordDeleteResult {
    return this[referenceId];
  }

  _getRequestBody(): JsonMap {
    const compositeRequest = this.compositeRequest.getSubRequests();

    return {
      allOrNone: true,
      compositeRequest,
    };
  }

  _commit({ compositeResponse }: any): any {
    compositeResponse.forEach(({ referenceId, body }) => {
      if (body) {
        const recordResult = this[referenceId];
        recordResult.id = body.id;
      }
    });
    return this;
  }
}
