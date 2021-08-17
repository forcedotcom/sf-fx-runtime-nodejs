import * as fs from "fs";
import * as path from "path";
import { SalesforceFunction } from "sf-fx-sdk-nodejs";

export async function loadDefaultExport(
  directory: string,
  main: string
): Promise<SalesforceFunction<unknown, unknown>> {
  // Load default export of module defined in 'main' field of 'package.json'
  let defaultExport;
  try {
    defaultExport = await import(path.join(directory, main));

    // Allows to find default export from TypeScript builds
    if (defaultExport.default && defaultExport.default instanceof Function)
      defaultExport = defaultExport.default;
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      throw new Error(
        "Could not load module referenced in 'main' field of 'package.json': " +
          error.message
      );
    } else {
      throw error;
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

export async function loadUserFunctionFromDirectory(
  directory: string
): Promise<SalesforceFunction<unknown, unknown>> {
  const packageJsonPath = path.join(directory, "package.json");

  // Load package.json
  let packageFile;
  try {
    packageFile = await fs.readFileSync(packageJsonPath);
  } catch (error) {
    throw new Error(
      "Could not read 'package.json' from project directory: " + error.message
    );
  }

  let packageJson;
  try {
    packageJson = JSON.parse(packageFile)
  } catch (error) {
    throw new Error(
      "Could not parse 'package.json' from project directory: " + error.message
    )
  }


  // Validate package.json
  if (!packageJson.main) {
    throw new Error(
      "Could not read 'main' field from 'package.json' in project directory!"
    );
  }

  return await loadDefaultExport(directory, packageJson.main);
}
