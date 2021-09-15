/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import throng from "throng";
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
  loadUserFunctionFromDirectory_: Function = loadUserFunctionFromDirectory,
  // eslint-disable-next-line @typescript-eslint/ban-types
  startServer_: Function = startServer
): Promise<void> {
  const args = parseArgs(params);
  let userFunction;

  try {
    userFunction = await loadUserFunctionFromDirectory_(args.projectPath);
  } catch (error) {
    logger.error("Could not load function: " + error.message);
    process.exit(1);
  }

  const startWorker = async function(id: string, disconnect: () => void): Promise<void> {
    console.log(`Started worker ${ id }`);

    process.on('SIGTERM', () => {
      console.log(`Worker ${id} exiting; received SIGTERM`);
      disconnect();
    });
    process.on('SIGINT', () => {
      console.log(`Worker ${id} exiting; received SIGINT`);
      disconnect();
    });

    return startServer_(args.host, args.port, userFunction);
  };
  return await throng({ worker: startWorker, count: process.env.WEB_CONCURRENCY || 1});
}

