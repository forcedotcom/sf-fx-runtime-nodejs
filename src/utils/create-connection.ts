/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from "jsforce2/lib/connection.js";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const pkgPath = join(
  fileURLToPath(import.meta.url),
  "..",
  "..",
  "..",
  "package.json"
);
const pkg = readFileSync(pkgPath, "utf8");
const clientVersion = JSON.parse(pkg).version;

export type CreateConnectionOptions = {
  accessToken: string;
  instanceUrl: string;
  version: string;
};

export function createConnection(options: CreateConnectionOptions) {
  const { accessToken, instanceUrl, version } = options;
  return new Connection({
    accessToken,
    instanceUrl,
    version,
    callOptions: {
      client: `sf-fx-runtime-nodejs-sdk-impl-v1:${clientVersion}`,
    },
  });
}
