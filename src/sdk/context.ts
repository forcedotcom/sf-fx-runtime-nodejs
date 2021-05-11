import { Org } from "./org";
import { SalesforceFunctionsCloudEvent } from "../cloud-event";

export class Context {
  readonly id: string;
  readonly org?: Org;

  constructor(salesforceFunctionsCloudEvent: SalesforceFunctionsCloudEvent) {
    this.id = salesforceFunctionsCloudEvent.cloudEvent.id;
    this.org = new Org(
      salesforceFunctionsCloudEvent.sfContext,
      salesforceFunctionsCloudEvent.sfFunctionContext,
      salesforceFunctionsCloudEvent.sfContext.userContext
    );
  }
}
