/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Logger } from "@salesforce/core";
import { LoggerFormat } from "@salesforce/core/lib/logger.js";

function getloglevel() {
  const logLevel = (process.env.SF_FX_LOGLEVEL || "info").toLowerCase();
  switch (logLevel) {
    case "trace":
      return 10;
    case "debug":
      return 20;
    case "info":
      return 30;
    case "warn":
      return 40;
    case "error":
      return 50;
    default:
      console.warn(
        `SF_FX_LOGLEVEL environment variable contains unknown log level '${logLevel}'! Effective log level will be 'info'!`
      );
      return 30;
  }
}

const logger = new Logger({
  name: "functionLogger",
  stream: process.stdout,
  format: LoggerFormat.LOGFMT,
  level: getloglevel(),
});

export default logger;
