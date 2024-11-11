import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface initialStateType {
  isTransferring: boolean
}

const initialState: initialStateType = {
  isTransferring: false,
}

const transferSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {
    setTransferring: (state, action: PayloadAction<boolean>) => {
      state.isTransferring = action.payload
    },
  },
})

export const { setTransferring } = transferSlice.actions
export default transferSlice.reducer
