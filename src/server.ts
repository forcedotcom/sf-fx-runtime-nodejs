import * as fastify from "fastify";
import * as CloudEvents from "cloudevents";
import { InvocationEvent } from "./sdk/invocation-event";
import {
  parseSalesforceContext,
  parseSalesforceFunctionContext,
} from "./utils/salesforce";
import { Context } from "./sdk/context";
import { Logger } from "./logger";
import { UserFunction } from "./function";

export default function startServer<A>(
  host: string,
  port: number,
  userFunction: UserFunction<A>
): void {
  const server = fastify.fastify({ logger: true });

  server.post("/", async (request) => {
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

    const invocationEvent = new InvocationEvent(cloudEvent);
    const sfContext = parseSalesforceContext(cloudEvent);
    const sfFunctionContext = parseSalesforceFunctionContext(cloudEvent);
    const context = new Context(cloudEvent, sfContext, sfFunctionContext);
    const logger = new Logger(cloudEvent);

    let functionResult: any;

    try {
      functionResult = await userFunction(invocationEvent, context, logger);
    } catch (e) {
      return "some error";
    }

    return functionResult;
  });

  server.listen(port, host, function (err, address) {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    server.log.info(`server listening on ${address}`);
  });
}
