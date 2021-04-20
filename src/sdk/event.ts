import { CloudEvent } from "cloudevents";
import {
  SalesforceContextCloudEventExtension,
  SalesforceFunctionContextCloudEventExtension,
} from "../extensions";

export function createInvocationEvent(
  cloudEvent: CloudEvent,
  contextExt: SalesforceContextCloudEventExtension,
  functionContextExt: SalesforceFunctionContextCloudEventExtension
): InvocationEvent {
  let invEvent = new InvocationEvent(cloudEvent);
  return invEvent;
}

export class InvocationEvent {
  id: string;
  type: string;
  source: string;
  data: any;
  dataContentType?: string;
  dataSchema?: string;
  time?: string;

  constructor(cloudEvent: CloudEvent) {
    this.id = cloudEvent.id;
    this.type = cloudEvent.type;
    this.source = cloudEvent.source;
    this.data = cloudEvent.data;
    this.dataContentType = cloudEvent.datacontenttype;
    this.dataSchema = cloudEvent.schemaurl;
    this.time = cloudEvent.time;
  }
}