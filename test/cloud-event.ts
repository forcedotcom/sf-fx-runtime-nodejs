/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from "chai";
import { CloudEvent, HTTP } from "cloudevents";
import { parseCloudEvent } from "../src/cloud-event.js";

describe("parseCloudEvent", () => {
  it("parses an event with Salesforce extensions", () => {
    const inputEvent = new CloudEvent({
      id: "fe9da89b-1eed-471c-a04c-0b3c664b63af",
      source: "urn:sf-fx-runtime-nodejs:testing",
      type: "com.salesforce.function.invoke.sync",
      sfcontext:
        "eyJhcGlWZXJzaW9uIjoiNTAuMCIsInBheWxvYWRWZXJzaW9uIjoiMC4xIiwidXNlckNvbnRleHQiOnsib3JnSWQiOiIwMER4eDAwMDAwMDZJWUoiLCJ1c2VySWQiOiIwMDV4eDAwMDAwMVg4VXoiLCJvbkJlaGFsZk9mVXNlcklkIjpudWxsLCJ1c2VybmFtZSI6InRlc3QtenFpc25mNnl0bHF2QGV4YW1wbGUuY29tIiwic2FsZXNmb3JjZUJhc2VVcmwiOiJodHRwOi8vcGlzdGFjaGlvLXZpcmdvLTEwNjMtZGV2LWVkLmxvY2FsaG9zdC5pbnRlcm5hbC5zYWxlc2ZvcmNlLmNvbTo2MTA5Iiwib3JnRG9tYWluVXJsIjoiaHR0cDovL3Bpc3RhY2hpby12aXJnby0xMDYzLWRldi1lZC5sb2NhbGhvc3QuaW50ZXJuYWwuc2FsZXNmb3JjZS5jb206NjEwOSJ9fQ==",
      sffncontext:
        "eyJhY2Nlc3NUb2tlbiI6IjAwRHh4MDAwMDAwNklZSiFBUUVBUU5SYWM1YTFoUmhoZjAySFJlZ3c0c1NadktoOW9ZLm9oZFFfYV9LNHg1ZHdBZEdlZ1dlbVhWNnBOVVZLaFpfdVkyOUZ4SUVGTE9adTBHZjlvZk1HVzBIRkxacDgiLCJmdW5jdGlvbkludm9jYXRpb25JZCI6bnVsbCwiZnVuY3Rpb25OYW1lIjoiTXlGdW5jdGlvbiIsImFwZXhDbGFzc0lkIjpudWxsLCJhcGV4Q2xhc3NGUU4iOm51bGwsInJlcXVlc3RJZCI6IjAwRHh4MDAwMDAwNklZSkVBMi00WTRXM0x3X0xrb3NrY0hkRWFaemUtLU15RnVuY3Rpb24tMjAyMC0wOS0wM1QyMDo1NjoyNy42MDg0NDRaIiwicmVzb3VyY2UiOiJodHRwOi8vZGhhZ2Jlcmctd3NsMTo4MDgwIn0",
    });
    const { headers, body } = HTTP.binary(inputEvent);
    const { cloudEvent, sfContext, sfFunctionContext } = parseCloudEvent(
      headers,
      body
    );

    expect(cloudEvent.id).to.equal(inputEvent.id);
    expect(sfContext).to.deep.equal({
      apiVersion: "50.0",
      payloadVersion: "0.1",
      userContext: {
        onBehalfOfUserId: null,
        orgDomainUrl:
          "http://pistachio-virgo-1063-dev-ed.localhost.internal.salesforce.com:6109",
        orgId: "00Dxx0000006IYJ",
        salesforceBaseUrl:
          "http://pistachio-virgo-1063-dev-ed.localhost.internal.salesforce.com:6109",
        userId: "005xx000001X8Uz",
        username: "test-zqisnf6ytlqv@example.com",
      },
    });
    expect(sfFunctionContext).to.deep.equal({
      accessToken:
        "00Dxx0000006IYJ!AQEAQNRac5a1hRhhf02HRegw4sSZvKh9oY.ohdQ_a_K4x5dwAdGegWemXV6pNUVKhZ_uY29FxIEFLOZu0Gf9ofMGW0HFLZp8",
      apexClassFQN: null,
      apexClassId: null,
      functionInvocationId: null,
      functionName: "MyFunction",
      requestId:
        "00Dxx0000006IYJEA2-4Y4W3Lw_LkoskcHdEaZze--MyFunction-2020-09-03T20:56:27.608444Z",
      resource: "http://dhagberg-wsl1:8080",
    });
  });

  // TODO W-9654393: This currently fails with: `TypeError: Cannot read property 'toString' of undefined`,
  // which server.js displays as: "Could not parse CloudEvent: Cannot read property 'toString' of undefined".
  // The Java equivalent returns an `Optional.empty()`, however it's not clear what the expected
  // behaviour should be here. Should it throw with a clearer message instead given that much of
  // the rest of the invoker depends on the extension payload?
  it.skip("parses an event with no Salesforce extensions", () => {
    const inputEvent = new CloudEvent({
      id: "fe9da89b-1eed-471c-a04c-0b3c664b63af",
      source: "urn:sf-fx-runtime-nodejs:testing",
      type: "com.salesforce.function.invoke.sync",
    });
    const { headers, body } = HTTP.binary(inputEvent);
    const { cloudEvent, sfContext, sfFunctionContext } = parseCloudEvent(
      headers,
      body
    );

    expect(cloudEvent.id).to.equal(inputEvent.id);
    // Should this even be `null`, or something else?
    expect(sfContext).to.equal(null);
    expect(sfFunctionContext).to.equal(null);
  });

  // TODO W-9654393: This currently fails with: `SyntaxError: Unexpected end of JSON input`
  // The Java equivalent returns an `Optional.empty()`, however like the test above,
  // it's not clear what the expected behaviour should be.
  it.skip("parses an event with invalid JSON in the Salesforce extensions", () => {
    const inputEvent = new CloudEvent({
      id: "fe9da89b-1eed-471c-a04c-0b3c664b63af",
      source: "urn:sf-fx-runtime-nodejs:testing",
      type: "com.salesforce.function.invoke.sync",
      sfcontext: Buffer.from("{", "utf-8").toString("base64"),
      sffncontext: Buffer.from("{", "utf-8").toString("base64"),
    });
    const { headers, body } = HTTP.binary(inputEvent);
    const { cloudEvent, sfContext, sfFunctionContext } = parseCloudEvent(
      headers,
      body
    );

    expect(cloudEvent.id).to.equal(inputEvent.id);
    // Should this even be `null`, or something else?
    expect(sfContext).to.equal(null);
    expect(sfFunctionContext).to.equal(null);
  });

  // TODO W-9654393: This currently fails with: `TypeError: Cannot read property 'toString' of undefined`
  // The Java equivalent returns an `Optional.empty()`, however like the test above,
  // it's not clear what the expected behaviour should be.
  it.skip("parses an event with empty string Salesforce extensions", () => {
    const inputEvent = new CloudEvent({
      id: "fe9da89b-1eed-471c-a04c-0b3c664b63af",
      source: "urn:sf-fx-runtime-nodejs:testing",
      type: "com.salesforce.function.invoke.sync",
      sfcontext: Buffer.from("", "utf-8").toString("base64"),
      sffncontext: Buffer.from("", "utf-8").toString("base64"),
    });
    const { headers, body } = HTTP.binary(inputEvent);
    const { cloudEvent, sfContext, sfFunctionContext } = parseCloudEvent(
      headers,
      body
    );

    expect(cloudEvent.id).to.equal(inputEvent.id);
    // Should this even be `null`, or something else?
    expect(sfContext).to.equal(null);
    expect(sfFunctionContext).to.equal(null);
  });
});
