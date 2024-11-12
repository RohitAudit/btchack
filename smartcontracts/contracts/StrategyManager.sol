// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {Ownable} from "./utils/NexusOwnable.sol";
import {UUPSUpgreadable} from "./utils/UUPSUpgreadable.sol";
import {IStrategyManager} from "./interfaces/IStrategyManager.sol";
import {IStrategy} from "./strategies/interfaces/IStrategy.sol";
import {CallFailed,NotDepositContract} from "./utils/Helpers.sol";

contract StrategyManager is IStrategyManager, Ownable, UUPSUpgreadable{

    /*
    Type of strategy Execution
    if returns :
        1. 100 - deposit
        2. 101 - withdrawal
    */

    address public depositL1;

    mapping(address=>address) public strategies;

    mapping(address=>StrategyStruct) public strategyDeposits;

    modifier onlyDeposit(){
        if(msg.sender!=depositL1) revert NotDepositContract(msg.sender);
        _;
    }

    function initialize() public initilizeOnce {
        _ownableInit(msg.sender);
    }

    function fetchStrategyDeposit(address _strategy) external override view returns(StrategyStruct memory){
        return strategyDeposits[_strategy];
    }

    function updateProxy(
        address _newImplemetation
    ) public onlyOwner {
        if (_newImplemetation == address(0)) revert IncorrectAddress();
        updateCodeAddress(_newImplemetation);
    }

    function fetchStrategy(address _tokenAddress) external override view returns(uint256, address){
        return (IStrategy(strategies[_tokenAddress]).tokenPrice(),strategies[_tokenAddress]);
    }

    function setDeposit(address _deposit) external onlyOwner{
        depositL1=_deposit;
        emit DepositAddressSet(_deposit);
    }

    function addStrategy(address _strategy) external onlyOwner{
        address _tokenAddress = IStrategy(_strategy).TOKEN_ADDRESS();
        strategies[_tokenAddress] = _strategy;
        (bool success,bytes memory returndata)=depositL1.call{gas:50000}(abi.encodeWithSignature("whitelistToken(address)", _tokenAddress));
        if(!success){
            if (returndata.length == 0) revert CallFailed();
            assembly {
                revert(add(32, returndata), mload(returndata))
            }
        }
        emit StrategyAdded(_tokenAddress,_strategy);
    }

    function strategyExists(address _strategy) external override view returns(bool){
        address _token = IStrategy(_strategy).TOKEN_ADDRESS();
        if(strategies[_token]==_strategy) return true;
        return false;
    }

    function updateStrategy(address _strategy, StrategyStruct memory _changeBalane) external override onlyDeposit{
        strategyDeposits[_strategy].ethDeposited += _changeBalane.ethDeposited;
        strategyDeposits[_strategy].ethWithdrawn += _changeBalane.ethWithdrawn;
        strategyDeposits[_strategy].rewardsEarned += _changeBalane.rewardsEarned;
        emit StrategyBalanceUpdated(_changeBalane);
    }
}