import { SubRequest } from "./sub-request";
import {ReferenceId} from "../../sdk-interface-v1";

export class CompositeRequest {
  private subRequests: any[];

  constructor() {
    this.subRequests = [];
  }

  addSubRequest(
    method: string,
    url: string,
    subReqData: any,
    referenceId: ReferenceId
  ): void {
    const subReq = new SubRequest(method, url, subReqData, referenceId);
    this.subRequests.push(subReq.toJson());
  }

  getSubRequests(): any[] {
    return this.subRequests;
  }
}
