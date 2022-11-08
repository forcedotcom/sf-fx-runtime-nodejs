"use strict";
/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
async function execute(event, context, logger) {
    logger.info(`Invoking Myfnts with payload ${JSON.stringify(event.data || {})}`);
    const results = await context.org.dataApi.query("SELECT Id, Name FROM Account");
    logger.info(JSON.stringify(results));
    return results;
}
exports.default = execute;
