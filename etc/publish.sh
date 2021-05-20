#!/usr/bin/env bash
set -euo pipefail

bucket_name=${1:-"sf-fx-nodejs-internal-early-access"}
aws_cli_profile=${2:-"sf-fx-ea"}

# The package filename cannot be customized for npm pack.
# We need to figure out the file it will write to on our own:
name=$(jq -r .name package.json)
version=$(jq -r .version package.json)
package_filename="${name}-${version}.tgz"

if [[ -f "${package_filename}" ]]; then
	echo "Packaged tarball already exists, aborting..."
	exit 1
fi

if aws s3api head-object --bucket "${bucket_name}" --key "${package_filename}" --profile "${aws_cli_profile}" > /dev/null; then
	echo "$(tput setaf 1)${package_filename} already exists in bucket ${bucket_name}!$(tput sgr0)"
	read -r -p "Overwriting the file might have serious consequences, do you want to continue anyway? [y/N] " continue_response
	case "${continue_response}" in
	  [yY])
		;;
	  *)
		exit 0
		;;
	esac
fi

echo "Building package..."
npm run build

echo "Running npm pack..."
npm pack

echo "Pushing packaged tarball to s3 bucket:"
aws s3 cp "${package_filename}" "s3://${bucket_name}" --profile "${aws_cli_profile}"

echo "Creating git tag..."
git tag "v${version}"
git push --tags

echo "Cleaning up..."
rm "${package_filename}"
