/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { CloudEvent, Headers } from "cloudevents";
import * as CloudEvents from "cloudevents";

export function parseCloudEvent(
  headers: Headers,
  body: string | unknown
): SalesforceFunctionsCloudEvent {
  const cloudEvent = CloudEvents.HTTP.toEvent({ headers, body });
  if (Array.isArray(cloudEvent)) {
    throw new Error(
      "Could not execute function. Function arguments could not be determined due to invalid function payload. Expected a singular CloudEvent, but found multiple CloudEvents."
    );
  }
  return {
    cloudEvent: cloudEvent as CloudEvent<unknown>,
    sfContext: parseBase64Json(cloudEvent.sfcontext),
    sfFunctionContext: parseBase64Json(cloudEvent.sffncontext),
  };
}

export interface SalesforceFunctionsCloudEvent {
  cloudEvent: CloudEvent<unknown>;
  sfContext: SalesforceContext;
  sfFunctionContext: SalesforceFunctionContext;
}

export interface SalesforceUserContext {
  readonly orgId: string;
  readonly userId: string;
  readonly onBehalfOfUserId: string;
  readonly username: string;
  readonly salesforceBaseUrl: string;
  readonly orgDomainUrl: string;
}

export interface SalesforceContext {
  readonly apiVersion: string;
  readonly payloadVersion: string;
  readonly userContext: SalesforceUserContext;
}

export interface SalesforceFunctionContext {
  readonly accessToken: string;
  readonly requestId: string;
  readonly functionInvocationId?: string;
  readonly functionName?: string;
  readonly apexId?: string;
  readonly apexFQN?: string;
  readonly resource?: string;
}

function parseBase64Json(data: unknown): any {
  if (data === undefined || data === null) {
    return null;
  }
  const dataString = data.toString();
  if (dataString.trim() === "") {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(dataString, "base64").toString("utf-8"));
  } catch (error) {
    throw new Error(
      "Could not execute function. Function arguments could not be determined due to invalid JSON body: " +
        error.message
    );
  }
}
