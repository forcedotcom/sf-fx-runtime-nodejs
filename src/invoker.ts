import { Logger, LoggerFormat, LoggerLevel } from '@salesforce/core/lib/logger';

const FUNCTION_ERROR_CODE = 500;
const INTERNAL_SERVER_ERROR_CODE = 503;

class MiddlewareError extends Error {
  public readonly stack: string;

  constructor(public readonly err: Error, public readonly code = INTERNAL_SERVER_ERROR_CODE) {
    super(err.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.stack = err.stack
  }

  public toString(): string {
    return this.err.toString();
  }
}

class FunctionError extends MiddlewareError {
  constructor(err: Error) {
    super(err, FUNCTION_ERROR_CODE);
  }
}

class UserFn {
  private readonly fn: Function;

  constructor(private readonly userDefinedFn: Function) {
    this.fn = userDefinedFn;
  }

  public async invoke(event: any): Promise<any> {
    await this.fn(event);
  }
}

export default async function invokeUserFn(userDefinedFn: any, event: any): Promise<any> {
  let result: any;
  let userFn: UserFn = new UserFn(userDefinedFn);

  try {
    console.log("before result")
    result = await userFn.invoke(event);
    console.log("after result")
  } catch(error) {
    console.log("error", error)
    throw new FunctionError(error);
  }

  return result;
}