import { ethers } from "hardhat";
import {readFile,writeFile,delay,verifyContract} from "./utils.ts";
import {StrategyManager,Messaging, Deposit, Address} from "../typechain";

async function main() {
    const [signer] = await ethers.getSigners();
    const executor = process.env.EXECUTOR_ADDR??signer.address;
    const network_name = (await ethers.provider.getNetwork()).name;
    let output = JSON.parse("{}");
    output = await readFile(network_name)
    const Proxy = await ethers.getContractFactory("src/utils/NexusProxy.sol:Proxy");
    const DepositL1 = await ethers.getContractFactory("Deposit");
    const MessagingContract = await ethers.getContractFactory("Messaging");
    const StrategyManager = await ethers.getContractFactory("StrategyManager");
    let strategy:StrategyManager, depositl1:Deposit,messaging:Messaging;
    if("DepositL1" in output && output["DepositL1"]!=""){
        depositl1 = await DepositL1.attach(output["DepositL1"])
    }
    else{
        const depositImpl:Deposit = await DepositL1.attach("0x04eA5657149AECB9777EB626c97eC7cDDe2bC83e");
        await depositImpl.waitForDeployment()
        // const depositProxy = await Proxy.deploy(DepositL1.interface.encodeFunctionData("initialize",[]),await depositImpl.getAddress());
        const depositProxy = await Proxy.attach("0x19Dd8fc5f87AAD2503f5eB1780de1b24CC0AAECd");
        await depositProxy.waitForDeployment();
        depositl1 = await DepositL1.attach(await depositProxy.getAddress())
        console.log("deposit contract deployed at:", await depositProxy.getAddress())
        console.log("deposit contract impl deployed at:", await depositImpl.getAddress())
        delay(7000)
        verifyContract(await depositImpl.getAddress(),[]);
        verifyContract(await depositProxy.getAddress(),[DepositL1.interface.encodeFunctionData("initialize",[]),await depositImpl.getAddress()])
    }
    if("StrategyManager" in output && output["StrategyManager"]!=""){
        strategy = await StrategyManager.attach(output["StrategyManager"])
    }
    else{
        const strategyImpl:StrategyManager = await StrategyManager.attach("0x7074fE976AEa387a024BA8e1b4e72139E58c749f")
        await strategyImpl.waitForDeployment()
        // const strategyProxy = await Proxy.deploy(StrategyManager.interface.encodeFunctionData("initialize",[]),await strategyImpl.getAddress());
        const strategyProxy = await Proxy.attach("0x7aCf0aBe42DA4D48A58D7013A394Fb0b26407E32");
        await strategyProxy.waitForDeployment();
        strategy = await StrategyManager.attach(await strategyProxy.getAddress())
        console.log("strategy manager contract deployed at:", await strategy.getAddress())
        console.log("strategy manager impl contract deployed at:", await strategyImpl.getAddress())
        delay(7000)
        verifyContract(await strategyImpl.getAddress(),[]);
        verifyContract(await strategyProxy.getAddress(),[StrategyManager.interface.encodeFunctionData("initialize",[]),await strategyImpl.getAddress()])
    }
    if("MessagingL1" in output && output["MessagingL1"]!=""){
        messaging = await MessagingContract.attach(output["MessagingL1"])
    }
    else{
        messaging = await MessagingContract.deploy(executor,await depositl1.getAddress());
        await messaging.waitForDeployment();
        console.log("messaging contract deployed at:", await messaging.getAddress())
        delay(7000)
        verifyContract(await messaging.getAddress(),[executor,await depositl1.getAddress()]);
    }
    await depositl1.setMessagingApp(await messaging.getAddress());

    console.log(await depositl1.BASE_POINT());
    console.log(await depositl1.nETHMinted());
    output["DepositL1"] = await depositl1.getAddress()
    output["StrategyManager"]= await strategy.getAddress()
    output["MessagingL1"]= await messaging.getAddress()
    await writeFile(network_name, output);
    await depositl1.setStrategyAddress(await strategy.getAddress());
    await depositl1.setStrategyExecutor(executor)
    await depositl1.setMessagingApp(await messaging.getAddress())
    await strategy.setDeposit(await depositl1.getAddress());
    console.log("values set for all contracts")

}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });