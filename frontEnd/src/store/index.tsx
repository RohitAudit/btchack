"use client"
import { configureStore, combineReducers, createAction } from "@reduxjs/toolkit"
import balanceReducer from "./balanceslice"
import selectedTokenReducer from "./selectedTokenslice"
import selectedSourceNetworkReducer from "./selectednetworkslice"
import selectedSecondNetworkReducer from "./selectednetworksecondslice"
import transferSlice from "./transferSlice"
import inputReducer from "./inputSlice"
import selectedChain from "./selectedChainSlice"
import ethIcon from "/public/Icons/ethIcon.svg"
import moveIcon from "/public/Icons/movement.svg"
import wethIcon from "/public/Icons/tokens/weth.png"
import stETHIcon from "/public/Icons/tokens/steth.png"

import WETH_ABI from "@/util/Contract/Abi/Holesky/WETH.json"
import stETH_ABI from "@/util/Contract/Abi/Holesky/stETH.json"

const initialBalanceState = {
  nETH_Rate: "0.0",
  nETH_Balance: "0.0",
}
const initialChain = {
  name: "movement",
  icon: moveIcon,
  destinationID: 40161,
  wallet: true,
  chainID: 177,
}
const initialTransferState = {
  isTransferring: false,
}

const initialSelectedTokenState = {
  balance: "0",
  name: "Ether",
  symbol: "ETH",
  logo: ethIcon,
  native: true,
  tokenAddress: "0x0000000000000000000000000000000000000000",
}

const initialSelectedNetworkState = {
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

const initialSelectedSecondNetworkState = {
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

const initialInputState = {
  value: 0.0,
  address: "0x",
}

export const resetStore = createAction("reset/RESET_STORE")

const combinedReducer = combineReducers({
  balance: balanceReducer,
  selectedToken: selectedTokenReducer,
  selectedNetwork: selectedSourceNetworkReducer,
  selectedSecondNetwork: selectedSecondNetworkReducer,
  selectedInput: inputReducer,
  selectedTransfer: transferSlice,
  selectedChain: selectedChain,
})

const rootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: any
) => {
  if (action.type === resetStore.type) {
    return {
      balance: initialBalanceState,
      selectedToken: initialSelectedTokenState,
      selectedNetwork: initialSelectedNetworkState,
      selectedSecondNetwork: initialSelectedSecondNetworkState,
      selectedInput: initialInputState,
      selectedTransfer: initialTransferState,
      selectedChain: initialChain,
    }
  }
  return combinedReducer(state, action)
}

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
export const store = makeStore()
export default store
