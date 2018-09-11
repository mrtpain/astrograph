Stellar GraphQL Server
======================

# Installation

`git clone https://github.com/mobius-network/astrograph && cd astrograph && yarn`

# Configuration

You need to have access to Stellar Core database:

* `DB`
* `DBPORT`
* `DBHOST`
* `DBUSER`
* `DBPASSWORD`

Settings:

* `DEBUG_LEDGER` - start ingest from specific ledger (debug purposes).
* `INGEST_INTERVAL` - poll db every ms (2000 by default), useful while debugging.

# Running

`yarn run dev` or `yarn run prod`.

We also have [Dockerfile](Dockerfile).

# Development

During local development, you will need to obtain Stellar Core database. The easiest way is to run Stellar Core node in Docker (check [docker-stellar-core](https://github.com/mobius-network/docker-stellar-core)). After you will have non-empty database, you may use `DEBUG_LEDGER` argument. Using this argument, you can ask Astrograph to emit events from specific point in the past.

# Usage

Open `http://localhost:4000` or use any GraphQL client. Schema is available in [type_defs.ts](src/schema/type_defs.ts).

Queries and subscriptions are available for:

* Accounts and signers.
* Trust lines.
* Data entries.

# Example queries

## Getting accounts

```graphql
account(id: "GBRWYDXFSDVIVAGGLDY5P7GH5NVMWRCGP6PUHG6ZDN5ID32FGGXEX6UJ") {
  flags {
    authRequired
    authRevokable
    authImmutable
  }
  thresholds {
    masterWeight
    low
    medium
    high
  }
  id
  inflationDest
  sequenceNumber
  data {
    name
    value
  }
  signers {
    signer { id }
  }
  trustLines {
    account {
      id
    }
    asset {
      code
      native
      issuer
    }
  }
  ledger {
    seq
    header {
      ledgerVersion
    }
  }
}
```

There is corresponding query for multiple accounts:

```graphql
query {
  accounts(id: ["GBRWYDXFSDVIVAGGLDY5P7GH5NVMWRCGP6PUHG6ZDN5ID32FGGXEX6UJ", "GAAAADNFT4FLC7M52WQIOU5MZOTYHDH34P4TZTGRC4IMHZKHDKKVPOMB"]) {
    # ...
  }
}
```

## Getting account balances

```graphql
query {
  trustLines(id:"GAAACK4ZLACKVOXOLCDO5XSK2NX7SOG2WUZPJOJK7CP6WV4FLL6GBGOD") {
    authorized
    balance
    asset {
      code
      native
    }
  }
}
```

Response will be:

```graphql
{
  "data": {
    "trustLines": [
      {
        "authorized": true,
        "balance": "99.9999700",
        "asset": {
          "code": "XLM",
          "native": true
        }
      },
      {
        "authorized": true,
        "balance": "0.0000000",
        "asset": {
          "code": "INR",
          "native": false
        }
      }
    ]
  }
}
```

Please note that native balance is marked with boolean flag. Balance itself is returned as string as it is 64-bit BigInt value while JavaScript can hold 56-bit float maximum.

## Other entities

You can query DataEntries, Ledgers, Transactions (by hash) and account Signers the same way.

# Subscriptions

Generally, you can subscribe to three types of events: `CREATE`, `UPDATE` and `REMOVE`. Most of events has two major arguments:

* `mutationType[]` for event type(s) to fire on.
* `idEq` and `idIn[]` for account ID.

Typical event returns:

* `mutationType` describing the specific event.
* `values` holding new values for changed entity. Null for REMOVE-type events.
* Key fields: `id` for account, `accountID` + `asset` for trust line, etc.

## Awaiting for missing account to be created

```graphql
subscription {
  account(args: { idEq: "GAK3NSB43EVCZKDH4PYGJPCVPOYZ7X7KIR3ZTWSYRKRMJWGG5TABM6TH", mutationTypeEq: [CREATE] }) {
   	id
    mutationType
    values {
      homeDomain
      thresholds {
        low
        medium
        high
        masterWeight
      }
    }
  }
}
```

## Monitoring account balance

```graphql
subscription {
  trustLine(args: { mutationTypeEq: [UPDATE], idEq: "GBILND6UWKZCYUE7YRZHS5DBEYM6U4R4SWO73PODLYZVXNKHS4NVSE5X" }) {
    mutationType
    accountID
    values {
      native
      balance
    }
  }
}
```

# Examples

Check `examples` folder.

To show all account trust lines:

```
yarn run examples/balance-cli.ts GAAAADNFT4FLC7M52WQIOU5MZOTYHDH34P4TZTGRC4IMHZKHDKKVPOMB
```

To monitor account trust line changes:

```
yarn run examples/balance-monitor-cli.ts GAAAADNFT4FLC7M52WQIOU5MZOTYHDH34P4TZTGRC4IMHZKHDKKVPOMB
```

All examples assuming that Astrograph is running on localhost:4000. You can pass URL as secondary param.



# Benchmark

We have not done full stress test yet. Besides that, it looks like server on MBP mid 14 with 16GB RAM survives approx 7k concurrent connections with no losses. Check [benchmark script](benchmark/index.ts) for details. To implement fully functional test, we need to implement dedicated stress test mode.

# Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/mobius-network/astrograph. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

# License

The project is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
