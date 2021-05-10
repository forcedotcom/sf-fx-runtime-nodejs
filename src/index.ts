import * as path from "path";
import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { UserFunction } from "./function";
import startServer from "./server";

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
      // Get the function out of the passed project directory
      // It would be nice if we could do this detection code during the container build step as well without starting
      // the server. This will then allow the build step to fail if there is no valid function in the user's code.
      // TODO: Validation, Errorhandling, etc...
      const functionPackageJson = require(path.join(
        args.projectPath,
        "package.json"
      ));

      // TODO:
      // Raise error if there's no package.json
      // Raise error if the file specified in package.json is absent
      const userFunction: UserFunction<any> = require(path.join(
        args.projectPath,
        functionPackageJson.main
      ));

      startServer(args.host, args.port, userFunction);
    }
  )
  .strictCommands()
  .demandCommand(1)
  .parse();
