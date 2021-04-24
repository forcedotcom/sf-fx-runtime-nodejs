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

export function parseSalesforceContext({ sfcontext }: any): SalesforceContext {
  return JSON.parse(Buffer.from(sfcontext, "base64").toString("utf-8"));
}

export function parseSalesforceFunctionContext({
  sffncontext,
}: any): SalesforceFunctionContext {
  return JSON.parse(Buffer.from(sffncontext, "base64").toString("utf-8"));
}
