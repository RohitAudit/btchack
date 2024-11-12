// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

interface IDepositL1 {

    struct StrategyExecution{
        address strategy;
        bytes executionData;
        uint256 value;
    }
    //events
    event TokenWhitelisted(address _tokenAddress);
    event AssetDeposited(address _sender,address _tokenAddress,string _receiver, uint256 _value, uint32 _destID);
    event StrategyContractAddressAdded(address _strategyAddress);
    event MessagingContractAddressAdded(address _messageAppAddress);
    event SharePriceUpdated(uint256 _newPrice);
    event StrategyExecutionCompleted(uint256 _timestamp);
    event RewardsCollected(uint256 _rewardsEarned);
    event StrategyExecutorAddressAdded(address _strategyExecutor);

    //errors
    error IncorrectStrategyExecutor(address _sender);
    error IncorrectStrategy(address _strategy);

    function deposit(address _tokenAddress, string memory _receiver, uint256 _value, uint32 _destID,uint256 _lzFee) external payable;
    function messageReceivedL2(uint256 _id, address _reciever, uint256 _value) external ;
    function executeStrategies(StrategyExecution[] memory _executionData) external;
}