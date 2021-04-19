import { expect } from "chai";
import {
  DataApi,
  // RecordQueryResult
} from "../src/sdk";

const dataApi = new DataApi(
  "http://localhost:8080/",
  "51.0",
  "00DB0000000UIn2!AQMAQKXBvR03lDdfMiD6Pdpo_wiMs6LGp6dVkrwOuqiiTEmwdPb8MvSZwdPLe009qHlwjxIVa4gY.JSAd0mfgRRz22vS");

describe('DataApi Class', async () => {
  describe('test query()', async () => {
    it('should return simple query from DataApi', async () => {
      let result = await dataApi.query("SELECT Name FROM Account");

      expect(result.done).equal(true);
      expect(result.totalSize).equal(5);
    });
  });
});
