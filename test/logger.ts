import { LoggerLevel } from "@salesforce/core";
import { expect } from "chai";
import logger from "../src/logger.js";

describe("Logger", () => {
  describe("Basic logger functionality", () => {
    it("should have a basic message", async () => {
      const testbasiclogger = (
        await logger.child("testLogger")
      ).useMemoryLogging();
      testbasiclogger.warn("This is a test message");
      const logRecords = testbasiclogger.getBufferedRecords();
      expect(logRecords[0]).to.have.property("msg", "This is a test message");
    });
    it("should check for proper escaping", async () => {
      const testescapelogger = (
        await logger.child("testLogger")
      ).useMemoryLogging();
      testescapelogger.info('Checking escaping: "test" \\o/ foo=bar');
      const logRecords = testescapelogger.getBufferedRecords();
      expect(logRecords[0]).to.have.property(
        "msg",
        'Checking escaping: "test" \\o/ foo=bar'
      );
    });
  });
  describe("Logger levels", () => {
    it("should set the log level to a number: 50 for Error", async () => {
      const errorlogger = (await logger.child("testLogger")).useMemoryLogging();
      errorlogger.error("test Error");
      const logRecords = errorlogger.getBufferedRecords();
      expect(logRecords[0]).to.have.property("level", 50);
    });
    it("should set the log level to a number: 40 for Warn", async () => {
      const warnlogger = (await logger.child("testLogger")).useMemoryLogging();
      warnlogger.warn("test warn");
      const logRecords = warnlogger.getBufferedRecords();
      expect(logRecords[0]).to.have.property("level", 40);
    });
    it("should set the log level to a number: 30 for Info", async () => {
      const infologger = (await logger.child("testLogger")).useMemoryLogging();
      infologger.info("test info");
      const logRecords = infologger.getBufferedRecords();
      expect(logRecords[0]).to.have.property("level", 30);
    });
    it("should set the log level to a number: 20 for Debug", async () => {
      const debuglogger = (await logger.child("testLogger")).useMemoryLogging();
      debuglogger.setLevel(20);
      expect(debuglogger.getLevel()).to.equal(LoggerLevel.DEBUG);
    });
    it("should set the log level to a number: 10 for Trace", async () => {
      const tracelogger = (await logger.child("testLogger")).useMemoryLogging();
      tracelogger.setLevel(10);
      expect(tracelogger.getLevel()).to.equal(LoggerLevel.TRACE);
    });
  });
});
