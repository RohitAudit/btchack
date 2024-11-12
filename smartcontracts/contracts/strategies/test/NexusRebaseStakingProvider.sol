// SPDX-License-Identifier: UNKNOWN
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {INexusRTokenETH} from "./token/INexusRTokenEth.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

error InsufficientBalance(address caller);

contract NexusRebaseStakingProvider is Initializable {
    INexusRTokenETH tokenProxy;

    event UserDeposited(address from, uint256 amount);
    event UserWithdrawn(address from, uint256 amount);
    event RewardsMinted(address from, address to, uint256);

    function initialize(address _tokenProxy) public initializer {
        tokenProxy = INexusRTokenETH(_tokenProxy);
    }

    function deposit() external payable {
        tokenProxy.mint(msg.sender, msg.value);
        emit UserDeposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        if (IERC20(tokenProxy).balanceOf(msg.sender) < amount) {
            revert InsufficientBalance(msg.sender);
        }
        tokenProxy.burn(msg.sender, amount);
        (bool sent,) = address(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");
        emit UserWithdrawn(msg.sender, amount);
    }

    function mintRewards(address to) external payable {
        tokenProxy.mint(to, msg.value);
        emit RewardsMinted(msg.sender, to, msg.value);
    }
}
