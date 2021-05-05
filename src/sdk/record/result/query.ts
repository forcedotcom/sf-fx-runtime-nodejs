export class RecordQueryResult {
  readonly done: boolean;
  readonly totalSize: number;
  readonly _nextRecordsUrl?: string;
  readonly records: any[];

  constructor(
    done: boolean,
    totalSize: number,
    nextRecordsUrl: string,
    records: any[]
  ) {
    this.done = done;
    this.totalSize = totalSize;
    this._nextRecordsUrl = nextRecordsUrl;
    this.records = records;
  }
}
