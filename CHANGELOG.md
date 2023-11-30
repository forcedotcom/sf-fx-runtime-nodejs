# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Downgrade @salesforce/core to maintain Node 14 compatibility. ([#517](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/517))

## [0.14.3] - 2023-11-29
- Dependency updates

## [0.14.2] - 2022-12-13
- Marking `fsevents` as an optional dependency for this library to prevent it from being treated as non-optional
  within function projects, causing a `EBADPLATFORM` error in NPM

## [0.14.1] - 2022-12-05
- Fix parsing of query results to include nested `Record` fields ([#451](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/451))

## [0.14.0] - 2022-11-29
- Improved [Relationship Queries](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql_relationships.htm) support for results returned by `dataApi.query("...")`
  so related relationship queries on a `QueriedRecord` can be accessed ([#444](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/444))

## [0.13.0] - 2022-11-08
- Moved SDK types from [`sf-fx-sdk-nodejs`](https://github.com/forcedotcom/sf-fx-sdk-nodejs) into runtime ([#435](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/435))

## [0.12.0] - 2022-09-28

- Automatic handling of base64 / binary data via binaryFields ([#400](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/400))
- Default url for DataAPI is now `orgDomainUrl` rather than `salesforceBaseUrl` ([#417](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/417))
- Update to cloudevents 6.0 ([#402](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/402))
- Fix `isReferenceId(null)` type check ([#401](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/401))
- Packaged releases no longer available from s3 ([#362](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/362))
- Silence deprecation warning from fastify ([#393](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/393))

## [0.11.2] - 2022-06-29
- Update to enable Salesforce API version v55.0

## [0.11.1] - 2022-04-01

- Added shutdown routine for worker processes ([#305](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/305))

## [0.11.0] - 2022-02-23

- Improved DataAPI error messaging ([#294](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/294))

## [0.10.0] - 2022-02-10

- Salesforce Rest API version may be specified in a function's project.toml ([#276](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/276))

## [0.9.2] - 2022-01-04

- Fix bug when attempting to load functions on windows with a `c:` prefix ([#262](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/262))
- Error handling for when API response cannot be parsed as JSON ([#174](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/174))

## [0.9.1] - 2021-10-13

- Bind debugger to --host ([#207](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/207))

## [0.9.0] - 2021-10-13

- Reintroduce NodeJS clustering, worker management via throng ([#203](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/203))

## [0.8.0] - 2021-10-01

- Revert NodeJS clustering, manage workers via throng ([#192](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/192))

## [0.7.0] - 2021-09-29

- Salesforce API version increased from 51 to 53 ([#184](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/184))

## [0.6.0] - 2021-09-22

- Convert package-lock.json to npm-shrinkwrap.json for deterministic dependencies ([#165](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/165))
- Rename apexClassId -> apexId and apexClassFQN -> apexFQN to support Apex classes and triggers.
- Introduce NodeJS clustering, manage workers via throng ([#157](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/157))

## [0.5.2] - 2021-09-08

- Handle malformed/missing cloud event salesforce extension ([#141](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/141))

## [0.5.1] - 2021-09-07

- Update package name to @heroku/sf-fx-runtime-nodejs ([#139](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/139))

## [0.5.0] - 2021-09-07

- Automatically expand ReferenceIDs with `.toApiString()` ([#133](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/133))
- Add unit testing for src/index.ts ([#118](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/118))
- Utilize @salesforce/core for logging with logfmt ([#119](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/119))

## [0.4.0] - 2021-08-24

- Compiled source files now live in `dist/` rather than `dist/src/`
  ([#114](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/114))

## [0.3.1] - 2021-08-23
- Wiremock Java installation no longer required for testing ([#104](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/104))

## [0.3.0-ea] - 2021-08-20

- Add Support for functions using JavaScript Modules / ESM ([#99](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/99))

## [0.1.2-ea] - 2021-07-27

- Fix SDK typescript interface  ([#55](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/55))
- Fix `context.org.dataApi.update` calls ([#54](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/54), [#56](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/56))
- Move jsforce dependency to official 2.0.0-beta.6 release ([#53](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/53))
- Salesforce API version is fixed to 51.0 ([#52](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/52))
- Rename x-extra-info 'stacktrace' to 'stack' ([#50](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/50))

### Changed
- add `statusCode` to the `x-extra-info` header in HTTP responses ([#41](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/41))
