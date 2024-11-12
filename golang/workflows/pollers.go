package eth

import (
	"context"

	"github.com/Nexus-2023/nexus-staking-oracle/common/dto/config"
	"github.com/Nexus-2023/nexus-staking-oracle/common/ports"
	"github.com/Nexus-2023/nexus-staking-oracle/core/accounts"
	"github.com/Nexus-2023/nexus-staking-oracle/core/async_task_manager"
	"github.com/Nexus-2023/nexus-staking-oracle/core/decoders"
	"github.com/Nexus-2023/nexus-staking-oracle/core/event_streamer/eth"
	"github.com/Nexus-2023/nexus-staking-oracle/core/event_streamer/event_state"
	"github.com/Nexus-2023/nexus-staking-oracle/core/persistence"
	"github.com/Nexus-2023/nexus-staking-oracle/oracle/workflows/eth/executors/aptos_bridge"
	aptos_lru "github.com/Nexus-2023/nexus-staking-oracle/pkg/client/aptos"
	"github.com/aptos-labs/aptos-go-sdk"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rs/zerolog/log"
)

func SetupAptosDepositBridgeEventListener(ctx context.Context, ethClient *ethclient.Client,
	aptosClient *aptos_lru.LRUAptosClient, eventDecoder *decoders.DepositEventDecoder,
	signerAccount *aptos.Account, cfg *config.Config, db *persistence.DB,
	alerter ports.IAlerter) *eth.EthereumEventListener {
	stateController := event_state.NewEventStatePersistence()
	taskManager := async_task_manager.CreateAsyncTaskManager()

	moduleAddress, err := accounts.NewAptosAccount(cfg.AptosDepositBridgeEventTrackerConfig.AptosBridgeReceiverAddress)
	if err != nil {
		log.Fatal().Msgf("error in parsing module address: %s", err)
	}

	query, err := aptos_bridge.SetupMessageSentQuery(cfg)
	if err != nil {
		log.Fatal().Msgf("error in creating aptos event query: %s", err)
	}

	depositBridgeExecutor := aptos_bridge.CreateAptosDepositBridgeExecutor(
		ethClient,
		aptosClient,
		eventDecoder,
		cfg,
		signerAccount,
		moduleAddress,
	)

	log.Info().
		Str("l1 messaging address",
			cfg.CoreContracts.MessagingContractAddress.String()).
		Str("bridge receiver address", moduleAddress.String()).
		Interface("query", query).
		Msg("initialized aptos deposit bridge")

	l, err := eth.CreateEthereumEventListener(
		ethClient,
		depositBridgeExecutor,
		cfg.CoreContracts.MessagingContractAddress,
		int64(cfg.AptosDepositBridgeEventTrackerConfig.EthLastBlockNumber),
		db,
		stateController,
		taskManager,
		alerter,
		eth.WithTopicQuery(query),
	)
	if err != nil {
		log.Fatal().Msgf("error in creating eth listener: %s", err)
		return nil
	}

	l.Poll(ctx)
	return l
}
