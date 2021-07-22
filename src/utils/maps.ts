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

const CaseInsensitiveIdMapHandler = {
  get(obj: any, prop: string | symbol): any {
    const key = prop.toString().toLowerCase();
    if (key === "id") {
      return obj[key];
    } else {
      return obj[prop];
    }
  },

  set(obj: any, prop: string | symbol, value: any): boolean {
    const key = prop.toString().toLowerCase();
    if (key === "id") {
      if (obj[key]) {
        throw new Error("Duplicate id property");
      }

      obj[key] = value;
    } else {
      obj[prop] = value;
    }
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

export function createCaseInsensitiveIdMap(map: any): any {
  const fields = new Proxy({}, CaseInsensitiveIdMapHandler);
  Object.keys(map).forEach((key) => (fields[key] = map[key]));

  return fields;
}
