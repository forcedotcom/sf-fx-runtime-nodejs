import * as fastify from "fastify";
import { FastifyReply } from "fastify";
import { InvocationEvent } from "./sdk/invocation-event";
import { Context } from "./sdk/context";
import { Logger } from "./logger";
import { UserFunction } from "./user-function";
import { parseCloudEvent, SalesforceFunctionsCloudEvent } from "./cloud-event";
import { performance } from "perf_hooks";
import getRebasedStack from "./stacktrace";
import * as mimetype from "whatwg-mimetype";

const OK_STATUS = 200;
const BAD_REQUEST_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;
const SERVICE_UNAVAILABLE_STATUS = 503;

export default function startServer<A>(
  host: string,
  port: number,
  userFunction: UserFunction<A>
): void {
  const server = fastify.fastify({ logger: true });

  server.post("/", async (request, reply) => {
    // If the request is a health check request, stop processing and return a successful result as per spec.
    if (request.headers["x-health-check"] === "true") {
      makeResponse(reply, OK_STATUS, "OK", emptyExtraInfo);
      return;
    }

    let salesforceFunctionsCloudEvent: SalesforceFunctionsCloudEvent;
    try {
      salesforceFunctionsCloudEvent = parseCloudEvent(
        request.headers,
        request.body
      );
    } catch (error) {
      makeResponse(
        reply,
        BAD_REQUEST_STATUS,
        "Could not parse CloudEvent: " + error.message,
        emptyExtraInfo
      );
      return;
    }

    if (
      salesforceFunctionsCloudEvent.cloudEvent.type !==
      "com.salesforce.function.invoke.sync"
    ) {
      makeResponse(
        reply,
        BAD_REQUEST_STATUS,
        "CloudEvent must be of type 'com.salesforce.function.invoke.sync'!",
        emptyExtraInfo
      );
      return;
    }

    const parsedMimeType = mimetype.parse(
      salesforceFunctionsCloudEvent.cloudEvent.datacontenttype
    );
    if (
      parsedMimeType === null ||
      parsedMimeType.essence !== "application/json"
    ) {
      makeResponse(
        reply,
        BAD_REQUEST_STATUS,
        "CloudEvent data must be of type application/json!",
        emptyExtraInfo
      );
      return;
    }

    const invocationEvent = new InvocationEvent(salesforceFunctionsCloudEvent);
    const context = new Context(salesforceFunctionsCloudEvent);
    const logger = new Logger(salesforceFunctionsCloudEvent);

    try {
      const userFunctionStart = performance.now();
      const functionResult = await userFunction(
        invocationEvent,
        context,
        logger
      );
      const userFunctionEnd = performance.now();

      makeResponse(reply, OK_STATUS, JSON.stringify(functionResult), {
        ...emptyExtraInfo,
        requestId: salesforceFunctionsCloudEvent.cloudEvent.id,
        source: salesforceFunctionsCloudEvent.cloudEvent.source,
        execTimeMs: userFunctionEnd - userFunctionStart,
      });
      return;
    } catch (error) {
      let stacktrace;
      let message;

      if (error instanceof Error) {
        message = error.message;
        stacktrace = getRebasedStack(__filename, error);
      } else {
        message = error.toString();
        stacktrace = "";
      }

      makeResponse(
        reply,
        INTERNAL_SERVER_ERROR_STATUS,
        `Function threw: ${message}`,
        {
          requestId: salesforceFunctionsCloudEvent.cloudEvent.id,
          source: salesforceFunctionsCloudEvent.cloudEvent.source,
          execTimeMs: 0,
          isFunctionError: true,
          stacktrace,
        }
      );
      return;
    }
  });

  server.setErrorHandler((error, request, reply) => {
    makeResponse(reply, SERVICE_UNAVAILABLE_STATUS, error.toString(), {
      ...emptyExtraInfo,
      stacktrace: error.stack,
    });
  });

  server.listen(port, host, function (err) {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
}

function makeResponse(
  reply: FastifyReply,
  status: number,
  data: any,
  extraInfo: ExtraInfo
) {
  return reply
    .status(status)
    .header("x-extra-info", encodeURI(JSON.stringify(extraInfo)))
    .header("content-type", "application/json")
    .send(JSON.stringify(data));
}

interface ExtraInfo {
  readonly requestId: string;
  readonly source: string;
  readonly execTimeMs: number;
  readonly isFunctionError: boolean;
  readonly stacktrace: string;
}

const emptyExtraInfo = {
  requestId: "n/a",
  source: "n/a",
  execTimeMs: 0,
  isFunctionError: false,
  stacktrace: "",
};
