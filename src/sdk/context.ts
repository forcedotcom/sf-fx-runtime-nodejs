import { CloudEvent } from "cloudevents";
import { Org } from "./org";
import {
  SalesforceContextCloudEventExtension,
  SalesforceFunctionContextCloudEventExtension,
} from "../extensions";

export function createContext(
  cloudEvent: CloudEvent,
  contextExt: SalesforceContextCloudEventExtension,
  functionContextExt: SalesforceFunctionContextCloudEventExtension
): Context {
  let org = new Org(contextExt, functionContextExt);
  let context = new Context(cloudEvent.id, org);

  return context;
}

export class Context {
  id: string;
  org?: Org;

  constructor(id, org) {
    this.id = id;
    this.org = org;
  }
}
