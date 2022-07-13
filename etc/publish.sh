#!/usr/bin/env bash
set -euo pipefail

echo "Running npm publish..."
npm publish

echo "Creating git tag..."
git tag "v${version}"
git push --tags
