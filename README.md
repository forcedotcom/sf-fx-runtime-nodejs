# sf-fx-runtime-nodejs

## Building
```
$ npm install && npm run build && npm link
```

## Using
```
$ sf-fx-runtime-nodejs ~/project/nodejs-function
```

## Invoke
```
$ ./invoke.sh "localhost:8080" "{}"
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
