// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

/**
 * @title Ownable Contract
 * @author RohitAudit
 * @dev This contract is used to implement ownable features to the contracts
 */
contract Ownable {
    address private owner;
    bool private initialized = false;

    event OwnerChanged(address oldOwner, address newOwner);
    error NotOwner();
    error ContractAlreadyInitialized();
    error IncorrectAddress();
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier initilizeOnce() {
        if (initialized) revert ContractAlreadyInitialized();
        _;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function _ownableInit(address _owner) internal {
        owner = _owner;
        initialized = true;
    }

    /**
     * This function transfers the ownership of the contract
     * @param newOwner New Owner of the contract
     */
    function transferOwnership(address newOwner) external onlyOwner{
        if (newOwner == address(0)) revert IncorrectAddress();

        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
}
