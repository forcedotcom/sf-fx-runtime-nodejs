import { ReferenceId } from "../types/reference-id";

export interface RecordCreate {
  id: ReferenceId;
  type: string;

  [key: string]: string | string[] | number | boolean | Date;
}
