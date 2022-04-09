import { createSlice } from "@reduxjs/toolkit";

export const gameControlsSlice = createSlice({
  name: "controls",
  initialState: {
    stepRange: { min: 1, max: 50 },
    step: 25,
    oldStep: 25,
    speedRange: { min: 10, max: 500 },
    speed: 50,
    speedSteps: 10,
    isRunning: false,
  },
  reducers: {
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
    setStep: (state, action) => {
      state.oldStep = state.step;
      state.step = action.payload;
    },
    setRunningState: (state, action) => {
      state.isRunning = action.payload;
    },
  },
});

export const { setStep, setRunningState, setSpeed } = gameControlsSlice.actions;

export default gameControlsSlice.reducer;
