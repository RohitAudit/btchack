// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;


import {IStrategy} from "./interfaces/IStrategy.sol";
import {CallFailed} from "../utils/Helpers.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IStrategyManager} from "../interfaces/IStrategyManager.sol";


contract LiDoStrategy is IStrategy{

    //holesky
    address public constant TOKEN_ADDRESS=0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034;

    address public constant LIDO_DEPOSIT_ADDRESS=0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034;

    function tokenPrice() external override pure returns(uint256){
        return 1e18;
    }

    function deposit(uint256 _value) public returns(uint256){
        (bool success,bytes memory returndata) = LIDO_DEPOSIT_ADDRESS.call{value:_value}(abi.encodeWithSignature("submit(address)", address(this)));
        if(!success){
            if (returndata.length == 0) revert CallFailed();
            assembly {
                revert(add(32, returndata), mload(returndata))
            }
        }
        return 100;
    }

    // function depositBL(uint256 _value) public returns(uint256 ){
    //     return 101;
    // }
    // function withdraw() public {
    //     return 100;
    // }

    // function swapToETH() public {

    // }

    function getRewards(address receiver,IStrategyManager.StrategyStruct memory _strategyBalance) public override view returns(uint256){
        uint256 balance_strategy = _strategyBalance.ethDeposited +_strategyBalance.rewardsEarned -_strategyBalance.ethWithdrawn;
        if (IERC20(TOKEN_ADDRESS).balanceOf(receiver)>balance_strategy){
            return IERC20(TOKEN_ADDRESS).balanceOf(receiver) - (_strategyBalance.ethDeposited +_strategyBalance.rewardsEarned -_strategyBalance.ethWithdrawn);
        }
        else{
            return 0;
        }
    }

}