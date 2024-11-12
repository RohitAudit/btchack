package event_state

import (
	"math/big"

	"github.com/Nexus-2023/nexus-staking-oracle/common/dto"
	"github.com/Nexus-2023/nexus-staking-oracle/common/ports/persistence"
	"github.com/rs/zerolog/log"
)

type EventStatePersistence struct {
	taskName                 string
	configCurrentBlockNumber *big.Int
	db                       persistence.EventStateStorage
}

func (p *EventStatePersistence) GetEventState() (*dto.EventState, error) {
	exist, err := p.db.HasEventState(p.taskName)
	if err != nil {
		log.Error().Msgf("error in fetching eth event state exist: %s", err)
		return nil, err
	}
	if !exist {
		log.Warn().Msgf("no event state persisted, fetching from node config block number")

		return &dto.EventState{
			BlockNumber: p.configCurrentBlockNumber,
			TxnNumber:   nil,
			EventIndex:  nil,
		}, nil
	}

	event, err := p.db.GetEventState(p.taskName)
	if err != nil {
		log.Error().Msgf("error in fetching eth event state: %s", err)
		return nil, err
	}

	return event, err
}

func (p *EventStatePersistence) SetEventState(state *dto.EventState) error {
	return p.db.SetEventState(p.taskName, *state)
}

func (p *EventStatePersistence) SetupController(taskName string, configCurrentBlockNumber *big.Int, db persistence.EventStateStorage) {
	p.taskName = taskName
	p.configCurrentBlockNumber = configCurrentBlockNumber
	p.db = db
}

func NewEventStatePersistence() *EventStatePersistence {
	return &EventStatePersistence{}
}
