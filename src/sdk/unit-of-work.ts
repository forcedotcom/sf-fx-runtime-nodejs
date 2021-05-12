import * as crypto from "crypto";
import { CompositeRequest } from "./unit-of-work/composite-request";
import { JsonMap } from "@salesforce/ts-types";
import {
  UnitOfWork,
  ReferenceId,
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult,
} from "../sdk-interface-v1";

enum Method {
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export class UnitOfWorkImpl implements UnitOfWork {
  private readonly apiVersion: string;
  private compositeRequest: CompositeRequest;

  readonly records: Map<ReferenceId, RecordModificationResult>;

  constructor(apiVersion: string) {
    this.compositeRequest = new CompositeRequest();
    this.apiVersion = apiVersion;
    this.records = new Map<ReferenceId, RecordModificationResult>();
  }

  registerCreate(record: RecordForCreate): ReferenceId {
    const referenceId = this.generateReferenceId();
    const url = `services/data/v${this.apiVersion}/sobjects/${record.type}`;

    this.compositeRequest.addSubRequest(
      Method.POST,
      url,
      referenceId,
      record
    );

    return referenceId;
  }

  registerUpdate(record: RecordForUpdate): ReferenceId {
    const referenceId = this.generateReferenceId();
    const url = `services/data/v${this.apiVersion}/sobjects/${record.type}/${record.id}`;

    this.records[referenceId] = { id: record.id };

    this.compositeRequest.addSubRequest(
      Method.PATCH,
      url,
      referenceId,
      record
    );

    return referenceId;
  }

  registerDelete(type: string, id: string): ReferenceId {
    const referenceId = this.generateReferenceId();
    const url = `services/data/v${this.apiVersion}/sobjects/${type}/${id}`;

    this.records[referenceId] = { id };

    this.compositeRequest.addSubRequest(
      Method.DELETE,
      url,
      referenceId
    );

    return referenceId;
  }

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

  private generateReferenceId() {
    return crypto.randomBytes(16).toString("hex");
  }
}
