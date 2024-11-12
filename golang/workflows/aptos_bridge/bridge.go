package aptos_bridge

import (
	"context"
	"fmt"
	"log"
	"os/exec"
	"strconv"

	"github.com/Nexus-2023/nexus-staking-oracle/common/dto"
	"github.com/Nexus-2023/nexus-staking-oracle/common/dto/config"
	"github.com/Nexus-2023/nexus-staking-oracle/common/errors"
	"github.com/Nexus-2023/nexus-staking-oracle/core/accounts"
	"github.com/Nexus-2023/nexus-staking-oracle/core/decoders"
	"github.com/Nexus-2023/nexus-staking-oracle/core/logger"
	aptos_lru "github.com/Nexus-2023/nexus-staking-oracle/pkg/client/aptos"
	"github.com/Nexus-2023/nexus-staking-oracle/solgen/gen/messagegen"
	"github.com/aptos-labs/aptos-go-sdk"
	"github.com/aptos-labs/aptos-go-sdk/bcs"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

type AptosDepositBridgeExecutor struct {
	aptosClient   *aptos_lru.LRUAptosClient
	txnSigner     *aptos.Account
	moduleAddress *aptos.AccountAddress
	messagegen    *messagegen.Messagegen
	eventDecoder  *decoders.DepositEventDecoder
	destinationID uint32
}

func (a *AptosDepositBridgeExecutor) GetTaskName() string {
	return "aptos-token-bridge-executor"
}

func (a *AptosDepositBridgeExecutor) createFunctionArgument(argType string, arg string) string {
	return fmt.Sprintf("%s:%s", argType, arg)
}

func (a *AptosDepositBridgeExecutor) transferTokenCmd(wLogger *logger.WrappedLogger, bridgeEvent *dto.TokenTransferEvent) error {
	cmd := exec.Command("/Users/shivansh.anand/.local/bin/rooch", "move", "run",
		"--function", fmt.Sprintf("%s::bridge_receiver::receive_message", a.moduleAddress.String()),
		"--sender", "default",
		"--args", a.createFunctionArgument("u64", strconv.Itoa(int(bridgeEvent.DestID))),
		"--args", a.createFunctionArgument("u8", strconv.Itoa(int(bridgeEvent.EventType.Int64()))),
		"--args", a.createFunctionArgument("address", bridgeEvent.ReceiverAddress),
		"--args", a.createFunctionArgument("u256", bridgeEvent.TokenAmount.String()),
	)

	// Run the command and capture the output
	output, err := cmd.CombinedOutput()
	if err != nil {
		return err
	}

	wLogger.Info().Msgf("output: %s", string(output))
	return nil
}

func (a *AptosDepositBridgeExecutor) transferTokens(wLogger *logger.WrappedLogger, bridgeEvent *dto.TokenTransferEvent) error {
	destinationIDBytes, err := bcs.SerializeU64(uint64(bridgeEvent.DestID))
	if err != nil {
		wLogger.Error().Msgf("error in parsing destID: %s", err)
		return errors.AptosBcsSerializationError(err)
	}

	txnTypeBytes, err := bcs.SerializeU8(uint8(bridgeEvent.EventType.Uint64()))
	if err != nil {
		wLogger.Error().Msgf("error in parsing txn Type: %s", err)
		return errors.AptosBcsSerializationError(err)
	}

	amountBytes, err := bcs.SerializeU256(*bridgeEvent.TokenAmount)
	if err != nil {
		wLogger.Error().Msgf("error in parsing amount: %s", err)
		return errors.AptosBcsSerializationError(err)
	}

	aptosAccountAddress, err := accounts.NewAptosAccount(bridgeEvent.ReceiverAddress)
	if err != nil {
		wLogger.Error().Msgf("error in creating account from receiver: %s", err)
		return errors.AptosBcsSerializationError(err)
	}

	destinationAddressBytes, err := bcs.Serialize(aptosAccountAddress)
	if err != nil {
		wLogger.Error().Msgf("error in parsing destination_address: %s", err)
		return errors.AptosBcsSerializationError(err)
	}

	payload := aptos.TransactionPayload{
		Payload: &aptos.EntryFunction{
			Module: aptos.ModuleId{
				Address: *a.moduleAddress,
				Name:    "bridge_receiver",
			},
			Function: "receive_message",
			ArgTypes: []aptos.TypeTag{},
			Args: [][]byte{
				destinationIDBytes,
				txnTypeBytes,
				destinationAddressBytes,
				amountBytes,
			},
		},
	}

	result, err := a.aptosClient.BuildSignAndSubmitTransaction(a.txnSigner, payload)
	if err != nil {
		wLogger.Error().Msgf("error in submitting transaction: %s", err)
		return errors.AptosTransactionError(err)
	}

	txnData, err := a.aptosClient.WaitForTransaction(result.Hash)
	if err != nil {
		wLogger.
			Error().
			Str("aptosTxnHash", result.TxnHash()).
			Msgf("error in finalizing transaction: %s", err)
		return errors.AptosTransactionError(err)
	} else if !txnData.Success {
		wLogger.
			Error().
			Str("aptosTxnHash", txnData.TxnHash()).
			Msgf("failed to execute transaction: %s", txnData.VmStatus)
		return errors.AptosTransactionError(fmt.Errorf("%s", txnData.VmStatus))
	} else {
		wLogger.Info().Msgf("Successful transaction: %s", txnData.TxnHash())
	}

	return nil
}

func (a *AptosDepositBridgeExecutor) parseEvent(wLogger *logger.WrappedLogger, event types.Log) (*dto.TokenTransferEvent, bool, error) {
	messageSentEvent, err := a.messagegen.ParseMessageSent(event)
	if err != nil {
		wLogger.Error().Msgf("error in parsing event: %s", err)
		return nil, false, err
	}

	tokenTransferEvent, err := a.eventDecoder.DecodeTokenTransferEvent(wLogger, *messageSentEvent)
	if err != nil {
		wLogger.Error().Msgf("error in parsing token transfer event: %s", err)
		return nil, false, err
	}

	return tokenTransferEvent, false, nil
}

func (a *AptosDepositBridgeExecutor) ExecuteEvent(ctx context.Context, eventLog types.Log) error {
	wLogger := logger.CreateWrappedLogger(
		"taskName", a.GetTaskName(), "blockNumber", eventLog.BlockNumber, "txnHash", eventLog.TxHash)

	wLogger.Info().Msgf("received event: %s", eventLog.TxHash)
	bridgeEvent, skip, err := a.parseEvent(wLogger, eventLog)
	if err != nil {
		return err
	} else if skip {
		return nil
	}

	return a.transferTokenCmd(wLogger, bridgeEvent)
}

func CreateAptosDepositBridgeExecutor(ethClient *ethclient.Client,
	aptosClient *aptos_lru.LRUAptosClient, eventDecoder *decoders.DepositEventDecoder,
	cfg *config.Config, signerAccount *aptos.Account,
	moduleAddress *aptos.AccountAddress) *AptosDepositBridgeExecutor {

	gen, err := messagegen.NewMessagegen(
		cfg.CoreContracts.MessagingContractAddress,
		ethClient,
	)
	if err != nil {
		log.Fatalf("error in creating messaging contract binding: %s", err)
	}

	exec := &AptosDepositBridgeExecutor{
		aptosClient:   aptosClient,
		eventDecoder:  eventDecoder,
		messagegen:    gen,
		moduleAddress: moduleAddress,
		txnSigner:     signerAccount,
		destinationID: cfg.AptosDepositBridgeEventTrackerConfig.DestinationID,
	}

	return exec
}
