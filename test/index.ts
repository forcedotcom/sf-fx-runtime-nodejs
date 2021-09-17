/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import spy from "sinon/lib/sinon/spy.js";
import { expect } from "chai";
import * as path from "path";
import { loadUserFunctionFromDirectory } from "../src/user-function.js";
import index from "../src/index.js";
import { parseArgs } from "../src/index.js";

let workers = 0;
const fakeThrong = async function(...processes: Array<any>) {
  console.log("workers", workers);
  workers = processes[0].count;
  console.log("workers", workers);
  return await processes[0].worker("worker 1", function() { return null; });
};

let args = [
  "/some/path/to/node",
  "/some/path/to/cli-binary.js",
  "serve",
  "./fixtures/js-esm-template",
];

describe("index.ts", async () => {
  it("calls startServer with localhost:8080 when given default arguments", async () => {
    const absolutePath = path.resolve("./fixtures/js-esm-template");
    const userFunction = loadUserFunctionFromDirectory(absolutePath);
    const startServerSpy = spy();
    index(args, loadUserFunctionFromDirectory, startServerSpy, fakeThrong);
    expect(startServerSpy.calledWith("localhost", 8080, userFunction));
  });

  it("calls startServer with non-default arguments", async () => {
    args = [
      "/some/path/to/node",
      "/some/path/to/cli-binary.js",
      "serve",
      "./fixtures/js-esm-template",
      "-h",
      "notlocalhost",
      "-p",
      "3000",
    ];
    const absolutePath = path.resolve("./fixtures/js-esm-template");
    const userFunction = loadUserFunctionFromDirectory(absolutePath);
    const startServerSpy = spy();
    index(args, loadUserFunctionFromDirectory, startServerSpy, fakeThrong);
    expect(startServerSpy.calledWith("notlocalhost", 3000, userFunction));
  });

  it("starts with multiple workers", async () => {
    args = [
      "/some/path/to/node",
      "/some/path/to/cli-binary.js",
      "serve",
      "./fixtures/js-esm-template",
      "-w",
      "3",
    ];
    const startServerSpy = spy();
    await index(args, loadUserFunctionFromDirectory, startServerSpy, fakeThrong);
    expect(workers).to.eq(3);
  });

  it("calls loadUserFunctionFromDirectory() with correct args", async () => {
    const loadUserFunctionFromDirectorySpy = spy();
    const startServerSpy = spy();
    const absolutePath = path.resolve("./fixtures/js-esm-template");
    index(args, loadUserFunctionFromDirectorySpy, startServerSpy, fakeThrong);
    expect(loadUserFunctionFromDirectorySpy.calledWith(absolutePath));
  });

  it("correctly parses args with yargs", async () => {
    const parsed = parseArgs(args);
    expect(parsed.projectPath).to.include("/fixtures/js-esm-template");
    expect(parsed.host).to.equal("localhost");
    expect(parsed.port).to.equal(8080);
  });
});
