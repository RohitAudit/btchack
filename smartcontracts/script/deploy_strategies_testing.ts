import { ethers } from "hardhat";
import {readFile,writeFile,delay,verifyContract} from "./utils.ts";
import {WETHStrategy,NexusRTokenETH,NexusRebaseStakingProvider,RebaseStrategy,StrategyManager,LiDoStrategy} from "../typechain";

async function main() {
    let output = JSON.parse("{}");
    const network_name = (await ethers.provider.getNetwork()).name;
    output = await readFile(network_name)
    const [signer] = await ethers.getSigners();
    const WETHSTrat = await ethers.getContractFactory("WETHStrategy");
    const wethStrategy:WETHStrategy = await WETHSTrat.deploy();
    console.log("weth strategy deployed :",await wethStrategy.getAddress())

    const REBASE_TOKEN = await ethers.getContractFactory("NexusRTokenETH")
    const rebaseToken:NexusRTokenETH = await REBASE_TOKEN.deploy();
    // await rebaseToken.addSupervisor("0x88c5FD502990b2A67D618AD6b185d315d631F021");

    console.log("rebaseToken  deployed :",await rebaseToken.getAddress())

    const RebaseDep = await ethers.getContractFactory("NexusRebaseStakingProvider");
    const rebaseDeposit:NexusRebaseStakingProvider = await RebaseDep.deploy();
    console.log("rebaseDeposit deployed :",await rebaseDeposit.getAddress())

    const RebaseStrat = await ethers.getContractFactory("RebaseStrategy");
    const rebaseStrategy:RebaseStrategy = await RebaseStrat.deploy(await rebaseToken.getAddress(), await rebaseDeposit.getAddress());
    console.log("rebase strategy deployed :",await rebaseStrategy.getAddress())

    const StrategyManager = await ethers.getContractFactory("StrategyManager");
    const strategy:StrategyManager = await StrategyManager.attach(output["StrategyManager"])

    const LiDoStrategy = await ethers.getContractFactory("LiDoStrategy");
    const lido:LiDoStrategy = await LiDoStrategy.deploy();
    await lido.waitForDeployment();
    console.log("LiDoStrategy strategy deployed :",await lido.getAddress())

    await delay(5000)
    await strategy.addStrategy(await wethStrategy.getAddress());
    await strategy.addStrategy(await rebaseStrategy.getAddress());
    await strategy.addStrategy(await lido.getAddress());
    await delay(5000)
    console.log("setting rebase values")
    await rebaseToken.initialize({gasLimit:200000});
    await rebaseDeposit.initialize(rebaseToken,{gasLimit:200000});
    await rebaseToken.addSupervisor(await rebaseDeposit.getAddress(),{gasLimit:200000})
    console.log("verifying contracts")

    verifyContract(await lido.getAddress(),[]);
    verifyContract(await wethStrategy.getAddress(),[]);
    verifyContract(await rebaseToken.getAddress(),[]);
    verifyContract(await rebaseDeposit.getAddress(),[]);
    verifyContract(await rebaseStrategy.getAddress(),[await rebaseToken.getAddress(), await rebaseDeposit.getAddress()]);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });