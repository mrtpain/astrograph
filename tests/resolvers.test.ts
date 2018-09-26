import resolver from "../src/schema/resolvers/account";
import AccountsRepo from "../src/repo/accounts";
import { Account } from "../src/model";

AccountsRepo.findByID.mockImplementation(accountID => {
  return new Account({
    accountid: accountID,
    balance: "10",
    seqnum: "423553",
    numsubentries: 0,
    inflationdest: "",
    homedomain: "",
    thresholds: "",
    flags: 0,
    lastmodified: -1,
  });
});

test("returns account by id", () => {
});
