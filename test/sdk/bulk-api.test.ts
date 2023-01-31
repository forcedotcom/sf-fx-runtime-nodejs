/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { createBulkApi } from "../../src/sdk/bulk-api.js";
import {
  BulkApi,
  DataTable,
  IngestJobFailure,
  IngestJobReference,
  IngestJobInfo,
  BulkApiError,
  QueryJobReference,
  QueryJobInfo,
  QueryJobResults,
  Record as SDKRecord,
} from "../../src";
import { expect } from "chai";
import { match } from "ts-pattern";

const WIREMOCK_URL = "http://127.0.0.1:8080";

const SIZE_1_MB = 1_000_000;

const testClientError: Pick<BulkApiError, "errorCode" | "message"> = {
  errorCode: "testErrorCode",
  message: "testErrorMessage",
};

const testServerError: Pick<BulkApiError, "errorCode" | "message"> = {
  errorCode: "ERROR_HTTP_500",
  message: "",
};

let bulkApi: BulkApi;

describe("bulkApi", function () {
  this.timeout(2 * 60 * 1000); // 2m

  before(() => {
    bulkApi = createBulkApi({
      instanceUrl: WIREMOCK_URL,
      accessToken: "testAccessToken",
      version: "56.0",
    });
  });

  describe("ingest job operations", () => {
    const testIngestJobReference: IngestJobReference = {
      id: "7508Z00000lSXvxQAG",
      type: "ingestJob",
    };

    const clientErrorIngestJobReference: IngestJobReference = {
      id: "clientError",
      type: "ingestJob",
    };

    const serverErrorIngestJobReference: IngestJobReference = {
      id: "serverError",
      type: "ingestJob",
    };

    const emptyResultsIngestJobReference: IngestJobReference = {
      id: "empty",
      type: "ingestJob",
    };

    describe("ingest", () => {
      beforeEach(async () => {
        await resetScenarios();
      });

      it("ingesting a small dataset", async () => {
        await useScenario("BULK_API_INGEST_S01");
        const results = await bulkApi.ingest({
          object: "Account",
          operation: "insert",
          dataTable: createSmallDataset(bulkApi),
        });
        expect(results).to.have.length(1);
        match(results[0])
          .with({ type: "ingestJob" }, expectValidIngestJobReference)
          .otherwise(fail("result was not a successful job reference"));
      });

      it("ingesting a small dataset - client error during job create", async () => {
        await useScenario("BULK_API_INGEST_S02");
        const results = await bulkApi.ingest({
          object: "Account",
          operation: "insert",
          dataTable: createSmallDataset(bulkApi),
        });
        expect(results).to.have.length(1);
        match(results[0])
          .with(
            { type: "ingestJob" },
            fail("the scenario should fail during the opening of a job")
          )
          .otherwise(expectIngestJobFailureWithoutReference(testClientError));
      });

      it("ingesting a small dataset - client error during job upload", async () => {
        await useScenario("BULK_API_INGEST_S03");
        const results = await bulkApi.ingest({
          object: "Account",
          operation: "insert",
          dataTable: createSmallDataset(bulkApi),
        });
        expect(results).to.have.length(1);
        match(results[0])
          .with(
            { type: "ingestJob" },
            fail(
              "the scenario should fail during the uploading of data to a job"
            )
          )
          .otherwise(expectIngestJobFailureWithReference(testClientError));
      });

      it("ingesting a small dataset - client error during job close", async () => {
        await useScenario("BULK_API_INGEST_S04");
        const results = await bulkApi.ingest({
          object: "Account",
          operation: "insert",
          dataTable: createSmallDataset(bulkApi),
        });
        expect(results).to.have.length(1);
        match(results[0])
          .with(
            { type: "ingestJob" },
            fail("the scenario should fail during the closing of a job")
          )
          .otherwise(expectIngestJobFailureWithReference(testClientError));
      });

      it("ingesting a small dataset - server error during job create", async () => {
        await useScenario("BULK_API_INGEST_S05");
        const results = await bulkApi.ingest({
          object: "Account",
          operation: "insert",
          dataTable: createSmallDataset(bulkApi),
        });
        expect(results).to.have.length(1);
        match(results[0])
          .with(
            { type: "ingestJob" },
            fail("the scenario should fail during the opening of a job")
          )
          .otherwise(expectIngestJobFailureWithoutReference(testServerError));
      });

      it("ingesting a small dataset - server error during job upload", async () => {
        await useScenario("BULK_API_INGEST_S06");
        const results = await bulkApi.ingest({
          object: "Account",
          operation: "insert",
          dataTable: createSmallDataset(bulkApi),
        });
        expect(results).to.have.length(1);
        match(results[0])
          .with(
            { type: "ingestJob" },
            fail(
              "the scenario should fail during the uploading of data to a job"
            )
          )
          .otherwise(expectIngestJobFailureWithReference(testServerError));
      });

      it("ingesting a small dataset - server error during job close", async () => {
        await useScenario("BULK_API_INGEST_S07");
        const results = await bulkApi.ingest({
          object: "Account",
          operation: "insert",
          dataTable: createSmallDataset(bulkApi),
        });
        expect(results).to.have.length(1);
        match(results[0])
          .with(
            { type: "ingestJob" },
            fail("the scenario should fail during the closing of a job")
          )
          .otherwise(expectIngestJobFailureWithReference(testServerError));
      });

      it("ingesting a large dataset", async () => {
        await useScenario("BULK_API_INGEST_S08");
        const results = await bulkApi.ingest({
          object: "Account",
          operation: "insert",
          dataTable: createLargeDataset(bulkApi),
        });
        expect(results).to.have.length(3);
        match(results[0])
          .with({ type: "ingestJob" }, expectValidIngestJobReference)
          .otherwise(fail("first result was not a successful job reference"));
        match(results[1])
          .with({ type: "ingestJob" }, expectValidIngestJobReference)
          .otherwise(fail("second result was not a successful job reference"));
        match(results[2])
          .with({ type: "ingestJob" }, expectValidIngestJobReference)
          .otherwise(fail("third result was not a successful job reference"));
      });

      it("ingesting a large dataset - single failure in a set of jobs", async () => {
        await useScenario("BULK_API_INGEST_S09");
        const results = await bulkApi.ingest({
          object: "Account",
          operation: "insert",
          dataTable: createLargeDataset(bulkApi),
        });
        expect(results).to.have.length(3);
        match(results[0])
          .with({ type: "ingestJob" }, expectValidIngestJobReference)
          .otherwise(fail("first result was not a successful job reference"));
        match(results[1])
          .with({ type: "ingestJob" }, fail("second result should have failed"))
          .otherwise(expectIngestJobFailureWithReference(testServerError));
        match(results[2])
          .with({ type: "ingestJob" }, expectValidIngestJobReference)
          .otherwise(fail("third result was not a successful job reference"));
      });
    });

    describe("getInfo", () => {
      it("should be possible to get the info about an ingest job", async () => {
        const jobInfo = await bulkApi.getInfo(testIngestJobReference);
        const expectedJobInfo: IngestJobInfo = {
          id: "7508Z00000lSXvxQAG",
          operation: "insert",
          object: "Account",
          createdById: "0058Z000007lKMAQA2",
          createdDate: "2023-01-17T14:20:03.000+0000",
          systemModstamp: "2023-01-17T14:20:47.000+0000",
          state: "JobComplete",
          concurrencyMode: "Parallel",
          contentType: "CSV",
          apiVersion: 53,
          jobType: "V2Ingest",
          lineEnding: "LF",
          columnDelimiter: "COMMA",
          numberRecordsProcessed: 3,
          numberRecordsFailed: 0,
          retries: 0,
          totalProcessingTime: 374,
          apiActiveProcessingTime: 283,
          apexProcessingTime: 0,
        };
        expect(jobInfo).to.deep.eq(expectedJobInfo);
      });

      it("should return an error on client failure", async () => {
        try {
          await bulkApi.getInfo(clientErrorIngestJobReference);
          expect.fail("expected this request to failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on server failure", async () => {
        try {
          await bulkApi.getInfo(serverErrorIngestJobReference);
          expect.fail("expected this request to failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });

    describe("getSuccessfulResults", () => {
      it("should be able to fetch the successful results", async () => {
        const results = await bulkApi.getSuccessfulResults(
          testIngestJobReference
        );
        expect(results.columns).to.deep.eq([
          "sf__Id",
          "sf__Created",
          "Name",
          "Description",
          "NumberOfEmployees",
        ]);
        expect(results.map(Object.fromEntries)).to.deep.eq([
          {
            sf__Id: "0018Z00002rGc7YQAS",
            sf__Created: "true",
            Name: "TestAccount1",
            Description: "Description of TestAccount1",
            NumberOfEmployees: "30",
          },
          {
            sf__Id: "0018Z00002rGc7ZQAS",
            sf__Created: "true",
            Name: "TestAccount2",
            Description: "Another description",
            NumberOfEmployees: "40",
          },
          {
            sf__Id: "0018Z00002rGc7aQAC",
            sf__Created: "true",
            Name: "TestAccount3",
            Description: "Yet another description",
            NumberOfEmployees: "50",
          },
        ]);
      });

      it("should be able to fetch the successful results when the results are empty", async () => {
        const results = await bulkApi.getSuccessfulResults(
          emptyResultsIngestJobReference
        );
        expect(results.columns).to.deep.eq([
          "sf__Id",
          "sf__Created",
          "Name",
          "Description",
          "NumberOfEmployees",
        ]);
        expect(results).to.be.empty;
      });

      it("should return an error on a client failure", async () => {
        try {
          await bulkApi.getSuccessfulResults(clientErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on a server failure", async () => {
        try {
          await bulkApi.getSuccessfulResults(serverErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });

    describe("getFailedResults", () => {
      it("should be able to fetch the failed results", async () => {
        const results = await bulkApi.getFailedResults(testIngestJobReference);
        expect(results.columns).to.deep.eq([
          "sf__Id",
          "sf__Error",
          "Name",
          "Description",
          "NumberOfEmployees",
        ]);
        expect(results.map(Object.fromEntries)).to.deep.eq([
          {
            sf__Id: "",
            sf__Error:
              "REQUIRED_FIELD_MISSING:Required fields are missing: [Name]:Name --",
            Name: "",
            Description: "Description of TestAccount1",
            NumberOfEmployees: "30",
          },
          {
            sf__Id: "",
            sf__Error:
              "REQUIRED_FIELD_MISSING:Required fields are missing: [Name]:Name --",
            Name: "",
            Description: "Another description",
            NumberOfEmployees: "40",
          },
        ]);
      });

      it("should be able to fetch the failed results when the results are empty", async () => {
        const results = await bulkApi.getFailedResults(
          emptyResultsIngestJobReference
        );
        expect(results.columns).to.deep.eq([
          "sf__Id",
          "sf__Error",
          "Name",
          "Description",
          "NumberOfEmployees",
        ]);
        expect(results).to.be.empty;
      });

      it("should return an error on a client failure", async () => {
        try {
          await bulkApi.getFailedResults(clientErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on a server failure", async () => {
        try {
          await bulkApi.getFailedResults(serverErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });

    describe("getUnprocessedRecords", () => {
      it("should be able to fetch the unprocessed results", async () => {
        const results = await bulkApi.getUnprocessedRecords(
          testIngestJobReference
        );
        expect(results.columns).to.deep.eq([
          "Name",
          "Description",
          "NumberOfEmployees",
        ]);
        expect(results.map(Object.fromEntries)).to.deep.eq([
          {
            Name: "TestAccount3",
            Description: "Yet another description",
            NumberOfEmployees: "50",
          },
        ]);
      });

      it("should be able to fetch the unprocessed results when the results are empty", async () => {
        const results = await bulkApi.getUnprocessedRecords(
          emptyResultsIngestJobReference
        );
        expect(results.columns).to.deep.eq([
          "Name",
          "Description",
          "NumberOfEmployees",
        ]);
        expect(results).to.be.empty;
      });

      it("should return an error on a client failure", async () => {
        try {
          await bulkApi.getUnprocessedRecords(clientErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on a server failure", async () => {
        try {
          await bulkApi.getUnprocessedRecords(serverErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });

    describe("abort", () => {
      it("should be possible to abort an ingest job", async () => {
        await bulkApi.abort(testIngestJobReference);
      });

      it("should return an error on client failure", async () => {
        try {
          await bulkApi.abort(clientErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "INVALIDJOBSTATE",
            message: "Aborting already Completed Job not allowed",
          });
        }
      });

      it("should return an error on server failure", async () => {
        try {
          await bulkApi.abort(serverErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });

    describe("delete", () => {
      it("should be possible to delete an ingest job", async () => {
        await bulkApi.delete(testIngestJobReference);
      });

      it("should return an error on client failure", async () => {
        try {
          await bulkApi.delete(clientErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on server failure", async () => {
        try {
          await bulkApi.delete(serverErrorIngestJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });
  });

  describe("query job operations", () => {
    const testQueryJobReference: QueryJobReference = {
      id: "7508Z00000lTqQCQA0",
      type: "queryJob",
    };

    const clientErrorQueryJobReference: QueryJobReference = {
      id: "clientError",
      type: "queryJob",
    };

    const serverErrorQueryJobReference: QueryJobReference = {
      id: "serverError",
      type: "queryJob",
    };

    const emptyResultsQueryJobReference: QueryJobReference = {
      id: "empty",
      type: "queryJob",
    };

    describe("query", () => {
      it("should create a query job", async () => {
        const jobReference = await bulkApi.query({
          soql: "SELECT Id FROM Account",
        });
        const expectedJobReference: QueryJobReference = {
          id: "7508Z00000lTqQCQA0",
          type: "queryJob",
        };
        expect(jobReference).to.deep.eq(expectedJobReference);
      });

      it("should create a queryAll job", async () => {
        const jobReference = await bulkApi.query({
          soql: "SELECT Id FROM Account",
          operation: "queryAll",
        });
        const expectedJobReference: QueryJobReference = {
          id: "7508Z00000lTrkSQAS",
          type: "queryJob",
        };
        expect(jobReference).to.deep.eq(expectedJobReference);
      });

      it("should return an error on a client failure", async () => {
        try {
          await bulkApi.query({
            soql: "SELECT Id FROM ClientError",
          });
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on a server failure", async () => {
        try {
          await bulkApi.query({
            soql: "SELECT Id FROM ServerError",
          });
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });

    describe("getQueryResults", () => {
      it("should be able to fetch the query results", async () => {
        const results = await bulkApi.getQueryResults(testQueryJobReference);
        expect(results.done).to.eq(true);
        expect(results.locator).to.be.undefined;
        expect(results.numberOfRecords).to.eq(3);
        expect(results.dataTable.columns).to.deep.eq(["Id"]);
        expect(results.dataTable.map(Object.fromEntries)).to.deep.eq([
          {
            Id: "0018Z00002eGbDRQA0",
          },
          {
            Id: "0018Z00002f1vW4QAI",
          },
          {
            Id: "0018Z00002f1vW5QAI",
          },
        ]);
      });

      it("should be able to fetch the query results when the results are empty", async () => {
        const results = await bulkApi.getQueryResults(
          emptyResultsQueryJobReference
        );
        expect(results.done).to.eq(true);
        expect(results.locator).to.be.undefined;
        expect(results.numberOfRecords).to.eq(0);
        expect(results.dataTable.columns).to.deep.eq(["Id"]);
        expect(results.dataTable).to.be.empty;
      });

      it("should return an error on a client failure", async () => {
        try {
          await bulkApi.getQueryResults(clientErrorQueryJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on a server failure", async () => {
        try {
          await bulkApi.getQueryResults(serverErrorQueryJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });

    describe("getMoreQueryResults", () => {
      it("should be possible to get more results for a query job", async () => {
        const currentResults: QueryJobResults = {
          locator: "MjAwMDAw",
          done: false,
          numberOfRecords: 50000,
          dataTable: bulkApi.createDataTableBuilder(["Id"]).build(),
          jobReference: testQueryJobReference,
        };
        const moreResults = await bulkApi.getMoreQueryResults(currentResults);
        expect(moreResults.done).to.eq(true);
        expect(moreResults.locator).to.be.undefined;
        expect(moreResults.numberOfRecords).to.eq(1);
        expect(moreResults.dataTable.columns).to.deep.eq(["Id"]);
        expect(moreResults.dataTable.map(Object.fromEntries)).to.deep.eq([
          {
            Id: "005R0000000UyrWIAv",
          },
        ]);
      });

      it("should be possible to get more results for a query job and specify the maximum records to return", async () => {
        const currentResults: QueryJobResults = {
          locator: "MjAwMDAw",
          done: false,
          numberOfRecords: 50000,
          dataTable: bulkApi.createDataTableBuilder(["Id"]).build(),
          jobReference: testQueryJobReference,
        };
        const moreResults = await bulkApi.getMoreQueryResults(currentResults, {
          maxRecords: 2,
        });
        expect(moreResults.done).to.eq(true);
        expect(moreResults.locator).to.be.undefined;
        expect(moreResults.numberOfRecords).to.eq(2);
        expect(moreResults.dataTable.columns).to.deep.eq(["Id"]);
        expect(moreResults.dataTable.map(Object.fromEntries)).to.deep.eq([
          {
            Id: "005R0000000UyrWIAv",
          },
          {
            Id: "005R0000000GiwjIxx",
          },
        ]);
      });
    });

    describe("getInfo", () => {
      it("should be possible to get the info about an ingest job", async () => {
        const jobInfo = await bulkApi.getInfo(testQueryJobReference);
        const expectedJobInfo: QueryJobInfo = {
          id: "7508Z00000lTqQCQA0",
          operation: "query",
          object: "Account",
          createdById: "0058Z000007lKMAQA2",
          createdDate: "2023-01-27T15:10:12.000+0000",
          systemModstamp: "2023-01-27T15:10:25.000+0000",
          state: "JobComplete",
          concurrencyMode: "Parallel",
          contentType: "CSV",
          apiVersion: 53,
          jobType: "V2Query",
          lineEnding: "LF",
          columnDelimiter: "COMMA",
          numberRecordsProcessed: 51,
          retries: 0,
          totalProcessingTime: 240,
        };
        expect(jobInfo).to.deep.eq(expectedJobInfo);
      });

      it("should return an error on client failure", async () => {
        try {
          await bulkApi.getInfo(clientErrorQueryJobReference);
          expect.fail("expected this request to failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on server failure", async () => {
        try {
          await bulkApi.getInfo(serverErrorQueryJobReference);
          expect.fail("expected this request to failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });

    describe("abort", () => {
      it("should be possible to abort a query job", async () => {
        await bulkApi.abort(testQueryJobReference);
      });

      it("should return an error on client failure", async () => {
        try {
          await bulkApi.abort(clientErrorQueryJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on server failure", async () => {
        try {
          await bulkApi.abort(serverErrorQueryJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });

    describe("delete", () => {
      it("should be possible to delete a query job", async () => {
        await bulkApi.delete(testQueryJobReference);
      });

      it("should return an error on client failure", async () => {
        try {
          await bulkApi.delete(clientErrorQueryJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "NOT_FOUND",
            message: "The requested resource does not exist",
          });
        }
      });

      it("should return an error on server failure", async () => {
        try {
          await bulkApi.delete(serverErrorQueryJobReference);
          expect.fail("expected request to have failed");
        } catch (e) {
          expectBulkApiError(e, {
            errorCode: "ERROR_HTTP_500",
            message: "",
          });
        }
      });
    });
  });

  describe("data table operations", () => {
    describe("addRow", () => {
      it("should be able add a row of array values", () => {
        const dataTable = bulkApi
          .createDataTableBuilder(["one", "two"])
          .addRow(["1", "2"])
          .build();
        expect(dataTable.columns).to.deep.eq(["one", "two"]);
        expect(dataTable).to.have.length(1);
        expect(Object.fromEntries(dataTable[0])).to.deep.eq({
          one: "1",
          two: "2",
        });
      });

      it("should be able add a row of map values", () => {
        const dataTable = bulkApi
          .createDataTableBuilder(["one", "two"])
          .addRow(
            new Map<string, string>([
              ["one", "1"],
              ["two", "2"],
              [
                "three",
                "this value should be ignored since it's not listed in the columns",
              ],
            ])
          )
          .build();
        expect(dataTable.columns).to.deep.eq(["one", "two"]);
        expect(dataTable).to.have.length(1);
        expect(Object.fromEntries(dataTable[0])).to.deep.eq({
          one: "1",
          two: "2",
        });
      });

      it("should be able add a row of custom values", () => {
        const record: SDKRecord = {
          type: "Account",
          fields: {
            Name: "account1",
            Description: "testDescription",
            NumberOfEmployees: 30,
          },
        };
        const dataTable = bulkApi
          .createDataTableBuilder(["Name", "Description"])
          .addRow(record, (record, columnName) => {
            return columnName in record.fields
              ? `${record.fields[columnName]}`
              : bulkApi.formatNullValue();
          })
          .build();
        expect(dataTable.columns).to.deep.eq(["Name", "Description"]);
        expect(dataTable).to.have.length(1);
        expect(Object.fromEntries(dataTable[0])).to.deep.eq({
          Name: "account1",
          Description: "testDescription",
        });
      });
    });

    describe("addRows", () => {
      it("should be able add a row of array values", () => {
        const dataTable = bulkApi
          .createDataTableBuilder(["a", "b"])
          .addRows([
            ["1", "2"],
            ["3", "4", "ignored"],
          ])
          .build();
        expect(dataTable.columns).to.deep.eq(["a", "b"]);
        expect(dataTable).to.have.length(2);
        expect(Object.fromEntries(dataTable[0])).to.deep.eq({
          a: "1",
          b: "2",
        });
        expect(Object.fromEntries(dataTable[1])).to.deep.eq({
          a: "3",
          b: "4",
        });
      });

      it("should be able add a row of map values", () => {
        const dataTable = bulkApi
          .createDataTableBuilder(["a", "b"])
          .addRows([
            new Map<string, string>([
              ["a", "1"],
              ["b", "2"],
              ["c", "ignored"],
            ]),
            new Map<string, string>([
              ["a", "3"],
              ["b", "4"],
            ]),
          ])
          .build();
        expect(dataTable.columns).to.deep.eq(["a", "b"]);
        expect(dataTable).to.have.length(2);
        expect(Object.fromEntries(dataTable[0])).to.deep.eq({
          a: "1",
          b: "2",
        });
        expect(Object.fromEntries(dataTable[1])).to.deep.eq({
          a: "3",
          b: "4",
        });
      });

      it("should be able add a row of custom values", () => {
        const records: SDKRecord[] = [
          {
            type: "Account",
            fields: {
              Name: "account1",
              Description: "testDescription1",
              NumberOfEmployees: 30,
            },
          },
          {
            type: "Account",
            fields: {
              Name: "account2",
              Description: "testDescription2",
              NumberOfEmployees: 40,
            },
          },
        ];
        const dataTable = bulkApi
          .createDataTableBuilder(["Name", "Description"])
          .addRows(records, (record, columnName) => {
            return columnName in record.fields
              ? `${record.fields[columnName]}`
              : bulkApi.formatNullValue();
          })
          .build();
        expect(dataTable.columns).to.deep.eq(["Name", "Description"]);
        expect(dataTable).to.have.length(2);
        expect(Object.fromEntries(dataTable[0])).to.deep.eq({
          Name: "account1",
          Description: "testDescription1",
        });
        expect(Object.fromEntries(dataTable[1])).to.deep.eq({
          Name: "account2",
          Description: "testDescription2",
        });
      });
    });

    describe("splitDataTable", () => {
      it("should not split a data table < 100MB into multiple parts", () => {
        const dataTable = createDataTableUpToSizeInBytes(
          bulkApi,
          100 * SIZE_1_MB - 1
        );
        expect(bulkApi.splitDataTable(dataTable)).to.have.length(1);
      });

      it("should split a data table >= 100MB into multiple parts", () => {
        const dataTable = createDataTableUpToSizeInBytes(
          bulkApi,
          100 * SIZE_1_MB
        );
        expect(bulkApi.splitDataTable(dataTable)).to.have.length(2);
      });
    });

    describe("formatDate", () => {
      it('should be able to convert a Date into a valid "date" format', () => {
        const jan31_2023 = new Date(2023, 0, 31);
        expect(bulkApi.formatDate(jan31_2023)).to.eq("2023-01-31");
      });

      it("should raise an error if given an invalid Date", () => {
        const invalid = new Date(Date.parse("blah"));
        expect(() => bulkApi.formatDate(invalid)).to.throw("Invalid Date");
      });
    });

    describe("formatDateTime", () => {
      it('should be able to convert a Date into a valid "dateTime" format', () => {
        const jan31_2023 = new Date(Date.UTC(2023, 0, 31, 12, 30, 59, 1));
        expect(bulkApi.formatDateTime(jan31_2023)).to.eq(
          "2023-01-31T12:30:59.001Z"
        );
      });

      it("should raise an error if given an invalid Date", () => {
        const invalid = new Date(Date.parse("blah"));
        expect(() => bulkApi.formatDateTime(invalid)).to.throw("Invalid Date");
      });
    });

    describe("formatNullValue", () => {
      it("should be able to construct the value used to nullify fields", () => {
        expect(bulkApi.formatNullValue()).to.eq("#N/A");
      });
    });
  });
});

function createSmallDataset(bulkApi: BulkApi) {
  return bulkApi
    .createDataTableBuilder(["Name", "Description", "NumberOfEmployees"])
    .addRow(["TestAccount1", "Description of TestAccount1", "30"])
    .addRow(["TestAccount2", "Another description", "40"])
    .addRow(["TestAccount3", "Yet another description", "50"])
    .build();
}

function createLargeDataset(bulkApi: BulkApi) {
  return createDataTableUpToSizeInBytes(bulkApi, 200 * SIZE_1_MB);
}

async function useScenario(name: string) {
  await setScenarioState(name, "start");
}

async function setScenarioState(name: string, state: string): Promise<void> {
  const res = await fetch(`${WIREMOCK_URL}/__admin/scenarios/${name}/state`, {
    method: "PUT",
    body: JSON.stringify({ state }),
  });

  if (!res.ok) {
    throw new Error(
      `could not set wiremock scenario "${name}" to state "${state}"`
    );
  }
}

async function resetScenarios() {
  const res = await fetch(`${WIREMOCK_URL}/__admin/scenarios/reset`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Failed to reset wiremock scenarios`);
  }
}

function createDataTableUpToSizeInBytes(
  bulkApi: BulkApi,
  sizeInBytes: number
): DataTable {
  const bytesPerLine = 1000;
  const lineEnding = "\n";

  const columnName = times(
    bytesPerLine - Buffer.byteLength(lineEnding),
    () => "h"
  ).join("");
  const defaultFieldValue = times(
    bytesPerLine - Buffer.byteLength(lineEnding),
    () => "v"
  ).join("");

  const dataTableBuilder = bulkApi.createDataTableBuilder([columnName]);

  let totalBytes = Buffer.byteLength(columnName + lineEnding);
  while (totalBytes < sizeInBytes) {
    const bytesLeft = sizeInBytes - totalBytes;
    const fieldValue =
      bytesLeft < bytesPerLine
        ? times(bytesLeft - Buffer.byteLength(lineEnding), () => "v").join("")
        : defaultFieldValue;
    totalBytes += Buffer.byteLength(fieldValue + lineEnding);
    dataTableBuilder.addRow([fieldValue]);
  }

  return dataTableBuilder.build();
}

function times<T>(n: number, iterator: (i: number) => T): T[] {
  const returnValue: T[] = new Array(n);
  for (let i = 0; i < n; i++) {
    returnValue[i] = iterator(i);
  }
  return returnValue;
}

function expectValidIngestJobReference(jobReference: IngestJobReference) {
  expect(typeof jobReference.id).to.eq("string");
  expect(jobReference.type).to.eq("ingestJob");
}

function expectIngestJobFailureWithReference(
  options: Pick<BulkApiError, "errorCode" | "message">
) {
  return (failedJob: IngestJobFailure) => {
    expectValidIngestJobReference(failedJob.jobReference);
    expect(failedJob.error.errorCode).to.eq(options.errorCode);
    expect(failedJob.error.message).to.eq(options.message ?? "");
    expect(failedJob.unprocessedRecords).to.have.length.greaterThan(0);
  };
}

function expectIngestJobFailureWithoutReference(
  options: Pick<BulkApiError, "errorCode" | "message">
) {
  return (failedJob: IngestJobFailure) => {
    expect(failedJob.jobReference).to.be.undefined;
    expect(failedJob.error.errorCode).to.eq(options.errorCode);
    expect(failedJob.error.message).to.eq(options.message ?? "");
    expect(failedJob.unprocessedRecords).to.have.length.greaterThan(0);
  };
}

function fail(message: string) {
  return () => expect.fail(message);
}

function expectBulkApiError(
  actual: Record<string, unknown>,
  expected: Pick<BulkApiError, "errorCode" | "message">
) {
  if ("errorCode" in actual && "message" in actual) {
    expect(actual.errorCode).to.eq(expected.errorCode);
    expect(actual.message).to.eq(expected.message);
  } else {
    expect.fail("was expecting an bulk api error");
  }
}
