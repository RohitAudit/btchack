// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;


interface IMessaging {
    //error
    error NotOwner(address _sender);
    error NotWhitelisted(uint32 _destID);

    //event
    event MessageSent(uint32 indexed _destID, bytes _data);
    event MessageReceived(uint256 indexed _id,string _receiver,uint256 _value);
    event DestIdWhitelisted(uint32 _destId);

    function sendMessage(bytes memory _data, uint32 _destId,uint256 _lzFee) external payable;
    function quote(uint32 _destId, bytes memory _data) external view returns (uint256);
    function destIdAvailable(uint32 _destId) external returns (bool);
}