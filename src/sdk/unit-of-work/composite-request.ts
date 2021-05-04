import { ReferenceId } from "../types/reference-id";
import { SubRequest } from "./sub-request";

export class CompositeRequest {
  private subRequests: any[];

  constructor() {
    this.subRequests = [];
  }

  addSubRequest(
    method: string,
    apiVersion: string,
    subReqData: any,
    referenceId: ReferenceId
  ): void {
    const subReq = new SubRequest(method, apiVersion, subReqData, referenceId);
    this.subRequests.push(subReq.toJson());
  }

  getSubRequests(): any[] {
    return this.subRequests;
  }
}
