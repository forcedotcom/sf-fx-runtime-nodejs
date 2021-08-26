import {Logger} from '@salesforce/core';
import { LoggerFormat } from '@salesforce/core/lib/logger.js';

function getloglevel() {
    const defaultLogLevel = "30";
    const logLevel = (
      process.env.SF_FX_LOGLEVEL || defaultLogLevel
    ).toLowerCase();
    switch (logLevel) {
      case "trace": return 10
      case "debug": return 20
      case "info": return 30
      case "warn": return 40
      case "error": 
        return 50;
      default:
        console.warn(
          `SF_FX_LOGLEVEL environment variable contains unknown log level '${logLevel}'! Effective log level will be '${defaultLogLevel}'!`
        );
        return 30;
    }
}


const logger = new Logger({name : 'functionLogger', stream: process.stdout, format: LoggerFormat.LOGFMT, level: getloglevel() }); 

export default logger;