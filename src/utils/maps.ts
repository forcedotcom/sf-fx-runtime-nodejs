import { Record } from "../sdk-interface-v1";

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
