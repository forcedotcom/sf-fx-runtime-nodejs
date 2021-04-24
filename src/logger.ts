import { CloudEvent } from "cloudevents";

export class Logger {
  private readonly id: string;

  constructor(cloudEvent: CloudEvent) {
    this.id = cloudEvent.id;
  }

  // TODO: Mimic a popular logging library? Mimic console.log?
  info(message: string): void {
    console.log(`[INFO] [ID: ${this.id}] ${message}`);
  }

  // TODO: Mimic a popular logging library? Mimic console.log?
  debug(message: string): void {
    console.log(`[DEBUG] [ID: ${this.id}] ${message}`);
  }

  // TODO: Mimic a popular logging library? Mimic console.log?
  error(message: string): void {
    console.log(`[ERROR] [ID: ${this.id}] ${message}`);
  }
}
