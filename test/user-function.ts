import { expect } from "chai";
import { loadDefaultExport } from "../src/user-function.js";

describe("loadDefaultExport", async () => {
  const dir = "../fixtures";

  describe("export from JavaScript sfdx template", async () => {
    const jsTemplate = "js-template.js";

    it("exports the user function from module.exports", async () => {
      const defaultExport = await loadDefaultExport(dir, jsTemplate);

      expect(defaultExport).to.be.a("function");
    });
  });

  describe("export from TypeScript sfdx template", async () => {
    const tsTemplate = "ts-template.js";

    it("exports the user function from exports", async () => {
      const defaultExport = await loadDefaultExport(dir, tsTemplate);

      expect(defaultExport).to.be.a("function");
    });
  });

  describe("export file specified in 'main' of package.json is missing", async () => {
    const missingFnFile = "nada.js";

    it("throws 'Could not load module' error", async () => {
      expect(() => loadDefaultExport(dir, missingFnFile)).to.throw(
        "Could not load module referenced in 'main' field of 'package.json': "
      );
    });
  });

  describe("export file is not a function", async () => {
    const noFnExport = "no-fn.js";

    it("throws 'is not a function' error", async () => {
      expect(() => loadDefaultExport(dir, noFnExport)).to.throw(
        "Default export of module referenced in 'main' field of 'package.json' is not a function!"
      );
    });
  });
});
