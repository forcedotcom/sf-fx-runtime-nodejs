import { expect } from "chai";
import { parseCloudEvent } from "../src/cloud-event";
import * as CloudEvents from "cloudevents";

describe("parseCloudEvent", () => {
  const headers = { content_type: "something", blah: "blah blah" };
  const body = "";
  it("returns the expected objects", () => {
    const result = parseCloudEvent(headers, body);
    const cloudEvent = CloudEvents.HTTP.toEvent({ headers, body });
    const sfContext = JSON.parse(
      Buffer.from(cloudEvent.sfcontext.toString(), "base64").toString("utf-8")
    );
    const sfFunctionContext = JSON.parse(
      Buffer.from(cloudEvent.sffncontext.toString(), "base64").toString("utf-8")
    );

    expect(result.cloudEvent).to.equal(cloudEvent);
    expect(result.sfContext).to.equal(sfContext);
    expect(result.sfFunctionContext).to.equal(sfFunctionContext);
  });

  it("calls CloudEvents.HTTP.toEvent", () => {
    function Spy(obj, method, ...args) {
      const spy = {
        args: [],
        count: 0,
      };

      const original = obj[method];
      obj[method] = function () {
        const allargs = [].slice.apply(args);
        spy.count = spy.count + 1;
        spy.args.push(allargs);
        return original.call(obj, allargs);
      };

      return Object.freeze(spy);
    }

    const spy = Spy(CloudEvents.HTTP, "toEvent");
    CloudEvents.HTTP.toEvent({ headers, body });
    expect(spy.count).to.equal(1);
  });
});
