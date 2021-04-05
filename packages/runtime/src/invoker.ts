
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

export default async function invokeUserFn(userFn: any, message: any): Promise<any> {
  let result: any;

  try {
    result = await userFn(message);
  } catch(error) {
    throw new FunctionError(error);
  }
}