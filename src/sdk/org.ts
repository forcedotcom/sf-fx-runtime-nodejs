import {
  SalesforceContextCloudEventExtension,
  SalesforceFunctionContextCloudEventExtension,
} from "../extensions";

export function createOrg(
  contextExt: SalesforceContextCloudEventExtension,
  functionContextExt: SalesforceFunctionContextCloudEventExtension
): Org {
  let org = new Org(contextExt, functionContextExt);
  
  return org;
}

export class Org {
  id: string;
  baseUrl: string;
  domainUrl: string;
  apiVersion: string;
  dataApi: DataApi;
  user: User;

  constructor(contextExt: SalesforceContextCloudEventExtension, functionContextExt: SalesforceFunctionContextCloudEventExtension) {
<<<<<<< Updated upstream
    this.id = contextExt.userContext.orgId;
    this.baseUrl = contextExt.userContext.salesforceBaseUrl;
    this.domainUrl = contextExt.userContext.orgDomainUrl;
    this.apiVersion = contextExt.apiVersion;
    this.dataApi = new DataApi(this.baseUrl, this.apiVersion, this.accessToken);
    this.user = new User(contextExt.userContext.userId, contextExt.userContext.username, contextExt.userContext.onBehalfOfUserId);
=======

>>>>>>> Stashed changes
  }
}
