export interface SalesforceContextCloudEventExtension {
  readonly apiVersion: string;
  readonly payloadVersion: string;
  readonly userContext: UserContext;
}

export interface UserContext {
  orgId: string;
  userId: string;
  onBehalfOfUserId: string;
  username: string;
  salesforceBaseUrl: string;
  orgDomainUrl: string;
}

export interface SalesforceFunctionContextCloudEventExtension {
  accessToken: string;
  requestId: string;
  functionInvocationId?: string;
  functionName?: string;
  apexClassId?: string;
  apexClassFQN?: string;
  resource?: string;
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
