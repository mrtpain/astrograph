import { IDatabase } from "pg-promise";
import { unique } from "../common/util/array";
import { DataEntry } from "../model";

const sql = {
  selectAccountData: "SELECT * FROM accountdata WHERE accountid = $1 ORDER BY dataname",
  selectAccountsDataIn: "SELECT * FROM accountdata WHERE accountid IN ($1:csv) ORDER BY dataname"
};

export default class DataEntriesRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAllByAccountID(id: string): Promise<DataEntry[]> {
    const res = await this.db.manyOrNone(sql.selectAccountData, id);
    return res.map(e => new DataEntry(e));
  }

  public async findAllByAccountIDs(ids: string[]): Promise<DataEntry[][]> {
    const res = await this.db.manyOrNone(sql.selectAccountsDataIn, [ids.filter(unique)]);
    return ids.map(id => res.filter(r => r.accountid === id).map(s => new DataEntry(s)));
  }
}
