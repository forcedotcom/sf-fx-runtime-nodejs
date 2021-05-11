import { SalesforceFunctionsCloudEvent } from "../cloud-event";
import { Context, Org } from "../sdk-interface-v1";
import { OrgImpl } from "./org";

export class ContextImpl implements Context {
  readonly id: string;
  readonly org?: Org;

  constructor(salesforceFunctionsCloudEvent: SalesforceFunctionsCloudEvent) {
    this.id = salesforceFunctionsCloudEvent.cloudEvent.id;
    this.org = new OrgImpl(
      salesforceFunctionsCloudEvent.sfContext,
      salesforceFunctionsCloudEvent.sfFunctionContext,
      salesforceFunctionsCloudEvent.sfContext.userContext
    );
  }
}
