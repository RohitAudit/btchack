import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { StaticImageData } from "next/image"
import { TokenType } from "../types"
import WETH_ABI from "@/util/Contract/Abi/Holesky/WETH.json"
import moveIcon from "/public/Icons/movement.svg"

interface SelectedNetworkSecondState {
  chainID: number
  name: string
  nativeToken: string
  testnet: boolean
  logo: StaticImageData
  explorerUrl: string
  partnerChainIDs: number[]
  tokens: TokenType[]
}

const initialState: SelectedNetworkSecondState = {
  nativeToken: "MOVE",
  chainID: 177,
  testnet: true,
  name: "Porto Movement",
  explorerUrl: "https://explorer.testnet.porto.movementnetwork.xyz/",
  partnerChainIDs: [17000],
  logo: moveIcon,
  tokens: [
    {
      abi: WETH_ABI,
      balance: "0",
      name: "nEth",
      symbol: "nETH",
      logo: moveIcon,
      native: false,
      tokenAddress: "0x5afb8923b44682E829c6643410591A5886931437",
    },
  ],
}

const selectedSecondNetworkSlice = createSlice({
  name: "selectedSecondNetwork",
  initialState,
  reducers: {
    setSelectedSecondNetwork(
      state,
      action: PayloadAction<SelectedNetworkSecondState>
    ) {
      return action.payload
    },
    setSecondNetworkTokenBalance(
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

export const { setSelectedSecondNetwork, setSecondNetworkTokenBalance } =
  selectedSecondNetworkSlice.actions
export default selectedSecondNetworkSlice.reducer
