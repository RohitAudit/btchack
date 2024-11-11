import { NetworkChainListType } from "@/types"
import ethIcon from "/public/Icons/ethIcon.svg"
import wethIcon from "/public/Icons/tokens/weth.png"
import stETHIcon from "/public/Icons/tokens/steth.png"
import baseIcon from "/public/Icons/chainIcons/base.png"

export const NetworkChainList: NetworkChainListType = {
  84532: {
    chainID: 84532,
    name: "Base-sepolia",
    logo: baseIcon,
    nativeToken: "ETH",
    testnet: true,
    explorerUrl: "https://holesky.etherscan.io",
    partnerChainIDs: [421614],
    tokens: [
      {
        balance: "0",
        name: "Ether",
        symbol: "ETH",
        logo: ethIcon,
        native: true,
        tokenAddress: "",
        abi: "null",
      },
      {
        balance: "0",
        name: "Wrapped ETH",
        symbol: "WETH",
        logo: wethIcon,
        native: false,
        tokenAddress: "0x94373a4919b3240d86ea41593d5eba789fef3848",
        abi: "null",
      },
      {
        balance: "0",
        name: "Lido Staked Ether",
        symbol: "stETH",
        logo: stETHIcon,
        native: false,
        tokenAddress: "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
        abi: "null",
      },
    ],
  },
}
