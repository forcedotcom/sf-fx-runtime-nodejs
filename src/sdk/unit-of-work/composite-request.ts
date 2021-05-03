import { SubRequest } from "./sub-request";

export class CompositeRequest {
  private subRequests: any[];

  addSubRequest(method: string, apiVersion: string, subReqData: any): void {
    const subReq = new SubRequest(method, apiVersion, subReqData);
    this.subRequests.push(subReq.toJson());
  }

  getSubRequests(): any[] {
    return this.subRequests;
  }
}
