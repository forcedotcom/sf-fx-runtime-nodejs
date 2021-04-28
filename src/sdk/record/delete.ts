import { ReferenceId } from "../types/reference-id";

export interface RecordDelete {
  id: ReferenceId;
  type: string;

  [key: string]: string | number | boolean | Date;
}
