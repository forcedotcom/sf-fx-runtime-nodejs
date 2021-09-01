/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  SalesforceContext,
  SalesforceFunctionContext,
  SalesforceUserContext,
} from "../cloud-event.js";
import { UserImpl } from "./user.js";
import { Org, User, DataApi } from "sf-fx-sdk-nodejs";
import { DataApiImpl } from "./data-api.js";

export class OrgImpl implements Org {
  readonly id: string;
  readonly baseUrl: string;
  readonly domainUrl: string;
  readonly apiVersion: string;
  readonly dataApi: DataApi;
  readonly user: User;

  constructor(
    salesforceContext: SalesforceContext,
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

    // An API version is also available in SalesforceContext. That value differs
    // between orgs and can change seemingly randomly. To avoid surprises at runtime, we
    // intentionally don't use that value and instead fix the version.
    this.apiVersion = "51.0";

    this.dataApi = new DataApiImpl(this.baseUrl, this.apiVersion, accessToken);
    this.user = new UserImpl(userId, username, onBehalfOfUserId);
  }
}
