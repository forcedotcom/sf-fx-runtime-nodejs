import { Connection } from "jsforce";
import {
  RecordCreate,
  RecordUpdate,
  RecordDelete,
  RecordResult,
  RecordCreateResult,
  RecordQueryResult,
  RecordUpdateResult,
  RecordDeleteResult,
} from "./records";
import { UnitOfWork, UnitOfWorkResult } from "./unit-of-work";

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
      this.conn = new Connection({
        accessToken: this.accessToken,
        instanceUrl: this.baseUrl,
        version: this.apiVersion,
      });
    }

    return this.conn;
  }

  private async promisifyRequests(
    callback: (conn: Connection) => any
  ): Promise<any> {
    let conn: Connection;
    let result: RecordResult;
    try {
      conn = await this.connect();
      result = callback(conn);
    } catch (e) {
      Promise.reject(e);
    }

    return Promise.resolve(result);
  }

  /**
   * Creates a record, based on the given {@link RecordCreate}.
   * @param recordCreate.
   */
  async create(recordInsert: RecordCreate): Promise<RecordUpdateResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response: any = await conn.insert(recordInsert.type, recordInsert);
      const result = new RecordCreateResult(response.id);

      return result;
    });
  }

  /**
   * Queries for records with a given SOQL string.
   * @param soql The SOQL string.
   */
  async query(soql: string): Promise<RecordQueryResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response = await conn.query(soql);
      const recordQueryResult = new RecordQueryResult(
        response.done,
        response.totalSize,
        response.nextRecordsUrl,
        response.records
      );

      return recordQueryResult;
    });
  }

  /**
   * Queries for more records, based on the given {@link RecordQueryResult}.
   * @param queryResult
   */
  async queryMore(queryResult: RecordQueryResult): Promise<RecordQueryResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response = await conn.queryMore(queryResult._nextRecordsUrl);
      const recordQueryResult = new RecordQueryResult(
        response.done,
        response.totalSize,
        response.nextRecordsUrl,
        response.records
      );

      return recordQueryResult;
    });
  }

  /**
   * Updates an existing record described by the given {@link RecordUpdate}.
   * @param recordUpdate The record update description.
   */
  async update(recordUpdate: RecordUpdate): Promise<RecordUpdateResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const params = Object.assign({}, recordUpdate, { Id: recordUpdate.id });
      const response: any = await conn.update(recordUpdate.type, params);
      const result = new RecordUpdateResult(response.id);

      return result;
    });
  }

  /**
   * Deletes a record, based on the given {@link RecordDelete}.
   * @param recordDelete
   */
  async delete(recordDelete: RecordDelete): Promise<RecordDeleteResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response: any = await conn.delete(
        recordDelete.type,
        recordDelete.id
      );
      const result = new RecordDeleteResult(response.id);

      return result;
    });
  }

  /**
   * Creates a new and empty {@link UnitOfWork}.
   */
  newUnitOfWork(): UnitOfWork {
    return new UnitOfWork(this.apiVersion);
  }

  /**
   * Commits a {@link UnitOfWork}, executing all operations registered with it. If any of these
   * operations fail, the whole unit is rolled back. To examine results for a single operation,
   * inspect the returned map (which is keyed with {@link ReferenceId} returned from
   * {@link UnitOfWork#insert} and {@link UnitOfWork#update}).
   * @param unitOfWork The {@link UnitOfWork} to commit.
   */
  commitUnitOfWork(unitOfWork: UnitOfWork): Promise<UnitOfWorkResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const url = `/services/data/v${this.apiVersion}/composite`;
      const reqBody = unitOfWork._getRequestBody();
      const reqResult = await conn.requestPost(url, reqBody);

      return unitOfWork._commit(reqResult);
    });
  }
}
