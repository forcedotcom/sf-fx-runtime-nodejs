import { InvocationEvent } from "./sdk/invocation-event";
import { Context } from "./sdk/context";
import { Logger } from "./logger";

export type UserFunction<A> = (
  event: InvocationEvent,
  context: Context,
  logger: Logger
) => Promise<A> | A;
