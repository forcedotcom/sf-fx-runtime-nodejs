# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
