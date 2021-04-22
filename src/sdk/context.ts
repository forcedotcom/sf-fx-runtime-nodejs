import { CloudEvent } from "cloudevents";
import { Org } from "./org";
import {
  SalesforceContextCloudEventExtension,
  SalesforceFunctionContextCloudEventExtension,
} from "../extensions";

export class Context {
  readonly id: string;
  readonly org?: Org;

  constructor({
      id
    }: CloudEvent,
    contextExt: SalesforceContextCloudEventExtension,
    functionContextExt: SalesforceFunctionContextCloudEventExtension
  ) {
    this.id = id;
    this.org = this.createOrg(contextExt, functionContextExt);
  }

  private createOrg(
    contextExt: SalesforceContextCloudEventExtension,
    functionContextExt: SalesforceFunctionContextCloudEventExtension
  ): Org {
    return new Org(contextExt, functionContextExt, contextExt.userContext);
  }
}
