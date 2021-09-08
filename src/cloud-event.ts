import { CloudEvent, Headers } from "cloudevents";
import * as CloudEvents from "cloudevents";

export function parseCloudEvent(
  headers: Headers,
  body: string | unknown
): SalesforceFunctionsCloudEvent {
  const cloudEvent = CloudEvents.HTTP.toEvent({ headers, body });
  return {
    cloudEvent,
    sfContext:
      cloudEvent.sfcontext == undefined
        ? null
        : parseBase64Json(cloudEvent.sfcontext.toString()),
    sfFunctionContext:
      cloudEvent.sffncontext == undefined
        ? null
        : parseBase64Json(cloudEvent.sffncontext.toString()),
  };
}

export interface SalesforceFunctionsCloudEvent {
  cloudEvent: CloudEvent;
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
  readonly apexClassId?: string;
  readonly apexClassFQN?: string;
  readonly resource?: string;
}

function parseBase64Json<A>(data: string): A {
  try {
    return JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
  } catch (error) {
    throw new Error(
      "Could not execute function. Function arguments could not be determined due to invalid JSON body: " +
        error.message
    );
  }
}
