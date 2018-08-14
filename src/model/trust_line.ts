import { Asset } from "./asset";
import { TrustLineFlags } from "./trust_line_flags";

export class TrustLine {
  public accountid: string;
  public asset: Asset;
  public limit: number;
  public balance: number;
  public flags: TrustLineFlags;
  public lastModified: number;

  constructor(data: {
    accountid: string;
    assettype: number;
    issuer: string;
    assetcode: string;
    tlimit: number;
    balance: number;
    flags: number;
    lastmodified: number;
  }) {
    this.accountid = data.accountid;
    this.limit = data.tlimit;
    this.balance = data.balance;
    this.lastModified = data.lastmodified;

    this.flags = new TrustLineFlags(data.flags);
    this.asset = new Asset(data.assettype, data.assetcode, data.issuer);
  }
}
