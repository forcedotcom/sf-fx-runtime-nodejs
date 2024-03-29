/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import { SalesforceFunction } from "./index";

export async function loadDefaultExport(
  fileUrl: string
): Promise<SalesforceFunction<unknown, unknown>> {
  // Attempt to load the default export for a given file.
  let fExports: any;

  try {
    fExports = await import(fileUrl);
  } catch (error) {
    throw new Error(
      "Could not load module referenced in 'main' field of 'package.json': " +
        error.message
    );
  }

  if (
    fExports.default &&
    fExports.default.default &&
    fExports.default.default instanceof Function
  ) {
    // CJS TypeScript exports
    return fExports.default.default;
  } else if (fExports.default && fExports.default instanceof Function) {
    // CJS JavaScript exports
    return fExports.default;
  } else if (fExports instanceof Function) {
    // ESM exports
    return fExports;
  }
  throw new Error(
    "Default export of module referenced in 'main' field of 'package.json' is not a function!"
  );
}

export async function loadUserFunctionFromDirectory(
  directory: string
): Promise<SalesforceFunction<unknown, unknown>> {
  const packageJsonPath = path.resolve(directory, "package.json");

  // Load package.json
  let packageFile;
  try {
    packageFile = await fs.readFile(packageJsonPath, "utf8");
  } catch (error) {
    throw new Error(
      "Could not read 'package.json' from project directory: " + error.message
    );
  }

  let packageJson;
  try {
    packageJson = JSON.parse(packageFile);
  } catch (error) {
    throw new Error(
      "Could not parse 'package.json' from project directory: " + error.message
    );
  }

  // Validate package.json
  if (!packageJson.main) {
    throw new Error(
      "Could not read 'main' field from 'package.json' in project directory!"
    );
  }

  const functionPath = path.resolve(directory, packageJson.main);
  // Verify existence of 'main' file
  try {
    await fs.access(functionPath);
  } catch (_err) {
    throw new Error(
      `Could not open function file specified by 'main' field from 'package.json' (${functionPath})!`
    );
  }
  const functionUrl = pathToFileURL(functionPath);

  return await loadDefaultExport(functionUrl.toString());
}
