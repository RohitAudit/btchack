import { ethers } from "hardhat";
import {readFile,writeFile,delay,verifyContract} from "./utils.ts";
import {Messaging, MessagingBera} from "../typechain";
import { Options } from "@layerzerolabs/lz-v2-utilities";


async function main(){
    const network_name = (await ethers.provider.getNetwork()).name;
    let output_holesky = JSON.parse("{}");
    let output_bera = JSON.parse("{}");
    output_holesky = await readFile("holesky");
    output_bera = await readFile("berachain");
    const abi = ethers.AbiCoder.defaultAbiCoder();
    const _options = Options.newOptions().addExecutorLzReceiveOption(300000, 0);
    if(network_name=="holesky"){
        console.log("setting peers on holesky")
        const MessagingContract = await ethers.getContractFactory("Messaging");
        const messaging:Messaging = await MessagingContract.attach(output_holesky["MessagingL1"])
        // const peerBera = abi.encode(["address"],[output_bera["MessagingBera"]]);
        await messaging.whitelistDestination(69,_options.toHex());
        // await messaging.setPeer(40291,peerBera)
        // TODO add this after movement lz endpoint
        await messaging.whitelistDestination(420,_options.toHex());
        // const peerMove = abi.encode(["address"],[output_bera["MessagingBera"]]);
        // await messaging.setPeer(40161,peerMove)
    }
    else if(network_name=="berachain"){
        console.log("connecting peers on berachain")
        const MessageBera = await ethers.getContractFactory("MessagingBera");
        const messagebera:MessagingBera = await MessageBera.attach(output_bera["MessagingBera"])
        await messagebera.whitelistDestination(40217,_options.toHex());
        // const peerHolesky= abi.encode(["address"],[output_holesky["MessagingL1"]]);
        // await messagebera.setPeer(40217,peerHolesky)
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });