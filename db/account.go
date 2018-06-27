package db

import (
	b64 "encoding/base64"
	"gopkg.in/mgutz/dat.v1"
	"github.com/stellar/go/xdr"
	"github.com/mobius-network/astrograph/util"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Returns single account or nil
func QueryAccount(id string) (*model.Account, error) {
	//row := config.DB.QueryRow(selectAccount+" = $1", id)
	var a model.Account

	err := config.DB.
		Select("*").
		From("accounts").
		Where("accountid = $1", id).
		QueryStruct(&a)

	switch {
	case err == dat.ErrNotFound:
		return nil, nil
	case err != nil:
		return nil, err
	default:
		return &a, nil
	}
}

// Returns a set of accounts by id
func QueryAccounts(id []string) ([]*model.Account, error) {
	var accounts []*model.Account

	err := config.DB.
		Select("*").
		From("accounts").
		Where("accountid IN $1", id).
		QueryStructs(&accounts)

	if err != nil { return nil, err }

	// for _, account = range accounts {
	// 	populate(*account)
	// }

	return accounts, nil
	// result := make([]model.Account, 0)
	//
	// if len(id) == 0 { return result, nil }
	//
	// rows, err := config.DB.Query(selectAccount + sqlIn(id))
	// if err != nil {
	// 	return nil, err
	// }
	//
	// defer rows.Close()
	// for rows.Next() {
	// 	a, err := scanAccount(rows)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	result = append(result, *a)
	// }
	//
	// if err = rows.Err(); err != nil {
	// 	return nil, err
	// }
	//
	// return result, nil
}

// Fetch account data from request
func scanAccount(r scanner) (*model.Account, error) {
	a := model.Account{}

	var thresholds string
	var flags int

	err := r.Scan(
		&a.ID,
		&a.Balance,
		&a.SequenceNumber,
		&a.NumSubentries,
		&a.InflationDest,
		&a.HomeDomain,
		&thresholds,
		&flags,
		&a.LastModified,
	)

	if err != nil { return nil, err }

	a.Balance = a.Balance / model.BalancePrecision
	a.Flags = fetchFlags(a, flags)

	a.Thresholds, err = fetchThresholds(a, thresholds)
	if err != nil { return nil, err }

	return &a, nil
}

func fetchFlags(a model.Account, flags int) (model.AccountFlags) {
	f := model.AccountFlags{
		AuthRequired: flags & int(xdr.AccountFlagsAuthRequiredFlag) == 1,
		AuthRevokable: flags & int(xdr.AccountFlagsAuthRevocableFlag) == 1,
		AuthImmutable: flags & int(xdr.AccountFlagsAuthImmutableFlag) == 1,
	}

	f.ID = util.SHA1(a.ID, "flags")

	return f
}

func fetchThresholds(a model.Account, thresholds string) (model.AccountThresholds, error) {
	t, err := b64.StdEncoding.DecodeString(thresholds)
	if (err != nil) { return model.AccountThresholds{}, err }

	tr := model.AccountThresholds{
		MasterWeight: int(t[xdr.ThresholdIndexesThresholdMasterWeight]),
		Low: int(t[xdr.ThresholdIndexesThresholdLow]),
		Medium: int(t[xdr.ThresholdIndexesThresholdMed]),
		High: int(t[xdr.ThresholdIndexesThresholdHigh]),
	}

	tr.ID = util.SHA1(a.ID, "thresholds")

	return tr, nil
}
