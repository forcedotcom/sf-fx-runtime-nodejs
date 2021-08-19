# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Add Support for functions using JavaScript Modules / ESM ([#99](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/99))

## [0.1.2-ea] - 2021-07-27

- Fix SDK typescript interface  ([#55](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/55))
- Fix `context.org.dataApi.update` calls ([#54](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/54), [#56](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/56))
- Move jsforce dependency to official 2.0.0-beta.6 release ([#53](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/53))
- Salesforce API version is fixed to 51.0 ([#52](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/52))
- Rename x-extra-info 'stacktrace' to 'stack' ([#50](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/50))

### Changed
- add `statusCode` to the `x-extra-info` header in HTTP responses ([#41](https://github.com/forcedotcom/sf-fx-runtime-nodejs/pull/41))
