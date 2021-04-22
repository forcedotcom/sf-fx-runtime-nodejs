import { ReferenceId } from "../types/reference-id";

export interface RecordDelete {
  type: string;
  id: string;

  [key: string]: string | number | boolean | Date | ReferenceId;
}
