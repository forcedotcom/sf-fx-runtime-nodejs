/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ChildProcess, spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { expect } from "chai";
import { request } from "http";

type FunctionProcess = {
  childProcess: ChildProcess;
  processInvoked: Promise<void>;
  processClosed: Promise<{
    output: string;
    code: number;
  }>;
};

type InvocationRequest = {
  responseReceived: Promise<{
    body: string;
    statusCode: number;
  }>;
};

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const PORT = 8000;
const ONE_SECOND = 1000;
const SECONDS = ONE_SECOND;
const GRACE_PERIOD = 1000;

describe("cli shutdown routine", function () {
  this.timeout(60 * SECONDS);

  let functionProcess: FunctionProcess;
  let invocationRequest: InvocationRequest;

  afterEach(() => {
    try {
      if (
        functionProcess &&
        functionProcess.childProcess &&
        functionProcess.childProcess.pid
      ) {
        process.kill(functionProcess.childProcess.pid, "SIGTERM");
      }
    } catch (ignored) {
      // just silently move on
    }
  });

  it("should exit gracefully", async function () {
    await startAndInvokeFunctionThenShutdown({
      timeToCleanlyShutdown: Math.floor(GRACE_PERIOD / 2),
    });
  });

  it("should exit forcefully if the function has not completed before the grace period is reached", async function () {
    await startAndInvokeFunctionThenShutdown({
      timeToCleanlyShutdown: GRACE_PERIOD * 2,
    });
  });

  async function startAndInvokeFunctionThenShutdown(options: {
    timeToCleanlyShutdown: number;
  }) {
    if (process.platform === "win32") {
      // This test won't work on Windows system due to the following:
      // > On Windows, where POSIX signals do not exist, the signal argument will be ignored, and the process will be
      // > killed forcefully and abruptly (similar to 'SIGKILL').
      // (from https://nodejs.org/api/child_process.html#subprocesskillsignal)
      return Promise.resolve();
    }

    const timeToCleanlyShutdown = options.timeToCleanlyShutdown;

    await startFunction({ timeToCleanlyShutdown });
    await invokeFunction();
    await killFunctionProcess("SIGINT");

    const { code, output } = await functionProcess.processClosed;
    expect(code).to.equal(0);
    expect(output).to.include("function worker exiting; received SIGINT");

    try {
      const { statusCode, body } = await invocationRequest.responseReceived;
      expect(body).to.include('[{"complete":true}]');
      expect(statusCode).to.equal(200);
      expect(timeToCleanlyShutdown).to.be.lessThan(GRACE_PERIOD);
    } catch (ignored) {
      expect(timeToCleanlyShutdown).to.be.greaterThan(GRACE_PERIOD);
    }
  }

  function startFunction(options: { timeToCleanlyShutdown: number }) {
    const node = process.argv[0];
    const cliScript = path.resolve(__dirname, "..", "bin", "dev.js");
    const args = [
      "--loader",
      "ts-node/esm",
      cliScript,
      "serve",
      fixture("long-running-function"),
      "-h",
      "localhost",
      "-p",
      `${PORT}`,
      "-w",
      "1",
      "-g",
      `${GRACE_PERIOD}`,
    ];

    const childProcess = spawn(node, args, {
      detached: true,
      cwd: path.resolve(__dirname, ".."),
      env: {
        ...process.env,
        LONG_RUNNING_PROCESS_TIMEOUT: `${options.timeToCleanlyShutdown}`,
      },
    });

    let output = "";
    return new Promise<FunctionProcess>((resolve) => {
      childProcess.stdout.on("data", (data) => {
        process.stdout.write(`[function] ${data}`);
        output += data;
        if (output.includes("started function worker")) {
          resolve({
            childProcess,
            processInvoked: new Promise((resolve) => {
              childProcess.stdout.on("data", () => {
                if (output.includes("Simulating a long running process")) {
                  resolve();
                }
              });
            }),
            processClosed: new Promise((resolve) => {
              childProcess.on("close", (code) => {
                resolve({ output, code });
              });
            }),
          });
        }
      });
    }).then((result) => {
      functionProcess = result;
    });
  }

  function invokeFunction() {
    let body = "";

    const payload = JSON.stringify({});

    const req = request({
      hostname: "localhost",
      port: PORT,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "ce-specversion": "1.0",
        "ce-id": `00Dxx0000006IYJEA2-4Y4W3Lw_LkoskcHdEaZze--TEST-${Date.now()}`,
        "ce-source":
          "urn:event:from:salesforce/xx/228.0/00Dxx0000006IYJ/apex/MyFunctionApex:test():7",
        "ce-type": "com.salesforce.function.invoke.sync",
        "ce-time": "2020-09-03T20:56:28.297915Z",
        "ce-sfcontext":
          "eyJhcGlWZXJzaW9uIjoiNTAuMCIsInBheWxvYWRWZXJzaW9uIjoiMC4xIiwidXNlckNvbnRleHQiOnsib3JnSWQiOiIwMER4eDAwMDAwMDZJWUoiLCJ1c2VySWQiOiIwMDV4eDAwMDAwMVg4VXoiLCJvbkJlaGFsZk9mVXNlcklkIjpudWxsLCJ1c2VybmFtZSI6InRlc3QtenFpc25mNnl0bHF2QGV4YW1wbGUuY29tIiwic2FsZXNmb3JjZUJhc2VVcmwiOiJodHRwOi8vcGlzdGFjaGlvLXZpcmdvLTEwNjMtZGV2LWVkLmxvY2FsaG9zdC5pbnRlcm5hbC5zYWxlc2ZvcmNlLmNvbTo2MTA5Iiwib3JnRG9tYWluVXJsIjoiaHR0cDovL3Bpc3RhY2hpby12aXJnby0xMDYzLWRldi1lZC5sb2NhbGhvc3QuaW50ZXJuYWwuc2FsZXNmb3JjZS5jb206NjEwOSJ9fQ==",
        "ce-sffncontext":
          "eyJhY2Nlc3NUb2tlbiI6IjAwRHh4MDAwMDAwNklZSiFBUUVBUU5SYWM1YTFoUmhoZjAySFJlZ3c0c1NadktoOW9ZLm9oZFFfYV9LNHg1ZHdBZEdlZ1dlbVhWNnBOVVZLaFpfdVkyOUZ4SUVGTE9adTBHZjlvZk1HVzBIRkxacDgiLCJmdW5jdGlvbkludm9jYXRpb25JZCI6bnVsbCwiZnVuY3Rpb25OYW1lIjoiTXlGdW5jdGlvbiIsImFwZXhDbGFzc0lkIjpudWxsLCJhcGV4Q2xhc3NGUU4iOm51bGwsInJlcXVlc3RJZCI6IjAwRHh4MDAwMDAwNklZSkVBMi00WTRXM0x3X0xrb3NrY0hkRWFaemUtLU15RnVuY3Rpb24tMjAyMC0wOS0wM1QyMDo1NjoyNy42MDg0NDRaIiwicmVzb3VyY2UiOiJodHRwOi8vZGhhZ2Jlcmctd3NsMTo4MDgwIn0=",
        Authorization:
          "C2C eyJ2ZXIiOiIxLjAiLCJraWQiOiJDT1JFLjAwRHh4MDAwMDAwNklZSi4xNTk5MTU5NjQwMzUwIiwidHlwIjoiand0IiwiY2x2IjoiSjIuMS4xIiwiYWxnIjoiRVMyNTYifQ.eyJhdWQiOiJwbGF0Zm9ybS1mdW5jdGlvbnMiLCJhdXQiOiJTRVJWSUNFIiwibmJmIjoxNTk5MTY2NTU4LCJjdHgiOiJzZmRjLnBsYXRmb3JtLWZ1bmN0aW9ucyIsImlzcyI6ImNvcmUvZGhhZ2Jlcmctd3NsMS8wMER4eDAwMDAwMDZJWUpFQTIiLCJzdHkiOiJUZW5hbnQiLCJpc3QiOjEsImV4cCI6MTU5OTE2NjY3OCwiaWF0IjoxNTk5MTY2NTg4LCJqdGkiOiJDMkMtMTA3NTg2OTg1NTMxNTMyOTkzMjE3OTEyMzQwNTIzMjgzOTEifQ.jZZ4ksYlq0vKtBf0yEfpJVL2yYh3QHOwp0KCk-QxzDyF_7VARB-N74Cqpj2JWhVP4TcBLGXYuldB-Sk6P5HlGQ",
      },
    });

    return new Promise<InvocationRequest>((resolve) => {
      req.write(payload);
      req.end(() => {
        resolve({
          responseReceived: new Promise((resolve, reject) => {
            req.on("error", reject);
            req.on("response", (res) => {
              const statusCode = res.statusCode;
              res.setEncoding("utf8");
              res.on("data", (chunk) => (body += chunk));
              res.on("error", reject);
              res.on("end", () => resolve({ statusCode, body }));
            });
          }),
        });
      });
    }).then((result) => {
      invocationRequest = result;
    });
  }

  async function killFunctionProcess(signal: NodeJS.Signals) {
    await functionProcess.processInvoked;
    functionProcess.childProcess.kill(signal);
    return new Promise((resolve) => {
      setTimeout(resolve, GRACE_PERIOD + ONE_SECOND);
    });
  }
});

function fixture(name) {
  return path.resolve(__dirname, "..", "fixtures", name);
}
