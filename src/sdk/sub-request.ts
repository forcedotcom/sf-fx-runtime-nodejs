/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  RecordForCreate,
  RecordForUpdate,
  RecordModificationResult,
} from "sf-fx-sdk-nodejs";

export interface CompositeSubRequest<T> {
  readonly httpMethod: string;
  readonly body: any;

  buildUri(apiVersion: string): string;

  processResponse(
    statusCode: number,
    headers: Map<string, string>,
    body: any
  ): Promise<T>;
}

export class DeleteRecordSubRequest
  implements CompositeSubRequest<RecordModificationResult>
{
  readonly body = undefined;
  readonly httpMethod = "DELETE";
  private readonly type: string;
  private readonly id: string;

  constructor(type: string, id: string) {
    this.type = type;
    this.id = id;
  }

  buildUri(apiVersion: string): string {
    return `/services/data/v${apiVersion}/sobjects/${this.type}/${this.id}`;
  }

  processResponse(
    statusCode,
    headers,
    body
  ): Promise<RecordModificationResult> {
    if (statusCode === 204) {
      return Promise.resolve({ id: this.id });
    }

    return Promise.reject(parseErrorResponse(body));
  }
}

export class UpdateRecordSubRequest
  implements CompositeSubRequest<RecordModificationResult>
{
  readonly body: any;
  readonly httpMethod = "PATCH";
  private readonly record: RecordForUpdate;

  constructor(record: RecordForUpdate) {
    this.record = record;

    this.body = { ...record.fields };
    delete this.body.type;
    delete this.body.id;
  }

  buildUri(apiVersion: string): string {
    return `/services/data/v${apiVersion}/sobjects/${this.record.type}/${this.record.fields.id}`;
  }

  processResponse(
    statusCode,
    headers,
    body
  ): Promise<RecordModificationResult> {
    if (statusCode === 204) {
      return Promise.resolve({ id: this.record.fields.id });
    }

    return Promise.reject(parseErrorResponse(body));
  }
}

export class CreateRecordSubRequest
  implements CompositeSubRequest<RecordModificationResult>
{
  readonly body: any;
  readonly httpMethod = "POST";
  private readonly record: RecordForCreate;

  constructor(record: RecordForCreate) {
    this.record = record;

    this.body = { ...record.fields };
    delete this.body.type;
  }

  buildUri(apiVersion: string): string {
    return `/services/data/v${apiVersion}/sobjects/${this.record.type}`;
  }

  processResponse(
    statusCode: number,
    headers: Map<string, string>,
    body: any
  ): Promise<RecordModificationResult> {
    if (statusCode === 201) {
      return Promise.resolve({ id: body.id });
    }

    return Promise.reject(parseErrorResponse(body));
  }
}

function parseErrorResponse(errorResponse: [any]): Error {
  return new Error(
    errorResponse
      .map((error) => {
        return error.errorCode + ": " + error.message;
      })
      .join("\n")
  );
}
