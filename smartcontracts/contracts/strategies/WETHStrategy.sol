// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IStrategy} from "./interfaces/IStrategy.sol";
import {WETH9} from "./interfaces/WETH.sol";
import {IStrategyManager} from "../interfaces/IStrategyManager.sol";


contract WETHStrategy is IStrategy{

    //holesky
    address public override constant TOKEN_ADDRESS = 0x94373a4919B3240D86eA41593D5eBa789FEF3848;

    function tokenPrice() external override pure returns(uint256){
        return 1e18;
    }

    function withdraw(uint256 _value) public returns(uint256){
        WETH9(TOKEN_ADDRESS).withdraw(_value);
        return 101;
    }

    function getRewards(address /*receiver*/,IStrategyManager.StrategyStruct memory /*_strategyBalance*/) public override view returns(uint256){
        return 0;
    }

}