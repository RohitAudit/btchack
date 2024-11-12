package eth

import (
	"context"
	"math/big"
	"time"

	"github.com/Nexus-2023/nexus-staking-oracle/common/dto"
	"github.com/Nexus-2023/nexus-staking-oracle/common/helper"
	"github.com/Nexus-2023/nexus-staking-oracle/common/ports"
	"github.com/Nexus-2023/nexus-staking-oracle/common/ports/persistence"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type optFunction func(e *EthereumEventListener) *EthereumEventListener

type EthereumEventListener struct {
	client                *ethclient.Client
	alerter               ports.IAlerter
	TaskManager           ports.ITaskManager
	latestBlock           *big.Int
	currentBlock          *big.Int
	executor              ports.EthereumEventExecutor
	initialEventState     *dto.EventState
	eventStatePersistence persistence.EventStateStorageController
	connTimeout           time.Duration
	taskTimeout           time.Duration
	pollingInterval       time.Duration
	contractAddress       common.Address
	topics                [][]common.Hash
}

func (e *EthereumEventListener) modifyLogger(event *zerolog.Event) *zerolog.Event {
	return event.
		Int64("blockNumber", e.currentBlock.Int64()).
		Str("taskName", e.executor.GetTaskName())
}

func (e *EthereumEventListener) getInfoLogger() *zerolog.Event {
	return e.modifyLogger(log.Info())
}

func (e *EthereumEventListener) getTraceLogger() *zerolog.Event {
	return e.modifyLogger(log.Trace())
}

func (e *EthereumEventListener) getErrorLogger() *zerolog.Event {
	return e.modifyLogger(log.Error())
}

func (e *EthereumEventListener) getClientContext(ctx context.Context) context.Context {
	ctx, _ = context.WithTimeout(ctx, e.connTimeout)
	return ctx
}

func (e *EthereumEventListener) getTaskContext(ctx context.Context) context.Context {
	ctx, _ = context.WithTimeout(ctx, e.taskTimeout)
	return ctx
}

func (e *EthereumEventListener) getLatestBlock(ctx context.Context) (*big.Int, error) {
	block, err := e.client.BlockByNumber(e.getClientContext(ctx), nil)
	if err != nil {
		return nil, err
	}

	return block.Number(), nil
}

func (e *EthereumEventListener) updateCurrentBlockNumber(ctx context.Context) error {
	for e.currentBlock.Int64() >= e.latestBlock.Int64() {
		block, err := e.getLatestBlock(ctx)
		if err != nil {
			return err
		}

		e.latestBlock = block
		if e.currentBlock.Int64() >= e.latestBlock.Int64() {
			<-time.After(e.pollingInterval)
		}
	}

	e.currentBlock = big.NewInt(min(e.currentBlock.Int64()+1, e.latestBlock.Int64()))
	return nil
}

func (e *EthereumEventListener) skipEvent(index int, eventLog types.Log) bool {
	if e.initialEventState == nil {
		return false
	}

	if e.initialEventState.BlockNumber == nil {
		return false
	}

	if e.initialEventState.BlockNumber.Uint64() > eventLog.BlockNumber {
		return true
	}

	if e.initialEventState.BlockNumber.Uint64() < eventLog.BlockNumber {
		return false
	}

	if e.initialEventState.TxnNumber == nil {
		return false
	}

	if uint(e.initialEventState.TxnNumber.Uint64()) > eventLog.TxIndex {
		return true
	}

	if uint(e.initialEventState.TxnNumber.Uint64()) < eventLog.TxIndex {
		return false
	}

	if e.initialEventState.EventIndex == nil {
		return false
	}

	if e.initialEventState.EventIndex.Int64() > int64(index) {
		return true
	}

	if e.initialEventState.EventIndex.Int64() < int64(index) {
		return false
	}

	return true
}

func (e *EthereumEventListener) fetch(ctx context.Context) error {
	e.getTraceLogger().Msgf("fetching events...: %v", e.topics)
	eventLogs, err := e.client.FilterLogs(e.getClientContext(ctx), ethereum.FilterQuery{
		FromBlock: e.currentBlock,
		ToBlock:   e.currentBlock,
		Addresses: []common.Address{e.contractAddress},
		Topics:    e.topics,
	})
	if err != nil {
		e.getErrorLogger().Msgf("error in fetching logs for task: %s", err)
		return err
	}
	extras := map[string]interface{}{
		"blockNumber": e.currentBlock.String(),
		"taskName":    e.executor.GetTaskName(),
	}

	if len(eventLogs) == 0 {
		e.getTraceLogger().Msg("no events found")
		err = e.eventStatePersistence.SetEventState(&dto.EventState{
			BlockNumber: e.currentBlock,
			TxnNumber:   nil,
			EventIndex:  nil,
		})

		if err != nil {
			e.getErrorLogger().Msgf("error in updating event index: %s", err)
			e.alerter.Alert(ctx, err, extras)
		}
	}

	for index, eventLog := range eventLogs {
		extras["txnHash"] = eventLog.TxHash.String()
		if e.skipEvent(index, eventLog) {
			e.getTraceLogger().Msgf("skipping event under txnHash[%s]", eventLog.TxHash)
			continue
		}

		err := e.executor.ExecuteEvent(e.getTaskContext(ctx), eventLog)
		if err != nil {
			e.getErrorLogger().Msgf("error in executing task: %s", err)
			e.alerter.Alert(ctx, err, extras)
		}

		err = e.eventStatePersistence.SetEventState(&dto.EventState{
			BlockNumber: e.currentBlock,
			TxnNumber:   big.NewInt(int64(eventLog.TxIndex)),
			EventIndex:  big.NewInt(int64(index)),
		})

		if err != nil {
			e.getErrorLogger().Msgf("error in updating event index: %s", err)
			e.alerter.Alert(ctx, err, extras)
		}
	}

	return nil
}

func (e *EthereumEventListener) setup() error {
	eventState, err := e.eventStatePersistence.GetEventState()
	if err != nil {
		return err
	}

	e.initialEventState = eventState

	blockNumber := eventState.BlockNumber

	// No block number defined in config or levelDB
	if eventState.BlockNumber == nil {
		var err error
		blockNumber, err = e.getLatestBlock(context.Background())
		if err != nil {
			return err
		}
	}
	e.currentBlock = blockNumber
	e.latestBlock = blockNumber
	e.getTraceLogger().Msg("last block details")
	return nil
}

func (e *EthereumEventListener) Poll(ctx context.Context) error {
	e.TaskManager.Start(ctx)
	return e.TaskManager.StartIteratively(func(ctx context.Context) time.Duration {
		if err := helper.Retry(func() error {
			return e.fetch(ctx)
		}, 3); err != nil {
			e.getErrorLogger().Msgf("error in retrying task: %s", err)
			e.alerter.Alert(ctx, err, nil)
		}

		if err := e.updateCurrentBlockNumber(ctx); err != nil {
			e.getErrorLogger().Msgf("error in updating current block number: %s", err)
			e.alerter.Alert(ctx, err, nil)
		}

		return 1 * time.Millisecond
	})
}

func CreateEthereumEventListener(ethClient *ethclient.Client, executor ports.EthereumEventExecutor,
	contractAddress common.Address, configCurrentBlockNumber int64,
	db persistence.EventStateStorage, eventPersistor persistence.EventStateStorageController,
	taskManager ports.ITaskManager, alerter ports.IAlerter, opts ...optFunction) (*EthereumEventListener, error) {

	configCurrentBlockNumberBigInt := big.NewInt(configCurrentBlockNumber)
	if configCurrentBlockNumber == -1 {
		configCurrentBlockNumberBigInt = nil
	}

	eventPersistor.SetupController(executor.GetTaskName(), configCurrentBlockNumberBigInt, db)
	listener := &EthereumEventListener{
		client:                ethClient,
		alerter:               alerter,
		contractAddress:       contractAddress,
		TaskManager:           taskManager,
		latestBlock:           nil,
		currentBlock:          nil,
		executor:              executor,
		eventStatePersistence: eventPersistor,
		connTimeout:           time.Second * 5,
		taskTimeout:           time.Second * 60,
	}

	for _, opt := range opts {
		listener = opt(listener)
	}

	err := listener.setup()
	return listener, err
}
