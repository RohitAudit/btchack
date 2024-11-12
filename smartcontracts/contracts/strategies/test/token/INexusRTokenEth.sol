// SPDX-License-Identifier: UNKWOWN
pragma solidity ^0.8.7;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

interface INexusRTokenETH is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address to, uint256 amount) external;
}
