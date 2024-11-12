// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IDepositL1} from "./interfaces/IDeposit.sol";
import {Ownable} from "./utils/NexusOwnable.sol";
import {UUPSUpgreadable} from "./utils/UUPSUpgreadable.sol";
import {IStrategyManager} from "./interfaces/IStrategyManager.sol";
import {IMessaging} from "./interfaces/IMessaging.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IncorrectValue,NotStrategyContract,IncorrectTokenAddress,CallFailed,IncorrectValue,IncorrectMessageAddress,IncorrectTypeID} from "./utils/Helpers.sol";
import {IStrategy} from "./strategies/interfaces/IStrategy.sol";


contract Deposit is IDepositL1, Ownable, UUPSUpgreadable{

    address public messageApp;
    address public strategyManager;
    address public strategyExecutor;

    uint256 public ethDeposited;
    uint256 public ethWithdrawn;
    uint256 public rewardsClaimed;
    uint256 public sharePrice;
    uint256 public nETHMinted;
    uint256 public constant BASE_POINT = 1e18;

    mapping(address=>bool) public whitelistedTokens;
    modifier onlyWhitelisted(address _tokenAddress){
        if (!whitelistedTokens[_tokenAddress]) revert IncorrectTokenAddress(_tokenAddress);
        _;
    }

    modifier onlyMessageApp(){
        if (msg.sender!=messageApp) revert IncorrectMessageAddress(msg.sender);
        _;
    }

    modifier onlyStrategyManager(){
        if (msg.sender!=strategyManager) revert NotStrategyContract(msg.sender);
        _;
    }

    function initialize() public initilizeOnce {
        _ownableInit(msg.sender);
        sharePrice = 1e18;
    }

    function updateProxy(
        address _newImplemetation
    ) public onlyOwner {
        if (_newImplemetation == address(0)) revert IncorrectAddress();
        updateCodeAddress(_newImplemetation);
    }

    receive() external payable {
        // This function used to withdraw weth
    }

    function setMessagingApp(address _messageApp) external onlyOwner{
        messageApp=_messageApp;
        emit MessagingContractAddressAdded(_messageApp);
    }

    function setStrategyAddress(address _strategyManager) external onlyOwner{
        strategyManager=_strategyManager;
        emit StrategyContractAddressAdded(_strategyManager);
    }

    function setStrategyExecutor(address _executor) external onlyOwner{
        strategyExecutor = _executor;
        emit StrategyExecutorAddressAdded(_executor);
    }

    function deposit(address _tokenAddress, string memory _receiver, uint256 _value, uint32 _destID,uint256 _lzFee) external override payable {
        if(_tokenAddress==address(0)){
            _depositETH(_receiver,_value,_destID,_lzFee);
        }else {
            _depositERC( _tokenAddress,  _receiver,  _value, _destID,_lzFee);
        }
        emit AssetDeposited(msg.sender,_tokenAddress,_receiver,_value,_destID);
    }

    function _depositETH(string memory _receiver, uint256 _value, uint32 _destID, uint256 _lzFee) internal {
        if(msg.value==_value+_lzFee){
            uint256 nETHShares= (sharePrice*_value)/BASE_POINT;
            bytes memory data = abi.encode(1, _receiver,nETHShares);
            ethDeposited+=_value;
            nETHMinted+=nETHShares;
            IMessaging(messageApp).sendMessage{value:_lzFee}(data, _destID,_lzFee);
        }else{
            revert IncorrectValue();
        }
    }

    function _depositERC(address _tokenAddress, string memory _receiver, uint256 _value, uint32 _destID,uint256 _lzFee) internal onlyWhitelisted(_tokenAddress){
        if(msg.value!=_lzFee) revert IncorrectValue();
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _value);
        (uint256 tokenValue, address _strategy) = IStrategyManager(strategyManager).fetchStrategy(_tokenAddress);
        uint256 assetValue = (_value*tokenValue)/BASE_POINT;
        IStrategyManager.StrategyStruct memory change;
        change.ethDeposited = assetValue;
        IStrategyManager(strategyManager).updateStrategy(_strategy,change);
        ethDeposited+=assetValue;
        uint256 nETHShares= (sharePrice*assetValue)/BASE_POINT;
        bytes memory data = abi.encode(1, _receiver,nETHShares);
        nETHMinted+=nETHShares;
        IMessaging(messageApp).sendMessage{value:_lzFee}(data, _destID,_lzFee);
    }

    function getlzFee(address _tokenAddress,string memory _receiver, uint256 _value, uint32 _destID) public view returns(uint256){
        uint256 nETHShares;
        if(_tokenAddress==address(0)){
            nETHShares= (sharePrice*_value)/BASE_POINT;
        }
        else{
            (uint256 tokenValue,) = IStrategyManager(strategyManager).fetchStrategy(_tokenAddress);
            uint256 assetValue = (_value*tokenValue)/BASE_POINT;
            nETHShares= (sharePrice*assetValue)/BASE_POINT;
        }
        bytes memory dataSend = abi.encode(1, _receiver,nETHShares);
        return IMessaging(messageApp).quote(_destID,dataSend);
    }

    function _updateSharePrice(uint256 _rewardsEarned) internal {
        rewardsClaimed+=_rewardsEarned;
        uint256 totalEthBalance = (ethDeposited-ethWithdrawn+rewardsClaimed);
        if (totalEthBalance==0){
            sharePrice = BASE_POINT;
        }
        else{
            sharePrice = (nETHMinted)*BASE_POINT/(ethDeposited-ethWithdrawn+rewardsClaimed);
        }
        emit SharePriceUpdated(sharePrice);
    }

    function updateRewards(address[] memory _strategy) external{
        uint256 totalRewardsEarned;
        unchecked {
            for(uint i=0;i<_strategy.length;i++){
                if(!IStrategyManager(strategyManager).strategyExists(_strategy[i])) revert IncorrectStrategy(_strategy[i]);
                IStrategyManager.StrategyStruct memory tokenBalance = IStrategyManager(strategyManager).fetchStrategyDeposit(_strategy[i]);
                uint256 rewardsEarned = IStrategy(_strategy[i]).getRewards(address(this), tokenBalance);
                if(rewardsEarned>0){
                    totalRewardsEarned+=rewardsEarned;
                    IStrategyManager.StrategyStruct memory change;
                    change.rewardsEarned=rewardsEarned;
                    IStrategyManager(strategyManager).updateStrategy(_strategy[i], change);
                }
            }
        }
        _updateSharePrice(totalRewardsEarned);
        emit RewardsCollected(totalRewardsEarned);
    }

    function executeStrategies(StrategyExecution[] memory _executionData) external override {
        if(msg.sender!=strategyExecutor) revert IncorrectStrategyExecutor(msg.sender);
        unchecked{
            for(uint i=0;i<_executionData.length;i++){
                if(!IStrategyManager(strategyManager).strategyExists(_executionData[i].strategy)) revert IncorrectStrategy(_executionData[i].strategy);
                (bool success, bytes memory returndata) = _executionData[i].strategy.delegatecall(_executionData[i].executionData);
                if(!success){
                    if (returndata.length == 0) revert CallFailed();
                    assembly {
                        revert(add(32, returndata), mload(returndata))
                    }
                }
                uint256 _type=abi.decode(returndata,(uint256));
                if (_type==100){
                    IStrategyManager.StrategyStruct memory change;
                    change.ethDeposited = _executionData[i].value;
                    IStrategyManager(strategyManager).updateStrategy(_executionData[i].strategy,change);
                }else if(_type==101){
                    IStrategyManager.StrategyStruct memory change;
                    change.ethWithdrawn = _executionData[i].value;
                    IStrategyManager(strategyManager).updateStrategy(_executionData[i].strategy,change);
                }
                else{
                    revert IncorrectValue();
                }
            }
        }
        emit StrategyExecutionCompleted(block.timestamp);
    }

    function whitelistToken(address _tokenAddress) external onlyStrategyManager {
        whitelistedTokens[_tokenAddress] = true;
        emit TokenWhitelisted(_tokenAddress);
    }

    // L2 message recieved
    function messageReceivedL2(uint256 _id, address _receiver, uint256 _value) external override onlyMessageApp {
        if(_id==3){
            uint256 _valueETHWithdraw = _value*BASE_POINT/sharePrice;
            _withdrawFunds(_receiver, _valueETHWithdraw);
        }
        else {
            revert IncorrectTypeID(_id,msg.sender);
        }
    }

    // TODO to implement later on
    function _withdrawFunds(address _reciever, uint256 _value) internal {
    }

}