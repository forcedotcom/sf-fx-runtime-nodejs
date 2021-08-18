import { expect } from "chai";
import { loadUserFunctionFromDirectory } from "../src/user-function.js";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { InvocationEvent } from "sf-fx-sdk-nodejs";

describe("loadUserFunctionFromDirectory", async () => {
  const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures")

  describe("export from JavaScript CJS sfdx template", async () => {
    it("exports the user function from module.exports", async () => {
      const dir = join(fixturesDir, "js-cjs-template")
      const defaultExport = await loadUserFunctionFromDirectory(dir);

      expect(defaultExport).to.be.a("function");
    });
  });

  describe("export from JavaScript ESM sfdx template", async () => {
    it("exports the user function from exports", async () => {
      const dir = join(fixturesDir, "js-esm-template")
      const defaultExport = await loadUserFunctionFromDirectory(dir);

      expect(defaultExport).to.be.a("function");
    });
  });

  describe("export from TypeScript CJS sfdx template", async () => {
    it("exports the user function from exports", async () => {
      const dir = join(fixturesDir, "ts-cjs-template")
      const defaultExport = await loadUserFunctionFromDirectory(dir);

      expect(defaultExport).to.be.a("function");
    });
  });

  describe("missing package.json", async () => {
    it("rejects with 'Could not read package.json'", async () => {
      const dir = join(fixturesDir, "missing-package-json")
      try {
        await loadUserFunctionFromDirectory(dir)
        throw "Expected loadUserFunctionFromDirectory to reject";
      } catch (err) {
        expect(err.toString()).to.include("Could not read 'package.json'");
      }
    });
  });

  describe("export file specified in 'main' of package.json is missing", async () => {
    it("rejects with 'Could not load module'", async () => {
      const dir = join(fixturesDir, "missing-main")
      try {
        await loadUserFunctionFromDirectory(dir);
        throw "Expected loadUserFunctionFromDirectory to reject";
      } catch (err) {
        expect(err.toString()).to.include("Could not open function file specified by 'main'");
      }
    });
  });

  describe("export file is not a function", async () => {
    it("rejects with 'is not a function'", async () => {
      const dir = join(fixturesDir, "not-function")
      try {
        await loadUserFunctionFromDirectory(dir);
      } catch (err) {
        const errString = err.toString()
        expect(errString).to.include("Default export of module");
        expect(errString).to.include("is not a function");
      }
    });
  });
});
