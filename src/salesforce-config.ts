/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import toml from "@iarna/toml";
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
  return {
    schemaVersion: salesforceConfig?.["schema-version"],
    id: salesforceConfig?.id,
    description: salesforceConfig?.description,
    type: salesforceConfig?.type,
    restApiVersion: salesforceConfig?.["rest-api-version"] || "53.0",
  };
}
