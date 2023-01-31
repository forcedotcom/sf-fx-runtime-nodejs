/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SalesforceFunctionsCloudEvent } from "./cloud-event.js";
import logger from "./logger.js";
import { Logger } from "./index";

export class LoggerImpl implements Logger {
  private readonly properties: Record<string, unknown>;

  constructor(salesforceFunctionsCloudEvent: SalesforceFunctionsCloudEvent) {
    this.properties = {
      invocationId: salesforceFunctionsCloudEvent.cloudEvent.id,
    };
  }

  error(message: string): void {
    underlyingFunctionLogger.error(Object.assign(this.properties, { message }));
  }

  warn(message: string): void {
    underlyingFunctionLogger.warn(Object.assign(this.properties, { message }));
  }

  info(message: string): void {
    underlyingFunctionLogger.info(Object.assign(this.properties, { message }));
  }

  debug(message: string): void {
    underlyingFunctionLogger.debug(Object.assign(this.properties, { message }));
  }

  trace(message: string): void {
    underlyingFunctionLogger.trace(Object.assign(this.properties, { message }));
  }
}

const underlyingFunctionLogger = logger;
