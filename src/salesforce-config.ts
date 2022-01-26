/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import toml from "@iarna/toml";
import semver from "semver";
import { promises as fs } from "fs";

/**
 * SalesforceConfig represents the ["com.salesforce"] portion of a project.toml
 */
export interface SalesforceConfig {
  schemaVersion: string;
  id: string;
  description?: string;
  type: string;
  restApiVersion: string;
}

export async function readSalesforceConfig(
  tomlPath: string
): Promise<SalesforceConfig> {
  let tomlContents: Buffer;
  try {
    tomlContents = await fs.readFile(tomlPath);
  } catch (e) {
    throw new Error(`Could not open SalesforceConfig at ${tomlPath}: ${e}`);
  }
  let project: Record<string, any>;
  try {
    project = await toml.parse.async(tomlContents.toString());
  } catch (e) {
    throw new Error(`Could not parse SalesforceConfig in ${tomlPath}: ${e}`);
  }
  const salesforceConfig = project["com"]?.["salesforce"];

  let restApiVersion = salesforceConfig?.["rest-api-version"];
  if (!restApiVersion) {
    console.log(
      "DEPRECATION NOTICE: com.salesforce.rest-api-version is not defined in project.toml and has been defaulted to '53.0'. This field will be required in a future release."
    );
    restApiVersion = "53.0";
  }

  if (
    !semver.satisfies(
      semver.coerce(restApiVersion),
      `>=${semver.coerce("53.0")}`
    )
  ) {
    throw new Error(
      `Salesforce Rest API Version ${restApiVersion} is not supported. Please change \`com.salesforce.rest-api-version\` in project.toml to "53.0" or newer.`
    );
  }

  return {
    schemaVersion: salesforceConfig?.["schema-version"],
    id: salesforceConfig?.id,
    description: salesforceConfig?.description,
    type: salesforceConfig?.type,
    restApiVersion,
  };
}
