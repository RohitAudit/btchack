// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;


import {IStrategy} from "../interfaces/IStrategy.sol";
import {IStrategyManager} from "../../interfaces/IStrategyManager.sol";
import {CallFailed} from "../../utils/Helpers.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RebaseStrategy is IStrategy{
    address public TOKEN_ADDRESS;

    address public DEPOSIT_ADDRESS;

    constructor (address _tokenAddress, address _deposit){
        TOKEN_ADDRESS = _tokenAddress;
        DEPOSIT_ADDRESS = _deposit;
    }

    function tokenPrice() external override pure returns(uint256){
        return 1e18;
    }

    function deposit(address _depositAddress,uint256 _value) public returns(uint256){
        (bool success,bytes memory returndata) = _depositAddress.call{value:_value}(abi.encodeWithSignature("deposit()"));
        if(!success){
            if (returndata.length == 0) revert CallFailed();
            assembly {
                revert(add(32, returndata), mload(returndata))
            }
        }
        return 100;
    }

    function getRewards(address receiver,IStrategyManager.StrategyStruct memory _strategyBalance) public override view returns(uint256){
        return IERC20(TOKEN_ADDRESS).balanceOf(receiver) - (_strategyBalance.ethDeposited +_strategyBalance.rewardsEarned -_strategyBalance.ethWithdrawn);
    }
}