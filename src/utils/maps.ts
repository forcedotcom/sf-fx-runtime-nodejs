import { Record } from "../sdk-interface-v1";

const mapHandler = {
  get(obj: any, prop: string | symbol): any {
    const key = prop.toString().toLowerCase();
    return obj[key];
  },

  // TODO: Validate input for white space or other invalid chars
  set(obj: any, prop: string | symbol, value: any): boolean {
    obj[prop.toString().toLowerCase()] = value;
    return true;
  },
};

export function createCaseInsensitiveMap(record: any): Record {
  const fields = new Proxy({}, mapHandler);

  Object.keys(record).forEach((key) => {
    if (key === "attributes") return;
    fields[key] = record[key];
  });

  return {
    type: record.attributes.type,
    fields,
  };
}
