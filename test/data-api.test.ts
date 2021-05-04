import { expect } from "chai";
// import dataApiMocks from "./setup/mocks/data-api";
import { DataApi } from "../src/sdk";
// import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';
// import * as nock from "nock";
// import { AnyJson, ensureJsonMap, JsonMap, ensureString } from '@salesforce/ts-types';
// import { AuthInfo, Connection, SfdxError } from '@salesforce/core';

// const salesforceApp = testSetup();

const uri = "localhost:8080";
const apiVersion = "51.0";
const token =
  "00DB0000000UIn2!AQMAQKXBvR03lDdfMiD6Pdpo_wiMs6LGp6dVkrwOuqiiTEmwdPb8MvSZwdPLe009qHlwjxIVa4gY.JSAd0mfgRRz22vS";
const dataApi = new DataApi(uri, apiVersion, token);

describe("DataApi Class", async () => {
  describe("query()", async () => {
    beforeEach(() => {
      // nock.disableNetConnect();
      // dataApiMocks.mockQuery(uri);

      // start wiremock
    });

    it("returns a simple query from DataApi", async () => {
      // const testData = new MockTestOrgData();
      // const uri = testData.instanceUrl;
      // const username = testData.username;

      // console.log(testData);
      // dataApiMocks.mockQuery(uri, salesforceApp);
      // salesforceApp.setConfigStubContents('AuthInfoConfig', {
      //   contents: await testData.getConfig()
      // });

      // let records = ["record", "record"]

      // $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
      //   const _request: JsonMap = ensureJsonMap(request);
      //   if (request && ensureString(_request.url).includes('Account')) {
      //     return Promise.resolve(records);
      //   } else {
      //     return Promise.reject(new SfdxError(`Unexpected request: ${_request.url}`));
      //   }
      // };
      // console.log(testData);
      // const dataApi = new DataApi(uri, apiVersion, username);
      const result = await dataApi.query("SELECT Name FROM Account");

      console.log(result);
      expect(result.done).equal(true);
      expect(result.totalSize).equal(5);

      // stop wiremock
    });
  });
});
