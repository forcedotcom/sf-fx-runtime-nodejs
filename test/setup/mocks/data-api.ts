import * as nock from "nock";
import * as fs from "fs";
import { AnyJson } from '@salesforce/ts-types';

function _readFromFixtures(fixtureName) {
  const fileName = __dirname + `/../../fixtures/${fixtureName}.json`;
  const rawData = fs.readFileSync(fileName).toString();
  
  return JSON.parse(rawData);
}

export default {
  mockCreate(url: string): any {
    return nock(url).post("/").reply(201, _readFromFixtures("create"));
  },
  mockQuery(url: string, testContext: any):  any {
    const fixture = _readFromFixtures("query");
    // const request = fixture.request;
    const response = fixture.response;

    // testContext.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
    //   console.log("request", request);
    //   console.log("response", response);
    //   return Promise.resolve(response.body);
    // }
    console.log(response.body);

    return nock(url)
      .get("/services/data/v42.0/query?q=SELECT%20Name%20FROM%20Account")
      .reply(200, JSON.parse(response.body), response.headers);
  },
  mockUpdate(url: string): any {
    return nock(url).patch("/").reply(_readFromFixtures("update"));
  },
};
