import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import movementIcon from "/public/Icons/movement.svg"
import { StaticImageData } from "next/image"
interface SelectedChainState {
  name: string
  icon: StaticImageData
  destinationID: number
  wallet: boolean
  chainID: number
}

const initialState: SelectedChainState = {
  name: "movement",
  icon: movementIcon,
  destinationID: 40161,
  wallet: true,
  chainID: 177,
}

const selectedChainSlice = createSlice({
  name: "selectedChain",
  initialState,
  reducers: {
    setSelectedChain(state, action: PayloadAction<SelectedChainState>) {
      return action.payload
    },
  },
})

export const { setSelectedChain } = selectedChainSlice.actions
export default selectedChainSlice.reducer
