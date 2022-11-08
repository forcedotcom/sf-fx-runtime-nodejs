/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  InvocationEvent,
  Context,
  Logger,
  RecordQueryResult,
} from "@heroku/sf-fx-runtime-nodejs";

export default async function execute(
  event: InvocationEvent<any>,
  context: Context,
  logger: Logger
): Promise<RecordQueryResult> {
  logger.info(
    `Invoking Myfnts with payload ${JSON.stringify(event.data || {})}`
  );

  const results = await context.org.dataApi.query(
    "SELECT Id, Name FROM Account"
  );

  logger.info(JSON.stringify(results));

  return results;
}
