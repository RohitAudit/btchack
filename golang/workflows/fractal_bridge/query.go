package fractal_bridge

import (
	"github.com/Nexus-2023/nexus-staking-oracle/common/dto/config"
	"github.com/Nexus-2023/nexus-staking-oracle/solgen/gen/messagegen"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/rs/zerolog/log"
)

func SetupMessageSentQuery(cfg *config.Config) ([][]common.Hash, error) {
	contractABI, err := messagegen.MessagegenMetaData.GetAbi()
	if err != nil {
		log.Error().Msgf("error in fetching contract ABI: %s", err)
		return nil, nil
	}

	messageSentEventID := contractABI.Events["MessageSent"].ID
	query := [][]interface{}{{messageSentEventID}}
	query = append(query, []interface{}{cfg.FractalDepositBridgeEventTrackerConfig.DestinationID})

	return abi.MakeTopics(query...)
}
