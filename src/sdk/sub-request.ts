import {
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult,
} from "../sdk-interface-v1";

export interface CompositeSubRequest<T> {
  readonly httpMethod: string;
  readonly body: any;

  buildUri(apiVersion: string): string;

  processResponse(
    statusCode: number,
    headers: Map<string, string>,
    body: any
  ): T;
}

export class DeleteRecordSubRequest
  implements CompositeSubRequest<RecordModificationResult> {
  readonly body = undefined;
  readonly httpMethod = "DELETE";
  private readonly type: string;
  private readonly id: string;

  constructor(type: string, id: string) {
    this.type = type;
    this.id = id;
  }

  buildUri(apiVersion: string): string {
    return `/services/data/v${apiVersion}/sobjects/${this.type}/${this.id}`;
  }

  processResponse(): RecordModificationResult {
    return { id: this.id };
  }
}

export class UpdateRecordSubRequest
  implements CompositeSubRequest<RecordModificationResult> {
  readonly body: any;
  readonly httpMethod = "PATCH";
  private readonly record: RecordForUpdate;

  constructor(record: RecordForUpdate) {
    this.record = record;

    this.body = { ...record };
    delete this.body.type;
    delete this.body.id;
  }

  buildUri(apiVersion: string): string {
    return `/services/data/v${apiVersion}/sobjects/${this.record.type}/${this.record.id}`;
  }

  processResponse(): RecordModificationResult {
    return { id: this.record.id };
  }
}

export class CreateRecordSubRequest
  implements CompositeSubRequest<RecordModificationResult> {
  readonly body: any;
  readonly httpMethod = "POST";
  private readonly record: RecordForCreate;

  constructor(record: RecordForCreate) {
    this.record = record;

    this.body = { ...record };
    delete this.body.type;
  }

  buildUri(apiVersion: string): string {
    return `/services/data/v${apiVersion}/sobjects/${this.record.type}`;
  }

  processResponse(
    statusCode: number,
    headers: Map<string, string>,
    body: any
  ): RecordModificationResult {
    return { id: body.id };
  }
}
