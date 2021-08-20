import { SalesforceFunctionsCloudEvent } from "../cloud-event.js";
import { Context, Org } from "sf-fx-sdk-nodejs";
import { OrgImpl } from "./org.js";

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
