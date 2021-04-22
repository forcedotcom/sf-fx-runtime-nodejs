export interface SalesforceUserContext {
  readonly orgId: string;
  readonly userId: string;
  readonly onBehalfOfUserId: string;
  readonly username: string;
  readonly salesforceBaseUrl: string;
  readonly orgDomainUrl: string;
}

export interface SalesforceContextCloudEventExtension {
  readonly apiVersion: string;
  readonly payloadVersion: string;
  readonly userContext: SalesforceUserContext;
}

export interface SalesforceFunctionContextCloudEventExtension {
  readonly accessToken: string;
  readonly requestId: string;
  readonly functionInvocationId?: string;
  readonly functionName?: string;
  readonly apexClassId?: string;
  readonly apexClassFQN?: string;
  readonly resource?: string;
}

export function parseSalesforceContextCloudEventExtension(
  extension: string
): SalesforceContextCloudEventExtension {
  return JSON.parse(Buffer.from(extension, "base64").toString("utf-8"));
}

export function parseSalesforceFunctionContextCloudEventExtension(
  extension: string
): SalesforceFunctionContextCloudEventExtension {
  return JSON.parse(Buffer.from(extension, "base64").toString("utf-8"));
}
