package eth

import (
	"time"

	"github.com/ethereum/go-ethereum/common"
)

func WithConnectionTimeout(connTimeout time.Duration) optFunction {
	return func(e *EthereumEventListener) *EthereumEventListener {
		e.connTimeout = connTimeout
		return e
	}
}

func WithTaskTimeout(taskTimeout time.Duration) optFunction {
	return func(e *EthereumEventListener) *EthereumEventListener {
		e.taskTimeout = taskTimeout
		return e
	}
}

func WithTopicQuery(query [][]common.Hash) optFunction {
	return func(e *EthereumEventListener) *EthereumEventListener {
		e.topics = query
		return e
	}
}
