import { ReferenceId } from "../types/reference-id";

export interface RecordModification {
  type: string;
  id: string;

  [key: string]: string | string[] | number | boolean | Date | ReferenceId;
}
