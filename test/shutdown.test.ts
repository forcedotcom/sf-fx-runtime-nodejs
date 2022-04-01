/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ChildProcess, spawn, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { expect } from "chai";

type ProcessSpawnedResult = {
  childProcess: ChildProcess;
  processClosed: Promise<ProcessClosedResult>;
};

type ProcessClosedResult = {
  output: string;
  code: number;
};

type TestPids = {
  primary: number | undefined;
  workers: number[];
  invoker: number | undefined;
};

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const PORT = 3000;
const ONE_SECOND = 1000;
const SECONDS = ONE_SECOND;
const GRACE_PERIOD = 1000;

describe("cli shutdown routine", function () {
  this.timeout(30 * SECONDS);

  let spawnedFunction: ProcessSpawnedResult;
  let spawnedInvoker: ProcessSpawnedResult;
  let pids: TestPids;

  beforeEach(() => {
    pids = {
      primary: undefined,
      workers: [],
      invoker: undefined,
    };
  });

  afterEach(() => {
    if (pids.primary && isAlive(pids.primary)) {
      process.kill(pids.primary, "SIGTERM");
    }
    pids.workers.forEach((pid) => {
      if (isAlive(pid)) {
        process.kill(pid, "SIGTERM");
      }
    });
    if (pids.invoker && isAlive(pids.invoker)) {
      process.kill(pids.invoker, "SIGTERM");
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
    const grace = GRACE_PERIOD;
    const timeToCleanlyShutdown = options.timeToCleanlyShutdown;
    const expectForcedShutdown = grace < timeToCleanlyShutdown;

    await startFunction({ timeToCleanlyShutdown });
    await invokeFunction();
    await killFunctionProcess("SIGINT");

    const closedFunctionProcess = await spawnedFunction.processClosed;
    expect(closedFunctionProcess.code).to.equal(0);
    expect(closedFunctionProcess.output).to.include(
      "function worker exiting; received SIGINT"
    );

    const closedInvokerProcess = await spawnedInvoker.processClosed;
    expect(closedInvokerProcess.code).to.equal(0);
    if (expectForcedShutdown) {
      expect(closedInvokerProcess.output).to.include("Empty reply from server");
    } else {
      expect(closedInvokerProcess.output).to.include('[{"complete":true}]');
    }
  }

  function startFunction(options: { timeToCleanlyShutdown: number }) {
    const port = PORT;
    const grace = GRACE_PERIOD;
    const functionProject = fixture("long-running-function");
    const longRunningProcessTimeout = options.timeToCleanlyShutdown;
    return run({
      port,
      grace,
      functionProject,
      longRunningProcessTimeout,
    }).then((result) => {
      spawnedFunction = result;
      pids.primary = result.childProcess.pid;
      pids.workers = getChildProcessIds(pids.primary);
    });
  }

  function invokeFunction() {
    const port = PORT;
    const payload = {};
    return invoke({ port, payload }).then((result) => {
      spawnedInvoker = result;
      pids.invoker = result.childProcess.pid;
    });
  }

  function killFunctionProcess(signal: NodeJS.Signals) {
    spawnedFunction.childProcess.kill(signal);
    return new Promise((resolve) => {
      setTimeout(resolve, GRACE_PERIOD + ONE_SECOND);
    });
  }
});

function run(options: {
  functionProject: string;
  port: number;
  longRunningProcessTimeout: number;
  grace: number;
}): Promise<ProcessSpawnedResult> {
  const node = process.argv[0];

  const cliScript = path.resolve(__dirname, "..", "bin", "test.js");

  const args = [
    "--loader",
    "ts-node/esm",
    cliScript,
    "serve",
    options.functionProject,
    "-h",
    "localhost",
    "-p",
    `${options.port}`,
    "-w",
    "1",
    "-g",
    `${options.grace}`,
  ];

  const childProcess = spawn(node, args, {
    detached: true,
    cwd: path.resolve(__dirname, ".."),
    env: {
      ...process.env,
      LONG_RUNNING_PROCESS_TIMEOUT: `${options.longRunningProcessTimeout}`,
    },
  });

  let output = "";
  return new Promise((resolve) => {
    const processClosed = new Promise<ProcessClosedResult>((resolve) => {
      childProcess.on("close", (code) => {
        resolve({ output, code });
      });
    });

    childProcess.stdout.on("data", (data) => {
      process.stdout.write(`[function] ${data}`);
      output += data;
      if (output.includes("started function worker")) {
        resolve({ childProcess, processClosed });
      }
    });
  });
}

function invoke(options: {
  port: number;
  payload: Record<string, unknown>;
}): Promise<ProcessSpawnedResult> {
  const invoker = path.resolve(__dirname, "..", "invoke.sh");

  const childProcess = spawn(
    invoker,
    [`http://localhost:${options.port}`, JSON.stringify(options.payload)],
    { detached: true }
  );

  let output = "";
  return new Promise((resolve) => {
    const processClosed = new Promise<ProcessClosedResult>((resolve) => {
      childProcess.on("close", (code) => {
        resolve({ output, code });
      });
    });

    const onDataHandler = (data) => {
      process.stdout.write(`[invoker] ${data}`);
      output += data;
      if (output.includes("upload completely sent off")) {
        resolve({ childProcess, processClosed });
      }
    };

    childProcess.stderr.on("data", onDataHandler);
    childProcess.stdout.on("data", onDataHandler);
  });
}

function getChildProcessIds(parentPID: number): number[] {
  return execSync(`pgrep -P ${parentPID}`)
    .toString("utf8")
    .split("\n")
    .filter((s) => s)
    .map((line) => parseInt(line.trim(), 10));
}

function isAlive(pid: number): boolean {
  try {
    execSync(`ps -p ${pid}`);
    return true;
  } catch {
    return false;
  }
}

function fixture(name) {
  return path.resolve(__dirname, "..", "fixtures", name);
}
