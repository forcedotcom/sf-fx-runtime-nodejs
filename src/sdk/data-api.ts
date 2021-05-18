import { Connection } from "jsforce";
import { UnitOfWorkImpl } from "./unit-of-work";
import {
  DataApi,
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult,
  RecordQueryResult,
  ReferenceId,
  UnitOfWork,
} from "../sdk-interface-v1";
import { version as ClientVersion } from "../../package.json";
import { createCaseInsensitiveRecord } from "../utils/maps";

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
        callOptions: {
          client: `sf-fx-runtime-nodejs-sdk-impl-v1:${ClientVersion}`,
        },
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
      return Promise.reject(e);
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
      const records = response.records.map(createCaseInsensitiveRecord);

      return {
        done: response.done,
        totalSize: response.totalSize,
        records,
        nextRecordsUrl: response.nextRecordsUrl,
      };
    });
  }

  async queryMore(queryResult: RecordQueryResult): Promise<RecordQueryResult> {
    if (!queryResult.nextRecordsUrl) {
      return Promise.resolve({
        done: queryResult.done,
        totalSize: queryResult.totalSize,
        records: [],
        nextRecordsUrl: queryResult.nextRecordsUrl,
      });
    }

    return this.promisifyRequests(async (conn: Connection) => {
      const response = await conn.queryMore(queryResult.nextRecordsUrl);
      const records = response.records.map(createCaseInsensitiveRecord);

      return {
        done: response.done,
        totalSize: response.totalSize,
        records,
        nextRecordsUrl: response.nextRecordsUrl,
      };
    });
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
    unitOfWork: UnitOfWork
  ): Promise<Map<ReferenceId, RecordModificationResult>> {
    return this.promisifyRequests(async (conn: Connection) => {
      const subrequests = (unitOfWork as UnitOfWorkImpl).subrequests;
      const requestBody = {
        graphs: [
          {
            graphId: "graph0",
            compositeRequest: subrequests.map(({ referenceId, subrequest }) => {
              return {
                referenceId,
                method: subrequest.httpMethod,
                url: subrequest.buildUri(this.apiVersion),
                body: subrequest.body,
              };
            }),
          },
        ],
      };

      const requestResult = await conn.requestPost(
        `/services/data/v${this.apiVersion}/composite/graph`,
        requestBody
      );

      if (requestResult.graphs.length != 1) {
        throw new Error(
          "Composite REST API unexpectedly returned more or less than one graph!"
        );
      }

      const result = new Map<ReferenceId, RecordModificationResult>();
      requestResult.graphs[0].graphResponse.compositeResponse.forEach(
        ({ referenceId, body, httpStatusCode, httpHeaders }) => {
          const subrequest = subrequests.find(
            (tuple) => tuple.referenceId === referenceId
          );

          if (subrequest) {
            result.set(
              referenceId,
              subrequest.subrequest.processResponse(
                httpStatusCode,
                httpHeaders,
                body
              )
            );
          }
        }
      );

      return result;
    });
  }
}
