export interface RecordCreate {
  type: string;

  [key: string]: string | string[] | number | boolean | Date;
}
