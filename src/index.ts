import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { loadUserFunctionFromDirectory, UserFunction } from "./user-function";
import startServer from "./server";
import pino from "pino";

const logger = pino();

yargs(hideBin(process.argv))
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
      let userFunction;
      try {
        userFunction = loadUserFunctionFromDirectory(args.projectPath);
      } catch (error) {
        logger.error("Could not load function: " + error.message);
        process.exit(1);
      }

      startServer(args.host, args.port, userFunction);
    }
  )
  .strictCommands()
  .demandCommand(1)
  .parse();
