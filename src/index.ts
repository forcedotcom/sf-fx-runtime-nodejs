import yargs from "yargs";
import { hideBin } from "yargs/helpers";
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

export function callCommand(params: Array<string>): any {
  const args = parseArgs(params);
  let userFunction;

  try {
    const absolutePath = path.resolve(args.projectPath);
    console.log("hiiiiiiiiii");
    console.log(absolutePath);
    userFunction = loadUserFunctionFromDirectory(absolutePath);
  } catch (error) {
    logger.error("Could not load function: " + error.message);
    process.exit(1);
  }

  startServer(args.host, args.port, userFunction);
}