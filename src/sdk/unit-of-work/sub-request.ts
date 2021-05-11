import { ReferenceId } from "../../sdk-interface-v1";

export class SubRequest {
  private method: string;
  private url: string;
  private referenceId: ReferenceId;
  private body: any;

  constructor(
    method: string,
    url: string,
    record: any,
    referenceId: ReferenceId
  ) {
    this.method = method;
    this.url = url;
    this.referenceId = referenceId;
    this.body = record;
  }

  toJson() {
    const { type, id, ...body } = this.body;

    const params = {
      url: this.url,
      method: this.method,
      referenceId: this.referenceId,
    };

    if (this.method !== "DELETE") params["body"] = body;

    return params;
  }
}
