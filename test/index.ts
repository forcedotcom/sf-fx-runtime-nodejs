import mock from "sinon/lib/sinon/mock.js";
import spy from "sinon/lib/sinon/spy.js";
import * as index from "../src/index.js";
import { expect } from "chai";
import * as user_function from "../src/user-function.js";
import * as server from "../src/server.js";
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
        const startServer_spy = spy(server, "default");
        const absolutePath = path.resolve('./fixtures/js-esm-template');
        const userFunction = loadUserFunctionFromDirectory(absolutePath);
        index.callCommand(args);
        expect(startServer_spy.calledWith("localhost", 8080, userFunction));
    });

    it("calls loadUserFunctionFromDirectory() with correct args", async () => {
        const loadUserFunctionFromDirectory_mock = mock(user_function);
        // loadUserFunctionFromDirectory_mock.expects("loadUserFunctionFromDirectory").atLeast(1);
        const absolutePath = path.resolve('./fixtures/js-esm-template');
        loadUserFunctionFromDirectory_mock.expects("loadUserFunctionFromDirectory").withArgs(absolutePath);
        index.callCommand(args);
        loadUserFunctionFromDirectory_mock.verify();
    });

    // it("loads and catches errors from loadUserFunctionFromDirectory()", async () => {
    //     const result1 = loadUserFunctionFromDirectory("fake/path");
    //     expect(result1).to.equal("Could not load 'package.json' from project directory: ");
    //
    //     const result2 = loadUserFunctionFromDirectory("another/fake/path");
    //     expect(result2).to.equal("Could not read 'main' field from 'package.json' in project directory!");
    // });

});

