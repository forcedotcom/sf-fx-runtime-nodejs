import { SubRequest } from "./sub-request";
import { ReferenceId } from "../../sdk-interface-v1";

export class CompositeRequest {
  private subRequests: any[];

  constructor() {
    this.subRequests = [];
  }

  addSubRequest(
    method: string,
    url: string,
    referenceId: ReferenceId,
    subReqData?: any,
  ): void {
    const subReq = new SubRequest(method, url, referenceId, subReqData);
    this.subRequests.push(subReq.toJson());
  }

  getSubRequests(): any[] {
    return this.subRequests;
  }
}
