import {
  SalesforceContext,
  SalesforceFunctionContext,
  SalesforceUserContext,
} from "../cloud-event";
import { UserImpl } from "./user";
import { Org, User, DataApi } from "../sdk-interface-v1";
import { DataApiImpl } from "./data-api";

export class OrgImpl implements Org {
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

    this.dataApi = new DataApiImpl(this.baseUrl, this.apiVersion, accessToken);
    this.user = new UserImpl(userId, username, onBehalfOfUserId);
  }
}
