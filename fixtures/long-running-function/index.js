/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const DEFAULT_TIMEOUT = 10 * 1000; // 10s

export default async function (event, context, logger) {
  // eslint-disable-next-line no-undef
  const timeoutFromEnv = process.env.LONG_RUNNING_PROCESS_TIMEOUT;
  const timeout = timeoutFromEnv
    ? parseInt(timeoutFromEnv, 10)
    : DEFAULT_TIMEOUT;
  logger.info(
    `Simulating a long running process that takes ${timeout}ms to complete`
  );
  // eslint-disable-next-line no-undef
  await new Promise((resolve) => setTimeout(resolve, timeout));
  logger.info("Done task");
  return [{ complete: true }];
}
