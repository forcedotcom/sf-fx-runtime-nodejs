import { expect } from "chai";
import { fileURLToPath } from "url";
import getRebasedStack from "../src/stacktrace.js";

describe("getRebasedStack", () => {
  it("returns the correct amount of lines for a real stack", () => {
    const result = getRebasedStack(import.meta.url, new Error("Test Error"));
    expect(result.split("\n")).to.be.of.length(1);
  });

  it("returns the correct lines", () => {
    const result = getRebasedStack("internal.js", {
      name: "name",
      message: "message",
      stack:
        "Error: Test Error\n\tat topmost (foo.js:12:13)\n\tat belowthat (foo.js:1:123)\n\tat evenmore (foo.js:1138:42)\n\tat internal (internal.js:23:23)",
    });

    expect(result).to.equal(
      "Error: Test Error\n\tat topmost (foo.js:12:13)\n\tat belowthat (foo.js:1:123)\n\tat evenmore (foo.js:1138:42)"
    );
  });

  it("handles an unknown filename correctly", () => {
    const error = new Error("Test Error");
    const result = getRebasedStack("fake.js", error);
    expect(result).to.equal(error.stack);
  });

  it("works with empty stacks", () => {
    const result = getRebasedStack(import.meta.url, {
      name: "name",
      message: "message",
      stack: "",
    });

    expect(result).to.be.of.length(0);
  });
});
