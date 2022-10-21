/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import cluster from "cluster";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import throng from "throng";
import { SalesforceFunction } from "./types";
import { loadUserFunctionFromDirectory } from "./user-function.js";
import { readSalesforceConfig } from "./salesforce-config.js";
import startServer, { StartServerOptions } from "./server.js";
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
          .option("debug-port", {
            alias: "d",
            type: "number",
            description:
              "The port to attach a debugger/inspector to. Will override --workers to 1.",
            default: null,
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
            description:
              "The number of Node.js cluster workers the invoker should use",
            default: 1,
          })
          .option("grace", {
            alias: "g",
            type: "number",
            description:
              "How long to wait for graceful shutdown before exiting forcefully",
            default: 15 * 1000,
          });
      }
    )
    .strictCommands()
    .demandCommand(1)
    .parse();
}

export default async function (
  params: Array<string>,
  loadUserFunction: (
    p: string
  ) => Promise<SalesforceFunction<any, any>> = loadUserFunctionFromDirectory,
  server: (options: StartServerOptions) => Promise<void> = startServer,
  manager: (...p: Array<Record<string, unknown>>) => Promise<void> = throng
): Promise<void> {
  const args = parseArgs(params);
  let userFunction;

  const projectPath = path.resolve(args.projectPath);
  try {
    userFunction = await loadUserFunction(projectPath);
  } catch (error) {
    logger.error("Could not load function: " + error.message);
    process.exit(1);
  }

  const salesforceConfig = await readSalesforceConfig(
    path.join(projectPath, "project.toml")
  );

  const { debugPort, host, port, grace } = args;
  const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];
  const count = debugPort ? 1 : args.workers;

  const master = function () {
    if (debugPort) {
      const { execArgv } = process;
      execArgv.push(`--inspect=${args.host}`);
      cluster.setupMaster({
        execArgv,
        inspectPort: debugPort,
      });
    }
  };

  const worker = async function (
    id: number,
    disconnect: () => void
  ): Promise<void> {
    return await server({
      host,
      port,
      userFunction,
      salesforceConfig,
      id,
      disconnect,
      grace,
      signals,
    });
  };

  return await manager({
    master,
    worker,
    count,
    grace,
    signals,
  });
}
