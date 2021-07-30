import { expect } from "chai";
import { buildServer } from "../src/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userFunction = async function (event, context, logger) {
  return "Hello World";
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const badFunction = async function (event, context, logger) {
  throw "bad";
};

const cloudEventHeaders = {
  "content-type": "application/json; charset=utf-8",
  "ce-id": "fe9da89b-1eed-471c-a04c-0b3c664b63af",
  "ce-time": "2021-07-29T20:35:46.910Z",
  "ce-type": "com.salesforce.function.invoke.sync",
  "ce-source": "urn:sf-fx-runtime-nodejs:testing",
  "ce-specversion": "1.0",
  "ce-sfcontext":
    "eyJhcGlWZXJzaW9uIjoiNTAuMCIsInBheWxvYWRWZXJzaW9uIjoiMC4xIiwidXNlckNvbnRleHQiOnsib3JnSWQiOiIwMER4eDAwMDAwMDZJWUoiLCJ1c2VySWQiOiIwMDV4eDAwMDAwMVg4VXoiLCJvbkJlaGFsZk9mVXNlcklkIjpudWxsLCJ1c2VybmFtZSI6InRlc3QtenFpc25mNnl0bHF2QGV4YW1wbGUuY29tIiwic2FsZXNmb3JjZUJhc2VVcmwiOiJodHRwOi8vcGlzdGFjaGlvLXZpcmdvLTEwNjMtZGV2LWVkLmxvY2FsaG9zdC5pbnRlcm5hbC5zYWxlc2ZvcmNlLmNvbTo2MTA5Iiwib3JnRG9tYWluVXJsIjoiaHR0cDovL3Bpc3RhY2hpby12aXJnby0xMDYzLWRldi1lZC5sb2NhbGhvc3QuaW50ZXJuYWwuc2FsZXNmb3JjZS5jb206NjEwOSJ9fQ==",
  "ce-sffncontext":
    "eyJhY2Nlc3NUb2tlbiI6IjAwRHh4MDAwMDAwNklZSiFBUUVBUU5SYWM1YTFoUmhoZjAySFJlZ3c0c1NadktoOW9ZLm9oZFFfYV9LNHg1ZHdBZEdlZ1dlbVhWNnBOVVZLaFpfdVkyOUZ4SUVGTE9adTBHZjlvZk1HVzBIRkxacDgiLCJmdW5jdGlvbkludm9jYXRpb25JZCI6bnVsbCwiZnVuY3Rpb25OYW1lIjoiTXlGdW5jdGlvbiIsImFwZXhDbGFzc0lkIjpudWxsLCJhcGV4Q2xhc3NGUU4iOm51bGwsInJlcXVlc3RJZCI6IjAwRHh4MDAwMDAwNklZSkVBMi00WTRXM0x3X0xrb3NrY0hkRWFaemUtLU15RnVuY3Rpb24tMjAyMC0wOS0wM1QyMDo1NjoyNy42MDg0NDRaIiwicmVzb3VyY2UiOiJodHRwOi8vZGhhZ2Jlcmctd3NsMTo4MDgwIn0",
};

describe("server", () => {
  it("checks health", () => {
    buildServer(userFunction).inject(
      {
        method: "POST",
        url: "/",
        headers: { "x-health-check": "true" },
      },
      (err, response) => {
        expect(response.statusCode).equal(200);
      }
    );
  });

  it("adds extra info to a user thrown function error", () => {
    buildServer(badFunction).inject(
      {
        method: "POST",
        url: "/",
        headers: cloudEventHeaders,
        payload: "{}",
      },
      (err, response) => {
        expect(response.body).equal("Function threw: bad");

        const extraInfo = JSON.parse(
          decodeURI(response.headers["x-extra-info"].toString())
        );
        expect(extraInfo.isFunctionError).equal(true);
        expect(extraInfo.stack).equal("");

        expect(response.statusCode).equal(500);
      }
    );
  });

  it("receives a valid response from valid cloudEventHeaders", () => {
    buildServer(userFunction).inject(
      {
        method: "POST",
        url: "/",
        headers: cloudEventHeaders,
        payload: "{}",
      },
      (err, response) => {
        expect(response.body).equal('"Hello World"');
        expect(response.statusCode).equal(200);
      }
    );
  });

  it("returns 400 on missing cloud event", () => {
    buildServer(userFunction).inject(
      {
        method: "POST",
        url: "/",
      },
      (err, response) => {
        expect(response.body).equal(
          "Could not parse CloudEvent: no cloud event detected"
        );
        expect(response.statusCode).equal(400);
      }
    );
  });
});
