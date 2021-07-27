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

*Note: the format should be `x.y.z-ext`. There is no need to include the `v` in the version number.*

Create a pull request with the created changes. The branch can be named `release-vx.y.z`. In the PR subject, name it `Release vx.y.z` with the version release.

### Creating a release

Once the release's pull request is merged, update your local `main` branch. Before releasing, you'll need to get S3 access on your local machine.

Set up a [sf-fx-ea profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) using credentials in lastpass (sf-fx-nodejs-internal-early-access). Verify that it works:

```
$ aws sts get-caller-identity --profile sf-fx-ea > /dev/null && echo $?
0
```

Then, run the following:

```
$ npm run release
```

The script will build the relase, push it up to S3, create a git tag, and push up the release to GitHub.

After the package has been pushed, you'll need to release a new version of the buildpack in github.com/heroku/buildpacks-nodejs.

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

## Dev

### Tests

Install dependencies

```
$ curl -fL https://repo1.maven.org/maven2/com/github/tomakehurst/wiremock-jre8-standalone/2.28.0/wiremock-jre8-standalone-2.28.0.jar -o ~/wiremock.jar
```

Boot wiremock:

```
$ java -jar ~/wiremock.jar --root-dir .
```

You can view mappings on disk at `mappings/` and on the server `http://localhost:8080/__admin`.

In another tab run:

```
$ npm run test
```

