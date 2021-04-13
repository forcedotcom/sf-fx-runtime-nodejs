import { CloudEvent } from "cloudevents";
import {
  SalesforceContextCloudEventExtension,
  SalesforceFunctionContextCloudEventExtension,
} from "./extensions";

export function createLogger(
  cloudEvent: CloudEvent,
  contextExt: SalesforceContextCloudEventExtension,
  functionContextExt: SalesforceFunctionContextCloudEventExtension
): Logger {
  return new Logger(cloudEvent.id);
}

class Logger {
  private readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  // TODO: Mimic a popular logging library? Mimic console.log?
  info(message: string) {
    console.log(`[INFO ] [ID: ${this.id}] ${message}`);
  }

  // TODO: Mimic a popular logging library? Mimic console.log?
  debug(message: string) {
    console.log(`[DEBUG] [ID: ${this.id}] ${message}`);
  }

  // TODO: Mimic a popular logging library? Mimic console.log?
  error(message: string) {
    console.log(`[ERROR] [ID: ${this.id}] ${message}`);
  }
}
