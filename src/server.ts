import * as fastify from "fastify";
import { FastifyReply, FastifyInstance } from "fastify";
import { LoggerImpl } from "./user-function-logger.js";
import { parseCloudEvent, SalesforceFunctionsCloudEvent } from "./cloud-event.js";
import { performance } from "perf_hooks";
import getRebasedStack from "./stacktrace.js";
import MimeType from "whatwg-mimetype/lib/mime-type.js";
import { SalesforceFunction } from "sf-fx-sdk-nodejs";
import { InvocationEventImpl } from "./sdk/invocation-event.js";
import { ContextImpl } from "./sdk/context.js";

const OK_STATUS = 200;
const BAD_REQUEST_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;
const SERVICE_UNAVAILABLE_STATUS = 503;

export function buildServer(
  userFunction: SalesforceFunction<any, any>
): FastifyInstance {
  const server = fastify.fastify({ logger: false });

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

    const parsedMimeType = MimeType.parse(
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

    const invocationEvent = new InvocationEventImpl(
      salesforceFunctionsCloudEvent
    );
    const context = new ContextImpl(salesforceFunctionsCloudEvent);
    const logger = new LoggerImpl(salesforceFunctionsCloudEvent);

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
      let message: string;

      if (error instanceof Error) {
        message = error.message;
        stacktrace = getRebasedStack(import.meta.url, error);
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
          stack: stacktrace,
        }
      );
      return;
    }
  });

  server.setErrorHandler((error, request, reply) => {
    makeResponse(reply, SERVICE_UNAVAILABLE_STATUS, error.toString(), {
      ...emptyExtraInfo,
      stack: error.stack,
    });
  });

  return server;
}

export default function startServer(
  host: string,
  port: number,
  userFunction: SalesforceFunction<any, any>
): void {
  const server = buildServer(userFunction);
  server.listen(port, host, function (err) {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
}

function makeResponse(
  reply: FastifyReply,
  statusCode: number,
  data: any,
  extraInfo: ExtraInfo
) {
  return reply
    .status(statusCode)
    .header(
      "x-extra-info",
      encodeURI(JSON.stringify({ ...extraInfo, statusCode }))
    )
    .header("content-type", "application/json")
    .send(data); // we don't JSON.stringify, as Fastify will do this for us (even for strings, because of content-type)
}

interface ExtraInfo {
  readonly requestId: string;
  readonly source: string;
  readonly execTimeMs: number;
  readonly isFunctionError: boolean;
  readonly stack: string;
}

const emptyExtraInfo = {
  requestId: "n/a",
  source: "n/a",
  execTimeMs: 0,
  isFunctionError: false,
  stack: "",
};
