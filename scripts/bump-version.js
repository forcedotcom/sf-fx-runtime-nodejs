#!/usr/bin/env node

const { readFile, readFileSync, writeFileSync } = require("node:fs");
const { exec } = require('child_process');
const version = process.argv[2];

const semver = new RegExp(/^((([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)?)$/);

if (!version.match(semver)) {
  console.error("Please use a valid numeric semver string:", "https://semver.org/")
  process.exit(1);
}

// bump package.json
console.log("Bumping version on package.json...");

readFile("./package.json", (err, jsonString) => {
  const jsonObj = JSON.parse(jsonString);
  jsonObj["version"] = version;
  jsonString = JSON.stringify(jsonObj, undefined, 2) + "\n";
  writeFileSync("./package.json", jsonString);
});

// bump CHANGELOG
console.log("Bumping version in CHANGELOG.md...");

const changelog = readFileSync('./CHANGELOG.md').toString().split("## [Unreleased]");
const today = new Date();

month = (today.getMonth() + 1).toString().padStart(2, 0);
day = today.getDate().toString().padStart(2, 0);
changelog.splice(1, 0, `## [Unreleased]\n\n## [${version}] - ${today.getFullYear()}-${month}-${day}`);
writeFileSync("./CHANGELOG.md", changelog.join(""));

console.log("Completed version bumping.");
