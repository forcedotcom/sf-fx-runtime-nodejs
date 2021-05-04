import { RecordCreate, RecordUpdate, RecordDelete } from "../records";
import { ReferenceId } from "../types/reference-id";

export class SubRequest {
  private method: string;
  private referenceId: ReferenceId;
  private url: string;

  constructor(
    method: string,
    apiVersion: string,
    record: RecordCreate | RecordUpdate | RecordDelete,
    referenceId: ReferenceId
  ) {
    this.url = this.createUrl(apiVersion, record);
    this.referenceId = referenceId;
    this.method = method;
  }

  createUrl(
    apiVersion: string,
    record: RecordCreate | RecordUpdate | RecordDelete
  ): string {
    const recordType = record.type;
    return `services/data/${apiVersion}/sobjects/${recordType}`;
  }

  toJson() {
    return {
      body: {},
      method: this.method,
      referenceId: this.referenceId,
      url: this.url,
    };
  }
}
