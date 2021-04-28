import { ReferenceId } from "../types/reference-id";

export interface RecordUpdate {
  id: ReferenceId;
  type: string;

  [key: string]: string | string[] | number | boolean | Date;
}
