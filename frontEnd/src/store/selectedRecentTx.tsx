import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface initialStateType {
  tx: {
    hash: string
    description: string
  }
}
const initialState: initialStateType = {
  tx: {
    hash: "0x",
    description: "...",
  },
}

const RecentTransactionSlice = createSlice({
  name: "RecentTx",
  initialState: initialState,
  reducers: {
    setTx: (state, action: PayloadAction<initialStateType>) => {
      return action.payload
    },
  },
})

export const { setTx } = RecentTransactionSlice.actions

export default RecentTransactionSlice.reducer
