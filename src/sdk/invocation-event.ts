import { CloudEvent } from "cloudevents";

export class InvocationEvent {
  id: string;
  type: string;
  source: string;
  data: any;
  dataContentType?: string;
  dataSchema?: string;
  time?: string;

  constructor({
    id,
    type,
    source,
    data,
    datacontenttype,
    schemaurl,
    time,
  }: CloudEvent) {
    this.id = id;
    this.type = type;
    this.source = source;
    this.data = data;
    this.dataContentType = datacontenttype;
    this.dataSchema = schemaurl;
    this.time = time;
  }
}
