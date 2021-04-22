import { ReferenceId } from "../types/reference-id";

export interface RecordCreate {
  type: string;
  records?: string[];

  [key: string]: string | string[] | number | boolean | Date | ReferenceId;
}
