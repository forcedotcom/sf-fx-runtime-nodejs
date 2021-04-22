import {
  Connection,
  AuthInfo
} from '@salesforce/core';
import { createInvocationEvent } from "./sdk/event";
import { createContext } from "./sdk/context";
import { Org } from "./sdk/org";
import { User } from "./sdk/user";

export {
  createInvocationEvent,
  createContext,
  Org,
  User
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
  insert(recordInsert: RecordCreate): ReferenceId;

  /**
   * Registers a record update with this UnitOfWork.
   * @param recordUpdate
   */
  update(recordUpdate: RecordUpdate): ReferenceId;
}

<<<<<<< HEAD
interface RecordCreate {
  type: string;
=======
// interface SalesforceRecord {
//   type: string;
>>>>>>> a9fdacc... wrap requests with promises

//   [key: string]: string | number | boolean | Date;
// }

interface RecordCreate {
  type: string;
  records?: string[];

  [key: string]: string | string[] | number | boolean | Date | ReferenceId;
}

interface RecordUpdate extends RecordCreate {
  id: string;
}

interface RecordDelete {
  type: string;
  id: string;

  [key: string]: string | number | boolean | Date | ReferenceId;
}

class RecordQueryResult {
  readonly done: boolean;
  readonly totalSize: number;
  readonly nextRecordsUrl?: string;
  readonly records: [RecordCreate];

  constructor(done: boolean, totalSize: number, nextRecordsUrl: string, records: [RecordCreate]) {
    this.done = done;
    this.totalSize = totalSize;
    this.nextRecordsUrl = nextRecordsUrl;
    this.records = records;
  }
}

class RecordResult {
  readonly id: ReferenceId;

  constructor(id: string) {
    this.id = id;
  }
}

class RecordCreateResult extends RecordResult {}
class RecordModificationResult extends RecordResult {}

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

  private async connect(): Promise<Connection> {
    if (!this.conn) {
      const authInfo = await AuthInfo.create({ username: this.accessToken });
      this.conn = await Connection.create({ authInfo });
    }

    return this.conn;
  }

  private async promisifyRequests(callback: Function): Promise<any> {
    let conn, result;

    try {
      conn = await this.connect();
      result = callback(conn);
    } catch(e) {
      Promise.reject(e);
    }

    return Promise.resolve(result);
  }

  /**
   * Queries for records with a given SOQL string.
   * @param soql The SOQL string.
   */
  async query(soql: string): Promise<RecordQueryResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response = await conn.autoFetchQuery(soql);
      const recordQueryResult = new RecordQueryResult(response.done, response.totalSize, response.nextRecordsUrl, response.records);

      return recordQueryResult;
    });
  }

  /**
   * Creates a record, based on the given {@link RecordCreate}.
   * @param recordCreate.
   */
  create(recordCreate: RecordCreate): Promise<RecordModificationResult> {
    return this.connect().create(recordCreate);
  }

  /**
  * Deletes a record, based on the given {@link RecordDelete}.
  * @param recordDelete
  */
  delete(recordDelete: RecordDelete): Promise<RecordModificationResult> {
    return this.connect().delete(recordDelete.type, recordDelete.id);
  }

  /**
   * Queries for more records, based on the given {@link RecordQueryResult}.
   * @param queryResult
   */
  async queryMore(queryResult: RecordQueryResult): Promise<RecordQueryResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response = await conn.autoFetchQuery(queryResult.nextRecordsUrl);
      const recordQueryResult = new RecordQueryResult(response.done, response.totalSize, response.nextRecordsUrl, response.records);

      return recordQueryResult;
    });
  }

  /**
   * Inserts a new record described by the given {@link RecordCreate}.
   * @param recordInsert The record insert description.
   */
  async create(recordInsert: RecordCreate): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      // TODO: shape response to return id
      const response: any = await conn.insert(recordInsert.type, recordInsert);
      const result = new RecordCreateResult(response.id);

      return result;
    });
  }

  /**
   * Updates an existing record described by the given {@link RecordUpdate}.
   * @param recordUpdate The record update description.
   */
  update(recordUpdate: RecordUpdate): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response: any = await conn.update(recordUpdate.type, recordUpdate);
      const result = new RecordModificationResult(response.id);

      return result;
    });
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
