import { SalesforceFunctionsCloudEvent } from "./cloud-event";
import pino from "pino";
import logger from "./logger";

export class Logger {
  private readonly properties: Record<string, unknown>;

  constructor(salesforceFunctionsCloudEvent: SalesforceFunctionsCloudEvent) {
    this.properties = {
      invocationId: salesforceFunctionsCloudEvent.cloudEvent.id,
    };
  }

  /**
   * Logs the given message at the 'error' level.
   * @param message The message to log.
   */
  error(message: string): void {
    underlyingFunctionLogger.error(this.properties, message);
  }

  /**
   * Logs the given message at the 'warn' level.
   * @param message The message to log.
   */
  warn(message: string): void {
    underlyingFunctionLogger.warn(this.properties, message);
  }

  /**
   * Logs the given message at the 'info' level.
   * @param message The message to log.
   */
  info(message: string): void {
    underlyingFunctionLogger.info(this.properties, message);
  }

  /**
   * Logs the given message at the 'debug' level.
   * @param message The message to log.
   */
  debug(message: string): void {
    underlyingFunctionLogger.debug(this.properties, message);
  }

  /**
   * Logs the given message at the 'trace' level.
   * @param message The message to log.
   */
  trace(message: string): void {
    underlyingFunctionLogger.trace(this.properties, message);
  }
}

const underlyingFunctionLogger = pino({ level: getLogLevelFromEnvironment() });

function getLogLevelFromEnvironment(): pino.Level {
  const defaultLogLevel = "info";
  const logLevel = (
    process.env.SF_FX_LOGLEVEL || defaultLogLevel
  ).toLowerCase();
  switch (logLevel) {
    case "trace":
    case "debug":
    case "info":
    case "warn":
    case "error":
      return logLevel;
    default:
      logger.warn(
        `SF_FX_LOGLEVEL environment variable contains unknown log level ${logLevel}! Effective log level will be '${defaultLogLevel}'!`
      );
      return defaultLogLevel;
  }
}
