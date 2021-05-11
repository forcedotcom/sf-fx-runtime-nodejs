import { Connection } from "jsforce";
import { UnitOfWorkImpl } from "./unit-of-work";
import {
  DataApi,
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult, RecordQueryResult,
  ReferenceId,
  UnitOfWork
} from "../sdk-interface-v1";

export class DataApiImpl implements DataApi {
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private conn: Connection;
  readonly accessToken: string;

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
    let result;
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
  async create(recordCreate: RecordForCreate): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response: any = await conn.insert(recordCreate.type, recordCreate);
      return {id: response.id};
    });
  }

  /**
   * Queries for records with a given SOQL string.
   * @param soql The SOQL string.
   */
  async query(soql: string): Promise<RecordQueryResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response = await conn.query(soql);

      return {
        done: response.done,
        totalSize: response.totalSize,
        records: response.records
      };
    });
  }

  /**
   * Queries for more records, based on the given {@link RecordQueryResult}.
   * @param queryResult
   */
  async queryMore(queryResult: RecordQueryResult): Promise<RecordQueryResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      //const response = await conn.queryMore(queryResult._nextRecordsUrl);
      const response = await conn.queryMore("");
      return {
        done: response.done,
        totalSize: response.totalSize,
        records: response.records
      };
    });
  }

  /**
   * Updates an existing record described by the given {@link RecordUpdate}.
   * @param recordUpdate The record update description.
   */
  async update(recordUpdate: RecordForUpdate): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const params = Object.assign({}, recordUpdate, { Id: recordUpdate.id });
      const response: any = await conn.update(recordUpdate.type, params);
      return {id: response.id};
    });
  }

  /**
   * Deletes a record, based on the given {@link RecordDelete}.
   * @param recordDelete
   */
  async delete(type: string, id: string): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response: any = await conn.delete(
        type,
        id
      );

      return {id: response.id};
    });
  }

  /**
   * Creates a new and empty {@link UnitOfWork}.
   */
  newUnitOfWork(): UnitOfWork {
    return new UnitOfWorkImpl(this.apiVersion);
  }

  commitUnitOfWork(unitOfWork: UnitOfWork): Map<ReferenceId, RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const url = `/services/data/v${this.apiVersion}/composite`;
      const reqBody = unitOfWork._getRequestBody();
      const reqResult = await conn.requestPost(url, reqBody);

      return unitOfWork._commit(reqResult);
    });
  }
}
