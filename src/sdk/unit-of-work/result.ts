import { ReferenceId } from "../../sdk-interface-v1";

export class UnitOfWorkResult {
  private results: {
    [key: string]: RecordCreateResult | RecordUpdateResult | RecordDeleteResult;
  };

  getRecord(id: ReferenceId): any {
    return this.results[id];
  }
}
