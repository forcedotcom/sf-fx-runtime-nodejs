import { ReferenceId } from "../../sdk-interface-v1";

export class SubRequest {
  private readonly method: string;
  private readonly url: string;
  private readonly referenceId: ReferenceId;
  private readonly body: any;

  constructor(
    method: string,
    url: string,
    referenceId: ReferenceId,
    record?: any,
  ) {
    this.method = method;
    this.url = url;
    this.referenceId = referenceId;
    this.body = record || {};
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
