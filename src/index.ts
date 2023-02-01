/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { QueryOperation } from "jsforce2/lib/api/bulk";

/**
 * Main interface for Salesforce Functions.
 */
export type SalesforceFunction<A, B> = (
  event: InvocationEvent<A>,
  context: Context,
  logger: Logger
) => Promise<B> | B;

/**
 * An InvocationEvent is representative of the data associated with the occurrence of an event,
 * and supporting metadata about the source of that occurrence.
 * @property id The platform event occurrence id for event invocation.
 * @property type A value describing the type of invocation. The format of this is producer defined
 * and might include information such as the version of the type.
 * @property source An URI which identifies the context in which an event happened. Often this will
 * include information such as the type of the event source, the organization publishing the event
 * or the process that produced the event.
 * @property data The payload of the event
 * @property dataContentType The media type of the event payload that is accessible in data
 * @property dataSchema The schema that the event payload adheres to.
 * @property time The timestamp of when the occurrence happened. If the time of the occurrence
 * cannot be determined then this attribute may be set to some other time
 * (such as the current time), however all producers for the same source must be consistent in this
 * respect. In other words, either they all use the actual time of the occurrence or they all use
 * the same algorithm to determine the value used.
 */
export interface InvocationEvent<A> {
  readonly id: string;
  readonly type: string;
  readonly source: string;
  readonly data: A;
  readonly dataContentType?: string;
  readonly dataSchema?: string;
  readonly time?: string;
}

/**
 * Represents the connection to the execution environment and the Salesforce instance that
 * the function is associated with.
 * @property id The unique identifier for a given execution of a function.
 * @property org Information about the invoking Salesforce organization.
 */
export interface Context {
  readonly id: string;
  readonly org?: Org;
}

/**
 * Holds information about the invoking Salesforce organization and user.
 * @property id The Salesforce organization ID.
 * @property baseUrl The base URL of the Salesforce organization.
 * @property domainUrl The domain URL of the Salesforce organization.
 * @property apiVersion The API version the Salesforce organization is currently using.
 * @property dataApi An initialized data API client instance.
 * @property user The currently logged in user
 */
export interface Org {
  readonly id: string;
  readonly baseUrl: string;
  readonly domainUrl: string;
  readonly apiVersion: string;
  readonly dataApi: DataApi;

  readonly bulkApi: BulkApi;
  readonly user: User;
}

/**
 * Represents the result of a record query.
 * @property done If true, no additional records can be retrieved from the query result.
 * If false, one or more records remain to be retrieved.
 * @property totalSize The total amount of records returned by the query.
 * @property records The records in this query result
 * @property nextRecordsUrl The URL for the next set of records, if any.
 */
export interface RecordQueryResult {
  readonly done: boolean;
  readonly totalSize: number;
  readonly records: QueriedRecord[];
  readonly nextRecordsUrl?: string;
}

/**
 * The base record type representing an SObject
 * @property type The Salesforce Object type
 * @property fields A JavaScript object with all fields from the returned records.
 * @property binaryFields An optional JavaScript object with any eagerly-loaded base64 decoded binary content.
 * Each key in fields and binaryFields is case insensitive; the getters and setters for each
 * key/value pair will ignore casing when getting and setting fields.
 */
export type Record = {
  readonly type: string;
  readonly fields: { [key: string]: unknown };
  readonly binaryFields?: { [key: string]: Buffer };
};

/**
 * Records returned from a query or queryMore request
 */
export type QueriedRecord = Record & {
  /**
   * Returns the result of a sub query related to this record. Records can have sub query results when the record is the result of a relationship query.
   * @property subQueryResults The subquery results attached to this record
   */
  readonly subQueryResults: {
    [sObjectName: string]: RecordQueryResult;
  };
};

/**
 * Represents the result of a record modification such as a create, delete, or insert.
 * @property id The ID of the modified record.
 */
export interface RecordModificationResult {
  readonly id: string;
}

/**
 * References a modification, creation, or deletion of an object that may
 * occur as a part of a UnitOfWork.
 */
export interface ReferenceId {
  /**
   * Get a reference to a record modification, creation, or deletion that may
   * occur as a part of a UnitOfWork.
   *
   * @returns A string identifier
   */
  toString(): string;

  /**
   * Get a reference to a record's ID that may be created, deleted, or modified
   * as part of a UnitOfWork.
   *
   * @returns A string reference to a record id
   */
  toApiString(): string;
}

/**
 * Creates a single record for create or registers a record creation for the {@link UnitOfWork}
 * and returns a {@link ReferenceId}.
 * @property type The Salesforce Object type
 * @property fields A JavaScript Object for the fields that the record will be created with.
 * @property binaryFields An optional JavaScript Object with unencoded binary content buffers to create the record with. Values will be automatically base64 encoded.
 * The keys in fields and binaryFields are case insensitive.
 */
export type RecordForCreate = {
  type: string;
  fields: { [key: string]: unknown };
  binaryFields?: { [key: string]: Buffer };
};

/**
 * Creates a single record for update or registers a record update for the {@link UnitOfWork}
 * and returns a {@link ReferenceId}.
 * @property type The Salesforce Object type
 * @property fields A JavaScript Object for the fields that the record will be updated with.
 * @property binaryFields An optional JavaScript Object with unencoded binary content buffers to update the record with. Values will be automatically base64 encoded.
 * The keys in fields and binaryFields are case insensitive.
 */
export type RecordForUpdate = {
  type: string;
  fields: {
    id: string;
    [key: string]: unknown;
  };
  binaryFields?: { [key: string]: Buffer };
};

/**
 * Represents a UnitOfWork.
 */
export interface UnitOfWork {
  /**
   * Registers a {@link RecordForCreate} for the {@link UnitOfWork} and returns a {@link ReferenceId} that
   * can be used to refer to the created record in subsequent operations in this UnitOfWork.
   *
   * @param record The record to create.
   * @returns The ReferenceId for the created record.
   */
  registerCreate(record: RecordForCreate): ReferenceId;

  /**
   * Registers a {@link RecordForUpdate} for the {@link UnitOfWork} and returns a {@link ReferenceId} that can
   * be used to refer to the updated record in subsequent operations in this UnitOfWork.
   *
   * @param record The record to update.
   * @returns The ReferenceId for the updated record.
   */
  registerUpdate(record: RecordForUpdate): ReferenceId;

  /**
   * Registers a deletion of an existing record of the given type and id.
   *
   * @param type The object type of the record to delete.
   * @param id The id of the record to delete.
   * @returns The ReferenceId for the deleted record.
   */
  registerDelete(type: string, id: string): ReferenceId;
}

/**
 * Data API client to interact with data in a Salesforce org.
 * @property accessToken The access token used by this API client. Can be used to initialize a
 * third-party API client or to perform custom API calls with a HTTP library.
 */
export interface DataApi {
  readonly accessToken: string;

  /**
   * Queries for records with a given SOQL string.
   * @param soql The SOQL string.
   * @returns A {@link RecordQueryResult} that contains the queried data wrapped in a Promise.
   */
  query(soql: string): Promise<RecordQueryResult>;

  /**
   * Queries for more records, based on the given {@link RecordQueryResult}.
   * @param recordQueryResult The query result to query more data for.
   * @returns A {@link RecordQueryResult} that contains the queried data wrapped in a Promise.
   */
  queryMore(recordQueryResult: RecordQueryResult): Promise<RecordQueryResult>;

  /**
   * Creates a new record described by the given {@link RecordForCreate}.
   * @param record The record create description.
   * @returns A {@link RecordModificationResult} that contains the created data wrapped in a Promise.
   */
  create(record: RecordForCreate): Promise<RecordModificationResult>;

  /**
   * Updates an existing record described by the given {@link RecordForUpdate}.
   * @param update The record update description.
   * @returns A {@link RecordModificationResult} that contains the updated data wrapped in a Promise.
   */
  update(update: RecordForUpdate): Promise<RecordModificationResult>;

  /**
   * Deletes a record, based on the given type and id.
   * @param type The object type of the record to delete.
   * @param id The id of the record to delete.
   * @returns A {@link RecordModificationResult} that contains the deleted data wrapped in a Promise.
   */
  delete(type: string, id: string): Promise<RecordModificationResult>;

  /**
   * Creates a new and empty {@link UnitOfWork}.
   * @returns An empty {@link UnitOfWork}.
   */
  newUnitOfWork(): UnitOfWork;

  /**
   * Commits a {@link UnitOfWork}, executing all operations registered with it. If any of these
   * operations fail, the whole unit is rolled back. To examine results for a single operation,
   * inspect the returned map (which is keyed with {@link ReferenceId} returned from
   * {@link UnitOfWork#registerCreate} and {@link UnitOfWork#registerUpdate}).
   * @param unitOfWork The {@link UnitOfWork} to commit.
   * @returns A map of {@link RecordModificationResult}s, indexed by their {@link ReferenceId}s.
   */
  commitUnitOfWork(
    unitOfWork: UnitOfWork
  ): Promise<Map<ReferenceId, RecordModificationResult>>;
}

/**
 * Holds information about the invoking Salesforce user.
 * @property id The user's ID.
 * @property username The name of the user.
 * @property onBehalfOfUserId The id of the user this user operates in behalf of.
 */
export interface User {
  readonly id: string;
  readonly username: string;
  readonly onBehalfOfUserId?: string;
}

/**
 * Represents the logging functionality to log given messages at various levels.
 */
export interface Logger {
  /**
   * Logs the given message at the 'error' level.
   * @param message The message to log.
   * @returns void
   */
  error(message: string): void;

  /**
   * Logs the given message at the 'warn' level.
   * @param message The message to log.
   * @returns void
   */
  warn(message: string): void;

  /**
   * Logs the given message at the 'info' level.
   * @param message The message to log.
   * @returns void
   */
  info(message: string): void;

  /**
   * Logs the given message at the 'debug' level.
   * @param message The message to log.
   * @returns void
   */
  debug(message: string): void;

  /**
   * Logs the given message at the 'trace' level.
   * @param message The message to log.
   * @returns void
   */
  trace(message: string): void;
}

/**
 * Provides operations that can be used to create and interact with the
 * Bulk API 2.0 ingest and query jobs.
 */
export interface BulkApi {
  /**
   * This operation will set the state of an Ingest or query job to `Aborted`.
   * An aborted job will not be queued or processed.
   *
   * @param jobReference The reference of the job to abort
   * @see [Bulk API 2.0 Ingest / Close or Abort a Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/close_job.htm)
   * @see [Bulk API 2.0 Query / Abort a Query Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/query_abort_job.htm)
   */
  abort(jobReference: IngestJobReference | QueryJobReference): Promise<void>;

  /**
   * Creates a {@link DataTableBuilder} that can be used to construct {@link DataTable} instances.
   *
   * @param columns The names of the columns to include in the {@link DataTable}
   */
  createDataTableBuilder(columns: [string, ...string[]]): DataTableBuilder;

  /**
   * Deletes an ingest or query job. The job must have a state of `UploadComplete`,
   * `JobComplete`, `Aborted`, or `Failed`
   *
   * @param jobReference The reference of the job to delete
   * @see [Bulk API 2.0 Ingest / Delete a Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/delete_job.htm)
   * @see [Bulk API 2.0 Query / Delete a Query Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/query_delete_job.htm)
   */
  delete(jobReference: IngestJobReference | QueryJobReference): Promise<void>;

  /**
   * Empty field values are ignored when you update records. To set a field value
   * to `null` use this formatter which will set the field value to `#N/A`.
   *
   * @see [Bulk API 2.0 Ingest / Prepare CSV Files](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/datafiles_prepare_csv.htm)
   */
  formatNullValue(): string;

  /**
   * Produces a formatted `date` field from a JavaScript Date object. Will raise an
   * error if the provided Date is invalid.
   *
   * @param value The Date to convert into the `date` format
   * @see [Bulk API 2.0 Ingest / Valid Date Format in Records (2.0)](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/valid_date_format_in_records__2_0.htm)
   */
  formatDate(value: Date): string;

  /**
   * Produces a formatted `dateTime` field from a JavaScript Date object. Will raise an
   * error if the provided Date is invalid.
   *
   * @param value The Date to convert into the `dateTime` format
   * @see [Bulk API 2.0 Ingest / Valid Date Format in Records (2.0)](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/valid_date_format_in_records__2_0.htm)
   */
  formatDateTime(value: Date): string;

  /**
   * Retrieve the list of failed records for a completed ingest job. The returned {@link DataTable} will contain the following:
   * - `sf__Error`: Error code and message, if applicable.
   * - `sf__Id`: ID of the record that had an error during processing, if applicable.
   * - Field data for the row that was provided in the original job data upload request.
   *
   * @param jobReference The reference of the job to get the failed results for
   * @see [Bulk API 2.0 Reference / Get Job Failed Record Results](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/get_job_failed_results.htm)
   */
  getFailedResults(jobReference: IngestJobReference): Promise<DataTable>;

  /**
   * Fetches the current information about an ingest or query job.
   *
   * @param jobReference The reference of the job to fetch information about
   * @see [Bulk API 2.0 Ingest / Get Job Info](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/get_job_info.htm)
   * @see [Bulk API 2.0 Query / Get Information About a Query Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/query_get_one_job.htm)
   */
  getInfo(
    jobReference: IngestJobReference | QueryJobReference
  ): Promise<IngestJobInfo | QueryJobInfo>;

  /**
   * Gets the next set of results for a query job.
   *
   * @param queryJobResults The current query job result set
   * @param getQueryJobResultsOptions Optional configuration that can be specified when fetching query results
   * @see [Bulk API 2.0 Query / Get Results for a Query Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/query_get_job_results.htm)
   */
  getMoreQueryResults(
    queryJobResults: QueryJobResults,
    getQueryJobResultsOptions?: GetQueryJobResultsOptions
  ): Promise<QueryJobResults>;

  /**
   * Gets the results for a query job.  The job must be in a `JobCompleted` state.
   *
   * @param jobReference - The reference of the job to get the results for
   * @param getQueryJobResultsOptions Optional configuration that can be specified when fetching query results
   * @see [Bulk API 2.0 Query / Get Results for a Query Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/query_get_job_results.htm)
   */
  getQueryResults(
    jobReference: QueryJobReference,
    getQueryJobResultsOptions?: GetQueryJobResultsOptions
  ): Promise<QueryJobResults>;

  /**
   * Retrieve the list of successfully processed records for a completed ingest job. The returned {@link DataTable} will contain the following:
   * - `sf__Created`: Indicates if the record was created.
   * - `sf__Id`: ID of the record that was successfully processed.
   * - Field data for the row that was provided in the original job data upload request.
   *
   * @param jobReference The reference of the job to get the successful results for
   * @see [Bulk API 2.0 Ingest / Get Job Successful Record Results](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/get_job_successful_results.htm)
   */
  getSuccessfulResults(jobReference: IngestJobReference): Promise<DataTable>;

  /**
   * Retrieve the list of successfully processed records for a completed ingest job. The returned {@link DataTable} will contain all the columns from the uploaded data.
   *
   * @param jobReference The reference of the job to get the unprocessed records for
   * @see [Bulk API 2.0 Ingest / Get Job Unprocessed Record Results](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/get_job_unprocessed_results.htm)
   */
  getUnprocessedRecords(jobReference: IngestJobReference): Promise<DataTable>;

  /**
   * Handles the process of splitting the {@link DataTable} to be ingested into one or more {@link DataTable}
   * instances that can fit within the request size limit that can be accepted by the Bulk API v2.
   * Then, for each {@link DataTable} produced during the split, a new ingest job will be created, the data will be uploaded,
   * and the job will be closed and queued for processing.
   *
   * The returned value will be a list of one or more ingest job references or a failure result
   * containing the error that occurred, the unprocessed records, and the created job reference (if applicable).
   *
   * @param ingestJobOptions These are options that can be supplied when creating an ingest job.
   * @see [Bulk API 2.0 Ingest / Prepare CSV Files](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/datafiles_prepare_csv.htm)
   * @see [Bulk API 2.0 Ingest / Create a Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/create_job.htm)
   * @see [Bulk API 2.0 Ingest / Upload Job Data](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/upload_job_data.htm)
   * @see [Bulk API 2.0 Ingest / Close or Abort a Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/close_job.htm)
   */
  ingest(
    ingestJobOptions: IngestJobOptions
  ): Promise<Array<IngestJobReference | IngestJobFailure>>;

  /**
   * Creates a new query job for processing.
   *
   * @param options These are options that can be supplied when creating a query job.
   * @see [Bulk API 2.0 Query / Create a Query Job](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/query_create_job.htm)
   */
  query(options: QueryJobOptions): Promise<QueryJobReference>;

  /**
   * Splits a {@link DataTable} into one or more {@link DataTable} instances that are guaranteed
   * to fit within the upload size limitation of an ingest job.
   *
   * @param dataTable The {@link DataTable} to split
   * @see [Bulk API 2.0 Ingest / Upload Job Data / Usage Notes](https://developer.salesforce.com/docs/atlas.en-us.234.0.api_asynch.meta/api_asynch/upload_job_data.htm)
   */
  splitDataTable(dataTable: DataTable): DataTable[];
}

/**
 * These are options that can be supplied when creating an ingest job using the
 * {@link BulkApi.ingest} method.
 */
export interface IngestJobOptions {
  /**
   * The data table to be ingested
   */
  dataTable: DataTable;

  /**
   * The object type for the data being processed. Use only a single object type per job.
   */
  object: string;

  /**
   * The processing operation for the job
   */
  operation: IngestJobOperation;

  /**
   * The external ID field in the object being updated. Only needed for upsert
   * operations. Field values must also exist in CSV job data.
   */
  externalIdFieldName?: string;

  /**
   * The ID of an assignment rule to run for a Case or a Lead. The assignment rule
   * can be active or inactive. The ID can be retrieved by using the Lightning
   * Platform SOAP API or the Lightning Platform REST API to query the AssignmentRule object.
   */
  assignmentRuleId?: string;
}

/**
 * These are options that can be supplied when creating a query job using the
 * {@link BulkApi.query} method.
 */
export interface QueryJobOptions {
  /**
   * The SOQL query to execute
   */
  soql: string;

  /**
   * Indicates if this query job should be processed as a `query` or a `queryAll`
   * operation. If not provided, the default value `query` will be used.
   */
  operation?: QueryJobOperation;
}

/**
 * A reference to an ingest job
 */
export interface IngestJobReference {
  /**
   * The id of the ingest job
   */
  id: string;

  /**
   * The type for this reference
   */
  type: "ingestJob";
}

/**
 * A reference to a query job
 */
export interface QueryJobReference {
  /**
   * The id of the query job
   */
  id: string;

  /**
   * The type for this reference
   */
  type: "queryJob";
}

/**
 * There are options that can be supplied when retrieving the results for a query job using the
 * {@link BulkApi.getQueryResults} and {@link BulkApi.getMoreQueryResults} methods of {@link BulkApi}.
 */
export interface GetQueryJobResultsOptions {
  /**
   * The maximum number of records to retrieve per set of results for the query. The request
   * is still subject to the size limits.
   *
   * If you are working with a very large number of query results, you may experience a timeout before receiving all the data
   * from Salesforce. To prevent a timeout, specify the maximum number of records your client is expecting to receive in the
   * `maxRecords` parameter. This splits the results into smaller sets with this value as the maximum size.
   *
   * If you don’t provide a value for this parameter, the server uses a default value based on the service.
   */
  maxRecords: number;
}

interface JobInfo {
  /**
   * The number of milliseconds taken to process triggers and other processes
   * related to the job data. This doesn't include the time used for processing
   * asynchronous and batch Apex operations. If there are no triggers, the value is 0.
   */
  apexProcessingTime?: number;

  /**
   * The number of milliseconds taken to actively process the job and includes
   * apexProcessingTime, but doesn't include the time the job waited in the queue
   * to be processed or the time required for serialization and deserialization.
   */
  apiActiveProcessingTime?: number;

  /**
   * The API version that the job was created in.
   */
  apiVersion: number;

  /**
   * The column delimiter used for CSV job data.
   */
  columnDelimiter: "COMMA";

  /**
   * How the request was processed.
   */
  concurrencyMode: "Parallel";

  /**
   * The format of the data being processed. Only CSV is supported.
   */
  contentType: "CSV";

  /**
   * The URL to use for Upload job Data requests for this job. Only valid if the job is in Open state.
   */
  contentUrl?: string;

  /**
   * The ID of the user who created the job.
   */
  createdById: string;

  /**
   * The date and time in the UTC time zone when the job was created.
   */
  createdDate: string;

  /**
   * Unique ID for this job.
   */
  id: string;

  /**
   * The job’s type.
   */
  jobType: "V2Ingest" | "V2Query";

  /**
   * The line ending used for CSV job data.
   */
  lineEnding: "LF";

  /**
   * The object type for the data being processed.
   */
  object: string;

  /**
   * The processing operation for the job.
   */
  operation: IngestJobOperation | QueryOperation;

  /**
   * The number of times that Salesforce attempted to save the results of an
   * operation. The repeated attempts are due to a problem, such as a lock contention.
   */
  retries?: number;

  /**
   * The current state of processing for the job.
   */
  state: IngestJobState | QueryJobState;

  /**
   * Date and time in the UTC time zone when the job finished.
   */
  systemModstamp: string;

  /**
   * The number of milliseconds taken to process the job.
   */
  totalProcessingTime?: number;

  /**
   * The ID of an assignment rule to run for a Case or a Lead.
   */
  assignmentRuleId?: string;

  /**
   * The name of the external ID field for an upsert.
   */
  externalIdFieldName?: string;

  /**
   * The number of records that were not processed successfully in this job.
   */
  numberRecordsFailed?: number;

  /**
   * The number of records already processed.
   */
  numberRecordsProcessed?: number;
}

/**
 * Ingest job information returned when calling {@link BulkApi.getInfo | BulkApi.getInfo} with an {@link IngestJobReference | ingest job reference}
 */
export interface IngestJobInfo extends JobInfo {
  /**
   * The job’s type.
   */
  jobType: "V2Ingest";

  /**
   * The processing operation for the job.
   */
  operation: IngestJobOperation;

  /**
   * The current state of processing for the job.
   */
  state: IngestJobState;

  /**
   * The ID of an assignment rule to run for a Case or a Lead.
   */
  assignmentRuleId?: string;

  /**
   * The name of the external ID field for an upsert.
   */
  externalIdFieldName?: string;

  /**
   * The number of records that were not processed successfully in this job.
   */
  numberRecordsFailed?: number;

  /**
   * The number of records already processed.
   */
  numberRecordsProcessed?: number;
}

/**
 * Query job information returned when calling {@link BulkApi.getInfo | BulkApi.getInfo} with a {@link QueryJobReference | query job reference}
 */
export interface QueryJobInfo extends JobInfo {
  /**
   * The job’s type.
   */
  jobType: "V2Query";

  /**
   * The processing operation for the job.
   */
  operation: QueryJobOperation;

  /**
   * The current state of processing for the job.
   */
  state: QueryJobState;
}

/**
 * The state of processing for an ingest job. Values include:
 * - `Open`: The job has been created, and job data can be uploaded to the job.
 * - `UploadComplete`: All data for a job has been uploaded, and the job is ready to be queued and processed. No new data can be added to this job. You can’t edit or save a closed job.
 * - `InProgress`: The job is being processed by Salesforce. This includes automatic optimized chunking of job data and processing of job operations.
 * - `Aborted`: The job has been aborted. You can abort a job if you created it or if you have the “Manage Data Integrations” permission.
 * - `JobComplete`: The job was processed by Salesforce.
 * - `Failed`: Some records in the job failed. Job data that was successfully processed isn’t rolled back.
 */
export type IngestJobState =
  | "Open"
  | "UploadComplete"
  | "InProgress"
  | "Aborted"
  | "JobComplete"
  | "Failed";

/**
 * The state of processing for an query job. Values include:
 * - `UploadComplete`: All data for a job has been uploaded, and the job is ready to be queued and processed. No new data can be added to this job. You can’t edit or save a closed job.
 * - `InProgress`: The job is being processed by Salesforce. This includes automatic optimized chunking of job data and processing of job operations.
 * - `Aborted`: The job has been aborted. You can abort a job if you created it or if you have the “Manage Data Integrations” permission.
 * - `JobComplete`: The job was processed by Salesforce.
 * - `Failed`: Some records in the job failed. Job data that was successfully processed isn’t rolled back.
 */
export type QueryJobState =
  | "UploadComplete"
  | "InProgress"
  | "Aborted"
  | "JobComplete"
  | "Failed";

/**
 * The processing operation for an ingest job.
 */
export type IngestJobOperation =
  | "insert"
  | "delete"
  | "hardDelete"
  | "update"
  | "upsert";

/**
 * The processing operation for a query job. Possible values are:
 * - `query`: Returns data that has not been deleted or archived. For more information, see [query()](https://developer.salesforce.com/docs/atlas.en-us.234.0.api.meta/api/sforce_api_calls_query.htm) in the SOAP API Developer Guide.
 * - `queryAll`: Returns records that have been deleted because of a merge or delete, and returns information about archived Task and Event records. For more information, see [queryAll()](https://developer.salesforce.com/docs/atlas.en-us.234.0.api.meta/api/sforce_api_calls_queryall.htm) in the SOAP API Developer Guide.
 */
export type QueryJobOperation = "query" | "queryAll";

/**
 * A paged result set that contains the results of a query job. The results of a query job
 * can be retrieved using the {@link BulkApi.getQueryResults} and {@link BulkApi.getMoreQueryResults}
 * methods of {@link BulkApi}.
 */
export interface QueryJobResults {
  /**
   * A data table containing a set of one or more query results.
   */
  readonly dataTable: DataTable;

  /**
   * This flag indicates if this is the final set of query results.
   */
  readonly done: boolean;

  /**
   * A string that identifies a specific set of query results. Providing a value for this parameter returns only that set of results.
   */
  readonly locator?: string;

  /**
   * The number of records in this set.
   */
  readonly numberOfRecords: number;

  /**
   * The reference of the query job this result set belongs to.
   */
  readonly jobReference: QueryJobReference;
}

/**
 * Represents a CSV-like data table consisting of columns and rows. All the values
 * contained must be represented as strings.
 */
export interface DataTable extends Array<Map<string, string>> {
  /**
   * A list of one or more column names contained in this data table.
   */
  columns: [string, ...string[]];
}

/**
 * A transformation function that can be provided when calling {@link DataTableBuilder.addRow} or
 * {@link DataTableBuilder.addRows} on a {@link DataTableBuilder} instance. It will
 * receive the value of an individual row and the name of the column to extract. This function
 * will be called for each column that is included in the data table.
 *
 * @typeParam T - the type of the object to extract row data from
 */
export type DataTableFieldValueExtractor<T> = (
  data: T,
  columnName: string
) => string;

/**
 * A builder object that helps with creating {@link DataTable} instances.
 */
export interface DataTableBuilder {
  /**
   * Adds a row of data to the {@link DataTable} being constructed. This can be a
   * list of string values in the same order as the specified columns or a map of
   * column names to values. Values that do not match up to the specified columns
   * will be ignored.
   *
   * @param row The row of data to add
   */
  addRow(row: string[] | Map<string, string>): DataTableBuilder;

  /**
   * Adds a row of data to the {@link DataTable} being constructed. A {@link DataTableFieldValueExtractor}
   * is used to convert the arbitrary value into the required row format.
   *
   * @typeParam T - the type of the object to extract row data from
   * @param value The object to extract row data from
   * @param fieldValueExtractor A function that reads field values from the provided object. It will be called for each column that is included in the {@link DataTable} being constructed.
   */
  addRow<T>(value: T, fieldValueExtractor: DataTableFieldValueExtractor<T>);

  /**
   * Adds multiple rows of data to the {@link DataTable} being constructed. This can be a
   * list of string values in the same order as the specified columns or a map of
   * column names to values. Values that do not match up to the specified columns
   * will be ignored.
   *
   * @param rows The list of rows of data to add
   */
  addRows(rows: Array<string[] | Map<string, string>>): DataTableBuilder;

  /**
   * Adds multiple rows of data to the {@link DataTable} being constructed. A {@link DataTableFieldValueExtractor}
   * is used to convert the arbitrary values into the required row format.
   *
   * @typeParam T - the type of the object to extract row data from
   * @param values The list of objects to extract row data from
   * @param fieldValueExtractor A function that reads field values from each provided object in the list of values. It will be called for each column that is included in the {@link DataTable} being constructed.
   */
  addRows<T>(
    values: Array<T>,
    fieldValueExtractor: DataTableFieldValueExtractor<T>
  ): DataTableBuilder;

  /**
   * Creates a {@link DataTable} instance from the columns and rows provided to the builder.
   */
  build(): DataTable;
}

/**
 * Represent a failure result from calling {@link BulkApi.ingest BulkApi.ingest}.
 */
export interface IngestJobFailure {
  /**
   * The error that occurred while attempting to construct the ingest job.
   */
  error: BulkApiError;

  /**
   * The data that would have been uploaded to the ingest job had the operation succeeded.
   */
  unprocessedRecords: DataTable;

  /**
   * A reference to the ingest job created. If the failure occurs when attempting to open
   * an ingest job there will be no reference. If the failure occurs when uploading or closing
   * the ingest job then a job reference will be present.
   */
  jobReference?: IngestJobReference;
}

/**
 * Represents an error thrown from a Bulk API 2.0 operation.
 */
export interface BulkApiError extends Error {
  /**
   * An error code indicating the type of error that occurred.
   */
  errorCode: string;
}
