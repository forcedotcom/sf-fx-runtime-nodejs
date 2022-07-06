#!/usr/bin/env bash
set -euo pipefail

# The package filename cannot be customized for npm pack.
# We need to figure out the file it will write to on our own:
name=$(jq -r '.name | gsub("@";"") | gsub("/";"-")' package.json)
version=$(jq -r .version package.json)
package_filename="${name}-${version}.tgz"

if [[ -f "${package_filename}" ]]; then
	echo "Packaged tarball already exists, aborting..."
	exit 1
fi

echo "Building package..."
npm run build

echo "Running npm publish..."
npm publish

echo "Creating git tag..."
git tag "v${version}"
git push --tags

echo "Cleaning up..."
rm "${package_filename}"
