import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface BalanceState {
  nETH_Balance: string
  nETH_Rate: string
}

const initialState: BalanceState = {
  nETH_Rate: "0.0",
  nETH_Balance: "0.0",
}

const balanceSlice = createSlice({
  name: "balance",
  initialState,
  reducers: {
    set_nETH_Balance: (state, action: PayloadAction<string>) => {
      state.nETH_Balance = action.payload
    },
    set_nETH_Rate: (state, action: PayloadAction<string>) => {
      state.nETH_Rate = action.payload
    },
  },
})

export const { set_nETH_Rate, set_nETH_Balance } = balanceSlice.actions
export default balanceSlice.reducer
