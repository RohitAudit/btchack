// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface InETH is IERC20{

    function mintnETH(address _receiver, uint256 _value) external;
    function burnnETH(address _sender, uint256 _value) external;
}