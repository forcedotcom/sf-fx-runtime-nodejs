import { assert, expect } from 'chai';
import { CloudEvent, HTTP } from "cloudevents";
import {LoggerImpl} from '../src/user-function-logger.js';
import { LoggerFormat, LoggerLevel } from '@salesforce/core/lib/logger.js';
import {Logger} from '@salesforce/core';


describe('Logger', () => {

    describe('levels', () => {
        it('should set the log level to a number: 50 for Error', () => {
          const logger = new Logger({name:'testLogger'});
          logger.setLevel(LoggerLevel.ERROR);
          expect(logger.getLevel()).to.equal(LoggerLevel.ERROR);
        });
        it('should set the log level to a number: 40 for Warn', () => {
            const warnLogger = new Logger({name:'testWarnLogger'});
            warnLogger.setLevel(LoggerLevel.WARN);
            expect(warnLogger.getLevel()).to.equal(LoggerLevel.WARN);
        });
        it('should set the log level to a number: 30 for Info', () => {
            const infoLogger = new Logger({name:'testInfoLogger'});
            infoLogger.setLevel(LoggerLevel.INFO);
            expect(infoLogger.getLevel()).to.equal(LoggerLevel.INFO);
        });
        it('should set the log level to a number: 20 for Debug', () => {
            const debugLogger = new Logger({name:'testDebugLogger'});
            debugLogger.setLevel(LoggerLevel.DEBUG);
            expect(debugLogger.getLevel()).to.equal(LoggerLevel.DEBUG);
        });
        it('should set the log level to a number: 10 for Trace', () => {
            const traceLogger = new Logger({name:'testTraceLogger'});
            traceLogger.setLevel(LoggerLevel.TRACE);
            expect(traceLogger.getLevel()).to.equal(LoggerLevel.TRACE);
        });
        // it('should throw an error with an invalid logger level string', () => {
        //     try {
        //       Logger.getLevelByName('invalid');
        //       assert.fail('should have thrown an error trying to get an invalid level name');
        //     } catch (err) {
        //       expect(err.message).to.equal('UnrecognizedLoggerLevelName');
        //     }
        // });
    });
})