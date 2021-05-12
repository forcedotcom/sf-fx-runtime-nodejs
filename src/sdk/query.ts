import {RecordQueryResult} from "../sdk-interface-v1";

export class RecordQueryResultImpl implements RecordQueryResult {
  readonly done: boolean;
  readonly totalSize: number;
  readonly records: any[];
  readonly nextRecordsUrl?: string;

  constructor(
    done: boolean,
    totalSize: number,
    nextRecordsUrl: string,
    records: any[]
  ) {
    this.done = done;
    this.totalSize = totalSize;
    this.nextRecordsUrl = nextRecordsUrl;
    this.records = records;
  }
}
