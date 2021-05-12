import * as path from "path";
import { SalesforceFunction } from "./sdk-interface-v1";

export function loadUserFunctionFromDirectory(
  directory: string
): SalesforceFunction<unknown, unknown> {
  const packageJsonPath = path.join(directory, "package.json");

  // Load package.json
  let packageJson;
  try {
    packageJson = require(packageJsonPath);
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      throw new Error(
        "Could not load 'package.json' from project directory: " + error.message
      );
    }
  }

  // Validate package.json
  if (!packageJson.main) {
    throw new Error(
      "Could not read 'main' field from 'package.json' in project directory!"
    );
  }

  // Load default export of module defined in 'main' field of 'package.json'
  let defaultExport;
  try {
    defaultExport = require(path.join(directory, packageJson.main));
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      throw new Error(
        "Could not load module referenced in 'main' field of 'package.json': " +
          error.message
      );
    }
  }

  // Validate default export
  if (!(defaultExport instanceof Function)) {
    throw new Error(
      "Default export of module referenced in 'main' field of 'package.json' is not a function!"
    );
  }

  return defaultExport;
}
