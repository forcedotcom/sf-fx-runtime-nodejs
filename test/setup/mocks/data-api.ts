import * as nock from "nock";

function _readFromFixtures(fixtureName) {
  return __dirname + `../../fixtures/${fixtureName}.json`;
}

export default {
  mockCreate(url: string): any {
    return nock(url).post("/").replyWithFile(201, _readFromFixtures("create"));
  },
  mockQuery(url: string): any {
    return nock(url).get("/").replyWithFile(200, _readFromFixtures("query"));
  },
  mockUpdate(url: string): any {
    return nock(url).patch("/").replyWithFile(204, _readFromFixtures("update"));
  },
};
