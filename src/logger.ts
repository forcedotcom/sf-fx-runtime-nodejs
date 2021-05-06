import { CloudEvent } from "cloudevents";

export class Logger {
  private readonly id: string;

  constructor(cloudEvent: CloudEvent) {
    this.id = cloudEvent.id;
  }

  // TODO: Mimic a popular logging library? Mimic console.log?
  /**
   * Logs an info message in the console output.
   * @param message
   */
  info(message: string): void {
    console.log(`[INFO] [ID: ${this.id}] ${message}`);
  }

  // TODO: Mimic a popular logging library? Mimic console.log?
  /**
   * Logs a debugging message in the console output.
   * @param message
   */
  debug(message: string): void {
    console.log(`[DEBUG] [ID: ${this.id}] ${message}`);
  }

  // TODO: Mimic a popular logging library? Mimic console.log?
  /**
   * Logs an error message in the console output.
   * @param message
   */
  error(message: string): void {
    console.log(`[ERROR] [ID: ${this.id}] ${message}`);
  }
}
