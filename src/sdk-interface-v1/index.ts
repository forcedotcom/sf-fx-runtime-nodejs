export type SalesforceFunction<A, B> = (
  event: InvocationEvent<A>,
  context: Context,
  logger: Logger
) => Promise<B> | B;

export interface InvocationEvent<A> {
  readonly id: string;
  readonly type: string;
  readonly source: string;
  readonly data: A;
  readonly dataContentType?: string;
  readonly dataSchema?: string;
  readonly time?: string;
}

export interface Context {
  readonly id: string;
  readonly org?: Org;
}

export interface Org {
  readonly id: string;
  readonly baseUrl: string;
  readonly domainUrl: string;
  readonly apiVersion: string;
  readonly dataApi: DataApi;
  readonly user: User;
}

export interface RecordQueryResult {
  readonly done: boolean;
  readonly totalSize: number;
  readonly records: Array<Record<string, unknown>>;
}

export interface RecordModificationResult {
  readonly id: string;
}

export type ReferenceId = string;

export type RecordForCreate = { type: string; [key: string]: unknown };
export type RecordForUpdate = {
  type: string;
  id: string;
  [key: string]: unknown;
};

export interface UnitOfWork {
  registerCreate(record: RecordForCreate): ReferenceId;
  registerUpdate(record: RecordForUpdate): ReferenceId;
  registerDelete(type: string, id: string): ReferenceId;
}

export interface DataApi {
  readonly accessToken: string;

  query(soql: string): Promise<RecordQueryResult>;
  queryMore(recordQueryResult: RecordQueryResult): Promise<RecordQueryResult>;

  create(record: RecordForCreate): Promise<RecordModificationResult>;
  update(update: RecordForUpdate): Promise<RecordModificationResult>;
  delete(type: string, id: string): Promise<RecordModificationResult>;

  newUnitOfWork(): UnitOfWork;
  commitUnitOfWork(
    unitOfWork: UnitOfWork
  ): Map<ReferenceId, RecordModificationResult>;
}

export interface User {
  readonly id: string;
  readonly username: string;
  readonly onBehalfOfUserId?: string;
}

export interface Logger {
  /**
   * Logs the given message at the 'error' level.
   * @param message The message to log.
   */
  error(message: string): void;

  /**
   * Logs the given message at the 'warn' level.
   * @param message The message to log.
   */
  warn(message: string): void;

  /**
   * Logs the given message at the 'info' level.
   * @param message The message to log.
   */
  info(message: string): void;

  /**
   * Logs the given message at the 'debug' level.
   * @param message The message to log.
   */
  debug(message: string): void;

  /**
   * Logs the given message at the 'trace' level.
   * @param message The message to log.
   */
  trace(message: string): void;
}
