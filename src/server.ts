/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fastify from "fastify";
import { FastifyReply, FastifyInstance } from "fastify";
import { LoggerImpl } from "./user-function-logger.js";
import logger from "./logger.js";
import { Logger } from "@salesforce/core";
import {
  parseCloudEvent,
  SalesforceFunctionsCloudEvent,
} from "./cloud-event.js";
import { performance } from "perf_hooks";
import getRebasedStack from "./stacktrace.js";
import MimeType from "whatwg-mimetype/lib/mime-type.js";
import { SalesforceFunction } from "sf-fx-sdk-nodejs";
import { InvocationEventImpl } from "./sdk/invocation-event.js";
import { ContextImpl } from "./sdk/context.js";
import { SalesforceConfig } from "./salesforce-config.js";

const OK_STATUS = 200;
const BAD_REQUEST_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;
const SERVICE_UNAVAILABLE_STATUS = 503;

export function buildServer(
  userFunction: SalesforceFunction<any, any>,
  salesforceConfig: SalesforceConfig
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

    const context = new ContextImpl(
      salesforceFunctionsCloudEvent,
      salesforceConfig
    );
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

export type StartServerOptions = {
  host: string;
  port: number;
  userFunction: SalesforceFunction<any, any>;
  salesforceConfig: SalesforceConfig;
  id: number;
  disconnect: () => void;
  grace: number;
  signals: NodeJS.Signals[];
};

export default async function startServer(
  options: StartServerOptions
): Promise<void> {
  const {
    id,
    host,
    port,
    userFunction,
    salesforceConfig,
    disconnect,
    signals,
    grace,
  } = options;

  logger.addField("worker", id);

  const server = buildServer(userFunction, salesforceConfig);
  registerShutdownHooks({ server, disconnect, grace, signals, logger, host });

  try {
    await server.listen({ port, host });
    logger.info(`started function worker ${id}`);
  } catch (err) {
    logger.error(`error starting function worker ${id}: ${err}`);
    disconnect();
  }
}

type RegisterShutdownHooksOptions = Pick<
  StartServerOptions,
  "disconnect" | "grace" | "signals"
> & {
  server: FastifyInstance;
  logger: Logger;
  host: string;
};

function registerShutdownHooks(options: RegisterShutdownHooksOptions): void {
  const { server, disconnect, grace, signals, host } = options;

  const shutdownGracefully = () => {
    server.close(() => {
      disconnect();
    });
  };

  const forceShutdown = () => {
    disconnect();
    process.exit();
  };

  const handleShutdownSignal = (signal) => {
    logger.info(`function worker exiting; received ${signal}`);
    maybeStopLogging(logger, host);
    shutdownGracefully();
    setTimeout(forceShutdown, grace).unref();
  };

  let alreadyShuttingDown = false;
  signals.forEach((signal) => {
    process.on(signal, () => {
      if (alreadyShuttingDown) return; // because we don't need to run the shutdown routine twice :)
      alreadyShuttingDown = true;
      handleShutdownSignal(signal);
    });
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

/**
 * Removes `stdout` from the list of log streams to prevent any grandchild[^1] process from writing output to the
 * console after the master process has exited.
 * [^1]: sf - the Salesforce CLI spins up its local run environment via npx
 *       └── primary - the primary runtime script executed by npx
 *           └── worker - one or more forked processes from the primary process
 *
 * Given the scenario above, when a process interrupt signal is received, the primary can exit before the workers
 * have gracefully shutdown (e.g.; http connections to function still open). If this happens the worker processes
 * become children of the process that executed the `sf` command. These workers will continue to run until graceful or
 * forced shutdown causes them to eventually exit.
 *
 * Only call this when capturing output is no longer required (i.e.; shutdown)
 */
function maybeStopLogging(logger, host) {
  // limit this to localhost only which is really the only place the behavior described above is observed
  if (host === "localhost") {
    logger.getBunyanLogger().streams = [];
  }
}
