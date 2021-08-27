import { assert, expect } from 'chai';
import { CloudEvent, HTTP } from "cloudevents";
import {LoggerImpl} from '../src/user-function-logger.js';
import { LoggerLevel } from '@salesforce/core/lib/logger.js';
import logger from "../src/logger.js";
import { testSetup } from '@salesforce/core/lib/testSetup';

describe('Logger', () => {
    describe('levels', () => {
        it('should set the log level to a number: 50 for Error', () => {
            const errorlogger = logger.useMemoryLogging();
            errorlogger.setLevel(50);
            expect(errorlogger.getLevel()).to.equal(LoggerLevel.ERROR);
          });
          it('should set the log level to a number: 40 for Warn', () => {
              const warnLogger = logger.useMemoryLogging();
              warnLogger.setLevel(40);
              expect(warnLogger.getLevel()).to.equal(LoggerLevel.WARN);
          });
          it('should set the log level to a number: 30 for Info', () => {
              const infoLogger = logger.useMemoryLogging();
              infoLogger.setLevel(30);
              expect(infoLogger.getLevel()).to.equal(LoggerLevel.INFO);
          });
          it('should set the log level to a number: 20 for Debug', () => {
              const debugLogger = logger.useMemoryLogging();
              debugLogger.setLevel(20);
              expect(debugLogger.getLevel()).to.equal(LoggerLevel.DEBUG);
          });
          it('should set the log level to a number: 10 for Trace', () => {
              const traceLogger = logger.useMemoryLogging();
              traceLogger.setLevel(10);
              expect(traceLogger.getLevel()).to.equal(LoggerLevel.TRACE);
          });
    });
})