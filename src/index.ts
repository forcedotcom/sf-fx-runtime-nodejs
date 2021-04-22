import * as fastify from "fastify";
import {
  InvocationEvent,
  Context
} from "./sdk";
import { createLogger } from "./logger";
import * as path from "path";
import * as CloudEvents from "cloudevents";
import {
  parseSalesforceContextCloudEventExtension,
  parseSalesforceFunctionContextCloudEventExtension,
} from "./extensions";

// TODO: CLI parsing to set the port and host the invoker should bind to.

// Get the function out of the passed project directory
// It would be nice if we could do this detection code during the container build step as well without starting
// the server. This will then allow the build step to fail if there is no valid function in the user's code.
// TODO: Validation, Errorhandling, etc...
const functionDirectory = process.argv[2];

const functionPackageJson = require(path.join(
  functionDirectory,
  "package.json"
));

const userFunction: Function = require(path.join(
  functionDirectory,
  functionPackageJson.main
));

// Start new webserver to serve invocations
const server = fastify.fastify({ logger: true });

server.post("/", async (request, response) => {
  // If the request is a health check request, stop processing and return a successful result as per spec.
  if (request.headers["x-health-check"] === "true") {
    return "OK";
  }

  // Parse the incoming cloud event
  const cloudEvent = CloudEvents.HTTP.toEvent({
    headers: request.headers,
    body: request.body,
  });

  if (typeof cloudEvent.sfcontext !== "string") {
    // TODO: Errorhandling
    return;
  }

  if (typeof cloudEvent.sffncontext !== "string") {
    // TODO: Errorhandling
    return;
  }

  const contextExtension = parseSalesforceContextCloudEventExtension(
    cloudEvent.sfcontext
  );
  const functionContextExtension = parseSalesforceFunctionContextCloudEventExtension(
    cloudEvent.sffncontext
  );

  const invocationEvent = new InvocationEvent(cloudEvent);
  const context = new Context(cloudEvent, contextExtension, functionContextExtension);
  const logger = createLogger(cloudEvent);

  let functionResult: any;

  try {
    functionResult = await userFunction(invocationEvent, context, logger);
  } catch(e) {
    return "some error";
  }

  return functionResult;
});

server.listen(8080, function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`server listening on ${address}`);
});
