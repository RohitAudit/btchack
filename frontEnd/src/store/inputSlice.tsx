import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface InputState {
  value: number
  address: string
}

const initialState: InputState = {
  value: 0.0,
  address: "0x",
}

const inputSlice = createSlice({
  name: "input",
  initialState,
  reducers: {
    setInputTXValue: (state, action: PayloadAction<number>) => {
      state.value = action.payload
    },

    setInputAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload
    },
  },
})

export const { setInputTXValue, setInputAddress } = inputSlice.actions
export default inputSlice.reducer
