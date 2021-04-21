import {
  SalesforceContextCloudEventExtension,
  SalesforceFunctionContextCloudEventExtension,
} from "../extensions";

export class Org {
  readonly id: string;
  readonly baseUrl: string;
  readonly domainUrl: string;
  readonly apiVersion: string;
  readonly dataApi: DataApi;
  readonly user: User;

  constructor(contextExt: SalesforceContextCloudEventExtension, functionContextExt: SalesforceFunctionContextCloudEventExtension) {
    this.id = contextExt.userContext.orgId;
    this.baseUrl = contextExt.userContext.salesforceBaseUrl;
    this.domainUrl = contextExt.userContext.orgDomainUrl;
    this.apiVersion = contextExt.apiVersion;
    this.dataApi = new DataApi(this.baseUrl, this.apiVersion, this.accessToken);
    this.user = new User(contextExt.userContext.userId, contextExt.userContext.username, contextExt.userContext.onBehalfOfUserId);
  }
}
