import { CloudEvent } from "cloudevents";
import { Org } from "./org";
import {
  SalesforceContext,
  SalesforceFunctionContext,
} from "../utils/salesforce";

export class Context {
  readonly id: string;
  readonly org?: Org;

  constructor(
    { id }: CloudEvent,
    sfContext: SalesforceContext,
    sfFunctionContext: SalesforceFunctionContext
  ) {
    this.id = id;
    this.org = this.createOrg(sfContext, sfFunctionContext);
  }

  private createOrg(
    sfContext: SalesforceContext,
    sfFunctionContext: SalesforceFunctionContext
  ): Org {
    return new Org(sfContext, sfFunctionContext, sfContext.userContext);
  }
}
