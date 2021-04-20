import { expect } from "chai";
import dataApiMocks from "./setup/mocks/data-api";
import { DataApi } from "../src/sdk";

const uri = "http://localhost:8080/";
const apiVersion = "51.0";
const token =
  "00DB0000000UIn2!AQMAQKXBvR03lDdfMiD6Pdpo_wiMs6LGp6dVkrwOuqiiTEmwdPb8MvSZwdPLe009qHlwjxIVa4gY.JSAd0mfgRRz22vS";
const dataApi = new DataApi(uri, apiVersion, token);

describe("DataApi Class", async () => {
  describe("query()", async () => {
    beforeEach(() => {
      dataApiMocks.mockQuery(uri);
    });

    it("should return simple query from DataApi", async () => {
      const result = await dataApi.query("SELECT Name FROM Account");

      expect(result.done).equal(true);
      expect(result.totalSize).equal(5);
    });
  });
});
