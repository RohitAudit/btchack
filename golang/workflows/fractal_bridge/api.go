package fractal_bridge

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"math/big"
	"net/http"

	"github.com/Nexus-2023/nexus-staking-oracle/common/dto/config"
	"github.com/Nexus-2023/nexus-staking-oracle/common/errors"
	"github.com/rs/zerolog/log"
)

type MintOrderCreator struct {
	url             string
	bearerToken     string
	deployerAddress string
	deployerPubKey  string
	devAddress      string
	brc20Ticker     string
}

func (m *MintOrderCreator) CreateBRC20MintOrder(receiverAddress string, amount *big.Int) error {

	// Define the request payload as a map
	payload := map[string]interface{}{
		"deployerAddress": m.deployerAddress,
		"deployerPubkey":  m.deployerPubKey,
		"receiveAddress":  receiverAddress,
		"feeRate":         1,
		"outputValue":     546,
		"devAddress":      m.deployerAddress,
		"devFee":          0,
		"brc20Ticker":     m.brc20Ticker,
		"brc20Amount":     amount.Int64(),
	}

	// Encode the payload to JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Error().Msgf("Error encoding JSON: %s", err)
		return err
	}

	// Create a new POST request with JSON body
	req, err := http.NewRequest("POST", m.url+"inscribe/order/create/brc20-5byte-mint", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Error().Msgf("Error creating request: %s", err)
		return err
	}

	// Set headers
	req.Header.Set("Authorization", "Bearer "+m.bearerToken)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error().Msgf("Error making request: %s", err)
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Error().Msgf("Request failed with status: %s\n", resp.Status)
		return errors.FractalTransactionNotSuccess
	}

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error().Msgf("error in reading response body: %s", err)
		return err
	}

	log.Info().Msgf("request was successful: %s", string(respBody))
	return nil
}

func CreateNewMintOrderCreator(cfg *config.Config) *MintOrderCreator {
	return &MintOrderCreator{
		url:             cfg.FractalDepositBridgeEventTrackerConfig.UnisatAPIURL,
		bearerToken:     cfg.FractalDepositBridgeEventTrackerConfig.AuthToken,
		deployerAddress: cfg.FractalDepositBridgeEventTrackerConfig.DeployerAddress,
		deployerPubKey:  cfg.FractalDepositBridgeEventTrackerConfig.DeployerPubkey,
		devAddress:      cfg.FractalDepositBridgeEventTrackerConfig.DeployerAddress,
		brc20Ticker:     cfg.FractalDepositBridgeEventTrackerConfig.BRC20Ticker,
	}
}
