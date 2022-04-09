import { createSlice } from "@reduxjs/toolkit";

export const patternSlice = createSlice({
  name: "pattern",
  initialState: [],
  reducers: {
    toggleCell: (state, action) => {
      const filteredCells = state.filter((i) => i !== action.payload);

      if (state.length === filteredCells.length) state.push(action.payload);
      else return filteredCells;
    },
    setPattern: (_, action) => action.payload,
  },
});

export const { setPattern, toggleCell } = patternSlice.actions;

export default patternSlice.reducer;
