import mock from "sinon/lib/sinon/mock.js";
import spy from "sinon/lib/sinon/spy.js";
import * as index from "../src/index.js";
import { expect } from "chai";
import * as user_function from "../src/user-function.js";
import * as server from "../src/server.js";
import startServer from "../src/server.js";
import * as path from "path";
import {loadUserFunctionFromDirectory} from "../src/user-function.js";

const args = [
    '/usr/local/Cellar/node/16.5.0/bin/node',
    '/Users/zhang.l/Documents/sf-fx-runtime-nodejs/bin/invoke.js',
    'serve',
    './fixtures/js-esm-template'
];

describe("callIndex", async () => {

    it("calls startServer() with correct args", async () => {
        const startServer_mock = mock(server);
        const absolutePath = path.resolve('./fixtures/js-esm-template');
        const userFunction = loadUserFunctionFromDirectory(absolutePath);
        startServer_mock.expects("startServer").withArgs("localhost", 8080, userFunction);
        index.callCommand(args);
        startServer_mock.verify();
    });

    it("calls loadUserFunctionFromDirectory() with correct args", async () => {
        const loadUserFunctionFromDirectory_mock = mock(user_function);
        // loadUserFunctionFromDirectory_mock.expects("loadUserFunctionFromDirectory").atLeast(1);
        const absolutePath = path.resolve('./fixtures/js-esm-template');
        loadUserFunctionFromDirectory_mock.expects("loadUserFunctionFromDirectory").withArgs(absolutePath);
        index.callCommand(args);
        loadUserFunctionFromDirectory_mock.verify();
    });
});

