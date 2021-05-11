import { SalesforceFunctionsCloudEvent } from "../cloud-event";
import {InvocationEvent} from "../sdk-interface-v1";

export class InvocationEventImpl implements InvocationEvent<unknown> {
  id: string;
  type: string;
  source: string;
  data: unknown;
  dataContentType?: string;
  dataSchema?: string;
  time?: string;

  constructor(salesforceFunctionsCloudEvent: SalesforceFunctionsCloudEvent) {
    this.id = salesforceFunctionsCloudEvent.cloudEvent.id;
    this.type = salesforceFunctionsCloudEvent.cloudEvent.type;
    this.source = salesforceFunctionsCloudEvent.cloudEvent.source;
    this.data = salesforceFunctionsCloudEvent.cloudEvent.data;
    this.dataContentType =
      salesforceFunctionsCloudEvent.cloudEvent.datacontenttype;
    this.dataSchema = salesforceFunctionsCloudEvent.cloudEvent.schemaurl;
    this.time = salesforceFunctionsCloudEvent.cloudEvent.time;
  }
}
