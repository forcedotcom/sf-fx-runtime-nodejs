import { expect } from "chai";
import { readSalesforceConfig } from "../src/salesforce-config.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from 'os';
import { writeFileSync } from 'fs';

describe("readSalesforceConfig", () => {
  it("reads a valid project.toml", async () => {
    const path = join(dirname(fileURLToPath(import.meta.url)),"..","fixtures","js-esm-template","project.toml");
    const conf = await readSalesforceConfig(path);
    expect(conf.id).to.eql("esm"); 
    expect(conf.description).to.not.be.empty;
    expect(conf.restApiVersion).to.eql("51.0");
  });

  it("uses a default value for restApiVersion", async () => {
    const path = join(dirname(fileURLToPath(import.meta.url)),"..","fixtures","js-cjs-template","project.toml");
    const conf = await readSalesforceConfig(path);
    expect(conf.restApiVersion).to.eql("53.0"); 
  });

  it('throws for a missing project.toml', async () => {
    const path = join("some", "nonexistent", "path", "project.toml");
    try {
      await readSalesforceConfig(path)
      throw "Expected readSalesforceConfig to reject";
    } catch (e) {
      expect(e.message).to.contain("Could not open SalesforceConfig");
    }
  });

  it('throws for a malformed project.toml', async () => {
    const path = join(tmpdir(), "sf-fx-runtime-nodejs-malformed-project.toml");
    writeFileSync(path, "]broken[\n");
    try {
      await readSalesforceConfig(path)
      throw "Expected readSalesforceConfig to reject";
    } catch (e) {
      expect(e.message).to.contain("Could not parse SalesforceConfig");
    }
  });
});
