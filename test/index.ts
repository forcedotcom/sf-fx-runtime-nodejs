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

const args = [
  "/usr/local/Cellar/node/16.5.0/bin/node",
  "../bin/invoke.js",
  "serve",
  "./fixtures/js-esm-template",
];

const fakeThrong = async function(...processes: Array<any>) {
  return await processes[0].worker("worker 1", function() { return null; });
};

describe("index.ts", async () => {
  it("calls startServer() with correct args", async () => {
    const startServerSpy = spy();
    const absolutePath = path.resolve("./fixtures/js-esm-template");
    const userFunction = loadUserFunctionFromDirectory(absolutePath);
    index(args, loadUserFunctionFromDirectory, startServerSpy, fakeThrong);
    expect(startServerSpy.calledWith("localhost", 8080, userFunction));
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
