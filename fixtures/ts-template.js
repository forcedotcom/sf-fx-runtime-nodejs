"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
async function execute(event, context, logger) {
  logger.info(
    `Invoking Myfnts with payload ${JSON.stringify(event.data || {})}`
  );
  const results = await context.org.dataApi.query(
    "SELECT Id, Name FROM Account"
  );
  logger.info(JSON.stringify(results));
  return results;
}
exports.default = execute;
