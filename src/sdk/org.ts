import {
  SalesforceContextCloudEventExtension,
  SalesforceFunctionContextCloudEventExtension,
} from "../extensions";

export class Org {
  id: string;
  baseUrl: string;
  domainUrl: string;
  apiVersion: string;
  dataApi: DataApi;
  user: User;

  constructor(contextExt: SalesforceContextCloudEventExtension, functionContextExt: SalesforceFunctionContextCloudEventExtension) {
    
  }
}