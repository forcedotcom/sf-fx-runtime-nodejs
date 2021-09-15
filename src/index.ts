/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import throng from "throng";
import { SalesforceFunction } from "sf-fx-sdk-nodejs";
import { loadUserFunctionFromDirectory } from "./user-function.js";
import startServer from "./server.js";
import logger from "./logger.js";
import * as path from "path";

export function parseArgs(params: Array<string>): any {
  return yargs(hideBin(params))
    .command(
      "serve <projectPath>",
      "Serves a function project via HTTP",
      (yargs) => {
        return yargs
          .positional("projectPath", {
            type: "string",
            describe: "The directory that contains the function(s)",
          })
          .option("port", {
            alias: "p",
            type: "number",
            description: "The port the webserver should listen on.",
            default: 8080,
          })
          .option("host", {
            alias: "h",
            type: "string",
            description: "The host the webserver should bind to.",
            default: "localhost",
          })
          .option("workers", {
            alias: "w",
            type: "number",
            description: "The number of Node.js cluster workers the webserver should use",
            default: 1,
          })
          .middleware(function(...opts) {
            // Use WEB_CONCURRENCY if set and -w was not provided.
            const yarg: any = opts[opts.length - 1];
            if (yarg.parsed.defaulted.workers && process.env.WEB_CONCURRENCY) {
              opts[0].workers = parseInt(process.env.WEB_CONCURRENCY);
            }
            return opts[0];
          });
      },
      (args) => {
        args.projectPath = path.resolve(args.projectPath);
      }
    )
    .strictCommands()
    .demandCommand(1)
    .parse();
}


export default async function (
  params: Array<string>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  loadUserFunction: Function = loadUserFunctionFromDirectory,
  server: (h: string, p: number, c: SalesforceFunction<any, any>) => Promise<void> = startServer,
  manager: (...p: Array<Record<string, unknown>>) => Promise<void> = throng,
): Promise<void> {
  const args = parseArgs(params);
  let userFunction;

  try {
    userFunction = await loadUserFunction(args.projectPath);
  } catch (error) {
    logger.error("Could not load function: " + error.message);
    process.exit(1);
  }

  const startWorker = async function(id: string, disconnect: () => void): Promise<void> {
    logger.info(`Started worker ${ id }`);

    process.on('SIGTERM', () => {
      logger.info(`Worker ${id} exiting; received SIGTERM`);
      disconnect();
    });
    process.on('SIGINT', () => {
      logger.info(`Worker ${id} exiting; received SIGINT`);
      disconnect();
    });

    return await server(args.host, args.port, userFunction);
  };
  return await manager({ worker: startWorker, count: args.workers });
}

