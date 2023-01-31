/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const mapHandler = {
  get(obj: any, prop: string | symbol): any {
    const key = prop.toString().toLowerCase();
    return obj[key];
  },

  set(obj: any, prop: string | symbol, value: any): boolean {
    obj[prop.toString().toLowerCase()] = value;
    return true;
  },
};

export function createCaseInsensitiveMap(map: any): any {
  const fields = new Proxy({}, mapHandler);
  Object.keys(map).forEach((key) => (fields[key] = map[key]));

  return fields;
}
