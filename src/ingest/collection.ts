import stellar from "stellar-base";
import { AccountEntry, AccountEntryKey, EntryType, TrustLineEntry, TrustLineEntryKey } from "../model";

export type Entry = AccountEntry | AccountEntryKey | TrustLineEntry | TrustLineEntryKey;

// Collection of ledger changes loaded from transaction metas, contains data only from ledger.
export class Collection extends Array<Entry> {
  // Concats parsed stellar.xdr.DataEntryChange[] to array
  public concatXDR(xdr: any) {
    for (const change of xdr) {
      this.pushXDR(change);
    }
  }

  // Pushes parsed stellar.xdr.DataEntryChange to current array
  public pushXDR(xdr: any) {
    const t = stellar.xdr.LedgerEntryChangeType;

    switch (xdr.switch()) {
      case t.ledgerEntryCreated():
        this.fetchCreateUpdate(xdr.created().data(), EntryType.Create);
        break;

      case t.ledgerEntryUpdated():
        this.fetchCreateUpdate(xdr.updated().data(), EntryType.Update);
        break;

      case t.ledgerEntryRemoved():
        this.fetchRemove(xdr.removed());
        break;
    }
  }

  private fetchCreateUpdate(xdr: any, entryType: EntryType) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEntry(entryType, xdr.account());
        break;
      case t.trustline():
        this.pushTrustLineEntry(entryType, xdr.trustLine());
        break;
    }
  }

  private fetchRemove(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEntryKey(xdr.account());
        break;
      case t.trustline():
        this.pushTrustLineEntryKey(xdr.trustLine());
        break;
    }
  }

  private pushAccountEntry(entryType: EntryType, xdr: any) {
    this.push(AccountEntry.buildFromXDR(entryType, xdr));
  }

  private pushAccountEntryKey(xdr: any) {
    this.push(AccountEntryKey.buildFromXDR(EntryType.Remove, xdr));
  }

  private pushTrustLineEntry(entryType: EntryType, xdr: any) {
    this.push(TrustLineEntry.buildFromXDR(entryType, xdr));
  }

  private pushTrustLineEntryKey(xdr: any) {
    this.push(TrustLineEntryKey.buildFromXDR(EntryType.Remove, xdr));
  }
}
