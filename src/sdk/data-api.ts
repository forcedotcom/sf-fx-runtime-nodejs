/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from "jsforce2/lib/connection.js";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { UnitOfWorkImpl } from "./unit-of-work.js";
import {
  DataApi,
  Record,
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult,
  RecordQueryResult,
  RecordWithSubQuery,
  ReferenceId,
  UnitOfWork,
} from "../index";
import { createCaseInsensitiveMap } from "../utils/maps.js";
const pkgPath = join(
  fileURLToPath(import.meta.url),
  "..",
  "..",
  "..",
  "package.json"
);
const pkg = readFileSync(pkgPath, "utf8");
const ClientVersion = JSON.parse(pkg).version;
const knownBinaryFields = { ContentVersion: ["VersionData"] };

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
      try {
        const fields = buildCreateFields(recordCreate);
        const response: any = await conn.insert(recordCreate.type, fields);
        this.validate_record_response(response);
        return { id: response.id };
      } catch (e) {
        return this.handle_bad_response(e);
      }
    });
  }

  async query(soql: string): Promise<RecordQueryResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      try {
        const response = await conn.query(soql);
        this.validate_records_response(response);
        const records = await Promise.all(
          response.records.map((record_data) =>
            buildRecordWithSubQuery(conn, record_data)
          )
        );
        return {
          done: response.done,
          totalSize: response.totalSize,
          records,
          nextRecordsUrl: response.nextRecordsUrl,
        };
      } catch (e) {
        return this.handle_bad_response(e);
      }
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
      try {
        const response = await conn.queryMore(queryResult.nextRecordsUrl);
        this.validate_records_response(response);
        const records = await Promise.all(
          response.records.map((record_data) => buildRecord(conn, record_data))
        );

        return {
          done: response.done,
          totalSize: response.totalSize,
          records,
          nextRecordsUrl: response.nextRecordsUrl,
        };
      } catch (e) {
        return this.handle_bad_response(e);
      }
    });
  }

  async update(
    recordUpdate: RecordForUpdate
  ): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      const fields = buildUpdateFields(recordUpdate);

      try {
        const response: any = await conn.update(recordUpdate.type, fields);
        this.validate_record_response(response);
        return { id: response.id };
      } catch (e) {
        return this.handle_bad_response(e);
      }
    });
  }

  async delete(type: string, id: string): Promise<RecordModificationResult> {
    return this.promisifyRequests(async (conn: Connection) => {
      try {
        const response: any = await conn.delete(type, id);
        this.validate_record_response(response);
        return { id: response.id };
      } catch (e) {
        return this.handle_bad_response(e);
      }
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

      if (subrequests.length === 0) {
        return Promise.resolve(new Map());
      }

      const requestBody = {
        graphs: [
          {
            graphId: "graph0",
            compositeRequest: subrequests.map(([referenceId, subrequest]) => {
              return {
                referenceId: referenceId.toString(),
                method: subrequest.httpMethod,
                url: subrequest.buildUri(this.apiVersion),
                body: subrequest.body,
              };
            }),
          },
        ],
      };

      const requestResult: any = await conn.requestPost(
        `/services/data/v${this.apiVersion}/composite/graph`,
        requestBody
      );

      if (requestResult.graphs.length != 1) {
        throw new Error(
          "Composite REST API unexpectedly returned more or less than one graph!"
        );
      }

      const subrequestResults: Promise<
        [ReferenceId, RecordModificationResult][]
      > = Promise.all(
        requestResult.graphs[0].graphResponse.compositeResponse.map(
          (compositeResponse) => {
            const subrequest = subrequests.find(
              ([subrequestReferenceId]) =>
                subrequestReferenceId.toString() ===
                compositeResponse.referenceId
            );
            return subrequest[1]
              .processResponse(
                compositeResponse.httpStatusCode,
                compositeResponse.httpHeaders,
                compositeResponse.body
              )
              .then((recordModificationResult) => [
                subrequest[0],
                recordModificationResult,
              ]);
          }
        )
      );

      return subrequestResults.then((keyValues) => new Map(keyValues));
    });
  }

  private validate_response(response: any) {
    if (typeof response !== "object") {
      throw new Error(
        "Could not parse API response as JSON: " + JSON.stringify(response)
      );
    }
  }

  private validate_record_response(response: any) {
    this.validate_response(response);
    if (typeof response.id === "undefined") {
      throw new Error(
        "Could not read API response `id`: " + JSON.stringify(response)
      );
    }
  }

  private validate_records_response(response: any) {
    this.validate_response(response);
    if (
      typeof response.records !== "object" ||
      typeof response.records.map !== "function"
    ) {
      throw new Error(
        "Could not read API response `records`: " + JSON.stringify(response)
      );
    }
  }

  // jsforce sets response body into `message` instead of `content`, so the output would not be helpful
  private handle_bad_response(error) {
    if (
      error.constructor.name == "HttpApiError" &&
      error.errorCode &&
      error.errorCode.startsWith("ERROR_HTTP_")
    ) {
      error.content = error.message;
      error.message = "Unexpected response with status: " + error.errorCode;
    }
    throw error;
  }
}

async function buildRecord(conn: Connection, data: any): Promise<Record> {
  const type = data.attributes.type;
  const fields = createCaseInsensitiveMap(data);
  delete fields["attributes"];

  // For any known binaryFields, eagerly fetch the data from the specified
  // endpoint.
  const binaryFields = {};
  if (type in knownBinaryFields) {
    for (const binFieldName of knownBinaryFields[type]) {
      if (fields[binFieldName]) {
        try {
          const body: string = await conn.request(fields[binFieldName]);
          binaryFields[binFieldName] = Buffer.from(body, "binary");
        } catch (err) {
          throw new Error(
            `Unable to load binary field data for ${type}.${binFieldName}: ${err}`
          );
        }
      }
    }
  }

  if (Object.keys(binaryFields).length) {
    return {
      type,
      fields,
      binaryFields: createCaseInsensitiveMap(binaryFields),
    };
  }
  return { type, fields };
}

function buildCreateFields(record: Record): { [key: string]: unknown } {
  const fields = { ...record.fields };
  // Automatically base64 encode any known binaryFields without overwriting existing fields.
  if (record.type in knownBinaryFields) {
    for (const binFieldName of knownBinaryFields[record.type]) {
      if (
        record.binaryFields &&
        Buffer.isBuffer(record.binaryFields[binFieldName])
      ) {
        if (record.fields[binFieldName]) {
          throw new Error(
            `${binFieldName} provided in both fields and binaryFields of ${record.type}, but is only supported in one or the other.`
          );
        }
        fields[binFieldName] =
          record.binaryFields[binFieldName].toString("base64");
      }
    }
  }
  return fields;
}

function buildUpdateFields(record: Record): {
  Id: string;
  [key: string]: unknown;
} {
  const fields = buildCreateFields(record);
  // Normalize the "id" field casing. jsforce requires an "Id" field, whereas
  // our SDK definition requires customers to provide "id". Customers that are not using TS might also
  // pass other casings for the "id" field ("iD", "ID").
  for (const idKey of ["id", "Id", "ID", "iD"]) {
    if (idKey in record.fields) {
      delete fields[idKey];
      fields["Id"] = record.fields[idKey];
      break;
    }
  }
  if (fields["Id"] === undefined) {
    fields["Id"] = "";
  }
  return fields as { Id: string; [key: string]: unknown };
}

async function buildRecordWithSubQuery(
  conn: Connection,
  data: any
): Promise<RecordWithSubQuery> {
  const record = await buildRecord(conn, data);

  return {
    ...record,
    subquery(sObjectName: string): RecordQueryResult {
      const subquery = data[sObjectName];
      if (
        subquery &&
        "totalSize" in subquery &&
        "done" in subquery &&
        "records" in subquery
      ) {
        return {
          done: subquery.done,
          totalSize: subquery.totalSize,
          nextRecordsUrl: subquery.nextRecordsUrl,
          records: subquery.records.map((data) => {
            const type = data.attributes.type;
            const fields = createCaseInsensitiveMap(data);
            delete fields["attributes"];
            return { type, fields };
          }),
        };
      }
      return null;
    },
  };
}
