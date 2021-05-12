import { Connection } from "jsforce";
import { UnitOfWorkImpl } from "./unit-of-work";
import { RecordQueryResultImpl } from "./record/result/query";
import {
  DataApi,
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult,
  RecordQueryResult,
  ReferenceId,
  UnitOfWork,
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

  async create(
    recordCreate: RecordForCreate
  ): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response: any = await conn.insert(recordCreate.type, recordCreate);
      return { id: response.id };
    });
  }

  async query(soql: string): Promise<RecordQueryResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response = await conn.query(soql);

      return {
        done: response.done,
        totalSize: response.totalSize,
        records: response.records,
      };
    });
  }

  async queryMore(queryResult: RecordQueryResult): Promise<RecordQueryResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const queryResultInstance = this.castQueryObject(queryResult);
      const response = await conn.queryMore(
        queryResultInstance._nextRecordsUrl
      );

      return {
        done: response.done,
        totalSize: response.totalSize,
        records: response.records,
      };
    });
  }

  private castQueryObject(
    queryResult: RecordQueryResult
  ): RecordQueryResultImpl {
    if (queryResult instanceof RecordQueryResultImpl)
      return <RecordQueryResultImpl>queryResult;
    else
      throw Error(
        "Incorrect arg. Requires instance of RecordQueryResultImpl to use queryMore()"
      );
  }

  async update(
    recordUpdate: RecordForUpdate
  ): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const params = Object.assign({}, recordUpdate, { Id: recordUpdate.id });
      const response: any = await conn.update(recordUpdate.type, params);
      return { id: response.id };
    });
  }

  async delete(type: string, id: string): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const response: any = await conn.delete(type, id);

      return { id: response.id };
    });
  }

  newUnitOfWork(): UnitOfWork {
    return new UnitOfWorkImpl(this.apiVersion);
  }

  commitUnitOfWork(
    unitOfWork: UnitOfWorkImpl
  ): Promise<Map<ReferenceId, RecordModificationResult>> {
    return this.promisifyRequests(async (conn: Connection) => {
      const url = `/services/data/v${this.apiVersion}/composite`;
      const reqBody = unitOfWork._getRequestBody();
      const reqResult = await conn.requestPost(url, reqBody);

      return unitOfWork._commit(reqResult);
    });
  }
}
