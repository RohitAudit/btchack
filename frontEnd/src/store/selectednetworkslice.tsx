import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { StaticImageData } from "next/image"
import { TokenType } from "../types"
import ethIcon from "/public/Icons/ethIcon.svg"
import wethIcon from "/public/Icons/tokens/weth.png"
import stETHIcon from "/public/Icons/tokens/steth.png"
import WETH_ABI from "@/util/Contract/Abi/Holesky/WETH.json"
import stETH_ABI from "@/util/Contract/Abi/Holesky/stETH.json"

interface SelectedNetworkState {
  chainID: number
  name: string
  logo: StaticImageData
  nativeToken: string
  testnet: boolean
  explorerUrl: string
  partnerChainIDs: number[]
  tokens: TokenType[]
}

const initialState: SelectedNetworkState = {
  chainID: 17000,
  name: "Holesky",
  nativeToken: "ETH",
  testnet: true,
  logo: ethIcon,
  explorerUrl: "https://holesky.etherscan.io",
  partnerChainIDs: [177],
  tokens: [
    {
      balance: "0",
      name: "Ether",
      symbol: "ETH",
      logo: ethIcon,
      native: true,
      tokenAddress: "0x0000000000000000000000000000000000000000",
    },
    {
      abi: WETH_ABI,
      balance: "0",
      name: "Wrapped ETH",
      symbol: "WETH",
      logo: wethIcon,
      native: false,
      tokenAddress: "0x94373a4919b3240d86ea41593d5eba789fef3848",
    },
    {
      abi: stETH_ABI,
      balance: "0",
      name: "Lido Staked Ether",
      symbol: "stETH",
      logo: stETHIcon,
      native: false,
      tokenAddress: "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
    },
  ],
}

const selectedSourceNetworkSlice = createSlice({
  name: "selectedSourceNetwork",
  initialState,
  reducers: {
    setSelectedSourceNetwork(
      state,
      action: PayloadAction<SelectedNetworkState>
    ) {
      return action.payload
    },
    setTokenBalance(
      state,
      action: PayloadAction<{ index: number; balance: string }>
    ) {
      const { index, balance } = action.payload
      if (index >= 0 && index < state.tokens.length) {
        state.tokens[index].balance = balance
      } else {
        console.error("Index out of bounds:", index)
      }
    },
  },
})

export const { setSelectedSourceNetwork, setTokenBalance } =
  selectedSourceNetworkSlice.actions
export default selectedSourceNetworkSlice.reducer
