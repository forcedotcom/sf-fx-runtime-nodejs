# sf-fx-runtime-nodejs

## Building
```
$ npm ci && npm run build && npm link
```

## Using
```
$ sf-fx-runtime-nodejs serve ~/project/nodejs-function
```

## Invoke
```
$ ./invoke.sh "localhost:8080" "{}"
```

## Release
### Bumping versions

In order to bump a version, update the `CHANGELOG.md` and the `package.json`. You will also need to tag the release. Run the following script:

```
$ npm run bump -- $VERSION
```

Create a pull request with the created changes. In the subject, name it `Release vx.y.z` with the version release.

Once the pull request is merged, update your local `main` branch, and run the following:

```
$ npm run release
```

## Example Function
### package.json
```json
{
  "name": "nodejs-example-function",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "yahoo-stock-prices": "^1.1.0"
  }
}

```
### index.js
```javascript
const yahooStockPrices = require("yahoo-stock-prices");

module.exports = (event, context, logger) => {
    logger.info("I'm logging stuff!");
    return yahooStockPrices.getCurrentData("CRM");
}
```
