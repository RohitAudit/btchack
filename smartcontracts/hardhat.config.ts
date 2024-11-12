import { HardhatUserConfig } from "hardhat/config";
import { task } from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
require("hardhat-contract-sizer");
import * as dotenv from "dotenv";
dotenv.config();
import "solidity-coverage";


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
  networks: {
    holesky:{
      url:process.env.HOLESKY_URL,
      accounts: [process.env.PRIVATE_KEY??""]
    },
    berachain: {
      url:process.env.BERACHAIN_URL,
      accounts: [process.env.PRIVATE_KEY??""]
    },
    hardhat: {
      chainId: 17000,
      // mining: {
      //   auto: false,
      //   interval: [3000, 6000],
      // },
      forking: {
        enabled: true,
        url: process.env.HOLESKY_URL??"",
      },
    }
  },
  etherscan:{
    apiKey: process.env.ETHERSCAN_API,
    customChains:[
      {
        network: "holesky",
        chainId: 17000,
        urls: {
            apiURL: "https://api-holesky.etherscan.io/api",
            browserURL: "https://holesky.etherscan.io"
        }
      },
      {
        network: "berachain_bartio",
        chainId: 80084,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/80084/etherscan",
          browserURL: "https://bartio.beratrail.io"
        }
      }
    ]
  }
};

export default config;
