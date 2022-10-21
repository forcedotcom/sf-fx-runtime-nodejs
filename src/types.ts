/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

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
    readonly records: Array<Record>;
    readonly nextRecordsUrl?: string;
}

/**
 * Record items from a query or queryMore request
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
