import {
  SalesforceContext,
  SalesforceFunctionContext,
  SalesforceUserContext,
} from "../utils/salesforce";
import { DataApi } from "./data-api";
import { User } from "./user";

export class Org {
  readonly id: string;
  readonly baseUrl: string;
  readonly domainUrl: string;
  readonly apiVersion: string;
  readonly dataApi: DataApi;
  readonly user: User;

  constructor(
    { apiVersion }: SalesforceContext,
    { accessToken }: SalesforceFunctionContext,
    {
      orgId,
      salesforceBaseUrl,
      orgDomainUrl,
      userId,
      username,
      onBehalfOfUserId,
    }: SalesforceUserContext
  ) {
    this.id = orgId;
    this.baseUrl = salesforceBaseUrl;
    this.domainUrl = orgDomainUrl;
    this.apiVersion = apiVersion;

    this.dataApi = new DataApi(this.baseUrl, this.apiVersion, accessToken);
    this.user = new User(userId, username, onBehalfOfUserId);
  }
}
