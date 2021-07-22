import {
  UnitOfWork,
  ReferenceId,
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult,
} from "sf-fx-sdk-nodejs";
import {
  CompositeSubRequest,
  CreateRecordSubRequest,
  DeleteRecordSubRequest,
  UpdateRecordSubRequest,
} from "./sub-request";

export class UnitOfWorkImpl implements UnitOfWork {
  private readonly apiVersion: string;
  private readonly _subrequests: [
    ReferenceId,
    CompositeSubRequest<RecordModificationResult>
  ][] = [];
  private referenceIdCounter = 0;

  constructor(apiVersion: string) {
    this.apiVersion = apiVersion;
  }

  registerCreate(record: RecordForCreate): ReferenceId {
    const referenceId = this.generateReferenceId();
    this._subrequests.push([referenceId, new CreateRecordSubRequest(record)]);

    return referenceId;
  }

  registerDelete(type: string, id: string): ReferenceId {
    const referenceId = this.generateReferenceId();
    this._subrequests.push([referenceId, new DeleteRecordSubRequest(type, id)]);

    return referenceId;
  }

  registerUpdate(record: RecordForUpdate): ReferenceId {
    const referenceId = this.generateReferenceId();
    this._subrequests.push([referenceId, new UpdateRecordSubRequest(record)]);

    return referenceId;
  }

  get subrequests(): [
    ReferenceId,
    CompositeSubRequest<RecordModificationResult>
  ][] {
    return this._subrequests;
  }

  private generateReferenceId() {
    const referenceId = "referenceId" + this.referenceIdCounter;
    this.referenceIdCounter = this.referenceIdCounter + 1;

    return referenceId;
  }
}
