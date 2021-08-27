import spy from "sinon/lib/sinon/spy.js";
import { expect } from "chai";
import * as path from "path";
import { loadUserFunctionFromDirectory } from "../src/user-function.js";
import startServer from "../src/server.js";
import index from "../src/index.js";
import { parseArgs } from "../src/index.js";

const args = [
  "/usr/local/Cellar/node/16.5.0/bin/node",
  "../bin/invoke.js",
  "serve",
  "./fixtures/js-esm-template",
];

describe("index.ts", async () => {
  it("calls startServer() with correct args", async () => {
    const startServer_spy = spy();
    const absolutePath = path.resolve("./fixtures/js-esm-template");
    const userFunction = loadUserFunctionFromDirectory(absolutePath);
    index(args, loadUserFunctionFromDirectory, startServer_spy);
    expect(startServer_spy.calledWith("localhost", 8080, userFunction));
  });

  it("calls loadUserFunctionFromDirectory() with correct args", async () => {
    const loadUserFunctionFromDirectory_spy = spy();
    const absolutePath = path.resolve("./fixtures/js-esm-template");
    index(args, loadUserFunctionFromDirectory_spy, startServer);
    expect(loadUserFunctionFromDirectory_spy.calledWith(absolutePath));
  });

  it("correctly parses args with yargs", async () => {
    const parsed = parseArgs(args);
    expect(parsed.projectPath).to.equal(
      "/Users/zhang.l/Documents/sf-fx-runtime-nodejs/fixtures/js-esm-template"
    );
    expect(parsed.host).to.equal("localhost");
    expect(parsed.port).to.equal(8080);
  });
});
