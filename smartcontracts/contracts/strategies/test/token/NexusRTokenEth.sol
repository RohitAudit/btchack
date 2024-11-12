// SPDX-License-Identifier: UNKNOWN
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

error CallerNotTokenSupervisor(address caller);

contract NexusRTokenETH is Initializable, ERC20Upgradeable, OwnableUpgradeable, AccessControlUpgradeable {
    bytes32 public constant TOKEN_SUPERVISOR_ROLE = keccak256("TOKEN_SUPERVISOR_ROLE");

    // /// @custom:oz-upgrades-unsafe-allow constructor
    // constructor() {
    //     _disableInitializers();
    // }

    function initialize() public initializer {
        __ERC20_init("NexusRTokenETH", "NRTEth");
        __Ownable_init(_msgSender());
    }

    modifier onlySupervisor() {
        if (!hasRole(TOKEN_SUPERVISOR_ROLE, _msgSender())) {
            revert CallerNotTokenSupervisor(_msgSender());
        }
        _;
    }

    function addSupervisor(address supervisor) public onlyOwner {
        _grantRole(TOKEN_SUPERVISOR_ROLE, supervisor);
    }

    function removeSupervisor(address supervisor) public onlyOwner {
        _revokeRole(TOKEN_SUPERVISOR_ROLE, supervisor);
    }

    function mint(address to, uint256 amount) external onlySupervisor {
        _mint(to, amount);
    }

    function burn(address to, uint256 amount) external onlySupervisor {
        _burn(to, amount);
    }
}
