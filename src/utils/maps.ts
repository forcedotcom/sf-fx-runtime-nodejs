/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Record } from "sf-fx-sdk-nodejs";

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

export function createCaseInsensitiveRecord(record: any): Record {
  const fields = createCaseInsensitiveMap(record);
  const type = record.attributes.type;

  delete fields["attributes"];

  return {
    type,
    fields,
  };
}

export function createCaseInsensitiveMap(map: any): any {
  const fields = new Proxy({}, mapHandler);
  Object.keys(map).forEach((key) => (fields[key] = map[key]));

  return fields;
}
