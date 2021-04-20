import {
  Connection,
  AuthInfo
} from '@salesforce/core';
import { createInvocationEvent } from "./sdk/event";
import { createContext } from "./sdk/context";
import { createOrg } from "./sdk/org";

export {
  createInvocationEvent,
  createContext,
  createOrg
};

// These types (some of them should be converted to interfaces instead of classes) could come from a node module that
// user function could depend on to get type completion and stuff. This is not necessary for the function to work
// though.

type ReferenceId = string;

/**
 * @interface UnitOfWork
 */
interface UnitOfWork {
  /**
   * Registers a record insert with this UnitOfWork.
   * @param recordInsert
   */
  insert(recordInsert: RecordInsert): ReferenceId;

  /**
   * Registers a record update with this UnitOfWork.
   * @param recordUpdate
   */
  update(recordUpdate: RecordUpdate): ReferenceId;
}

interface SalesforceRecord {
  type: string;

  [key: string]: string | number | boolean | Date;
}

interface RecordInsert {
  type: string;

  [key: string]: string | number | boolean | Date | ReferenceId;
}

interface RecordUpdate extends RecordInsert {
  id: string;
}

class RecordQueryResult {
  readonly done: boolean;
  readonly totalSize: number;
  readonly records: [SalesforceRecord];

  constructor(done: boolean, totalSize: number, records: [SalesforceRecord]) {
    this.done = done;
    this.totalSize = totalSize;
    this.records = records;
  }
}

interface RecordModificationResult {
  readonly id: string;
}

export class DataApi {
  private baseUrl: string;
  private apiVersion: string;
  readonly accessToken: string;
  private conn: Connection;

  constructor(baseUrl: string, apiVersion: string, accessToken: string) {
    this.baseUrl = baseUrl;
    this.apiVersion = apiVersion;
    this.accessToken = accessToken;
  }

  private connect(): Connection {
    if (!this.conn) {
      this.conn = Connection.create({
        authInfo: AuthInfo.create({ username: this.accessToken })
      });
    }
    return this.conn;
  }

  /**
   * Queries for records with a given SOQL string.
   * @param soql The SOQL string.
   */
  query(soql: string): Promise<RecordQueryResult> {
    return this.connect().query(soql);
  }

  /**
   * Queries for more records, based on the given {@link RecordQueryResult}.
   * @param queryResult
   */
  queryMore(queryResult: RecordQueryResult): Promise<RecordQueryResult> {
    return this.connect().query(queryResult);
  }

  /**
   * Inserts a new record described by the given {@link RecordInsert}.
   * @param recordInsert The record insert description.
   */
  insert(recordInsert: RecordInsert): Promise<RecordModificationResult> {
    return this.connect().insert(recordInsert);
  }

  /**
   * Updates an existing record described by the given {@link RecordUpdate}.
   * @param recordUpdate The record update description.
   */
  update(recordUpdate: RecordUpdate): Promise<RecordModificationResult> {
    return this.connect().update(recordUpdate);
  }

  /**
   * Creates a new and empty {@link UnitOfWork}.
   */
  newUnitOfWork(): UnitOfWork {
    throw "Not yet implemented!";
  }

  /**
   * Commits a {@link UnitOfWork}, executing all operations registered with it. If any of these
   * operations fail, the whole unit is rolled back. To examine results for a single operation,
   * inspect the returned map (which is keyed with {@link ReferenceId} returned from
   * {@link UnitOfWork#insert} and {@link UnitOfWork#update}).
   * @param unitOfWork The {@link UnitOfWork} to commit.
   */
  commitUnitOfWork(
    unitOfWork: UnitOfWork
  ): Promise<Map<ReferenceId, RecordModificationResult>> {
    return Promise.reject("Not yet implemented!");
  }
}

export class User {
  id: string;
  username: string;
  onBehalfOfUserId?: string;
}
