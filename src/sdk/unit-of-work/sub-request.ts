import { RecordCreate, RecordUpdate, RecordDelete } from "../records";
import { ReferenceId } from "../types/reference-id";

export class SubRequest {
  private method: string;
  private url: string;
  private referenceId: ReferenceId;
  private body: RecordCreate | RecordUpdate | RecordDelete;

  constructor(
    method: string,
    apiVersion: string,
    record: RecordCreate | RecordUpdate | RecordDelete,
    referenceId: ReferenceId
  ) {
    this.method = method;
    this.url = this.createUrl(apiVersion, record);
    this.referenceId = referenceId;
    this.body = record;
  }

  createUrl(
    apiVersion: string,
    record: RecordCreate | RecordUpdate | RecordDelete
  ): string {
    const recordType = record.type;
    return `services/data/v${apiVersion}/sobjects/${recordType}`;
  }

  toJson() {
    const { type, ...body } = this.body;
    return {
      url: this.url,
      method: this.method,
      referenceId: this.referenceId,
      body,
    };
  }
}
