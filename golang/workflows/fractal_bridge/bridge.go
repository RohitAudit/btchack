package fractal_bridge

import (
	"context"
	"log"

	"github.com/Nexus-2023/nexus-staking-oracle/common/dto"
	"github.com/Nexus-2023/nexus-staking-oracle/common/dto/config"
	"github.com/Nexus-2023/nexus-staking-oracle/core/decoders"
	"github.com/Nexus-2023/nexus-staking-oracle/core/logger"
	"github.com/Nexus-2023/nexus-staking-oracle/solgen/gen/messagegen"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

type FractalDepositBridgeExecutor struct {
	messagegen    *messagegen.Messagegen
	destinationID uint32
	eventDecoder  *decoders.DepositEventDecoder
	minter        *MintOrderCreator
}

func (f *FractalDepositBridgeExecutor) GetTaskName() string {
	return "fractal-token-bridge-executor"
}

func (f *FractalDepositBridgeExecutor) parseEvent(wLogger *logger.WrappedLogger, event types.Log) (*dto.TokenTransferEvent, bool, error) {
	messageSentEvent, err := f.messagegen.ParseMessageSent(event)
	if err != nil {
		wLogger.Error().Msgf("error in parsing event: %s", err)
		return nil, false, err
	}

	tokenTransferEvent, err := f.eventDecoder.DecodeTokenTransferEvent(wLogger, *messageSentEvent)
	if err != nil {
		wLogger.Error().Msgf("error in parsing token transfer event: %s", err)
		return nil, false, err
	}

	return tokenTransferEvent, false, nil
}

func (f *FractalDepositBridgeExecutor) executeEvent(_ context.Context, _ *logger.WrappedLogger, event *dto.TokenTransferEvent) error {
	return f.minter.CreateBRC20MintOrder(event.ReceiverAddress, event.TokenAmount)
}

func (f *FractalDepositBridgeExecutor) ExecuteEvent(ctx context.Context, eventLog types.Log) error {
	wLogger := logger.CreateWrappedLogger(
		"taskName", f.GetTaskName(), "blockNumber", eventLog.BlockNumber, "txnHash", eventLog.TxHash)

	wLogger.Info().Msgf("received event: %s", eventLog.TxHash)
	bridgeEvent, _, err := f.parseEvent(wLogger, eventLog)
	if err != nil {
		return err
	}

	return f.executeEvent(ctx, wLogger, bridgeEvent)
}

func CreateFratcalDepositBridgeExecutor(ethClient *ethclient.Client,
	cfg *config.Config, eventDecoder *decoders.DepositEventDecoder) *FractalDepositBridgeExecutor {

	messagegen, err := messagegen.NewMessagegen(
		cfg.CoreContracts.MessagingContractAddress,
		ethClient,
	)
	if err != nil {
		log.Fatalf("error in creating messaging contract binding: %s", err)
	}

	exec := &FractalDepositBridgeExecutor{
		messagegen:    messagegen,
		destinationID: cfg.FractalDepositBridgeEventTrackerConfig.DestinationID,
		minter:        CreateNewMintOrderCreator(cfg),
		eventDecoder:  eventDecoder,
	}

	return exec
}
