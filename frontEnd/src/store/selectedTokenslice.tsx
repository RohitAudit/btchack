import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { StaticImageData } from "next/image"
import ethIcon from "/public/Icons/ethIcon.svg"
interface SelectedTokenState {
  balance: string
  name: string
  symbol: string
  logo: StaticImageData
  native: boolean
  tokenAddress?: string
}

const initialState: SelectedTokenState = {
  balance: "0",
  name: "Ether",
  symbol: "ETH",
  logo: ethIcon,
  native: true,
  tokenAddress: "0x0000000000000000000000000000000000000000",
}

const selectedTokenSlice = createSlice({
  name: "selectedToken",
  initialState,
  reducers: {
    setSelectedToken(state, action: PayloadAction<SelectedTokenState>) {
      return action.payload
    },

    setSelectedTokenBalance(state, action: PayloadAction<string>) {
      state.balance = action.payload
    },
  },
})

export const { setSelectedToken, setSelectedTokenBalance } =
  selectedTokenSlice.actions
export default selectedTokenSlice.reducer
