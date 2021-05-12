import {
  UnitOfWork,
  ReferenceId,
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult,
} from "../sdk-interface-v1";
import {
  CompositeSubRequest,
  CreateRecordSubRequest,
  DeleteRecordSubRequest,
  UpdateRecordSubRequest,
} from "./sub-request";

export class UnitOfWorkImpl implements UnitOfWork {
  private readonly apiVersion: string;
  private readonly _subrequests: ReferenceIdSubrequestTuple[] = [];
  private referenceIdCounter = 0;

  constructor(apiVersion: string) {
    this.apiVersion = apiVersion;
  }

  registerCreate(record: RecordForCreate): ReferenceId {
    const referenceId = this.generateReferenceId();
    this._subrequests.push({
      referenceId,
      subrequest: new CreateRecordSubRequest(record),
    });
    return referenceId;
  }

  registerDelete(type: string, id: string): ReferenceId {
    const referenceId = this.generateReferenceId();
    this._subrequests.push({
      referenceId,
      subrequest: new DeleteRecordSubRequest(type, id),
    });
    return referenceId;
  }

  registerUpdate(record: RecordForUpdate): ReferenceId {
    const referenceId = this.generateReferenceId();
    this._subrequests.push({
      referenceId,
      subrequest: new UpdateRecordSubRequest(record),
    });
    return referenceId;
  }

  get subrequests(): ReferenceIdSubrequestTuple[] {
    return this._subrequests;
  }

  private generateReferenceId() {
    const referenceId = "referenceId" + this.referenceIdCounter;
    this.referenceIdCounter = this.referenceIdCounter + 1;

    return referenceId;
  }
}

export type ReferenceIdSubrequestTuple = {
  referenceId: ReferenceId;
  subrequest: CompositeSubRequest<RecordModificationResult>;
};
