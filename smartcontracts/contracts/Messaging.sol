// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IMessaging} from "./interfaces/IMessaging.sol";
import {IncorrectTypeID, CallFailed,NotDepositContract,NotExecutor} from "./utils/Helpers.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, Origin, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import {IDepositL1 } from "./interfaces/IDeposit.sol";
import {AddressLibrary} from "./libraries/AddressLIbrary.sol";


contract Messaging is IMessaging,Ownable{

    /*
    id=1 deposit
    id=2 rewards
    id=3 withdrawal
    id=4 L2 deposit received
    data struct to send:
    1. id
    2. receiver = address(0) if id=2
    3. value
    abi.encode(id, receiver, value);
    */

    address public depositL1;
    address public executor;

    mapping(uint32=>bytes) public optionsDestId;
    error NotLzExecutor();

    modifier onlyDeposit(){
        if(msg.sender!=depositL1) revert NotDepositContract(msg.sender);
        _;
    }

    constructor(address _endpoint,address _deposit) Ownable(msg.sender) {
        executor = _endpoint;
        depositL1 = _deposit;
    }

    function destIdAvailable(uint32 _destId) public view override returns(bool){
        if (optionsDestId[_destId].length==0) return false;
        return true;
    }

    function whitelistDestination(uint32 _destId, bytes memory _options) external onlyOwner{
        optionsDestId[_destId]=_options;
        emit DestIdWhitelisted(_destId);
    }

    function sendMessage(bytes memory _data, uint32 _destId, uint256 _lzFee) external override payable onlyDeposit{
        if(!destIdAvailable(_destId)) revert NotWhitelisted(_destId);
        // _lzSend(
        //     _destId,
        //     _data,
        //     optionsDestId[_destId],
        //     MessagingFee(_lzFee, 0),
        //     payable(msg.sender)
        // );
        emit MessageSent(_destId,_data);
    }

    function quote(uint32 _destId, bytes memory _data) external view override returns (uint256) {
        // MessagingFee memory fee = _quote(_destId, _data, optionsDestId[_destId], false);
        // return fee.nativeFee;
        return 0;
    }

    // function _lzReceive(
    //     Origin calldata /* _origin*/,
    //     bytes32 /*_guid*/,
    //     bytes calldata payload,
    //     address,  // Executor address as specified by the OApp.
    //     bytes calldata  // Any extra data or options to trigger on receipt.
    // ) internal override {
    //     (uint256 id,string memory receiver,uint256 value) = abi.decode(payload, (uint256,string,uint256));
    //     IDepositL1(depositL1).messageReceivedL2(id,address(bytes20(bytes(receiver))),value);
    //     emit MessageReceived(id,receiver,value);
    // }

    function receiveMessage(bytes calldata payload) external {
        if(msg.sender!=executor) revert NotLzExecutor();

        (uint256 id,string memory receiver,uint256 value) = abi.decode(payload, (uint256,string,uint256));
        IDepositL1(depositL1).messageReceivedL2(id,AddressLibrary.convertToAddress(receiver),value);
        emit MessageReceived(id,receiver,value);
    }
}