import * as crypto from "crypto";
import { CompositeRequest } from "./unit-of-work/composite-request";
import { UnitOfWorkResult } from "./unit-of-work/result";
import { JsonMap } from "@salesforce/ts-types";
import {
  UnitOfWork,
  ReferenceId,
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult,
} from "../sdk-interface-v1";

export { UnitOfWorkResult };

enum Method {
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export class UnitOfWorkImpl implements UnitOfWork {
  private apiVersion: string;
  private compositeRequest: CompositeRequest;

  readonly records: Map<ReferenceId, RecordModificationResult>;

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
  registerCreate(recordCreate: RecordForCreate): ReferenceId {
    const referenceId = this.generateReferenceId();
    const url = `services/data/v${this.apiVersion}/sobjects/${recordCreate.type}`;

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
  registerUpdate(recordUpdate: RecordForUpdate): ReferenceId {
    const referenceId = this.generateReferenceId();
    const rowId = recordUpdate.id;
    const url = `services/data/v${this.apiVersion}/sobjects/${recordUpdate.type}/${rowId}`;

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
  registerDelete(type: string, id: string): ReferenceId {
    const referenceId = this.generateReferenceId();
    const url = `services/data/v${this.apiVersion}/sobjects/${type}/${id}`;

    this.compositeRequest.addSubRequest(
      Method.DELETE,
      url,
      null, // TODO
      referenceId
    );

    return referenceId;
  }

  /**
   * Retrieves a record corresponding to the ReferenceID.
   * @param referenceId
   */
  getRecord(referenceId: ReferenceId): RecordModificationResult {
    return this.records[referenceId];
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
      if (!this.records[referenceId]) this.records[referenceId] = {};

      if (body && body.id) this.records[referenceId].id = body.id;
    });
    return this.records;
  }
}
