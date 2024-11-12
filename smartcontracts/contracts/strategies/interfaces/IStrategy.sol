// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;
import {IStrategyManager} from "../../interfaces/IStrategyManager.sol";



interface IStrategy{

    function TOKEN_ADDRESS() external view returns(address);
    function tokenPrice() external view returns(uint256);
    function getRewards(address receiver,IStrategyManager.StrategyStruct memory _strategyBalance) external view returns(uint256);


}