import {
  SalesforceContextCloudEventExtension,
  SalesforceFunctionContextCloudEventExtension,
} from "../extensions";
import { DataApi } from "../sdk";
import { User } from "./user";

export class Org {
  readonly id: string;
  readonly baseUrl: string;
  readonly domainUrl: string;
  readonly apiVersion: string;
  readonly dataApi: DataApi;
  readonly user: User;

  constructor(contextExt: SalesforceContextCloudEventExtension, functionContextExt: SalesforceFunctionContextCloudEventExtension) {
    let userContext = contextExt.userContext;
    this.id = userContext.orgId;
    this.baseUrl = userContext.salesforceBaseUrl;
    this.domainUrl = userContext.orgDomainUrl;
    this.apiVersion = contextExt.apiVersion;
    this.dataApi = new DataApi(this.baseUrl, this.apiVersion, functionContextExt.accessToken);
    this.user = new User(userContext.userId, userContext.username, userContext.onBehalfOfUserId);
  }
}
