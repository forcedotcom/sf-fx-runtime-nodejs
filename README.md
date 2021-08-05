# sf-fx-runtime-nodejs

## Building
```
$ npm ci && npm run build && npm link
```

## Create a function using a template

- Install the `sfdx` cli [via npm](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)
- Install the [functions plugin](https://github.com/salesforcecli/plugin-functions) `sfdx plugins:install @salesforce/plugin-functions`
- Generate a project and a function:

```
$ cd ~/
$ sfdx generate:project -n myproject
$ cd myproject
$ sfdx generate:function --language=javascript --name=nodejsfunction
```

## Using

```
$ sf-fx-runtime-nodejs serve ~/myproject/functions/nodejsfunction
```

## Invoke with fake data

```
$ ./invoke.sh "localhost:8080" "{}"
```

## Invoke against a scratch org

Generate a scratch org using a dev hub:

```
$ sfdx plugins:install @salesforce/plugin-functions
$ cat > /tmp/project-scratch-def.json << EOF
{
  "orgName": "My company",
  "edition": "Developer",
  "features": ["EnableSetPasswordInApi"],
  "settings": {
    "lightningExperienceSettings": {
      "enableS1DesktopEnabled": true
    },
    "mobileSettings": {
      "enableS1EncryptedStoragePref2": false
    }
  }
}
EOF
$ sfdx force:auth:web:login -d -a MyHub
$ sfdx force:org:create -s -f /tmp/project-scratch-def.json -a MyScratchOrg
```

Verify the org was created correctly:

```
$ sfdx force:org:list --all | grep MyScratchOrg
(U)  MyScratchOrg  test-<uuid>@example.com  <SFDC ID> Active   2021-08-02
```

Invoke your local function with your scratch org:

```
$ sfdx run:function -l http://localhost:8080 -p '{}' -o MyScratchOrg
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

### Recording test fixtures via wiremock

Get the URL of your salesforce scratch org:

```
$ sfdx force:org:display -u MyScratchOrg | grep "Instance Url"
Instance Url     https://<my-url>-dev-ed.cs45.my.salesforce.com/
```

following the [wiremock docs on recording](http://wiremock.org/docs/record-playback/) boot your wiremock server and navigate to [http://localhost:8080/\__admin/recorder](http://localhost:8080/__admin/recorder). In the browser enter the URL of your salesforce scratch org. Using the above example it would be `https://<my-url>-dev-ed.cs45.my.salesforce.com/`

Now write your test as you normally would and point your url at your wiremock port (http://localhost:8080). Any requests made to this port will be forwarded to your salesforce url. The response will be recorded an a "scratch mapping" automatically generated.

When you've recorded a scratch mapping you want to use, rename it something descriptive before committing it. Also edit the mapping to remove the default `"ignoreExtraElements": true` declaration in `bodyPatterns` as it's been a source of issues where wiremock should have failed, but did not.

Tip: You can focus one specific test by passing the `-g` flag into mocha along with the name of the test. For example to run only the "invalid version" test you could run:

```
$ npm run test -- -g "invalid version"

> sf-fx-runtime-nodejs@0.1.1-ea test
> mocha "-g" "invalid version"



  DataApi Class
    create()
      invalid version
        ✓ throws a not found error


  1 passing (50ms)
```

